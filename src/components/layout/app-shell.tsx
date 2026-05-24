import Link from "next/link";
import type { PropsWithChildren } from "react";

import { roleLabels, type Profile } from "@/lib/auth/get-profile";

export function AppShell({ children, profile }: PropsWithChildren<{ profile: Profile }>) {
  return (
    <>
      <header style={{ background: "#0f172a", color: "white", padding: "16px 0" }}>
        <div className="container" style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <Link href="/dashboard" style={{ fontSize: 20, fontWeight: 800 }}>
            DSL TMS
          </Link>
          <nav style={{ alignItems: "center", display: "flex", gap: 16 }}>
            <Link href="/search">검색</Link>
            {profile.role === "admin" ? <Link href="/admin/vehicles">관리</Link> : null}
            <span style={{ color: "#cbd5e1", fontSize: 14 }}>{roleLabels[profile.role]}</span>
          </nav>
        </div>
      </header>
      <main className="container" style={{ padding: "32px 0" }}>
        {children}
      </main>
    </>
  );
}
