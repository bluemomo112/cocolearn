'use client';

import { useState, useEffect } from 'react';
import { SpaceSummary, SpaceConfig, createDefaultSpaceConfig } from '@/types/self-study';
import Onboarding from './components/Onboarding';
import SpaceManager from './components/SpaceManager';
import SelfStudyWorkbench from './components/SelfStudyWorkbench';

// 模拟存储的学习空间数据
const mockSpaces: SpaceSummary[] = [
  {
    id: 'space_1',
    title: 'Python 数据分析入门',
    topic: 'Python数据分析',
    scenario: 'skill_learning',
    learningMode: 'ai_guided',
    progress: 45,
    resourceCount: 3,
    lastAccessedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
  },
  {
    id: 'space_2',
    title: '量子力学基础概念',
    topic: '量子力学',
    scenario: 'interest_exploration',
    learningMode: 'self_directed',
    progress: 20,
    resourceCount: 1,
    lastAccessedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14天前
  },
];

type ViewState = 'manager' | 'onboarding' | 'workbench';

export default function SelfStudyPage() {
  const [viewState, setViewState] = useState<ViewState>('manager');
  const [spaces, setSpaces] = useState<SpaceSummary[]>(mockSpaces);
  const [currentSpace, setCurrentSpace] = useState<SpaceConfig | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // 检查是否首次访问
  useEffect(() => {
    // 实际应用中应该从 localStorage 或后端获取
    if (spaces.length === 0) {
      setIsFirstVisit(true);
      setViewState('onboarding');
    }
  }, [spaces.length]);

  // 创建新空间
  const handleCreateSpace = () => {
    setCurrentSpace(null);
    setViewState('onboarding');
  };

  // 打开已有空间
  const handleOpenSpace = (spaceId: string) => {
    // 实际应用中应该从后端获取完整的 SpaceConfig
    const spaceSummary = spaces.find(s => s.id === spaceId);
    if (spaceSummary) {
      const fullConfig = createDefaultSpaceConfig({
        id: spaceSummary.id,
        title: spaceSummary.title,
        topic: spaceSummary.topic,
        scenario: spaceSummary.scenario,
        learningMode: spaceSummary.learningMode,
      });
      setCurrentSpace(fullConfig);
      setViewState('workbench');

      // 更新最后访问时间
      setSpaces(prev => prev.map(s =>
        s.id === spaceId ? { ...s, lastAccessedAt: new Date() } : s
      ));
    }
  };

  // 删除空间
  const handleDeleteSpace = (spaceId: string) => {
    setSpaces(prev => prev.filter(s => s.id !== spaceId));
  };

  // 完成引导流程，创建新空间
  const handleOnboardingComplete = (config: SpaceConfig) => {
    // 添加到空间列表
    const newSummary: SpaceSummary = {
      id: config.id,
      title: config.title,
      topic: config.topic,
      scenario: config.scenario,
      learningMode: config.learningMode,
      progress: 0,
      resourceCount: config.resources.length,
      lastAccessedAt: new Date(),
      createdAt: config.createdAt,
    };
    setSpaces(prev => [newSummary, ...prev]);
    setCurrentSpace(config);
    setViewState('workbench');
  };

  // 返回空间管理器
  const handleBackToManager = () => {
    setCurrentSpace(null);
    setViewState('manager');
  };

  // 取消引导流程
  const handleCancelOnboarding = () => {
    if (spaces.length > 0) {
      setViewState('manager');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {viewState === 'manager' && (
        <SpaceManager
          spaces={spaces}
          onCreateSpace={handleCreateSpace}
          onOpenSpace={handleOpenSpace}
          onDeleteSpace={handleDeleteSpace}
        />
      )}

      {viewState === 'onboarding' && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          onCancel={spaces.length > 0 ? handleCancelOnboarding : undefined}
        />
      )}

      {viewState === 'workbench' && currentSpace && (
        <SelfStudyWorkbench
          config={currentSpace}
          onBack={handleBackToManager}
          onUpdateConfig={(updated) => setCurrentSpace(updated)}
        />
      )}
    </div>
  );
}
