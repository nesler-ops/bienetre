from fastapi import APIRouter, Body, HTTPException
import requests

router = APIRouter()

@router.post("/assistant-ia/")
def call_medical_model(symptoms: str = Body(..., embed=True)):
    try:
        prompt = (
            "You are an advanced AI medical assistant. Based on the following symptoms, "
            "provide a probable diagnosis and next steps.\n\n"
            f"Symptoms: {symptoms}"
        )

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "ALIENTELLIGENCE/medicaldiagnostictools", 
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        result = response.json()

        # 🧠 Verifica si hay un campo llamado "response" o "message"
        print("🧠 Réponse brute de l'IA (pour debug):", result)

        generated = result.get("response") or result.get("message")

        # También puede venir como lista (algunos modelos)
        if not generated and isinstance(result, list) and len(result) > 0:
            generated = result[0].get("response") or result[0].get("message")

        if not generated or not generated.strip():
            return {"response": "Pas de réponse utile de l'IA pour cette requête."}

        return {"response": generated.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assistant-ia/diagnostic-ia")
def diagnostiquer(symptomes: str = Body(..., embed=True)):
    try:
        prompt = (
            "Tu es un assistant médical intelligent. À partir des symptômes ci-dessous, "
            "fournis un diagnostic médical probable.\n\n"
            f"Symptômes : {symptomes}"
        )

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "ALIENTELLIGENCE/medicaldiagnostictools",
                "prompt": prompt,
                "stream": False,
            },
            timeout=60,
        )
        result = response.json()
        return {"diagnostic": result.get("response", "Pas de réponse utile.")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assistant-ia/traitement-ia")
def suggerer_traitement(diagnostic: str = Body(..., embed=True)):
    try:
        prompt = (
            "Tu es un assistant médical intelligent. En te basant sur le diagnostic suivant, "
            "suggère un traitement médical adapté.\n\n"
            f"Diagnostic : {diagnostic}"
        )

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "ALIENTELLIGENCE/medicaldiagnostictools",
                "prompt": prompt,
                "stream": False,
            },
            timeout=60,
        )
        result = response.json()
        return {"traitement": result.get("response", "Pas de réponse utile.")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
