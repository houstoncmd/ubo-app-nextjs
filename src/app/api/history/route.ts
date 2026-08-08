import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

/**
 * GET /api/history
 * Proxies to FastAPI backend: GET /api/history
 * Returns search history for the current user.
 */
export async function GET(request: NextRequest) {
  return proxyToBackend("/api/history", request, {
    method: "GET",
  });
}
