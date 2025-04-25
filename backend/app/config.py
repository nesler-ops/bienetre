import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "bienetre"

# Connexion à MongoDB
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db["users"]  # Collection des utilisateurs
patients_collection = db["patients"]  # Collection des patients
appointments_collection = db["appointments"]  # Collection des rendez-vous
