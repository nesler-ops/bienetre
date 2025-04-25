from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from app.config import db
from app.services.security import hash_password  

router = APIRouter()

class UserPatientCreate(BaseModel):
    username: str
    password: str
    user_type: str
    face_encoding: list | None = None  # Opcional

@router.post("/")
async def create_user_patient(user: UserPatientCreate):
    existing_user = await db["UserPatients"].find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="El usuario ya está registrado.")

    hashed_password = hash_password(user.password)  

    new_user = {
        "username": user.username,
        "password": hashed_password,  
        "user_type": user.user_type,
        "face_encoding": user.face_encoding,
        "date_creation": datetime.utcnow(),
    }

    result = await db["UserPatients"].insert_one(new_user)
    return {
        "message": "Usuario registrado exitosamente",
        "user_id": str(result.inserted_id),
    }
