import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  SharedContext,
  Message,
  AgentType,
  TaskStatus,
  CompetencyUpdate,
  TaskAssessment,
  ResourceViewStats,
  TaskCompletionDetail,
  CompetencyProfile,
  CompetencyData,
  BehaviorSignal
} from '@/types/shared-context';
import { mockResources, mockTasks } from '@/data/mockLearningData';

// 创建初始能力数据
function createInitialCompetencyData(): CompetencyData {
  return {
    currentRating: 2,
    trend: 'stable',
    evidenceCount: 0,
    recentEvidence: []
  };
}

// 创建初始上下文
function createInitialContext(): SharedContext {
  const sessionId = `session_${Date.now()}`;
  const studentId = 'student_demo';
  const courseId = 'course_plant_factory';

  return {
    session: {
      sessionId,
      studentId,
      courseId,
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
      list: mockTasks,
      status: new Map(mockTasks.map(t => [t.id, t.status])),
      submissions: new Map(),
      assessments: new Map()
    },
    competency: {
      profile: {
        studentId,
        courseId,
        competencies: {
          critical_thinking: createInitialCompetencyData(),
          information_synthesis: createInitialCompetencyData(),
          metacognition: createInitialCompetencyData()
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
}

interface SharedContextStore {
  context: SharedContext;

  // ========== 读取方法 ==========
  getConversationHistory: (limit?: number) => Message[];
  getCurrentResource: () => string | null;
  getResourceContent: (resourceId: string) => string | null;
  getTaskStatus: (taskId: string) => TaskStatus;
  getCompetencyProfile: () => CompetencyProfile;
  getResourceViewStats: () => ResourceViewStats[];
  getTaskCompletionDetails: () => TaskCompletionDetail[];

  // ========== 写入方法 ==========
  addMessage: (message: Message, agentType?: AgentType) => void;
  setCurrentResource: (resourceId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  submitTask: (taskId: string, answer: string) => void;
  addTaskAssessment: (taskId: string, assessment: TaskAssessment) => void;
  updateCompetency: (updates: CompetencyUpdate[]) => void;
  recordResourceAccess: (resourceId: string, duration: number) => void;
  recordBehaviorSignal: (signal: string, messageId: string) => void;
  setResourceContent: (resourceId: string, content: string) => void;

  // ========== 会话管理 ==========
  initSession: (studentId: string, courseId: string) => void;
  resetSession: () => void;
}

export const useSharedContext = create<SharedContextStore>()(
  immer((set, get) => ({
    context: createInitialContext(),

    // 获取对话历史
    getConversationHistory: (limit = 20) => {
      const { messages } = get().context.conversation;
      return messages.slice(-limit);
    },

    // 获取当前资源ID
    getCurrentResource: () => {
      return get().context.resources.currentId;
    },

    // 获取资源内容
    getResourceContent: (resourceId: string) => {
      return get().context.resources.contents.get(resourceId) || null;
    },

    // 获取任务状态
    getTaskStatus: (taskId: string) => {
      return get().context.tasks.status.get(taskId) || 'locked';
    },

    // 获取能力画像
    getCompetencyProfile: () => {
      return get().context.competency.profile;
    },

    // 获取资源查看统计
    getResourceViewStats: () => {
      const { available, accessLog } = get().context.resources;

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
    },

    // 获取任务完成详情
    getTaskCompletionDetails: () => {
      const { list, status, submissions, assessments } = get().context.tasks;

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
    },

    // 添加消息
    addMessage: (message, agentType) => {
      set(state => {
        state.context.conversation.messages.push(message);
        state.context.conversation.turnCount++;
        if (agentType) {
          state.context.conversation.lastAgentType = agentType;
          state.context.conversation.messageAgentMap.set(message.id, agentType);
        }
        state.context.behavior.lastActivityTime = new Date();
      });
    },

    // 设置当前资源
    setCurrentResource: (resourceId) => {
      set(state => {
        state.context.resources.currentId = resourceId;
        state.context.behavior.lastActivityTime = new Date();
      });
    },

    // 更新任务状态
    updateTaskStatus: (taskId, status) => {
      set(state => {
        state.context.tasks.status.set(taskId, status);
      });
    },

    // 提交任务
    submitTask: (taskId, answer) => {
      set(state => {
        const existingSubmissions = state.context.tasks.submissions.get(taskId) || [];
        const newSubmission = {
          attemptNumber: existingSubmissions.length + 1,
          answer,
          submittedAt: new Date()
        };
        state.context.tasks.submissions.set(taskId, [...existingSubmissions, newSubmission]);
        state.context.tasks.status.set(taskId, 'completed');
        state.context.behavior.lastActivityTime = new Date();
      });
    },

    // 添加任务评估
    addTaskAssessment: (taskId, assessment) => {
      set(state => {
        state.context.tasks.assessments.set(taskId, assessment);
      });
    },

    // 更新能力画像
    updateCompetency: (updates) => {
      set(state => {
        updates.forEach(update => {
          const comp = state.context.competency.profile.competencies[update.type];
          if (comp) {
            // 加权更新评分
            const newRating = (comp.currentRating * comp.evidenceCount + update.rating)
              / (comp.evidenceCount + 1);
            comp.currentRating = Math.round(newRating * 10) / 10; // 保留一位小数
            comp.evidenceCount++;
            comp.recentEvidence.push(update.evidence);

            // 只保留最近5条证据
            if (comp.recentEvidence.length > 5) {
              comp.recentEvidence = comp.recentEvidence.slice(-5);
            }

            // 记录历史
            state.context.competency.profile.history.push({
              timestamp: new Date(),
              competencyType: update.type,
              rating: update.rating,
              source: update.source,
              evidence: update.evidence
            });
          }
        });
        state.context.competency.lastUpdated = new Date();
        state.context.competency.profile.lastUpdated = new Date();
      });
    },

    // 记录资源访问
    recordResourceAccess: (resourceId, duration) => {
      set(state => {
        state.context.resources.accessLog.push({
          resourceId,
          startTime: new Date(),
          duration
        });

        // 更新资源停留时间
        const currentTime = state.context.behavior.resourceStayTime.get(resourceId) || 0;
        state.context.behavior.resourceStayTime.set(resourceId, currentTime + duration);

        state.context.behavior.lastActivityTime = new Date();
      });
    },

    // 记录行为信号
    recordBehaviorSignal: (signal, messageId) => {
      set(state => {
        state.context.behavior.confusionSignals.push({
          timestamp: new Date(),
          signal,
          messageId
        });
      });
    },

    // 设置资源内容
    setResourceContent: (resourceId, content) => {
      set(state => {
        state.context.resources.contents.set(resourceId, content);
      });
    },

    // 初始化会话
    initSession: (studentId, courseId) => {
      set(state => {
        const sessionId = `session_${Date.now()}`;
        state.context.session = {
          sessionId,
          studentId,
          courseId,
          startTime: new Date(),
          currentPhase: 'exploring'
        };
        state.context.competency.profile.studentId = studentId;
        state.context.competency.profile.courseId = courseId;
      });
    },

    // 重置会话
    resetSession: () => {
      set({ context: createInitialContext() });
    }
  }))
);
