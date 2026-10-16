#!/usr/bin/env python3
"""生成信息论与无损压缩的配图"""

import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['Arial Unicode MS', 'SimHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

output_dir = Path(__file__).parent

def generate_entropy_plot():
    """生成信息熵与概率分布的关系图"""
    fig, ax = plt.subplots(figsize=(10, 6))

    # 二元信源的熵
    p = np.linspace(0.01, 0.99, 100)
    H = -p * np.log2(p) - (1-p) * np.log2(1-p)

    ax.plot(p, H, 'b-', linewidth=2, label='二元信源熵 $H(X)$')
    ax.axhline(y=1.0, color='r', linestyle='--', label='最大熵 (1 bit)')
    ax.axvline(x=0.5, color='g', linestyle=':', alpha=0.5, label='均匀分布 (p=0.5)')

    ax.set_xlabel('概率 p', fontsize=12)
    ax.set_ylabel('熵 H(X) (bits)', fontsize=12)
    ax.set_title('二元信源的信息熵', fontsize=14, fontweight='bold')
    ax.legend(loc='lower right')
    ax.grid(True, alpha=0.3)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1.1)

    # 添加注释
    ax.annotate('均匀分布时熵最大',
                xy=(0.5, 1.0), xytext=(0.6, 0.85),
                arrowprops=dict(arrowstyle='->', color='red'),
                fontsize=10)

    ax.annotate('确定性事件熵为零',
                xy=(0.02, 0.14), xytext=(0.15, 0.3),
                arrowprops=dict(arrowstyle='->', color='green'),
                fontsize=10)

    plt.tight_layout()
    plt.savefig(output_dir / 'entropy-binary.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ 生成 entropy-binary.png")


def generate_huffman_tree():
    """生成 Huffman 编码树示意图"""
    fig, ax = plt.subplots(figsize=(12, 8))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis('off')

    # 定义节点位置
    nodes = {
        'root': (6, 7),
        'n1': (3, 5.5),
        'n2': (9, 5.5),
        'n3': (1.5, 4),
        'n4': (4.5, 4),
        'A': (1.5, 2.5),
        'B': (4.5, 2.5),
        'C': (7.5, 4),
        'D': (10.5, 4),
        'E': (10.5, 2.5),
    }

    # 绘制节点
    for name, (x, y) in nodes.items():
        if name in ['A', 'B', 'C', 'D', 'E']:
            circle = plt.Circle((x, y), 0.3, color='#FFD700', ec='black', linewidth=2, zorder=5)
            ax.add_patch(circle)
            ax.text(x, y, name, ha='center', va='center', fontsize=14, fontweight='bold', zorder=6)
        else:
            circle = plt.Circle((x, y), 0.35, color='#87CEEB', ec='black', linewidth=2, zorder=5)
            ax.add_patch(circle)
            ax.text(x, y, '+', ha='center', va='center', fontsize=16, fontweight='bold', zorder=6)

    # 绘制边
    edges = [
        ('root', 'n1', '0'),
        ('root', 'n2', '1'),
        ('n1', 'n3', '0'),
        ('n1', 'n4', '1'),
        ('n3', 'A', '0'),
        ('n4', 'B', '1'),
        ('n2', 'C', '0'),
        ('n2', 'D', '1'),
    ]

    for parent, child, label in edges:
        px, py = nodes[parent]
        cx, cy = nodes[child]
        ax.plot([px, cx], [py-0.35, cy+0.3], 'k-', linewidth=2, zorder=1)

        # 添加边标签
        mx, my = (px + cx) / 2, (py + cy) / 2
        ax.text(mx, my, label, ha='center', va='center',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black'),
                fontsize=11, fontweight='bold', zorder=7)

    # 添加频率标签
    freq_labels = {
        'A': '0.35',
        'B': '0.25',
        'C': '0.20',
        'D': '0.12',
        'E': '0.08'
    }

    for node, freq in freq_labels.items():
        x, y = nodes[node]
        ax.text(x, y-0.6, f'p={freq}', ha='center', va='center',
                fontsize=9, color='gray', style='italic')

    ax.set_title('Huffman 编码树示例', fontsize=16, fontweight='bold', pad=20)

    # 添加图例
    legend_elements = [
        patches.Patch(facecolor='#FFD700', edgecolor='black', label='叶子节点（符号）'),
        patches.Patch(facecolor='#87CEEB', edgecolor='black', label='内部节点（合并）')
    ]
    ax.legend(handles=legend_elements, loc='lower left', fontsize=10)

    plt.tight_layout()
    plt.savefig(output_dir / 'huffman-tree.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ 生成 huffman-tree.png")


def generate_arithmetic_coding():
    """生成算术编码区间细分示意图"""
    fig, axes = plt.subplots(1, 4, figsize=(16, 4))

    # 符号概率
    symbols = {'A': 0.5, 'B': 0.3, 'C': 0.2}

    # 初始区间
    axes[0].set_xlim(0, 1)
    axes[0].set_ylim(0, 1)
    axes[0].set_title('初始区间 [0, 1)', fontsize=12, fontweight='bold')

    # 绘制初始区间划分
    y_pos = 0.5
    cum = 0
    for sym, prob in symbols.items():
        axes[0].add_patch(patches.Rectangle((cum, y_pos-0.1), prob, 0.2,
                                            facecolor='lightblue', edgecolor='black', linewidth=2))
        axes[0].text(cum + prob/2, y_pos, f'{sym}\n{prob}',
                    ha='center', va='center', fontsize=11, fontweight='bold')
        cum += prob

    axes[0].axis('off')

    # 步骤1: 编码 'B' -> [0.5, 0.8)
    axes[1].set_xlim(0, 1)
    axes[1].set_ylim(0, 1)
    axes[1].set_title('步骤1: 编码 B\n区间 [0.5, 0.8)', fontsize=12, fontweight='bold')

    # 高亮 B 的区间
    axes[1].add_patch(patches.Rectangle((0.5, y_pos-0.1), 0.3, 0.2,
                                        facecolor='yellow', edgecolor='black', linewidth=3))
    axes[1].text(0.65, y_pos, 'B', ha='center', va='center',
                fontsize=14, fontweight='bold')

    # 显示其他区间（淡化）
    axes[1].add_patch(patches.Rectangle((0, y_pos-0.1), 0.5, 0.2,
                                        facecolor='lightgray', edgecolor='gray', linewidth=1))
    axes[1].add_patch(patches.Rectangle((0.8, y_pos-0.1), 0.2, 0.2,
                                        facecolor='lightgray', edgecolor='gray', linewidth=1))
    axes[1].axis('off')

    # 步骤2: 编码 'A' -> [0.5, 0.65)
    axes[2].set_xlim(0.5, 0.8)
    axes[2].set_ylim(0, 1)
    axes[2].set_title('步骤2: 编码 A\n区间 [0.5, 0.65)', fontsize=12, fontweight='bold')

    # 细分 [0.5, 0.8) 区间
    interval = 0.3
    cum = 0.5
    for sym, prob in symbols.items():
        width = interval * prob
        color = 'yellow' if sym == 'A' else 'lightblue'
        lw = 3 if sym == 'A' else 2
        axes[2].add_patch(patches.Rectangle((cum, y_pos-0.1), width, 0.2,
                                            facecolor=color, edgecolor='black', linewidth=lw))
        axes[2].text(cum + width/2, y_pos, sym, ha='center', va='center',
                    fontsize=11, fontweight='bold')
        cum += width

    axes[2].axis('off')

    # 步骤3: 编码 'B' -> [0.575, 0.62)
    axes[3].set_xlim(0.5, 0.65)
    axes[3].set_ylim(0, 1)
    axes[3].set_title('步骤3: 编码 B\n区间 [0.575, 0.62)', fontsize=12, fontweight='bold')

    # 细分 [0.5, 0.65) 区间
    interval = 0.15
    cum = 0.5
    for sym, prob in symbols.items():
        width = interval * prob
        color = 'yellow' if sym == 'B' else 'lightblue'
        lw = 3 if sym == 'B' else 2
        axes[3].add_patch(patches.Rectangle((cum, y_pos-0.1), width, 0.2,
                                            facecolor=color, edgecolor='black', linewidth=lw))
        axes[3].text(cum + width/2, y_pos, sym, ha='center', va='center',
                    fontsize=11, fontweight='bold')
        cum += width

    axes[3].axis('off')

    plt.suptitle('算术编码过程：编码消息 "BAB"', fontsize=14, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(output_dir / 'arithmetic-coding.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ 生成 arithmetic-coding.png")


def generate_lz77_sliding_window():
    """生成 LZ77 滑动窗口示意图"""
    fig, ax = plt.subplots(figsize=(14, 5))

    # 示例数据
    text = "ABCABCABCDEF"

    # 绘制滑动窗口
    window_start = 0
    window_size = 6
    current_pos = 6

    # 绘制文本
    for i, char in enumerate(text):
        x = i * 0.8
        if i < current_pos:
            color = 'lightblue'
            edge = 'blue'
        elif i == current_pos:
            color = 'yellow'
            edge = 'orange'
            lw = 3
        else:
            color = 'lightgray'
            edge = 'gray'

        if i == current_pos:
            rect = patches.Rectangle((x, 1.5), 0.7, 0.8,
                                     facecolor=color, edgecolor=edge, linewidth=lw)
        else:
            rect = patches.Rectangle((x, 1.5), 0.7, 0.8,
                                     facecolor=color, edgecolor=edge, linewidth=2)
        ax.add_patch(rect)
        ax.text(x + 0.35, 1.9, char, ha='center', va='center',
               fontsize=16, fontweight='bold')

    # 标记搜索窗口
    search_window = patches.Rectangle((0, 1.2), window_size * 0.8, 1.4,
                                      facecolor='none', edgecolor='green',
                                      linewidth=3, linestyle='--')
    ax.add_patch(search_window)
    ax.text(window_size * 0.4, 2.8, '搜索窗口 (32KB)',
           ha='center', va='center', fontsize=12, color='green', fontweight='bold')

    # 标记当前位置
    ax.annotate('当前位置', xy=(current_pos * 0.8 + 0.35, 1.5),
                xytext=(current_pos * 0.8 + 0.35, 0.8),
                arrowprops=dict(arrowstyle='->', color='red', lw=2),
                fontsize=12, fontweight='bold', color='red', ha='center')

    # 绘制匹配
    match_start = 3
    match_length = 3
    match_distance = 3

    # 匹配源
    match_rect = patches.Rectangle((match_start * 0.8, 1.5), match_length * 0.8, 0.8,
                                   facecolor='lime', edgecolor='green', linewidth=3, alpha=0.7)
    ax.add_patch(match_rect)

    # 匹配目标
    match_target = patches.Rectangle((current_pos * 0.8, 1.5), match_length * 0.8, 0.8,
                                     facecolor='lime', edgecolor='green', linewidth=3, alpha=0.7)
    ax.add_patch(match_target)

    # 绘制箭头
    arrow = FancyArrowPatch((match_start * 0.8 + match_length * 0.4, 1.5),
                           (current_pos * 0.8 + match_length * 0.4, 1.5),
                           arrowstyle='->', mutation_scale=20, linewidth=2,
                           color='green', connectionstyle='arc3,rad=0.3')
    ax.add_patch(arrow)

    # 添加匹配信息
    ax.text((match_start + current_pos + match_length) * 0.4, 0.5,
           f'匹配: (长度={match_length}, 距离={match_distance})',
           ha='center', va='center', fontsize=12, fontweight='bold',
           bbox=dict(boxstyle='round,pad=0.5', facecolor='yellow', edgecolor='green', linewidth=2))

    ax.set_xlim(-0.5, len(text) * 0.8 + 0.5)
    ax.set_ylim(0, 3.5)
    ax.axis('off')
    ax.set_title('LZ77 滑动窗口压缩算法', fontsize=16, fontweight='bold', pad=20)

    plt.tight_layout()
    plt.savefig(output_dir / 'lz77-sliding-window.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ 生成 lz77-sliding-window.png")


def generate_png_filter_comparison():
    """生成 PNG 过滤器效果对比图"""
    fig, axes = plt.subplots(2, 3, figsize=(15, 10))

    # 创建示例图像数据（8x8 像素，有渐变和边缘）
    img = np.zeros((8, 8))
    img[:, :4] = np.linspace(100, 200, 4).reshape(1, -1)  # 左半部分渐变
    img[:, 4:] = 250  # 右半部分白色
    img[3:5, :] = 50  # 中间黑色条纹

    # 显示原始图像
    axes[0, 0].imshow(img, cmap='gray', vmin=0, vmax=255)
    axes[0, 0].set_title('原始图像', fontsize=12, fontweight='bold')
    axes[0, 0].axis('off')

    # 添加像素值标注
    for i in range(8):
        for j in range(8):
            axes[0, 0].text(j, i, f'{int(img[i,j])}',
                          ha='center', va='center', fontsize=7, color='red')

    # 模拟过滤器效果
    filters = {
        'None': img.copy(),
        'Sub': np.zeros_like(img),
        'Up': np.zeros_like(img),
        'Average': np.zeros_like(img),
        'Paeth': np.zeros_like(img)
    }

    # 应用过滤器（简化版本）
    for i in range(8):
        for j in range(8):
            # Sub: 减去左侧像素
            filters['Sub'][i, j] = img[i, j] - (img[i, j-1] if j > 0 else 0)
            # Up: 减去上方像素
            filters['Up'][i, j] = img[i, j] - (img[i-1, j] if i > 0 else 0)
            # Average: 减去平均值
            left = img[i, j-1] if j > 0 else 0
            up = img[i-1, j] if i > 0 else 0
            filters['Average'][i, j] = img[i, j] - int((left + up) / 2)
            # Paeth: 简化版本，使用预测值
            filters['Paeth'][i, j] = img[i, j] - int(left)

    # 显示过滤器结果
    positions = [(0, 1), (0, 2), (1, 0), (1, 1), (1, 2)]
    filter_names = ['Sub', 'Up', 'Average', 'Paeth']

    for idx, (pos, name) in enumerate(zip(positions, filter_names)):
        filtered = filters[name]
        im = axes[pos[0], pos[1]].imshow(filtered, cmap='RdBu', vmin=-100, vmax=100)
        axes[pos[0], pos[1]].set_title(f'{name} 过滤器', fontsize=12, fontweight='bold')
        axes[pos[0], pos[1]].axis('off')

        # 添加像素值（只显示部分）
        for i in range(min(4, 8)):
            for j in range(min(4, 8)):
                val = int(filtered[i, j])
                color = 'white' if abs(val) > 50 else 'black'
                axes[pos[0], pos[1]].text(j, i, f'{val}',
                                        ha='center', va='center', fontsize=7, color=color)

    # 添加说明
    axes[1, 2].axis('off')
    axes[1, 2].text(0.5, 0.5,
                   'PNG 过滤器目标：\n\n'
                   '• 将像素值转换为残差\n'
                   '• 残差值集中在 0 附近\n'
                   '• 提高 DEFLATE 压缩效率\n\n'
                   '颜色说明：\n'
                   '红色 = 正值（大于预测）\n'
                   '蓝色 = 负值（小于预测）',
                   ha='center', va='center', fontsize=11,
                   bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

    plt.suptitle('PNG 过滤器效果对比', fontsize=16, fontweight='bold', y=0.98)
    plt.tight_layout()
    plt.savefig(output_dir / 'png-filters.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ 生成 png-filters.png")


def generate_png_compression_flow():
    """生成 PNG 完整压缩流程图"""
    fig, ax = plt.subplots(figsize=(14, 8))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 8)
    ax.axis('off')

    # 定义流程节点
    nodes = [
        {'text': '原始图像\n(RGB/灰度)', 'x': 1, 'y': 4, 'color': 'lightblue'},
        {'text': 'PNG 过滤\n(5种类型)', 'x': 3.5, 'y': 4, 'color': 'lightgreen'},
        {'text': '残差数据\n(集中在0附近)', 'x': 6, 'y': 4, 'color': 'lightyellow'},
        {'text': 'LZ77\n(字典压缩)', 'x': 8.5, 'y': 4, 'color': 'lightcoral'},
        {'text': 'Huffman\n(熵编码)', 'x': 11, 'y': 4, 'color': 'plum'},
        {'text': 'PNG 文件\n(.png)', 'x': 13.5, 'y': 4, 'color': 'lightgray'},
    ]

    # 绘制节点
    for node in nodes:
        rect = FancyBboxPatch((node['x']-0.8, node['y']-0.5), 1.6, 1,
                             boxstyle='round,pad=0.1',
                             facecolor=node['color'], edgecolor='black', linewidth=2)
        ax.add_patch(rect)
        ax.text(node['x'], node['y'], node['text'],
               ha='center', va='center', fontsize=11, fontweight='bold')

    # 绘制箭头
    for i in range(len(nodes)-1):
        arrow = FancyArrowPatch((nodes[i]['x']+0.8, nodes[i]['y']),
                               (nodes[i+1]['x']-0.8, nodes[i+1]['y']),
                               arrowstyle='->', mutation_scale=20, linewidth=2,
                               color='black')
        ax.add_patch(arrow)

    # 添加详细说明
    details = [
        (1, 2.5, '输入格式：\n• RGB 24bit\n• 灰度 8bit\n• 索引色'),
        (3.5, 2.5, '过滤器类型：\n0. None\n1. Sub\n2. Up\n3. Average\n4. Paeth'),
        (6, 2.5, '目标：\n• 消除空间冗余\n• 提高压缩率\n• 可逆过程'),
        (8.5, 2.5, '滑动窗口：\n• 32KB 窗口\n• 匹配长度 3-258\n• (长度, 距离) 对'),
        (11, 2.5, '两级编码：\n• Literal/Length\n• Distance\n• 动态/静态表'),
        (13.5, 2.5, '文件结构：\n• IHDR 头\n• IDAT 数据\n• IEND 结束'),
    ]

    for x, y, text in details:
        ax.text(x, y, text, ha='center', va='top', fontsize=9,
               bbox=dict(boxstyle='round', facecolor='white', edgecolor='gray', alpha=0.7))

    ax.set_title('PNG 压缩完整流程', fontsize=16, fontweight='bold', pad=20)

    plt.tight_layout()
    plt.savefig(output_dir / 'png-compression-flow.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ 生成 png-compression-flow.png")


if __name__ == '__main__':
    print("开始生成信息论与无损压缩配图...")
    generate_entropy_plot()
    generate_huffman_tree()
    generate_arithmetic_coding()
    generate_lz77_sliding_window()
    generate_png_filter_comparison()
    generate_png_compression_flow()
    print("\n✅ 所有配图生成完成！")
