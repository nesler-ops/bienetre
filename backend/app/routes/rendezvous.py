from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from app.config import db
from app.routes.auth import get_current_user
from typing import Optional
import logging
from app.services.notifications import (
    envoyer_notification_creation,
    envoyer_notification_modification,
    envoyer_notification_annulation,
)

router = APIRouter()
logger = logging.getLogger(__name__)

class RendezvousCreate(BaseModel):
    date: str
    heure: str
    medecin_id: str
    patient_id: str
    type: str
    motif: str
    visite_faite: str

class RendezvousUpdate(BaseModel):
    date: Optional[str] = None
    heure: Optional[str] = None
    type: Optional[str] = None
    medecin_id: Optional[str] = None
    statut: Optional[str] = None
    visite_faite: Optional[bool] = None

@router.post("/")
async def create_rendezvous(rendezvous: RendezvousCreate, current_user=Depends(get_current_user)):
    if "user_id" not in current_user:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")

    if current_user["user_type"] != "Patient":
        raise HTTPException(status_code=403, detail="Seuls les patients peuvent prendre des rendez-vous")

    if current_user["user_id"] != rendezvous.patient_id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas prendre un rendez-vous pour un autre patient")

    medecin = await db["medecins"].find_one({"user_id": ObjectId(rendezvous.medecin_id)})
    if not medecin:
        raise HTTPException(status_code=404, detail="Médecin non trouvé")

    date_obj = datetime.strptime(rendezvous.date, "%Y-%m-%d")
    jours_fr = {
        "monday": "lundi", "tuesday": "mardi", "wednesday": "mercredi",
        "thursday": "jeudi", "friday": "vendredi", "saturday": "samedi", "sunday": "dimanche"
    }
    jour = jours_fr[date_obj.strftime("%A").lower()]

    dispo = await db["disponibilites"].find_one({"medecin_id": rendezvous.medecin_id, "jour": jour})
    if not dispo or rendezvous.heure not in dispo.get("heures", []):
        raise HTTPException(
            status_code=400,
            detail=f"Le médecin n'est pas disponible le {jour} à {rendezvous.heure}"
        )

    existing = await db["rendezvous"].find_one({
        "medecin_id": rendezvous.medecin_id,
        "date": rendezvous.date,
        "heure": rendezvous.heure,
        "statut": {"$ne": "Annulé"}
    })
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Le créneau {rendezvous.heure} est déjà réservé pour le {rendezvous.date}."
        )

    new_rendezvous = {
        "date": rendezvous.date,
        "heure": rendezvous.heure,
        "medecin_id": rendezvous.medecin_id,
        "patient_id": rendezvous.patient_id,
        "type": rendezvous.type,
        "motif": rendezvous.motif,
        "statut": "En attente",
        "created_at": datetime.utcnow(),
        "visite_faite": False
    }

    result = await db["rendezvous"].insert_one(new_rendezvous)

    contact_patient = await db["contacts"].find_one({"user_id": rendezvous.patient_id})
    email_patient = contact_patient["email"] if contact_patient else None

    contact_medecin = await db["contacts"].find_one({"user_id": rendezvous.medecin_id})
    email_medecin = contact_medecin["email"] if contact_medecin else None

    nom_medecin = medecin.get("nom")

    if email_patient and nom_medecin:
        if not envoyer_notification_creation(email_patient, nom_medecin, rendezvous.date, rendezvous.heure):
            logger.error(f"❌ Échec de la notification de création au patient {email_patient}")

    if email_medecin and nom_medecin:
        if not envoyer_notification_creation(email_medecin, nom_medecin, rendezvous.date, rendezvous.heure):
            logger.error(f"❌ Échec de la notification de création au médecin {email_medecin}")

    return {"message": "Rendez-vous créé avec succès", "rendezvous_id": str(result.inserted_id)}

@router.put("/{rendezvous_id}")
async def update_rendezvous(rendezvous_id: str, updated_data: RendezvousUpdate, current_user=Depends(get_current_user)):
    if "user_id" not in current_user:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")

    rendezvous = await db["rendezvous"].find_one({"_id": ObjectId(rendezvous_id)})
    if not rendezvous:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")

    if current_user["user_id"] != rendezvous["patient_id"] and current_user["user_id"] != rendezvous["medecin_id"]:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à modifier ce rendez-vous.")

    update_fields = {k: v for k, v in updated_data.dict().items() if v is not None}

    if "medecin_id" in update_fields:
        medecin = await db["medecins"].find_one({"user_id": ObjectId(update_fields["medecin_id"])})
        if not medecin:
            raise HTTPException(status_code=404, detail="Médecin non trouvé")
    else:
        medecin = await db["medecins"].find_one({"user_id": ObjectId(rendezvous["medecin_id"])})

    await db["rendezvous"].update_one({"_id": ObjectId(rendezvous_id)}, {"$set": update_fields})
    updated_rendezvous = await db["rendezvous"].find_one({"_id": ObjectId(rendezvous_id)})
    updated_rendezvous["_id"] = str(updated_rendezvous["_id"])

    contact_patient = await db["contacts"].find_one({"user_id": rendezvous["patient_id"]})
    contact_medecin = await db["contacts"].find_one({"user_id": rendezvous["medecin_id"]})

    email_patient = contact_patient["email"] if contact_patient else None
    email_medecin = contact_medecin["email"] if contact_medecin else None
    nom_medecin = medecin.get("nom") if medecin else "Médecin"

    date_notif = updated_data.date or rendezvous["date"]
    heure_notif = updated_data.heure or rendezvous["heure"]

    if update_fields.get("statut") == "Annulé":
        if email_patient:
            envoyer_notification_annulation(email_patient, nom_medecin, date_notif, heure_notif)
        if email_medecin:
            envoyer_notification_annulation(email_medecin, nom_medecin, date_notif, heure_notif)
    else:
        if email_patient:
            envoyer_notification_modification(email_patient, nom_medecin, date_notif, heure_notif)

    return {"message": "Rendez-vous mis à jour avec succès", "rendezvous": updated_rendezvous}


@router.get("/{user_id}")
async def get_rendezvous(user_id: str, current_user=Depends(get_current_user)):
    user = await db["UserPatients"].find_one({"_id": ObjectId(user_id)}) or await db["UserMedecins"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    rendezvous_list = []
    async for rendezvous in db["rendezvous"].find({"$or": [{"patient_id": user_id}, {"medecin_id": user_id}]}):
        rendezvous["_id"] = str(rendezvous["_id"])
        rendezvous_list.append(rendezvous)

    return rendezvous_list


@router.get("/occupees/{medecin_id}/{date}")
async def get_occupees(medecin_id: str, date: str):
    heures = []
    async for rdv in db["rendezvous"].find({
        "medecin_id": medecin_id,
        "date": date,
        "statut": {"$ne": "Annulé"}
    }):
        heures.append(rdv["heure"])
    return {"occupees": heures}


@router.get("/heures-occupees/{medecin_id}/{jour}")
async def get_heures_occupees(medecin_id: str, jour: str, date: str = Query(...)):
    heures_occupees = []
    async for rdv in db["rendezvous"].find({
        "medecin_id": medecin_id,
        "date": date,
        "statut": {"$ne": "Annulé"}
    }):
        heures_occupees.append(rdv["heure"])
    return {"heures_occupees": heures_occupees}


@router.get("/by-id/{rendezvous_id}")
async def get_rendezvous_by_id(rendezvous_id: str):
    rendezvous = await db["rendezvous"].find_one({"_id": ObjectId(rendezvous_id)})
    if not rendezvous:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")

    rendezvous["_id"] = str(rendezvous["_id"])
    return rendezvous


async def buscar_cita_disponible():
    return await db["rendezvous"].find_one({"statut": "disponible"})


async def guardar_cita_propuesta(user_id: str, cita_id):
    await db["temp_reservation"].update_one(
        {"user_id": user_id},
        {"$set": {"cita_id": str(cita_id)}},
        upsert=True
    )


async def confirmer_cita(user_id: str):
    estado = await db["temp_reservation"].find_one({"user_id": user_id})
    if not estado:
        return "❌ Aucun rendez-vous à confirmer."

    cita_id = estado["cita_id"]
    result = await db["rendezvous"].update_one(
        {"_id": ObjectId(cita_id)},
        {"$set": {"statut": "Confirmé", "patient_id": user_id}}
    )
    await db["temp_reservation"].delete_one({"user_id": user_id})

    return (
        "✅ Rendez-vous confirmé avec succès !"
        if result.modified_count
        else "❌ Impossible de confirmer le rendez-vous."
    )
