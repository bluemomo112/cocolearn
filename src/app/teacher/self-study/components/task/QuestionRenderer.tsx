'use client';

import { QuestionProps } from './taskTypes';
import SingleChoiceQuestion from './questions/SingleChoiceQuestion';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion';
import TrueFalseQuestion from './questions/TrueFalseQuestion';
import FillInBlankQuestion from './questions/FillInBlankQuestion';

export default function QuestionRenderer(props: QuestionProps) {
  switch (props.question.type) {
    case 'single_choice':
      return <SingleChoiceQuestion {...props} />;
    case 'multiple_choice':
      return <MultipleChoiceQuestion {...props} />;
    case 'true_false':
      return <TrueFalseQuestion {...props} />;
    case 'fill_in_blank':
      return <FillInBlankQuestion {...props} />;
    default:
      return <SingleChoiceQuestion {...props} />;
  }
}

// 题型标签文本
export function getQuestionTypeLabel(type: string): string {
  switch (type) {
    case 'single_choice': return '单选题';
    case 'multiple_choice': return '多选题';
    case 'true_false': return '判断题';
    case 'fill_in_blank': return '填空题';
    default: return '选择题';
  }
}
