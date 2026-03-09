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
  FileEdit, FolderOpen, Type, GripVertical, Trash2,
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

  onAddResource?: (resource: Resource) => void;
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
    onAddResource,
    selectedResourceIds, toggleResourceSelection,
    selectedTaskIds, toggleAllTasks, toggleAllResources, toggleTaskSelection, setEditingTask,
  } = props;

  // 粘贴文本弹窗状态
  const [showPasteTextModal, setShowPasteTextModal] = useState(false);
  const [pasteTextContent, setPasteTextContent] = useState('');

  // 统一编辑任务弹窗状态
  const [unifiedEditTask, setUnifiedEditTask] = useState<any>(null);
  const [editLocalTask, setEditLocalTask] = useState<any>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [inlineEditingOptionId, setInlineEditingOptionId] = useState<string | null>(null);
  const [showQuestionTypeMenu, setShowQuestionTypeMenu] = useState(false);

  const openUnifiedEditModal = (task: any) => {
    setUnifiedEditTask(task);
    setEditLocalTask(JSON.parse(JSON.stringify(task)));
  };

  const closeUnifiedEditModal = () => {
    setUnifiedEditTask(null);
    setEditLocalTask(null);
    setInlineEditingId(null);
  };

  const handleUnifiedEditSave = () => {
    if (editLocalTask) {
      setEditingTask(editLocalTask);
      // Trigger save via parent by calling setEditingTask then immediately closing
      // The parent's TaskEditModal onSave flow handles persistence
      // Instead, directly update via onSaveTaskSettings pattern
      const updatedSettings: any = {
        ...(editLocalTask.settings || {}),
        showAnswersAfterSubmit: editLocalTask.settings?.showAnswersAfterSubmit ?? true,
      };
      onSaveTaskSettings(editLocalTask.id, updatedSettings);
      // Update the task in generatedTasks via setEditingTask callback
      setEditingTask(editLocalTask);
    }
    closeUnifiedEditModal();
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!editLocalTask) return;
    const updated = {
      ...editLocalTask,
      questions: (editLocalTask.questions || []).filter((q: any) => q.id !== questionId),
      questionCount: (editLocalTask.questions || []).filter((q: any) => q.id !== questionId).length,
    };
    setEditLocalTask(updated);
  };

  const handleToggleQuestionRequired = (questionId: string) => {
    if (!editLocalTask) return;
    const updated = {
      ...editLocalTask,
      questions: (editLocalTask.questions || []).map((q: any) =>
        q.id === questionId ? { ...q, required: !q.required } : q
      ),
    };
    setEditLocalTask(updated);
  };

  const handleInlineEdit = (questionId: string, field: string, value: string, optionIndex?: number) => {
    if (!editLocalTask) return;
    const updated = {
      ...editLocalTask,
      questions: (editLocalTask.questions || []).map((q: any) => {
        if (q.id !== questionId) return q;
        if (field === 'option' && optionIndex !== undefined) {
          const newOptions = [...(q.options || [])];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return { ...q, [field]: value };
      }),
    };
    setEditLocalTask(updated);
  };

  const handleAddManualQuestion = (questionType: string = 'single_choice') => {
    if (!editLocalTask) return;
    const typeDefaults: Record<string, any> = {
      single_choice: {
        options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')],
        answer: t('选项A'),
      },
      multiple_choice: {
        options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')],
        answer: [t('选项A'), t('选项B')],
      },
      true_false: {
        options: [t('正确'), t('错误')],
        answer: t('正确'),
      },
      fill_blank: {
        options: [],
        answer: '',
      },
      short_answer: {
        options: [],
        answer: '',
      },
    };
    const defaults = typeDefaults[questionType] || typeDefaults.single_choice;
    const newQ = {
      id: `q_${Date.now()}`,
      type: questionType,
      content: t('新题目'),
      ...defaults,
      required: false,
      points: 1,
    };
    const updated = {
      ...editLocalTask,
      questions: [...(editLocalTask.questions || []), newQ],
      questionCount: (editLocalTask.questions || []).length + 1,
    };
    setEditLocalTask(updated);
    setInlineEditingId(newQ.id);
    setShowQuestionTypeMenu(false);
  };

  const handleAIGenerateQuestions = async () => {
    if (!editLocalTask) return;
    // Simulate AI generation
    const newQuestions = Array.from({ length: 3 }, (_, i) => ({
      id: `q_ai_${Date.now()}_${i}`,
      type: 'single_choice' as const,
      content: `${t('AI 生成题目')} ${(editLocalTask.questions || []).length + i + 1}`,
      options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')],
      answer: t('选项A'),
      required: false,
      points: 1,
    }));
    const updated = {
      ...editLocalTask,
      questions: [...(editLocalTask.questions || []), ...newQuestions],
      questionCount: (editLocalTask.questions || []).length + newQuestions.length,
    };
    setEditLocalTask(updated);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedQuestionId || draggedQuestionId === targetId || !editLocalTask) return;
    const questions = [...(editLocalTask.questions || [])];
    const fromIdx = questions.findIndex((q: any) => q.id === draggedQuestionId);
    const toIdx = questions.findIndex((q: any) => q.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = questions.splice(fromIdx, 1);
    questions.splice(toIdx, 0, moved);
    setEditLocalTask({ ...editLocalTask, questions });
  };

  const handleAddManualTask = () => {
    const newTask = {
      id: `manual_task_${Date.now()}`,
      type: 'quiz' as const,
      title: t('新任务'),
      description: '',
      status: 'optional' as const,
      questionCount: 0,
      questions: [],
      settings: { showAnswersAfterSubmit: true, showExplanationsAfterSubmit: true, allowRetry: true, fullscreenMode: false, allowViewResources: false, source: 'manual' as const },
    };
    openUnifiedEditModal(newTask);
  };

  const handlePasteTextConfirm = () => {
    if (!pasteTextContent.trim()) return;
    const newResource: Resource = {
      id: `resource_text_${Date.now()}`,
      title: pasteTextContent.trim().slice(0, 50) + (pasteTextContent.trim().length > 50 ? '...' : ''),
      type: 'document',
      description: t('粘贴的文本内容'),
      textContent: pasteTextContent.trim(),
    };
    onAddResource?.(newResource);
    setPasteTextContent('');
    setShowPasteTextModal(false);
  };

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
                    <Upload size={16} />
                    {t('上传文件')}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onKnowledgeBaseOpen()}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Database size={12} />
                      {t('从资源库导入')}
                    </button>
                    <button
                      onClick={() => onLinkInputOpen()}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Link size={12} />
                      {t('粘贴链接')}
                    </button>
                    <button
                      onClick={() => setShowPasteTextModal(true)}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Type size={12} />
                      {t('直接粘贴文本')}
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
                    {expandedTask && taskDisplayMode === 'embedded' ? (
                      <div className="h-full -m-4">
                        <TaskExpandedCard
                          task={expandedTask}
                          displayMode="embedded"
                          isCompleted={completedTasks.has(expandedTask.id)}
                          taskStatus={taskStatus}
                          quickResult={quickResult}
                          onClose={() => onTaskClick(expandedTask)}
                          onComplete={(taskId, answer) => onToggleTaskCompletion(expandedTask.id)}
                        />
                      </div>
                    ) : (
                    <>
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
                        <ListChecks size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs mb-3">{t('暂无学习任务')}</p>
                        <button
                          onClick={handleAddManualTask}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
                        >
                          <Plus size={14} />
                          {t('手动添加')}
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
                          className={`flex items-center gap-3 p-3 ${completedTasks.has(task.id) ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} border rounded-lg hover:${getThemeClass('border')} hover:shadow-sm transition-all cursor-pointer group`}
                        >
                          {/* 选中指示器 */}
                          <div
                            onClick={(e) => { e.stopPropagation(); toggleTaskSelection(task.id); }}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedTaskIds.has(task.id) ? 'border-gray-400 bg-gray-500' : 'border-gray-300 bg-white'}`}
                          >
                            {selectedTaskIds.has(task.id) && <Check size={12} className="text-white" />}
                          </div>
                          {/* 完成状态图标 */}
                          {completedTasks.has(task.id) ? (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100">
                              <CheckCircle2 size={14} className="text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-gray-100">
                              {task.type === 'quiz' ? (
                                <Zap size={12} className="text-gray-600" />
                              ) : (
                                <Brain size={12} className="text-gray-600" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${completedTasks.has(task.id) ? 'text-green-700' : 'text-gray-700'}`}>{task.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {task.type === 'quiz' && task.questionCount && (
                                <span>{task.questionCount} {t('道题')}</span>
                              )}
                              {completedTasks.has(task.id) && getAttemptCount(task.id) > 0 && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                  {t('第')}{getAttemptCount(task.id)}{t('次')}
                                </span>
                              )}
                              {(task as any).settings?.source === 'exam_converted' && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{t('试卷')}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openUnifiedEditModal(task);
                            }}
                            className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                            title={t('编辑任务')}
                          >
                            <Pencil size={14} />
                          </button>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      ))}
                      </>
                    )}

                    {/* 手动添加任务按钮 */}
                    <button
                      onClick={handleAddManualTask}
                      className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      {t('手动添加')}
                    </button>
                    </>
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
                    <Upload size={16} />
                    {t('上传文件')}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onKnowledgeBaseOpen()}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Database size={12} />
                      {t('从资源库导入')}
                    </button>
                    <button
                      onClick={() => onLinkInputOpen()}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Link size={12} />
                      {t('粘贴链接')}
                    </button>
                    <button
                      onClick={() => setShowPasteTextModal(true)}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Type size={12} />
                      {t('直接粘贴文本')}
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
                    {expandedTask && taskDisplayMode === 'embedded' ? (
                      <div className="h-full -m-4">
                        <TaskExpandedCard
                          task={expandedTask}
                          displayMode="embedded"
                          isCompleted={completedTasks.has(expandedTask.id)}
                          taskStatus={taskStatus}
                          quickResult={quickResult}
                          onClose={() => onTaskClick(expandedTask)}
                          onComplete={(taskId, answer) => onToggleTaskCompletion(expandedTask.id)}
                        />
                      </div>
                    ) : (
                    <>
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
                        <p className="text-xs mb-3">{t('暂无学习任务')}</p>
                        <button
                          onClick={handleAddManualTask}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
                        >
                          <Plus size={14} />
                          {t('手动添加')}
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
                          className={`flex items-center gap-3 p-3 ${completedTasks.has(task.id) ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} border rounded-lg hover:${getThemeClass('border')} hover:shadow-sm transition-all cursor-pointer group`}
                        >
                          {/* 选中指示器 */}
                          <div
                            onClick={(e) => { e.stopPropagation(); toggleTaskSelection(task.id); }}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedTaskIds.has(task.id) ? 'border-gray-400 bg-gray-500' : 'border-gray-300 bg-white'}`}
                          >
                            {selectedTaskIds.has(task.id) && <Check size={12} className="text-white" />}
                          </div>
                          {/* 完成状态图标 */}
                          {completedTasks.has(task.id) ? (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100">
                              <CheckCircle2 size={14} className="text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-gray-100">
                              {task.type === 'quiz' ? (
                                <Zap size={12} className="text-gray-600" />
                              ) : (
                                <Brain size={12} className="text-gray-600" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${completedTasks.has(task.id) ? 'text-green-700' : 'text-gray-700'}`}>{task.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {task.type === 'quiz' && task.questionCount && (
                                <span>{task.questionCount} {t('道题')}</span>
                              )}
                              {completedTasks.has(task.id) && getAttemptCount(task.id) > 0 && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                  {t('第')}{getAttemptCount(task.id)}{t('次')}
                                </span>
                              )}
                              {(task as any).settings?.source === 'exam_converted' && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{t('试卷')}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openUnifiedEditModal(task);
                            }}
                            className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                            title={t('编辑任务')}
                          >
                            <Pencil size={14} />
                          </button>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      ))}
                      </>
                    )}

                    {/* 手动添加任务按钮 */}
                    <button
                      onClick={handleAddManualTask}
                      className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      {t('手动添加')}
                    </button>
                    </>
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

      {/* 粘贴文本弹窗 */}
      {showPasteTextModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPasteTextModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-[480px] max-w-[90vw] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800">{t('粘贴文本')}</h3>
              <button
                onClick={() => setShowPasteTextModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="p-5">
              <textarea
                value={pasteTextContent}
                onChange={(e) => setPasteTextContent(e.target.value)}
                placeholder={t('在此粘贴或输入文本内容...')}
                className="w-full h-48 px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => { setPasteTextContent(''); setShowPasteTextModal(false); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('取消')}
              </button>
              <button
                onClick={handlePasteTextConfirm}
                disabled={!pasteTextContent.trim()}
                className="px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('确定')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 统一编辑任务弹窗 */}
      {unifiedEditTask && editLocalTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={closeUnifiedEditModal}>
          <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800">{t('编辑任务')}</h3>
              <button onClick={closeUnifiedEditModal} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
            </div>

            {/* 弹窗内容 */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* 任务标题 */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{t('任务标题')}</label>
                <input
                  type="text"
                  value={editLocalTask.title || ''}
                  onChange={(e) => setEditLocalTask({ ...editLocalTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 题目列表 */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">{t('题目列表')}</label>
                <div className="space-y-2">
                  {(editLocalTask.questions || []).map((q: any, idx: number) => (
                    <div
                      key={q.id}
                      draggable
                      onDragStart={() => setDraggedQuestionId(q.id)}
                      onDragOver={(e) => handleDragOver(e, q.id)}
                      onDragEnd={() => setDraggedQuestionId(null)}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-white transition-colors group"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical size={14} className="text-gray-300 mt-1 cursor-grab flex-shrink-0" />
                        <span className="text-xs text-gray-400 mt-0.5 flex-shrink-0">{idx + 1}.</span>
                        <div className="flex-1 min-w-0">
                          {/* 题目内容 - 双击编辑 */}
                          {inlineEditingId === q.id ? (
                            <input
                              autoFocus
                              value={q.content || ''}
                              onChange={(e) => handleInlineEdit(q.id, 'content', e.target.value)}
                              onBlur={() => setInlineEditingId(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setInlineEditingId(null)}
                              className="w-full text-sm px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          ) : (
                            <p
                              className="text-sm text-gray-700 cursor-text hover:bg-gray-100 px-2 py-1 rounded"
                              onDoubleClick={() => setInlineEditingId(q.id)}
                              title={t('双击编辑')}
                            >
                              {q.content || t('空题目')}
                            </p>
                          )}
                          {/* 选项 */}
                          {q.options && (
                            <div className="mt-1 space-y-0.5">
                              {q.options.map((opt: string, optIdx: number) => (
                                <div key={optIdx} className="flex items-center gap-1 text-xs text-gray-500">
                                  <span className="w-4 text-center">{String.fromCharCode(65 + optIdx)}.</span>
                                  {inlineEditingOptionId === `${q.id}_${optIdx}` ? (
                                    <input
                                      autoFocus
                                      value={opt}
                                      onChange={(e) => handleInlineEdit(q.id, 'option', e.target.value, optIdx)}
                                      onBlur={() => setInlineEditingOptionId(null)}
                                      onKeyDown={(e) => e.key === 'Enter' && setInlineEditingOptionId(null)}
                                      className="flex-1 text-xs px-1 py-0.5 border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                  ) : (
                                    <span
                                      className="cursor-text hover:bg-gray-100 px-1 rounded"
                                      onDoubleClick={() => setInlineEditingOptionId(`${q.id}_${optIdx}`)}
                                    >
                                      {opt}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* 必修开关 */}
                        <button
                          onClick={() => handleToggleQuestionRequired(q.id)}
                          className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${q.required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {q.required ? t('必修') : t('选修')}
                        </button>
                        {/* 删除 */}
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 flex-shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* 添加题目按钮 */}
                <div className="mt-3 relative">
                  <button
                    onClick={() => setShowQuestionTypeMenu(!showQuestionTypeMenu)}
                    className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus size={12} />
                    {t('手动添加')}
                  </button>
                  {showQuestionTypeMenu && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                      {[
                        { type: 'single_choice', label: '单选题' },
                        { type: 'multiple_choice', label: '多选题' },
                        { type: 'true_false', label: '判断题' },
                        { type: 'fill_blank', label: '填空题' },
                        { type: 'short_answer', label: '简答题' },
                      ].map(item => (
                        <button
                          key={item.type}
                          onClick={() => handleAddManualQuestion(item.type)}
                          className="w-full px-3 py-1.5 text-left text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {t(item.label)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 答案可见性 */}
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">{t('答案可见性')}</p>
                  <p className="text-xs text-gray-400">{editLocalTask.settings?.showAnswersAfterSubmit ? t('完成后显示正确答案') : t('完成后不显示正确答案，要求再次思考')}</p>
                </div>
                <button
                  onClick={() => setEditLocalTask({
                    ...editLocalTask,
                    settings: { ...(editLocalTask.settings || {}), showAnswersAfterSubmit: !editLocalTask.settings?.showAnswersAfterSubmit }
                  })}
                  className={`w-10 h-5 rounded-full transition-colors ${editLocalTask.settings?.showAnswersAfterSubmit ? 'bg-primary-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${editLocalTask.settings?.showAnswersAfterSubmit ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200">
              <button onClick={closeUnifiedEditModal} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">{t('取消')}</button>
              <button onClick={handleUnifiedEditSave} className="px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg">{t('保存')}</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
