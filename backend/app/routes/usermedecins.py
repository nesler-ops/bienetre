from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from app.config import db  
from app.services.security import hash_password  

router = APIRouter()

# Modelo Pydantic para la creación de un UserMedecin
class UserMedecinCreate(BaseModel):
    username: str
    password: str
    matricule: str 
    user_type: str 
    face_encoding: list | None = None  
    
class UserMedecinUpdate(BaseModel):
    username: str | None = None  # Opcional
    password: str | None = None  # Opcional
    matricule: str | None = None  # Opcional
    face_encoding: list | None = None  # Opcional

@router.post("/")
async def create_user_medecin(user: UserMedecinCreate):
    # Verificar si el usuario ya existe
    existing_user = await db["UserMedecins"].find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="El usuario ya está registrado.")

    # Hashear la contraseña antes de guardarla
    hashed_password = hash_password(user.password)

    # Crear el nuevo usuario médico
    new_user = {
        "username": user.username,
        "password": hashed_password,
        "matricule": user.matricule,
        "user_type": user.user_type,
        "face_encoding": user.face_encoding,
        "date_creation": datetime.utcnow(),  
    }

    # Insertar el nuevo usuario en la base de datos
    result = await db["UserMedecins"].insert_one(new_user)

    # Retornar una respuesta con el ID del usuario creado
    return {
        "message": "Usuario médico registrado exitosamente",
        "user_id": str(result.inserted_id),
    }
    
@router.put("/{user_id}")
async def update_user_medecin(user_id: str, user: UserMedecinUpdate):
    # Verificar si el usuario existe
    existing_user = await db["UserMedecins"].find_one({"_id": ObjectId(user_id)})
    if not existing_user:
        raise HTTPException(status_code=404, detail="Usuario médico no encontrado.")

    # Preparar los datos a actualizar
    update_data = user.dict(exclude_unset=True)  # Solo incluye los campos proporcionados

    # Si se proporciona una nueva contraseña, hashearla
    if "password" in update_data:
        update_data["password"] = hash_password(update_data["password"])

    # Actualizar el usuario en la base de datos
    result = await db["UserMedecins"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )

    # Verificar si se realizó la actualización
    if result.modified_count == 1:
        return {"message": "Usuario médico actualizado exitosamente"}

    # Si no se modificó ningún registro, retornar un mensaje
    return {"message": "No se realizaron cambios"}