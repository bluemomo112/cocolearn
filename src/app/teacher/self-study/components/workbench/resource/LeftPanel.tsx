'use client';

import { useState, useRef, useEffect } from 'react';
import { SpaceConfig, LearningMode, LearningPathNode } from '@/types/self-study';
import { Resource, Task, TaskQuestion } from '@/types/shared-context';
import ResourceInlineViewer, { InlineViewResource } from '../../ResourceInlineViewer';
import { useLanguage } from '@/contexts/LanguageContext';
import TaskExpandedCard from '../../task/TaskExpandedCard';
import TaskResultReview from '../../task/TaskResultReview';
import TaskInlineViewer from '../../task/TaskInlineViewer';
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
  onSaveTask?: (task: any) => void;

  onAddResource?: (resource: Resource) => void;
  selectedResourceIds: Set<string>;
  toggleResourceSelection: (id: string) => void;
  onSetViewingResource?: (resource: Resource | null) => void;
  explainQuestion?: TaskQuestion | null;
  onSetExpandedTask?: (task: Task | null) => void;
  onSetTaskDisplayMode?: (mode: 'fullscreen' | 'embedded' | 'result_review') => void;
  onSetExplainQuestion?: (q: TaskQuestion | null) => void;
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
    selectedTaskIds, toggleAllTasks, toggleAllResources, toggleTaskSelection, setEditingTask, onSaveTask,
    onSetViewingResource,
    explainQuestion, onSetExpandedTask, onSetTaskDisplayMode, onSetExplainQuestion,
  } = props;

  // 粘贴文本弹窗状态
  const [showPasteTextModal, setShowPasteTextModal] = useState(false);
  const [pasteTextContent, setPasteTextContent] = useState('');

  // 资源区域折叠状态
  const [isResourceCollapsed, setIsResourceCollapsed] = useState(false);

  // 统一编辑任务弹窗状态
  const [unifiedEditTask, setUnifiedEditTask] = useState<any>(null);
  const [editLocalTask, setEditLocalTask] = useState<any>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [inlineEditingOptionId, setInlineEditingOptionId] = useState<string | null>(null);
  const [showQuestionTypeMenu, setShowQuestionTypeMenu] = useState(false);
  // 题目编辑器状态
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  // AI生成配置
  const [showAIGenConfig, setShowAIGenConfig] = useState(false);
  const [isAIGenModalLoading, setIsAIGenModalLoading] = useState(false);
  const [aiGenConfig, setAiGenConfig] = useState({ questionTypes: ['single_choice'] as string[], questionCount: 3, difficulty: 'medium' as 'easy' | 'medium' | 'hard' });

  const typeLabels: Record<string, string> = { single_choice: '单选题', multiple_choice: '多选题', true_false: '判断题', fill_blank: '填空题', short_answer: '简答题' };

  const openUnifiedEditModal = (task: any) => {
    setUnifiedEditTask(task);
    setEditLocalTask(JSON.parse(JSON.stringify(task)));
  };

  const closeUnifiedEditModal = () => {
    setUnifiedEditTask(null);
    setEditLocalTask(null);
    setInlineEditingId(null);
    setShowQuestionEditor(false);
    setEditingQuestion(null);
    setShowAIGenConfig(false);
  };

  const handleEditQuestionOpen = (question: any) => {
    setEditingQuestion({ ...question });
    setShowQuestionEditor(true);
  };

  const handleNewQuestion = (type: string) => {
    const defaults: Record<string, any> = {
      single_choice: { options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')], answer: t('选项A') },
      multiple_choice: { options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')], answer: [t('选项A'), t('选项B')] },
      true_false: { options: [t('正确'), t('错误')], answer: t('正确') },
      fill_blank: { options: [], answer: '' },
      short_answer: { options: [], answer: '' },
    };
    setEditingQuestion({ id: `q_${Date.now()}`, type, content: '', ...(defaults[type] || defaults.single_choice), required: false, points: 1 });
    setShowQuestionEditor(true);
    setShowQuestionTypeMenu(false);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion || !editLocalTask) return;
    const exists = (editLocalTask.questions || []).some((q: any) => q.id === editingQuestion.id);
    const questions = exists
      ? editLocalTask.questions.map((q: any) => q.id === editingQuestion.id ? editingQuestion : q)
      : [...(editLocalTask.questions || []), editingQuestion];
    setEditLocalTask({ ...editLocalTask, questions, questionCount: questions.length });
    setShowQuestionEditor(false);
    setEditingQuestion(null);
  };

  const handleAIGenerate = () => {
    if (!editLocalTask) return;
    setIsAIGenModalLoading(true);
    setTimeout(() => {
      const newQs = Array.from({ length: aiGenConfig.questionCount }, (_, i) => {
        const type = aiGenConfig.questionTypes[i % aiGenConfig.questionTypes.length];
        const base: any = { id: `q_ai_${Date.now()}_${i}`, type, content: `${typeLabels[type] || '题目'} ${(editLocalTask.questions || []).length + i + 1}`, required: false, points: 1, aiGenerated: true };
        if (type === 'single_choice' || type === 'multiple_choice') { base.options = [t('选项A'), t('选项B'), t('选项C'), t('选项D')]; base.answer = type === 'multiple_choice' ? [t('选项A'), t('选项B')] : t('选项A'); }
        else if (type === 'true_false') { base.options = [t('正确'), t('错误')]; base.answer = t('正确'); }
        else if (type === 'fill_blank') { base.answer = t('参考答案'); }
        else { base.answer = ''; }
        return base;
      });
      setEditLocalTask({ ...editLocalTask, questions: [...(editLocalTask.questions || []), ...newQs], questionCount: (editLocalTask.questions || []).length + newQs.length });
      setIsAIGenModalLoading(false);
    }, 1500);
  };

  const handleUnifiedEditSave = () => {
    if (editLocalTask) {
      // Save task settings via dedicated handler
      const updatedSettings: any = {
        ...(editLocalTask.settings || {}),
        showAnswersAfterSubmit: editLocalTask.settings?.showAnswersAfterSubmit ?? true,
      };
      onSaveTaskSettings(editLocalTask.id, updatedSettings);
      // Save the full task (add or update) via parent callback
      if (onSaveTask) {
        onSaveTask(editLocalTask);
      }
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
              {/* 资源区域 - 任务收起时自动扩展，支持折叠 */}
              <div
                className="flex flex-col min-h-0 overflow-hidden transition-all"
                style={{
                  flex: isResourceCollapsed
                    ? '0 0 auto'
                    : collapsedPanels.tasks
                    ? '1 1 auto'
                    : '0 0 50%'
                }}
              >
                {/* 资源区域标题栏 - 带折叠按钮 */}
                <div
                  className={`px-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-all flex items-center justify-between ${isResourceCollapsed ? 'h-10' : 'h-0'}`}
                  onClick={() => setIsResourceCollapsed(!isResourceCollapsed)}
                >
                  {isResourceCollapsed && (
                    <>
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <FolderOpen size={16} className="text-gray-500" />
                        {t('学习资源')}
                      </h3>
                      <ChevronDown size={16} className="text-gray-400" />
                    </>
                  )}
                </div>

                {/* 资源内容区域 */}
                {!isResourceCollapsed && (
                  <>
                {/* 添加资源入口（与自由探索模式一致） */}
                <div className="p-3 border-b border-gray-100 space-y-2">\n                  <button
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
                          // 切到全屏：设 viewingResource + 清除 inlineViewingResource
                          onSetViewingResource?.({
                            id: inlineViewingResource.id,
                            title: inlineViewingResource.title,
                            type: 'interactive',
                            description: inlineViewingResource.description || '',
                            url: inlineViewingResource.url,
                            interactiveCategory: inlineViewingResource.interactiveCategory,
                            toolId: inlineViewingResource.toolId,
                            data: inlineViewingResource.data,
                            textContent: inlineViewingResource.textContent,
                          } as any);
                          onSetInlineViewingResource(null);
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
                {/* 资源区域折叠按钮 */}
                {!isResourceCollapsed && (
                  <div className="px-4 py-1.5 border-t border-gray-100 flex justify-center flex-shrink-0">
                    <button
                      onClick={() => setIsResourceCollapsed(true)}
                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors"
                    >
                      <ChevronUp size={12} />
                      {t('收起资源')}
                    </button>
                  </div>
                )}
                </>
                )}
              </div>

              {/* 学习任务区域 - 可折叠，资源收起时自动扩展，展开时占50% */}
              <div
                className="flex flex-col min-h-0 border-t border-gray-200 transition-all overflow-hidden"
                style={{
                  flex: collapsedPanels.tasks ? '0 0 auto' : isResourceCollapsed ? '1 1 auto' : '0 0 50%'
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
                        <TaskInlineViewer
                          task={expandedTask}
                          mode={explainQuestion ? 'explaining' : 'doing'}
                          currentQuestionIndex={
                            messages.find(m => m.embeddedTask?.id === expandedTask.id)?.taskState?.currentQuestionIndex || 0
                          }
                          selectedAnswers={
                            messages.find(m => m.embeddedTask?.id === expandedTask.id)?.taskState?.selectedAnswers || {}
                          }
                          quickResult={quickResult}
                          explainQuestion={explainQuestion}
                          onFullscreen={() => {
                            if (explainQuestion) {
                              onSetExplainQuestion?.(null);
                              onSetTaskDisplayMode?.('result_review');
                            } else if (completedTasks.has(expandedTask.id) && quickResult) {
                              onSetTaskDisplayMode?.('result_review');
                            } else {
                              onSetTaskDisplayMode?.('fullscreen');
                            }
                          }}
                          onBack={() => {
                            onSetExplainQuestion?.(null);
                            onSetExpandedTask?.(null);
                            onSetTaskDisplayMode?.('fullscreen');
                          }}
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
              {/* 资源区域 - 任务收起时自动扩展，支持折叠 */}
              <div
                className="flex flex-col min-h-0 overflow-hidden transition-all"
                style={{
                  flex: isResourceCollapsed
                    ? '0 0 auto'
                    : collapsedPanels.tasks
                    ? '1 1 auto'
                    : '0 0 50%'
                }}
              >
                {/* 资源区域折叠标题栏 */}
                <div
                  className={`px-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-all flex items-center justify-between ${isResourceCollapsed ? 'h-10' : 'h-0'}`}
                  onClick={() => setIsResourceCollapsed(!isResourceCollapsed)}
                >
                  {isResourceCollapsed && (
                    <>
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <FolderOpen size={16} className="text-gray-500" />
                        {t('学习资源')}
                      </h3>
                      <ChevronDown size={16} className="text-gray-400" />
                    </>
                  )}
                </div>

                {!isResourceCollapsed && (
                <>

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
                          // 切到全屏：设 viewingResource + 清除 inlineViewingResource
                          onSetViewingResource?.({
                            id: inlineViewingResource.id,
                            title: inlineViewingResource.title,
                            type: 'interactive',
                            description: inlineViewingResource.description || '',
                            url: inlineViewingResource.url,
                            interactiveCategory: inlineViewingResource.interactiveCategory,
                            toolId: inlineViewingResource.toolId,
                            data: inlineViewingResource.data,
                            textContent: inlineViewingResource.textContent,
                          } as any);
                          onSetInlineViewingResource(null);
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
                {/* 资源区域折叠按钮 */}
                {!isResourceCollapsed && (
                  <div className="px-4 py-1.5 border-t border-gray-100 flex justify-center flex-shrink-0">
                    <button
                      onClick={() => setIsResourceCollapsed(true)}
                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors"
                    >
                      <ChevronUp size={12} />
                      {t('收起资源')}
                    </button>
                  </div>
                )}
                </>
                )}
              </div>

              {/* 任务区域 - 可折叠，资源收起时自动扩展，展开时占50% */}
              <div
                className="flex flex-col min-h-0 border-t border-gray-200 transition-all overflow-hidden"
                style={{
                  flex: collapsedPanels.tasks ? '0 0 auto' : isResourceCollapsed ? '1 1 auto' : '0 0 50%'
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
                        <TaskInlineViewer
                          task={expandedTask}
                          mode={explainQuestion ? 'explaining' : 'doing'}
                          currentQuestionIndex={
                            messages.find(m => m.embeddedTask?.id === expandedTask.id)?.taskState?.currentQuestionIndex || 0
                          }
                          selectedAnswers={
                            messages.find(m => m.embeddedTask?.id === expandedTask.id)?.taskState?.selectedAnswers || {}
                          }
                          quickResult={quickResult}
                          explainQuestion={explainQuestion}
                          onFullscreen={() => {
                            if (explainQuestion) {
                              onSetExplainQuestion?.(null);
                              onSetTaskDisplayMode?.('result_review');
                            } else if (completedTasks.has(expandedTask.id) && quickResult) {
                              onSetTaskDisplayMode?.('result_review');
                            } else {
                              onSetTaskDisplayMode?.('fullscreen');
                            }
                          }}
                          onBack={() => {
                            onSetExplainQuestion?.(null);
                            onSetExpandedTask?.(null);
                            onSetTaskDisplayMode?.('fullscreen');
                          }}
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
          <div className="bg-white rounded-xl shadow-2xl w-[640px] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-500">{t('题目列表')} ({(editLocalTask.questions || []).length})</label>
                </div>
                <div className="space-y-2">
                  {(editLocalTask.questions || []).map((q: any, idx: number) => (
                    <div
                      key={q.id}
                      draggable
                      onDragStart={() => setDraggedQuestionId(q.id)}
                      onDragOver={(e) => handleDragOver(e, q.id)}
                      onDragEnd={() => setDraggedQuestionId(null)}
                      onClick={() => handleEditQuestionOpen(q)}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-white hover:border-primary-200 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical size={14} className="text-gray-300 mt-1 cursor-grab flex-shrink-0" />
                        <span className="text-xs text-gray-400 mt-0.5 flex-shrink-0">{idx + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium">{typeLabels[q.type] || q.type}</span>
                            {q.aiGenerated && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-600">AI</span>}
                          </div>
                          <p className="text-sm text-gray-700 truncate">{q.content || t('空题目')}</p>
                          {/* 正确答案指示 */}
                          <p className="text-xs mt-0.5 text-gray-400">
                            {q.type === 'short_answer' ? t('AI评分') :
                             q.type === 'fill_blank' ? `${t('参考')}: ${q.answer || '-'}` :
                             Array.isArray(q.answer) ? `✓ ${q.answer.join(', ')}` :
                             q.answer ? `✓ ${q.answer}` : '-'}
                          </p>
                        </div>
                        {/* 必修开关 */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleQuestionRequired(q.id); }}
                          className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${q.required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {q.required ? t('必修') : t('选修')}
                        </button>
                        {/* 删除 */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
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
                      {Object.entries(typeLabels).map(([type, label]) => (
                        <button
                          key={type}
                          onClick={() => handleNewQuestion(type)}
                          className="w-full px-3 py-1.5 text-left text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* AI 生成题目 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowAIGenConfig(!showAIGenConfig)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
                >
                  <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                    <Sparkles size={14} />
                    {t('AI 生成题目')}
                  </span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${showAIGenConfig ? 'rotate-180' : ''}`} />
                </button>
                {showAIGenConfig && (
                  <div className="p-3 space-y-3 border-t border-gray-200">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t('题型')}</label>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(typeLabels).map(([type, label]) => (
                          <button
                            key={type}
                            onClick={() => setAiGenConfig(prev => ({
                              ...prev,
                              questionTypes: prev.questionTypes.includes(type)
                                ? prev.questionTypes.filter(t2 => t2 !== type)
                                : [...prev.questionTypes, type]
                            }))}
                            className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                              aiGenConfig.questionTypes.includes(type)
                                ? 'bg-primary-50 border-primary-300 text-primary-700'
                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">{t('数量')}</label>
                        <input type="number" min={1} max={10} value={aiGenConfig.questionCount}
                          onChange={(e) => setAiGenConfig(prev => ({ ...prev, questionCount: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) }))}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">{t('难度')}</label>
                        <select value={aiGenConfig.difficulty}
                          onChange={(e) => setAiGenConfig(prev => ({ ...prev, difficulty: e.target.value as any }))}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="easy">{t('简单')}</option>
                          <option value="medium">{t('中等')}</option>
                          <option value="hard">{t('困难')}</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleAIGenerate}
                      disabled={isAIGenModalLoading || aiGenConfig.questionTypes.length === 0}
                      className="w-full px-3 py-2 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                    >
                      {isAIGenModalLoading ? <><Activity size={12} className="animate-spin" />{t('生成中...')}</> : <><Sparkles size={12} />{t('生成题目')}</>}
                    </button>
                  </div>
                )}
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

      {/* 题目编辑器 sub-modal */}
      {showQuestionEditor && editingQuestion && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center" onClick={() => { setShowQuestionEditor(false); setEditingQuestion(null); }}>
          <div className="bg-white rounded-xl shadow-2xl w-[500px] max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-green-500 to-primary-500 rounded-t-xl">
              <h4 className="text-sm font-semibold text-white">{editingQuestion.id?.startsWith('q_') && !(editLocalTask?.questions || []).some((q: any) => q.id === editingQuestion.id) ? t('添加题目') : t('编辑题目')}</h4>
              <button onClick={() => { setShowQuestionEditor(false); setEditingQuestion(null); }} className="p-1 hover:bg-white/20 rounded-lg"><X size={16} className="text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* 题型选择 */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{t('题型')}</label>
                <select
                  value={editingQuestion.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    const defaults: Record<string, any> = {
                      single_choice: { options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')], answer: t('选项A') },
                      multiple_choice: { options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')], answer: [t('选项A'), t('选项B')] },
                      true_false: { options: [t('正确'), t('错误')], answer: t('正确') },
                      fill_blank: { options: [], answer: '' },
                      short_answer: { options: [], answer: '' },
                    };
                    setEditingQuestion({ ...editingQuestion, type: newType, ...(defaults[newType] || {}) });
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(typeLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              {/* 题目内容 */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{t('题目内容')} <span className="text-red-400">*</span></label>
                <textarea
                  value={editingQuestion.content || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, content: e.target.value })}
                  placeholder={t('请输入题目内容...')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[60px] resize-none"
                />
              </div>
              {/* 选项和答案 - 按题型 */}
              {(editingQuestion.type === 'single_choice' || editingQuestion.type === 'multiple_choice') && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">{t('选项')} <span className="text-xs text-gray-400 font-normal">({editingQuestion.type === 'single_choice' ? t('点击单选按钮标记正确答案') : t('勾选正确答案')})</span></label>
                  <div className="space-y-2">
                    {(editingQuestion.options || []).map((opt: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        {editingQuestion.type === 'single_choice' ? (
                          <input type="radio" name="correct" checked={editingQuestion.answer === opt}
                            onChange={() => setEditingQuestion({ ...editingQuestion, answer: opt })}
                            className="w-4 h-4 text-green-600" />
                        ) : (
                          <input type="checkbox" checked={Array.isArray(editingQuestion.answer) && editingQuestion.answer.includes(opt)}
                            onChange={(e) => {
                              const arr = Array.isArray(editingQuestion.answer) ? [...editingQuestion.answer] : [];
                              if (e.target.checked) arr.push(opt); else { const idx2 = arr.indexOf(opt); if (idx2 >= 0) arr.splice(idx2, 1); }
                              setEditingQuestion({ ...editingQuestion, answer: arr });
                            }}
                            className="w-4 h-4 text-green-600 rounded" />
                        )}
                        <span className="text-xs text-gray-400 w-4">{String.fromCharCode(65 + i)}.</span>
                        <input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(editingQuestion.options || [])];
                            const oldOpt = newOpts[i];
                            newOpts[i] = e.target.value;
                            // Update answer if it referenced the old option text
                            let newAnswer = editingQuestion.answer;
                            if (editingQuestion.type === 'single_choice' && newAnswer === oldOpt) { newAnswer = e.target.value; }
                            else if (Array.isArray(newAnswer)) { newAnswer = newAnswer.map((a: string) => a === oldOpt ? e.target.value : a); }
                            setEditingQuestion({ ...editingQuestion, options: newOpts, answer: newAnswer });
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {editingQuestion.type === 'true_false' && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">{t('正确答案')}</label>
                  <div className="flex gap-4">
                    {[t('正确'), t('错误')].map(val => (
                      <label key={val} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="tf" checked={editingQuestion.answer === val}
                          onChange={() => setEditingQuestion({ ...editingQuestion, answer: val })}
                          className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {editingQuestion.type === 'fill_blank' && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">{t('参考答案')}</label>
                  <input
                    value={editingQuestion.answer || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })}
                    placeholder={t('请输入参考答案...')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
              {editingQuestion.type === 'short_answer' && (
                <div className="px-3 py-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">{t('简答题将由 AI 自动评分')}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-5 py-3 border-t border-gray-200">
              <button onClick={() => { setShowQuestionEditor(false); setEditingQuestion(null); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">{t('取消')}</button>
              <button onClick={handleSaveQuestion} disabled={!editingQuestion.content?.trim()} className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg">{t('保存')}</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
