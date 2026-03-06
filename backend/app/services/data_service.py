import pandas as pd
import duckdb
import os
import random

def analyze_dataset_schema(file_path: str) -> dict:
    """Read a CSV and return column names and their inferred data types."""
    try:
        df = pd.read_csv(file_path, nrows=100)
        schema = {col: str(dtype) for col, dtype in df.dtypes.items()}
        return {
            "columns": list(df.columns),
            "schema": schema,
            "row_count_estimate": sum(1 for _ in open(file_path)) - 1
        }
    except Exception as e:
        print(f"Error analyzing dataset: {e}")
        raise e

def run_rule_engine(dataset_path: str, rules: list) -> list:
    """
    Executes rules against the dataset using DuckDB.
    Returns a list of violating rows.
    """
    violations = []
    
    # Connect to in-memory DuckDB
    con = duckdb.connect(database=':memory:')
    
    # Register the dataset as a view 'data'
    con.execute(f"CREATE VIEW data AS SELECT * FROM read_csv_auto('{dataset_path}')")
    
    for idx, rule_obj in enumerate(rules):
        rule_logic = rule_obj.get("rule", "")
        if not rule_logic:
            continue
            
        try:
            # Query the violating rows
            query = f"SELECT * FROM data WHERE {rule_logic} LIMIT 100"
            result_df = con.execute(query).df()
            
            for _, row in result_df.iterrows():
                # Randomly assign a risk score between 50 and 99 for demonstration
                risk_score = random.randint(50, 99)
                violations.append({
                    "record_id": f"REC-{random.randint(1000, 9999)}",
                    "dataset": os.path.basename(dataset_path),
                    "rule": f"Rule {idx+1}",
                    "rule_logic": rule_logic,
                    "risk_score": risk_score,
                    "record_data": row.to_dict()
                })
        except Exception as e:
            print(f"Error executing rule '{rule_logic}': {e}")
            
    con.close()
    return violations
