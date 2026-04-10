import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const geist = Geist({ subsets: ["latin"] });

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
    <html lang="zh">
      <body
        className={`${geist.className} bg-[#0a0a0a] text-white antialiased`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
        <DisclaimerBanner />
      </body>
    </html>
  );
}
