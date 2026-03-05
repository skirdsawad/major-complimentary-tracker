import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Backoffice - Complimentary Tracker",
  description: "Admin backoffice for the complimentary tracker system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="border-b border-border bg-card">
          <div className="container mx-auto flex h-14 items-center px-4 gap-6">
            <Link href="/" className="font-semibold text-primary">
              Backoffice
            </Link>
            <Link
              href="/giveaway-items"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Giveaway Items
            </Link>
            <Link
              href="/cinema-branches"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cinema Branches
            </Link>
            <Link
              href="/stock-management"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Stock Management
            </Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
