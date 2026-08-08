import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

/**
 * GET /api/dashboard/stats
 * Proxies to FastAPI backend: GET /api/dashboard/stats
 * Returns dashboard statistics (total searches, companies, UBOs, etc.)
 */
export async function GET(request: NextRequest) {
  return proxyToBackend("/api/dashboard/stats", request, {
    method: "GET",
  });
}
