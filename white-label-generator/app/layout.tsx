import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "White Label Generator",
  description: "Internal food label generation tool"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 rounded-[28px] border border-black/10 bg-white/80 px-5 py-4 shadow-panel backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-black/45">Longpai Internal Tool</p>
                <h1 className="text-2xl font-semibold tracking-tight">白标标签系统 / White Label Generator</h1>
              </div>
              <nav className="flex items-center gap-2 text-sm">
                <Link className="rounded-full border border-black/10 px-4 py-2 hover:bg-black hover:text-white" href="/labels">
                  标签列表 / Projects
                </Link>
                <Link className="rounded-full bg-ink px-4 py-2 text-white hover:bg-black" href="/labels/new">
                  新建标签 / New
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
