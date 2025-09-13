from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017/meubanco")
client = MongoClient(MONGO_URI)
db = client.get_database()  # banco padrão definido na URI
investimentos_collection = db.investimentos
