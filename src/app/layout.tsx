import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypt Dialer",
  description: "Secure VOIP Bridge with E2EE handshake",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
