# shared/db.py
"""
Database connection management using simple settings.
"""
from contextlib import contextmanager
import pymysql
from typing import Generator
from .settings import DATABASE_CONFIG


def _get_connection_config() -> dict:
    """
    Get database connection configuration from settings.
    
    Returns:
        dict: PyMySQL connection parameters
    """
    config = {
        "host": DATABASE_CONFIG.host,
        "port": DATABASE_CONFIG.port,
        "user": DATABASE_CONFIG.user,
        "password": DATABASE_CONFIG.password.get_secret_value(),
        "database": DATABASE_CONFIG.name,
        "charset": DATABASE_CONFIG.charset,
        "cursorclass": pymysql.cursors.DictCursor,
        "autocommit": False,
        "connect_timeout": DATABASE_CONFIG.connection_timeout,
        # Force UTF8MB4 for proper Vietnamese character support
        "init_command": "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        "use_unicode": True,
        # Additional MySQL-specific settings for production
        "sql_mode": "STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO",
    }
    
    return config


@contextmanager
def get_conn() -> Generator[pymysql.Connection, None, None]:
    """
    Database connection context manager.
    
    Automatically handles:
    - Connection creation
    - Transaction commit on success
    - Transaction rollback on exception
    - Connection cleanup
    
    Usage:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM products")
                results = cur.fetchall()
    
    Yields:
        pymysql.Connection: Database connection
        
    Raises:
        pymysql.Error: Database connection or query errors
    """
    conn = None
    try:
        # Create connection with settings
        conn = pymysql.connect(**_get_connection_config())
        # Database connection established
        
        # Yield connection for use
        yield conn
        
        # Commit transaction on success
        conn.commit()
        # Transaction committed
        
    except pymysql.Error as e:
        # Log database errors
        print(f"Database error: {e}")
        if conn:
            try:
                conn.rollback()
                # Transaction rolled back
            except Exception as rollback_error:
                print(f"Rollback failed: {rollback_error}")
        raise
        
    except Exception as e:
        # Log unexpected errors
        print(f"Unexpected error in database connection: {e}")
        if conn:
            try:
                conn.rollback()
                # Transaction rolled back due to unexpected error
            except Exception as rollback_error:
                print(f"Rollback failed: {rollback_error}")
        raise
        
    finally:
        # Always close connection
        if conn:
            try:
                conn.close()
                # Database connection closed
            except Exception as close_error:
                print(f"Error closing connection: {close_error}")


def test_connection() -> bool:
    """
    Test database connectivity.
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 AS test")
                result = cur.fetchone()
                if result and result.get("test") == 1:
                    return True
                else:
                    return False
    except Exception as e:
        print(f"Database connection test failed: {e}")
        return False


def get_database_info() -> dict:
    """
    Get database server information.
    
    Returns:
        dict: Database server info including version, charset, etc.
    """
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                # Get MySQL version
                cur.execute("SELECT VERSION() AS version")
                version_result = cur.fetchone()
                
                # Get character set
                cur.execute("SELECT @@character_set_database AS charset, @@collation_database AS collation")
                charset_result = cur.fetchone()
                
                # Get timezone
                cur.execute("SELECT @@time_zone AS timezone, NOW() AS current_time")
                time_result = cur.fetchone()
                
                return {
                    "version": version_result.get("version") if version_result else "Unknown",
                    "charset": charset_result.get("charset") if charset_result else "Unknown",
                    "collation": charset_result.get("collation") if charset_result else "Unknown", 
                    "timezone": time_result.get("timezone") if time_result else "Unknown",
                    "current_time": time_result.get("current_time") if time_result else "Unknown",
                    "host": DATABASE_CONFIG.host,
                    "port": DATABASE_CONFIG.port,
                    "database": DATABASE_CONFIG.name
                }
    except Exception as e:
        print(f"Failed to get database info: {e}")
        return {"error": str(e)}
