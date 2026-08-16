import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Kens.lk — School Books & Stationery",
    template: "%s | Kens.lk",
  },
  description:
    "Sri Lanka's trusted school bookshop for curriculum books, past papers, stationery, and grade booklist bundles. Serving Leeds International School with 13 branches island-wide.",
  keywords: [
    "school books",
    "past papers",
    "stationery",
    "Leeds International School",
    "Sri Lanka",
  ],
  openGraph: {
    type: "website",
    locale: "en_LK",
    siteName: "Kens.lk",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
