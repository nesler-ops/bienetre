from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.config import db
from datetime import datetime
from fastapi import Body

router = APIRouter()

def normalize_date_field(field):
    """Convert date field to ISO string or empty string if invalid or empty."""
    if isinstance(field, datetime):
        return field.isoformat()
    elif isinstance(field, str) and field.strip():
        try:
            return datetime.fromisoformat(field).isoformat()
        except Exception:
            return ""
    return ""

@router.get("/by-medecin/{medecin_id}")
async def get_dossiers_by_medecin(medecin_id: str):
    try:
        dossiers = await db["dossiersmedicaux"].find({"medecin_id": ObjectId(medecin_id)}).to_list(100)

        for d in dossiers:
            d["_id"] = str(d["_id"])
            d["patient_id"] = str(d["patient_id"])
            d["medecin_id"] = str(d["medecin_id"])

            # Normaliser les champs de date
            d["debut_maladie"] = normalize_date_field(d.get("debut_maladie"))
            d["fin_maladie"] = normalize_date_field(d.get("fin_maladie"))

            # S'assurer que le champ existe toujours
            d["notes_pour_medecins"] = d.get("notes_pour_medecins", "")

        return dossiers

    except Exception as e:
        print(f"[ERROR] ❌ Erreur pendant la récupération: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{patient_id}")
async def get_dossiers_by_patient(patient_id: str):
    try:
        dossiers = await db["dossiersmedicaux"].find({"patient_id": ObjectId(patient_id)}).to_list(100)
        for d in dossiers:
            d["_id"] = str(d["_id"])
            d["patient_id"] = str(d["patient_id"])
            d["medecin_id"] = str(d["medecin_id"])
        return dossiers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{dossier_id}")
async def update_dossier(dossier_id: str, data: dict = Body(...)):
    try:
        print(f"[DEBUG] 🛠 Données reçues pour mise à jour: {data}")  # 👈 Añadir esto

        update_fields = {k: v for k, v in data.items() if v is not None}

        if "debut_maladie" in update_fields:
            update_fields["debut_maladie"] = datetime.fromisoformat(update_fields["debut_maladie"])
        if "fin_maladie" in update_fields:
            update_fields["fin_maladie"] = datetime.fromisoformat(update_fields["fin_maladie"])

        print(f"[DEBUG] Champs à mettre à jour: {update_fields}")  # 👈 Añadir esto

        result = await db["dossiersmedicaux"].update_one(
            {"_id": ObjectId(dossier_id)},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Dossier non trouvé ou pas modifié")

        updated_dossier = await db["dossiersmedicaux"].find_one({"_id": ObjectId(dossier_id)})
        if updated_dossier:
            updated_dossier["_id"] = str(updated_dossier["_id"])
            updated_dossier["patient_id"] = str(updated_dossier["patient_id"])
            updated_dossier["medecin_id"] = str(updated_dossier["medecin_id"])
            updated_dossier["debut_maladie"] = normalize_date_field(updated_dossier.get("debut_maladie"))
            updated_dossier["fin_maladie"] = normalize_date_field(updated_dossier.get("fin_maladie"))
            updated_dossier["notes_pour_medecins"] = updated_dossier.get("notes_pour_medecins", "")
            return updated_dossier
        else:
            raise HTTPException(status_code=404, detail="Dossier mis à jour mais non retrouvé")

    except Exception as e:
        print(f"[ERROR] ❌ Exception pendant mise à jour: {e}")
        raise HTTPException(status_code=500, detail=str(e))
