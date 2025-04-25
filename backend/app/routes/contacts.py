from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import db

router = APIRouter()

# 🔹 Modelo de datos para el contacto
class ContactCreate(BaseModel):
    user_id: str
    telephone: str
    email: str

@router.get("/{user_id}")
async def get_contact(user_id: str):
    """Récupérer le contact d'un utilisateur"""
    
    contact = await db["Contacts"].find_one({"user_id": user_id})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    
    contact["_id"] = str(contact["_id"])
    return contact

@router.put("/{user_id}")
async def update_contact(user_id: str, contact_data: ContactCreate):
    """Mettre à jour le contact d'un utilisateur"""

    contact = await db["Contacts"].find_one({"user_id": user_id})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")

    update_contact_data = {
        "telephone": contact_data.telephone,
        "email": contact_data.email,
    }

    await db["Contacts"].update_one({"user_id": user_id}, {"$set": update_contact_data})

    return {"message": "Contact mis à jour avec succès"}

@router.delete("/{user_id}")
async def delete_contact(user_id: str):
    """Supprimer le contact d'un utilisateur"""

    contact = await db["Contacts"].find_one({"user_id": user_id})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")

    await db["Contacts"].delete_one({"user_id": user_id})

    return {"message": "Contact supprimé avec succès"}
