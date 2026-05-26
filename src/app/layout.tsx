import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "DSL TMS",
  description: "운송회사 차량관리 웹앱"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
