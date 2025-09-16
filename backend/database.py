from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017/mydatabase")
client = MongoClient(MONGO_URI)
db = client.get_database()
investments_collection = db.investments
