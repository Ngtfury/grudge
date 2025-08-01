from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

@app.get('/health')
async def root():
    return "Alive."


@app.post('/api/add-grudge')
async def add_grudge(target: str, grudge: str):
    return

