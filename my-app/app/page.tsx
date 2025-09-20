"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Mic,
  Brain,
  Shield,
  Car,
  Wrench,
  Truck,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  Menu,
  X,
  ChevronRight,
  FileText,
  AlertTriangle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NodeStatus = "pending" | "processing" | "completed" | "error"
type ClaimType = "collision" | "theft" | "vandalism" | "weather" | "fire" | "flood"
type ClaimSeverity = "minor" | "moderate" | "severe" | "total-loss"

/* --- helper functions now in module scope --- */
const getStatusColor = (status: NodeStatus) => {
  switch (status) {
    case "completed":
      return "bg-green-500"
    case "processing":
      return "bg-yellow-500"
    case "error":
      return "bg-red-500"
    default:
      return "bg-gray-300"
  }
}

const getStatusIcon = (status: NodeStatus) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case "processing":
      return <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-600" />
    default:
      return <Clock className="w-4 h-4 text-gray-400" />
  }
}

const getClaimTypeIcon = (type: ClaimType) => {
  switch (type) {
    case "collision":
      return <Car className="w-4 h-4" />
    case "theft":
      return <Shield className="w-4 h-4" />
    case "vandalism":
      return <AlertTriangle className="w-4 h-4" />
    case "weather":
      return <Zap className="w-4 h-4" />
    case "fire":
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    case "flood":
      return <Zap className="w-4 h-4 text-blue-500" />
    default:
      return <FileText className="w-4 h-4" />
  }
}

const getSeverityColor = (severity: ClaimSeverity) => {
  switch (severity) {
    case "minor":
      return "bg-green-100 text-green-800 border-green-200"
    case "moderate":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "severe":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "total-loss":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}
/* -------------------------------------------- */

interface NodeData {
  id: string
  title: string
  token: string
  status: NodeStatus
  icon: React.ReactNode
  description: string
  details?: string[]
  cost?: number
  eta?: string
}

interface ClaimCase {
  id: string
  claimNumber: string
  type: ClaimType
  severity: ClaimSeverity
  description: string
  location: string
  dateTime: string
  estimatedCost: number
  status: "new" | "in-progress" | "completed" | "pending-review"
  vehicleInfo: string
}

function NodeCard({
  node,
  onClick,
  isSelected,
}: {
  node: NodeData
  onClick: () => void
  isSelected: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-64 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white/80 backdrop-blur-sm rounded-lg border",
        isSelected && "ring-2 ring-purple-500 shadow-lg",
        node.status === "completed" && "bg-green-50 border-green-200",
        node.status === "processing" && "bg-yellow-50 border-yellow-200",
        node.status === "error" && "bg-red-50 border-red-200",
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">{node.icon}</div>
            {getStatusIcon(node.status)}
          </div>
          {node.status === "completed" && (
            <Badge variant="outline" className="text-xs font-mono">
              {node.token}
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-slate-800 mb-1">{node.title}</h3>
        <p className="text-sm text-slate-600 mb-3">{node.description}</p>

        <div className="flex items-center justify-between text-xs text-slate-500">
          {node.eta && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> ETA: {node.eta}
            </span>
          )}
          {node.cost && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> ${node.cost}
            </span>
          )}
        </div>

        {/* progress bar */}
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500", getStatusColor(node.status))}
            style={{
              width: node.status === "completed" ? "100%" : node.status === "processing" ? "60%" : "0%",
            }}
          />
        </div>
      </div>
    </div>
  )
}

function DetailPanel({
  node,
  onClose,
}: {
  node: NodeData
  onClose: () => void
}) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-purple-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">{node.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{node.title}</h2>
              {node.status === "completed" && (
                <Badge variant="outline" className="font-mono">
                  {node.token}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Process Details</h3>
            <ul className="space-y-2">
              {node.details?.map((d) => (
                <li key={d} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              {getStatusIcon(node.status)}
              <span className="capitalize">{node.status}</span>
            </div>

            {node.cost && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-semibold">Cost: ${node.cost}</span>
              </div>
            )}

            {node.eta && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">ETA: {node.eta}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LiveDispatchPrototype() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [simulationStarted, setSimulationStarted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedCase, setSelectedCase] = useState<string | null>(null)

  const [nodes, setNodes] = useState<NodeData[]>([
    {
      id: "user-input",
      title: "Incident Report",
      token: "0x9e7a...3f42",
      status: "pending",
      icon: <Mic className="w-6 h-6" />,
      description: "User submits incident data",
      details: [
        "Voice claim recorded",
        "Webcam footage captured",
        "Photos with GPS metadata",
        "Timestamp: 2024-01-19 14:30:22",
      ],
    },
    {
      id: "ai-generator",
      title: "AI Report Generator",
      token: "0x4c8b...7d91",
      status: "pending",
      icon: <Brain className="w-6 h-6" />,
      description: "Processing incident data with AI",
      details: ["Voice-to-text conversion", "Image damage analysis", "Metadata correlation", "Confidence score: 94%"],
    },
    {
      id: "insurance",
      title: "Insurance Verification",
      token: "0x2f5e...9a83",
      status: "pending",
      icon: <Shield className="w-6 h-6" />,
      description: "Smart contract validation",
      details: ["Policy verification", "Coverage limits check", "Blockchain validation", "Contract execution"],
    },
    {
      id: "police",
      title: "Police Department",
      token: "0x8d1c...6e47",
      status: "pending",
      icon: <Badge className="w-6 h-6" />,
      description: "Evidence verification",
      details: ["Digital forensics", "Report cross-reference", "Legal compliance", "Investigation status"],
    },
    {
      id: "workshop",
      title: "Workshop Coordination",
      token: "0x3a9f...2b58",
      status: "pending",
      icon: <Wrench className="w-6 h-6" />,
      description: "Service provider coordination",
      details: ["Provider selection", "Capacity check", "Quality assurance", "Service assignment"],
    },
    {
      id: "towing",
      title: "Towing Services",
      token: "0x7b4e...8c29",
      status: "pending",
      icon: <Truck className="w-6 h-6" />,
      description: "Emergency towing dispatch",
      details: ["GPS dispatch", "Route optimization", "Driver assignment", "Real-time tracking"],
      eta: "25 mins",
      cost: 150,
    },
    {
      id: "repair",
      title: "Repair Services",
      token: "0x5f2a...4d73",
      status: "pending",
      icon: <Car className="w-6 h-6" />,
      description: "Automated repair estimation",
      details: ["Damage assessment", "Parts availability", "Cost calculation", "Timeline planning"],
      cost: 2850,
    },
  ])

  const [claimCases] = useState<ClaimCase[]>([
    {
      id: "case-001",
      claimNumber: "0x9e8e...5b52",
      type: "collision",
      severity: "moderate",
      description: "Rear-end collision at intersection",
      location: "Main St & 5th Ave, Downtown",
      dateTime: "2024-01-19 14:30",
      estimatedCost: 3500,
      status: "in-progress",
      vehicleInfo: "2022 Honda Civic",
    },
    {
      id: "case-002",
      claimNumber: "0xbb23...8e4e",
      type: "theft",
      severity: "total-loss",
      description: "Vehicle stolen from parking garage",
      location: "City Center Parking Garage",
      dateTime: "2024-01-19 08:15",
      estimatedCost: 28000,
      status: "new",
      vehicleInfo: "2021 BMW X3",
    },
    {
      id: "case-003",
      claimNumber: "0xb233...832e",
      type: "vandalism",
      severity: "minor",
      description: "Keyed paint and broken side mirror",
      location: "Residential Area, Oak Street",
      dateTime: "2024-01-18 22:45",
      estimatedCost: 850,
      status: "completed",
      vehicleInfo: "2020 Toyota Camry",
    },
    {
      id: "case-004",
      claimNumber: "0x7f4a...9c61",
      type: "weather",
      severity: "severe",
      description: "Hail damage to roof and windshield",
      location: "Suburban Mall Parking Lot",
      dateTime: "2024-01-18 16:20",
      estimatedCost: 4200,
      status: "pending-review",
      vehicleInfo: "2023 Ford F-150",
    },
    {
      id: "case-005",
      claimNumber: "0x3d8c...2a75",
      type: "fire",
      severity: "total-loss",
      description: "Engine fire due to electrical fault",
      location: "Highway 101, Mile Marker 45",
      dateTime: "2024-01-17 19:30",
      estimatedCost: 35000,
      status: "in-progress",
      vehicleInfo: "2019 Mercedes C-Class",
    },
    {
      id: "case-006",
      claimNumber: "0x6b1e...4f93",
      type: "flood",
      severity: "severe",
      description: "Water damage from flash flood",
      location: "River Valley Road",
      dateTime: "2024-01-16 11:15",
      estimatedCost: 12000,
      status: "new",
      vehicleInfo: "2021 Jeep Wrangler",
    },
  ])

  const startSimulation = () => {
    setSimulationStarted(true)

    // Simulate the workflow progression
    const progressSequence = [
      { nodeId: "user-input", delay: 1000 },
      { nodeId: "ai-generator", delay: 3000 },
      { nodeId: "insurance", delay: 7000 },
      { nodeId: "police", delay: 5000 },
      { nodeId: "workshop", delay: 9000 },
      { nodeId: "towing", delay: 9500 },
      { nodeId: "repair", delay: 11000 },
    ]

    progressSequence.forEach(({ nodeId, delay }) => {
      // Start processing
      setTimeout(() => {
        setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, status: "processing" } : node)))
      }, delay)

      // Complete processing
      setTimeout(() => {
        setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, status: "completed" } : node)))
      }, delay + 1500)
    })
  }

  const resetSimulation = () => {
    setSimulationStarted(false)
    setSelectedNode(null)
    setNodes((prev) => prev.map((node) => ({ ...node, status: "pending" })))
  }

  const loadCase = (caseData: ClaimCase) => {
    setSelectedCase(caseData.id)
    // Reset simulation when loading a new case
    resetSimulation()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Collapsible Sidebar */}
      <div className={cn("transition-all duration-300 bg-white shadow-lg", sidebarOpen ? "w-80" : "w-12")}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h2 className="text-lg font-semibold text-slate-800">Insurance Claims</h2>}
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {sidebarOpen && (
          <div className="p-4 space-y-3 max-h-[calc(100vh-80px)] overflow-y-auto">
            {claimCases.map((claimCase) => (
              <Card
                key={claimCase.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedCase === claimCase.id && "ring-2 ring-purple-500 bg-purple-50",
                )}
                onClick={() => loadCase(claimCase)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getClaimTypeIcon(claimCase.type)}
                      <span className="font-medium text-sm">{claimCase.claimNumber}</span>
                    </div>
                    <Badge className={cn("text-xs", getSeverityColor(claimCase.severity))}>{claimCase.severity}</Badge>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-800 mb-1">{claimCase.description}</h3>
                  <p className="text-xs text-slate-600 mb-2">{claimCase.vehicleInfo}</p>

                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {claimCase.dateTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />${claimCase.estimatedCost.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        claimCase.status === "completed" && "border-green-200 text-green-700",
                        claimCase.status === "in-progress" && "border-yellow-200 text-yellow-700",
                        claimCase.status === "new" && "border-blue-200 text-blue-700",
                        claimCase.status === "pending-review" && "border-orange-200 text-orange-700",
                      )}
                    >
                      {claimCase.status.replace("-", " ")}
                    </Badge>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Live Dispatch Simulation</h1>
            <p className="text-slate-600 mb-6">Blockchain-enabled emergency response and insurance claim processing</p>

            {selectedCase && (
              <div className="mb-4 p-3 bg-purple-100 rounded-lg">
                <p className="text-sm text-purple-800">
                  Active Case: {claimCases.find((c) => c.id === selectedCase)?.claimNumber} -{" "}
                  {claimCases.find((c) => c.id === selectedCase)?.description}
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button
                onClick={startSimulation}
                disabled={simulationStarted}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {simulationStarted ? "Simulation Running..." : "Start Simulation"}
              </Button>
              <Button onClick={resetSimulation} variant="outline">
                Reset
              </Button>
            </div>
          </div>

          {/* Workflow Visualization - No connections */}
          <div className="relative">
            {/* Node Grid */}
            <div className="flex justify-between items-center min-h-[400px] px-8">
              {/* Column 1: Incident Report */}
              <div className="flex justify-center w-64">
                <NodeCard
                  node={nodes[0]}
                  onClick={() => setSelectedNode(nodes[0].id)}
                  isSelected={selectedNode === nodes[0].id}
                />
              </div>

              {/* Column 2: AI Report Generator */}
              <div className="flex justify-center w-64">
                <NodeCard
                  node={nodes[1]}
                  onClick={() => setSelectedNode(nodes[1].id)}
                  isSelected={selectedNode === nodes[1].id}
                />
              </div>

              {/* Column 3: Dual Verification */}
              <div className="flex flex-col gap-8 justify-center w-64">
                <NodeCard
                  node={nodes[2]}
                  onClick={() => setSelectedNode(nodes[2].id)}
                  isSelected={selectedNode === nodes[2].id}
                />
                <NodeCard
                  node={nodes[3]}
                  onClick={() => setSelectedNode(nodes[3].id)}
                  isSelected={selectedNode === nodes[3].id}
                />
              </div>

              {/* Column 4: Workshop Services */}
              <div className="flex flex-col gap-4 justify-center w-64">
                <NodeCard
                  node={nodes[4]}
                  onClick={() => setSelectedNode(nodes[4].id)}
                  isSelected={selectedNode === nodes[4].id}
                />
                <NodeCard
                  node={nodes[5]}
                  onClick={() => setSelectedNode(nodes[5].id)}
                  isSelected={selectedNode === nodes[5].id}
                />
                <NodeCard
                  node={nodes[6]}
                  onClick={() => setSelectedNode(nodes[6].id)}
                  isSelected={selectedNode === nodes[6].id}
                />
              </div>
            </div>
          </div>

          {/* Details Panel */}
          {selectedNode && (
            <div className="mt-8">
              <DetailPanel node={nodes.find((n) => n.id === selectedNode)!} onClose={() => setSelectedNode(null)} />
            </div>
          )}

          {/* Status Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">
                    Completed: {nodes.filter((n) => n.status === "completed").length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold">
                    Processing: {nodes.filter((n) => n.status === "processing").length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">
                    Total Cost: ${nodes.reduce((sum, node) => sum + (node.cost || 0), 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
