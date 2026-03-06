'use client';

import { useState } from 'react';
import { LearningMode, LearningPathNode } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';
import { EnhancedNotesPanel } from './EnhancedNotesPanel';
import { LearningStatusPanel } from './LearningStatusPanel';
import { Pencil, Activity } from 'lucide-react';

interface WorkspaceSectionProps {
  learningMode: LearningMode;
  isAIGenerating?: boolean;
  getThemeClass: (type: 'bg' | 'bgHover' | 'text' | 'border' | 'icon') => string;
  configId?: string;
  elapsedTime: number;
  learningPath: LearningPathNode[];
  observations: Array<{
    id: string;
    type: 'praise' | 'suggestion' | 'insight';
    icon: string;
    message: string;
    timestamp: Date
  }>;
  rightPanelTab: 'notes' | 'status';
  onTabChange: (tab: 'notes' | 'status') => void;
}

export function WorkspaceSection({
  learningMode,
  isAIGenerating,
  getThemeClass,
  configId,
  elapsedTime,
  learningPath,
  observations,
  rightPanelTab,
  onTabChange,
}: WorkspaceSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      {/* Tab 切换 */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-2 shrink-0">
        <button
          onClick={() => onTabChange('notes')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
            rightPanelTab === 'notes'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Pencil size={14} />
          {t('笔记')}
        </button>
        <button
          onClick={() => onTabChange('status')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
            rightPanelTab === 'status'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity size={14} />
          {t('学习状态')}
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-hidden">
        {rightPanelTab === 'notes' ? (
          <EnhancedNotesPanel
            learningMode={learningMode}
            isAIGenerating={isAIGenerating}
            getThemeClass={getThemeClass}
            configId={configId}
          />
        ) : (
          <LearningStatusPanel
            elapsedTime={elapsedTime}
            learningMode={learningMode}
            learningPath={learningPath}
            observations={observations}
          />
        )}
      </div>
    </div>
  );
}
