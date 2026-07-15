import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://lacuna-disappearing-color-atlas.netlify.app";

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LACUNA — An Atlas of Disappearing Color",
  description:
    "A cinematic field study in four fugitive moments, where movement agitates color and stillness lets it resolve.",
  applicationName: "LACUNA",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "LACUNA — Some colors only exist while they are leaving",
    description: "Move slowly through an interactive atlas of temporary color.",
    images: [{
      url: "/og.png",
      width: 1200,
      height: 630,
      alt: "LACUNA — An Atlas of Disappearing Color",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LACUNA — An Atlas of Disappearing Color",
    description: "A cinematic interactive study of temporary color.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#24133a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
