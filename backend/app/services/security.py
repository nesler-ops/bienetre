import base64
from bson import Binary
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hashea la contraseña y devuelve el hash directamente."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña en texto plano coincide con la encriptada."""
    return pwd_context.verify(plain_password, hashed_password)