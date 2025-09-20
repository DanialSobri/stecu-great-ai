"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  MapPin,
  ImageIcon,
  FileText,
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
  DollarSign,
  Car,
  Play,
  Video,
  Wrench,
  Building,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ClaimStatus = "pending" | "review" | "approved" | "rejected" | "processing" | "completed"
type ClaimSeverity = "minor" | "moderate" | "severe" | "total-loss"
type ClaimType = "collision" | "theft" | "vandalism" | "weather" | "fire" | "flood"

interface InsuranceClaim {
  id: string
  claimNumber: string
  incidentType: string
  severity: ClaimSeverity
  type: ClaimType
  vehicle: {
    make: string
    model: string
    color: string
    registration: string
  }
  status: ClaimStatus
  submissionDate: string
  location: {
    address: string
    coordinates: { lat: number; lng: number }
    context: string
  }
  claimer: {
    name: string
    contact: string
    email: string
  }
  policeReport: {
    tokenId: string
    title: string
    date: string
    aiNarrative: string
    status: string
  }
  repairEstimate: {
    components: Array<{
      component: string
      description: string
      cost: number
    }>
    total: number
    workshopQuote: string
  }
  multimedia: {
    photos: Array<{
      filename: string
      timestamp: string
      description: string
    }>
    videos: Array<{
      filename: string
      duration: string
      description: string
      source: string
    }>
  }
  priority: "low" | "medium" | "high"
}

const getStatusColor = (status: ClaimStatus) => {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200"
    case "completed":
      return "bg-slate-50 text-slate-600 border-slate-200"
    case "review":
      return "bg-purple-50 text-purple-700 border-purple-200"
    default:
      return "bg-amber-50 text-amber-700 border-amber-200"
  }
}

const getSeverityColor = (severity: ClaimSeverity) => {
  switch (severity) {
    case "total-loss":
      return "bg-red-500"
    case "severe":
      return "bg-orange-500"
    case "moderate":
      return "bg-amber-500"
    default:
      return "bg-emerald-500"
  }
}

const getTypeIcon = (type: ClaimType) => {
  switch (type) {
    case "collision":
      return <Car className="w-4 h-4" />
    case "theft":
      return <Shield className="w-4 h-4" />
    case "vandalism":
      return <AlertTriangle className="w-4 h-4" />
    case "weather":
      return <AlertTriangle className="w-4 h-4" />
    case "fire":
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    case "flood":
      return <AlertTriangle className="w-4 h-4 text-blue-500" />
    default:
      return <FileText className="w-4 h-4" />
  }
}

// Leaflet Map Component
function LeafletMap({
  coordinates,
  address,
  claimNumber,
}: {
  coordinates: { lat: number; lng: number }
  address: string
  claimNumber: string
}) {
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null)
  const [map, setMap] = useState<any>(null)

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
            ">🚗</div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      })

      L.marker([coordinates.lat, coordinates.lng], { icon: incidentIcon })
        .addTo(mapInstance)
        .bindPopup(`
          <div style="font-family: system-ui; font-size: 12px;">
            <strong>Claim: ${claimNumber}</strong><br/>
            ${address}<br/>
            <small style="color: #6B7280;">Hit-and-run incident</small>
          </div>
        `)

      // Add escape route (mock)
      const escapeRoute = [
        [coordinates.lat, coordinates.lng],
        [coordinates.lat + 0.001, coordinates.lng + 0.002],
        [coordinates.lat + 0.002, coordinates.lng + 0.004],
      ]

      L.polyline(escapeRoute, { color: "#EF4444", weight: 3, opacity: 0.7, dashArray: "5, 10" })
        .addTo(mapInstance)
        .bindPopup("Suspected escape route")

      // Add nearby landmarks
      const landmarks = [
        { lat: coordinates.lat + 0.001, lng: coordinates.lng + 0.0015, name: "Dengkil Cafe", type: "cafe" },
        { lat: coordinates.lat - 0.0008, lng: coordinates.lng - 0.001, name: "Webcam Source", type: "camera" },
      ]

      landmarks.forEach((landmark) => {
        const landmarkIcon = L.divIcon({
          className: "custom-landmark-marker",
          html: `
            <div style="
              background: ${landmark.type === "cafe" ? "#F59E0B" : "#6366F1"};
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
  }, [mapContainer, coordinates, address, claimNumber])

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
        className="w-full h-64 rounded-lg border border-slate-200 shadow-sm"
        style={{ background: "#F8FAFC" }}
      />
    </>
  )
}

export default function InsuranceDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<string>("claim-001")

  const [claims] = useState<InsuranceClaim[]>([
    {
      id: "claim-001",
      claimNumber: "0x9e8e...5b52",
      incidentType: "Vehicle Collision – Hit-and-Run in Driveway",
      severity: "moderate",
      type: "collision",
      vehicle: {
        make: "Proton",
        model: "Saga FLX",
        color: "Blue",
        registration: "WXY 9218",
      },
      status: "review",
      submissionDate: "19 July 2025 – 08:42 MYT",
      location: {
        address: "Driveway near Dengkil Cafe, Jalan Cempaka, Selangor",
        coordinates: { lat: 2.861422, lng: 101.675189 },
        context: "Shared driveway with morning traffic. Webcam footage provided by adjacent retail shop.",
      },
      claimer: {
        name: "Ahmad R.",
        contact: "+60-1X-XXX-XXXX",
        email: "ahmad.report@example.my",
      },
      policeReport: {
        tokenId: "0x9e8e…5b52",
        title: "Side Mirror Damage – Suspect Fled Scene from Driveway",
        date: "19 July 2025 – 08:42 MYT",
        aiNarrative:
          "At 08:36 MYT, a white Perodua Axia side-swiped the parked Proton Saga, damaging its left mirror. The driver exited the scene rapidly. Incident captured by third-party webcam.",
        status: "✅ Acknowledged",
      },
      repairEstimate: {
        components: [
          {
            component: "Side Mirror (Left)",
            description: "Torn off, fragments visible",
            cost: 250,
          },
          {
            component: "Panel Touch-Up",
            description: "Light scrape below mirror",
            cost: 150,
          },
        ],
        total: 400,
        workshopQuote: "Pending final approval",
      },
      multimedia: {
        photos: [
          {
            filename: "20250719_mirror_damage.jpg",
            timestamp: "08:37 MYT",
            description: "Fractured mirror, parked Proton Saga in blue",
          },
        ],
        videos: [
          {
            filename: "DengkilCam_0840_clip01.mp4",
            duration: "12s",
            description: "Suspect vehicle scraping mirror, immediate departure",
            source: "USB Webcam, Retail Shop Window Frame",
          },
        ],
      },
      priority: "medium",
    },
    {
      id: "claim-002",
      claimNumber: "0x6b1e...4f93",
      incidentType: "Motorcycle Theft from Shopping Mall",
      severity: "total-loss",
      type: "theft",
      vehicle: {
        make: "Honda",
        model: "Wave 125",
        color: "Red",
        registration: "ABC 1234",
      },
      status: "approved",
      submissionDate: "19 July 2025 – 14:15 MYT",
      location: {
        address: "Sunway Pyramid Shopping Mall, Parking Level B2, Petaling Jaya",
        coordinates: { lat: 3.0738, lng: 101.6065 },
        context: "Covered parking area with CCTV coverage. High-traffic shopping district.",
      },
      claimer: {
        name: "Siti N.",
        contact: "+60-1Y-YYY-YYYY",
        email: "siti.n@example.my",
      },
      policeReport: {
        tokenId: "0xb233…832e",
        title: "Motorcycle Theft from Shopping Mall Parking",
        date: "19 July 2025 – 14:15 MYT",
        aiNarrative: "Organized theft of motorcycle from secured parking area. Two suspects worked in coordination.",
        status: "✅ Acknowledged",
      },
      repairEstimate: {
        components: [
          {
            component: "Total Loss",
            description: "Vehicle stolen, not recovered",
            cost: 8500,
          },
        ],
        total: 8500,
        workshopQuote: "N/A - Total Loss",
      },
      multimedia: {
        photos: [
          {
            filename: "20250719_empty_parking.jpg",
            timestamp: "14:20 MYT",
            description: "Empty parking bay where motorcycle was parked",
          },
        ],
        videos: [
          {
            filename: "mall_security_cam.mp4",
            duration: "45s",
            description: "Two suspects stealing motorcycle",
            source: "Mall Security Camera System",
          },
        ],
      },
      priority: "high",
    },
    {
      id: "claim-003",
      claimNumber: "0x93...4341",
      incidentType: "Minor Fender Bender at Traffic Light",
      severity: "minor",
      type: "collision",
      vehicle: {
        make: "Toyota",
        model: "Vios",
        color: "White",
        registration: "DEF 5678",
      },
      status: "completed",
      submissionDate: "18 July 2025 – 16:30 MYT",
      location: {
        address: "Intersection of Jalan Ampang & Jalan Tun Razak, Kuala Lumpur",
        coordinates: { lat: 3.1569, lng: 101.7158 },
        context: "Busy intersection with traffic light control. Multiple CCTV cameras present.",
      },
      claimer: {
        name: "David L.",
        contact: "+60-1Z-ZZZ-ZZZZ",
        email: "david.l@example.my",
      },
      policeReport: {
        tokenId: "0xbb23…8e4e",
        title: "Minor Fender Bender at Traffic Light",
        date: "18 July 2025 – 16:30 MYT",
        aiNarrative: "Standard rear-end collision at controlled intersection. Both parties remained at scene.",
        status: "✅ Acknowledged",
      },
      repairEstimate: {
        components: [
          {
            component: "Rear Bumper",
            description: "Minor scratches and small dent",
            cost: 180,
          },
        ],
        total: 180,
        workshopQuote: "Completed - Paid",
      },
      multimedia: {
        photos: [
          {
            filename: "20250718_bumper_damage.jpg",
            timestamp: "16:35 MYT",
            description: "Minor rear bumper damage",
          },
        ],
        videos: [
          {
            filename: "traffic_cam_collision.mp4",
            duration: "8s",
            description: "Rear-end collision at red light",
            source: "Traffic Management System Camera",
          },
        ],
      },
      priority: "low",
    },
  ])

  const selectedClaimData = claims.find((c) => c.id === selectedClaim)

  const updateClaimStatus = (claimId: string, newStatus: ClaimStatus) => {
    console.log(`Updating claim ${claimId} to status: ${newStatus}`)
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
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Insurance Claims</h2>
                  <p className="text-xs text-purple-600">Claim Management System</p>
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
            {claims.map((claim) => (
              <Card
                key={claim.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 shadow-sm",
                  selectedClaim === claim.id
                    ? "ring-2 ring-purple-400 bg-gradient-to-br from-purple-50 to-lavender-50 shadow-purple-100"
                    : "bg-white/80 hover:bg-purple-50/50",
                )}
                onClick={() => setSelectedClaim(claim.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full shadow-sm", getSeverityColor(claim.severity))} />
                      <span className="font-medium text-sm font-mono text-slate-700">{claim.claimNumber}</span>
                    </div>
                    <Badge className={cn("text-xs font-medium", getStatusColor(claim.status))}>{claim.status}</Badge>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-800 mb-2 line-clamp-2 leading-relaxed">
                    {claim.incidentType}
                  </h3>

                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(claim.type)}
                    <span className="text-xs text-slate-600">
                      {claim.vehicle.make} {claim.vehicle.model} - {claim.vehicle.color}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      <span>{claim.submissionDate.split(" – ")[0]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-purple-400" />
                      <span>RM {claim.repairEstimate.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Star className={cn("w-3 h-3", getSeverityColor(claim.severity).replace("bg-", "text-"))} />
                      <span className="text-xs text-slate-500 capitalize">{claim.severity}</span>
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
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-purple-800 bg-clip-text text-transparent">
                  Insurance Claims Dashboard
                </h1>
                <p className="text-slate-600 mt-1">Comprehensive claim management and review system</p>
              </div>
            </div>

            {selectedClaimData && (
              <div className="bg-gradient-to-r from-purple-50 to-lavender-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">
                    Active Claim: {selectedClaimData.claimNumber} - {selectedClaimData.incidentType}
                  </span>
                </div>
              </div>
            )}
          </div>

          {selectedClaimData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Claim View - Takes up 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Claim Metadata */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Claim Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">Claim Number</label>
                        <div className="font-mono text-sm bg-gradient-to-r from-purple-50 to-lavender-50 p-3 rounded-lg border border-purple-100">
                          {selectedClaimData.claimNumber}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">Status</label>
                        <Badge className={cn("text-sm px-3 py-1", getStatusColor(selectedClaimData.status))}>
                          {selectedClaimData.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">Incident Type</label>
                        <p className="text-sm text-slate-800">{selectedClaimData.incidentType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">Severity</label>
                        <Badge
                          className={cn(
                            "text-xs",
                            selectedClaimData.severity === "total-loss"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : selectedClaimData.severity === "severe"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : selectedClaimData.severity === "moderate"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200",
                          )}
                        >
                          {selectedClaimData.severity}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Vehicle Information</label>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-800">
                          {selectedClaimData.vehicle.make} {selectedClaimData.vehicle.model} |{" "}
                          {selectedClaimData.vehicle.color} | Reg: {selectedClaimData.vehicle.registration}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Context */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      Incident Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Address</label>
                      <p className="text-sm text-slate-800">{selectedClaimData.location.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">GPS Coordinates</label>
                        <div className="font-mono text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {selectedClaimData.location.coordinates.lat}, {selectedClaimData.location.coordinates.lng}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">Submission Date</label>
                        <div className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {selectedClaimData.submissionDate}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Context</label>
                      <div className="text-sm text-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                        {selectedClaimData.location.context}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Police Report Summary */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Shield className="w-5 h-5 text-purple-600" />
                      Police Report Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">Token ID</label>
                        <div className="font-mono text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {selectedClaimData.policeReport.tokenId}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">Police Status</label>
                        <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                          {selectedClaimData.policeReport.status}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Report Title</label>
                      <p className="text-sm text-slate-800">{selectedClaimData.policeReport.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">AI Narrative</label>
                      <div className="bg-gradient-to-r from-purple-50 to-lavender-50 p-4 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-900 leading-relaxed">
                          {selectedClaimData.policeReport.aiNarrative}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Repair Estimate */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Wrench className="w-5 h-5 text-purple-600" />
                      Estimated Repair Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-lg border border-slate-200">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Component</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                                Damage Description
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">
                                Estimated Cost (MYR)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {selectedClaimData.repairEstimate.components.map((component, index) => (
                              <tr key={index} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-sm font-medium text-slate-800">{component.component}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{component.description}</td>
                                <td className="px-4 py-3 text-sm font-medium text-slate-800 text-right">
                                  RM {component.cost.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-purple-50">
                            <tr>
                              <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-slate-800">
                                Total Estimate
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-purple-800 text-right">
                                RM {selectedClaimData.repairEstimate.total.toLocaleString()}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">Workshop Quote</label>
                        <p className="text-sm text-slate-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                          {selectedClaimData.repairEstimate.workshopQuote}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Multimedia Evidence */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <ImageIcon className="w-5 h-5 text-purple-600" />
                      Multimedia Evidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        Photos
                      </h4>
                      <div className="space-y-3">
                        {selectedClaimData.multimedia.photos.map((photo, index) => (
                          <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-sm text-slate-700">{photo.filename}</span>
                              <span className="text-xs text-slate-500">{photo.timestamp}</span>
                            </div>
                            <p className="text-sm text-slate-600">{photo.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Video className="w-4 h-4 text-red-600" />
                        Video Evidence
                      </h4>
                      <div className="space-y-3">
                        {selectedClaimData.multimedia.videos.map((video, index) => (
                          <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Play className="w-4 h-4 text-red-600" />
                                <span className="font-mono text-sm text-slate-700">{video.filename}</span>
                              </div>
                              <span className="text-xs text-slate-500">{video.duration}</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-1">{video.description}</p>
                            <p className="text-xs text-slate-500">Source: {video.source}</p>
                          </div>
                        ))}
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
                      Map View
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <LeafletMap
                      coordinates={selectedClaimData.location.coordinates}
                      address={selectedClaimData.location.address}
                      claimNumber={selectedClaimData.claimNumber}
                    />

                    <div className="mt-4 p-3 bg-gradient-to-r from-slate-50 to-purple-50 rounded-lg border border-slate-200">
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full border border-white shadow-sm"></div>
                          <span>Incident Location</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm"></div>
                          <span>Suspect Escape Route</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow-sm"></div>
                          <span>Webcam Source</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance Officer Actions */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Building className="w-5 h-5 text-purple-600" />
                      Insurance Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <Button
                      className="w-full justify-start bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => updateClaimStatus(selectedClaimData.id, "approved")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Forward to Workshop
                    </Button>

                    <Button
                      className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => updateClaimStatus(selectedClaimData.id, "pending")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Request Additional Evidence
                    </Button>

                    <Button
                      className="w-full justify-start bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200"
                      variant="outline"
                      onClick={() => updateClaimStatus(selectedClaimData.id, "rejected")}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Flag for Suspect Trace
                    </Button>

                    <Button
                      className="w-full justify-start bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Full Claim Packet
                    </Button>

                    <Button
                      className="w-full justify-start bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View All Evidence
                    </Button>
                  </CardContent>
                </Card>

                {/* Claim Statistics */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-lavender-50 border-b border-purple-100">
                    <CardTitle className="text-sm text-slate-800">Claim Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Priority:</span>
                      <Badge
                        className={cn(
                          "text-xs font-medium",
                          selectedClaimData.priority === "high"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : selectedClaimData.priority === "medium"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200",
                        )}
                      >
                        {selectedClaimData.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Cost:</span>
                      <span className="text-sm text-slate-800 font-medium">
                        RM {selectedClaimData.repairEstimate.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Evidence Files:</span>
                      <span className="text-sm text-slate-800 font-medium">
                        {selectedClaimData.multimedia.photos.length + selectedClaimData.multimedia.videos.length} files
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Police Status:</span>
                      <span className="text-sm text-emerald-700 font-medium">Acknowledged</span>
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
