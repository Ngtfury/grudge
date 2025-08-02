from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import utils.groq_calls as groq_c
import utils.database as database
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import datetime

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FavourRequest(BaseModel):
    target: str
    favour: str

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
        other_people_scores=database.get_scores(),  
        current_score=database.get_score(person) 
    )

    tdy = datetime.datetime.today()
    created_at = tdy.strftime("%d/%m/%Y")
    j_grudge = {
        'summary': gres['summary'],
        'refined': gres['refined'],
        'created_at': created_at,
        "grudge": grudge,
    }
    if database.get_grudges(person):
        database.edit_grudge(
            person=person,
            grudge=j_grudge,
            score=gres['new_score'],
        )
    else:
        database.add_grudge(
            person=person,
            grudge=j_grudge,
            score=gres['new_score'],
        )
    return gres

@app.get('/api/get-grudges/{person}')
async def get_grudges(person: str):
    grudges = database.get_grudges(person)
    if not grudges:
        raise HTTPException(status_code=404, detail="No grudges found for this person.")
    return grudges

@app.post('/api/add-favour')
async def add_favour(favour_req: FavourRequest):
    person = favour_req.target.title()
    favour = favour_req.favour
    past_grudges = database.get_grudges(person)
    current_score = database.get_score(person)

    gres = groq_c.favour(
        name=person,
        favor=favour,
        past_grudges=past_grudges,
        current_score=current_score
    )

    tdy = datetime.datetime.today()
    created_at = tdy.strftime("%d/%m/%Y")
    j_favour = {
        'verdict': gres['verdict'],
        'emoji': gres['emoji'],
        'created_at': created_at,
        "favour": favour,
        "score": gres['score'],
    }
    
    database.edit_favour(
        person=person,
        favour=j_favour
    )
    print(gres)
    return gres

@app.get('/api/get-people')
async def get_people():
    people = database.get_people()
    if not people:
        raise HTTPException(status_code=404, detail="No people found.")
    return people


@app.get('/api/get-score/{person}')
async def get_score(person: str):
    score = database.get_score(person.title())
    if score is None:
        raise HTTPException(status_code=404, detail="No score found for this person.")
    return {"person": person.title(), "score": score}

@app.get('/api/leaderboard')
async def get_leaderboard():
    leaderboard = database.get_leaderboard()
    if not leaderboard:
        raise HTTPException(status_code=404, detail="No leaderboard data found.")
    return leaderboard