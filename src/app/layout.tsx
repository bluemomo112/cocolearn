import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "跨学科AI学习平台",
  description: "大规模个性化教学平台 - 跨学科AI学习平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
