from fastapi import APIRouter, Depends, HTTPException
from app.routes.auth import get_current_user

router = APIRouter()

@router.get("/admin/dashboard")
async def admin_dashboard(user=Depends(get_current_user)):
    """Accès sécurisé au tableau de bord de l'administrateur"""
    if user["user_type"] != "Admin":
        raise HTTPException(status_code=403, detail="Accès refusé.")
    
    return {"message": "Bienvenue sur le tableau de bord administrateur", "admin": user}
