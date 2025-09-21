"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X, Home, FileText, Smartphone, Shield, Badge, BarChart3, ChevronRight, Code } from "lucide-react"

interface NavigationItem {
  href: string
  label: string
  icon: React.ReactNode
  description: string
  category: "main" | "dashboards" | "tracking"
}

const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Home",
    icon: <Home className="w-5 h-5" />,
    description: "Live dispatch simulation",
    category: "main",
  },
  {
    href: "/guided-report",
    label: "Submit Claim",
    icon: <FileText className="w-5 h-5" />,
    description: "Step-by-step reporting",
    category: "main",
  },
  {
    href: "/claimer-dashboard",
    label: "Claimer Dashboard",
    icon: <Smartphone className="w-5 h-5" />,
    description: "Mobile claim submission",
    category: "main",
  },
  {
    href: "/insurance-dashboard",
    label: "Insurance Dashboard",
    icon: <Shield className="w-5 h-5" />,
    description: "Professional claim management",
    category: "dashboards",
  },
  {
    href: "/police-dashboard",
    label: "Police Dashboard",
    icon: <Badge className="w-5 h-5" />,
    description: "Report verification",
    category: "dashboards",
  },
  {
    href: "/post-submission",
    label: "Status Tracking",
    icon: <BarChart3 className="w-5 h-5" />,
    description: "Real-time progress",
    category: "tracking",
  },
  {
    href: "/api-test",
    label: "API Documentation",
    icon: <Code className="w-5 h-5" />,
    description: "Test and explore APIs",
    category: "tracking",
  },
]

const categoryLabels = {
  main: "Main Navigation",
  dashboards: "Professional Dashboards",
  tracking: "Status & Tracking",
}

export function NavigationDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleDrawer = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Toggle Button - Fixed position */}
      <Button
        onClick={toggleDrawer}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
 
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out",
          "w-80 border-r border-slate-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Navigation</h2>
              <p className="text-sm text-slate-600 mt-1">Autonomous Claim Solution</p>
            </div>
            <Button onClick={toggleDrawer} variant="ghost" size="sm" className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(categoryLabels).map(([category, label]) => {
            const items = navigationItems.filter((item) => item.category === category)

            return (
              <div key={category} className="mb-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">{label}</h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={toggleDrawer}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                          "hover:bg-purple-50 hover:shadow-sm",
                          isActive && "bg-purple-100 text-purple-700 shadow-sm border border-purple-200",
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-md transition-colors",
                            isActive
                              ? "bg-purple-200 text-purple-700"
                              : "bg-slate-100 text-slate-600 group-hover:bg-purple-200 group-hover:text-purple-600",
                          )}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn("font-medium text-sm", isActive ? "text-purple-700" : "text-slate-700")}>
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</div>
                        </div>
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isActive ? "text-purple-500" : "text-slate-400 group-hover:text-purple-500",
                          )}
                        />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500 text-center">
            <div className="font-medium">Autonomous Claim Solution</div>
            <div className="mt-1">Agentic AI empowered seamless claim resolution</div>
          </div>
        </div>
      </div>
    </>
  )
}
