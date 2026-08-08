import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

/**
 * POST /api/auth/login
 * Proxies login credentials to FastAPI backend: POST /login
 * The backend sets a session_id cookie which is forwarded to the browser.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();

  const response = await proxyToBackend("/login", request, {
    method: "POST",
    body,
    extraHeaders: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // Forward Set-Cookie and status from backend
  const headers: Record<string, string> = {};
  const setCookie = response.headers.get("Set-Cookie");
  if (setCookie) {
    headers["Set-Cookie"] = setCookie;
  }

  if (response.status === 303) {
    // Login successful — return 303 redirect to dashboard
    console.log("[Auth] Login successful, redirecting to /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url), {
      status: 303,
      headers,
    });
  }

  if (response.status === 401) {
    console.log("[Auth] Login failed: invalid credentials");
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Forward other responses
  const data = await response.text();
  return new Response(data, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json",
      ...headers,
    },
  });
}
