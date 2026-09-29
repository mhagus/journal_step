import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { auth } from "@/auth";

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
    default: "Step Traders | Professional Trading Journal",
    template: "%s | Step Traders",
  },
  description:
    "Step Traders — A professional trading journal and analytics dashboard for Forex, Crypto, and Indices traders. Track your performance, analyze your edge, and improve your trading.",
  keywords: [
    "trading journal",
    "forex journal",
    "trading analytics",
    "SMC trading",
    "trade tracker",
    "equity curve",
    "win rate calculator",
  ],
  authors: [{ name: "Step Traders" }],
  creator: "Step Traders",
  publisher: "Step Traders",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.jpg", type: "image/jpeg" },
    ],
    apple: [
      { url: "/icon.jpg", type: "image/jpeg" },
    ],
    shortcut: "/icon.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Step Traders",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "Step Traders",
    title: "Step Traders | Professional Trading Journal",
    description: "Track, analyze, and improve your trading performance with Step Traders.",
    images: [{ url: "/logo.jpg", width: 1400, height: 788, alt: "Step Traders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Step Traders | Professional Trading Journal",
    description: "Track, analyze, and improve your trading performance with Step Traders.",
    images: ["/logo.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/jpeg" href="/icon.jpg" />
        <link rel="apple-touch-icon" href="/icon.jpg" />
        <link rel="shortcut icon" href="/icon.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#020617" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="h-full text-white overflow-hidden bg-slate-950">
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
