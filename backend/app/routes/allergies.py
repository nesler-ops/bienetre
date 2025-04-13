from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.config import db
from app.routes.auth import get_current_user

router = APIRouter()

class Allergy(BaseModel):
    user_id: str
    substance: str
    reaction: Optional[str] = None
    gravité: Optional[str] = None
    date_declaration: Optional[str] = None  
    notes: Optional[str] = None

# Middleware para asegurar que sea un médecin
def require_medecin(user=Depends(get_current_user)):
    if user["user_type"] != "Médecin":
        raise HTTPException(status_code=403, detail="Accès réservé aux médecins")
    return user

@router.post("/", dependencies=[Depends(require_medecin)])
async def add_allergy(allergy: Allergy):
    try:
        allergy_dict = allergy.dict()
        allergy_dict["user_id"] = ObjectId(allergy.user_id)
        result = await db["allergies"].insert_one(allergy_dict)
        return {"message": "Allergie ajoutée avec succès", "allergy_id": str(result.inserted_id)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")



@router.get("/user/{user_id}")
async def get_allergies(user_id: str):
    try:
        allergies = []
        async for a in db["allergies"].find({"user_id": ObjectId(user_id)}):  
            a["_id"] = str(a["_id"])
            a["user_id"] = str(a["user_id"])
            allergies.append(a)
        return allergies
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération : {str(e)}")



@router.delete("/{allergy_id}", dependencies=[Depends(require_medecin)])
async def delete_allergy(allergy_id: str):
    result = await db["allergies"].delete_one({"_id": ObjectId(allergy_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Allergie non trouvée")
    return {"message": "Allergie supprimée avec succès"}
