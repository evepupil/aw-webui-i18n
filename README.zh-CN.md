# aw-webui 中文版

[English](README.md) | 简体中文

这是 [ActivityWatch](https://activitywatch.net/) Web UI 的国际化版本，基于官方 [aw-webui](https://github.com/ActivityWatch/aw-webui) 开发。

## 关于本项目

本项目是官方 aw-webui 的 fork，主要添加了多语言支持（i18n）功能。

### 支持的语言

- English (英语) - 默认
- 简体中文 (zh-CN)
- 繁體中文 (zh-TW)

### 主要改动

- 添加 vue-i18n 国际化框架
- 提取所有界面文本为翻译键
- 添加语言切换功能（设置 → 语言）
- 自动检测浏览器语言

## 使用方法

### 切换语言

1. 打开 ActivityWatch Web UI
2. 进入 **Settings**（设置）
3. 选择 **Language**（语言）
4. 从下拉菜单中选择你想要的语言

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器（连接到测试服务器 5666 端口）
npm run serve

# 或者连接到正式服务器（5600 端口）
# PowerShell:
$env:AW_SERVER_URL="http://127.0.0.1:5600"; npm run serve
# CMD:
set AW_SERVER_URL=http://127.0.0.1:5600&& npm run serve

# 构建生产版本
npm run build
```

### 替换官方 Web UI

1. 构建项目：`npm run build`
2. 将 `dist` 目录中的文件复制到 aw-server 的静态文件目录：
   - aw-server-python: `activitywatch/aw-server/aw_server/static/`
   - aw-server-rust: `activitywatch/aw-server-rust/static/`
3. 重启 ActivityWatch

## 贡献翻译

欢迎贡献新的语言翻译或改进现有翻译！

翻译文件位于 `src/i18n/locales/` 目录：
- `en.json` - 英语（基准）
- `zh-CN.json` - 简体中文
- `zh-TW.json` - 繁体中文

### 添加新语言

1. 复制 `en.json` 并重命名为对应的语言代码（如 `ja.json`）
2. 翻译所有文本
3. 在 `src/i18n/index.ts` 中注册新语言
4. 提交 Pull Request

## 上游同步

本项目会定期从官方仓库同步更新。如有冲突，以官方版本为准。

## 致谢

- [ActivityWatch](https://github.com/ActivityWatch/activitywatch) - 开源的自动时间追踪工具
- [aw-webui](https://github.com/ActivityWatch/aw-webui) - 官方 Web UI

## 许可证

与官方项目保持一致，采用 [MPL-2.0](LICENSE) 许可证。
