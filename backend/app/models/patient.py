from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Patient(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    nom: str
    prenom: str
    numero_assurance: Optional[str] = None 
    date_naissance: str
    genre: str
    date_creation: datetime  
