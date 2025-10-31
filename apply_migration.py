"""
Apply database migration
"""
import sqlite3
import os

# Database path
db_path = 'glideml.db'
migration_path = os.path.join('migrations', 'add_versioning.sql')

# Read migration SQL
with open(migration_path, 'r') as f:
    migration_sql = f.read()

# Apply migration
print(f"Applying migration to {db_path}...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Execute migration (handle multiple statements)
    cursor.executescript(migration_sql)
    conn.commit()
    print("✓ Migration applied successfully!")
    
    # Verify tables created
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    print(f"\nCurrent tables ({len(tables)}):")
    for table in tables:
        print(f"  - {table[0]}")
        
except Exception as e:
    print(f"✗ Migration failed: {e}")
    conn.rollback()
finally:
    conn.close()
