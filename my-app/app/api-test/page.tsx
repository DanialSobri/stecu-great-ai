'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

const APIs = [
  {
    name: 'Accident Report Summarizer',
    endpoint: 'https://tno21drqkk.execute-api.us-east-1.amazonaws.com/prod/summarize',
    method: 'POST',
    description: 'Generate accident incident summary from transcription',
    testPayload: { transcription: 'I was driving when the van stopped suddenly and I crashed into it' },
    status: 'Active'
  },
  {
    name: 'Accident Cost Estimator',
    endpoint: 'Coming soon...',
    method: 'POST',
    description: 'Estimate repair costs and damages based on accident details',
    testPayload: { vehicleType: 'sedan', damageLevel: 'moderate', location: 'front-end' },
    status: 'Work In Progress'
  },
  {
    name: 'Accident Claim Agent',
    endpoint: 'Coming soon...',
    method: 'POST',
    description: 'AI agent to assist with insurance claim processing and documentation',
    testPayload: { claimType: 'vehicle', incidentReport: 'summary', documents: [] },
    status: 'Work In Progress'
  }
]

export default function APITestPage() {
  const [selectedAPI, setSelectedAPI] = useState(APIs[0])
  const [customPayload, setCustomPayload] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAPI = async (api = selectedAPI) => {
    if (api.status === 'Work In Progress') {
      setResult('This API is currently in development and not yet available for testing.')
      return
    }

    setLoading(true)
    try {
      const payload = customPayload ? JSON.parse(customPayload) : api.testPayload
      const response = await fetch(api.endpoint, {
        method: api.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult('Error: ' + error)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Testing Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {APIs.map((api, index) => (
              <Card key={index} className={`cursor-pointer ${selectedAPI === api ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedAPI(api)}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{api.name}</h3>
                      <p className="text-sm text-gray-600">{api.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{api.endpoint}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{api.method}</Badge>
                      <Badge 
                        className={api.status === 'Active' ? 'bg-green-500 text-white' : api.status === 'Work In Progress' ? 'bg-yellow-500 text-white' : ''}
                        variant={api.status === 'Active' || api.status === 'Work In Progress' ? 'default' : 'secondary'}
                      >
                        {api.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test {selectedAPI.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Custom Payload (optional):</label>
            <Textarea
              placeholder={JSON.stringify(selectedAPI.testPayload, null, 2)}
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              rows={4}
            />
          </div>
          <Button onClick={() => testAPI()} disabled={loading}>
            {loading ? 'Testing...' : 'Test API'}
          </Button>
          {result && (
            <Card>
              <CardContent className="pt-4">
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded">{result}</pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}