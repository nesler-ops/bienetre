from pydantic import BaseModel
from typing import List, Optional

class UserLogin(BaseModel):
    username: str
    password: str
    user_type: str  # "Patient" o "Médecin"

class User(BaseModel):
    username: str
    password: str
    user_type: str
    face_encoding: Optional[List[float]] = None  
    
class UserAdmin(BaseModel):
    username: str
    password: str
    
class TwoFAVerify(BaseModel):
    user_id: str
    user_type: str
    code: str