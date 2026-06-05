# 白标标签系统使用手册

## 1. 打开系统

系统启动后：

- 你自己在本机打开：`http://localhost:3000`
- 同事在局域网打开：`http://你的局域网IP:3000`

如果你不知道自己的局域网 IP，在终端执行：

```bash
ipconfig getifaddr en0
```

如果 `en0` 没有结果，再试：

```bash
ipconfig getifaddr en1
```

## 2. 输入口令

浏览器会弹出登录框，输入共享口令：

- 用户名：查看 `.env` 中的 `BASIC_AUTH_USER`
- 密码：查看 `.env` 中的 `BASIC_AUTH_PASS`

## 3. 新建标签

1. 进入首页后点击“新建标签”
2. 系统会自动填入一套 `Bibimbap Sauce` 示例数据
3. 修改项目名称、状态和各个标签字段
4. 点击“创建标签项目”

创建成功后会自动进入编辑页。

## 4. 修改字段

编辑页左侧是表单，右侧是实时预览。

- `Product Name`：英文品名
- `中文品名`：中文名称
- `Net Weight`：净重/规格
- `Ingredients`：配料表
- `Allergen Declaration`：过敏原声明
- `Manufacturer / Importer`：生产商和进口商信息

修改内容后点击“保存修改”即可。

## 5. 查看溢出提醒

如果 `Ingredients`、地址等字段过长，预览上方会出现黄色提醒框。

含义是：

- 当前文字长度已经超过建议值
- 标签仍会尝试导出
- 但打印时可能会显得过密，建议人工缩短内容

第一版只做字符长度提醒，不会做真实排版碰撞检测。

## 6. 预览标签

有两种方式：

- 在编辑页右侧直接实时预览
- 点击“独立预览页”进入单独预览页面

## 7. 导出 PDF / PNG

在编辑页右上角：

- 点击“导出 PDF”：生成客户确认稿
- 点击“导出 PNG”：生成预览图片

常见用途：

- `PDF`：打印、正式确认
- `PNG`：微信、WhatsApp、内部讨论

## 8. 关闭系统

如果你是用终端启动的：

- 在运行窗口按 `Ctrl + C`

如果你是用开机自启：

```bash
launchctl unload ~/Library/LaunchAgents/com.longpai.white-label-generator.plist
```

## 9. 备份数据库

数据库文件默认位置：

```text
prisma/data/label-projects.db
```

备份方式：

1. 先停止服务
2. 复制这个文件到备份目录

终端示例：

```bash
cp prisma/data/label-projects.db ~/Desktop/label-projects-backup.db
```

## 10. 恢复数据库

1. 先停止服务
2. 用备份文件覆盖当前数据库文件
3. 重新启动服务

示例：

```bash
cp ~/Desktop/label-projects-backup.db prisma/data/label-projects.db
```
