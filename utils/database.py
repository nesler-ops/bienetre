#database.py
from pymongo import MongoClient
import streamlit as st

def init_connection():
    try:
        client = MongoClient("mongodb://localhost:27017")
        db = client["bienetre"]
        # Créer des index uniques s'ils n'existent pas
        db.UserPatients.create_index("username", unique=True)
        db.UserMedecins.create_index("username", unique=True)
        db.patients.create_index("numero_assurance", unique=True)
        db.medecins.create_index("matricule", unique=True)
        return db, client
    except Exception as e:
        st.error(f"Erreur de connexion à MongoDB : {e}")
        return None, None
