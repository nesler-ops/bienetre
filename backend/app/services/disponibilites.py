from datetime import time
from app.config import db

async def create_default_disponibilites(medecin_user_id: str):
    jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    heures = [f"{h:02}:00" for h in range(9, 19)]  # De 09:00 a 18:00 incluido

    disponibilites = [
        {
            "medecin_id": medecin_user_id,
            "jour": jour,
            "heures": heures,
        }
        for jour in jours
    ]

    await db["disponibilites"].insert_many(disponibilites)

