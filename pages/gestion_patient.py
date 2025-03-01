import streamlit as st
import pandas as pd
from datetime import datetime

st.set_page_config(page_title="Gestion des Patients", layout="wide")

# Vérification de la connexion
if "logged_in" not in st.session_state or not st.session_state["logged_in"]:
    st.warning("Veuillez vous connecter d'abord.")
    st.stop()

# Initialiser les données des patients dans session_state si elles n'existent pas
if "patients" not in st.session_state:
    st.session_state.patients = []

st.title("👨‍⚕️ Gestion des Patients")

# Créer deux colonnes
col1, col2 = st.columns([2, 1])

with col2:
    st.subheader("Ajouter un nouveau patient")
    with st.form("nouveau_patient"):
        nom = st.text_input("Nom")
        prenom = st.text_input("Prénom")
        date_naissance = st.date_input("Date de naissance")
        sexe = st.selectbox("Sexe", ["Masculin", "Féminin"])
        telephone = st.text_input("Téléphone")
        email = st.text_input("Email")
        antecedents = st.text_area("Antécédents médicaux")
        
        if st.form_submit_button("Ajouter"):
            nouveau_patient = {
                "id": len(st.session_state.patients) + 1,
                "nom": nom,
                "prenom": prenom,
                "date_naissance": date_naissance.strftime("%Y-%m-%d"),
                "sexe": sexe,
                "telephone": telephone,
                "email": email,
                "antecedents": antecedents,
                "date_ajout": datetime.now().strftime("%Y-%m-%d")
            }
            st.session_state.patients.append(nouveau_patient)
            st.success("Patient ajouté avec succès!")

with col1:
    st.subheader("Liste des patients")
    
    # Barre de recherche
    recherche = st.text_input("Rechercher un patient (nom ou prénom)")
    
    # Filtrer les patients
    patients_filtres = st.session_state.patients
    if recherche:
        patients_filtres = [
            p for p in st.session_state.patients 
            if recherche.lower() in p["nom"].lower() or recherche.lower() in p["prenom"].lower()
        ]
    
    # Afficher les patients
    for patient in patients_filtres:
        with st.expander(f"{patient['nom']} {patient['prenom']} - ID: {patient['id']}"):
            st.write(f"**Date de naissance:** {patient['date_naissance']}")
            st.write(f"**Sexe:** {patient['sexe']}")
            st.write(f"**Téléphone:** {patient['telephone']}")
            st.write(f"**Email:** {patient['email']}")
            st.write("**Antécédents médicaux:**")
            st.write(patient['antecedents'])
            
            # Boutons d'action
            col1, col2 = st.columns(2)
            with col1:
                if st.button(f"📝 Modifier - {patient['id']}", key=f"mod_{patient['id']}"):
                    st.session_state.patient_a_modifier = patient['id']
            with col2:
                if st.button(f"🗑️ Supprimer - {patient['id']}", key=f"sup_{patient['id']}"):
                    st.session_state.patients.remove(patient)
                    st.success("Patient supprimé avec succès!")
                    st.rerun()