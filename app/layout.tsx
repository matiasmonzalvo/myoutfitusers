import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { createServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { CardLayout } from "@/components/CardLayout";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: false,
  preload: true,
});

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.myout.fit"),
  title: "My Outfit",
  description: "Wear your outfits",
  openGraph: {
    type: "website",
    url: "https://www.myout.fit/",
    siteName: "My Outfit",
    title: "My Outfit",
    description: "Wear your outfits",
    images: [
      {
        url: "https://www.myout.fit/og-image-v2.png",
        width: 1200,
        height: 630,
        alt: "My Outfit preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Outfit",
    description: "Wear your outfits",
    images: ["https://www.myout.fit/og-image-v2.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <meta name="googlebot" content="notranslate" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        {META_PIXEL_ID && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body className="table-scroll font-sans antialiased">
        {META_PIXEL_ID && (
          <noscript>
            <img
              alt="meta-pixel"
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell isAuthenticated={!!user}>{children}</AppShell>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
