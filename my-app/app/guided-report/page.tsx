"use client"

import type React from "react"
import { Eye } from "lucide-react" // Import the Eye component

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Camera,
  Video,
  Mic,
  Upload,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Brain,
  Loader2,
  CheckCircle,
  X,
  ImageIcon,
  FileText,
  Clock,
  Copy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type Step = 1 | 2 | 3 | 4
type PhotoSlot = "front" | "back" | "left" | "right"

interface PhotoCapture {
  slot: PhotoSlot
  file: File | null
  preview: string | null
  label: string
}

interface VideoFile {
  file: File
  preview: string
  duration?: string
}

export default function GuidedReport() {
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionToken, setSubmissionToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("reportObjectId") || "0x9e8e...5b52"
    }
    return "0x9e8e...5b52"
  })
  const [submissionTime, setSubmissionTime] = useState(0)
  const [submissionSteps, setSubmissionSteps] = useState([
    {
      id: "registered",
      title: "📋 Report Registered",
      description: "Your incident report has been received and validated",
      timestamp: "0",
      status: "pending" as "completed" | "processing" | "pending",
    },
    {
      id: "police",
      title: "🚓 Police Report: Approved",
      description: "Local authorities have verified and approved your report",
      timestamp: "2",
      status: "pending" as "completed" | "processing" | "pending",
    },
    {
      id: "insurance",
      title: "✅ Insurance Verification Approved",
      description: "Your policy has been verified and claim pre-approved",
      timestamp: "4",
      status: "pending" as "completed" | "processing" | "pending",
    },
    {
      id: "towing",
      title: "🚙 Nearest Tow Truck En Route",
      description: "Emergency towing service has been dispatched to your location",
      timestamp: "6",
      status: "pending" as "completed" | "processing" | "pending",
      eta: "~15 minutes",
    },
  ])
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [photos, setPhotos] = useState<PhotoCapture[]>([
    { slot: "front", file: null, preview: null, label: "Front View" },
    { slot: "back", file: null, preview: null, label: "Back View" },
    { slot: "left", file: null, preview: null, label: "Left Side" },
    { slot: "right", file: null, preview: null, label: "Right Side" },
  ])
  const [videos, setVideos] = useState<VideoFile[]>([])
  const [description, setDescription] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiSummary, setAiSummary] = useState("")
  const [isPlaying, setIsPlaying] = useState<number | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [speechRecognition, setSpeechRecognition] = useState<any>(null)
  const [autoDescription, setAutoDescription] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const completedPhotos = photos.filter((p) => p.file !== null).length
  const canProceedStep1 = completedPhotos >= 4
  const canProceedStep2 = videos.length >= 1
  const canProceedStep3 = description.trim().length >= 20

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setDescription((prev) => prev + " " + finalTranscript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      setSpeechRecognition(recognition)
    }
  }, [])

  const toggleSpeechRecognition = () => {
    if (!speechRecognition) {
      alert("Speech recognition is not supported in your browser")
      return
    }

    if (isListening) {
      speechRecognition.stop()
    } else {
      speechRecognition.start()
    }
  }

  const autoGenerateDescription = () => {
    setIsRecording(true)
    // Simulate auto-generation based on evidence
    setTimeout(() => {
      const generatedText = `At approximately ${new Date().toLocaleTimeString()}, I was involved in a vehicular incident. Based on the ${completedPhotos} photos I captured showing damage from multiple angles and the ${videos.length} video${videos.length !== 1 ? "s" : ""} I uploaded, the incident appears to have caused significant damage to my vehicle. The damage is visible on multiple sides of the vehicle, with the most noticeable impact on the exterior panels. The incident occurred in what appears to be a parking area or driveway setting. I have documented all visible damage and the surrounding area to provide a complete picture of what happened. The evidence clearly shows the extent of the damage and the circumstances surrounding the incident.`

      setDescription(generatedText)
      setIsRecording(false)
    }, 2000)
  }



  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    files.forEach((file) => {
      if (file.type.startsWith("video/")) {
        const preview = URL.createObjectURL(file)
        const newVideo: VideoFile = { file, preview }
        setVideos((prev) => [...prev, newVideo])
      }
    })
  }

  const removePhoto = (slot: PhotoSlot) => {
    setPhotos((prev) => prev.map((photo) => (photo.slot === slot ? { ...photo, file: null, preview: null } : photo)))
  }

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleVideoPlayback = (index: number) => {
    const video = videoRefs.current[index]
    if (video) {
      if (isPlaying === index) {
        video.pause()
        setIsPlaying(null)
      } else {
        video.play()
        setIsPlaying(index)
      }
    }
  }

  const generateAISummary = async () => {
    setIsGeneratingAI(true)
    try {
      const response = await fetch('https://tno21drqkk.execute-api.us-east-1.amazonaws.com/prod/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcription: description })
      })
      
      const data = await response.json()
      setAiSummary(data || 'No response from AI service')
    } catch (error) {
      setAiSummary('Error generating AI summary: ' + error)
    }
    setIsGeneratingAI(false)
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const getStepTitle = (step: Step) => {
    switch (step) {
      case 1:
        return "Snap the Scene"
      case 2:
        return "Upload Video Evidence"
      case 3:
        return "Describe What Happened"
      case 4:
        return "AI Summary"
      default:
        return ""
    }
  }

  const getStepInstruction = (step: Step) => {
    switch (step) {
      case 1:
        return "Capture the incident area from at least four angles."
      case 2:
        return "Connect to your webcam or upload videos showing the incident in motion."
      case 3:
        return "Explain what occurred in your own words."
      case 4:
        return "Review your AI-generated incident summary."
      default:
        return ""
    }
  }

  const submitReportToAPI = async () => {
    setIsSubmittingReport(true)
    setApiError(null)

    try {
      // Build a simple hash from the report data (placeholder – replace with real hash in production)
      const reportData = {
        photos: completedPhotos,
        videos: videos.length,
        description,
        aiSummary,
        timestamp: Date.now(),
      }

      const reportHash = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"; // mock 64-char hash

      // NOTE: call our local proxy route to avoid CORS issues
      const response = await fetch("/api/notarize", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportHash,
          metadata: {
            claimId: `CLAIM-${Date.now()}`,
            reportType: "accident_report",
            policeReportNumber: `PR-${Date.now()}`,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "success" && data.objectId) {
        localStorage.setItem("reportObjectId", data.objectId)
        localStorage.setItem("reportResponse", JSON.stringify(data))
        setSubmissionToken(data.objectId)
        return data.objectId
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      setApiError(error instanceof Error ? error.message : "Failed to submit report")
      throw error
    } finally {
      setIsSubmittingReport(false)
    }
  }

  const handleSubmit = async () => {
    // Redirect to post-submission page
    window.location.href = '/post-submission'
  }

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    // Could add toast notification here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
      {/* Header with Progress */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-purple-100 shadow-sm">
        <div className="p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-slate-800">Incident Report</h1>
              <span className="text-sm text-purple-600 font-medium">Step {currentStep} of 4</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Step Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{getStepTitle(currentStep)}</h2>
                <p className="text-slate-600">{getStepInstruction(currentStep)}</p>
              </div>

              {/* Step 1: Photo Capture */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                      <Camera className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">{completedPhotos} of 4 sides captured</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.slot} className="relative">
                        <div className="aspect-square border-2 border-dashed border-purple-200 rounded-lg overflow-hidden bg-purple-50/50">
                          {photo.preview ? (
                            <div className="relative w-full h-full">
                              <img
                                src={photo.preview || "/placeholder.svg"}
                                alt={photo.label}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removePhoto(photo.slot)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                {photo.label}
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-purple-100/50 transition-colors"
                              onClick={() => {
                                // Load demo image based on slot
                                const demoImageMap = {
                                  front: '/demo-images/front.jpg',
                                  back: '/demo-images/back.png', 
                                  left: '/demo-images/left.png',
                                  right: '/demo-images/right.png'
                                }
                                
                                const preview = demoImageMap[photo.slot]
                                const mockFile = new File([''], `${photo.slot}-demo.jpg`, { type: 'image/jpeg' })
                                setPhotos((prev) => prev.map((p) => (p.slot === photo.slot ? { ...p, file: mockFile, preview } : p)))
                              }}
                            >
                              <Camera className="w-8 h-8 text-purple-400 mb-2" />
                              <span className="text-sm font-medium text-purple-600">{photo.label}</span>
                              <span className="text-xs text-purple-500 mt-1">Tap to capture</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {completedPhotos > 0 && completedPhotos < 4 && (
                    <div className="text-center">
                      <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                        Great start! Please capture {4 - completedPhotos} more angle
                        {4 - completedPhotos !== 1 ? "s" : ""} to continue.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Video Upload */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center bg-purple-50/50">
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <Video className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Upload Video Evidence</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Videos help provide context and motion details of the incident
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => videoInputRef.current?.click()}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Video Files
                      </Button>
                      <Button
                        onClick={() => {
                          // Load demo dashcam video
                          const videoUrl = '/demo-images/webcam.mp4'
                          const mockFile = new File([''], 'dashcam-footage.mp4', { type: 'video/mp4' })
                          const newVideo: VideoFile = { file: mockFile, preview: videoUrl }
                          setVideos((prev) => [...prev, newVideo])
                        }}
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Get Dashcam
                      </Button>
                    </div>
                  </div>

                  {videos.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-800">Uploaded Videos ({videos.length})</h4>
                      {videos.map((video, index) => (
                        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <div className="flex gap-4">
                            <div className="relative flex-shrink-0">
                              <video
                                ref={(el) => (videoRefs.current[index] = el)}
                                src={video.preview}
                                className="w-24 h-16 object-cover rounded-lg"
                                onEnded={() => setIsPlaying(null)}
                              />
                              <button
                                onClick={() => toggleVideoPlayback(index)}
                                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg hover:bg-black/60 transition-colors"
                              >
                                {isPlaying === index ? (
                                  <Pause className="w-6 h-6 text-white" />
                                ) : (
                                  <Play className="w-6 h-6 text-white" />
                                )}
                              </button>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">{video.file.name}</span>
                                <button
                                  onClick={() => removeVideo(index)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Size: {(video.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Description */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-lavender-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Voice-to-Text Available</span>
                    </div>
                    <p className="text-xs text-purple-600">
                      Tap the microphone icon to speak your description, or type manually below.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={autoGenerateDescription}
                        disabled={isRecording}
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        {isRecording ? "Generating..." : "Auto-Generate"}
                      </Button>

                      <Button
                        onClick={() => {
                          setIsListening(true)
                          
                          const fullText = "Saya tengah bawa van tu perlahan je, tiba-tiba kereta depan brek mengejut. Saya cuba tekan brek kuat-kuat tapi tak sempat, van terus hentam bahagian depan. Saya rasa hentakan kuat sangat, terus keluar asap. Airbag pun terus terbuka depan muka saya. Hidung saya sakit sikit sebab kena airbag, dada pun rasa berdebar kuat. Nasib baik saya masih sedar. Saya nampak orang ramai datang tolong, ada yang tanya saya okay ke. Saya cuma takut kalau enjin van terbakar sebab ada bau minyak kuat keluar dari depan. Saya tak boleh gerak sangat sebab kaki rasa tersepit dekat pedal."
                          const words = fullText.split(' ')
                          
                          let currentWord = 0
                          const addWord = () => {
                            if (currentWord < words.length) {
                              setDescription(prev => prev + (prev ? " " : "") + words[currentWord])
                              currentWord++
                              setTimeout(addWord, 150) // Add next word after 150ms
                            } else {
                              setIsListening(false)
                            }
                          }
                          
                          setTimeout(addWord, 300) // Start after 300ms
                        }}
                        variant="outline"
                        className={cn(
                          "border-purple-200 hover:bg-purple-50 bg-transparent",
                          isListening ? "text-white bg-red-500 border-red-500 hover:bg-red-600" : "text-purple-700",
                        )}
                        disabled={isListening}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        {isListening ? "Voice Recording..." : "Voice Input"}
                      </Button>
                    </div>

                    <div className="relative">
                      <Textarea
                        placeholder="Start with where you were and what you saw. Describe the sequence of events, who was involved, and any important details about the damage or circumstances..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-32 text-base resize-none"
                        maxLength={1000}
                      />
                      {isListening && (
                        <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-red-600 font-medium">Listening...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Minimum 20 characters required</span>
                    <span className={cn(description.length >= 20 ? "text-green-600" : "text-slate-500")}>
                      {description.length}/1000
                    </span>
                  </div>

                  {description.length >= 20 && (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Ready to generate AI summary</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: AI Summary */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {!aiSummary && !isGeneratingAI && !isSubmitted && (
                    <div className="text-center">
                      <Button
                        onClick={generateAISummary}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                      >
                        <Brain className="w-5 h-5 mr-2" />
                        Generate AI Summary
                      </Button>
                    </div>
                  )}

                  {isGeneratingAI && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-3 bg-purple-50 px-6 py-4 rounded-xl border border-purple-200">
                        <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-purple-800">AI is analyzing your evidence...</p>
                          <p className="text-xs text-purple-600">Processing photos, videos, and description 🧠</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aiSummary && !isSubmitted && (
                    <div className="space-y-6">
                      {/* Enhanced AI Summary Card */}
                      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Brain className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <CardTitle className="text-slate-800">AI-Generated Incident Summary</CardTitle>
                              <p className="text-sm text-purple-600 mt-1">
                                Confidence Level: 94% • Processing Time: 2.3s
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Summary Content */}
                            <div className="bg-gradient-to-r from-slate-50 to-purple-50/50 p-5 rounded-xl border border-slate-200">
                              <div className="prose prose-sm max-w-none text-slate-700">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-purple-800 mb-2">📋 Incident Overview</h4>
                                    <p className="text-sm leading-relaxed">
                                      Based on the provided evidence, this appears to be a vehicular incident involving
                                      property damage. The submitted photos show damage to multiple angles of the
                                      vehicle, with the most significant impact visible on the left side panel and rear
                                      bumper area.
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-purple-800 mb-2">🔍 Key Observations</h4>
                                    <ul className="text-sm space-y-1 ml-4">
                                      <li>• Multiple impact points suggest collision or contact incident</li>
                                      <li>• Damage pattern consistent with side-swipe or parking lot incident</li>
                                      <li>• Video evidence shows the immediate aftermath and surrounding area</li>
                                      <li>• User description indicates: "{description.slice(0, 100)}..."</li>
                                    </ul>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="bg-white/80 p-3 rounded-lg border border-purple-100">
                                      <p className="text-xs font-medium text-purple-600 mb-1">Estimated Severity</p>
                                      <p className="text-sm font-semibold text-slate-800">Moderate</p>
                                    </div>
                                    <div className="bg-white/80 p-3 rounded-lg border border-purple-100">
                                      <p className="text-xs font-medium text-purple-600 mb-1">Recommended Action</p>
                                      <p className="text-sm font-semibold text-slate-800">Insurance Review</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Evidence Summary */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                              <h4 className="font-semibold text-blue-800 mb-3">📁 Evidence Summary</h4>
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div className="text-center">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                    <ImageIcon className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <p className="font-medium text-blue-800">{completedPhotos}</p>
                                  <p className="text-xs text-blue-600">Photos</p>
                                </div>
                                <div className="text-center">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                    <Video className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <p className="font-medium text-blue-800">{videos.length}</p>
                                  <p className="text-xs text-blue-600">Videos</p>
                                </div>
                                <div className="text-center">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <p className="font-medium text-blue-800">{description.length}</p>
                                  <p className="text-xs text-blue-600">Characters</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <div className="flex text-center items-center flex-col space-y-3">
                        {apiError && (
                          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">Error: {apiError}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setApiError(null)}
                              className="mt-2 text-xs"
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}

                        <Button
                          onClick={handleSubmit}
                          disabled={isSubmittingReport}
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-center"
                          size="lg"
                        >
                          {isSubmittingReport ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Submitting Report...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Submit Report
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Submission Status Timeline */}
                  {isSubmitted && (
                    <div className="space-y-6">
                      {/* Success Header */}
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Report Submitted Successfully!</h3>
                        <p className="text-slate-600 mb-4">
                          Your incident is now being processed by our AI dispatch system.
                        </p>

                        {/* Claim Token */}
                        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-lavender-50 mb-6">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                <p className="text-sm font-medium text-purple-800 mb-1">Claim Token</p>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-lg font-bold text-slate-800">{submissionToken}</span>
                                  <button
                                    onClick={() => copyToken(submissionToken)}
                                    className="p-1 hover:bg-purple-200 rounded transition-colors"
                                  >
                                    <Copy className="w-4 h-4 text-purple-600" />
                                  </button>
                                </div>
                              </div>
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200">🔄 Processing</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Live Timeline */}
                      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                          <CardTitle className="flex items-center gap-2 text-slate-800">
                            <Clock className="w-5 h-5 text-purple-600" />
                            Live Processing Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-6">
                            {submissionSteps.map((step, index) => (
                              <div key={step.id} className="relative">
                                {/* Timeline Line */}
                                {index < submissionSteps.length - 1 && (
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
                                    {step.status === "completed" && <CheckCircle className="w-6 h-6 text-green-600" />}
                                    {step.status === "processing" && (
                                      <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                                    )}
                                    {step.status === "pending" && <Clock className="w-6 h-6 text-slate-400" />}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4
                                        className={cn(
                                          "font-semibold transition-colors duration-300",
                                          step.status === "completed" && "text-green-800",
                                          step.status === "processing" && "text-purple-800",
                                          step.status === "pending" && "text-slate-500",
                                        )}
                                      >
                                        {step.title}
                                      </h4>
                                      <span className="text-xs font-mono text-slate-500">+{step.timestamp}s</span>
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
                                        <span className="text-xs font-medium text-purple-800">ETA: {step.eta}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Action Button */}
                      <Button
                        onClick={() => (window.location.href = "/post-submission")}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-medium"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        View Full Status Dashboard
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="border-slate-300 text-slate-600 hover:bg-slate-50 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <Button
                    onClick={
                      currentStep === 3
                        ? () => {
                            setCurrentStep(4)
                            generateAISummary()
                          }
                        : nextStep
                    }
                    disabled={
                      (currentStep === 1 && !canProceedStep1) ||
                      (currentStep === 2 && !canProceedStep2) ||
                      (currentStep === 3 && !canProceedStep3)
                    }
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {currentStep === 3 ? (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate AI Summary
                      </>
                    ) : (
                      <>
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
