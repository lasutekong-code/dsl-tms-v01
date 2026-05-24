import "./globals.css";

export const metadata = {
  title: "DSL TMS",
  description: "Transport management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
