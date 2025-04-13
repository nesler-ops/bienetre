import cv2
import face_recognition
import numpy as np
from app.config import db

async def encode_face(image: np.ndarray) -> list:
    """Convertit une image en un vecteur de caractéristiques faciales."""
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    face_locations = face_recognition.face_locations(rgb_image)
    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
    
    if not face_encodings:
        return None
    
    encoding = face_encodings[0]
    if len(encoding.shape) != 1 or encoding.shape[0] != 128:
        raise ValueError("Formato de codificación facial inválido")
    
    return encoding.tolist()

async def match_face(encoding: list) -> dict:
    """Recherche une correspondance dans la base de données."""
    if not encoding:
        return None

    try:
        # Convertir a numpy array y asegurar que es 1D (128,)
        encoding = np.array(encoding, dtype=np.float64)
        if encoding.shape != (128,):
            print(f"Encoding recibido no tiene la forma correcta: {encoding.shape}")
            return None

        for collection in ["UserPatients", "UserMedecins"]:
            async for user in db[collection].find({"face_encoding": {"$exists": True}}):
                stored_encoding_raw = user.get("face_encoding")

                if stored_encoding_raw is None:
                    continue  # Saltar si no hay codificación

                stored_encoding = np.array(stored_encoding_raw, dtype=np.float64)

                # Validar que tenga la forma (128,)
                if stored_encoding.shape != (128,):
                    print(f"Codificación inválida para usuario {user.get('_id')}, forma: {stored_encoding.shape}")
                    continue  # Saltar usuarios con codificación inválida

                # Comparar caras
                matches = face_recognition.compare_faces(
                    [stored_encoding],
                    encoding,
                    tolerance=0.6
                )

                if matches[0]:
                    return user

    except Exception as e:
        print(f"Error en match_face: {str(e)}")
        return None

    return None
