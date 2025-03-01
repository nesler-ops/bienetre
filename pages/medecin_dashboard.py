import streamlit as st

st.set_page_config(page_title="Tableau de bord - Médecin", layout="wide")

# Vérifier si l'utilisateur est connecté
if "logged_in" not in st.session_state or not st.session_state["logged_in"]:
    st.warning("Veuillez vous connecter d'abord.")
    st.stop()

# Obtenir le nom de l'utilisateur depuis session_state
username = st.session_state.get("username", "Utilisateur")

# Obtenir l'ID du médecin depuis session_state
medecin_id = st.session_state.get("medecin_id")
if not medecin_id:
    st.error("ID du médecin non trouvé dans la session.")
    st.stop()

# Barre latérale avec bouton de déconnexion et navigation
with st.sidebar:
    st.write(f"👤 Connecté en tant que : {username}")
    st.subheader("Menu")
    if st.button("📆 Gérer les Rendez-vous"):
        st.switch_page("pages/gestion_rendezvous.py")
    if st.button("📅 Accéder à l'Agenda"):
        st.switch_page("pages/agenda.py")
    st.markdown("---")
    if st.button("🔴 Déconnexion"):
        st.session_state.clear()
        st.success("Vous avez été déconnecté.")
        st.switch_page("pages/login.py")

st.title(f"🩺 Bienvenue, {username} !")
st.write("Ceci est votre tableau de bord.")

# Création de deux colonnes pour les sections principales
col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    <div style='padding: 20px; border-radius: 10px; border: 1px solid #ccc; margin: 10px;'>
        <h3>📆 Gérer les Rendez-vous</h3>
        <p>Accédez aux rendez-vous de vos patients et organisez votre planning.</p>
    </div>
    """, unsafe_allow_html=True)
    if st.button("Gérer les Rendez-vous"):
        st.switch_page("pages/gestion_rendezvous.py")

with col2:
    st.markdown("""
    <div style='padding: 20px; border-radius: 10px; border: 1px solid #ccc; margin: 10px;'>
        <h3>📅 Accéder à l'Agenda</h3>
        <p>Consultez et gérez votre emploi du temps médical.</p>
    </div>
    """, unsafe_allow_html=True)
    if st.button("Accéder à l'Agenda"):
        st.switch_page("pages/agenda.py")

# Résumé des informations importantes
st.subheader("📊 Résumé")
col1, col2, col3 = st.columns(3)

with col1:
    # Nombre total de patients suivis
    st.metric(label="Patients suivis", value="120")

with col2:
    # Rendez-vous du jour
    st.metric(label="Rendez-vous aujourd'hui", value="10")

with col3:
    # Disponibilité restante
    st.metric(label="Disponibilités restantes", value="3")
