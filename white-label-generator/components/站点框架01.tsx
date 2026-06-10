"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function 站点框架01({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return <main className="relative min-h-screen">{children}</main>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(circle_at_top,rgba(150,20,26,0.18),transparent_62%)]" />
      <div className="pointer-events-none absolute right-[-140px] top-[120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(202,168,95,0.18),transparent_68%)] blur-3xl" />
      <div className="pointer-events-none absolute left-[-160px] top-[360px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(125,15,19,0.1),transparent_72%)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-[1480px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="lp-shell-card mb-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="lp-badge">Longpai Food Internal Suite</span>
                <span className="text-xs uppercase tracking-[0.28em] text-[color:var(--lp-muted)]">Modern Packaging Workbench</span>
              </div>
              <div>
                <h1 className="text-[clamp(1.7rem,3vw,2.5rem)] font-semibold tracking-[-0.03em] text-[color:var(--lp-ink)]">
                  龙牌食品股份有限公司标签系统
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--lp-muted-strong)]">
                  为龙牌食品股份有限公司提供统一的白标标签项目管理、模板编辑与预览导出工作台，强调清晰层级、快速访问和稳定交付。
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              <Link className={`lp-nav-pill ${pathname === "/labels" ? "lp-nav-pill-active" : ""}`} href="/labels">
                项目列表
              </Link>
              <Link className={`lp-nav-pill ${pathname === "/labels/new" ? "lp-nav-pill-active" : ""}`} href="/labels/new">
                新建项目
              </Link>
              <Link className="lp-nav-pill" href="/">
                登录入口
              </Link>
            </nav>
          </div>
        </header>

        <main className="relative flex-1">{children}</main>
      </div>
    </div>
  );
}
