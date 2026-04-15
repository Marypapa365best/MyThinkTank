import type { Metadata } from "next";
import { Piazzolla } from "next/font/google";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DisclaimerBanner from "@/components/DisclaimerBanner";

// Piazzolla: variable serif, optical sizing, strong italic — editorial signature for Latin text
const piazzolla = Piazzolla({
  subsets: ["latin"],
  variable: "--font-piazzolla",
  display: "swap",
});

// Inter: clean sans-serif for UI / body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "我的智囊 · My Think Tank",
  description:
    "一站式AI智库咨询平台。用巴菲特分析投资，用马斯克思考创新，用顶级专家的思维框架做出更好的决策。",
  keywords: ["AI咨询", "智囊", "巴菲特", "马斯克", "思维框架", "think tank"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="zh" className={`${piazzolla.variable} ${inter.variable}`}>
        <head>
          {/* Noto Serif SC — 思源宋体: Google Fonts CDN handles CJK unicode-range
              subsetting automatically, only downloads characters on screen */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="bg-[#fbf9f2] text-[#1b1c18] font-sans antialiased">
          <Navbar />
          <main>{children}</main>
          <Footer />
          <DisclaimerBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}
