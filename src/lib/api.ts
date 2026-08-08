/**
 * Re-export API client utilities.
 * This file maintains backward compatibility with existing imports.
 */
export { apiFetch, proxyToBackend, buildForwardHeaders } from "./api-client";
export type { ApiResponse } from "./api-client";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
