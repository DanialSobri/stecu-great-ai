import boto3
import json
import re
import os

client = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1"
)

model_id = "openai.gpt-oss-120b-1:0"

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event.get('body', {})
        transcription = body.get('transcription', '')
        
        if not transcription:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({'error': 'transcription field is required'})
            }
        
        summary = summarize_transcription(transcription)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps(summary)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({'error': str(e)})
        }

def summarize_transcription(transcription):
    prompt = f"""
    you are the assistant to create the accident incident summary, keep it short and precise and informative. 
    Use the following format for your response:
    <incident_overview>...</incident_overview>
    <key_observation>...</key_observation>

    This is the incident details:
    Description of the Van Accident Scene
    - The van's front end is heavily damaged — the bumper torn off, headlights shattered, and the hood crumpled inward.
    - The windshield is cracked in multiple places, with glass fragments scattered across the asphalt.
    - Airbags inside the van are deployed, and the steering wheel is bent slightly from the force of the impact.
    - There are fluids leaking beneath the van, likely coolant or oil, creating a dark puddle on the road.
    - The van is immobilized across the lane, blocking traffic, with skid marks visible leading up to the point of collision.

    This is the transcription of what happened of victims:
    {transcription}
    """

    body = {
        "messages": [
            {"role": "assistant", "content": prompt},
        ],
        "temperature": 0,
        "top_p": 0.5,
    }

    response = client.invoke_model(
        modelId=model_id,
        body=json.dumps(body),
    )
    response_body = json.loads(response["body"].read())
    print("result:")
    print(response_body)

    summary = None
    if "output" in response_body and "message" in response_body["output"]:
        for msg in response_body["output"]["message"]["content"]:
            if "text" in msg:
                summary = msg["text"]
                break
    if not summary and "choices" in response_body:
        summary = response_body['choices'][0]['message']['content']

    summary = re.sub(r"<reasoning>.*?</reasoning>", "", summary or "", flags=re.DOTALL).strip()

    return summary