import { NextRequest, NextResponse } from "next/server";

// Better Auth catch-all route
// This handles all /api/auth/* requests and proxies to the backend
export async function GET(
  request: NextRequest,
  { params }: { params: { all: string[] } }
) {
  const path = params.all.join("/");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const url = new URL(`/api/auth/${path}`, apiUrl);
    url.search = request.nextUrl.search;

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Auth service unavailable" },
      { status: 503 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { all: string[] } }
) {
  const path = params.all.join("/");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const body = await request.text();
    const url = new URL(`/api/auth/${path}`, apiUrl);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("Content-Type") || "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Auth service unavailable" },
      { status: 503 }
    );
  }
}
