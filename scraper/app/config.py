from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    scraper_bearer_token: str
    groq_api_key: str = ""
    scraper_profile: str = "lite"  # "lite" | "full"


settings = Settings()
