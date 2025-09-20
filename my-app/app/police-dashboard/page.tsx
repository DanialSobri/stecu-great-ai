"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  MapPin,
  Clock,
  User,
  Camera,
  FileText,
  Phone,
  Flag,
  Download,
  CheckCircle,
  Eye,
  Navigation,
  Calendar,
  Shield,
  ChevronRight,
  AlertTriangle,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ReportStatus = "pending" | "verified" | "contacted" | "flagged" | "closed"

interface PoliceReport {
  id: string
  tokenId: string
  title: string
  submissionDate: string
  status: ReportStatus
  location: {
    address: string
    coordinates: { lat: number; lng: number }
    context: string
  }
  claimer: {
    name: string
    ic: string
    contact: string
    email: string
  }
  suspect?: {
    vehicle: string
    plate: string
    description: string
  }
  incident: {
    time: string
    description: string
    damage: string
    webcamSource: string
    aiSummary: string
  }
  priority: "low" | "medium" | "high"
}

const getStatusColor = (status: ReportStatus) => {
  switch (status) {
    case "verified":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "contacted":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "flagged":
      return "bg-red-50 text-red-700 border-red-200"
    case "closed":
      return "bg-slate-50 text-slate-600 border-slate-200"
    default:
      return "bg-amber-50 text-amber-700 border-amber-200"
  }
}

const getPriorityColor = (priority: "low" | "medium" | "high") => {
  switch (priority) {
    case "high":
      return "bg-red-500"
    case "medium":
      return "bg-amber-500"
    default:
      return "bg-emerald-500"
  }
}

// Leaflet Map Component
function LeafletMap({
  coordinates,
  address,
  incidentTime,
}: {
  coordinates: { lat: number; lng: number }
  address: string
  incidentTime: string
}) {
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null)
  const [map, setMap] = useState<any>(null)

  useEffect(() => {
    if (!mapContainer) return

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      const mapInstance = L.map(mapContainer).setView([coordinates.lat, coordinates.lng], 16)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance)

      // Custom incident marker
      const incidentIcon = L.divIcon({
        className: "custom-incident-marker",
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
            ">!</div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      })

      L.marker([coordinates.lat, coordinates.lng], { icon: incidentIcon })
        .addTo(mapInstance)
        .bindPopup(`
          <div style="font-family: system-ui; font-size: 12px;">
            <strong>Incident Location</strong><br/>
            ${address}<br/>
            <small style="color: #6B7280;">Time: ${incidentTime}</small>
          </div>
        `)

      // Add nearby landmarks (mock data)
      const landmarks = [
        { lat: coordinates.lat + 0.001, lng: coordinates.lng + 0.0015, name: "Dengkil Cafe", type: "cafe" },
        { lat: coordinates.lat - 0.0008, lng: coordinates.lng - 0.001, name: "Parking Area", type: "parking" },
      ]

      landmarks.forEach((landmark) => {
        const landmarkIcon = L.divIcon({
          className: "custom-landmark-marker",
          html: `
            <div style="
              background: ${landmark.type === "cafe" ? "#F59E0B" : "#6B7280"};
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })

        L.marker([landmark.lat, landmark.lng], { icon: landmarkIcon })
          .addTo(mapInstance)
          .bindPopup(`<div style="font-family: system-ui; font-size: 11px;"><strong>${landmark.name}</strong></div>`)
      })

      setMap(mapInstance)
    }

    initMap()

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [mapContainer, coordinates, address, incidentTime])

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      <div
        ref={setMapContainer}
        className="w-full h-64 rounded-lg border border-slate-200 shadow-sm"
        style={{ background: "#F8FAFC" }}
      />
    </>
  )
}

export default function PoliceDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedReport, setSelectedReport] = useState<string>("report-001")

  const [reports] = useState<PoliceReport[]>([
    {
      id: "report-001",
      tokenId: "0x9e8e…5b52",
      title: "Side Mirror Damage – Suspect Fled Scene from Driveway near Dengkil Cafe",
      submissionDate: "19 July 2025 – 08:42 MYT",
      status: "pending",
      location: {
        address: "Private driveway adjacent to Dengkil Cafe, Jalan Cempaka, Selangor",
        coordinates: { lat: 2.861422, lng: 101.675189 },
        context:
          "Residential driveway shared by multiple tenants. Borders busy pedestrian walkway and popular breakfast venue.",
      },
      claimer: {
        name: "Ahmad R.",
        ic: "XXXXXXXXXXXX",
        contact: "+60-1X-XXX-XXXX",
        email: "ahmad.report@example.my",
      },
      suspect: {
        vehicle: "White Perodua Axia",
        plate: "BKL 92XX (Partial)",
        description: "Male driver, identity unknown. Captured fleeing scene within seconds.",
      },
      incident: {
        time: "08:36:48 MYT",
        description: "Glancing side-swipe against claimer's stationary car in shared driveway",
        damage: "Left side mirror visibly torn off",
        webcamSource: "USB cam provided by local store, mounted on window frame facing driveway access",
        aiSummary:
          "Minor vehicular collision in shared driveway. Reporting party's parked car suffered left side mirror damage from passing white Perodua Axia. Camera footage confirms rapid suspect departure. Likely qualifies for hit-and-run classification.",
      },
      priority: "medium",
    },
    {
      id: "report-002",
      tokenId: "0xbb23…8e4e",
      title: "Motorcycle Theft from Shopping Mall Parking",
      submissionDate: "19 July 2025 – 14:15 MYT",
      status: "flagged",
      location: {
        address: "Sunway Pyramid Shopping Mall, Parking Level B2, Petaling Jaya",
        coordinates: { lat: 3.0738, lng: 101.6065 },
        context: "Covered parking area with CCTV coverage. High-traffic shopping district.",
      },
      claimer: {
        name: "Siti N.",
        ic: "YYYYYYYYYYYY",
        contact: "+60-1Y-YYY-YYYY",
        email: "siti.n@example.my",
      },
      suspect: {
        vehicle: "Unknown",
        plate: "Not captured",
        description: "Two individuals, faces obscured by helmets",
      },
      incident: {
        time: "13:45:22 MYT",
        description: "Motorcycle stolen from designated parking bay",
        damage: "Vehicle missing, lock mechanism damaged",
        webcamSource: "Mall security camera system",
        aiSummary:
          "Organized theft of motorcycle from secured parking area. Two suspects worked in coordination to bypass security measures.",
      },
      priority: "high",
    },
    {
      id: "report-003",
      tokenId: "0xb233…832e",
      title: "Minor Fender Bender at Traffic Light",
      submissionDate: "18 July 2025 – 16:30 MYT",
      status: "verified",
      location: {
        address: "Intersection of Jalan Ampang & Jalan Tun Razak, Kuala Lumpur",
        coordinates: { lat: 3.1569, lng: 101.7158 },
        context: "Busy intersection with traffic light control. Multiple CCTV cameras present.",
      },
      claimer: {
        name: "David L.",
        ic: "ZZZZZZZZZZZZ",
        contact: "+60-1Z-ZZZ-ZZZZ",
        email: "david.l@example.my",
      },
      incident: {
        time: "16:15:33 MYT",
        description: "Rear-end collision at red traffic light",
        damage: "Minor bumper scratches and dent",
        webcamSource: "Traffic management system camera",
        aiSummary:
          "Standard rear-end collision at controlled intersection. Both parties remained at scene and exchanged information.",
      },
      priority: "low",
    },
  ])

  const selectedReportData = reports.find((r) => r.id === selectedReport)

  const updateReportStatus = (reportId: string, newStatus: ReportStatus) => {
    // In a real app, this would update the backend
    console.log(`Updating report ${reportId} to status: ${newStatus}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 flex">
      {/* Collapsible Sidebar */}
      <div
        className={cn(
          "transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-xl border-r border-purple-100",
          sidebarOpen ? "w-80" : "w-12",
        )}
      >
        <div className="p-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-lavender-50">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Police Reports</h2>
                  <p className="text-xs text-purple-600">AI-Generated Incidents</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-purple-100 text-purple-600"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {sidebarOpen && (
          <div className="p-4 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
            {reports.map((report) => (
              <Card
                key={report.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 shadow-sm",
                  selectedReport === report.id
                    ? "ring-2 ring-purple-400 bg-gradient-to-br from-purple-50 to-lavender-50 shadow-purple-100"
                    : "bg-white/80 hover:bg-purple-50/50",
                )}
                onClick={() => setSelectedReport(report.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full shadow-sm", getPriorityColor(report.priority))} />
                      <span className="font-medium text-sm font-mono text-slate-700">{report.tokenId}</span>
                    </div>
                    <Badge className={cn("text-xs font-medium", getStatusColor(report.status))}>{report.status}</Badge>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-800 mb-2 line-clamp-2 leading-relaxed">
                    {report.title}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      <span>{report.submissionDate.split(" – ")[0]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-purple-400" />
                      <span className="truncate">{report.location.address.split(",")[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Star className={cn("w-3 h-3", getPriorityColor(report.priority).replace("bg-", "text-"))} />
                      <span className="text-xs text-slate-500 capitalize">{report.priority}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-lavender-100 rounded-xl">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-purple-800 bg-clip-text text-transparent">
                  Police Department Dashboard
                </h1>
                <p className="text-slate-600 mt-1">Centralized review interface for AI-generated incident reports</p>
              </div>
            </div>

            {selectedReportData && (
              <div className="bg-gradient-to-r from-purple-50 to-lavender-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">
                    Active Case: {selectedReportData.tokenId} - {selectedReportData.title}
                  </span>
                </div>
              </div>
            )}
          </div>

          {selectedReportData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Report View - Takes up 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Metadata Section */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Report Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">Token ID</label>
                        <div className="font-mono text-sm bg-gradient-to-r from-purple-50 to-lavender-50 p-3 rounded-lg border border-purple-100">
                          {selectedReportData.tokenId}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">Status</label>
                        <Badge className={cn("text-sm px-3 py-1", getStatusColor(selectedReportData.status))}>
                          {selectedReportData.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Incident Title</label>
                      <p className="text-sm text-slate-800 leading-relaxed">{selectedReportData.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Submission Date & Time</label>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Clock className="w-4 h-4 text-purple-500" />
                        {selectedReportData.submissionDate}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Details */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      Location Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Full Address</label>
                      <p className="text-sm text-slate-800 leading-relaxed">{selectedReportData.location.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">GPS Coordinates</label>
                        <div className="font-mono text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {selectedReportData.location.coordinates.lat}, {selectedReportData.location.coordinates.lng}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">Incident Time</label>
                        <div className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {selectedReportData.incident.time}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Location Context</label>
                      <div className="text-sm text-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                        {selectedReportData.location.context}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parties Involved */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <User className="w-5 h-5 text-purple-600" />
                      Parties Involved
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Claimer Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600 mb-1 block">Name</label>
                          <p className="text-sm text-slate-800">{selectedReportData.claimer.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600 mb-1 block">IC Number</label>
                          <p className="text-sm font-mono text-slate-800">{selectedReportData.claimer.ic}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600 mb-1 block">Contact</label>
                          <p className="text-sm text-slate-800">{selectedReportData.claimer.contact}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600 mb-1 block">Email</label>
                          <p className="text-sm text-slate-800">{selectedReportData.claimer.email}</p>
                        </div>
                      </div>
                    </div>

                    {selectedReportData.suspect && (
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Suspect Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-600 mb-1 block">Vehicle</label>
                            <p className="text-sm text-slate-800">{selectedReportData.suspect.vehicle}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600 mb-1 block">License Plate</label>
                            <p className="text-sm font-mono text-slate-800">{selectedReportData.suspect.plate}</p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-sm font-medium text-slate-600 mb-1 block">Description</label>
                            <p className="text-sm text-slate-800">{selectedReportData.suspect.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI-Generated Report */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Camera className="w-5 h-5 text-purple-600" />
                      AI-Generated Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Webcam Source</label>
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {selectedReportData.incident.webcamSource}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Incident Description</label>
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {selectedReportData.incident.description}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Damage Assessment</label>
                      <p className="text-sm text-slate-800 leading-relaxed">{selectedReportData.incident.damage}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">AI Synthesis Summary</label>
                      <div className="bg-gradient-to-r from-purple-50 to-lavender-50 p-4 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-900 leading-relaxed">
                          {selectedReportData.incident.aiSummary}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Map and Actions */}
              <div className="space-y-6">
                {/* Interactive Map Panel */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Navigation className="w-5 h-5 text-purple-600" />
                      Location Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <LeafletMap
                      coordinates={selectedReportData.location.coordinates}
                      address={selectedReportData.location.address}
                      incidentTime={selectedReportData.incident.time}
                    />

                    <div className="mt-4 p-3 bg-gradient-to-r from-slate-50 to-purple-50 rounded-lg border border-slate-200">
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full border border-white shadow-sm"></div>
                          <span>
                            Incident: {selectedReportData.location.coordinates.lat},{" "}
                            {selectedReportData.location.coordinates.lng}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-purple-500" />
                          <span>Time: {selectedReportData.incident.time}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Police Action Panel */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Shield className="w-5 h-5 text-purple-600" />
                      Police Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <Button
                      className="w-full justify-start bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => updateReportStatus(selectedReportData.id, "verified")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Report
                    </Button>

                    <Button
                      className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => updateReportStatus(selectedReportData.id, "contacted")}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Claimer
                    </Button>

                    <Button
                      className="w-full justify-start bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200"
                      variant="outline"
                      onClick={() => updateReportStatus(selectedReportData.id, "flagged")}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Flag for Follow-up
                    </Button>

                    <Button
                      className="w-full justify-start bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>

                    <Button
                      className="w-full justify-start bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Evidence
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="text-sm text-slate-800">Report Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Priority:</span>
                      <Badge
                        className={cn(
                          "text-xs font-medium",
                          selectedReportData.priority === "high"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : selectedReportData.priority === "medium"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200",
                        )}
                      >
                        {selectedReportData.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Evidence:</span>
                      <span className="text-sm text-slate-800 font-medium">Webcam footage</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Witnesses:</span>
                      <span className="text-sm text-slate-800 font-medium">None present</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">AI Confidence:</span>
                      <span className="text-sm text-purple-700 font-medium">94%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
