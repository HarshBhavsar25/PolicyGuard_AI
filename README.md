**AI-Powered Policy Compliance & Data Validation Engine**

PolicyGuard AI is an intelligent compliance system that transforms **natural-language policy documents into executable validation rules** and automatically checks operational datasets against them.

Instead of manually auditing thousands of rows of data against dense policy PDFs, PolicyGuard AI uses **AI + high-performance analytics** to detect violations instantly and explain them in plain English.

🌐 **Live Demo:**  
https://policy-guard-ai-pi.vercel.app


Output- 

📦 **Repository:**  
https://github.com/HarshBhavsar25/PolicyGuard_AI
---

# 🚀 Problem

Organizations operate under hundreds of policy documents:

- Financial compliance policies
- HR guidelines
- Security protocols
- Operational regulations

These policies exist as **natural language documents (PDFs)**, while actual behavior exists in **large datasets** such as:

- transaction logs  
- employee records  
- expense reports  
- operational datasets  

Connecting the two requires **manual auditing**, which is:

❌ Slow  
❌ Expensive  
❌ Error-prone  

Missing violations can lead to:

- Regulatory fines
- Security breaches
- Financial loss


---

# 💡 Solution

**PolicyGuard AI converts policy documents into automated compliance systems.**

The platform:

1. Uses AI to read policy documents  
2. Extracts structured logical rules  
3. Converts them into executable validation logic  
4. Runs datasets against those rules  
5. Detects violations instantly  
6. Explains *why the violation occurred*


---

# 🧠 Key Features

### 📄 Intelligent Policy Ingestion
Upload policy documents in **PDF format**.  
The system extracts text automatically for AI analysis.

---

### 🤖 AI Policy Rule Extraction

Using **LLaMA 3.1**, the system converts natural-language policies into machine-readable rules.

Example:

Policy text:

> Employees from the Sales department may submit expenses up to $500.

Extracted rule:


IF Department == "Sales"
THEN Expense <= 500


---

### ⚙️ Automated Dataset Validation

Upload **CSV datasets** and the system checks them against extracted rules.

Validation is executed using **DuckDB**, enabling high-speed analytics across thousands of records.

---

### 📊 Dynamic Compliance Dashboard

Interactive analytics including:

- Compliance health score
- Violation distribution
- Policy failure categories
- Dataset risk insights

---

### 🧾 Explainable AI

Instead of simply returning **FAILED**, PolicyGuard AI explains violations.

Example:

> This transaction violates the Sales expense policy because the recorded amount was $720, which exceeds the allowed limit of $500.

This ensures **transparent and explainable AI decisions**.

---

### 📤 Audit-Ready Reports

Violating records can be exported as **CSV reports** for compliance auditing.

---

# 🏗️ Tech Stack

## Frontend

**Next.js (React 19) + TypeScript**

- Modern App Router architecture
- High performance rendering
- Structured UI development

**Tailwind CSS**

- Utility-first styling
- Rapid UI development

**Shadcn UI + Radix UI**

- Accessible and enterprise-grade components

**Recharts**

Used for building the **Compliance Dashboard** with interactive data visualizations.

---

## Backend

**FastAPI (Python)**

- High-performance asynchronous APIs
- Seamless integration with AI services

**DuckDB**

- In-process analytical SQL database
- Extremely fast dataset validation

**Pandas**

- Data cleaning and preprocessing

**PyPDF2**

- Extracts text from uploaded policy PDFs

---

# 🤖 Artificial Intelligence

PolicyGuard AI uses **LLaMA 3.1 (8B Instruct)** via **OpenRouter API**.

Model used:


meta-llama/llama-3.1-8b-instruct


AI powers two core capabilities:

### Policy Rule Extraction
Transforms complex policy text into structured logical rules.

### Explainable AI Reasoning
Generates human-readable explanations for violations.


---

# ⚙️ Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/HarshBhavsar25/PolicyGuard_AI.git
cd PolicyGuard_AI
2️⃣ Backend Setup
cd backend

pip install -r requirements.txt

uvicorn main:app --reload

Backend runs on:

http://localhost:8000
3️⃣ Frontend Setup
cd frontend

npm install

npm run dev

Frontend runs on:

http://localhost:3000
🔑 Environment Variables

Create a .env file in the backend directory:

OPENROUTER_API_KEY=your_api_key
📊 Example Workflow

1️⃣ Upload a policy PDF

2️⃣ AI extracts policy rules

3️⃣ Upload a dataset CSV

4️⃣ Rule engine validates records

5️⃣ Dashboard displays violations

6️⃣ Click Explain to view AI reasoning

🏆 Hackathon Value

PolicyGuard AI combines:

Generative AI
→ Understands policy documents

Deterministic Computing
→ Executes high-speed validation

Explainable AI
→ Provides transparent reasoning

Most AI systems only generate text.

PolicyGuard AI automates real compliance workflows.

👨‍💻 Author

Harsh Bhavsar

AI Systems • Backend Engineering • Data Systems
