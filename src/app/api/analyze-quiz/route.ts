import { NextRequest, NextResponse } from 'next/server';

// Demo 模式：返回 mock 流式数据
const DEMO_MODE = true;

/**
 * 客观题延迟分析API端点
 * Demo 模式下返回预设的分析内容
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskTitle, results } = body;

    if (DEMO_MODE) {
      // 生成 mock 分析内容
      const mockAnalysis = generateMockAnalysis(taskTitle, results);

      // 模拟流式输出
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          // 逐字符输出，模拟打字效果
          for (const char of mockAnalysis) {
            controller.enqueue(encoder.encode(char));
            await new Promise(resolve => setTimeout(resolve, 15));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    return NextResponse.json(
      { error: 'AI analysis is not available in demo mode.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Quiz分析API错误:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 生成 mock 分析内容
 */
function generateMockAnalysis(taskTitle: string, results: any[]): string {
  const totalCount = results?.length || 3;
  const correctCount = results?.filter((r: any) => r.isCorrect).length || totalCount;
  const incorrectCount = totalCount - correctCount;
  const score = Math.round((correctCount / totalCount) * 100);

  if (incorrectCount === 0) {
    return `## 🎉 太棒了！全部正确！

你在"${taskTitle || '本次测验'}"中表现出色，${totalCount} 道题全部答对！

### 知识掌握情况
你对植物工厂的核心概念有很好的理解，特别是：
- **环境控制系统**：你清楚地理解了温度、湿度、光照等因素的重要性
- **水培技术**：对营养液管理和循环系统有准确的认识
- **自动化管理**：了解现代植物工厂的智能化特点

### 学习建议
继续保持这种学习状态！建议你：
1. 尝试将所学知识应用到实际案例分析中
2. 思考植物工厂技术的未来发展方向
3. 探索不同作物在植物工厂中的种植差异

加油，你的学习进度非常好！ 🌱`;
  }

  return `## 📊 测验分析报告

你在"${taskTitle || '本次测验'}"中答对了 ${correctCount}/${totalCount} 题，正确率 ${score}%。

### 整体评价
${score >= 80 ? '表现不错！大部分知识点都掌握了。' : score >= 60 ? '基础知识掌握得还可以，但有些概念需要加强。' : '建议重新复习相关内容，打好基础。'}

### 错题分析
${incorrectCount > 0 ? `你有 ${incorrectCount} 道题需要注意：

**常见问题**：
- 可能对某些专业术语的理解不够准确
- 需要注意区分相似概念之间的差异
- 建议结合实际案例加深理解` : ''}

### 知识点总结
本次测验涉及的核心知识点：
1. 植物工厂的基本概念和特点
2. 环境控制系统的组成和作用
3. 水培与土培的区别和优势

### 学习建议
1. 重点复习答错的题目对应的知识点
2. 尝试用自己的话解释这些概念
3. 可以查阅更多资料，拓展相关知识

继续努力，相信下次会更好！ 💪`;
}
