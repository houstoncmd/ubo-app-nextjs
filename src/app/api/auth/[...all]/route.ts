import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

// Better Auth catch-all route
// Handles all /api/auth/* requests not covered by specific route files
// (login, me, logout have their own route files)
// This catches: /api/auth/register, /api/auth/forgot-password, etc.

export async function GET(
  request: NextRequest,
  { params }: { params: { all: string[] } }
) {
  const path = `/api/auth/${params.all.join("/")}`;
  return proxyToBackend(path, request, { method: "GET" });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { all: string[] } }
) {
  const path = `/api/auth/${params.all.join("/")}`;
  return proxyToBackend(path, request, { method: "POST" });
}
