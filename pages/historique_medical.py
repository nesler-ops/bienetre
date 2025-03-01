import streamlit as st
from datetime import datetime

st.set_page_config(page_title="Historique Médical", layout="wide")

# Vérifier si l'utilisateur est connecté
if "logged_in" not in st.session_state or not st.session_state["logged_in"]:
    st.warning("Veuillez vous connecter d'abord.")
    st.stop()

# Initialiser les données d'historique si elles n'existent pas
if "historique_medical" not in st.session_state:
    st.session_state.historique_medical = [
        {
            "date": "2024-02-15",
            "medecin": "Dr. Martin",
            "type": "Consultation générale",
            "diagnostic": "Rhume saisonnier",
            "prescriptions": "Paracétamol 1000mg\nSirop pour la toux",
            "notes": "Repos recommandé pendant 3 jours"
        },
        {
            "date": "2024-01-10",
            "medecin": "Dr. Bernard",
            "type": "Analyse de sang",
            "diagnostic": "Résultats normaux",
            "prescriptions": "Aucune",
            "notes": "Contrôle annuel satisfaisant"
        }
    ]

st.title("📁 Historique Médical")

# Filtres
col1, col2 = st.columns([2, 1])
with col1:
    search = st.text_input("🔍 Rechercher dans l'historique", "")
with col2:
    filter_type = st.selectbox(
        "Type de consultation",
        ["Tous", "Consultation générale", "Analyse de sang", "Spécialiste", "Urgence"]
    )

# Affichage de l'historique
st.subheader("Consultations et examens")

# Filtrer les données
historique_filtre = st.session_state.historique_medical
if search:
    historique_filtre = [
        h for h in historique_filtre
        if search.lower() in str(h).lower()
    ]
if filter_type != "Tous":
    historique_filtre = [
        h for h in historique_filtre
        if h["type"] == filter_type
    ]

# Afficher les consultations
for consultation in historique_filtre:
    with st.expander(f"📋 {consultation['date']} - {consultation['type']} - {consultation['medecin']}"):
        st.markdown(f"""
        **Date:** {consultation['date']}  
        **Médecin:** {consultation['medecin']}  
        **Type:** {consultation['type']}
        
        **Diagnostic:**  
        {consultation['diagnostic']}
        
        **Prescriptions:**  
        {consultation['prescriptions']}
        
        **Notes:**  
        {consultation['notes']}
        """)

# Statistiques
st.subheader("📊 Statistiques")
col1, col2, col3 = st.columns(3)

with col1:
    total_consultations = len(st.session_state.historique_medical)
    st.metric("Total des consultations", total_consultations)

with col2:
    types_consultations = {}
    for cons in st.session_state.historique_medical:
        types_consultations[cons['type']] = types_consultations.get(cons['type'], 0) + 1
    st.write("Types de consultations:")
    for type_cons, nombre in types_consultations.items():
        st.write(f"- {type_cons}: {nombre}")

with col3:
    derniere_consultation = max(st.session_state.historique_medical, key=lambda x: x['date'])
    st.write("Dernière consultation:")
    st.write(f"- Date: {derniere_consultation['date']}")
    st.write(f"- Médecin: {derniere_consultation['medecin']}")