import smtplib
from email.message import EmailMessage
import logging
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EMAIL_SENDER = "bienetrecliniquem@gmail.com"
EMAIL_PASSWORD = "meha azok szuc hbwe"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465

def envoyer_email_notification(to_email: str, sujet: str, contenu: str) -> bool:
    print("📨 Enviando email:")
    print("Destinataire:", to_email)
    print("Sujet:", sujet)
    print("Contenu:", contenu)

    msg = EmailMessage()
    msg["Subject"] = sujet
    msg["From"] = EMAIL_SENDER
    msg["To"] = to_email
    msg.set_content(contenu)

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.login(EMAIL_SENDER, EMAIL_PASSWORD)
            smtp.send_message(msg)
            logger.info(f"✅ Correo enviado exitosamente a {to_email}")
            return True
    except smtplib.SMTPException as e:
        logger.error(f"❌ Error SMTP al enviar a {to_email}: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Error inesperado al enviar a {to_email}: {str(e)}")
    return False

# 📦 Notificaciones internas (push)
async def enregistrer_notification(user_id: str, titre: str, message: str, type_: str):
    notif = {
        "user_id": user_id,
        "titre": titre,
        "message": message,
        "type": type_,
        "lu": False,
        "created_at": datetime.utcnow(),
    }
    await db["notifications"].insert_one(notif)

# 📆 Email notification types
def envoyer_notification(type_: str, destinataire_email: str, nom_medecin: str, date: str, heure: str) -> bool:
    if type_ == "creation":
        sujet = "Creation de votre rendez-vous"
        contenu = (
            f"Bonjour,\n\nVotre rendez-vous avec le Dr. {nom_medecin} a été créé pour le {date} à {heure}.\n\n"
            "Merci de votre confiance.\n\n--\nBienÊtre Clinique"
        )
    elif type_ == "modification":
        sujet = "Mise à jour de votre rendez-vous"
        contenu = (
            f"Bonjour,\n\nVotre rendez-vous avec le Dr. {nom_medecin} a été modifié. Nouvelle date : {date} à {heure}.\n\n"
            "Merci de vérifier votre planning.\n\n--\nBienÊtre Clinique"
        )
    elif type_ == "annulation":
        sujet = "Annulation de votre rendez-vous"
        contenu = (
            f"Bonjour,\n\nVotre rendez-vous avec le Dr. {nom_medecin} prévu pour le {date} à {heure} a été annulé.\n\n"
            "Merci de nous contacter pour reprogrammer.\n\n--\nBienÊtre Clinique"
        )
    else:
        logger.error("Type de notification inconnu.")
        return False

    return envoyer_email_notification(destinataire_email, sujet, contenu)

# 🔀 Wrappers emails

def envoyer_notification_creation(email: str, nom_medecin: str, date: str, heure: str) -> bool:
    return envoyer_notification("creation", email, nom_medecin, date, heure)

def envoyer_notification_modification(email: str, nom_medecin: str, date: str, heure: str) -> bool:
    return envoyer_notification("modification", email, nom_medecin, date, heure)

def envoyer_notification_annulation(email: str, nom_medecin: str, date: str, heure: str) -> bool:
    return envoyer_notification("annulation", email, nom_medecin, date, heure)
