from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import utils.groq_calls as groq_c
import utils.database as database
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GrudgeRequest(BaseModel):
    target: str
    grudge: str

@app.get('/health')
async def root():
    return "Alive."


@app.post('/api/add-grudge')
async def add_grudge(grudge_req: GrudgeRequest):
    person=grudge_req.target.title()
    grudge=grudge_req.grudge
    gres = groq_c.grudge(
        name=person,
        new_grudge=grudge,
        person_history=database.get_grudges(person),
        other_people_scores=database.get_scores(),  # Placeholder, can be extended later
        current_score=database.get_score(person)  # Placeholder, can be extended later
    )

    database.add_grudge(
        person=person,
        grudge=grudge,
        summary=gres['summary'],
        score=gres['new_score'],
        refined=gres['refined']
    )
    return gres

@app.get('/api/get-grudges/{person}')
async def get_grudges(person: str):
    grudges = database.get_grudges(person)
    if not grudges:
        raise HTTPException(status_code=404, detail="No grudges found for this person.")
    return grudges
