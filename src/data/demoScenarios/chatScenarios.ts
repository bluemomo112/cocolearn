/**
 * 演示脚本场景定义
 * 包含 6 个核心场景的完整对话脚本和状态
 */

import { ScenarioCollection } from './types';
import { onboardingGuide } from './scenarios/onboardingGuide';
import { resourceGeneration } from './scenarios/resourceGeneration';
import { taskCompletion } from './scenarios/taskCompletion';
import { socraticExplanation } from './scenarios/socraticExplanation';
import { aiGuidedLearning } from './scenarios/aiGuidedLearning';
import { selfDirectedExploration } from './scenarios/selfDirectedExploration';

// ============ 场景集合 ============
export const demoScenarios: ScenarioCollection = {
  scenarios: [
    onboardingGuide,
    resourceGeneration,
    taskCompletion,
    socraticExplanation,
    aiGuidedLearning,
    selfDirectedExploration,
  ],

  categories: [
    {
      id: 'onboarding',
      label: '新手指导',
      description: '首次使用的引导流程',
    },
    {
      id: 'task_flow',
      label: '任务流程',
      description: '资源生成和任务完成',
    },
    {
      id: 'ai_guided',
      label: 'AI引导',
      description: 'AI主动引导学习',
    },
    {
      id: 'exploration',
      label: '自由探索',
      description: '用户主导的学习',
    },
  ],
};

// 导出单个场景（方便按需引用）
export {
  onboardingGuide,
  resourceGeneration,
  taskCompletion,
  socraticExplanation,
  aiGuidedLearning,
  selfDirectedExploration,
};
