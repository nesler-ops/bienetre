import streamlit as st
from pymongo import MongoClient

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["bienetre"]
users_collection = db["users"]

# Interface Streamlit
st.title("🔐 Connexion")

# Formulaire de connexion
username = st.text_input("Nom d'utilisateur", placeholder="Entrez votre nom d'utilisateur")
password = st.text_input("Mot de passe", placeholder="Entrez votre mot de passe", type="password")

if st.button("Se connecter"):
    # Vérifier les identifiants dans MongoDB
    user = users_collection.find_one({"username": username, "password": password})
    
    if user:
        st.success(f"✅ Connexion réussie ! Bienvenue, {username} !")
    else:
        st.error("⚠️ Nom d'utilisateur ou mot de passe incorrect.")
