import Link from "next/link";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(135deg,#7f1015_0%,#94161d_34%,#b32226_62%,#7d0f13_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_30%),linear-gradient(180deg,rgba(30,7,9,0.16),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <img
          alt=""
          aria-hidden="true"
          className="h-auto w-[70vw] max-w-[1120px] min-w-[760px] object-contain"
          loading="eager"
          src="/龙形图标03.png"
        />
      </div>
      <div className="absolute bottom-[-60px] right-[-40px] hidden opacity-90 lg:block">
        <div className="h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,rgba(208,174,102,0.22),rgba(208,174,102,0.06)_48%,transparent_70%)] blur-2xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1480px] items-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.9fr)] lg:items-center">
          <section className="max-w-2xl text-[#fff8f1]">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#f7ddab] backdrop-blur">
              Longpai Food Internal Workbench
            </span>
            <div className="mt-6 flex items-center gap-4">
              <div className="rounded-[26px] border border-white/14 bg-white/10 p-3 backdrop-blur">
                <img alt="龙牌龙形图标" className="h-auto w-[120px] object-contain brightness-0 invert" loading="eager" src="/龙形图标03.png" />
              </div>
              <div className="h-px flex-1 bg-white/18" />
            </div>
            <h1 className="mt-6 text-[clamp(2.8rem,5vw,5.2rem)] font-semibold leading-[0.94] tracking-[-0.05em]">
              龙牌食品
              <br />
              股份有限公司
              <br />
              内部标签工作台
            </h1>
            <div className="mt-6 max-w-2xl space-y-3 text-base leading-8 text-white/82 sm:text-lg">
              <p>服务龙牌食品股份有限公司白标标签项目的创建、维护与确认，统一承接资料录入、模板编辑、预览校对与导出交付流程。</p>
              <p>入口页聚焦公司内部协作场景，保留中国红与品牌标识的识别度，同时确保后台工具需要的清晰、克制与高可读性。</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["服务对象", "龙牌食品股份有限公司内部项目、设计与交付协作人员"],
                ["核心流程", "项目建档、模板编辑、预览确认、PNG/PDF 导出"],
                ["页面基调", "中国红主视觉搭配品牌标识，保持专业与秩序感"]
              ].map(([title, copy]) => (
                <div className="rounded-[26px] border border-white/14 bg-white/[0.07] p-5 backdrop-blur" key={title}>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d18e]">{title}</div>
                  <p className="mt-3 text-base leading-7 text-white/84">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,252,247,0.97),rgba(255,245,234,0.92))] p-6 shadow-[0_32px_80px_rgba(42,8,10,0.3)] backdrop-blur sm:p-8">
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(208,174,102,0.22),transparent)]" />
            <div className="relative">
              <div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--lp-red-deep)]">Internal Access</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--lp-ink)]">龙牌内部登录入口</h2>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm leading-7 text-[color:var(--lp-muted-strong)]">
                <p>当前为龙牌食品股份有限公司标签系统访问入口。</p>
                <p>登录后可直接进入项目列表，并继续模板编辑、预览校对与导出流程。</p>
              </div>

              <form action="/api/auth/login" className="mt-8 space-y-4" method="POST">
                {next ? <input name="next" type="hidden" value={next} /> : null}
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[color:var(--lp-ink)]">内部账号</span>
                  <input autoComplete="username" className="lp-input" name="username" placeholder="请输入内部账号" />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[color:var(--lp-ink)]">访问口令</span>
                  <input autoComplete="current-password" className="lp-input" name="password" placeholder="请输入访问口令" type="password" />
                </label>

                {error === "invalid" ? (
                  <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    账号或口令不正确，请重新输入。
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-[rgba(125,15,19,0.08)] bg-[rgba(125,15,19,0.03)] px-4 py-4 text-sm leading-7 text-[color:var(--lp-muted-strong)]">
                    当前阶段保留核心访问动作，不引入新的身份体系。
                    <br />
                    后续如需接入龙牌实际账号体系，可直接接在当前入口结构上。
                  </div>
                )}

                <button className="lp-btn-primary w-full px-5 py-4 text-sm font-semibold tracking-[0.08em]" type="submit">
                  进入标签系统
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[color:var(--lp-muted)]">
                <span>龙牌白标项目管理 / 模板编辑 / 预览校对 / 导出交付</span>
                <Link className="font-medium text-[color:var(--lp-red-deep)]" href="/labels/new">
                  直接新建项目
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
