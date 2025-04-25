from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, medecins, usermedecins, rendezvous, patients, userpatients, facial, admin
from app.routes.chatbot import router as chatbot_router
from app.routes.adresses import router as adresses_router  
from app.routes.contacts import router as contacts_router  
from app.routes import visites
from app.routes import allergies
from app.routes import disponibilites
from app.routes import mental 
from app.routes import assistant_ia
from app.routes import dossiersmedicaux



app = FastAPI(
    title="BienEtre API",
    description="API pour l'authentification et la gestion des patients et des médecins",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

origines = [
    "http://localhost:5173",  # Frontend en localhost
    "http://127.0.0.1:5173",  # Frontend en IP local
    "http://localhost:8000",  # Backend en localhost
    "http://127.0.0.1:8000",  # Backend en IP local
    "http://localhost"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origines,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentification"])
app.include_router(medecins.router, prefix="/medecins", tags=["Médecins"])
app.include_router(rendezvous.router, prefix="/rendezvous", tags=["Rendez-vous"])
app.include_router(patients.router, prefix="/patients", tags=["Patients"])
app.include_router(userpatients.router, prefix="/userpatients", tags=["Utilisateurs Patients"])
app.include_router(facial.router, prefix="/facial", tags=["Reconnaissance Faciale"])
app.include_router(admin.router, prefix="/admin", tags=["Administrateurs"])
app.include_router(chatbot_router, prefix="/api", tags=["Chatbox"])
app.include_router(adresses_router, prefix="/adresses", tags=["Adresses"])  
app.include_router(contacts_router, prefix="/contacts", tags=["Contacts"])  
app.include_router(usermedecins.router,prefix="/usermedecins" ,tags=["Utilisateurs Medecins"])
app.include_router(visites.router, prefix="/visites", tags= ["Visites"])
app.include_router(allergies.router, prefix="/allergies",tags=["allergies"])
app.include_router(disponibilites.router, prefix="/disponibilites")
app.include_router(mental.router, prefix="/mental", tags=["Santé mentale"])
app.include_router(assistant_ia.router)
app.include_router(dossiersmedicaux.router, prefix="/dossiersmedicaux", tags=["Dossiers médicaux"])



from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Montar carpeta estática
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Ruta para acceder directamente al HTML del PHQ-9
@app.get("/phq9")
async def get_phq9_form():
    file_path = os.path.join("app", "static", "mental.html")
    return FileResponse(file_path, media_type="text/html")



import httpx
from fastapi import Request, HTTPException

@app.post("/mental/phq9")
async def proxy_phq9(request: Request):
    try:
        payload = await request.json()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://screening.mhanational.org/api/v1/phq9/",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )

        return response.json()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API BienEtre"}
