# app/utils.py
from datetime import datetime, timedelta
from jose import jwt
from typing import Optional

# 🔹 Configuration du token
SECRET_KEY = "secreto_super_seguro"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Temps d'expiration du token en minutes

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Génère un token JWT avec une durée d'expiration."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
