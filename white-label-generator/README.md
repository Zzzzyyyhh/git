# White Label Generator

内部白标食品标签生成系统 MVP。当前版本定位为内网工具，运行在一台 Mac 主机上，局域网同事通过浏览器访问，并使用共享 Basic Auth 口令保护。

## 功能范围

- 标签项目列表 `/labels`
- 新建标签 `/labels/new`
- 编辑标签 `/labels/[id]/edit`
- 独立预览 `/labels/[id]/preview`
- SQLite 持久化
- 120mm × 120mm 外箱贴模板
- 字段实时预览
- 必填项校验
- 字符长度溢出提醒
- PDF 导出
- PNG 导出
- 全站 Basic Auth 保护

## 环境要求

- macOS
- Node.js 22 LTS
- `npm` / `npx`
- Google Chrome 或 Microsoft Edge

## 快速启动

```bash
cd /Users/zzzyyh/Documents/龙牌/white-label-generator
cp .env.example .env
npm install
npm run prisma:migrate
npm run build
npm run start
```

启动后访问：

- 本机：`http://localhost:3000`
- 局域网：`http://<你的局域网IP>:3000`

## 环境变量

```dotenv
DATABASE_URL="file:./prisma/data/label-projects.db"
APP_URL="http://localhost:3000"
BASIC_AUTH_USER="longpai"
BASIC_AUTH_PASS="change-this-password"
```

说明：

- `DATABASE_URL`：SQLite 文件路径
- `APP_URL`：建议填写实际访问地址
- `BASIC_AUTH_USER` / `BASIC_AUTH_PASS`：共享登录口令

## 常用命令

```bash
npm run dev
npm run dev:lan
npm run build
npm run start
npm run prisma:migrate
npm run prisma:studio
```

## 导出依赖

系统默认优先复用本机已安装的 Google Chrome 或 Microsoft Edge 导出 PDF/PNG。

如果机器上没有这两个浏览器，再执行：

```bash
npx playwright install chromium
```

## 项目结构

```text
white-label-generator/
├── app/
├── components/
├── deploy/
├── docs/
├── lib/
├── logs/
├── prisma/
└── scripts/
```

## 文档

- 用户手册：[`docs/USER_GUIDE.zh-CN.md`](/Users/zzzyyh/Documents/龙牌/white-label-generator/docs/USER_GUIDE.zh-CN.md)
- 运维说明：[`docs/OPS_GUIDE.zh-CN.md`](/Users/zzzyyh/Documents/龙牌/white-label-generator/docs/OPS_GUIDE.zh-CN.md)

## 开机自启

```bash
chmod +x scripts/start-lan.sh scripts/install-launch-agent.sh
./scripts/install-launch-agent.sh
```

LaunchAgent 模板：

- [`deploy/com.longpai.white-label-generator.plist`](/Users/zzzyyh/Documents/龙牌/white-label-generator/deploy/com.longpai.white-label-generator.plist)
