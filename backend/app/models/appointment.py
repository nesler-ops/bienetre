from pydantic import BaseModel, Field
from typing import Optional

class Appointment(BaseModel):
    id: Optional[str] = Field(alias="_id")
    date: str
    heure: str
    medecin_id: str
    type: str
    motif: str
    statut: str  # "Confirmé", "En attente", "Annulé"
    patient_id: str
    created_at: str
    visite_faite: str
