import streamlit as st

st.set_page_config(
    page_title="Bien-être - Gestion de Santé",
    page_icon="🏥",
    layout="wide"
)

# Initialiser la session
if 'logged_in' not in st.session_state:
    st.session_state['logged_in'] = False

def main():
    if not st.session_state['logged_in']:
        st.switch_page("pages/homepage.py")  # Redirige vers la page de connexion

if __name__ == "__main__":
    main()
