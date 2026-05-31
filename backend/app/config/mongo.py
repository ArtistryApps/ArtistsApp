"""MongoDB connection — lazy singleton."""
from pymongo import MongoClient
from pymongo.database import Database

_client: MongoClient = None


def get_mongo_db() -> Database:
    global _client
    if _client is None:
        from .settings import settings
        _client = MongoClient(settings.MONGODB_URI)
    from .settings import settings
    return _client[settings.MONGODB_DB_NAME]
