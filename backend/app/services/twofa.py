import random
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage
from app.config import db

def envoyer_email_notification(to_email: str, sujet: str, contenu: str):
    msg = EmailMessage()
    msg["Subject"] = sujet
    msg["From"] = "bienetrecliniquem@gmail.com"
    msg["To"] = to_email
    msg.set_content(contenu)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login("bienetrecliniquem@gmail.com", "meha azok szuc hbwe")
            smtp.send_message(msg)
            print("✅ Email envoyé avec succès")
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi de l'email: {e}")
        raise

# ✅ Générer code 2FA
def generate_verification_code() -> str:
    return f"{random.randint(100000, 999999)}"

# ✅ Enviar code par email (2FA)
def send_verification_email(email: str, code: str):
    contenu = (
        f"Bonjour !\n\nVoici votre code de vérification : {code}"
        "\n\nCe code expirera dans 5 minutes.\n\nBien-Être+"
    )
    envoyer_email_notification(
        to_email=email,
        sujet="Code de vérification - Bien-Être+",
        contenu=contenu
    )

async def store_verification_code(user_id: str, code: str):
    expiration = datetime.utcnow() + timedelta(minutes=5)
    await db["codes2fa"].update_one(
        {"user_id": user_id},
        {"$set": {"code": code, "expires_at": expiration}},
        upsert=True
    )

async def verify_code(user_id: str, input_code: str) -> bool:
    doc = await db["codes2fa"].find_one({"user_id": user_id})
    if not doc:
        return False
    return (
        doc["code"] == input_code
        and datetime.utcnow() < doc["expires_at"]
    )
