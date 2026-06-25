import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChrisZone — Personal Homepage",
  description: "Welcome 2 my awesome page!!",
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
