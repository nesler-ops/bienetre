import streamlit as st
from pymongo import MongoClient

# Conexión a MongoDB
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["bienetre"]  # Nombre de la base de datos

# Seleccionar colección
coleccion = st.sidebar.selectbox("Sélectionnez une collection", ["Patients", "Médecins", "Messages", "Contacts", "Adresses", "Visites", "Antécédents"])

st.title(f"📋 Formulaire de {coleccion}")

# Formulario según la colección seleccionada
if coleccion == "Patients":
    with st.form("form_patient"):
        nom = st.text_input("Nom")
        prenom = st.text_input("Prénom")
        numero_assurance = st.text_input("Numéro d'assurance")
        date_naissance = st.date_input("Date de naissance")
        pays_naissance = st.text_input("Pays de naissance")
        genre = st.selectbox("Genre", ["Masculin", "Féminin", "Autre"])
        submit_button = st.form_submit_button("Ajouter Patient")

    if submit_button:
        data = {
            "nom": nom, "prenom": prenom, "numero_assurance": numero_assurance,
            "date_naissance": str(date_naissance), "pays_naissance": pays_naissance, "genre": genre
        }
        db.patients.insert_one(data)
        st.success(f"✅ Patient {prenom} {nom} ajouté avec succès !")

elif coleccion == "Médecins":
    with st.form("form_medecin"):
        nom = st.text_input("Nom")
        prenom = st.text_input("Prénom")
        specialite = st.text_input("Spécialité")
        matricule = st.text_input("Matricule")
        date_naissance = st.date_input("Date de naissance")
        pays_naissance = st.text_input("Pays de naissance")
        genre = st.selectbox("Genre", ["Masculin", "Féminin", "Autre"])
        submit_button = st.form_submit_button("Ajouter Médecin")

    if submit_button:
        data = {
            "nom": nom, "prenom": prenom, "specialite": specialite, "matricule": matricule,
            "date_naissance": str(date_naissance), "pays_naissance": pays_naissance, "genre": genre
        }
        db.medecins.insert_one(data)
        st.success(f"✅ Médecin {prenom} {nom} ajouté avec succès !")

elif coleccion == "Messages":
    with st.form("form_message"):
        message = st.text_area("Message")
        submit_button = st.form_submit_button("Ajouter Message")

    if submit_button:
        data = {"message": message}
        db.messages.insert_one(data)
        st.success("✅ Message ajouté avec succès !")

elif coleccion == "Contacts":
    with st.form("form_contact"):
        telephone = st.text_input("Téléphone")
        email = st.text_input("Email")
        submit_button = st.form_submit_button("Ajouter Contact")

    if submit_button:
        data = {"telephone": telephone, "email": email}
        db.contacts.insert_one(data)
        st.success("✅ Contact ajouté avec succès !")

elif coleccion == "Adresses":
    with st.form("form_adresse"):
        numero = st.text_input("Numéro")
        rue = st.text_input("Rue")
        code_postal = st.text_input("Code Postal")
        ville = st.text_input("Ville")
        province = st.text_input("Province")
        pays = st.text_input("Pays")
        submit_button = st.form_submit_button("Ajouter Adresse")

    if submit_button:
        data = {"numero": numero, "rue": rue, "code_postal": code_postal, "ville": ville, "province": province, "pays": pays}
        db.adresses.insert_one(data)
        st.success("✅ Adresse ajoutée avec succès !")

elif coleccion == "Visites":
    with st.form("form_visite"):
        diagnostique = st.text_area("Diagnostique")
        traitement = st.text_area("Traitement")
        medecin_traitant = st.text_input("Médecin traitant")
        debut_maladie = st.date_input("Début de la maladie")
        fin_maladie = st.date_input("Fin de la maladie")
        submit_button = st.form_submit_button("Ajouter Visite")

    if submit_button:
        data = {
            "diagnostique": diagnostique, "traitement": traitement, "medecin_traitant": medecin_traitant,
            "debut_maladie": str(debut_maladie), "fin_maladie": str(fin_maladie)
        }
        db.visites.insert_one(data)
        st.success("✅ Visite ajoutée avec succès !")

elif coleccion == "Antécédents":
    with st.form("form_antecedent"):
        etablissement = st.text_input("Établissement")
        medecin = st.text_input("Médecin")
        date_de_visite = st.date_input("Date de visite")
        diagnostique = st.text_area("Diagnostique")
        traitement = st.text_area("Traitement")
        resume = st.text_area("Résumé")
        notes = st.text_area("Notes")
        submit_button = st.form_submit_button("Ajouter Antécédent")

    if submit_button:
        data = {
            "etablissement": etablissement, "medecin": medecin, "date_de_visite": str(date_de_visite),
            "diagnostique": diagnostique, "traitement": traitement, "resume": resume, "notes": notes
        }
        db.antecedents.insert_one(data)
        st.success("✅ Antécédent ajouté avec succès !")
