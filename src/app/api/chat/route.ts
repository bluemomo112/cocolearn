import { NextRequest, NextResponse } from 'next/server';
import { Message, TaskSubmission } from '@/types/shared-context';

// Demo 模式：返回 mock 数据，不调用真实 AI
const DEMO_MODE = true;

// Mock 回复列表
const mockResponses = [
  "这是一个很好的问题！在植物工厂中，光照是影响植物生长的关键因素之一。LED灯可以提供植物所需的特定光谱，红光促进开花结果，蓝光促进叶片生长。",
  "你的思考很有深度！水培系统的优势在于可以精确控制营养液的浓度和pH值，让植物获得最佳的生长条件。",
  "非常棒的观察！温度和湿度的控制确实是植物工厂的核心技术之一。通常叶菜类适合18-25°C的环境。",
  "这个问题问得好！植物工厂的自动化系统可以24小时监控植物状态，及时调整环境参数，这是传统农业难以实现的。",
  "你已经掌握了关键概念！继续保持这种探索精神，相信你会对植物工厂有更深入的理解。",
];

// Mock 能力更新
const mockCompetencyProfile = {
  studentId: 'student_demo',
  courseId: 'course_plant_factory',
  competencies: {
    critical_thinking: { currentRating: 3.2, trend: 'improving' as const, evidenceCount: 5, recentEvidence: [] },
    information_synthesis: { currentRating: 2.8, trend: 'stable' as const, evidenceCount: 4, recentEvidence: [] },
    metacognition: { currentRating: 2.5, trend: 'improving' as const, evidenceCount: 3, recentEvidence: [] },
  },
  history: [],
  lastUpdated: new Date(),
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, taskId, taskAnswer, message } = body;

    if (DEMO_MODE) {
      // Demo 模式：返回 mock 数据
      if (action === 'chat') {
        return handleMockChat(message);
      } else if (action === 'submit_task') {
        return handleMockTaskSubmission(taskId, taskAnswer);
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Chat API错误:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Mock 对话处理
 */
function handleMockChat(userMessage: string) {
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

  return NextResponse.json({
    success: true,
    message: randomResponse,
    messageId: `msg_${Date.now()}_ai`,
    competencyUpdates: [],
    competencyProfile: mockCompetencyProfile,
  });
}

/**
 * Mock 任务提交处理
 */
function handleMockTaskSubmission(taskId: string, answer: string) {
  // 尝试解析为 quiz 答案
  try {
    const userAnswers = JSON.parse(answer);
    // 假设是 quiz，返回 mock 结果
    return NextResponse.json({
      success: true,
      taskType: 'quiz',
      attemptNumber: 1,
      quickResult: {
        allCorrect: true,
        correctCount: Object.keys(userAnswers).length,
        totalCount: Object.keys(userAnswers).length,
        details: Object.keys(userAnswers).map(qId => ({
          questionId: qId,
          isCorrect: true,
          userAnswer: userAnswers[qId],
          correctAnswer: userAnswers[qId],
        })),
      },
      needsAnalysis: true,
    });
  } catch {
    // 主观题
    return NextResponse.json({
      success: true,
      taskType: 'subjective',
      attemptNumber: 1,
      message: "你的回答展现了对植物工厂概念的良好理解！特别是在环境控制方面的分析很到位。建议可以进一步思考如何优化能源使用效率。",
      assessment: {
        score: 85,
        feedback: "回答结构清晰，论点明确。",
        strengths: ["概念理解准确", "逻辑清晰"],
        improvements: ["可以增加更多实例", "深入分析成本效益"],
      },
      competencyUpdates: [],
      competencyProfile: mockCompetencyProfile,
    });
  }
}

