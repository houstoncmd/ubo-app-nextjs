import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

/**
 * POST /api/auth/login
 * Proxies login credentials to FastAPI backend: POST /api/auth/login
 * The backend sets a session_id cookie which is forwarded to the browser.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();

  // Parse to extract credentials for logging (do not store)
  try {
    const creds = JSON.parse(body);
    console.log(`[Auth] Login attempt for employee: ${creds.employee_id || creds.username || "unknown"}`);
  } catch {
    // ignore parse errors
  }

  const response = await proxyToBackend("/api/auth/login", request, {
    method: "POST",
    body,
  });

  // If login was successful, ensure the Set-Cookie header is properly forwarded
  // so the session_id cookie gets set in the browser
  if (response.status === 200 || response.status === 201) {
    console.log("[Auth] Login successful, forwarding session cookie");
  } else {
    console.log(`[Auth] Login failed with status: ${response.status}`);
  }

  return response;
}
