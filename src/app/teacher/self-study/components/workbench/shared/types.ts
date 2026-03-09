import { SpaceConfig, LearningMode } from '@/types/self-study';
import { Task } from '@/types/shared-context';

export interface SelfStudyWorkbenchProps {
  config?: SpaceConfig;
  spaceId?: string;
  mode?: 'teacher' | 'student';
  onBack?: () => void;
  onUpdateConfig?: (config: SpaceConfig) => void;
  isAIGenerating?: boolean;
  onCreateNewSpace?: () => void;
  onViewResults?: () => void;
  pendingExamFiles?: File[] | null;
  onExamFilesHandled?: () => void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // 消息类型
  messageType?: 'normal' | 'knowledge_checkpoint' | 'topic_transition' | 'resource_reference' | 'mode_transition';
  // 知识检查点
  checkpoint?: {
    question: string;
    options?: string[];
    correctAnswer?: string;
    userAnswer?: string;
    status: 'pending' | 'answered' | 'correct' | 'incorrect';
    explanation?: string;
    relatedNodeId?: string;
  };
  // 主题过渡
  transition?: {
    fromTopic: string;
    toTopic: string;
    fromNodeId: string;
    toNodeId: string;
    summary: string;
  };
  // 推荐回复和功能按钮
  suggestions?: {
    quickReplies?: Array<{ id: string; label: string }>;
    actionButtons?: Array<{
      id: string;
      label: string;
      description?: string; // 功能卡片描述文字
      iconName: string; // Lucide icon name
      studioToolId: string;
    }>;
  };
  // 资源引用
  resourceRef?: {
    resourceId: string;
    resourceTitle: string;
    excerpt?: string;
  };
  // 模式切换
  modeTransition?: {
    fromMode: LearningMode;
    toMode: LearningMode;
  };
  // 可选：嵌入的任务卡片
  embeddedTask?: Task;
  // 任务状态（用于保持答题进度）
  taskState?: {
    currentQuestionIndex: number;
    selectedAnswers: Record<string, string | string[]>;
    submissionText: string;
    status: 'idle' | 'in_progress' | 'submitting' | 'grading' | 'completed';
    quickResult?: {
      allCorrect: boolean;
      correctCount: number;
      totalCount: number;
      details: any[];
    };
  };
}

// Note interfaces for EnhancedNotesPanel
export interface VoiceRecording {
  id: string;
  url: string;
  duration: number;
  timestamp: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  images: string[];
  voiceRecordings: VoiceRecording[];
}
