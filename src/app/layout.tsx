import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DisclaimerBanner from "@/components/DisclaimerBanner";

// Newsreader: optical sizing + italic support — the editorial signature font
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

// Inter: clean, precise sans for UI / body text
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
      <html lang="zh" className={`${newsreader.variable} ${inter.variable}`}>
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
