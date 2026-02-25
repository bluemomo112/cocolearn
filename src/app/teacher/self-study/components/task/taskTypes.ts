import { TaskQuestion } from '@/types/shared-context';

export interface QuestionProps {
  question: TaskQuestion;
  selectedAnswer: string | string[] | undefined;
  onAnswer: (qId: string, answer: string | string[], isMultiple: boolean) => void;
  disabled?: boolean;
  showResult?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string | string[];
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
