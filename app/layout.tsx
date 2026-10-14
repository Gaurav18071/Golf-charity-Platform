import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Golf Charity Platform - Play Better, Give Better",
    template: "%s | Golf Charity Platform",
  },
  description: "A fundraising platform connecting golfers with charitable organizations. Support causes, track impact, and make a difference through golf.",
  keywords: ["golf charity", "fundraising", "donations", "nonprofit", "charity campaigns", "golf for good"],
  authors: [{ name: "Golf Charity Platform" }],
  creator: "Golf Charity Platform",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Golf Charity Platform",
    title: "Golf Charity Platform - Play Better, Give Better",
    description: "A fundraising platform connecting golfers with charitable organizations",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}