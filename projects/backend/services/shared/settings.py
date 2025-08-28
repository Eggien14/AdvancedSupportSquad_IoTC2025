# services/shared/settings.py
"""
Simple settings for IoTC25 Advanced Support Squad.
"""
import os
from pydantic_settings import BaseSettings


class DatabaseConfig:
    """Simple database configuration."""
    def __init__(self):
        self.host = os.getenv("DB_HOST", "localhost")
        self.port = int(os.getenv("DB_PORT", "3306"))
        self.user = os.getenv("DB_USER", "root")
        self.name = os.getenv("DB_NAME", "iotc25_advanced_support_squad")
        self.charset = "utf8mb4"
        self.connection_timeout = 30
    
    @property
    def password(self):
        """Return password with get_secret_value() method for compatibility."""
        class PasswordWrapper:
            def __init__(self, value):
                self.value = value
            def get_secret_value(self):
                return self.value
        return PasswordWrapper(os.getenv("DB_PASSWORD", ""))


class Settings(BaseSettings):
    """Simple application settings."""
    
    # Database
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = int(os.getenv("DB_PORT", "3306"))
    db_user: str = os.getenv("DB_USER", "root")
    db_password: str = os.getenv("DB_PASSWORD", "")
    db_name: str = os.getenv("DB_NAME", "iotc25_advanced_support_squad")
    
    # API
    api_port: int = int(os.getenv("API_PORT", "8136"))
    
    # Cache
    cache_enabled: bool = os.getenv("CACHE_ENABLED", "false").lower() == "true"


# Global instances
DATABASE_CONFIG = DatabaseConfig()
_settings = None

def get_settings() -> Settings:
    """Get global settings instance."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings