from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np
import cv2
from app.services.facial import encode_face  

router = APIRouter()

@router.post("/encode")
async def encode_face_route(file: UploadFile = File(...)):
    """📸 Reçoit une image, la traite et renvoie l'encodage facial."""
    try:
        contents = await file.read()
        np_arr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        encoding = await encode_face(image)
        if encoding is None:
            raise HTTPException(status_code=400, detail="Aucun visage détecté.")

        return {"face_encoding": encoding}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement de l'image : {str(e)}")
