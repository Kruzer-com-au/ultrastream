import { Oswald, Inter } from "next/font/google";

export const displayFont = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-family",
  display: "swap",
});

export const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body-family",
  display: "swap",
});
