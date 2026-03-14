/**
 * 演示脚本系统类型定义
 * 用于自学模式的场景化演示
 */

import { ChatMessage } from '@cross/self-learn/components/workbench/shared/types';
import { Resource, Task, LearningMode, LearningPathNode } from '@cross/self-learn';

/**
 * 场景分类
 */
export type ScenarioCategory =
  | 'onboarding'      // 新手指导
  | 'task_flow'       // 任务流程
  | 'ai_guided'       // AI引导
  | 'exploration';    // 自由探索

/**
 * 演示场景定义
 */
export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  category: ScenarioCategory;

  /**
   * 场景的初始状态（完整的状态快照）
   */
  initialState: {
    messages: ChatMessage[];
    learningMode: LearningMode;
    learningPath?: LearningPathNode[];
    generatedTasks?: Task[];
    resources?: Resource[];
    completedTasks?: string[];
  };

  /**
   * 关键步骤说明（可选，用于演示引导）
   */
  keySteps?: Array<{
    step: number;
    description: string;
    messageId?: string;
  }>;
}

/**
 * 场景集合
 */
export interface ScenarioCollection {
  scenarios: DemoScenario[];
  categories: {
    id: ScenarioCategory;
    label: string;
    description: string;
  }[];
}
