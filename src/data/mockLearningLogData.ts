/**
 * 学习日志类型定义和模拟数据
 * 用于「我的能力成长」tab 的时间线展示
 */

import type { CompetencyType } from './mockCompetencyData';

// ============ 类型定义 ============

export type LogEntryType =
  | 'resource_complete'    // 完成资源学习
  | 'task_complete'        // 完成任务
  | 'quiz_correction'      // 订正错题
  | 'follow_up_question'   // 追问深入
  | 'knowledge_extension'  // 知识拓展
  | 'competency_upgrade'   // 能力提升
  | 'ai_observation'       // AI洞察
  | 'milestone';           // 里程碑

export interface LearningLogEntry {
  id: string;
  type: LogEntryType;
  timestamp: Date;
  title: string;
  description: string;
  metadata?: {
    score?: number;
    duration?: number;
    competencyType?: CompetencyType;
    previousRating?: number;
    newRating?: number;
    aiObservationType?: 'praise' | 'suggestion' | 'insight';
  };
}

// ============ 类型配置 ============

export const LOG_ENTRY_CONFIG: Record<LogEntryType, {
  icon: string;
  label: string;
  color: string;       // tailwind color name
  dotColor: string;    // dot bg class
  bgColor: string;     // card bg class
}> = {
  resource_complete: {
    icon: '📖', label: '完成资源',
    color: 'blue', dotColor: 'bg-blue-500', bgColor: 'bg-blue-50',
  },
  task_complete: {
    icon: '✅', label: '完成任务',
    color: 'green', dotColor: 'bg-green-500', bgColor: 'bg-green-50',
  },
  quiz_correction: {
    icon: '🔄', label: '订正错题',
    color: 'amber', dotColor: 'bg-amber-500', bgColor: 'bg-amber-50',
  },
  follow_up_question: {
    icon: '❓', label: '追问深入',
    color: 'purple', dotColor: 'bg-purple-500', bgColor: 'bg-purple-50',
  },
  knowledge_extension: {
    icon: '🚀', label: '知识拓展',
    color: 'indigo', dotColor: 'bg-indigo-500', bgColor: 'bg-indigo-50',
  },
  competency_upgrade: {
    icon: '🌟', label: '能力提升',
    color: 'yellow', dotColor: 'bg-yellow-500', bgColor: 'bg-yellow-50',
  },
  ai_observation: {
    icon: '✨', label: 'AI洞察',
    color: 'pink', dotColor: 'bg-pink-500', bgColor: 'bg-pink-50',
  },
  milestone: {
    icon: '🏆', label: '里程碑',
    color: 'rose', dotColor: 'bg-rose-500',
    bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
  },
};

// ============ Mock 数据 ============

const today = new Date();
const h = (hour: number, min: number) => {
  const d = new Date(today);
  d.setHours(hour, min, 0, 0);
  return d;
};

export const mockLearningLog: LearningLogEntry[] = [
  {
    id: 'log-01', type: 'resource_complete', timestamp: h(9, 0),
    title: '完成资源：植物营养学基础',
    description: '阅读了植物营养学基础教材第3章，了解了大量元素和微量元素的作用。',
    metadata: { duration: 12 },
  },
  {
    id: 'log-02', type: 'resource_complete', timestamp: h(9, 15),
    title: '完成资源：水培营养液配方',
    description: '观看了水培营养液配方视频，学习了EC值和pH值的调节方法。',
    metadata: { duration: 18 },
  },
  {
    id: 'log-03', type: 'task_complete', timestamp: h(9, 45),
    title: '完成测验：营养液基础知识',
    description: '完成了营养液基础知识测验，答对17/20题。',
    metadata: { score: 85 },
  },
  {
    id: 'log-04', type: 'quiz_correction', timestamp: h(9, 52),
    title: '订正：EC值多选题遗漏',
    description: '重新理解了EC值的影响因素，补充了温度对EC值的影响这一选项。',
  },
  {
    id: 'log-05', type: 'follow_up_question', timestamp: h(10, 5),
    title: '追问：pH值为什么影响养分吸收？',
    description: '向AI追问了pH值与离子形态的关系，理解了酸碱度如何影响根系对不同元素的吸收效率。',
  },
  {
    id: 'log-06', type: 'ai_observation', timestamp: h(10, 20),
    title: 'AI洞察：批判性思维表现突出',
    description: '你在追问环节展现了优秀的批判性思维——不满足于表面答案，主动探究因果关系。',
    metadata: { aiObservationType: 'praise' },
  },
  {
    id: 'log-07', type: 'competency_upgrade', timestamp: h(10, 35),
    title: '能力提升：信息整合',
    description: '通过跨资源学习和主动订正，你的信息整合能力从2星提升到3星。',
    metadata: { competencyType: 'information_synthesis', previousRating: 2, newRating: 3 },
  },
  {
    id: 'log-08', type: 'resource_complete', timestamp: h(10, 50),
    title: '完成资源：无土栽培技术对比',
    description: '阅读了水培、气雾培、基质培三种无土栽培技术的对比分析文章。',
    metadata: { duration: 17 },
  },
  {
    id: 'log-09', type: 'knowledge_extension', timestamp: h(11, 0),
    title: '知识拓展：太空植物生长实验',
    description: '主动探索了NASA在国际空间站进行的植物生长实验，了解了微重力环境下的营养液管理。',
  },
  {
    id: 'log-10', type: 'ai_observation', timestamp: h(11, 10),
    title: 'AI洞察：建议关注实验设计',
    description: '你对太空植物实验很感兴趣，建议进一步了解实验设计中的变量控制方法，这将提升你的元认知能力。',
    metadata: { aiObservationType: 'suggestion' },
  },
  {
    id: 'log-11', type: 'milestone', timestamp: h(11, 15),
    title: '里程碑：全部必修资源学习完成',
    description: '恭喜！你已完成本课程所有必修资源的学习，可以进入拓展学习阶段。',
  },
  {
    id: 'log-12', type: 'follow_up_question', timestamp: h(11, 25),
    title: '追问：基质培和水培哪个更适合家庭种植？',
    description: '对比了两种方式的成本、维护难度和产量，得出了基质培更适合初学者的结论。',
  },
];
