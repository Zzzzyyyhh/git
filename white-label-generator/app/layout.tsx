import type { Metadata } from "next";

import "@/app/globals.css";
import { 站点框架01 } from "@/components/站点框架01";

export const metadata: Metadata = {
  title: "龙牌食品股份有限公司标签系统",
  description: "龙牌食品股份有限公司内部白标标签管理工具",
  icons: {
    icon: "/龙形图标04.png",
    shortcut: "/龙形图标04.png",
    apple: "/龙形图标04.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[color:var(--lp-canvas)] text-[color:var(--lp-ink)]">
        <站点框架01>{children}</站点框架01>
      </body>
    </html>
  );
}
