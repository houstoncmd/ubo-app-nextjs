import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://ubo-app:8000";

/**
 * POST /api/auth/login
 * Directly calls FastAPI /login endpoint and forwards the session cookie.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();

  try {
    // Call FastAPI directly
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      redirect: "manual", // Don't follow 303 redirect
    });

    console.log(`[Auth] FastAPI response: ${response.status}`);

    // Forward Set-Cookie from FastAPI
    const setCookie = response.headers.get("Set-Cookie");

    if (response.status === 303) {
      // Login successful — return redirect to dashboard with cookie
      console.log("[Auth] Login successful, redirecting to /dashboard");
      const headers: Record<string, string> = {
        Location: "/dashboard",
      };
      if (setCookie) {
        headers["Set-Cookie"] = setCookie;
      }
      return new Response(null, { status: 303, headers });
    }

    // Login failed
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: response.status }
    );
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return NextResponse.json(
      { error: "Backend service unavailable" },
      { status: 503 }
    );
  }
}
