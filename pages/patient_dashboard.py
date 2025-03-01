#patient_dashboard
import streamlit as st

st.set_page_config(page_title="Tableau de bord - Patient", layout="wide")

# Vérifier si l'utilisateur est connecté
if "logged_in" not in st.session_state or not st.session_state["logged_in"]:
    st.warning("Veuillez vous connecter d'abord.")
    st.stop()

# Obtenir le nom de l'utilisateur depuis session_state
username = st.session_state.get("username", "Utilisateur")

# Barre latérale avec bouton de déconnexion
with st.sidebar:
    st.write(f"👤 Connecté en tant que : {username}")
    # Menu de navigation
    st.subheader("Menu")
    if st.button("🏠 Accueil"):
        st.switch_page("main.py")
    if st.button("📁 Historique Médical"):
        st.switch_page("pages/historique_medical.py")
    if st.button("📅 Rendez-vous"):
        st.switch_page("pages/rendez_vous.py")
    # Bouton de déconnexion en bas de la barre latérale
    st.markdown("---")
    if st.button("🔴 Déconnexion"):
        st.session_state.clear()
        st.success("Vous avez été déconnecté.")
        st.switch_page("pages/login.py")

st.title(f"🏥 Bienvenue, {username} !")
st.write("Ceci est votre tableau de bord.")

# Création de deux colonnes pour les sections principales
col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    <div style='padding: 20px; border-radius: 10px; border: 1px solid #ccc; margin: 10px;'>
        <h3>📁 Historique Médical</h3>
        <p>Accédez à votre historique médical et consultations précédentes.</p>
    </div>
    """, unsafe_allow_html=True)
    if st.button("Voir l'historique médical"):
        st.switch_page("pages/historique_medical.py")

with col2:
    st.markdown("""
    <div style='padding: 20px; border-radius: 10px; border: 1px solid #ccc; margin: 10px;'>
        <h3>📅 Rendez-vous</h3>
        <p>Consultez et gérez vos rendez-vous médicaux.</p>
    </div>
    """, unsafe_allow_html=True)
    if st.button("Gérer les rendez-vous"):
        st.switch_page("pages/rendez_vous.py")

# Résumé des informations importantes
st.subheader("📊 Résumé")
col1, col2, col3 = st.columns(3)

with col1:
    # Prochain rendez-vous
    st.metric(label="Prochain rendez-vous", value="28 Fév 2024")

with col2:
    # Dernière consultation
    st.metric(label="Dernière consultation", value="15 Jan 2024")

with col3:
    # Nombre total de consultations
    st.metric(label="Total consultations", value="8")