import { NextRequest, NextResponse } from 'next/server'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'

const lambda = new LambdaClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function POST(request: NextRequest) {
  try {
    const { transcription } = await request.json()
    
    if (!transcription) {
      return NextResponse.json({ error: 'Transcription is required' }, { status: 400 })
    }

    const command = new InvokeCommand({
      FunctionName: 'accident-report-summarizer',
      Payload: JSON.stringify({
        body: JSON.stringify({ transcription })
      })
    })

    const response = await lambda.send(command)
    const result = JSON.parse(new TextDecoder().decode(response.Payload))
    const summary = JSON.parse(result.body)
    
    return NextResponse.json({ summary })
    
  } catch (error) {
    console.error('Lambda error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}