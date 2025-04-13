#Funcional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from datetime import datetime
import os
import dotenv
from app.config import db
from app.services.notifications import envoyer_notification_creation
import asyncio  # ✅ Agregado para usar asyncio.to_thread

dotenv.load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("API Key de OpenAI no encontrada")

openai_client = OpenAI(api_key=openai_api_key)
router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    message: str

@router.post("/chat")
async def chat_with_bot(request: ChatRequest):
    user_id = request.user_id
    message = request.message.strip()
    print(f"\n🟢 Nouveau message de {user_id}: '{message}'")

    if message.lower() in ["annuler", "je veux annuler", "annuler le rendez-vous", "stop"]:
        await db["chat_temp"].delete_one({"user_id": user_id})
        return {
            "message": message,
            "response": "La création du rendez-vous a été annulée 🚫 . Si vous souhaitez en créer un autre, dites simplement : 'Je veux un rendez-vous'."
        }

    if message.lower() in ["je veux un rendez-vous", "je veux prendre rendez-vous"]:
        medecins = await db["medecins"].find().to_list(length=None)
        print(f"📋 Médécins récupérés: {len(medecins)}")

        if not medecins:
            return {"message": message, "response": "Aucun médecin disponible pour le moment."}

        liste = "\n".join([f"- {m['nom']} – {m['specialite']}" for m in medecins])
        await db["chat_temp"].update_one({"user_id": user_id}, {
            "$set": {"progress": "medecin", "data": {}}
        }, upsert=True)
        return {"message": message, "response": f"Très bien. Voici les médecins disponibles :\n{liste}\nQuel médecin choisissez-vous ?"}

    state = await db["chat_temp"].find_one({"user_id": user_id})
    print(f"📦 État trouvé pour {user_id}: {state}")

    if state and state.get("progress"):
        progress = state["progress"]
        data = state.get("data", {})
        print(f"🔁 Progression actuelle: {progress}")
        print(f"📌 Données temporaires: {data}")

        if progress == "medecin":
            med = await db["medecins"].find_one({"nom": {"$regex": message, "$options": "i"}})
            print(f"🔍 Médecin recherché: {message}")
            print(f"🔍 Résultat: {med}")
            if not med:
                return {"message": message, "response": "Médecin non trouvé. Veuillez réessayer."}
            await db["chat_temp"].update_one({"user_id": user_id}, {
                "$set": {
                    "progress": "date",
                    "data.medecin_id": str(med["user_id"]),
                    "data.medecin_nom": med["nom"]
                }
            })
            return {"message": message, "response": f"Pour quelle date souhaitez-vous un rendez-vous avec le Dr. {med['nom']} ? (ex: 2025-04-10)"}

        if progress == "date":
            try:
                date_obj = datetime.strptime(message, "%Y-%m-%d")
                jours = {
                    "monday": "lundi",
                    "tuesday": "mardi",
                    "wednesday": "mercredi",
                    "thursday": "jeudi",
                    "friday": "vendredi",
                    "saturday": "samedi",
                    "sunday": "dimanche"
                }
                jour = jours[date_obj.strftime("%A").lower()]
                medecin_id = data["medecin_id"]

                print(f"📆 Date saisie: {message} → Jour détecté: {jour}")
                print(f"🔗 Requête dans disponibilites: medecin_id = {medecin_id}, jour = {jour}")

                dispo = await db["disponibilites"].find_one({
                    "medecin_id": medecin_id,
                    "jour": jour
                })

                print(f"📂 Disponibilités récupérées: {dispo}")

                if not dispo or not dispo.get("heures"):
                    return {"message": message, "response": f"Le Dr. {data['medecin_nom']} n'est pas disponible ce jour-là. Choisissez une autre date."}

                await db["chat_temp"].update_one({"user_id": user_id}, {
                    "$set": {
                        "progress": "heure",
                        "data.date": message,
                        "data.jour": jour,
                        "data.heures_disponibles": dispo["heures"]
                    }
                })
                return {"message": message, "response": f"Heures disponibles le {message} : {', '.join(dispo['heures'])}\nQuelle heure préférez-vous ?"}
            except ValueError:
                return {"message": message, "response": "Format de date invalide. Utilisez AAAA-MM-JJ."}

        if progress == "heure":
            print(f"⏰ Heure reçue: {message}")
            print(f"⏰ Heures disponibles: {data.get('heures_disponibles')}")
            if message not in data.get("heures_disponibles", []):
                return {"message": message, "response": f"Heure non disponible. Choisissez parmi : {', '.join(data['heures_disponibles'])}"}
            await db["chat_temp"].update_one({"user_id": user_id}, {
                "$set": {"progress": "type", "data.heure": message}
            })
            return {"message": message, "response": "Quel type de consultation ? (Consultation générale, Examen de routine, Urgence)"}

        if progress == "type":
            print(f"📌 Type de consultation: {message}")
            await db["chat_temp"].update_one({"user_id": user_id}, {
                "$set": {"progress": "motif", "data.type": message}
            })
            return {"message": message, "response": "Quel est le motif de votre rendez-vous ?"}

        if progress == "motif":
            print(f"📝 Motif reçu: {message}")
            data["motif"] = message
            await db["chat_temp"].update_one({"user_id": user_id}, {
                "$set": {"progress": "confirmation", "pending_rdv": data}
            })
            summary = (
                f"🗓 Résumé :\n"
                f"👨‍⚕️ Médecin : Dr. {data['medecin_nom']}\n"
                f"📅 Date : {data['date']}\n"
                f"⏰ Heure : {data['heure']}\n"
                f"📋 Type : {data['type']}\n"
                f"📝 Motif : {data['motif']}\n\n"
                f"Souhaitez-vous confirmer ce rendez-vous ? (Répondez par 'oui')"
            )
            return {"message": message, "response": summary}

        if progress == "confirmation" and message.lower() in ["oui", "je confirme", "confirme"]:
            rdv = state.get("pending_rdv")
            print(f"✅ Insertion rendez-vous: {rdv}")
            new_rdv = {
                "date": rdv["date"],
                "heure": rdv["heure"],
                "type": rdv["type"],
                "motif": rdv["motif"],
                "medecin_id": rdv["medecin_id"],
                "patient_id": user_id,
                "statut": "En attente",
                "visite_faite": False,
                "created_at": datetime.utcnow()
            }
            await db["rendezvous"].insert_one(new_rdv)
            await db["chat_temp"].delete_one({"user_id": user_id})
            
            medecin = await db["medecins"].find_one({"user_id": rdv["medecin_id"]})
            contact_medecin = await db["contacts"].find_one({"user_id": rdv["medecin_id"]})
            contact_patient = await db["contacts"].find_one({"user_id": user_id})

            if contact_patient and contact_patient.get("email"):
                envoyer_notification_creation(
                    contact_patient["email"],
                    rdv["medecin_nom"],
                    rdv["date"],
                    rdv["heure"]
                )

            if contact_medecin and contact_medecin.get("email"):
                envoyer_notification_creation(
                    contact_medecin["email"],
                    rdv["medecin_nom"],
                    rdv["date"],
                    rdv["heure"]
                )
            return {"message": message, "response": f"🎉 Rendez-vous confirmé avec le Dr. {rdv['medecin_nom']} le {rdv['date']} à {rdv['heure']}."}

    print("🔄 Aucune progression en cours. Utilisation de OpenAI.")

    def call_openai():
        return openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Tu es Khodia, un assistant médical de la clinique Bienêtre. Réponds toujours en français."},
                {"role": "user", "content": message}
            ],
            max_tokens=500,
            temperature=0.7
        )

    fallback = await asyncio.to_thread(call_openai)

    response_text = fallback.choices[0].message.content.strip()
    await db["chat_history"].insert_one({"user_id": user_id, "message": message, "response": response_text})
    return {"message": message, "response": response_text}
