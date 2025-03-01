import streamlit as st
from pymongo import MongoClient
from bson import ObjectId
from utils.database import init_connection
from datetime import datetime

# Conexión a MongoDB utilizando la función de utils/database.py
db, client = init_connection()

if db is None or client is None:
    st.error("No se pudo conectar a la base de datos.")
    st.session_state['db_connected'] = False
else:
    st.session_state['db_connected'] = True
    collection = db['rendezvous']  # Obtener la colección 'rendezvous'

st.set_page_config(page_title="Agenda", layout="wide")

# Vérifier si l'utilisateur est connecté
if "logged_in" not in st.session_state or not st.session_state["logged_in"]:
    st.warning("Veuillez vous connecter d'abord.")
    st.stop()

# Obtener el nombre del usuario desde session_state
username = st.session_state.get("username", "Médecin")

# Barra lateral con opciones de navegación
with st.sidebar:
    st.write(f"👤 Connecté en tant que : {username}")
    
    if st.button("📆 Gérer les Rendez-vous"):
        st.switch_page("pages/gestion_rendezvous.py")
    
    if st.button("📅 Accéder à l'Agenda"):
        st.switch_page("pages/agenda.py")
    
    if st.button("🔴 Déconnexion"):
        st.session_state.clear()
        st.success("Vous avez été déconnecté.")
        st.switch_page("pages/login.py")

# Título principal
st.title(f"🩺 Bienvenue, {username} !")
st.subheader("📅 Agenda")

# Obtener las citas del médico logueado
medecin_id = st.session_state.get("medecin_id")

if not medecin_id:
    st.error("ID du médecin non trouvé dans la session.")
    st.stop()

# Filtrar las citas del médico actual usando medecin_id como string
try:
    # Filtrar por fecha actual o futura
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    rendez_vous = list(collection.find({
        "medecin_id": medecin_id,  # Ya no convertimos a ObjectId
        "date": {"$gte": current_date}  # Solo mostrar citas desde hoy
    }).sort([("date", 1), ("heure", 1)]))  # Ordenar por fecha y hora
except Exception as e:
    st.error(f"Erreur lors de la récupération des rendez-vous: {e}")
    rendez_vous = []

if not rendez_vous:
    st.info("Aucune consultation à venir. Vous n'avez pas de rendez-vous programmés.")
else:
    # Agregamos filtros
    col1, col2 = st.columns(2)
    with col1:
        status_filter = st.selectbox(
            "Filtrer par statut",
            ["Tous", "En attente", "Confirmé", "Annulé"]
        )
    
    # Aplicar filtro de estado si se selecciona uno específico
    if status_filter != "Tous":
        rendez_vous = [rdv for rdv in rendez_vous if rdv["statut"] == status_filter]

    # Mostrar las citas de la agenda del médico
    for rdv in rendez_vous:
        with st.expander(f"🕒 {rdv['date']} - {rdv['heure']}"):
            try:
                # Obtener el nombre del paciente
                patient = db['patients'].find_one({"user_id": rdv['patient_id']})
                patient_name = patient['nom'] if patient else "Patient inconnu"
                
                # Mostrar detalles de la cita
                st.markdown(f"""
                **Patient:** {patient_name}  
                **Date:** {rdv['date']} à {rdv['heure']}  
                **Type:** {rdv['type']}  
                **Motif:** {rdv['motif']}  
                **Statut:** {rdv['statut']}
                """)
                
                if rdv["statut"] == "En attente":
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.button(f"✅ Confirmer", key=f"confirmer_{rdv['_id']}"):
                            try:
                                collection.update_one(
                                    {"_id": rdv["_id"]},
                                    {"$set": {"statut": "Confirmé"}}
                                )
                                st.success("Rendez-vous confirmé!")
                                st.rerun()
                            except Exception as e:
                                st.error(f"Erreur lors de la confirmation du rendez-vous: {e}")
                    with col2:
                        if st.button(f"❌ Annuler", key=f"annuler_{rdv['_id']}"):
                            try:
                                collection.update_one(
                                    {"_id": rdv["_id"]},
                                    {"$set": {"statut": "Annulé"}}
                                )
                                st.success("Rendez-vous annulé!")
                                st.rerun()
                            except Exception as e:
                                st.error(f"Erreur lors de l'annulation du rendez-vous: {e}")
            except Exception as e:
                st.error(f"Erreur lors de l'affichage du rendez-vous: {e}")