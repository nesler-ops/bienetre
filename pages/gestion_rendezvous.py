import streamlit as st
from utils.database import init_connection
from bson import ObjectId
from datetime import datetime

st.set_page_config(page_title="Gestion des Rendez-vous", layout="wide")

# Vérification de connexion
if "logged_in" not in st.session_state or not st.session_state["logged_in"]:
    st.warning("Veuillez vous connecter d'abord.")
    st.stop()

# Vérification du type d'utilisateur
if st.session_state.get("user_type") != "Médecin":
    st.error("Seuls les médecins peuvent accéder à cette page.")
    st.stop()

# Vérifier si 'medecin_id' est disponible
if "medecin_id" not in st.session_state:
    st.error("Médecin introuvable.")
    st.stop()

medecin_id = st.session_state["medecin_id"]
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
st.title("📅 Gestion des Rendez-vous")

# Connexion à la base de données
db, client = init_connection()

try:
    # Filtros en la parte superior
    col1, col2, col3 = st.columns(3)
    
    with col1:
        status_filter = st.selectbox(
            "Filtrer par statut",
            ["Tous", "En attente", "Confirmé", "Annulé"]
        )
    
    with col2:
        date_filter = st.date_input(
            "Filtrer par date",
            value=datetime.now().date()
        )
    
    with col3:
        show_all_dates = st.checkbox("Afficher toutes les dates", value=False)

    # Construir el filtro base
    filter_query = {"medecin_id": medecin_id}
    
    # Aplicar filtro de estado
    if status_filter != "Tous":
        filter_query["statut"] = status_filter
    
    # Aplicar filtro de fecha
    if not show_all_dates:
        filter_query["date"] = date_filter.strftime("%Y-%m-%d")

    # Recuperar las citas con los filtros aplicados
    rendezvous = list(db["rendezvous"].find(filter_query).sort([("date", 1), ("heure", 1)]))

    if not rendezvous:
        st.info("Aucun rendez-vous trouvé pour les critères sélectionnés.")
    else:
        # Mostrar estadísticas
        total_rdv = len(rendezvous)
        rdv_en_attente = len([rdv for rdv in rendezvous if rdv.get("statut") == "En attente"])
        rdv_confirmes = len([rdv for rdv in rendezvous if rdv.get("statut") == "Confirmé"])
        
        st.subheader("📊 Statistiques")
        col1, col2, col3 = st.columns(3)
        col1.metric("Total rendez-vous", total_rdv)
        col2.metric("En attente", rdv_en_attente)
        col3.metric("Confirmés", rdv_confirmes)
        
        st.subheader("📅 Liste des Rendez-vous")
        
        # Mostrar las citas
        for rdv in rendezvous:
            with st.expander(f"🕒 {rdv.get('date')} - {rdv.get('heure', 'Heure non spécifiée')}"):
                try:
                    # Obtener información del paciente
                    patient = db['patients'].find_one({"user_id": rdv.get('patient_id')})
                    patient_name = patient['nom'] if patient else "Patient inconnu"
                    
                    # Mostrar detalles de la cita
                    st.markdown(f"""
                    **Patient:** {patient_name}  
                    **Date:** {rdv.get('date')} à {rdv.get('heure', 'Heure non spécifiée')}  
                    **Type:** {rdv.get('type', 'Non spécifié')}  
                    **Motif:** {rdv.get('motif', 'Non spécifié')}  
                    **Statut:** {rdv.get('statut', 'Non spécifié')}
                    """)
                    
                    # Mostrar botones de acción según el estado
                    if rdv.get("statut") == "En attente":
                        col1, col2 = st.columns(2)
                        with col1:
                            if st.button(f"✅ Confirmer", key=f"conf_{rdv['_id']}"):
                                db["rendezvous"].update_one(
                                    {"_id": rdv["_id"]},
                                    {"$set": {"statut": "Confirmé"}}
                                )
                                st.success("Rendez-vous confirmé!")
                                st.rerun()
                        with col2:
                            if st.button(f"❌ Annuler", key=f"ann_{rdv['_id']}"):
                                db["rendezvous"].update_one(
                                    {"_id": rdv["_id"]},
                                    {"$set": {"statut": "Annulé"}}
                                )
                                st.success("Rendez-vous annulé!")
                                st.rerun()
                    
                    # Agregar notas o comentarios
                    new_note = st.text_area(
                        "Ajouter une note",
                        key=f"note_{rdv['_id']}",
                        value=rdv.get('notes', '')
                    )
                    if st.button("💾 Sauvegarder la note", key=f"save_{rdv['_id']}"):
                        db["rendezvous"].update_one(
                            {"_id": rdv["_id"]},
                            {"$set": {"notes": new_note}}
                        )
                        st.success("Note sauvegardée!")
                        
                except Exception as e:
                    st.error(f"Erreur lors de l'affichage du rendez-vous: {e}")

except Exception as e:
    st.error(f"Erreur lors de la récupération des rendez-vous : {e}")