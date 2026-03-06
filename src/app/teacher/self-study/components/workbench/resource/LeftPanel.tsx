'use client';

import { useState, useRef, useEffect } from 'react';
import { SpaceConfig, LearningMode, LearningPathNode } from '@/types/self-study';
import { Resource, Task, TaskQuestion } from '@/types/shared-context';
import ResourceInlineViewer, { InlineViewResource } from '../../ResourceInlineViewer';
import { useLanguage } from '@/contexts/LanguageContext';
import TaskExpandedCard from '../../task/TaskExpandedCard';
import TaskResultReview from '../../task/TaskResultReview';
import { QuickResultData, ExamProcessingStep } from '../../task/taskTypes';
import TaskSettingsPopover from '../../TaskSettingsPopover';
import ResourceSettingsPopover from '../../ResourceSettingsPopover';
import type { TaskSettings, ResourceVisibility } from '@/types/shared-context';
import { COLLAPSED_WIDTH } from '../shared/constants';
import { ChatMessage } from '../shared/types';
import {
  Plus, Upload, Link, FileText, Video, FileSpreadsheet, Globe, X, Brain, Eye,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ListChecks, CheckCircle2,
  Circle, Sparkles, Activity, Settings, Database, Pencil, Check, Zap,
  Bot, MessageSquare, BookOpen, Clock, Search,
  FileEdit, FolderOpen,
} from 'lucide-react';

interface LeftPanelProps {
  config: SpaceConfig;
  isLeftCollapsed: boolean;
  leftWidth: number;
  isStudentMode: boolean;
  isAIGenerating?: boolean;
  collapsedPanels: Record<string, boolean>;
  completedTasks: Set<string>;
  expandedTask: Task | null;
  taskDisplayMode: string;
  inlineViewingResource: InlineViewResource | null;
  generatedTasks: any[];
  isGeneratingTask: boolean;
  aiGeneratedResources: any[];
  mockAIResources: any[];
  examProcessingStep: ExamProcessingStep | null;
  messages: ChatMessage[];
  quickResult: QuickResultData | null;
  taskStatus: string;
  settingsTaskId: string | null;
  settingsResourceId: string | null;
  getThemeClass: (type: 'bg' | 'bgHover' | 'text' | 'border' | 'icon') => string;
  getAttemptCount: (taskId: string) => number;
  onSetLeftCollapsed: (collapsed: boolean) => void;
  onTogglePanel: (panel: string) => void;
  onResourceClick: (resource: Resource) => void;
  onFileUploadOpen: () => void;
  onLinkInputOpen: () => void;
  onKnowledgeBaseOpen: () => void;
  onTaskClick: (task: Task) => void;
  onGenerateTest: () => void;
  onRedoTask: (task: any) => void;
  onSaveResourceVisibility: (resourceId: string, visibility: ResourceVisibility) => void;
  onSaveTaskSettings: (taskId: string, settings: TaskSettings) => void;
  onSetSettingsTaskId: (id: string | null) => void;
  onSetSettingsResourceId: (id: string | null) => void;
  onSetInlineViewingResource: (resource: InlineViewResource | null) => void;
  onToggleTaskCompletion: (taskId: string) => void;
  selectedTaskIds: Set<string>;
  toggleAllTasks: () => void;
  toggleAllResources: () => void;
  toggleTaskSelection: (id: string) => void;
  setEditingTask: (task: any) => void;

  selectedResourceIds: Set<string>;
  toggleResourceSelection: (id: string) => void;
}

export function LeftPanel(props: LeftPanelProps) {
  const { t } = useLanguage();
  const {
    config, isLeftCollapsed, leftWidth, isStudentMode, isAIGenerating,
    collapsedPanels, completedTasks, expandedTask, taskDisplayMode,
    inlineViewingResource, generatedTasks, isGeneratingTask, aiGeneratedResources, mockAIResources,
    examProcessingStep, messages, quickResult, taskStatus,
    settingsTaskId, settingsResourceId,
    getThemeClass, getAttemptCount,
    onSetLeftCollapsed, onTogglePanel, onResourceClick,
    onFileUploadOpen, onLinkInputOpen, onKnowledgeBaseOpen,
    onTaskClick, onGenerateTest, onRedoTask,
    onSaveResourceVisibility, onSaveTaskSettings,
    onSetSettingsTaskId, onSetSettingsResourceId,
    onSetInlineViewingResource,
    onToggleTaskCompletion,
    selectedResourceIds, toggleResourceSelection,
    selectedTaskIds, toggleAllTasks, toggleAllResources, toggleTaskSelection, setEditingTask,
  } = props;

  // Re-create the original JSX
  return (
    <>
        <div
          style={{
            width: isLeftCollapsed ? `${COLLAPSED_WIDTH}px` : `${leftWidth}%`,
            transition: 'width 0.3s ease-in-out'
          }}
          className="bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-hidden"
        >
          {isLeftCollapsed ? (
            // 折叠状态：显示竖向的资源/任务图标列表（参考 NotebookLM）
            <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
              {/* 展开按钮 */}
              <div className="p-3 border-b border-gray-200 flex justify-center">
                <button
                  onClick={() => onSetLeftCollapsed(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title={t('展开面板')}
                >
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
              </div>

              {config.learningMode === 'ai_guided' ? (
                // AI引导模式：显示AI资源、用户资源和任务图标
                <>
                  {/* 资源图标 */}
                  <div className="flex-1 overflow-y-auto py-2 space-y-1">
                    {/* 用户上传的资源 */}
                    {config.resources.map((resource) => (
                      <button
                        key={resource.id}
                        onClick={() => onSetLeftCollapsed(false)}
                        className="w-full px-3 py-3 hover:bg-primary-100 transition-colors flex flex-col items-center gap-1 group rounded-lg"
                        title={resource.title}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {resource.type === 'document' ? (
                            <FileText size={20} className="text-primary-600" />
                          ) : resource.type === 'presentation' ? (
                            <FileSpreadsheet size={20} className="text-primary-600" />
                          ) : resource.type === 'interactive' ? (
                            <Globe size={20} className="text-green-600" />
                          ) : (
                            <Video size={20} className="text-primary-600" />
                          )}
                        </div>
                      </button>
                    ))}
                    {/* AI生成的资源 */}
                    {aiGeneratedResources.map((resource) => (
                      <button
                        key={resource.id}
                        onClick={() => onSetLeftCollapsed(false)}
                        className="w-full px-3 py-3 hover:bg-gray-100 transition-colors flex flex-col items-center gap-1 group rounded-lg"
                        title={resource.title}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sparkles size={20} className="text-gray-500" />
                        </div>
                      </button>
                    ))}
                    {mockAIResources.map((resource) => (
                      <button
                        key={resource.id}
                        onClick={() => onSetLeftCollapsed(false)}
                        className="w-full px-3 py-3 hover:bg-gray-100 transition-colors flex flex-col items-center gap-1 group rounded-lg"
                        title={resource.title}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Brain size={20} className="text-gray-500" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* 任务图标 */}
                  {generatedTasks.length > 0 && (
                    <div className="border-t border-gray-200 py-2 space-y-1">
                      {generatedTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => onSetLeftCollapsed(false)}
                          className="w-full px-3 py-3 hover:bg-gray-100 transition-colors flex flex-col items-center gap-1 group rounded-lg"
                          title={task.title}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {task.type === 'quiz' ? (
                              <ListChecks size={20} className="text-primary-600" />
                            ) : (
                              <FileEdit size={20} className="text-primary-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // 自由探索模式：显示资源图标
                <div className="flex-1 overflow-y-auto py-2 space-y-1">
                  {config.resources.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => onSetLeftCollapsed(false)}
                      className="w-full px-3 py-3 hover:bg-primary-100 transition-colors flex flex-col items-center gap-1 group rounded-lg"
                      title={resource.title}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {resource.type === 'document' ? (
                          <FileText size={20} className="text-primary-600" />
                        ) : resource.type === 'presentation' ? (
                          <FileSpreadsheet size={20} className="text-primary-600" />
                        ) : resource.type === 'interactive' ? (
                          <Globe size={20} className="text-green-600" />
                        ) : (
                          <Video size={20} className="text-primary-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
            {/* 面板顶部标题栏 - 与右侧面板tab栏高度对齐 */}
            <div className="h-12 px-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                {config.learningMode === 'ai_guided' ? (
                  <><Sparkles size={16} className={getThemeClass('icon')} />{t('学习资源')}</>
                ) : (
                  <><FolderOpen size={16} className="text-gray-500" />{t('学习资源')}</>
                )}
              </h2>
              <button
                onClick={() => onSetLeftCollapsed(true)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('折叠面板')}
              >
                <ChevronLeft size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
            {config.learningMode === 'ai_guided' ? (
            // AI引导模式：上方资源（用户+AI） + 下方学习任务
            <>
              {/* 资源区域 - 任务收起时自动扩展 */}
              <div
                className="flex flex-col min-h-0 overflow-hidden"
                style={{
                  flex: collapsedPanels.tasks ? '1 1 auto' : '0 0 50%'
                }}
              >
                {/* 添加资源入口（与自由探索模式一致） */}
                <div className="p-3 border-b border-gray-100 space-y-2">
                  <button
                    onClick={() => onFileUploadOpen()}
                    className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    {t('添加资料来源')}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onFileUploadOpen()}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Upload size={12} />
                      {t('上传文件')}
                    </button>
                    <button
                      onClick={() => onLinkInputOpen()}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Link size={12} />
                      {t('粘贴链接')}
                    </button>
                    <button
                      onClick={() => onKnowledgeBaseOpen()}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Database size={12} />
                      {t('从资源库导入')}
                    </button>
                  </div>
                </div>

                {/* AI生成进度指示器 */}
                {isAIGenerating && (
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Brain size={14} className="animate-pulse" />
                      <span>{t('AI 正在为你生成学习资源...')}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full transition-all duration-300 animate-pulse" style={{ width: '100%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>📖 {t('分析主题')}</span>
                      <span>🔍 {t('匹配资源')}</span>
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {inlineViewingResource ? (
                    <div className="h-full -m-4">
                      <ResourceInlineViewer
                        resource={inlineViewingResource}
                        onBack={() => onSetInlineViewingResource(null)}
                        onFullscreen={() => {
                          if (inlineViewingResource.url) {
                            onSetInlineViewingResource({
                              id: inlineViewingResource.id,
                              title: inlineViewingResource.title,
                              type: 'interactive',
                              description: inlineViewingResource.description || '',
                              url: inlineViewingResource.url,
                            });
                          }
                        }}
                      />
                    </div>
                  ) : (
                  <>
                  {/* AI生成的资源 */}
                  {aiGeneratedResources.map((resource) => (
                    <div
                      key={resource.id}
                      onClick={() => onResourceClick(resource)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer bg-white border border-gray-200 hover:${getThemeClass('border')} hover:shadow-sm`}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gray-100">
                        {resource.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Sparkles size={10} />
                          {new Date(resource.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  ))}

                  {/* 原有的AI资源 */}
                  {mockAIResources.map((resource) => (
                    <div
                      key={resource.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                        resource.status === 'generating'
                          ? 'bg-accent-50 border border-gray-200 animate-pulse'
                          : resource.status === 'ready'
                          ? `bg-white border border-gray-200 hover:${getThemeClass('border')} hover:shadow-sm`
                          : 'bg-gray-50 border border-gray-200 opacity-60'
                      }`}
                    >
                      {/* 选中指示器 */}
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleResourceSelection(resource.id); }}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedResourceIds.has(resource.id) ? 'border-gray-400 bg-gray-500' : 'border-gray-300 bg-white'}`}
                      >
                        {selectedResourceIds.has(resource.id) && <Check size={12} className="text-white" />}
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                        resource.status === 'generating'
                          ? 'bg-gray-100'
                          : resource.status === 'ready'
                          ? 'bg-gray-100'
                          : 'bg-gray-100'
                      }`}>
                        {resource.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          resource.status === 'pending' ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                          {resource.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {resource.status === 'generating' ? (
                            <span className="text-accent-600 flex items-center gap-1">
                              <Activity size={10} className="animate-spin" />
                              {t('正在生成...')}
                            </span>
                          ) : resource.status === 'ready' ? (
                            <span className="text-primary-600">✓ {t('已就绪')}</span>
                          ) : (
                            t('待生成')
                          )}
                        </p>
                      </div>
                      {resource.status === 'ready' && (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                    </div>
                  ))}

                  {/* 用户上传的资源（始终显示） */}
                  {config.resources.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 mt-3 mb-1 px-1">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-400">{t('我的资料')}</span>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                      {config.resources.map((resource) => (
                        <div
                          key={resource.id}
                          onClick={() => onResourceClick(resource)}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer bg-white border border-gray-200 hover:${getThemeClass('border')} hover:shadow-sm group`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                            resource.type === 'video' ? 'bg-red-50' :
                            resource.type === 'presentation' ? 'bg-orange-50' :
                            resource.type === 'interactive' ? 'bg-green-50' : 'bg-blue-50'
                          }`}>
                            {resource.type === 'video' ? (
                              <Video size={18} className="text-red-500" />
                            ) : resource.type === 'presentation' ? (
                              <FileSpreadsheet size={18} className="text-orange-500" />
                            ) : resource.type === 'interactive' ? (
                              <Globe size={18} className="text-green-500" />
                            ) : (
                              <FileText size={18} className="text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                            {resource.description && (
                              <p className="text-xs text-gray-400 truncate">{resource.description}</p>
                            )}
                          </div>
                          {resource.type === 'interactive' && resource.interactiveCategory && (
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                              resource.interactiveCategory === 'animation' ? 'bg-purple-100 text-purple-700' :
                              resource.interactiveCategory === 'visualization' ? 'bg-blue-100 text-blue-700' :
                              resource.interactiveCategory === 'simulation' ? 'bg-green-100 text-green-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {resource.interactiveCategory === 'animation' ? '动画' :
                               resource.interactiveCategory === 'visualization' ? '可视化' :
                               resource.interactiveCategory === 'simulation' ? '模拟' : '测试'}
                            </span>
                          )}
                          {resource.visibility && resource.visibility.mode !== 'always' && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                              resource.visibility.mode === 'hidden' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {resource.visibility.mode === 'hidden' ? '隐藏' : '任务后'}
                            </span>
                          )}
                          {!isStudentMode && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onSetSettingsResourceId(resource.id); }}
                              className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
                              title="资源设置"
                            >
                              <Settings size={14} className="text-gray-400" />
                            </button>
                          )}
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      ))}
                    </>
                  )}
                  </>
                  )}
                </div>
              </div>

              {/* 学习任务区域 - 可折叠，展开时占50% */}
              <div
                className="flex flex-col min-h-0 border-t border-gray-200 transition-all overflow-hidden"
                style={{
                  flex: collapsedPanels.tasks ? '0 0 auto' : '0 0 50%'
                }}
              >
                {/* 可折叠的标题栏 - 收起时高度与中间对话区输入框对齐 */}
                <div
                  className={`px-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-all flex flex-col justify-center ${collapsedPanels.tasks ? 'h-[70px]' : 'h-12'}`}
                  onClick={() => onTogglePanel('tasks')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <ListChecks size={16} className="text-gray-500" />
                        {t('学习任务')}
                        {generatedTasks.length > 0 && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                            {generatedTasks.length}
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {collapsedPanels.tasks && generatedTasks.length === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateTest();
                          }}
                          disabled={isGeneratingTask}
                          className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-70"
                        >
                          {isGeneratingTask ? (
                            <>
                              <Activity size={12} className="animate-spin" />
                              {t('生成中...')}
                            </>
                          ) : (
                            <>
                              <Zap size={12} />
                              {t('生成任务')}
                            </>
                          )}
                        </button>
                      )}
                      {collapsedPanels.tasks ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronUp size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 可折叠的内容区域 */}
                {!collapsedPanels.tasks && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* AI生成进度指示器 */}
                    {isAIGenerating && (
                      <div className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <Brain size={14} className="animate-pulse" />
                          <span>{t('AI 正在为你生成学习任务...')}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-400 rounded-full transition-all duration-300 animate-pulse" style={{ width: '100%' }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>✨ {t('生成任务')}</span>
                          <span>🎯 {t('设置目标')}</span>
                        </div>
                      </div>
                    )}
                    {/* 试卷转换进度 */}
                    {examProcessingStep && examProcessingStep !== 'done' && (
                      <div className="px-3 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-amber-700 mb-2">
                          <FileText size={14} className="animate-pulse" />
                          <span>
                            {examProcessingStep === 'detecting' ? '正在检测试卷内容...' :
                             examProcessingStep === 'extracting' ? '正在提取题目...' :
                             '正在转换为学习任务...'}
                          </span>
                        </div>
                        <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{
                            width: examProcessingStep === 'detecting' ? '25%' :
                                   examProcessingStep === 'extracting' ? '55%' : '85%'
                          }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-amber-500 mt-1">
                          <span className={examProcessingStep === 'detecting' ? 'font-medium' : ''}>📄 检测</span>
                          <span className={examProcessingStep === 'extracting' ? 'font-medium' : ''}>📝 提取</span>
                          <span className={examProcessingStep === 'converting' ? 'font-medium' : ''}>🔄 转换</span>
                          <span>✅ 完成</span>
                        </div>
                      </div>
                    )}
                    {generatedTasks.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <Zap size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs mb-3">{t('点击"生成任务"创建学习任务')}</p>
                        <button
                          onClick={onGenerateTest}
                          disabled={isGeneratingTask}
                          className="px-4 py-2 bg-fresh-500 hover:bg-fresh-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto disabled:opacity-70"
                        >
                          {isGeneratingTask ? (
                            <>
                              <Activity size={14} className="animate-spin" />
                              {t('生成中...')}
                            </>
                          ) : (
                            <>
                              <Zap size={14} />
                              {t('生成任务')}
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* 全选控制 */}
                        <div className="flex items-center justify-between px-1 mb-1">
                          <span className="text-xs text-gray-500">{generatedTasks.length} {t('个任务')}</span>
                          <button
                            onClick={() => toggleAllTasks()}
                            className="text-xs text-gray-600 hover:text-gray-800 font-medium p-2 rounded-lg"
                          >
                            {selectedTaskIds.size === generatedTasks.length ? t('取消全选') : t('全选')}
                          </button>
                        </div>
                        {generatedTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          className={`flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:${getThemeClass('border')} hover:shadow-sm transition-all cursor-pointer group`}
                        >
                          {/* 选中指示器 */}
                          <div
                            onClick={(e) => { e.stopPropagation(); toggleTaskSelection(task.id); }}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedTaskIds.has(task.id) ? 'border-gray-400 bg-gray-500' : 'border-gray-300 bg-white'}`}
                          >
                            {selectedTaskIds.has(task.id) && <Check size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-gray-100">
                                {task.type === 'quiz' ? (
                                  <Zap size={12} className="text-gray-600" />
                                ) : (
                                  <Brain size={12} className="text-gray-600" />
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 ml-8">
                              {task.type === 'quiz' && task.questionCount && (
                                <span>{task.questionCount} {t('道题')}</span>
                              )}
                              <span>•</span>
                              <span>{new Date(task.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                              {(task as any).settings?.source === 'exam_converted' && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">试卷</span>
                              )}
                              {completedTasks.has(task.id) && getAttemptCount(task.id) > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                    第{getAttemptCount(task.id)}次
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {completedTasks.has(task.id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRedoTask(task.id);
                              }}
                              className="px-2 py-1 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-all"
                              title={t('重做任务')}
                            >
                              {t('重做')}
                            </button>
                          )}
                          {!isStudentMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetSettingsTaskId(task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all"
                              title={t('任务设置')}
                            >
                              <Settings size={16} className="text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all"
                            title={t('编辑任务')}
                          >
                            <Pencil size={16} className="text-gray-400" />
                          </button>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      ))}
                      </>
                    )}

                    {/* 生成更多任务按钮 - 仅当已有任务时显示 */}
                    {generatedTasks.length > 0 && (
                      <button
                        onClick={onGenerateTest}
                        disabled={isGeneratingTask}
                        className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isGeneratingTask ? (
                          <>
                            <Activity size={14} className="animate-spin" />
                            {t('生成中...')}
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            {t('AI 生成更多任务')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            // 自由探索模式：Sources 面板（类似 NotebookLM）+ 任务区（类似 student-workbench）
            <>
              {/* 资源区域 - 任务收起时自动扩展 */}
              <div
                className="flex flex-col min-h-0 overflow-hidden"
                style={{
                  flex: collapsedPanels.tasks ? '1 1 auto' : '0 0 50%'
                }}
              >

                {/* 添加资源入口 */}
                <div className="p-3 border-b border-gray-100 space-y-2">
                  <button
                    onClick={() => onFileUploadOpen()}
                    className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    {t('添加资料来源')}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onFileUploadOpen()}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Upload size={12} />
                      {t('上传文件')}
                    </button>
                    <button
                      onClick={() => onLinkInputOpen()}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Link size={12} />
                      {t('粘贴链接')}
                    </button>
                    <button
                      onClick={() => onKnowledgeBaseOpen()}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Database size={12} />
                      {t('从资源库导入')}
                    </button>
                  </div>
                </div>

                {/* AI生成进度指示器 */}
                {isAIGenerating && (
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Brain size={14} className="animate-pulse" />
                      <span>{t('AI 正在为你生成学习资源...')}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full transition-all duration-300 animate-pulse" style={{ width: '100%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>📖 {t('分析主题')}</span>
                      <span>🔍 {t('匹配资源')}</span>
                    </div>
                  </div>
                )}

                {/* 资源列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {inlineViewingResource ? (
                    <div className="h-full -m-4">
                      <ResourceInlineViewer
                        resource={inlineViewingResource}
                        onBack={() => onSetInlineViewingResource(null)}
                        onFullscreen={() => {
                          if (inlineViewingResource.url) {
                            onSetInlineViewingResource({
                              id: inlineViewingResource.id,
                              title: inlineViewingResource.title,
                              type: 'interactive',
                              description: inlineViewingResource.description || '',
                              url: inlineViewingResource.url,
                            });
                          }
                        }}
                      />
                    </div>
                  ) : (
                  <>
                  {config.resources.length === 0 && aiGeneratedResources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FolderOpen size={24} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{t('还没有学习资源')}</p>
                      <p className="text-xs text-gray-400">{t('点击上方按钮添加资料')}</p>
                    </div>
                  ) : (
                    <>
                      {/* 全选控制 */}
                      <div className="flex items-center justify-between px-1 mb-1">
                        <span className="text-xs text-gray-500">{config.resources.length + aiGeneratedResources.length + mockAIResources.length} {t('个来源')}</span>
                        <button
                          onClick={() => toggleAllResources()}
                          className="text-xs text-gray-600 hover:text-gray-800 font-medium p-2 rounded-lg"
                        >
                          {selectedResourceIds.size === config.resources.length + aiGeneratedResources.length + mockAIResources.length ? t('取消全选') : t('全选')}
                        </button>
                      </div>

                      {/* AI生成的资源 */}
                      {aiGeneratedResources.map((resource) => (
                        <div
                          key={resource.id}
                          onClick={(e) => { e.stopPropagation(); onResourceClick(resource); }}
                          className={`flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:${getThemeClass('border')} hover:shadow-sm transition-all cursor-pointer group`}
                        >
                          {/* 选中指示器 */}
                          <div
                            onClick={(e) => { e.stopPropagation(); toggleResourceSelection(resource.id); }}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedResourceIds.has(resource.id) ? 'border-gray-400 bg-gray-500' : 'border-gray-300 bg-white'}`}
                          >
                            {selectedResourceIds.has(resource.id) && <Check size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-gray-100">
                                <span className="text-sm">{resource.icon}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-1 ml-8 flex items-center gap-1">
                              <Sparkles size={10} />
                              {new Date(resource.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* 用户上传的资源 */}
                      {config.resources.map((resource) => (
                        <div
                          key={resource.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onResourceClick(resource);
                          }}
                          className={`flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:${getThemeClass('border')} hover:shadow-sm transition-all cursor-pointer group`}
                        >
                          {/* 选中指示器 */}
                          <div
                            onClick={(e) => { e.stopPropagation(); toggleResourceSelection(resource.id); }}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedResourceIds.has(resource.id) ? 'border-gray-400 bg-gray-500' : 'border-gray-300 bg-white'}`}
                          >
                            {selectedResourceIds.has(resource.id) && <Check size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                                resource.type === 'video' ? 'bg-red-100' :
                                resource.type === 'presentation' ? 'bg-orange-100' :
                                resource.type === 'interactive' ? 'bg-green-100' : 'bg-blue-100'
                              }`}>
                                {resource.type === 'video' ? (
                                  <Video size={12} className="text-red-600" />
                                ) : resource.type === 'presentation' ? (
                                  <FileSpreadsheet size={12} className="text-orange-600" />
                                ) : resource.type === 'interactive' ? (
                                  <Globe size={12} className="text-green-600" />
                                ) : (
                                  <FileText size={12} className="text-blue-600" />
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                              {resource.type === 'interactive' && resource.interactiveCategory && (
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                  resource.interactiveCategory === 'animation' ? 'bg-purple-100 text-purple-700' :
                                  resource.interactiveCategory === 'visualization' ? 'bg-blue-100 text-blue-700' :
                                  resource.interactiveCategory === 'simulation' ? 'bg-green-100 text-green-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {resource.interactiveCategory === 'animation' ? '动画' :
                                   resource.interactiveCategory === 'visualization' ? '可视化' :
                                   resource.interactiveCategory === 'simulation' ? '模拟' : '测试'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-1 ml-8">{resource.description}</p>
                          </div>
                          {/* 资源可见性指示 + 设置按钮 */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {resource.visibility && resource.visibility.mode !== 'always' && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                resource.visibility.mode === 'hidden' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {resource.visibility.mode === 'hidden' ? '隐藏' : '任务后'}
                              </span>
                            )}
                            {!isStudentMode && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onSetSettingsResourceId(resource.id); }}
                                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
                                title="资源设置"
                              >
                                <Settings size={14} className="text-gray-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  </>
                  )}
                </div>
              </div>

              {/* 任务区域 - 可折叠，展开时占50% */}
              <div
                className="flex flex-col min-h-0 border-t border-gray-200 transition-all overflow-hidden"
                style={{
                  flex: collapsedPanels.tasks ? '0 0 auto' : '0 0 50%'
                }}
              >
                {/* 可折叠的标题栏 - 收起时高度与中间对话区输入框对齐 */}
                <div
                  className={`px-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-all flex flex-col justify-center ${collapsedPanels.tasks ? 'h-[70px]' : 'h-12'}`}
                  onClick={() => onTogglePanel('tasks')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <ListChecks size={16} className="text-gray-500" />
                        {t('学习任务')}
                        {generatedTasks.length > 0 && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                            {generatedTasks.length}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{t('AI 生成的测试和练习')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {collapsedPanels.tasks && generatedTasks.length === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateTest();
                          }}
                          disabled={isGeneratingTask}
                          className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-70"
                        >
                          {isGeneratingTask ? (
                            <>
                              <Activity size={12} className="animate-spin" />
                              {t('生成中...')}
                            </>
                          ) : (
                            <>
                              <Zap size={12} />
                              {t('生成测试')}
                            </>
                          )}
                        </button>
                      )}
                      {collapsedPanels.tasks ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronUp size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 可折叠的内容区域 */}
                {!collapsedPanels.tasks && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* AI生成进度指示器 */}
                    {isAIGenerating && (
                      <div className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <Brain size={14} className="animate-pulse" />
                          <span>{t('AI 正在为你生成学习任务...')}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-400 rounded-full transition-all duration-300 animate-pulse" style={{ width: '100%' }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>✨ {t('生成任务')}</span>
                          <span>🎯 {t('设置目标')}</span>
                        </div>
                      </div>
                    )}
                    {/* 试卷转换进度 */}
                    {examProcessingStep && examProcessingStep !== 'done' && (
                      <div className="px-3 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-amber-700 mb-2">
                          <FileText size={14} className="animate-pulse" />
                          <span>
                            {examProcessingStep === 'detecting' ? '正在检测试卷内容...' :
                             examProcessingStep === 'extracting' ? '正在提取题目...' :
                             '正在转换为学习任务...'}
                          </span>
                        </div>
                        <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{
                            width: examProcessingStep === 'detecting' ? '25%' :
                                   examProcessingStep === 'extracting' ? '55%' : '85%'
                          }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-amber-500 mt-1">
                          <span className={examProcessingStep === 'detecting' ? 'font-medium' : ''}>📄 检测</span>
                          <span className={examProcessingStep === 'extracting' ? 'font-medium' : ''}>📝 提取</span>
                          <span className={examProcessingStep === 'converting' ? 'font-medium' : ''}>🔄 转换</span>
                          <span>✅ 完成</span>
                        </div>
                      </div>
                    )}
                    {generatedTasks.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <Zap size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs mb-3">{t('点击"生成测试"创建学习任务')}</p>
                        <button
                          onClick={onGenerateTest}
                          disabled={isGeneratingTask}
                          className="px-4 py-2 bg-fresh-500 hover:bg-fresh-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto disabled:opacity-70"
                        >
                          {isGeneratingTask ? (
                            <>
                              <Activity size={14} className="animate-spin" />
                              {t('生成中...')}
                            </>
                          ) : (
                            <>
                              <Zap size={14} />
                              {t('生成测试')}
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* 全选控制 */}
                        <div className="flex items-center justify-between px-1 mb-1">
                          <span className="text-xs text-gray-500">{generatedTasks.length} {t('个任务')}</span>
                          <button
                            onClick={() => toggleAllTasks()}
                            className="text-xs text-gray-600 hover:text-gray-800 font-medium p-2 rounded-lg"
                          >
                            {selectedTaskIds.size === generatedTasks.length ? t('取消全选') : t('全选')}
                          </button>
                        </div>
                        {generatedTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          className={`flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:${getThemeClass('border')} hover:shadow-sm transition-all cursor-pointer group`}
                        >
                          {/* 选中指示器 */}
                          <div
                            onClick={(e) => { e.stopPropagation(); toggleTaskSelection(task.id); }}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedTaskIds.has(task.id) ? 'border-gray-400 bg-gray-500' : 'border-gray-300 bg-white'}`}
                          >
                            {selectedTaskIds.has(task.id) && <Check size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-gray-100">
                                {task.type === 'quiz' ? (
                                  <Zap size={12} className="text-gray-600" />
                                ) : (
                                  <Brain size={12} className="text-gray-600" />
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 ml-8">
                              {task.type === 'quiz' && task.questionCount && (
                                <span>{task.questionCount} {t('道题')}</span>
                              )}
                              <span>•</span>
                              <span>{new Date(task.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                              {(task as any).settings?.source === 'exam_converted' && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">试卷</span>
                              )}
                              {completedTasks.has(task.id) && getAttemptCount(task.id) > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                    第{getAttemptCount(task.id)}次
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {completedTasks.has(task.id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRedoTask(task.id);
                              }}
                              className="px-2 py-1 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-all"
                              title={t('重做任务')}
                            >
                              {t('重做')}
                            </button>
                          )}
                          {!isStudentMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetSettingsTaskId(task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all"
                              title={t('任务设置')}
                            >
                              <Settings size={16} className="text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all"
                            title={t('编辑任务')}
                          >
                            <Pencil size={16} className="text-gray-400" />
                          </button>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      ))}
                      </>
                    )}

                    {/* 生成更多任务按钮 - 仅当已有任务时显示 */}
                    {generatedTasks.length > 0 && (
                      <button
                        onClick={onGenerateTest}
                        disabled={isGeneratingTask}
                        className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isGeneratingTask ? (
                          <>
                            <Activity size={14} className="animate-spin" />
                            {t('生成中...')}
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            {t('AI 生成更多任务')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
            </div>
            </>
          )}
        </div>

    </>
  );
}
