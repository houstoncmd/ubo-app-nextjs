import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

/**
 * GET /api/users
 * Proxies to FastAPI backend: GET /api/users
 * Returns list of all users (admin only).
 */
export async function GET(request: NextRequest) {
  return proxyToBackend("/api/users", request, {
    method: "GET",
  });
}
