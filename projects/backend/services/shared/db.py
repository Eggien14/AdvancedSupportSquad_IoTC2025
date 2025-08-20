# shared/db.py
from contextlib import contextmanager
import os
import pymysql

def _cfg() -> dict:
    return {
        "host": os.getenv("DB_HOST", "db"),     # tên service MySQL trong compose
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "eggien"),
        "password": os.getenv("DB_PASSWORD", "0363802865"),
        "database": os.getenv("DB_NAME", "iotc25_advanced_support_squad"),
        "cursorclass": pymysql.cursors.DictCursor,
        "autocommit": False,
        "charset": "utf8mb4",
    }

@contextmanager
def get_conn():
    """with get_conn() as conn: ...  -> tự commit/rollback/close."""
    conn = pymysql.connect(**_cfg())
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
