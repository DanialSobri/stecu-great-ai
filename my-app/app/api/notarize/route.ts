import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/**
 * Proxy route to avoid CORS errors when calling the external notarize endpoint.
 * All client-side requests should POST to /api/notarize instead of the ngrok URL.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    const res = await fetch("https://2f2279683902.ngrok-free.app/notarize", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // keepalive ensures the request is not cancelled on page unload
      keepalive: true,
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Notarize proxy error:", error)
    return NextResponse.json({ status: "error", message: "Failed to contact notarize service" }, { status: 500 })
  }
}
