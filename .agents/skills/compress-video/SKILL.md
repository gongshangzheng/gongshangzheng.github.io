---
name: compress-video
description: |
  用 ffmpeg 压缩视频文件。覆盖编码格式选择（H.265/AV1/VP9）、CRF 质量控制、
  preset 速度权衡、音频处理、批量压缩、硬件加速、分辨率缩放、格式转换。
  当用户提到"压缩视频"、"视频太大"、"减小视频体积"、"video file size"、
  "shrink video"、"encode video"、"转码"、"视频瘦身"时触发。
  也覆盖 ffprobe 诊断和视频信息查看。
---

## ffmpeg 环境

- 二进制路径：`ffmpeg`（已在 PATH）
- 版本：8.1.2
- 可用编码器：libx264（H.264）、libx265（H.265）、libsvtav1（AV1）、libvpx-vp9（VP9）

---

## 编码格式选择

| 格式 | 编码器 | 压缩率（vs H.264） | 编码速度 | 兼容性 |
|------|--------|-------------------|---------|--------|
| H.265/HEVC | libx265 | **体积减半** | 中等 | 2016+ 设备 |
| **AV1** | **libsvtav1** | **体积减 60-70%** | 较快（CPU 友好） | 2020+ 浏览器/播放器 |
| VP9 | libvpx-vp9 | 与 H.265 相当 | 慢 | YouTube/Chrome |
| H.264 | libx264 | 基准 | 快 | 全兼容 |

**决策顺序**：
1. **存档/长期保存** → AV1（libsvtav1），最小体积
2. **日常分享/手机播放** → H.265（libx265），平衡体积与兼容性
3. **旧设备/最大兼容** → H.264（libx264）

---

## 核心参数

### CRF（Constant Rate Factor）— 质量控制

- **数字越小质量越高，体积越大**
- H.265/AV1 范围：0-51，推荐 28（视觉无损）到 35（平衡）
- H.264 范围：0-51，推荐 23（视觉无损）到 28（平衡）

| CRF | 适合场景 |
|-----|---------|
| 23 | 高质量存档（H.264） |
| 28 | 视觉无损（H.265/AV1） |
| **32** | **日常平衡（推荐）** |
| 35-40 | 网络分享，可接受画质损失 |

### Preset — 速度/压缩率权衡

- **fast**：编码快，体积大 10-20%
- **medium**：默认，平衡
- **slow**：编码慢，体积小 10-20%

**libsvtav1 preset 范围**：0-13（数字越大越快）
- 4-6：平衡
- 8-10：快速预览

---

## 常用 Recipes

### 1. H.265 压缩（最常用）

```bash
ffmpeg -i input.mp4 -c:v libx265 -crf 32 -preset medium -c:a aac -b:a 128k output.mp4
```

### 2. AV1 极致压缩（存档用）

```bash
ffmpeg -i input.mp4 -c:v libsvtav1 -preset 6 -crf 35 -c:a libopus -b:a 128k output.mkv
```

> 注意：AV1 输出建议用 `.mkv` 容器（`.mp4` 也支持但兼容性稍差）

### 3. 硬件加速（VideoToolbox，macOS 专用）

利用 Apple Silicon 的硬件编码器，速度提升 5-10x：

```bash
# H.265 硬件加速
ffmpeg -i input.mp4 -c:v hevc_videotoolbox -q:v 50 output.mp4

# H.264 硬件加速
ffmpeg -i input.mp4 -c:v h264_videotoolbox -q:v 50 output.mp4
```

`-q:v` 范围：1-100，推荐 50-60（质量百分比）

**权衡**：硬件编码快但压缩率比软件编码低 20-30%。适合大批量处理或对速度要求高的场景。

### 4. 批量压缩目录下所有视频

```bash
for f in /path/to/videos/*.{mp4,mov,avi,mkv}; do
  [ -f "$f" ] || continue
  out="/path/to/output/$(basename "${f%.*}").mp4"
  ffmpeg -i "$f" -c:v libx265 -crf 32 -preset medium -c:a aac -b:a 128k "$out"
  echo "Done: $f -> $out"
done
```

### 5. 降低分辨率（1080p → 720p）

```bash
ffmpeg -i input.mp4 -c:v libx265 -crf 32 -preset medium \
  -vf "scale=-2:720" -c:a aac -b:a 128k output_720p.mp4
```

`scale=-2:720` 表示高度固定 720p，宽度自动计算并对齐到偶数。

### 6. 仅提取音频（不压缩视频）

```bash
ffmpeg -i input.mp4 -vn -c:a libmp3lame -b:a 192k output.mp3
```

### 7. 无损复制（仅改容器格式）

```bash
ffmpeg -i input.mkv -c copy output.mp4
```

不重新编码，只改变封装格式，速度极快。

### 8. 两遍编码（精确目标码率）

当需要严格控制输出文件大小时：

```bash
# 第一遍：分析
ffmpeg -i input.mp4 -c:v libx265 -b:v 2M -pass 1 -f null /dev/null

# 第二遍：编码
ffmpeg -i input.mp4 -c:v libx265 -b:v 2M -pass 2 -c:a aac -b:a 128k output.mp4

# 清理日志
rm -f ffmpeg2pass-0.log*
```

**计算目标码率**：`目标大小(MB) × 8192 / 时长(秒) = 码率(kbps)`

---

## 音频处理

```bash
-c:a aac -b:a 128k     # AAC 编码，128kbps（推荐）
-c:a libopus -b:a 128k  # Opus 编码，比 AAC 小 20-30%
-c:a copy               # 直接复制音频流（不重新编码）
-an                     # 完全移除音频
```

---

## 压缩前诊断

先用 ffprobe 查看视频信息：

```bash
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4
```

**关键信息**：
- `codec_name`：当前编码（h264/hevc/vp9/av1）
- `width/height`：分辨率
- `bit_rate`：码率
- `duration`：时长
- `format_name`：容器格式

**快速查看**：
```bash
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,bit_rate input.mp4
```

---

## 压缩效果预估

| 原视频 | 目标 | 预期压缩率 | 时间（1 小时视频，M2 Max） |
|--------|------|-----------|--------------------------|
| H.264 1080p | H.265 CRF 32 | **体积减 50-60%** | 15-20 分钟 |
| H.264 1080p | AV1 CRF 35 | **体积减 65-75%** | 30-40 分钟 |
| H.264 4K | H.265 720p | **体积减 80-85%** | 20-25 分钟 |

---

## 常见坑

| 问题 | 原因 | 解法 |
|------|------|------|
| 输出文件反而更大 | 原视频已高度压缩或 CRF 设太低 | 提高 CRF 值（如 32→35） |
| 播放器不支持 AV1 | 旧设备/旧浏览器 | 改用 H.265 或 H.264 |
| 音频不同步 | 音频采样率不匹配 | 加 `-ar 48000` 统一采样率 |
| 编码极慢 | CPU 编码 + 高分辨率 | 用硬件加速（hevc_videotoolbox）或降低分辨率 |
| HDR 视频颜色失真 | 未保留 HDR 元数据 | 加 `-color_primaries 1 -color_trc 16 -colorspace 9` |
| 字幕丢失 | `-c copy` 不复制字幕流 | 加 `-c:s copy` 或单独提取字幕 |

---

## 高级技巧

### 保留所有流（音频、字幕、章节）

```bash
ffmpeg -i input.mkv -c:v libx265 -crf 32 -preset medium \
  -c:a copy -c:s copy -map 0 output.mkv
```

`-map 0` 表示复制输入文件的所有流。

### 裁剪时间段

```bash
ffmpeg -ss 00:01:30 -i input.mp4 -t 00:02:00 -c copy output_clip.mp4
```

`-ss` 开始时间，`-t` 持续时长。

### 添加水印

```bash
ffmpeg -i input.mp4 -i logo.png -filter_complex "overlay=10:10" output.mp4
```

`overlay=10:10` 表示水印距离左上角 10px。
