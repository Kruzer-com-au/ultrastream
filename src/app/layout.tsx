import type { Viewport } from "next";
import { displayFont, bodyFont } from "@/styles/fonts";
import { ThemeProvider } from "next-themes";
import { Preloader } from "@/components/layout/preloader";
import { LenisProvider } from "@/lib/scroll/lenis-provider";
import { PerformanceProvider } from "@/hooks/usePerformanceMonitor";
import { StructuredData } from "@/components/seo/structured-data";
import { PlausibleProvider } from "@/components/analytics/plausible-provider";
import { generatePageMetadata } from "@/lib/metadata";
import "@/styles/globals.css";

export const metadata = generatePageMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${displayFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-abyss text-text-primary antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-gold focus:text-void focus:rounded-md focus:font-semibold focus:text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue"
        >
          Skip to content
        </a>
        <PlausibleProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <LenisProvider>
              <PerformanceProvider>
                <Preloader />
                {children}
              </PerformanceProvider>
            </LenisProvider>
          </ThemeProvider>
        </PlausibleProvider>
        <StructuredData />
      </body>
    </html>
  );
}
