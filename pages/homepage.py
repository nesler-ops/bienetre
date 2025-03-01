import streamlit as st
import folium
from streamlit_folium import st_folium
import os

def load_css(css_file):
    """Carga el archivo CSS con codificación UTF-8"""
    with open(css_file, "r", encoding="utf-8") as f:  # Forzar lectura en UTF-8
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

def main():
    st.set_page_config(page_title="Cabinet Médical", page_icon="🩺", layout="centered")
    
    # Cargar CSS desde archivo externo
    css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "styles.css")
    load_css(css_path)  # Aplicar estilos CSS
    
    # Encabezado
    st.title("Bienvenue au Cabinet Médical")
    st.write("Votre santé est notre priorité. Gérez vos rendez-vous médicaux facilement et rapidement.")
    
    # Botones de navegación
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Se Connecter"):
            st.switch_page("pages/login.py")
    with col2:
        if st.button("S'inscrire"):
            st.switch_page("pages/register.py")
    
    # Sección de Servicios
    st.subheader("Nos Services")
    st.write("✔ Consultations médicales générales")
    st.write("✔ Spécialités médicales")
    st.write("✔ Examens de laboratoire")
    st.write("✔ Téléconsultation")
    st.write("✔ Suivi du dossier médical")
    
    # Mapa de los Centros Médicos
    st.subheader("Cabinets à Montréal")
    st.write("Découvrez cabinets à Montréal.")

    # Crear mapa con Folium
    map_montreal = folium.Map(location=[45.5017, -73.5673], zoom_start=12)

    # Agregar marcadores
    clinics = [
        {"name": "Clinique du Mont-Royal", "lat": 45.5070, "lon": -73.5878},
        {"name": "Clinique La Fontaine", "lat": 45.5253, "lon": -73.5662},
        {"name": "Clinique Jarry", "lat": 45.5382, "lon": -73.6202}
    ]

    for clinic in clinics:
        folium.Marker(
            location=[clinic["lat"], clinic["lon"]],
            popup=clinic["name"],
            icon=folium.Icon(color="blue", icon="plus", prefix="fa")
        ).add_to(map_montreal)

    # Mostrar mapa en Streamlit
    st_folium(map_montreal, width=700, height=500)

if __name__ == "__main__":
    main()
