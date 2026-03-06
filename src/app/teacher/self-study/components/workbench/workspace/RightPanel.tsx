'use client';

import { LearningMode } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';
import { EnhancedNotesPanel } from './EnhancedNotesPanel';
import GrowthTimelinePanel from '@/app/student/components/GrowthTimelinePanel';
import { COLLAPSED_WIDTH } from '../shared/constants';
import {
  ChevronLeft, ChevronRight, Pencil, Activity, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

interface StudioTool {
  [key: string]: any;
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface RightPanelProps {
  isRightCollapsed: boolean;
  rightWidth: number;
  rightTab: 'workspace' | 'status';
  learningMode: LearningMode;
  isAIGenerating?: boolean;
  configId?: string;
  studioTools: any[];
  collapsedPanels: Record<string, boolean>;
  generatingToolId: string | null;
  flashingToolId: string | null;
  getThemeClass: (type: 'bg' | 'bgHover' | 'text' | 'border' | 'icon') => string;
  onSetRightCollapsed: (collapsed: boolean) => void;
  onSetRightTab: (tab: 'workspace' | 'status') => void;
  onToggleStudioPanel: () => void;
  onStudioToolClick: (tool: any) => void;
  onOpenToolConfig: (toolId: string, event: React.MouseEvent) => void;
}

export function RightPanel({
  isRightCollapsed,
  rightWidth,
  rightTab,
  learningMode,
  isAIGenerating,
  configId,
  studioTools,
  collapsedPanels,
  generatingToolId,
  flashingToolId,
  getThemeClass,
  onSetRightCollapsed,
  onSetRightTab,
  onToggleStudioPanel,
  onStudioToolClick,
  onOpenToolConfig,
}: RightPanelProps) {
  const { t } = useLanguage();

  return (
    <div
      style={{
        width: isRightCollapsed ? `${COLLAPSED_WIDTH}px` : `${rightWidth}%`,
        transition: 'width 0.3s ease-in-out'
      }}
      className="bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-hidden"
    >
      {isRightCollapsed ? (
        <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
          <div className="p-3 border-b border-gray-200 flex justify-center">
            <button
              onClick={() => onSetRightCollapsed(false)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title={t('展开面板')}
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 space-y-1">
            {studioTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSetRightCollapsed(false)}
                className="w-full px-3 py-3 hover:bg-gray-100 transition-colors flex flex-col items-center gap-1 group rounded-lg"
                title={tool.label}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles size={20} className={getThemeClass('icon')} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => onSetRightTab('workspace')}
              className={`flex-1 h-12 px-4 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                rightTab === 'workspace'
                  ? `${getThemeClass('text')} border-b-2 ${getThemeClass('border')} bg-white`
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Pencil size={12} />
              {t('工作区')}
            </button>
            <button
              onClick={() => onSetRightTab('status')}
              className={`flex-1 h-12 px-4 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                rightTab === 'status'
                  ? `${getThemeClass('text')} border-b-2 ${getThemeClass('border')} bg-white`
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Activity size={12} />
              {t('学习状态')}
            </button>
            <button
              onClick={() => onSetRightCollapsed(true)}
              className="px-2 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
              title={t('折叠面板')}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {rightTab === 'workspace' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div
                className="flex-1 min-h-0 overflow-hidden transition-all"
                style={{
                  flex: collapsedPanels.studio ? '1 1 auto' : '0 0 50%'
                }}
              >
                <EnhancedNotesPanel learningMode={learningMode} isAIGenerating={isAIGenerating} getThemeClass={getThemeClass} configId={configId} />
              </div>

              <div
                className="border-t border-gray-200 bg-white transition-all flex flex-col min-h-0 overflow-hidden"
                style={{
                  flex: collapsedPanels.studio ? '0 0 auto' : '0 0 50%'
                }}
              >
                <div
                  className={`px-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-all flex flex-col justify-center ${collapsedPanels.studio ? 'h-[70px]' : 'h-12'}`}
                  onClick={onToggleStudioPanel}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Sparkles size={14} className="text-gray-500" />
                        {t('学习工具')}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {collapsedPanels.studio ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronUp size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {!collapsedPanels.studio && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {studioTools.map((tool) => {
                        const isGenerating = generatingToolId === tool.id;
                        const isFlashing = flashingToolId === tool.id;
                        return (
                          <div
                            key={tool.id}
                            onClick={() => !isGenerating && onStudioToolClick(tool)}
                            className={`p-3 rounded-lg border text-left transition-all relative group ${
                              isGenerating
                                ? 'bg-gray-50 border-gray-200 animate-pulse cursor-wait'
                                : isFlashing
                                ? 'ring-2 ring-blue-400 scale-105 bg-blue-50 border-blue-300'
                                : `bg-white border-gray-200 hover:${getThemeClass('border')} hover:shadow-sm cursor-pointer`
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-lg">{tool.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700 truncate">{tool.label}</p>
                                {isGenerating ? (
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Activity size={10} className="animate-spin" />
                                    {t('生成中...')}
                                  </p>
                                ) : (
                                  <p className="text-xs text-gray-400 mt-0.5 truncate">{tool.description}</p>
                                )}
                              </div>
                              {!isGenerating && (
                                <button
                                  onClick={(e) => onOpenToolConfig(tool.id, e)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-lg"
                                  title={t('配置')}
                                >
                                  <Pencil size={12} className="text-gray-400 hover:text-gray-600" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-3">
                      {t('点击工具卡片生成内容，点击编辑图标配置工具')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3">
              <GrowthTimelinePanel competencyProfile={{
                critical_thinking: 2,
                information_synthesis: 2,
                metacognition: 2,
              }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
