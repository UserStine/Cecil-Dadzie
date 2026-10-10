import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cecil Dadzie | Strategic Communications",
  description:
    "Official portfolio of Cecil Dadzie. Strategic communications, project management, advocacy and international development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
