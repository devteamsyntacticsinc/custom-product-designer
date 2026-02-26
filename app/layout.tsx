import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import StructuredData from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Print Pro - Custom Product Designer",
    template: "%s | Print Pro"
  },
  description: "Design custom products with our easy-to-use online designer. Create personalized t-shirts, mugs, and more with professional printing quality.",
  keywords: ["custom products", "product designer", "t-shirt design", "custom printing", "personalized gifts", "online designer"],
  authors: [{ name: "Print Pro Team" }],
  creator: "Print Pro",
  publisher: "Print Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://print-pro-pi.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://print-pro-pi.vercel.app",
    siteName: "Print Pro",
    title: "Print Pro - Custom Product Designer",
    description: "Design custom products with our easy-to-use online designer. Create personalized t-shirts, mugs, and more.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Print Pro - Custom Product Designer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Print Pro - Custom Product Designer",
    description: "Design custom products with our easy-to-use online designer. Create personalized t-shirts, mugs, and more.",
    images: ["/og-image.jpg"],
    creator: "@printpro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData type="website" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
