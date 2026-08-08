import { NextRequest, NextResponse } from "next/server";
import http from "http";

const API_HOST = "ubo-app";
const API_PORT = 8000;

/**
 * POST /api/auth/login
 * Directly calls FastAPI /login using node:http (no redirect following).
 */
export async function POST(request: NextRequest) {
  const body = await request.text();

  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: API_HOST,
        port: API_PORT,
        path: "/login",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        console.log(`[Auth] FastAPI response: ${res.statusCode}`);

        // Collect Set-Cookie headers
        const setCookies = res.headers["set-cookie"];
        const cookieHeader = Array.isArray(setCookies)
          ? setCookies.join(", ")
          : setCookies || "";

        if (res.statusCode === 303) {
          // Login successful — return redirect with cookie
          console.log("[Auth] Login successful, redirecting to /dashboard");
          const headers: Record<string, string> = {
            Location: "/dashboard",
          };
          if (cookieHeader) {
            headers["Set-Cookie"] = cookieHeader;
          }
          resolve(new Response(null, { status: 303, headers }));
          return;
        }

        // Other responses — forward as-is
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const headers: Record<string, string> = {
            "Content-Type": res.headers["content-type"] || "application/json",
          };
          if (cookieHeader) {
            headers["Set-Cookie"] = cookieHeader;
          }
          resolve(new Response(data, { status: res.statusCode || 500, headers }));
        });
      }
    );

    req.on("error", (error) => {
      console.error("[Auth] Login error:", error);
      resolve(
        NextResponse.json(
          { error: "Backend service unavailable" },
          { status: 503 }
        )
      );
    });

    req.write(body);
    req.end();
  });
}
