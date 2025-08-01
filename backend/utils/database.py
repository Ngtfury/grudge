from supabase import create_client, Client
from dotenv import load_dotenv
import os
load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def add_grudge(person, grudge, summary, score, refined):
    data = {
        "person": person,
        "grudge": grudge,
#        "author": author,
        "summary": summary,
        "score": score,
        "refined": refined

    }
    res = supabase.table("grudges").insert(data).execute()
    print("✅ Added:", res.data)


def get_grudges(person):
    res = supabase.table("grudges").select("*").eq("person", person).execute()
    if res.data:
        return [y for x,y in res.data[0].items()]
    else:
        return []                                                                                                                                                                                                                 

def get_score(person):
    res = supabase.table("grudges").select("score").eq("person", person).execute()
    if res.data:
        return res.data[0]['score']
    else:
        return 0

def get_scores():
    res = supabase.table("grudges").select("score").execute()
    if res.data:
        return [y['score'] for y in res.data]
    else:
        return []

