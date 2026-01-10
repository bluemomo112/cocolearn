import { NextRequest, NextResponse } from 'next/server';
import { AgentCoordinator } from '@/lib/agents/agent-coordinator';
import { extractAllResources } from '@/lib/resource-parser';
import { mockResources } from '@/data/mockLearningData';
import { SharedContext, Message } from '@/types/shared-context';

// 临时存储会话上下文（生产环境应使用数据库）
const sessionContexts = new Map<string, SharedContext>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, action, taskId, taskAnswer } = body;

    // 获取或创建会话上下文
    let context = sessionContexts.get(sessionId);
    if (!context) {
      // 初始化新会话
      context = await initializeSession(sessionId);
      sessionContexts.set(sessionId, context);
    }

    // 创建Agent协调器
    const coordinator = new AgentCoordinator(context);

    // 根据action类型处理
    if (action === 'chat') {
      // 处理普通对话
      return await handleChat(coordinator, context, message);
    } else if (action === 'submit_task') {
      // 处理任务提交
      return await handleTaskSubmission(coordinator, context, taskId, taskAnswer);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Chat API错误:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 初始化会话
 */
async function initializeSession(sessionId: string): Promise<SharedContext> {
  // 创建初始上下文
  const context: SharedContext = {
    session: {
      sessionId,
      studentId: 'student_demo',
      courseId: 'course_plant_factory',
      startTime: new Date(),
      currentPhase: 'exploring'
    },
    conversation: {
      messages: [],
      lastAgentType: null,
      turnCount: 0,
      messageAgentMap: new Map()
    },
    resources: {
      available: mockResources,
      contents: new Map(),
      currentId: null,
      accessLog: []
    },
    tasks: {
      list: require('@/data/mockLearningData').mockTasks,
      status: new Map(),
      submissions: new Map(),
      assessments: new Map()
    },
    competency: {
      profile: {
        studentId: 'student_demo',
        courseId: 'course_plant_factory',
        competencies: {
          critical_thinking: {
            currentRating: 2,
            trend: 'stable',
            evidenceCount: 0,
            recentEvidence: []
          },
          information_synthesis: {
            currentRating: 2,
            trend: 'stable',
            evidenceCount: 0,
            recentEvidence: []
          },
          metacognition: {
            currentRating: 2,
            trend: 'stable',
            evidenceCount: 0,
            recentEvidence: []
          }
        },
        history: [],
        lastUpdated: new Date()
      },
      pendingUpdates: [],
      lastUpdated: new Date()
    },
    behavior: {
      resourceStayTime: new Map(),
      totalIdleTime: 0,
      currentIdleStart: null,
      confusionSignals: [],
      lastActivityTime: new Date()
    }
  };

  // 初始化任务状态
  context.tasks.list.forEach(task => {
    context.tasks.status.set(task.id, task.status);
  });

  // 提取资源内容
  try {
    const resourceContents = await extractAllResources(mockResources);
    context.resources.contents = resourceContents;
  } catch (error) {
    console.error('提取资源内容失败:', error);
  }

  return context;
}

/**
 * 处理对话
 */
async function handleChat(
  coordinator: AgentCoordinator,
  context: SharedContext,
  userMessage: string
) {
  // 添加用户消息到上下文
  const userMsg: Message = {
    id: `msg_${Date.now()}`,
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  };
  context.conversation.messages.push(userMsg);

  // 调用Agent处理
  const response = await coordinator.handleUserMessage(userMessage);

  // 添加AI回复到上下文
  const aiMsg: Message = {
    id: `msg_${Date.now()}_ai`,
    role: 'assistant',
    content: response.message,
    timestamp: new Date(),
    agentType: 'tutor'
  };
  context.conversation.messages.push(aiMsg);
  context.conversation.lastAgentType = 'tutor';
  context.conversation.turnCount++;

  // 更新能力画像
  if (response.competencyUpdates && response.competencyUpdates.length > 0) {
    response.competencyUpdates.forEach(update => {
      const comp = context.competency.profile.competencies[update.type];
      const newRating = (comp.currentRating * comp.evidenceCount + update.rating)
        / (comp.evidenceCount + 1);
      comp.currentRating = Math.round(newRating * 10) / 10;
      comp.evidenceCount++;
      comp.recentEvidence.push(update.evidence);

      context.competency.profile.history.push({
        timestamp: new Date(),
        competencyType: update.type,
        rating: update.rating,
        source: update.source,
        evidence: update.evidence
      });
    });
  }

  // 异步触发元认知分析
  if (response.shouldTriggerMetacognition) {
    coordinator.runMetacognitionAnalysis('chat', {
      userMessage,
      aiResponse: response.message
    }).then(metacogResult => {
      if (metacogResult) {
        // 这里可以通过WebSocket或其他方式推送到前端
        console.log('元认知分析结果:', metacogResult);
      }
    }).catch(err => {
      console.error('元认知分析异步执行失败:', err);
    });
  }

  return NextResponse.json({
    success: true,
    message: response.message,
    messageId: aiMsg.id,
    competencyUpdates: response.competencyUpdates,
    competencyProfile: context.competency.profile
  });
}

/**
 * 处理任务提交
 */
async function handleTaskSubmission(
  coordinator: AgentCoordinator,
  context: SharedContext,
  taskId: string,
  answer: string
) {
  // 记录提交
  context.tasks.submissions.set(taskId, {
    answer,
    submittedAt: new Date()
  });
  context.tasks.status.set(taskId, 'completed');

  // 调用评估Agent
  const response = await coordinator.handleTaskSubmission(taskId, answer);

  // 保存评估结果
  if (response.taskAssessment) {
    context.tasks.assessments.set(taskId, response.taskAssessment);
  }

  // 更新能力画像
  if (response.competencyUpdates && response.competencyUpdates.length > 0) {
    response.competencyUpdates.forEach(update => {
      const comp = context.competency.profile.competencies[update.type];
      const newRating = (comp.currentRating * comp.evidenceCount + update.rating)
        / (comp.evidenceCount + 1);
      comp.currentRating = Math.round(newRating * 10) / 10;
      comp.evidenceCount++;
      comp.recentEvidence.push(update.evidence);

      context.competency.profile.history.push({
        timestamp: new Date(),
        competencyType: update.type,
        rating: update.rating,
        source: update.source,
        evidence: update.evidence
      });
    });
  }

  // 异步触发元认知分析
  if (response.shouldTriggerMetacognition) {
    const task = context.tasks.list.find(t => t.id === taskId);
    coordinator.runMetacognitionAnalysis('task_complete', {
      taskId,
      taskTitle: task?.title,
      assessment: response.taskAssessment
    }).then(metacogResult => {
      if (metacogResult) {
        console.log('元认知分析结果:', metacogResult);
      }
    }).catch(err => {
      console.error('元认知分析异步执行失败:', err);
    });
  }

  return NextResponse.json({
    success: true,
    message: response.message,
    assessment: response.taskAssessment,
    competencyUpdates: response.competencyUpdates,
    competencyProfile: context.competency.profile
  });
}
