from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from app.config import db
from app.services.security import hash_password
from app.routes.disponibilites import create_default_disponibilites

router = APIRouter()

class MedecinCreationModel(BaseModel):
    user: dict
    medecin: dict
    adresse: dict
    contact: dict


@router.get("/")
async def get_medecins():
    """Récupérer tous les médecins avec leurs informations principales"""

    medecins = []
    async for medecin in db["medecins"].find({}):
        medecins.append({
            "_id": str(medecin["_id"]),
            "user_id": str(medecin["user_id"]),
            "nom": medecin.get("nom", ""),
            "prenom": medecin.get("prenom", ""),
            "specialite": medecin.get("specialite", ""),
            "genre": medecin.get("genre", ""),
            "date_naissance": medecin.get("date_naissance", "")
        })

    if not medecins:
        raise HTTPException(status_code=404, detail="Aucun médecin enregistré")

    return medecins


# ✅ Obtenir un médecin par ID
@router.get("/{medecin_id}")
async def get_medecin_by_id(medecin_id: str):
    """Récupérer un médecin par ID"""

    # Chercher le médecin par `_id` ou `user_id`
    medecin = await db["medecins"].find_one({
        "$or": [
            {"_id": ObjectId(medecin_id)}, 
            {"user_id": ObjectId(medecin_id)}
        ]
    })

    if not medecin:
        raise HTTPException(status_code=404, detail="Médecin non trouvé")

    medecin["_id"] = str(medecin["_id"])
    medecin["user_id"] = str(medecin["user_id"])

    return medecin

# ✅ Nuevo endpoint pour récupérer toutes les données du médecin
@router.get("/profil/{user_id}")
async def get_medecin_full_profile(user_id: str):
    """Récupérer toutes les données du médecin (user, médecin, adresse, contact)"""

    user = await db["UserMedecins"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Compte médecin non trouvé")
    user["_id"] = str(user["_id"])

    medecin = await db["medecins"].find_one({"user_id": ObjectId(user_id)})
    if not medecin:
        raise HTTPException(status_code=404, detail="Données médecin non trouvées")
    medecin["_id"] = str(medecin["_id"])
    medecin["user_id"] = str(medecin["user_id"])

    adresse = await db["adresses"].find_one({"user_id": user_id})
    if adresse:
        adresse["_id"] = str(adresse["_id"])

    contact = await db["contacts"].find_one({"user_id": user_id})
    if contact:
        contact["_id"] = str(contact["_id"])

    return {
        "user": user,
        "medecin": medecin,
        "adresse": adresse,
        "contact": contact,
    }


# ✅ Mettre à jour le profil complet
@router.put("/profil/{user_id}")
async def update_medecin_profile(user_id: str, update_data: dict):
    """Mettre à jour les informations du médecin, son adresse, contact et compte"""

    # Vérification que l'utilisateur médecin existe
    user = await db["UserMedecins"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur médecin non trouvé")

    # 🔐 Mise à jour des données médicales
    medecin_data = update_data.get("medecin")
    if medecin_data:
        medecin_data.pop("_id", None)
        medecin_data.pop("user_id", None)  # Éviter d’écraser accidentellement
        await db["medecins"].update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": medecin_data}
        )

    # 🔐 Mise à jour ou insertion de l'adresse
    adresse_data = update_data.get("adresse")
    if adresse_data:
        adresse_data.pop("_id", None)
        adresse_data.pop("user_id", None)
        await db["adresses"].update_one(
            {"user_id": user_id},
            {"$set": adresse_data},
            upsert=True
        )

    # 🔐 Mise à jour ou insertion du contact
    contact_data = update_data.get("contact")
    if contact_data:
        contact_data.pop("_id", None)
        contact_data.pop("user_id", None)
        await db["contacts"].update_one(
            {"user_id": user_id},
            {"$set": contact_data},
            upsert=True
        )

    # 🔐 Mise à jour du compte utilisateur
    user_data = update_data.get("user")
    if user_data:
        user_data.pop("_id", None)
        user_data.pop("user_type", None)  # Pour éviter de le modifier depuis le frontend
        if "password" in user_data:
            user_data["password"] = hash_password(user_data["password"])

        await db["UserMedecins"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": user_data}
        )

    return {"message": "Profil médecin mis à jour avec succès"}


@router.post("/")
async def create_medecin(data: MedecinCreationModel):
    """Créer un nouveau médecin complet : compte, médecin, adresse, contact, disponibilités"""

    user_data = data.user
    medecin_data = data.medecin
    adresse_data = data.adresse
    contact_data = data.contact

    # 🔹 Vérifier si le username existe déjà
    existing = await db["UserMedecins"].find_one({"username": user_data["username"]})
    if existing:
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà utilisé.")

    # 🔐 Hacher le mot de passe
    if "password" in user_data:
        user_data["password"] = hash_password(user_data["password"])

    # 🔹 Créer l'utilisateur
    new_user = {
        **user_data,
        "user_type": "Médecin"
    }
    result_user = await db["UserMedecins"].insert_one(new_user)
    user_id = str(result_user.inserted_id)

    # 🔹 Créer les données du médecin
    medecin_data["user_id"] = ObjectId(user_id)
    await db["medecins"].insert_one(medecin_data)

    # 🔹 Ajouter adresse et contact
    adresse_data["user_id"] = user_id
    contact_data["user_id"] = user_id
    await db["adresses"].insert_one(adresse_data)
    await db["contacts"].insert_one(contact_data)

    await create_default_disponibilites(user_id)

    return {"message": "Médecin créé avec succès", "user_id": user_id}


# ✅ Supprimer un médecin et ses données liées
@router.delete("/{medecin_id}")
async def delete_medecin(medecin_id: str):
    """Supprimer un médecin, son compte utilisateur, son adresse et son contact"""

    try:
        # 🔹 Chercher le médecin via _id ou user_id
        medecin = await db["medecins"].find_one({
            "$or": [
                {"_id": ObjectId(medecin_id)},
                {"user_id": ObjectId(medecin_id)}
            ]
        })

        if not medecin:
            raise HTTPException(status_code=404, detail="Médecin non trouvé")

        user_id = str(medecin["user_id"])

        # 🔸 Supprimer les données associées
        await db["UserMedecins"].delete_one({"_id": ObjectId(user_id)})
        await db["medecins"].delete_one({"user_id": ObjectId(user_id)})
        await db["adresses"].delete_one({"user_id": user_id})
        await db["contacts"].delete_one({"user_id": user_id})

        return {"message": "Médecin supprimé avec succès"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")
