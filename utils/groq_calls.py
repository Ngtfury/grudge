from groq import Groq
from dotenv import load_dotenv
import os
load_dotenv()

API_KEY = os.getenv("API_KEY")

client = Groq(
    api_key=API_KEY
)


def generate_refined_grudge(name, new_grudge, person_history: list, other_people_scores: list, current_score):
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

    return chat_completion.choices[0].message.content
