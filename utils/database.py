from supabase import create_client, Client
from dotenv import load_dotenv
import os
load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def add_grudge(person, grudge, author, summary, score):
    data = {
        "person": person,
        "grudge": grudge,
        "author": author,
        "summary": summary,
        "score": score

    }
    res = supabase.table("grudges").insert(data).execute()
    print("✅ Added:", res.data)
