import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSL TMS",
  description: "Vehicle search and detail screens for DSL TMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/search" className="text-lg font-bold tracking-tight text-slate-950">
              DSL TMS
            </Link>
            <nav className="text-sm font-medium text-slate-600">
              <Link href="/search" className="rounded-full px-3 py-2 hover:bg-slate-100 hover:text-slate-950">
                차량 검색
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
