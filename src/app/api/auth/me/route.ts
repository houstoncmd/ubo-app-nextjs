import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

/**
 * GET /api/auth/me
 * Proxies to FastAPI backend: GET /api/auth/me
 * Returns current user info based on session_id cookie.
 */
export async function GET(request: NextRequest) {
  return proxyToBackend("/api/auth/me", request, {
    method: "GET",
  });
}
