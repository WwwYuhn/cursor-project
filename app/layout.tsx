import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apple 3D UI Previewer",
  description:
    "Preview uploaded UI mockups on polished Apple device renders in a real-time 3D scene.",
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
