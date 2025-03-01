#sidebar.py
import streamlit as st

def show_sidebar():
    with st.sidebar:
        st.title("Menu")
        selected = st.selectbox(
            "Navegación",
            ["🏠 Accueil", "👥 Patients", "👨‍⚕️ Médecins", "📝 Messages", "📋 Visites"]
        )
        return selected