from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from app.config import db

router = APIRouter()

# 🔹 Modelo de datos para la dirección
class AddressCreate(BaseModel):
    user_id: str
    adresse: str
    rue: str
    ville: str
    code_postal: str
    pays: str

# ✅ Endpoint para récupérer l'adresse d'un utilisateur
@router.get("/{user_id}")
async def get_address(user_id: str):
    """Récupérer l'adresse d'un utilisateur"""
    
    address = await db["Adresses"].find_one({"user_id": user_id})
    if not address:
        raise HTTPException(status_code=404, detail="Adresse non trouvée")
    
    address["_id"] = str(address["_id"])
    return address

# ✅ Endpoint pour mettre à jour l'adresse
@router.put("/{user_id}")
async def update_address(user_id: str, address_data: AddressCreate):
    """Mettre à jour l'adresse d'un utilisateur"""

    address = await db["Adresses"].find_one({"user_id": user_id})
    if not address:
        raise HTTPException(status_code=404, detail="Adresse non trouvée")

    update_address_data = {
        "adresse": address_data.adresse,
        "rue": address_data.rue,
        "ville": address_data.ville,
        "code_postal": address_data.code_postal,
        "pays": address_data.pays,
    }

    await db["Adresses"].update_one({"user_id": user_id}, {"$set": update_address_data})

    return {"message": "Adresse mise à jour avec succès"}

# ✅ Endpoint pour supprimer l'adresse
@router.delete("/{user_id}")
async def delete_address(user_id: str):
    """Supprimer l'adresse d'un utilisateur"""

    address = await db["Adresses"].find_one({"user_id": user_id})
    if not address:
        raise HTTPException(status_code=404, detail="Adresse non trouvée")

    await db["Adresses"].delete_one({"user_id": user_id})

    return {"message": "Adresse supprimée avec succès"}
