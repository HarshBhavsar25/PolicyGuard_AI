import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

if api_key:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )
else:
    print("Warning: OPENROUTER_API_KEY not found in environment variables.")
    client = None

def extract_rules_from_text(policy_text: str) -> list:
    """
    Analyzes policy text and returns a list of dictionaries with extracted rules.
    Expected output JSON schema:
    [
      {
        "rule": "Logical rule referencing dataset columns (e.g., amount > 10000)",
        "action": "flag",
        "policy_reference": "Section or paragraph it came from"
      }
    ]
    """
    if not client:
        print("OpenAI client not initialized.")
        return []
        
    prompt = f"""
    You are a compliance rule extraction engine.
    Analyze the following policy document and extract all enforceable rules.
    Convert these rules into purely logical expressions that could be evaluated in SQL or pandas.
    Assume standard column names like 'amount', 'status', 'days_since_open', 'balance', etc. 
    Use your best judgment for column names if not explicitly stated, but keep them snake_case.

    Output ONLY a valid JSON array of objects, with no markdown formatting or code blocks.
    Each object must have these exactly keys: "rule", "action", "policy_reference".
    
    Policy Text:
    {policy_text}
    """
    
    try:
        response = client.chat.completions.create(
            model="meta-llama/llama-3.1-8b-instruct",
            messages=[
                {"role": "system", "content": "You are a helpful data compliance AI."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Strip potential markdown code block indicators
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        response_text = response_text.strip()
        
        # Safely find the JSON array if there's conversational text around it
        start_idx = response_text.find('[')
        end_idx = response_text.rfind(']')
        if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
            response_text = response_text[start_idx:end_idx+1]
            
        rules = json.loads(response_text)
        return rules
    except Exception as e:
        print(f"Error extracting rules from OpenAI: {e}")
        if 'response_text' in locals():
            print(f"Failed string: {response_text}")
        return []

def generate_explanation(transaction: dict, rule: str, risk_score: int) -> str:
    """
    Generates a human-readable explanation of why a record violated a rule.
    """
    if not client:
        return "Could not generate reasoning due to missing API key."
        
    prompt = f"""
    You are a compliance officer explaining a policy violation clearly to an analyst.
    
    Record details: {json.dumps(transaction)}
    Violated Rule Logic: {rule}
    Risk Score assigned: {risk_score}/100
    
    Provide a concise, human-readable 2-3 sentence explanation of exactly what happened, 
    why it violated the rule, and why the risk score is what it is.
    Do not use introductory phrases like "Here is the explanation". Just the explanation itself.
    """
    try:
        response = client.chat.completions.create(
            model="meta-llama/llama-3.1-8b-instruct",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating explanation: {e}")
        return "Could not generate reasoning due to an AI service error."
