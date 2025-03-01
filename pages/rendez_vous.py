# RENDEZ-VOUS (Formulario del paciente para crear cita)
import streamlit as st
from datetime import datetime
from utils.database import init_connection  # Importar la función de conexión
from bson import ObjectId

# Conexión a MongoDB utilizando la función de utils/database.py
db, client = init_connection()

if db is None or client is None:
    st.error("No se pudo conectar a la base de datos.")
    st.session_state['db_connected'] = False
else:
    st.session_state['db_connected'] = True
    collection = db['rendezvous']  # Obtener la colección 'rendezvous'

st.set_page_config(page_title="Rendez-vous", layout="wide")

# Verificar si el usuario está conectado
if "logged_in" not in st.session_state or not st.session_state["logged_in"]:
    st.warning("Veuillez vous connecter d'abord.")
    st.stop()

st.title("📅 Gestion des Rendez-vous")

# Creación de dos columnas principales
col1, col2 = st.columns([2, 1])

with col2:
    st.subheader("Nouveau rendez-vous")
    with st.form("nouveau_rdv"):
        date_rdv = st.date_input(
            "Date souhaitée",
            min_value=datetime.now().date()
        )
        heure_rdv = st.time_input("Heure souhaitée")
        
        # Listado de médicos desde la base de datos
        medecins = list(db['medecins'].find())  # Obtener los médicos de la base de datos
        medecin_names = [medecin['nom'] for medecin in medecins]  # Extraer solo los nombres

        # Seleccionar el médico por nombre
        medecin_name = st.selectbox(
            "Médecin",
            medecin_names
        )
        
        # Buscar el ID del médico seleccionado
        medecin = next((medecin for medecin in medecins if medecin['nom'] == medecin_name), None)
        medecin_id = str(medecin['_id']) if medecin else None  # Obtener el ID del médico

        type_rdv = st.selectbox(
            "Type de consultation",
            ["Consultation générale", "Analyse de sangre", "Spécialiste", "Urgence"]
        )
        motif = st.text_area("Motif du rendez-vous")
        
        if st.form_submit_button("Demander un rendez-vous"):
            # Verificar si la fecha y hora ya están ocupadas
            date_str = date_rdv.strftime("%Y-%m-%d")
            heure_str = heure_rdv.strftime("%H:%M")
            
            existing_rdv = collection.find_one({
                "date": date_str,
                "heure": heure_str,
                "medecin_id": medecin_id  # Filtrar por ID del médico
            })
            
            if existing_rdv:
                st.error("Ce créneau horaire est déjà pris pour ce médecin. Veuillez choisir un autre horaire.")
            else:
                # Crear el nuevo rendez-vous y guardar el ID del médico
                nouveau_rdv = {
                    "date": date_str,
                    "heure": heure_str,
                    "medecin_id": medecin_id,  # Guardar el ID del médico
                    "type": type_rdv,
                    "motif": motif,
                    "statut": "En attente",
                    "patient_id": st.session_state.get("user_id"),  # ID del paciente
                    "created_at": datetime.now()
                }
                try:
                    collection.insert_one(nouveau_rdv)
                    st.success("Demande de rendez-vous envoyée!")
                except Exception as e:
                    st.error(f"Erreur lors de l'enregistrement du rendez-vous: {e}")

with col1:
    # Obtener todas las citas del usuario actual
    try:
        rendez_vous = list(collection.find(
            {"patient_id": st.session_state.get("user_id")}  # Filtrar por ID de paciente
        ).sort([("date", 1), ("heure", 1)]))  # Ordenar por fecha y hora
    except Exception as e:
        st.error(f"Erreur lors de la récupération des rendez-vous: {e}")
        rendez_vous = []

    if not rendez_vous:
        st.info("Vous n'avez pas encore de rendez-vous programmés. Utilisez le formulaire à droite pour en créer un.")
    else:
        # Filtros
        st.subheader("Mes rendez-vous")
        statut_filter = st.selectbox(
            "Filtrer par statut",
            ["Tous", "Confirmé", "En attente", "Annulé"]
        )
        
        # Filtrar los rendez-vous
        if statut_filter != "Tous":
            rendez_vous = [rdv for rdv in rendez_vous if rdv["statut"] == statut_filter]
        
        # Mostrar los rendez-vous
        for rdv in rendez_vous:
            # Obtener el nombre del médico desde su ID
            medecin = db['medecins'].find_one({"_id": ObjectId(rdv["medecin_id"])})
            medecin_name = medecin['nom'] if medecin else "Médecin inconnu"

            with st.expander(f"🕒 {rdv['date']} - {rdv['heure']} - {medecin_name}"):
                st.markdown(f"""
                **Date:** {rdv['date']} à {rdv['heure']}  
                **Médecin:** {medecin_name}  
                **Type:** {rdv['type']}  
                **Motif:** {rdv['motif']}  
                **Statut:** {rdv['statut']}
                """)
                
                if rdv["statut"] == "En attente":
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.button(f"✏️ Modifier - {rdv['_id']}", key=f"mod_{rdv['_id']}"):
                            st.session_state.rdv_a_modifier = rdv
                    with col2:
                        if st.button(f"❌ Annuler - {rdv['_id']}", key=f"ann_{rdv['_id']}"):
                            try:
                                collection.update_one(
                                    {"_id": rdv["_id"]},
                                    {"$set": {"statut": "Annulé"}}
                                )
                                st.success("Rendez-vous annulé!")
                                st.rerun()
                            except Exception as e:
                                st.error(f"Erreur lors de l'annulation du rendez-vous: {e}")

        # Estadísticas
st.subheader("📊 Aperçu")
col1, col2, col3 = st.columns(3)

with col1:
    rdv_a_venir = len([
        rdv for rdv in rendez_vous
        if rdv["date"] >= datetime.now().strftime("%Y-%m-%d") and rdv["statut"] != "Annulé"
    ])
    st.metric("Rendez-vous à venir", rdv_a_venir)

with col2:
    prochain_rdv = next(
        (rdv for rdv in rendez_vous 
        if rdv["date"] >= datetime.now().strftime("%Y-%m-%d") and rdv["statut"] != "Annulé"),
        None
    )
    if prochain_rdv:
        # Obtener el nombre del médico utilizando el medecin_id
        medecin = db['medecins'].find_one({"_id": ObjectId(prochain_rdv['medecin_id'])})
        medecin_name = medecin['nom'] if medecin else "Médecin inconnu"

        st.write("Prochain rendez-vous:")
        st.write(f"- {prochain_rdv['date']} à {prochain_rdv['heure']}")
        st.write(f"- {medecin_name}")  # Mostrar el nombre del médico

with col3:
    rdv_en_attente = len([
        rdv for rdv in rendez_vous
        if rdv["statut"] == "En attente"
    ])
    st.metric("En attente de confirmation", rdv_en_attente)
