import streamlit as st
from utils.database import init_connection
import bcrypt
import cv2
import face_recognition
import numpy as np
from bson import ObjectId

st.set_page_config(page_title="Connexion", page_icon="🔐", layout="wide")

st.title("🔐 Connexion")

# Créer des colonnes pour centrer le formulaire
col1, col2, col3 = st.columns([1, 2, 1])

with col2:
    user_type = st.selectbox("Type d'utilisateur", ["Patient", "Médecin"])

    # Bouton pour la connexion avec reconnaissance faciale
    if st.button("Connexion avec reconnaissance faciale"):
        st.write("Démarrage de la caméra...")
        cap = cv2.VideoCapture(0)  # Démarrer la caméra
        success, frame = cap.read()
        cap.release()
        if success:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(frame)
            face_encodings = face_recognition.face_encodings(frame, face_locations)
            if face_encodings:
                user_found = None
                db, client = init_connection()
                collection = "UserPatients" if user_type == "Patient" else "UserMedecins"
                
                for user in db[collection].find():
                    if 'face_encoding' in user:
                        stored_encoding = np.array(user['face_encoding'])
                        matches = face_recognition.compare_faces([stored_encoding], face_encodings[0])
                        if matches[0]:  
                            user_found = user
                            break

                if user_found:
                    st.session_state['logged_in'] = True
                    st.session_state['username'] = user_found["username"]
                    st.session_state['user_type'] = user_type
                    st.session_state['user_id'] = str(user_found['_id'])

                    # Corrige la récupération de medecin_id
                    if user_type == "Médecin":
                        medecin = db["medecins"].find_one({"user_id": ObjectId(user_found["_id"])})
                        if medecin:
                            st.session_state['medecin_id'] = str(medecin["_id"])
                        else:
                            st.error("Médecin introuvable dans la base de données.")
                            st.stop()

                    st.success(f"Bienvenue, {user_found['username']}!")
                    if user_type == "Patient":
                        st.switch_page("pages/patient_dashboard.py")
                    else:
                        st.switch_page("pages/medecin_dashboard.py")
                else:
                    st.error("Visage non reconnu. Veuillez essayer à nouveau.")
            else:
                st.error("Aucun visage détecté.")
        else:
            st.error("Erreur lors de l'accès à la caméra.")

    st.markdown("---")
    st.markdown("Ou connectez-vous avec vos identifiants")
    
    with st.form("login_form"):
        username = st.text_input("Nom d'utilisateur")
        password = st.text_input("Mot de passe", type="password", key="login_password")
        submit = st.form_submit_button("Se connecter")
        
        if submit:
            # Nettoyer les espaces blancs éventuels
            username = username.strip()
            password = password.strip()

            db, client = init_connection()
            collection = "UserPatients" if user_type == "Patient" else "UserMedecins"

            user = db[collection].find_one({"username": username})

            if user:
                # Vérifier le mot de passe en utilisant bcrypt
                if bcrypt.checkpw(password.encode('utf-8'), user['password']):
                    st.session_state['logged_in'] = True
                    st.session_state['username'] = username
                    st.session_state['user_type'] = user_type
                    st.session_state['user_id'] = str(user['_id'])

                    # Corrige la récupération de medecin_id
                    if user_type == "Médecin":
                        medecin = db["medecins"].find_one({"user_id": ObjectId(user["_id"])})
                        if medecin:
                            st.session_state['medecin_id'] = str(medecin["_id"])
                        else:
                            st.error("Médecin introuvable dans la base de données.")
                            st.stop()

                    st.success(f"Bienvenue, {username}!")
                    if user_type == "Patient":
                        st.switch_page("pages/patient_dashboard.py")
                    else:
                        st.switch_page("pages/medecin_dashboard.py")
                else:
                    st.error("Mot de passe incorrect")
            else:
                st.error("Nom d'utilisateur incorrect")

    st.markdown("---")
    st.markdown("Vous n'avez pas de compte?")
    if st.button("Créer un compte"):
        st.switch_page("pages/register.py")
