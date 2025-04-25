# 📄 app/routes/mental.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class PHQ9Request(BaseModel):
    scores: List[int]

@router.post("/phq9")
async def evaluer_phq9(data: PHQ9Request):
    total = sum(data.scores)

    if total <= 4:
        niveau = "léger"
    elif total <= 9:
        niveau = "modéré"
    else:
        niveau = "sévère"

    return {"total": total, "niveau": niveau, "resultat": f"Score PHQ-9 : {total}/27 — Niveau {niveau}"}
