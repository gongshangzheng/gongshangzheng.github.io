# 自动编译与部署

## 触发方式

每次向 `main` 分支推送代码时，GitHub Actions 会自动执行编译和部署：

```
push → main 分支 → GitHub Actions 触发 → build → deploy
```

也可以手动触发：进入仓库 Actions 页面 → 选择 "Build and Deploy" → Run workflow。

## 工作流说明

见 `.github/workflows/deploy.yml`：

| 步骤 | 说明 |
|------|------|
| Checkout | 拉取最新代码 |
| Setup Node.js | 安装 Node 20 |
| Install | `npm install` 安装依赖 |
| Build | `npm run build` 执行构建，生成 `public/` 目录 |
| Deploy | 将 `public/` 推送到 `gh-pages` 分支 |

## 本地预览

修改后、推送前，建议本地编译验证：

```bash
npm run build        # 编译
npx serve public     # 本地预览
```

## 部署目标

- **源码仓库**：`gongshangzheng/HtmlBlogs`（`main` 分支）
- **站点仓库**：`gongshangzheng/HtmlBlogs`（`gh-pages` 分支）
- **访问地址**：https://gongshangzheng.github.io

## 关键文件

| 文件 | 作用 |
|------|------|
| `build.js` | 构建脚本：解析 Markdown → 生成 HTML |
| `src/assets/css/hugo-theme.css` | 主题样式 |
| `public/` | 构建输出目录（由 CI 自动生成，不提交） |

## 注意事项

- `public/` 目录由 CI 自动生成，**不要手动修改后提交**
- 修改 CSS、模板、Markdown 后，只需 `git push` 到 `main`，部署自动完成
- 构建失败时检查 Actions 日志，通常是 Markdown 语法错误或 front matter 问题
