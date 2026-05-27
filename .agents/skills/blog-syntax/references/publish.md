# 构建与发布

> 本文档由 html-blog SKILL.md 拆分而来。发布文章时按需读取。

---

## 构建与预览

```bash
# 构建
cd ~/gongshangzheng.github.io && node build.js

# 本地预览
python3 -m http.server 8080 --directory public
```

预期：tests passed，零失败。文件被正确处理后，博客可访问 `https://gongshangzheng.github.io/<slug>.html`。

---

## 提交发布

```bash
git add src/pages/<slug>.html
git commit -m "post: <标题>"
git push
```

部署平台：GitHub Pages（push 后自动触发 GitHub Actions）。

---

## 邮件通知（条件触发）

html-blog 发布流程的**最后一步**：读取文章的 `notify` frontmatter 字段，决定是否发邮件。

| notify 值 | 行为 |
|-----------|------|
| `true` | 执行 send.py 发送通知 |
| 缺失或 `false` | 跳过 |

### 标记方式

上游 skill 在调用 capture.js 时加 `--notify` 参数即可，无需自己处理邮件逻辑：

```bash
node ~/.hanako/skills/html-blog/capture.js <slug> --notify
```

`--notify` 会在 frontmatter 中自动写入 `notify: true`。

### 发送命令（供 agent 执行时参考）

当 frontmatter 中 `notify: true` 时，agent 执行以下命令发送邮件：

```bash
SLUG="<slug>"
TITLE="<标题>"
SEND_PY="$HOME/.hanako/skills/send-email/send.py"

# 绕过代理直连，避免 SMTP 握手超时
unset HTTPS_PROXY http_proxy HTTP_PROXY

python3 "$SEND_PY" \
  --template message \
  --subject "📄 $TITLE — 深度解读" \
  --data '{
    "emoji":"📄",
    "greeting":"报告已发布",
    "content":"完整内容已发布到博客。",
    "url":"https://gongshangzheng.github.io/'$SLUG'.html",
    "url_text":"📖 阅读 →",
    "button_color":"#2563eb"
  }'
```

> **上游 skill 注意**：不要在各自的 publish 阶段自行调用 send.py。如需发送邮件通知，在调用 capture.js 时加 `--notify` 即可，html-blog 统一负责发送。
```

---

## TOC 注入机制

构建系统在 `<!-- INJECT toc_sidebar -->` 占位符处自动注入 ToC 侧边栏。
- 扫描所有 `.ch-title` 章节标题生成折叠目录
- **禁止**手写 HTML 绕过 build pipeline
- **禁止**直接修改 `public/` 下的文件（会被下次构建覆盖）
