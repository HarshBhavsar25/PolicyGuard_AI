from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
import os
import uuid
import shutil
from typing import List

from ..services.pdf_service import extract_text_from_pdf
from ..services.gemini_service import extract_rules_from_text, generate_explanation
from ..services.data_service import analyze_dataset_schema, run_rule_engine
from .. import db

router = APIRouter()

# Directories for uploads
UPLOAD_DIR = os.path.join(os.getcwd(), "data")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class PolicyUploadResponse(BaseModel):
    policy_id: str
    filename: str
    extracted_rules: list

class DatasetUploadResponse(BaseModel):
    dataset_id: str
    filename: str
    schema_info: dict

class RunEngineRequest(BaseModel):
    dataset_id: str
    rules: List[dict]

@router.post("/policies/upload", response_model=PolicyUploadResponse)
async def upload_policy(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    policy_id = f"POL-{uuid.uuid4().hex[:6].upper()}"
    file_path = os.path.join(UPLOAD_DIR, f"{policy_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Extract text and rules
    text = extract_text_from_pdf(file_path)
    if not text:
        raise HTTPException(status_code=500, detail="Could not extract text from the PDF.")
        
    policy_name = file.filename
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        policy_name = lines[0][:100] # Use first line as policy name (cap length)

    db.insert_policy(policy_id, policy_name)
    
    rules = extract_rules_from_text(text)
    
    for rule in rules:
        rule_id = f"RUL-{uuid.uuid4().hex[:6].upper()}"
        logic = rule.get("rule", "")
        if logic:
            db.insert_rule(rule_id, policy_id, logic)
            
    db.update_policy_status(policy_id, len(rules), "Active")
    
    return PolicyUploadResponse(
        policy_id=policy_id,
        filename=file.filename,
        extracted_rules=rules
    )

@router.get("/debug-ai")
async def debug_ai():
    import app.services.gemini_service as gs
    import os
    return {
        "client_is_none": gs.client is None,
        "env_key_exists": "OPENROUTER_API_KEY" in os.environ,
        "env_key_value": os.getenv("OPENROUTER_API_KEY", "NOT_FOUND")[:10] + "..." if os.getenv("OPENROUTER_API_KEY") else "None"
    }

@router.get("/policies")
async def get_policies():
    return db.get_policies()

@router.delete("/policies/{policy_id}")
async def delete_policy(policy_id: str):
    db.delete_policy(policy_id)
    return {"status": "success", "message": "Policy and associated rules deleted"}

@router.get("/rules")
async def get_rules():
    return db.get_rules()

class RuleStatusUpdate(BaseModel):
    status: str

@router.put("/rules/{rule_id}/status")
async def update_rule(rule_id: str, payload: RuleStatusUpdate):
    db.toggle_rule_status(rule_id, payload.status)
    return {"status": "success"}

@router.post("/datasets/upload", response_model=DatasetUploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
    dataset_id = f"DS-{uuid.uuid4().hex[:6].upper()}"
    file_path = os.path.join(UPLOAD_DIR, f"{dataset_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    schema_info = analyze_dataset_schema(file_path)
    
    db.insert_dataset(dataset_id, file.filename, schema_info.get("row_count_estimate", 0), schema_info)
    db.update_dataset_status(dataset_id, "Analyzed")
    
    return DatasetUploadResponse(
        dataset_id=dataset_id,
        filename=file.filename,
        schema_info=schema_info
    )

@router.get("/datasets")
async def get_datasets():
    return db.get_datasets()

@router.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str):
    db.delete_dataset(dataset_id)
    return {"status": "success", "message": "Dataset and associated violations deleted"}

@router.post("/engine/run")
async def run_engine(request: RunEngineRequest):
    # Find dataset file
    dataset_files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(request.dataset_id)]
    if not dataset_files:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    dataset_path = os.path.join(UPLOAD_DIR, dataset_files[0])
    
    # Run the duckdb rule engine
    raw_violations = run_rule_engine(dataset_path, request.rules)
    
    # Generate explanations for violations and save to DB
    explained_violations = []
    
    for idx, v in enumerate(raw_violations):
        viol_id = f"VIO-{uuid.uuid4().hex[:6].upper()}"
        explanation = "Pending background generation..."
            
        v["explanation"] = explanation
        
        db.insert_violation(
            viol_id, 
            request.dataset_id, 
            v["rule_logic"], 
            v["record_id"], 
            v["risk_score"], 
            "Rule logic matched record", 
            explanation,
            v["record_data"]
        )
        
        # Remove raw data to avoid huge payloads
        del v["record_data"]
        explained_violations.append(v)
        
    return {
        "status": "completed",
        "violations_found": len(raw_violations),
        "results": explained_violations
    }

@router.get("/violations")
async def get_violations():
    return db.get_violations()

class ViolStatusUpdate(BaseModel):
    status: str

@router.put("/violations/{viol_id}/status")
async def update_viol(viol_id: str, payload: ViolStatusUpdate):
    db.update_violation_status(viol_id, payload.status)
    return {"status": "success"}

@router.post("/violations/{viol_id}/explain")
async def explain_violation(viol_id: str):
    violation = db.get_violation(viol_id)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found.")
    
    # Check if already generated
    if violation.get("explanation") and violation.get("explanation") != "Pending background generation...":
        return {"explanation": violation.get("explanation")}

    try:
        raw_data = json.loads(violation.get("raw_data", "{}")) 
    except:
        raw_data = {"raw_string": violation.get("raw_data", "")}

    explanation = generate_explanation(
        raw_data, 
        str(violation.get("rule_id", "Unknown logic")), 
        violation.get("risk_score", 50)
    )
    
    db.update_violation_explanation(viol_id, explanation)
    return {"explanation": explanation}

@router.get("/dashboard/stats")
async def get_dashboard_stats():
    pol = db.get_policies()
    rul = db.get_rules()
    vios = db.get_violations()
    ds = db.get_datasets()
    
    import math

    total_records = sum([d["row_count"] for d in ds])
    active_rules = sum([1 for r in rul if r["status"] == "Active"])
    
    # Calculate Risk Data counts for all unresolved violations
    unresolved_vios = [v for v in vios if v.get("status", "Open") != "Resolved"]
    critical_count = sum(1 for v in unresolved_vios if v["risk_score"] and int(v["risk_score"]) >= 90)
    high_count = sum(1 for v in unresolved_vios if v["risk_score"] and 80 <= int(v["risk_score"]) < 90)
    medium_count = sum(1 for v in unresolved_vios if v["risk_score"] and 70 <= int(v["risk_score"]) < 80)
    low_count = sum(1 for v in unresolved_vios if v["risk_score"] and int(v["risk_score"]) < 70)

    # Calculate Real Compliance Score using a risk-weighted penalty
    # This provides a more meaningful score than a pure ratio considering the engine limits matched rows
    compliance_score = 100.0
    if len(vios) > 0:
        penalty = (critical_count * 0.5) + (high_count * 0.2) + (medium_count * 0.05) + (low_count * 0.01)
        compliance_score = max(0.0, 100.0 - penalty)

    risk_data = [
        {"name": "Critical", "value": critical_count, "color": "#ef4444"},
        {"name": "High", "value": high_count, "color": "#f97316"},
        {"name": "Medium", "value": medium_count, "color": "#eab308"},
        {"name": "Low", "value": low_count, "color": "#3b82f6"},
    ]

    # Filter out zeros to avoid confusing empty pie slices
    risk_data = [d for d in risk_data if d["value"] > 0]
    if not risk_data: # Default empty state
         risk_data = [{"name": "No Data", "value": 1, "color": "#3f3f46"}]

    # Policy Coverage Data
    coverage_data = []
    for policy in pol:
      coverage_data.append({
          "name": policy['name'][:10] + '...' if len(policy['name']) > 10 else policy['name'],
          "coverage": policy['rules_count'] * 10 if policy['rules_count'] < 10 else 100
      })

    awaiting_review = sum(1 for v in vios if v.get("status", "Open") != "Resolved")
    resolved_count = len(vios) - awaiting_review

    from datetime import datetime, timedelta
    today = datetime.now()
    
    # Basic trend mock dynamically ending on current day
    trend_data = []
    for i, divisor in enumerate([4, 3, 2, 1]):
        dt = today - timedelta(days=3 - i)
        day_str = dt.strftime("%b ") + str(dt.day)
        trend_data.append({
            "name": day_str, 
            "violations": len(vios) // divisor if len(vios) > 0 else 0, 
            "resolved": resolved_count // divisor if resolved_count > 0 else 0
        })
    if trend_data:
        trend_data[-1]["violations"] = len(vios)
        trend_data[-1]["resolved"] = resolved_count

    return {
        "total_records_scanned": total_records,
        "violations_detected": awaiting_review,
        "compliance_score": round(compliance_score, 1),
        "active_rules": active_rules,
        "charts": {
            "riskData": risk_data,
            "coverageData": coverage_data,
            "trendData": trend_data
        }
    }
