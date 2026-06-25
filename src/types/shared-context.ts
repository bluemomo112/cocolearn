// 共享上下文类型定义

export type AgentType = 'tutor' | 'assessor' | 'metacognition';

export type CompetencyType = 'critical_thinking' | 'information_synthesis' | 'metacognition';

export type TaskStatus = 'locked' | 'available' | 'in_progress' | 'grading' | 'completed';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentType?: AgentType;
}

export interface Resource {
  id: string;
  title: string;
  type: 'document' | 'presentation' | 'video' | 'interactive';
  fileType?: 'docx' | 'pptx' | 'mp4';
  path?: string;
  description: string;
  duration?: string;
  textContent?: string;
  url?: string;
  interactiveCategory?: 'animation' | 'visualization' | 'simulation' | 'test';
  // 试卷相关扩展
  sourceType?: 'manual_upload' | 'exam_paper' | 'student_answer_sheet';
  linkedTaskId?: string;
  studentName?: string;
  visibility?: ResourceVisibility;
  // 内容来源标记（用于区分教师发布内容和学生添加内容）
  source?: 'teacher' | 'student';
}

export interface TaskQuestion {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'fill_in_blank' | 'true_false';
  content: string;           // Markdown 格式，支持 ![img](url)、视频嵌入等
  options?: string[];         // Markdown 格式选项
  answer: string | string[];
  explanation?: string;       // Markdown 格式解析
  blanks?: number;            // 填空题的空格数量
  points?: number;            // 每题分值，默认 1
}

export interface TaskRubric {
  excellent: string;
  good: string;
  pass: string;
  fail: string;
}

// 任务级别设置
export interface TaskSettings {
  showAnswersAfterSubmit: boolean;
  showExplanationsAfterSubmit: boolean;
  allowRetry: boolean;
  fullscreenMode: boolean;
  allowViewResources: boolean; // 开卷模式
  source: 'exam_converted' | 'ai_generated' | 'manual';
}

// 资源可见性配置
export interface ResourceVisibility {
  mode: 'always' | 'after_task' | 'hidden';
  afterTaskId?: string;
}

export interface Task {
  id: string;
  type: 'quiz' | 'assignment' | 'reflection';
  title: string;
  description: string;
  status: TaskStatus;
  required: boolean;
  questions?: TaskQuestion[];
  prompt?: string;
  rubric?: TaskRubric;
  assignedCompetencies?: CompetencyType[];
  prerequisite?: string[];
  submissionPlaceholder?: string;
  relatedResourceIds?: string[];
  settings?: TaskSettings;
  // 内容来源标记（用于区分教师发布内容和学生添加内容）
  source?: 'teacher' | 'student';
}

export interface CompetencyUpdate {
  type: CompetencyType;
  rating: number; // 1-4
  evidence: string;
  source: 'chat' | 'task' | 'reflection';
}

export interface CompetencyData {
  currentRating: number; // 1-4
  trend: 'ascending' | 'stable' | 'descending';
  evidenceCount: number;
  recentEvidence: string[];
}

export interface CompetencyProfile {
  studentId: string;
  courseId: string;
  competencies: {
    critical_thinking: CompetencyData;
    information_synthesis: CompetencyData;
    metacognition: CompetencyData;
  };
  history: CompetencyHistoryItem[];
  lastUpdated: Date;
}

export interface CompetencyHistoryItem {
  timestamp: Date;
  competencyType: CompetencyType;
  rating: number;
  source: 'chat' | 'task' | 'reflection';
  evidence: string;
}

export interface TaskAssessment {
  score: number;
  level: 'excellent' | 'good' | 'pass' | 'fail';
  feedback: {
    summary: string;
    strengths: string[];
    improvements: string[];
  };
  competencyAssessment?: {
    [key in CompetencyType]?: {
      rating: number;
      comment: string;
    };
  };
}

// 任务提交记录
export interface TaskSubmission {
  attemptNumber: number; // 第几次提交
  answer: string;
  submittedAt: Date;
  score?: number; // 客观题的得分
  correctCount?: number; // 客观题答对的题数
  totalCount?: number; // 客观题总题数
  isAllCorrect?: boolean; // 客观题是否全对
  assessment?: TaskAssessment; // 主观题的评估结果
  details?: any[]; // 客观题的详细结果
}

// 任务尝试历史记录
export interface TaskAttemptHistory {
  taskId: string;
  attempts: Array<{
    attemptNumber: number;
    submittedAt: Date;
    score?: number;
  }>;
}

export interface ResourceAccessLog {
  resourceId: string;
  startTime: Date;
  duration: number;
}

export interface BehaviorSignal {
  timestamp: Date;
  signal: string;
  messageId: string;
}

export interface SharedContext {
  // 1. 会话信息
  session: {
    sessionId: string;
    studentId: string;
    courseId: string;
    startTime: Date;
    currentPhase: 'exploring' | 'learning' | 'practicing';
  };

  // 2. 对话历史
  conversation: {
    messages: Message[];
    lastAgentType: AgentType | null;
    turnCount: number;
    messageAgentMap: Map<string, AgentType>;
  };

  // 3. 资源上下文
  resources: {
    available: Resource[];
    contents: Map<string, string>; // resourceId -> extracted text
    currentId: string | null;
    accessLog: ResourceAccessLog[];
  };

  // 4. 任务上下文
  tasks: {
    list: Task[];
    status: Map<string, TaskStatus>;
    submissions: Map<string, TaskSubmission[]>; // 改为数组，支持多次提交
    assessments: Map<string, TaskAssessment>;
  };

  // 5. 能力画像
  competency: {
    profile: CompetencyProfile;
    pendingUpdates: CompetencyUpdate[];
    lastUpdated: Date;
  };

  // 6. 行为数据
  behavior: {
    resourceStayTime: Map<string, number>;
    totalIdleTime: number;
    currentIdleStart: Date | null;
    confusionSignals: BehaviorSignal[];
    lastActivityTime: Date;
  };
}

// 资源查看统计
export interface ResourceViewStats {
  resourceId: string;
  title: string;
  viewCount: number;
  totalViewTime: number;
  lastViewedAt: Date | null;
}

// 任务完成详情
export interface TaskCompletionDetail {
  taskId: string;
  title: string;
  type: 'quiz' | 'assignment' | 'reflection';
  status: TaskStatus;
  studentAnswer?: string;
  submittedAt?: Date;
  score?: number;
  assessment?: TaskAssessment;
}

// Agent 上下文类型
export interface TutorAgentContext {
  resources: {
    list: Array<{
      id: string;
      title: string;
      type: string;
      description: string;
    }>;
    viewStats: ResourceViewStats[];
    contentSummaries: Map<string, string>;
  };
  tasks: {
    list: Array<{
      id: string;
      title: string;
      type: string;
      status: string;
      required: boolean;
    }>;
    completionDetails: TaskCompletionDetail[];
  };
  recentConversation: Message[];
  competencyProfile: CompetencyProfile;
}

export interface AssessorAgentContext {
  currentTask: {
    id: string;
    title: string;
    type: 'assignment';
    prompt: string;
    rubric?: TaskRubric;
    assignedCompetencies: CompetencyType[];
  };
  studentSubmission: {
    answer: string;
    submittedAt: Date;
  };
  relevantResources: Array<{
    id: string;
    title: string;
    contentSummary: string;
  }>;
}

export interface MetacognitionAgentContext {
  triggerEvent: 'chat' | 'task_complete';
  eventData: {
    userMessage?: string;
    aiResponse?: string;
    taskId?: string;
    taskTitle?: string;
    assessment?: TaskAssessment;
  };
  resources: {
    list: Array<{
      id: string;
      title: string;
      type: string;
    }>;
    viewStats: ResourceViewStats[];
  };
  tasks: {
    list: Array<{
      id: string;
      title: string;
      type: string;
      status: string;
    }>;
    completionDetails: TaskCompletionDetail[];
  };
  recentConversation: Message[];
  behaviorData: {
    resourceStayTime: Map<string, number>;
    totalIdleTime: number;
    confusionSignals: BehaviorSignal[];
    lastActivityTime: Date;
  };
  competencyProfile: CompetencyProfile;
}

export interface MetacognitionResult {
  studentState: 'focused' | 'confused' | 'fatigued' | 'off_topic';
  metacognitionLevel: number; // 1-4
  observation: string;
  competencyUpdates?: CompetencyUpdate[];
  growthRecord?: {
    title: string;
    description: string;
    competencies: CompetencyType[];
  };
}
