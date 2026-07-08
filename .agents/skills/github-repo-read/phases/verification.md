# Phase 6: 运行与验证（可选）

**目标**：在 Phase 5 已完成依赖安装与 smoke test 的基础上，在必要且成本可控时，通过实际运行更完整地验证代码理解和文档描述的准确性。

> **本阶段可跳过**。Phase 5 的依赖安装与 import smoke test 不可跳过；本阶段只负责更完整的运行验证。如果项目需要 GPU、外部密钥、大模型权重、长时间服务或用户未要求，直接标记为 `completed` 并注明跳过原因。

## 6.1 安装前评估

先读安装说明，再决定是否执行：

```bash
# 检查依赖大小
cat requirements.txt | xargs -I {} pip install --dry-run {} 2>&1 | grep "Would install"

# 检查是否需要 CUDA
grep -i "cuda\|gpu\|nvidia" requirements.txt setup.py pyproject.toml 2>/dev/null

# 检查是否需要外部服务/密钥
grep -ri "api_key\|token\|secret\|endpoint" .env* *.yaml *.json 2>/dev/null | head -10
```

### 跳过条件

| 条件 | 处理 |
|------|------|
| 需要 GPU 且本机无 GPU | 跳过，记录原因 |
| 需要外部 API 密钥 | 跳过，记录原因 |
| 依赖 > 2GB | 跳过，记录原因 |
| 用户未要求验证 | 默认跳过 |

## 6.2 轻量验证

如果决定运行：

```bash
python -m venv /tmp/<repo>-venv
source /tmp/<repo>-venv/bin/activate
pip install -e .
```

### 安全规则

- ❌ 不运行未知 install script / `curl | bash` / `sudo`
- ❌ 不写入外部服务
- ❌ 不上传用户数据
- ❌ 不启动会长期占用资源的服务，除非用户要求
- ✅ 运行前估计依赖大小和 GPU/网络需求

### 可运行项

| 验证项 | 命令 | 风险 |
|--------|------|------|
| `--help` | `python main.py --help` | 低 |
| Import smoke test | `python -c "import package_name"` | 低 |
| 轻量单元测试 | `pytest tests/test_utils.py -x` | 低 |
| README 最小样例 | 按 README 示例运行（无外部密钥/大模型下载时） | 中 |

## 6.3 验证结果记录

| 验证项 | 结果 | 备注 |
|--------|------|------|
| 安装 | 成功/失败/跳过 | |
| `--help` | 成功/失败/跳过 | |
| Import | 成功/失败/跳过 | |
| 最小样例 | 成功/失败/跳过 | |

---

## Gate 条件

进入 Phase 7 前必须满足：

1. **验证已完成**或**已明确跳过**（注明原因）
2. 如果运行失败，**已分析失败原因**并记录
3. **todo 状态**：Phase 6 标记为 `completed`，Phase 7 标记为 `in_progress`

不满足？补齐后重新检查 Gate。
