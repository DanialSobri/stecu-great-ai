"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Menu,
  X,
  MapPin,
  ImageIcon,
  FileText,
  Mic,
  Video,
  Play,
  Pause,
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  Search,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SubmissionStatus = "draft" | "submitted" | "in-review" | "approved" | "rejected"

interface Submission {
  id: string
  submissionNo: number
  tokenId?: string
  title: string
  date: string
  status: SubmissionStatus
  description: string
  location: {
    lat: number
    lng: number
    address: string
  }
  media: {
    images: string[]
    videos: string[]
    voice: string[]
  }
}

interface MediaFile {
  id: string
  file: File
  preview: string
  label: string
}

const getStatusColor = (status: SubmissionStatus) => {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "in-review":
      return "bg-purple-50 text-purple-700 border-purple-200"
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200"
    case "submitted":
      return "bg-blue-50 text-blue-700 border-blue-200"
    default:
      return "bg-amber-50 text-amber-700 border-amber-200"
  }
}

const getStatusIcon = (status: SubmissionStatus) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="w-4 h-4 text-emerald-600" />
    case "in-review":
      return <Clock className="w-4 h-4 text-purple-600" />
    case "rejected":
      return <AlertCircle className="w-4 h-4 text-red-600" />
    case "submitted":
      return <CheckCircle className="w-4 h-4 text-blue-600" />
    default:
      return <FileText className="w-4 h-4 text-amber-600" />
  }
}

// Mobile-Optimized Leaflet Map Component
function MobileMapSelector({
  defaultCenter,
  onLocationSelect,
}: {
  defaultCenter: { lat: number; lng: number }
  onLocationSelect: (lat: number, lng: number, address: string) => void
}) {
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)

  useEffect(() => {
    if (!mapContainer) return

    const initMap = async () => {
      const L = (await import("leaflet")).default

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      const mapInstance = L.map(mapContainer, {
        touchZoom: true,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false,
        dragging: true,
        zoomControl: true,
      }).setView([defaultCenter.lat, defaultCenter.lng], 16)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance)

      // Custom draggable marker
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background: #8B5CF6;
            width: 24px;
            height: 24px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              color: white;
              font-size: 12px;
              transform: rotate(45deg);
              font-weight: bold;
            ">📍</div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      })

      const markerInstance = L.marker([defaultCenter.lat, defaultCenter.lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(mapInstance)

      markerInstance.on("dragend", (e: any) => {
        const position = e.target.getLatLng()
        onLocationSelect(position.lat, position.lng, `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`)
      })

      mapInstance.on("click", (e: any) => {
        markerInstance.setLatLng(e.latlng)
        onLocationSelect(e.latlng.lat, e.latlng.lng, `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`)
      })

      setMap(mapInstance)
      setMarker(markerInstance)
    }

    initMap()

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [mapContainer, defaultCenter, onLocationSelect])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      <div
        ref={setMapContainer}
        className="w-full h-64 rounded-lg border border-purple-200 shadow-sm touch-pan-y"
        style={{ background: "#F8FAFC" }}
      />
    </>
  )
}

export default function ClaimerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start closed on mobile
  const [activeSection, setActiveSection] = useState<string>("text")
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Form state
  const [description, setDescription] = useState("")
  const [voiceFile, setVoiceFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<MediaFile[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [location, setLocation] = useState({
    lat: 2.861422,
    lng: 101.675189,
    address: "Tap map to select location",
  })

  // Submissions history
  const [submissions] = useState<Submission[]>([
    {
      id: "sub-001",
      submissionNo: 1,
      tokenId: "0x9e8e…5b52",
      title: "Driveway Mirror Damage",
      date: "19 Jul 2025",
      status: "in-review",
      description: "Side mirror damaged in shared driveway near Dengkil Cafe",
      location: { lat: 2.861422, lng: 101.675189, address: "Jalan Cempaka, Selangor" },
      media: { images: ["mirror_damage.jpg"], videos: ["incident_video.mp4"], voice: ["voice_report.mp3"] },
    },
    {
      id: "sub-002",
      submissionNo: 2,
      title: "Parking Lot Scratch",
      date: "15 Jul 2025",
      status: "approved",
      description: "Minor scratch on rear bumper in shopping mall parking",
      location: { lat: 3.0738, lng: 101.6065, address: "Sunway Pyramid, Petaling Jaya" },
      media: { images: ["scratch_photo.jpg"], videos: [], voice: [] },
    },
    {
      id: "sub-003",
      submissionNo: 3,
      title: "Traffic Light Collision",
      date: "10 Jul 2025",
      status: "rejected",
      description: "Rear-end collision at traffic intersection",
      location: { lat: 3.1569, lng: 101.7158, address: "Jalan Ampang, Kuala Lumpur" },
      media: { images: ["collision_1.jpg", "collision_2.jpg"], videos: ["traffic_cam.mp4"], voice: [] },
    },
  ])

  const characterCount = description.length
  const maxCharacters = 1000

  const handleVoiceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setVoiceFile(file)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const mediaFile: MediaFile = {
          id: Date.now().toString() + Math.random(),
          file,
          preview: URL.createObjectURL(file),
          label: "",
        }
        setImageFiles((prev) => [...prev, mediaFile])
      }
    })
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file)
    }
  }

  const updateImageLabel = (id: string, label: string) => {
    setImageFiles((prev) => prev.map((img) => (img.id === id ? { ...img, label } : img)))
  }

  const removeImage = (id: string) => {
    setImageFiles((prev) => prev.filter((img) => img.id !== id))
  }

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng, address })
  }

  const toggleVoicePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSubmit = () => {
    // Handle form submission
    console.log("Submitting claim:", {
      description,
      voiceFile,
      imageFiles,
      videoFile,
      location,
    })
  }

  const CollapsibleSection = ({
    id,
    title,
    icon,
    children,
    defaultOpen = false,
  }: {
    id: string
    title: string
    icon: React.ReactNode
    children: React.ReactNode
    defaultOpen?: boolean
  }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-4">
        <CardHeader
          className="pb-3 cursor-pointer bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
              {icon}
              {title}
            </CardTitle>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-purple-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-600" />
            )}
          </div>
        </CardHeader>
        {isOpen && <CardContent className="pt-4">{children}</CardContent>}
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-purple-100 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Submit Claim</h1>
              <p className="text-xs text-purple-600">Mobile Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-purple-100 text-purple-600"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Collapsible Sidebar - Mobile Optimized */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 transition-transform duration-300 bg-white/95 backdrop-blur-sm shadow-xl border-r border-purple-100",
            sidebarOpen ? "translate-x-0 w-80" : "-translate-x-full w-0",
            "md:relative md:translate-x-0",
            sidebarOpen ? "md:w-80" : "md:w-0",
          )}
        >
          {sidebarOpen && (
            <div className="p-4 space-y-3 max-h-[calc(100vh-80px)] overflow-y-auto">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Previous Submissions</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Search submissions..." className="pl-10 text-sm" />
                </div>
              </div>

              {submissions.map((submission) => (
                <Card
                  key={submission.id}
                  className="border-0 shadow-sm bg-white/80 hover:bg-purple-50/50 transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500">#{submission.submissionNo}</span>
                          {submission.tokenId && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {submission.tokenId}
                            </Badge>
                          )}
                        </div>
                        <Badge className={cn("text-xs", getStatusColor(submission.status))}>{submission.status}</Badge>
                      </div>

                      <h3 className="font-semibold text-sm text-slate-800">{submission.title}</h3>

                      <div className="space-y-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          <span>{submission.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          <span className="truncate">{submission.location.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(submission.status)}
                          <span className="text-xs text-slate-500 capitalize">
                            {submission.status.replace("-", " ")}
                          </span>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-transparent">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 space-y-4">
          <div className="max-w-2xl mx-auto">

            {/* Text Input Section */}
            <CollapsibleSection
              id="text"
              title="Incident Description"
              icon={<FileText className="w-5 h-5 text-purple-600" />}
              defaultOpen={true}
            >
              <div className="space-y-3">
                <Textarea
                  placeholder="Describe what happened in detail. Include time, location, and any relevant circumstances..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32 text-base resize-none"
                  maxLength={maxCharacters}
                />
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Be as detailed as possible</span>
                  <span className={cn(characterCount > maxCharacters * 0.9 ? "text-amber-600" : "text-slate-500")}>
                    {characterCount}/{maxCharacters}
                  </span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Voice Upload Section */}
            <CollapsibleSection id="voice" title="Voice Recording" icon={<Mic className="w-5 h-5 text-purple-600" />}>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-purple-200 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleVoiceUpload}
                    className="hidden"
                    id="voice-upload"
                  />
                  <label htmlFor="voice-upload" className="cursor-pointer">
                    <Mic className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Upload Voice Recording</p>
                    <p className="text-xs text-slate-400">MP3, WAV, or M4A files</p>
                  </label>
                </div>

                {voiceFile && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-800">{voiceFile.name}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={toggleVoicePlayback}
                        className="h-8 px-3 bg-transparent"
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                    </div>
                    <audio
                      ref={audioRef}
                      src={URL.createObjectURL(voiceFile)}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                    <p className="text-xs text-slate-500">Size: {(voiceFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Image Upload Section */}
            <CollapsibleSection
              id="images"
              title="Photo Evidence"
              icon={<ImageIcon className="w-5 h-5 text-purple-600" />}
            >
              <div className="space-y-4">
                <div className="border-2 border-dashed border-purple-200 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImageIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Upload Photos</p>
                    <p className="text-xs text-slate-400">Multiple images supported</p>
                  </label>
                </div>

                {imageFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-700">Uploaded Images ({imageFiles.length})</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {imageFiles.map((image) => (
                        <div key={image.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="flex gap-3">
                            <img
                              src={image.preview || "/placeholder.svg"}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Add label (e.g., 'Front View', 'Damage Area')"
                                value={image.label}
                                onChange={(e) => updateImageLabel(image.id, e.target.value)}
                                className="text-sm"
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">{image.file.name}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeImage(image.id)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Video Upload Section */}
            <CollapsibleSection id="video" title="Video Evidence" icon={<Video className="w-5 h-5 text-purple-600" />}>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-purple-200 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Video className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Upload Video</p>
                    <p className="text-xs text-slate-400">MP4 format recommended</p>
                  </label>
                </div>

                {videoFile && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <video controls className="w-full rounded-lg mb-3" style={{ maxHeight: "200px" }}>
                      <source src={URL.createObjectURL(videoFile)} type={videoFile.type} />
                      Your browser does not support the video tag.
                    </video>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{videoFile.name}</span>
                      <span className="text-slate-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Location Map Section */}
            <CollapsibleSection
              id="location"
              title="Incident Location"
              icon={<MapPin className="w-5 h-5 text-purple-600" />}
              defaultOpen={true}
            >
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <Input placeholder="Search for address or landmark..." className="pl-10 text-base" />
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Drag the marker or tap on the map to select the exact location:
                  </p>
                  <MobileMapSelector
                    defaultCenter={{ lat: location.lat, lng: location.lng }}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-lavender-50 p-4 rounded-lg border border-purple-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-slate-700">Selected Location:</span>
                    </div>
                    <p className="text-slate-600 ml-6">{location.address}</p>
                    <div className="text-xs text-slate-500 ml-6 font-mono">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Submit Button */}
            <div className="sticky bottom-4 z-20">
              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-medium"
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Claim
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
