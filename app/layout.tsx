import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CookShelf",
  description: "A personal recipe archive that understands food.",
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
