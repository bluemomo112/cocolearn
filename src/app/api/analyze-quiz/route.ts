import { NextRequest, NextResponse } from 'next/server';
import { streamChatWithGLM } from '@/lib/glm-client';

/**
 * 客观题延迟分析API端点
 * 在用户收到快速判题结果后，此端点提供详细的AI分析
 */
export async function POST(request: NextRequest) {
  try {
    // 检查是否配置了 GLM API
    if (!process.env.GLM_API_KEY) {
      return NextResponse.json(
        { error: 'AI analysis is not available. GLM_API_KEY is not configured.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { taskId, taskTitle, questions, userAnswers, results } = body;

    // 构建AI分析提示词
    const systemPrompt = buildQuizAnalysisPrompt(taskTitle, questions, userAnswers, results);

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 使用streamChatWithGLM进行流式输出
          const messageStream = streamChatWithGLM(
            systemPrompt,
            [], // 测验分析不需要对话历史
            { temperature: 0.7, stream: true }
          );

          for await (const chunk of messageStream) {
            const text = encoder.encode(chunk);
            controller.enqueue(text);
          }

          controller.close();
        } catch (error) {
          console.error('流式分析失败:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Quiz分析API错误:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 构建测验分析提示词
 */
function buildQuizAnalysisPrompt(
  taskTitle: string,
  questions: any[],
  userAnswers: Record<string, any>,
  results: any[]
): string {
  const totalCount = results.length;
  const correctCount = results.filter(r => r.isCorrect).length;
  const incorrectCount = totalCount - correctCount;

  let prompt = `你是一个耐心的学习助手，学生刚完成了测验"${taskTitle}"。

## 测验结果概览
- 总题数: ${totalCount}
- 正确: ${correctCount} 题
- 错误: ${incorrectCount} 题
- 正确率: ${Math.round((correctCount / totalCount) * 100)}%

## 题目详情
`;

  results.forEach((result, idx) => {
    const question = questions[idx];
    const isCorrect = result.isCorrect;

    prompt += `
### 第 ${idx + 1} 题 ${isCorrect ? '✓ 正确' : '✗ 错误'}
**题目**: ${question.content}
**选项**:
${question.options.map((opt: string, i: number) => `  ${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}
**学生答案**: ${formatAnswer(result.userAnswer)}
**正确答案**: ${formatAnswer(result.correctAnswer)}
${question.explanation ? `**解析**: ${question.explanation}` : ''}
`;
  });

  prompt += `

## 你的任务
请以友好、鼓励的语气，为学生提供个性化的学习反馈：

1. **整体评价**:
   - 如果全对，给予热烈鼓励
   - 如果部分正确，肯定做对的部分，指出需要改进的地方
   - 如果全错，温和地鼓励，指出学习方向

2. **错题分析** (如果有错题):
   - 针对每道错题，解释为什么正确答案是对的
   - 指出学生可能的误解或知识盲点
   - 提供记忆技巧或理解方法

3. **知识点总结**:
   - 总结这次测验涉及的核心知识点
   - 建议学生重点复习哪些内容

4. **学习建议**:
   - 给出具体的下一步学习建议
   - 推荐相关学习资源（如果有）

请使用Markdown格式输出，语气要温暖、鼓励，像一个真正关心学生的老师。
`;

  return prompt;
}

/**
 * 格式化答案显示
 */
function formatAnswer(answer: any): string {
  if (Array.isArray(answer)) {
    return answer.map(a => `"${a}"`).join(', ');
  }
  return `"${answer}"`;
}
