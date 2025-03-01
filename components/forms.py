#forms.py
import streamlit as st

def patient_form(db):
    if db is not None:  # Contrôle de sécurité supplémentaire
        with st.form("form_patient"):
            col1, col2 = st.columns(2)
            
            with col1:
                nom = st.text_input("Nom")
                prenom = st.text_input("Prénom")
                numero_assurance = st.text_input("Numéro d'assurance")
            
            with col2:
                date_naissance = st.date_input("Date de naissance")
                pays_naissance = st.text_input("Pays de naissance")
                genre = st.selectbox("Genre", ["Masculin", "Féminin", "Autre"])
            
            submit_button = st.form_submit_button("Ajouter Patient")

            if submit_button:
                data = {
                    "nom": nom,
                    "prenom": prenom,
                    "numero_assurance": numero_assurance,
                    "date_naissance": str(date_naissance),
                    "pays_naissance": pays_naissance,
                    "genre": genre
                }
                try:
                    db.patients.insert_one(data)
                    st.success(f"✅ Patient {prenom} {nom} ajouté avec succès !")
                except Exception as e:
                    st.error(f"Erreur lors de la sauvegarde du patient: {str(e)}")