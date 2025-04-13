from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
import numpy as np
import cv2
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from app.models.user import UserLogin, UserAdmin, TwoFAVerify
from app.services.security import verify_password, hash_password
from app.services.facial import encode_face, match_face
from app.services.twofa import send_verification_email, store_verification_code, verify_code, generate_verification_code
from app.config import db
from app.utils import create_access_token, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter()

@router.post("/login")
async def login(user: UserLogin):
    """🔑 Authentification avec identifiants et envoi du code de vérification"""
    
    if user.user_type not in ["Patient", "Médecin"]:
        raise HTTPException(status_code=400, detail="Type d'utilisateur invalide")

    collection = "UserPatients" if user.user_type == "Patient" else "UserMedecins"
    existing_user = await db[collection].find_one({"username": user.username})

    if not existing_user or not verify_password(user.password, existing_user["password"]):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")

    
    contact = await db["contacts"].find_one({"user_id": str(existing_user["_id"])})
    if not contact or not contact.get("email"):
        raise HTTPException(status_code=400, detail="Aucune adresse email trouvée dans les contacts.")

    code = generate_verification_code()
    await store_verification_code(str(existing_user["_id"]), code)
    send_verification_email(contact["email"], code)

    return {
        "message": "Un code de vérification a été envoyé à votre adresse email.",
        "user_id": str(existing_user["_id"]),
        "user_type": user.user_type,
    }


@router.post("/verify-code")
async def verify_2fa_code(data: TwoFAVerify):
    """🔐 Vérifie le code de vérification envoyé à l'utilisateur"""

    if data.user_type not in ["Patient", "Médecin"]:
        raise HTTPException(status_code=400, detail="Type d'utilisateur invalide")

    if not await verify_code(data.user_id, data.code):
        raise HTTPException(status_code=401, detail="Code de vérification invalide ou expiré")

    collection = "UserPatients" if data.user_type == "Patient" else "UserMedecins"
    user = await db[collection].find_one({"_id": ObjectId(data.user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    token = create_access_token({
        "sub": str(user["_id"]),
        "user_type": data.user_type
    })

    return {
        "message": "Connexion réussie",
        "token": token,
        "username": user["username"],
        "user_type": data.user_type,
        "user_id": str(user["_id"])
    }

@router.post("/login-face")
async def login_face(file: UploadFile = File(...)):
    """🟢 Connexion avec reconnaissance faciale"""
    
    if not file:
        raise HTTPException(status_code=400, detail="Aucune image reçue")

    image = np.frombuffer(file.file.read(), np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    encoding = await encode_face(image)
    if not encoding:
        raise HTTPException(status_code=400, detail="Aucun visage détecté")

    user = await match_face(encoding)
    if not user:
        raise HTTPException(status_code=401, detail="Visage non reconnu")

    token = create_access_token({
        "sub": str(user["_id"]),
        "user_type": user["user_type"]
    })

    return {
        "message": "Connexion réussie",
        "token": token,
        "user_type": user["user_type"],
        "username": user["username"],
        "user_id": str(user["_id"])
    }


@router.get("/me")
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """👤 Obtenir l'utilisateur authentifié à partir du token"""
    print(f"🔍 Token reçu : {token}")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        user_type: str = payload.get("user_type")

        if not user_id or not user_type:
            raise HTTPException(status_code=401, detail="Token invalide")

        user = await db["UserPatients"].find_one({"_id": ObjectId(user_id)}) or await db["UserMedecins"].find_one({"_id": ObjectId(user_id)})

        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")

        return {
            "user_id": str(user["_id"]),
            "user_type": user_type,
            "username": user["username"]
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide ou utilisateur non authentifié")


@router.post("/admin-login")
async def admin_login(admin: UserAdmin):
    """🔑 Authentification d'un administrateur et génération de token"""

    existing_admin = await db["admins"].find_one({"username": admin.username})

    if not existing_admin or not verify_password(admin.password, existing_admin["password"]):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")

    token = create_access_token({
        "sub": str(existing_admin["_id"]),
        "user_type": "Admin"
    })

    return {
        "message": "Connexion réussie",
        "token": token,
        "username": existing_admin["username"]
    }


@router.get("/admin/me")
async def get_current_admin(token: str = Depends(oauth2_scheme)):
    """👤 Obtenir l'administrateur authentifié à partir du token"""

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id: str = payload.get("sub")
        user_type: str = payload.get("user_type")

        if not admin_id or user_type != "Admin":
            raise HTTPException(status_code=401, detail="Token invalide")

        admin = await db["admins"].find_one({"_id": ObjectId(admin_id)})

        if not admin:
            raise HTTPException(status_code=401, detail="Administrateur non trouvé")

        return {
            "admin_id": str(admin["_id"]),
            "username": admin["username"]
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide ou administrateur non authentifié")
