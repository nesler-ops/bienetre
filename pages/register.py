#RegisterLastVerision
import streamlit as st
from utils.database import init_connection
from datetime import datetime
import bcrypt
import cv2
import numpy as np
import face_recognition

# Fonction pour hasher les mots de passe
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Étape 1: Enregistrer les informations de base de l'utilisateur
def show_registration_form():
    st.set_page_config(page_title="Enregistrement de l'utilisateur", layout="centered")

    st.title("📝 Enregistrement de l'utilisateur")

    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        user_type = st.selectbox("Type d'utilisateur", ["Patient", "Médecin"])
        st.write(f"Type d'utilisateur sélectionné: {user_type}")  # Vérification

        # Initialiser 'user_type' dans session_state
        st.session_state['user_type'] = user_type

        with st.form("register_form"):
            username = st.text_input("Nom d'utilisateur")
            password = st.text_input("Mot de passe", type="password")
            confirm_password = st.text_input("Confirmer le mot de passe", type="password")

            if user_type == "Patient":
                numero_assurance = st.text_input("Numéro d'assurance (Identifiant)")
            else:
                matricule = st.text_input("Matricule")

            submit = st.form_submit_button("Suivant")

            if submit:
                if password != confirm_password:
                    st.error("Les mots de passe ne correspondent pas")
                elif len(password) < 8:
                    st.error("Le mot de passe doit contenir au moins 8 caractères")
                else:
                    db, client = init_connection()
                    try:
                        collection = "UserPatients" if user_type == "Patient" else "UserMedecins"
                        existing_user = db[collection].find_one({"username": username})
                        if existing_user is not None:
                            st.error("Ce nom d'utilisateur existe déjà")
                        else:
                            st.session_state['temp_username'] = username
                            st.session_state['temp_password'] = password
                            if user_type == "Patient":
                                st.session_state['temp_numero_assurance'] = numero_assurance
                            else:
                                st.session_state['temp_matricule'] = matricule
                            st.session_state['step'] = 1.5  # Étape intermédiaire pour la capture faciale
                            st.rerun()

                    except Exception as e:
                        st.error(f"Erreur lors de l'enregistrement de l'utilisateur : {str(e)}")
    return False

# Nouvelle étape intermédiaire: Capture du visage
def show_face_capture():
    st.subheader("Capture du visage")
    if st.button("Capturer votre visage"):
        st.write("Démarrage de la caméra...")

        cap = cv2.VideoCapture(0)
      
        success, frame = cap.read()
        cap.release()
        
        if success:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(frame)
            face_encodings = face_recognition.face_encodings(frame, face_locations)
            
            if face_encodings:
                db, client = init_connection()
                collection = "UserPatients" if st.session_state['user_type'] == "Patient" else "UserMedecins"
                
                hashed_password = hash_password(st.session_state['temp_password'])
                user_data = {
                    "username": st.session_state['temp_username'],
                    "password": hashed_password,
                    "face_encoding": face_encodings[0].tolist(),
                    "date_creation": datetime.now()
                }
                
                if st.session_state['user_type'] == "Patient":
                    user_data["numero_assurance"] = st.session_state['temp_numero_assurance']
                else:
                    user_data["matricule"] = st.session_state['temp_matricule']
                
                result = db[collection].insert_one(user_data)
                if result.inserted_id:
                    st.session_state['user_id'] = result.inserted_id
                    st.session_state['step'] = 2
                    st.success("Visage capturé avec succès!")
                    st.rerun()
            else:
                st.error("Aucun visage détecté. Veuillez réessayer.")
        else:
            st.error("Erreur lors de l'accès à la caméra.")

# Étape 2: Afficher le formulaire de détails pour le patient ou le médecin
def show_user_details_form(user_id):
    if st.session_state['user_type'] == "Patient":
        return show_patient_details_form(user_id)
    else:
        return show_medecin_details_form(user_id)

# Étape 2A: Afficher le formulaire de détails du patient
def show_patient_details_form(user_id):
    st.write("Formulaire de détails du patient")  # Vérification
    with st.form("patient_details_form"):
        st.subheader("Informations personnelles")

        col1, col2 = st.columns(2)
        with col1:
            nom = st.text_input("Nom")
            prenom = st.text_input("Prénom")
            date_naissance = st.date_input("Date de naissance")

        with col2:
            pays_naissance = st.text_input("Pays de naissance")
            genre = st.selectbox("Genre", ["Masculin", "Féminin", "Autre"])
            numero_assurance = st.text_input("Numéro d'assurance")

        submit = st.form_submit_button("Compléter l'enregistrement")

        if submit:
            if not all([nom, prenom, numero_assurance]):
                st.error("Veuillez compléter tous les champs obligatoires")
            else:
                db, client = init_connection()
                try:
                    patient_data = {
                        "user_id": user_id,
                        "nom": nom,
                        "prenom": prenom,
                        "numero_assurance": numero_assurance,
                        "date_naissance": str(date_naissance),
                        "pays_naissance": pays_naissance,
                        "genre": genre,
                        "date_creation": datetime.now()
                    }

                    result = db.patients.insert_one(patient_data)
                    if result.inserted_id:
                        st.success("Enregistrement complété avec succès !")
                        st.session_state['step'] = 3  # Étape 3: Rediriger vers la page du tableau de bord
                        st.rerun()  # Recharger la page pour afficher l'étape suivante

                except Exception as e:
                    st.error(f"Erreur lors de l'enregistrement des données du patient : {str(e)}")

    return False

# Étape 2B: Afficher le formulaire de détails du médecin
def show_medecin_details_form(user_id):
    st.write("Formulaire de détails du médecin")  # Vérification
    with st.form("medecin_details_form"):
        st.subheader("Informations professionnelles")

        col1, col2 = st.columns(2)
        with col1:
            nom = st.text_input("Nom")
            prenom = st.text_input("Prénom")
            date_naissance = st.date_input("Date de naissance")

        with col2:
            pays_naissance = st.text_input("Pays de naissance")
            genre = st.selectbox("Genre", ["Masculin", "Féminin", "Autre"])
            specialite = st.text_input("Spécialité")
            matricule = st.text_input("Matricule")

        submit = st.form_submit_button("Compléter l'enregistrement")

        if submit:
            if not all([nom, prenom, specialite, matricule]):
                st.error("Veuillez compléter tous les champs obligatoires")
            else:
                db, client = init_connection()
                try:
                    medecin_data = {
                        "user_id": user_id,
                        "nom": nom,
                        "prenom": prenom,
                        "specialite": specialite,
                        "matricule": matricule,
                        "date_naissance": str(date_naissance),
                        "pays_naissance": pays_naissance,
                        "genre": genre,
                        "date_creation": datetime.now()
                    }

                    result = db.medecins.insert_one(medecin_data)
                    if result.inserted_id:
                        st.success("Enregistrement du médecin complété avec succès !")
                        st.session_state['step'] = 3  # Étape 3: Rediriger vers la page du tableau de bord
                        st.rerun()  # Recharger la page pour afficher l'étape suivante

                except Exception as e:
                    st.error(f"Erreur lors de l'enregistrement des données du médecin : {str(e)}")

    return False

# Étape 3: Rediriger vers le tableau de bord
def redirect_to_dashboard():
    if 'step' in st.session_state and st.session_state['step'] == 3:
        if st.session_state['user_type'] == "Patient":
            st.switch_page("pages/patient_dashboard.py")  # Rediriger vers la page du patient
        else:
            st.switch_page("pages/medecin_dashboard.py")  # Rediriger vers la page du médecin

# Contrôle du flux des étapes
def control_flow():
    if 'step' not in st.session_state:
        st.session_state['step'] = 1  # Commencer avec l'étape 1 (enregistrement de l'utilisateur)

    if st.session_state['step'] == 1:
        if show_registration_form():
            st.session_state['step'] = 1.5  # Rediriger vers l'étape de capture faciale
    elif st.session_state['step'] == 1.5:
        show_face_capture()
    elif st.session_state['step'] == 2:
        show_user_details_form(st.session_state['user_id'])
    elif st.session_state['step'] == 3:
        redirect_to_dashboard()

# Lancer le contrôle du flux des étapes
if __name__ == "__main__":
    control_flow()
