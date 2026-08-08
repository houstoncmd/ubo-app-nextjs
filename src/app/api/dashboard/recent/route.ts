import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

/**
 * GET /api/dashboard/recent
 * Proxies to FastAPI backend: GET /api/dashboard/recent
 * Returns recent activity data.
 */
export async function GET(request: NextRequest) {
  return proxyToBackend("/api/dashboard/recent", request, {
    method: "GET",
  });
}
