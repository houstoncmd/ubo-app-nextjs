"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Wraps the app layout — shows Navbar+Footer only after login.
 * Login, /terms, /privacy, and other public pages get no shell.
 */
const PUBLIC_ROUTES = ["/login", "/terms", "/privacy"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  return (
    <>
      {!isPublic && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isPublic && <Footer />}
    </>
  );
}
