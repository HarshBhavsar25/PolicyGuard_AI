import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "database.db")

def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Policies Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS policies (
        id TEXT PRIMARY KEY,
        name TEXT,
        upload_date TEXT,
        rules_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Processing'
    )
    """)
    
    # Rules Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rules (
        id TEXT PRIMARY KEY,
        policy_id TEXT,
        logic TEXT,
        status TEXT DEFAULT 'Active',
        FOREIGN KEY(policy_id) REFERENCES policies(id)
    )
    """)
    
    # Datasets Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        name TEXT,
        row_count INTEGER DEFAULT 0,
        upload_date TEXT,
        status TEXT DEFAULT 'Pending',
        schema_json TEXT
    )
    """)
    
    # Violations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS violations (
        id TEXT PRIMARY KEY,
        dataset_id TEXT,
        rule_id TEXT,
        record_id TEXT,
        risk_score INTEGER,
        reason TEXT,
        explanation TEXT,
        raw_data TEXT,
        status TEXT DEFAULT 'Pending',
        FOREIGN KEY(dataset_id) REFERENCES datasets(id),
        FOREIGN KEY(rule_id) REFERENCES rules(id)
    )
    """)
    
    conn.commit()
    conn.close()

# Initialize on module load
init_db()

# --- CRUD Helpers ---

def insert_policy(policy_id, name):
    conn = get_db()
    conn.execute("INSERT INTO policies (id, name, upload_date) VALUES (?, ?, ?)", 
                 (policy_id, name, datetime.now().strftime("%Y-%m-%d")))
    conn.commit()
    conn.close()

def update_policy_status(policy_id, count, status):
    conn = get_db()
    conn.execute("UPDATE policies SET rules_count = ?, status = ? WHERE id = ?", (count, status, policy_id))
    conn.commit()
    conn.close()

def get_policies():
    conn = get_db()
    rows = conn.execute("SELECT * FROM policies ORDER BY upload_date DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_policy(policy_id):
    conn = get_db()
    # Delete violations associated with this policy's rules
    conn.execute("DELETE FROM violations WHERE rule_id IN (SELECT id FROM rules WHERE policy_id = ?)", (policy_id,))
    # Delete the rules
    conn.execute("DELETE FROM rules WHERE policy_id = ?", (policy_id,))
    # Delete the policy
    conn.execute("DELETE FROM policies WHERE id = ?", (policy_id,))
    conn.commit()
    conn.close()

def insert_rule(rule_id, policy_id, logic):
    conn = get_db()
    conn.execute("INSERT INTO rules (id, policy_id, logic) VALUES (?, ?, ?)", (rule_id, policy_id, logic))
    conn.commit()
    conn.close()

def get_rules():
    conn = get_db()
    rows = conn.execute("""
        SELECT r.id, r.logic, r.status, p.name as policy 
        FROM rules r 
        JOIN policies p ON r.policy_id = p.id
    """).fetchall()
    conn.close()
    return [dict(row) for row in rows]

def toggle_rule_status(rule_id, new_status):
    conn = get_db()
    conn.execute("UPDATE rules SET status = ? WHERE id = ?", (new_status, rule_id))
    conn.commit()
    conn.close()

def insert_dataset(ds_id, name, row_count, schema_json):
    conn = get_db()
    conn.execute("INSERT INTO datasets (id, name, row_count, upload_date, schema_json) VALUES (?, ?, ?, ?, ?)",
                 (ds_id, name, row_count, datetime.now().strftime("%Y-%m-%d"), json.dumps(schema_json)))
    conn.commit()
    conn.close()

def update_dataset_status(ds_id, status):
    conn = get_db()
    conn.execute("UPDATE datasets SET status = ? WHERE id = ?", (status, ds_id))
    conn.commit()
    conn.close()

def get_datasets():
    conn = get_db()
    rows = conn.execute("SELECT * FROM datasets ORDER BY upload_date DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_dataset(ds_id):
    conn = get_db()
    # Delete violations linked to this dataset
    conn.execute("DELETE FROM violations WHERE dataset_id = ?", (ds_id,))
    # Delete the dataset
    conn.execute("DELETE FROM datasets WHERE id = ?", (ds_id,))
    conn.commit()
    conn.close()

def insert_violation(viol_id, ds_id, rule_logic, record_id, risk_score, reason, explanation, raw_data):
    conn = get_db()
    conn.execute("""
        INSERT INTO violations (id, dataset_id, rule_id, record_id, risk_score, reason, explanation, raw_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (viol_id, ds_id, rule_logic, record_id, risk_score, reason, explanation, json.dumps(raw_data)))
    conn.commit()
    conn.close()

def get_violations():
    conn = get_db()
    rows = conn.execute("""
        SELECT v.*, d.name as dataset_name 
        FROM violations v
        JOIN datasets d ON v.dataset_id = d.id
        ORDER BY v.risk_score DESC
    """).fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_violation_status(viol_id, status):
    conn = get_db()
    conn.execute("UPDATE violations SET status = ? WHERE id = ?", (status, viol_id))
    conn.commit()
    conn.close()

def get_violation(viol_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM violations WHERE id = ?", (viol_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def update_violation_explanation(viol_id, explanation):
    conn = get_db()
    conn.execute("UPDATE violations SET explanation = ? WHERE id = ?", (explanation, viol_id))
    conn.commit()
    conn.close()
