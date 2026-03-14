import {
  SharedContext,
  TutorAgentContext,
  AssessorAgentContext,
  MetacognitionAgentContext,
  ResourceViewStats,
  TaskCompletionDetail
} from '@cross/self-learn';

/**
 * 构建资源查看统计
 */
function buildResourceViewStats(sharedContext: SharedContext): ResourceViewStats[] {
  const { available, accessLog } = sharedContext.resources;

  return available.map(resource => {
    const resourceLogs = accessLog.filter(log => log.resourceId === resource.id);
    const viewCount = resourceLogs.length;
    const totalViewTime = resourceLogs.reduce((sum, log) => sum + log.duration, 0);
    const lastLog = resourceLogs[resourceLogs.length - 1];

    return {
      resourceId: resource.id,
      title: resource.title,
      viewCount,
      totalViewTime,
      lastViewedAt: lastLog?.startTime || null
    };
  });
}

/**
 * 构建任务完成详情
 */
function buildTaskCompletionDetails(sharedContext: SharedContext): TaskCompletionDetail[] {
  const { list, status, submissions, assessments } = sharedContext.tasks;

  return list.map(task => {
    const taskStatus = status.get(task.id) || 'available';
    const submissionList = submissions.get(task.id);
    const latestSubmission = submissionList?.[submissionList.length - 1];
    const assessment = assessments.get(task.id);

    return {
      taskId: task.id,
      title: task.title,
      type: task.type,
      status: taskStatus,
      ...(latestSubmission && {
        studentAnswer: latestSubmission.answer,
        submittedAt: latestSubmission.submittedAt
      }),
      ...(assessment && {
        score: assessment.score,
        assessment
      })
    };
  });
}

/**
 * 构建标准助教上下文
 */
export function buildTutorContext(sharedContext: SharedContext): TutorAgentContext {
  return {
    resources: {
      list: sharedContext.resources.available.map(r => ({
        id: r.id,
        title: r.title,
        type: r.type,
        description: r.description
      })),
      viewStats: buildResourceViewStats(sharedContext),
      contentSummaries: sharedContext.resources.contents
    },
    tasks: {
      list: sharedContext.tasks.list.map(t => ({
        id: t.id,
        title: t.title,
        type: t.type,
        status: sharedContext.tasks.status.get(t.id) || 'available',
        required: t.required
      })),
      completionDetails: buildTaskCompletionDetails(sharedContext)
    },
    recentConversation: sharedContext.conversation.messages.slice(-10),
    competencyProfile: sharedContext.competency.profile
  };
}

/**
 * 构建任务评估器上下文
 */
export function buildAssessorContext(
  sharedContext: SharedContext,
  taskId: string,
  studentAnswer: string
): AssessorAgentContext {
  const task = sharedContext.tasks.list.find(t => t.id === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);

  // 获取相关资源
  const relevantResourceIds = task.relatedResourceIds || [];
  const relevantResources = relevantResourceIds.map(rid => {
    const resource = sharedContext.resources.available.find(r => r.id === rid);
    const content = sharedContext.resources.contents.get(rid);
    return {
      id: rid,
      title: resource?.title || '',
      // 截取摘要而非全文
      contentSummary: content?.slice(0, 1500) || ''
    };
  });

  return {
    currentTask: {
      id: task.id,
      title: task.title,
      type: task.type as 'assignment',
      prompt: task.prompt || '',
      rubric: task.rubric,
      assignedCompetencies: task.assignedCompetencies || []
    },
    studentSubmission: {
      answer: studentAnswer,
      submittedAt: new Date()
    },
    relevantResources
  };
}

/**
 * 构建元认知监控上下文
 */
export function buildMetacognitionContext(
  sharedContext: SharedContext,
  triggerEvent: 'chat' | 'task_complete',
  eventData: any
): MetacognitionAgentContext {
  return {
    triggerEvent,
    eventData,
    resources: {
      list: sharedContext.resources.available.map(r => ({
        id: r.id,
        title: r.title,
        type: r.type
      })),
      viewStats: buildResourceViewStats(sharedContext)
    },
    tasks: {
      list: sharedContext.tasks.list.map(t => ({
        id: t.id,
        title: t.title,
        type: t.type,
        status: sharedContext.tasks.status.get(t.id) || 'available'
      })),
      completionDetails: buildTaskCompletionDetails(sharedContext)
    },
    recentConversation: sharedContext.conversation.messages.slice(-5),
    behaviorData: {
      resourceStayTime: sharedContext.behavior.resourceStayTime,
      totalIdleTime: sharedContext.behavior.totalIdleTime,
      confusionSignals: sharedContext.behavior.confusionSignals,
      lastActivityTime: sharedContext.behavior.lastActivityTime
    },
    competencyProfile: sharedContext.competency.profile
  };
}
