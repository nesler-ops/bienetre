from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from app.config import db

router = APIRouter()

class PatientCreate(BaseModel):
    user_id: str
    nom: str
    prenom: str
    numero_assurance: str
    date_naissance: str
    genre: str
    adresse: str
    rue: str
    ville: str
    code_postal: str
    pays: str
    telephone: str
    email: str
    
class PatientUpdate(BaseModel):
    patient: dict
    adresse: dict
    contact: dict

from bson.errors import InvalidId

# ✅ Endpoint pour lister tous les patients (utile pour l'admin)
@router.get("/")
async def get_all_patients():
    """Lister tous les patients avec leurs informations principales"""
    patients = []
    async for patient in db["patients"].find({}):
        patients.append({
            "_id": str(patient["_id"]),
            "user_id": patient.get("user_id", ""),
            "nom": patient.get("nom", ""),
            "prenom": patient.get("prenom", ""),
            "numero_assurance": patient.get("numero_assurance", ""),
            "genre": patient.get("genre", ""),
            "date_naissance": patient.get("date_naissance", ""),
            "date_creation": patient.get("date_creation", "")
        })

    if not patients:
        raise HTTPException(status_code=404, detail="Aucun patient enregistré")

    return patients


@router.post("/")
async def create_patient(patient: PatientCreate):
    """Créer un patient avec son adresse et ses contacts"""

    # ✅ Vérifier que l'ID est valide
    try:
        patient_id = ObjectId(patient.user_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")

    # ✅ Vérifier si l'utilisateur existe déjà
    existing_user = await db["UserPatients"].find_one({"_id": patient_id})
    if not existing_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # ✅ Vérifier si le patient existe déjà
    existing_patient = await db["patients"].find_one({"user_id": patient.user_id})
    if existing_patient:
        raise HTTPException(status_code=400, detail="Le patient existe déjà")

    # 🔹 Enregistrer le patient
    new_patient = {
        "user_id": patient.user_id,
        "nom": patient.nom,
        "prenom": patient.prenom,
        "numero_assurance": patient.numero_assurance,
        "date_naissance": patient.date_naissance,
        "genre": patient.genre,
        "date_creation": datetime.utcnow(),
    }

    patient_result = await db["patients"].insert_one(new_patient)

    # 🔹 Enregistrer l'adresse associée (si fournie)
    if patient.adresse and patient.ville:
        new_address = {
            "user_id": patient.user_id,  
            "adresse": patient.adresse,
            "rue": patient.rue or "",
            "ville": patient.ville,
            "code_postal": patient.code_postal or "",
            "pays": patient.pays or "",
        }
        await db["adresses"].insert_one(new_address)

    # 🔹 Enregistrer les contacts associés (si fournis)
    if patient.telephone or patient.email:
        new_contact = {
            "user_id": patient.user_id,  
            "telephone": patient.telephone or "",
            "email": patient.email or "",
        }
        await db["contacts"].insert_one(new_contact)

    return {"message": "Patient enregistré avec succès", "patient_id": str(patient_result.inserted_id)}


# ✅ Endpoint pour récupérer les informations d'un patient
@router.get("/{user_id}")
async def get_patient(user_id: str):
    """Récupérer les informations complètes d'un patient"""
    
    patient = await db["patients"].find_one({"user_id": user_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    address = await db["adresses"].find_one({"user_id": user_id})
    contact = await db["contacts"].find_one({"user_id": user_id})

    patient["_id"] = str(patient["_id"])
    if address:
        address["_id"] = str(address["_id"])
    if contact:
        contact["_id"] = str(contact["_id"])

    return {
        "patient": patient,
        "adresse": address,
        "contact": contact,
    }

# ✅ Endpoint pour mettre à jour les informations d'un patient
@router.put("/{user_id}")
async def update_patient(user_id: str, patient_data: PatientUpdate):
    """Mettre à jour les informations d'un patient et ses données associées"""

    patient = await db["patients"].find_one({"user_id": user_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    # 🔹 Mise à jour du patient
    update_patient_data = {
        "nom": patient_data.patient["nom"],
        "prenom": patient_data.patient["prenom"],
        "numero_assurance": patient_data.patient["numero_assurance"],
        "date_naissance": patient_data.patient["date_naissance"],
        "genre": patient_data.patient["genre"],
    }
    await db["patients"].update_one({"user_id": user_id}, {"$set": update_patient_data})

    # 🔹 Mise à jour de l'adresse
    update_address_data = {
        "adresse": patient_data.adresse["adresse"],
        "rue": patient_data.adresse["rue"],
        "ville": patient_data.adresse["ville"],
        "code_postal": patient_data.adresse["code_postal"],
        "pays": patient_data.adresse["pays"],
    }
    await db["adresses"].update_one({"user_id": user_id}, {"$set": update_address_data})

    # 🔹 Mise à jour du contact
    update_contact_data = {
        "telephone": patient_data.contact["telephone"],
        "email": patient_data.contact["email"],
    }
    await db["contacts"].update_one({"user_id": user_id}, {"$set": update_contact_data})

    return {"message": "Informations mises à jour avec succès"}


# ✅ Endpoint pour supprimer un patient et toutes ses données associées
@router.delete("/{user_id}")
async def delete_patient(user_id: str):
    """Supprimer un patient, son adresse et ses contacts"""
    
    patient = await db["patients"].find_one({"user_id": user_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    await db["patients"].delete_one({"user_id": user_id})
    await db["adresses"].delete_one({"user_id": user_id})
    await db["contacts"].delete_one({"user_id": user_id})

    return {"message": "Patient et ses données associées supprimés avec succès"}
