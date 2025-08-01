from supabase import create_client, Client
from dotenv import load_dotenv
import os
load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def edit_grudge(person, grudge, score):
    res1 = get_grudges(person)
    favors = supabase.table("grudges").select("favours").eq("person", person).execute()
    res1.append(grudge)
    data = {
        "person": person,
        "grudges": res1,
        "score": score,
        "favours": favors.data[0]['favours'] if favors.data else [{}]

    }
    res = supabase.table("grudges").update(data).eq("person", person).execute()
    print("✅ Edited:", res.data)


def add_grudge(person, grudge, score):
    data = {
        "person": person,
        "grudges": [grudge],
        "score": score,
        "favours": [{}]

    }
    res = supabase.table("grudges").insert(data).execute()
    print("✅ Added:", res.data)


def get_grudges(person):
    res = supabase.table("grudges").select("*").eq("person", person).execute()
    if res.data:
        return res.data[0]['grudges']
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

print(get_grudges("Sreeram"))