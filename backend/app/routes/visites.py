# ✅ FICHIER: app/routers/visites.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from bson import ObjectId
from app.config import db
import requests

router = APIRouter()

class Visite(BaseModel):
    patient_id: str
    medecin_id: str
    etablissement: str
    date_visite: str
    resume_visite: str
    symptomes: Optional[str] = None
    diagnostic: Optional[str] = None
    source_diagnostic: Optional[str] = "manuel"
    traitement: Optional[str] = None
    source_traitement: Optional[str] = "manuel"
    notes_pour_medecins: Optional[str] = None
    debut_maladie: Optional[str] = None
    fin_maladie: Optional[str] = None

@router.post("/")
async def creer_visite(visite: Visite):
    try:
        # Conversion
        visite_dict = visite.dict()
        visite_dict["patient_id"] = ObjectId(visite.patient_id)
        visite_dict["medecin_id"] = ObjectId(visite.medecin_id)
        visite_dict["date_visite"] = datetime.fromisoformat(visite.date_visite)

        if visite.debut_maladie:
            visite_dict["debut_maladie"] = datetime.fromisoformat(visite.debut_maladie)
        if visite.fin_maladie:
            visite_dict["fin_maladie"] = datetime.fromisoformat(visite.fin_maladie)

        await db["visites"].insert_one(visite_dict)

        # 🔹 Stockage dans la collection "dossiersmedicaux"

        dossier = {
            "patient_id": visite_dict["patient_id"],
            "medecin_id": visite_dict["medecin_id"],
            "date_visite": visite_dict["date_visite"],
            "etablissement": visite_dict.get("etablissement", ""),
            "symptomes": visite.symptomes or visite.resume_visite,
            "diagnostic": visite.diagnostic,
            "source_diagnostic": visite.source_diagnostic,
            "traitement": visite.traitement,
            "source_traitement": visite.source_traitement,
            "resume_visite": visite.resume_visite,
            "notes_pour_medecins": visite.notes_pour_medecins or "",
            "debut_maladie": visite_dict.get("debut_maladie"),
            "fin_maladie": visite_dict.get("fin_maladie"),
            "created_at": datetime.utcnow()
        }
        await db["dossiersmedicaux"].insert_one(dossier)


        return {"message": "Visite et dossier enregistrés avec succès"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement : {str(e)}")


# ✅ FICHIER: app/routers/assistant_ia.py
@router.post("/diagnostic-ia/")
def diagnostiquer(symptomes: str):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "ALIENTELLIGENCE/medicaldiagnostictools",
                "prompt": f"Patient symptoms: {symptomes}\nWhat is the most probable diagnosis?",
                "stream": False
            },
            timeout=60
        )
        result = response.json()
        return {"diagnostic": result.get("response", "Aucune réponse utile de l'IA.")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
