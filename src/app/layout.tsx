import type { Metadata } from "next";
import "./globals.css";
import { currentTheme, generateCSSVariables } from "@/config/theme.config";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "跨学科AI学习平台",
  description: "大规模个性化教学平台 - 跨学科AI学习平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 动态生成主题 CSS 变量
  const themeStyles = generateCSSVariables(currentTheme);

  return (
    <html lang="zh-CN">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { ${themeStyles} }` }} />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
