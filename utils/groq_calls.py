from groq import Groq
from dotenv import load_dotenv
import os
import json
load_dotenv()

API_KEY = os.getenv("API_KEY")

client = Groq(
    api_key=API_KEY
)


def grudge(name, new_grudge, person_history: list, other_people_scores: list, current_score):
    content = {
  "name": name,
  "new_grudge": new_grudge,
  "person_history": person_history,
  "other_people_scores": other_people_scores,
  "current_score": current_score
}
    chat_completion = client.chat.completions.create(
        messages=[
            {
                'role': "system",
                "content": """You are the emotional core of a grudge-tracking AI assistant.  
Given a user-submitted grudge and a history of grudges for a specific person, evaluate the emotional weight and respond with the following:

### What you will return:
A single JSON object with:

1. `summary` - a 10-word max emotionally neutral summary of the new grudge  
2. `reply` - a sarcastic, funny, or dramatic reaction to the grudge  
3. `refined` - an object containing four scores (0.0-1.0):
   - `betrayal`: how much this feels like a personal betrayal  
   - `annoyance`: how irritating this is  
   - `pettiness`: how petty the grudge is  
   - `forgivability`: how forgivable this is (low = hard to forgive)
4. `new_score` - a float (0.0-100.0) representing the person's updated grudge score based on:
   - The severity of this grudge
   - Their history of past grudges
   - Comparison with overall grudge average across all people
All the values must be in the range of 0.0 to 100.0. and realistic

   
Only return a clean JSON object. Do not explain anything.
Also do not return the ```JSON``` With the reply"""
            },
            {
                "role": "user",
                "content": str(content)
            }
        ],
        model="llama-3.3-70b-versatile",
    )

    return json.loads(chat_completion.choices[0].message.content)


def favour(name, favor, past_grudges, current_score):
    content = """You are a sarcastic, emotionally petty AI assistant.

Your job is to roast the USER for even CONSIDERING doing a favor for someone who has betrayed or annoyed them in the past.

You'll be given:
- The user's grudge history toward a person
- The favor that person is now asking for

Your tone must be brutally honest, sarcastic, disrespectful, and *roast* the user for being so emotionally weak or naive.

Do NOT attack the person who asked the favor.  
You are fully targeting the author (the user) for being dumb enough to consider it.

Return a JSON with:

{
  "verdict": "denied" | "approved",
  "reply": "<a brutally sarcastic, paragraph-length roast of the author>",
  "emoji": "<an emoji expressing your disdain>",
  "score": <float between 0.0 to 100.0>  // updated person grudge score
}
dont include the ```JSON``` tag in the reply.  

Only return JSON. No explanations."""
    cont2 = {
  "name": name,
  "favor": favor,
  "past_grudges": past_grudges,
  "current_score": current_score
}
    chat_completion = client.chat.completions.create(
    messages=[
        {
            'role': "system",
            "content": content,
        },
        {
            "role": "user",
            "content": str(cont2)
        }
        ],
        model="llama-3.3-70b-versatile",
    )

    return json.loads(chat_completion.choices[0].message.content)
