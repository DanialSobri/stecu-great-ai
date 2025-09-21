from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import boto3
import json
import re
import os

app = FastAPI()

# You may want to use environment variables for credentials in production
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

client = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

model_id = "openai.gpt-oss-120b-1:0"

class TranscriptionRequest(BaseModel):
    transcription: str

@app.post("/summarize")
def summarize(req: TranscriptionRequest):
    prompt = f"""
    you are the assistant to create the accident incident summary, keep it short and precise and informative. 
    Use the following format for your response:
    <incident_overview>...</incident_overview>
    <key_observation>...</key_observation>

    This is the incident details:
    Description of the Van Accident Scene
    - The van’s front end is heavily damaged — the bumper torn off, headlights shattered, and the hood crumpled inward.
    - The windshield is cracked in multiple places, with glass fragments scattered across the asphalt.
    - Airbags inside the van are deployed, and the steering wheel is bent slightly from the force of the impact.
    - There are fluids leaking beneath the van, likely coolant or oil, creating a dark puddle on the road.
    - The van is immobilized across the lane, blocking traffic, with skid marks visible leading up to the point of collision.

    This is the transcription of what happened of victims:
    {req.transcription}
    """

    body = {
        "messages": [
            {"role": "assistant", "content": prompt},
        ],
        "temperature": 0,
        "top_p": 0.5,
    }

    try:
        response = client.invoke_model(
            modelId=model_id,
            body=json.dumps(body),
        )
        response_body = json.loads(response["body"].read())
        print("result:")
        print(response_body)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Try to extract the summary from the response
    summary = None
    if "output" in response_body and "message" in response_body["output"]:
        for msg in response_body["output"]["message"]["content"]:
            if "text" in msg:
                summary = msg["text"]
                break
    if not summary and "choices" in response_body:
        summary = response_body['choices'][0]['message']['content']

    # Remove <reasoning>...</reasoning> if present
    summary = re.sub(r"<reasoning>.*?</reasoning>", "", summary or "", flags=re.DOTALL).strip()

    return summary