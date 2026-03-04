// 自学空间类型定义
// SpaceConfig 是 NoteConfig 的超集，用于通用版自学空间

import { Resource, Task, CompetencyType } from './shared-context';

// 学习模式
export type LearningMode = 'self_directed' | 'ai_guided' | 'diagnostic';

// 资源来源
export type ResourceSource = 'user_uploaded' | 'ai_generated' | 'url_imported';

// AI 风格
export type AIStyle = 'patient' | 'socratic' | 'challenging';

// 知识边界
export type KnowledgeBoundary = 'strict' | 'moderate' | 'free';

// 学习流程
export type LearningFlow = '5E' | 'PBL' | 'feynman' | 'custom';

// 预设场景
export type PresetScenario = 'exam_prep' | 'paper_reading' | 'skill_learning' | 'interest_exploration';

// 用户画像
export interface UserProfile {
  goal?: string; // 学习目标
  level?: 'beginner' | 'intermediate' | 'advanced'; // 当前水平
  preferences?: {
    aiStyle: AIStyle;
    knowledgeBoundary: KnowledgeBoundary;
    learningFlow?: LearningFlow;
    testPreferences?: {
      questionTypes: ('single_choice' | 'multiple_choice' | 'short_answer')[];
      quantity: number;
      difficulty: 'easy' | 'medium' | 'hard';
    };
    reminderSettings?: {
      studyDuration: number; // 分钟
      breakReminder: boolean;
    };
  };
  customInstructions?: string; // 自定义 AI 指令
}

// 学习路径节点
export interface LearningPathNode {
  id: string;
  title: string;
  description?: string;
  status: 'mastered' | 'learning' | 'needs_correction' | 'pending';
  dependencies?: string[]; // 依赖的节点 ID
  estimatedTime?: number; // 预计学习时间（分钟）
  completedAt?: Date;
}

// 学习路径
export interface LearningPath {
  nodes: LearningPathNode[];
  currentNodeId?: string;
  progress: number; // 0-100
  generatedAt: Date;
  updatedAt: Date;
}

// 发布元数据
export interface PublishMetadata {
  spaceName?: string;          // 学习空间名称
  isAnonymous?: boolean;       // 是否匿名模式
  accessCode?: string;         // 访问码（匿名模式使用）
  grade?: string;              // 年级，如 "四年级"
  subjects?: string[];         // 学科，如 ["科学", "地理"]
  bindClasses?: string[];      // 绑定班级，如 ["四年级1班", "四年级2班"]
  publishedAt?: Date;          // 发布时间
  publishedBy?: string;        // 发布者
}

// 发布配置范围
export interface PublishScope {
  includeResources: boolean;
  includeTasks: boolean;
  includeAISettings: boolean;
  includeLearningPath: boolean;
}

// 发布版本
export interface PublishVersion {
  version: number;
  publishedAt: Date;
  scope: PublishScope;
  shareLink: string;
  snapshot: Partial<SpaceConfig>; // 发布时的配置快照
}

// 自学空间配置（SpaceConfig）
export interface SpaceConfig {
  id: string;
  title: string;
  description?: string;
  topic?: string; // 学习主题
  scenario?: PresetScenario; // 预设场景

  // 笔记元信息
  cover?: string; // 封面图
  tags?: string[]; // 标签
  subjects?: string[]; // 学科
  grade?: string; // 年级
  bindClasses?: string[]; // 绑定班级
  publishScope?: PublishScope; // 发布范围
  publishedLink?: string; // 发布链接
  publishedCode?: string; // 访问码

  // 学习模式（替代 interactionMode）
  learningMode: LearningMode;

  // 资源配置
  resources: Resource[];
  resourceSource: ResourceSource;

  // 任务配置
  tasks: Task[];

  // 用户画像
  userProfile: UserProfile;

  // 学习路径（AI 引导模式下使用）
  learningPath?: LearningPath;

  // 笔记模板
  noteTemplate: 'blank' | 'cornell' | 'sky_rain_umbrella';

  // AI 交互配置
  freeConfig?: {
    selectedAgentId: string;
    teacherPrompt: string;
    enableFence: boolean;
  };

  guidedConfig?: {
    selectedWorkflowId: string;
    stagePrompts: Record<string, string>; // stageId -> custom prompt
  };

  // AI 监控配置
  metaConfig?: {
    selectedStrategyId: string;
    teacherPrompt: string;
  };

  // 能力追踪维度（通用版可自定义）
  competencyDimensions: CompetencyType[];

  // 发布状态
  publishStatus: 'unpublished' | 'published';
  publishedVersions: PublishVersion[];
  currentPublishVersion?: number;
  publishMetadata?: PublishMetadata; // 发布元数据

  // 元数据
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

// 学习空间摘要（用于列表展示）
export interface SpaceSummary {
  id: string;
  title: string;
  topic?: string;
  scenario?: PresetScenario;
  learningMode: LearningMode;
  progress: number;
  resourceCount: number;
  lastAccessedAt?: Date;
  createdAt: Date;
}

// 引导式起点状态
export interface OnboardingState {
  step: 'intent' | 'clarify' | 'generating';
  intent?: {
    type: 'topic' | 'resource' | 'scenario' | 'unclear';
    value?: string;
    files?: File[];
    scenario?: PresetScenario;
  };
  clarification?: {
    learningMode?: LearningMode;
    level?: 'beginner' | 'intermediate' | 'advanced';
  };
}

// 场景卡片配置
export interface ScenarioCard {
  id: PresetScenario;
  title: string;
  description: string;
  icon: string;
  defaultLearningMode: LearningMode;
}

// 预设场景卡片
export const PRESET_SCENARIOS: ScenarioCard[] = [
  {
    id: 'exam_prep',
    title: '备考复习',
    description: '系统复习知识点，针对性练习',
    icon: '📚',
    defaultLearningMode: 'ai_guided',
  },
  {
    id: 'paper_reading',
    title: '论文研读',
    description: '深入理解学术论文，提取关键信息',
    icon: '📄',
    defaultLearningMode: 'self_directed',
  },
  {
    id: 'skill_learning',
    title: '技能学习',
    description: '掌握新技能，从入门到精通',
    icon: '🛠️',
    defaultLearningMode: 'ai_guided',
  },
  {
    id: 'interest_exploration',
    title: '兴趣探索',
    description: '自由探索感兴趣的领域',
    icon: '🔍',
    defaultLearningMode: 'self_directed',
  },
];

// 学习模式配置
export const LEARNING_MODE_CONFIG = {
  self_directed: {
    label: '我自己学，有问题问你',
    description: '被动回答，不主动干预',
    feeling: '像有个百科全书',
    aiRole: 'passive',
  },
  ai_guided: {
    label: '你带我学',
    description: '主动规划路径、检查理解、推进节奏',
    feeling: '像有个私教',
    aiRole: 'active',
  },
  diagnostic: {
    label: '先测测我的水平',
    description: '对话式诊断，生成学习计划',
    feeling: '像入学测评',
    aiRole: 'diagnostic',
  },
} as const;

// 兼容映射：learningMode -> interactionMode
export function mapLearningModeToInteractionMode(learningMode: LearningMode): 'free' | 'guided' {
  switch (learningMode) {
    case 'self_directed':
      return 'free';
    case 'ai_guided':
    case 'diagnostic':
      return 'guided';
    default:
      return 'free';
  }
}

// 创建默认 SpaceConfig
export function createDefaultSpaceConfig(partial?: Partial<SpaceConfig>): SpaceConfig {
  const now = new Date();
  return {
    id: `space_${Date.now()}`,
    title: '新学习空间',
    learningMode: 'self_directed',
    resources: [],
    resourceSource: 'user_uploaded',
    tasks: [],
    userProfile: {
      preferences: {
        aiStyle: 'patient',
        knowledgeBoundary: 'moderate',
      },
    },
    noteTemplate: 'blank',
    competencyDimensions: ['critical_thinking', 'information_synthesis', 'metacognition'],
    publishStatus: 'unpublished',
    publishedVersions: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}
