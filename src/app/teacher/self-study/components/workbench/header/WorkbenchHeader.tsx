'use client';

import { SpaceConfig } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Brain, Pencil, Check, X, Settings, Share2, BarChart3 } from 'lucide-react';

interface WorkbenchHeaderProps {
  config: SpaceConfig;
  isStudentMode: boolean;
  isEditingTitle: boolean;
  editedTitle: string;
  demoMode?: boolean;
  currentScenario?: string | null;
  onBack?: () => void;
  onTitleEdit: () => void;
  onTitleSave: () => void;
  onTitleCancel: () => void;
  onTitleChange: (title: string) => void;
  onSettingsOpen: () => void;
  onPublishOpen: () => void;
  onViewAnalytics: () => void;
  onNoteInfoOpen: () => void;
  onLoadScenario?: (scenarioId: string) => void;
  onExitDemoMode?: () => void;
}

export function WorkbenchHeader({
  config,
  isStudentMode,
  isEditingTitle,
  editedTitle,
  demoMode = false,
  currentScenario = null,
  onBack,
  onTitleEdit,
  onTitleSave,
  onTitleCancel,
  onTitleChange,
  onSettingsOpen,
  onPublishOpen,
  onViewAnalytics,
  onNoteInfoOpen,
  onLoadScenario,
  onExitDemoMode,
}: WorkbenchHeaderProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* 顶部状态栏 */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">{t('返回')}</span>
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-primary-600" />
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => onTitleChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onTitleSave();
                    if (e.key === 'Escape') onTitleCancel();
                  }}
                  className="text-base font-semibold text-gray-900 border border-primary-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                <button
                  onClick={onTitleSave}
                  className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title={t('保存')}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={onTitleCancel}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t('取消')}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-base font-semibold text-gray-900">{config.title}</h1>
                <button
                  onClick={onNoteInfoOpen}
                  className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                  title={t('编辑配置')}
                >
                  <Pencil size={14} />
                </button>
                {config.publishStatus === 'published' && (
                  <span className="px-2 py-0.5 text-xs text-primary-600 bg-primary-50 border border-primary-200 rounded">
                    已发布
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 中间：场景选择器（演示模式） */}
        {!isStudentMode && onLoadScenario && (
          <div className="flex items-center gap-3">
            {demoMode && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-xs font-medium text-amber-700">演示模式</span>
                {onExitDemoMode && (
                  <button
                    onClick={onExitDemoMode}
                    className="text-xs text-amber-600 hover:text-amber-800 underline"
                  >
                    退出
                  </button>
                )}
              </div>
            )}
            <select
              value={currentScenario || ''}
              onChange={(e) => e.target.value && onLoadScenario(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <option value="">选择演示场景</option>
              <optgroup label="新手指导">
                <option value="onboarding_guide">新手指导</option>
              </optgroup>
              <optgroup label="任务流程">
                <option value="resource_generation">资源生成流程</option>
                <option value="task_completion">任务完成流程</option>
              </optgroup>
              <optgroup label="AI引导">
                <option value="socratic_explanation">苏格拉底式讲解</option>
                <option value="ai_guided_learning">AI引导模式</option>
              </optgroup>
              <optgroup label="自由探索">
                <option value="self_directed_exploration">自由探索模式</option>
              </optgroup>
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* 设置 - 仅教师模式显示 */}
          {!isStudentMode && (
            <button
              onClick={onSettingsOpen}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings size={15} />
              {t('设置')}
            </button>
          )}

          {/* 发布 - 仅教师模式显示 */}
          {!isStudentMode && (
            <button
              onClick={onPublishOpen}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Share2 size={15} />
              {t('发布')}
            </button>
          )}

          {/* 分析 - 仅教师模式显示 */}
          {!isStudentMode && (
            <button
              onClick={onViewAnalytics}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <BarChart3 size={15} />
              {t('分析')}
            </button>
          )}
        </div>
      </header>

      {/* 学生模式信息栏 */}
      {isStudentMode && config.publishMetadata && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
          <div className="flex items-center gap-4 text-sm text-blue-700">
            {config.publishMetadata.grade && (
              <span>年级: {config.publishMetadata.grade}</span>
            )}
            {config.publishMetadata.subjects && config.publishMetadata.subjects.length > 0 && (
              <span>学科: {config.publishMetadata.subjects.join(', ')}</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
