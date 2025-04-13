from fastapi import APIRouter, HTTPException
from app.config import db

router = APIRouter()

# Définir l'horaire standard de 9h à 18h
DEFAULT_HOURS = [f"{h:02d}:00" for h in range(9, 19)]

# Jours de semaine en français
WEEKDAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"]

@router.post("/init/{medecin_id}")
async def init_disponibilites(medecin_id: str):
    """Créer les disponibilités standard de lundi à vendredi pour un médecin"""
    existing = await db["medecins"].find_one({"user_id": medecin_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Médecin non trouvé")

    operations = [
        {
            "medecin_id": medecin_id,
            "jour": jour,
            "heures": DEFAULT_HOURS
        }
        for jour in WEEKDAYS
    ]

    await db["disponibilites"].insert_many(operations)
    return {"message": "Disponibilités créées avec succès pour la semaine."}


# ✅ Endpoint pour récupérer les heures d'un jour
@router.get("/{medecin_id}/{jour}")
async def get_disponibilites_for_day(medecin_id: str, jour: str):
    """Récupérer les heures disponibles pour un médecin et un jour donné"""
    dispo = await db["disponibilites"].find_one({"medecin_id": medecin_id, "jour": jour})
    if not dispo:
        raise HTTPException(status_code=404, detail="Disponibilités non trouvées pour ce jour")
    return {"heures": dispo["heures"]}


# ✅ Endpoint pour modifier les heures disponibles d'un jour
@router.put("/{medecin_id}/{jour}")
async def update_disponibilites_for_day(medecin_id: str, jour: str, heures: list[str]):
    """Mettre à jour les heures disponibles pour un jour donné"""
    if not set(heures).issubset(set(DEFAULT_HOURS)):
        raise HTTPException(status_code=400, detail="Heures invalides fournies")

    result = await db["disponibilites"].update_one(
        {"medecin_id": medecin_id, "jour": jour},
        {"$set": {"heures": heures}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Disponibilités non trouvées pour ce jour")

    return {"message": "Disponibilités mises à jour avec succès."}


# ✅ Fonction réutilisable pour initialiser les disponibilités lors de la création d’un médecin
async def create_default_disponibilites(medecin_id: str):
    operations = [
        {
            "medecin_id": medecin_id,
            "jour": jour,
            "heures": DEFAULT_HOURS
        }
        for jour in WEEKDAYS
    ]
    await db["disponibilites"].insert_many(operations)
