"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Clock,
  Truck,
  Shield,
  AlertCircle,
  FileText,
  MapPin,
  Phone,
  Eye,
  Copy,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  token: string
  timestamp: string
  status: "completed" | "processing" | "pending"
  eta?: string
}

export default function PostSubmission() {
  const [currentTime, setCurrentTime] = useState(0)
  const [claimToken] = useState("0x9e8e...5b52")
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([
    {
      id: "registered",
      title: "Report Registered",
      description: "Your incident report has been received and validated",
      icon: <FileText className="w-5 h-5" />,
      token: "0x9e8e...5b52",
      timestamp: "00:00",
      status: "completed",
    },
    {
      id: "police",
      title: "Police Dispatch Notified",
      description: "Local authorities have been alerted to your incident",
      icon: <Shield className="w-5 h-5" />,
      token: "0x6afc...e911",
      timestamp: "00:02",
      status: "pending",
    },
    {
      id: "insurance",
      title: "Insurance Verification Approved",
      description: "Your policy has been verified and claim pre-approved",
      icon: <CheckCircle className="w-5 h-5" />,
      token: "0xa91b...c033",
      timestamp: "00:05",
      status: "pending",
    },
    {
      id: "towing",
      title: "Nearest Tow Truck En Route",
      description: "Emergency towing service has been dispatched to your location",
      icon: <Truck className="w-5 h-5" />,
      token: "0x7c1a...db20",
      timestamp: "00:08",
      status: "pending",
      eta: "12 minutes",
    },
  ])

  // Simulate real-time progression
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Update timeline based on elapsed time
  useEffect(() => {
    setTimelineSteps((prev) =>
      prev.map((step) => {
        const stepTime = Number.parseInt(step.timestamp.split(":")[1])
        if (currentTime >= stepTime && currentTime < stepTime + 2) {
          return { ...step, status: "processing" }
        } else if (currentTime >= stepTime + 2) {
          return { ...step, status: "completed" }
        }
        return step
      }),
    )
  }, [currentTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const getStatusIcon = (status: "completed" | "processing" | "pending") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case "processing":
        return <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
      default:
        return <Clock className="w-6 h-6 text-slate-400" />
    }
  }

  const getStatusColor = (status: "completed" | "processing" | "pending") => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "processing":
        return "bg-purple-500"
      default:
        return "bg-slate-300"
    }
  }

  const completedSteps = timelineSteps.filter((step) => step.status === "completed").length
  const processingStep = timelineSteps.find((step) => step.status === "processing")
  const nextStep = timelineSteps.find((step) => step.status === "pending")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-purple-100 shadow-sm">
        <div className="p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Report Registered!</h1>
            <p className="text-slate-600 mb-6">Your incident report has been submitted and is now being processed.</p>

            {/* Claim Token Box */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-lavender-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm font-medium text-purple-800 mb-1">Claim Token</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-slate-800">{claimToken}</span>
                      <button
                        onClick={() => copyToken(claimToken)}
                        className="p-1 hover:bg-purple-200 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-purple-600" />
                      </button>
                      {copiedToken === claimToken && (
                        <span className="text-xs text-green-600 font-medium">Copied!</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-1">🔄 In Progress</Badge>
                    <p className="text-xs text-purple-600">
                      {completedSteps}/{timelineSteps.length} steps completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          {/* Live Timer */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">Time Elapsed: {formatTime(currentTime)}</span>
            </div>
          </div>

          {/* Dispatch Timeline Tracker */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-slate-800">Dispatch Timeline</h2>
              </div>

              <div className="space-y-6">
                {timelineSteps.map((step, index) => (
                  <div key={step.id} className="relative">
                    {/* Timeline Line */}
                    {index < timelineSteps.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-slate-200">
                        <div
                          className={cn(
                            "w-full transition-all duration-1000",
                            step.status === "completed" ? "bg-green-500 h-full" : "h-0",
                          )}
                        />
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div
                        className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-lg transition-all duration-500",
                          step.status === "completed" && "bg-green-100",
                          step.status === "processing" && "bg-purple-100",
                          step.status === "pending" && "bg-slate-100",
                        )}
                      >
                        {getStatusIcon(step.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className={cn(
                              "font-semibold transition-colors duration-300",
                              step.status === "completed" && "text-green-800",
                              step.status === "processing" && "text-purple-800",
                              step.status === "pending" && "text-slate-500",
                            )}
                          >
                            {step.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-500">+{step.timestamp}</span>
                            {step.status === "completed" && (
                              <button
                                onClick={() => copyToken(step.token)}
                                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-xs font-mono text-slate-700 transition-colors"
                              >
                                {step.token}
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                            {copiedToken === step.token && (
                              <span className="text-xs text-green-600 font-medium">Copied!</span>
                            )}
                          </div>
                        </div>

                        <p
                          className={cn(
                            "text-sm transition-colors duration-300",
                            step.status === "completed" && "text-slate-700",
                            step.status === "processing" && "text-slate-700",
                            step.status === "pending" && "text-slate-400",
                          )}
                        >
                          {step.description}
                        </p>

                        {/* ETA Display */}
                        {step.eta && step.status === "processing" && (
                          <div className="mt-2 inline-flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-purple-800">Arriving in ~{step.eta}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Status Card */}
          {processingStep && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-lavender-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  <div>
                    <p className="font-semibold text-purple-800">{processingStep.title}</p>
                    <p className="text-sm text-purple-600">{processingStep.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Step Preview */}
          {nextStep && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-700">Next: {nextStep.title}</p>
                    <p className="text-sm text-slate-500">Expected at +{nextStep.timestamp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Actions */}
          <div className="space-y-3">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Eye className="w-4 h-4 mr-2" />
              View Approved Claim
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent">
                <MapPin className="w-4 h-4 mr-2" />
                Track Location
              </Button>
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent">
                <Phone className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>

          {/* Progress Summary */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Overall Progress</span>
                <span className="font-medium text-slate-800">
                  {completedSteps}/{timelineSteps.length} completed
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(completedSteps / timelineSteps.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
