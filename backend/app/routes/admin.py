from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from app.config import db
from app.services.security import verify_password, hash_password
from app.utils import create_access_token
from app.routes.auth import get_current_user

router = APIRouter()

class AdminLogin(BaseModel):
    username: str
    password: str
    
class AdminCreate(BaseModel):
    username: str
    password: str
    user_type: str


@router.post("/admin-login")
async def admin_login(admin: AdminLogin):
    existing_admin = await db["admins"].find_one({"username": admin.username})
    if not existing_admin or not verify_password(admin.password, existing_admin["password"]):
        raise HTTPException(status_code=401, detail="Nom d'utilisateur ou mot de passe incorrect.")

    # ✅ Generar el token JWT
    token = create_access_token({
        "user_id": str(existing_admin["_id"]),  
        "user_type": "Admin"
    })

    return {
        "token": token,
        "username": existing_admin["username"],
        "user_type": "Admin",
        "user_id": str(existing_admin["_id"]),  
    }


@router.post("/create", tags=["Administrateurs"])
async def create_admin(admin: AdminCreate):
    """Créer un administrateur (utilisé uniquement via Postman)"""

    # Vérifier si l'administrateur existe déjà
    existing_admin = await db["admins"].find_one({"username": admin.username})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà utilisé")

    # Hasher le mot de passe avant de l'enregistrer
    hashed_password = hash_password(admin.password)

    # Créer l'administrateur dans la base de données
    new_admin = {"username": admin.username, "password": hashed_password}
    result = await db["admins"].insert_one(new_admin)

    return {
        "message": "Administrateur créé avec succès",
        "admin_id": str(result.inserted_id),
        "username": admin.username
    }