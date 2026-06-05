# 白标标签系统运维说明

## 1. 安装标准 Node.js

建议安装 Node.js 22 LTS。安装完成后确认：

```bash
node -v
npm -v
npx -v
```

## 2. 初始化项目

进入项目目录：

```bash
cd /Users/zzzyyh/Documents/龙牌/white-label-generator
```

安装依赖：

```bash
npm install
```

复制环境变量：

```bash
cp .env.example .env
```

## 3. 配置环境变量

编辑 `.env`，至少确认这四项：

```dotenv
DATABASE_URL="file:./prisma/data/label-projects.db"
APP_URL="http://localhost:3000"
BASIC_AUTH_USER="longpai"
BASIC_AUTH_PASS="replace-with-a-real-password"
```

建议：

- `BASIC_AUTH_PASS` 使用复杂密码
- 局域网正式使用时，把 `APP_URL` 改成真实访问地址，例如 `http://192.168.1.25:3000`

## 4. 初始化数据库与浏览器

创建数据库：

```bash
npm run prisma:migrate
```

默认情况下，系统会优先复用本机已安装的 Google Chrome 或 Microsoft Edge 做导出，不强制下载 Playwright Chromium。

如果机器上没有 Chrome/Edge，再安装 Playwright Chromium：

```bash
npx playwright install chromium
```

## 5. 开发模式

本机开发：

```bash
npm run dev
```

局域网联调：

```bash
npm run dev:lan
```

## 6. 生产模式

构建：

```bash
npm run build
```

启动：

```bash
npm run start
```

因为 `start` 已经固定监听 `0.0.0.0:3000`，所以同网段同事可直接访问。

## 7. 开机自启

先确保已经完成：

- `npm install`
- `npm run build`
- `.env` 已配置

安装 LaunchAgent：

```bash
mkdir -p logs
chmod +x scripts/start-lan.sh scripts/install-launch-agent.sh
./scripts/install-launch-agent.sh
```

查看状态：

```bash
launchctl list | grep white-label-generator
```

重启服务：

```bash
launchctl kickstart -k gui/$(id -u)/com.longpai.white-label-generator
```

卸载自启：

```bash
launchctl unload ~/Library/LaunchAgents/com.longpai.white-label-generator.plist
rm ~/Library/LaunchAgents/com.longpai.white-label-generator.plist
```

## 8. 升级依赖

升级前先备份数据库。

更新依赖：

```bash
npm install
```

重新生成 Prisma Client 并构建：

```bash
npm run build
```

如果 Prisma schema 有变化，再执行迁移：

```bash
npm run prisma:migrate
```

## 9. 恢复数据

停止服务后恢复：

```bash
cp /path/to/backup.db prisma/data/label-projects.db
```

然后重启服务。

## 10. 故障排查

### 10.1 浏览器打不开

- 确认服务是否已启动
- 确认访问地址和端口是否正确
- 确认 macOS 防火墙是否拦截

### 10.2 导出 PDF/PNG 失败

优先检查：

```bash
npx playwright install chromium
```

如果本机已经安装 Chrome 或 Edge，也可以直接重启服务后重试。

### 10.3 口令不生效

- 检查 `.env` 是否存在
- 检查 `BASIC_AUTH_USER` 和 `BASIC_AUTH_PASS` 是否非空
- 修改 `.env` 后重启服务

### 10.4 查看日志

如果使用 LaunchAgent：

```bash
tail -f logs/stdout.log
tail -f logs/stderr.log
```
