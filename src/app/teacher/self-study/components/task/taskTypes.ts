import { TaskQuestion } from '@/types/shared-context';

export interface QuestionProps {
  question: TaskQuestion;
  selectedAnswer: string | string[] | undefined;
  onAnswer: (qId: string, answer: string | string[], isMultiple: boolean) => void;
  disabled?: boolean;
  showResult?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string | string[];
  compact?: boolean; // 嵌入对话时使用紧凑样式
}

export interface QuickResultData {
  allCorrect: boolean;
  correctCount: number;
  totalCount: number;
  details: Array<{
    questionId: string;
    correct: boolean;
    correctAnswer?: string | string[];
    userAnswer?: string | string[];
    explanation?: string;
  }>;
}

// 试卷处理配置
export interface ExamProcessingConfig {
  mode: 'exact_extract' | 'extract_and_regenerate';
  batchMode?: 'separate' | 'same_exam_multi_student' | 'merge';
  includeHandwriting: boolean;
  files: File[];
}

// 试卷转换进度
export type ExamProcessingStep = 'detecting' | 'extracting' | 'converting' | 'done';

// 错题学习上下文
export interface ErrorQuestionContext {
  taskId: string;
  questionId: string;
  question: TaskQuestion;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  explanation?: string;
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}
