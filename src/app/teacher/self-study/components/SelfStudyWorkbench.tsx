'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SpaceConfig, LearningMode, LearningPathNode, LEARNING_MODE_CONFIG } from '@/types/self-study';
import { Resource, Task, TaskQuestion } from '@/types/shared-context';
import { mockResources } from '@/data/mockLearningData';
import { blankExamScenario, multiStudentScenario, arbitraryFileScenario, historicalTestScenario, errorQuestionsScenario } from '@/data/demoScenarios';
import {
  ArrowLeft, Send, Settings, BookOpen, Brain, Sparkles, FileText, Video,
  FileSpreadsheet, Plus, Upload, Link, GripVertical, X, Check, Zap, FileEdit,
  Activity, Pencil, Save, Target, Lightbulb, MessageCircle, Clock, FolderOpen,
  ListChecks, ChevronRight, ChevronLeft, Play, Download, Eye, Search, BarChart3, Map,
  CheckCircle2, Circle, Bot, MessageSquare, Pause, RotateCcw, GitBranch,
  Edit, Image as ImageIcon, Mic, Trash2, Layers, Award, TrendingUp,
  ChevronDown, ChevronUp, Layout, Share2, AlertCircle, Globe, Database,
  Workflow, TestTube2, CreditCard, Film, Presentation,
} from 'lucide-react';
import SettingsModal from './SettingsModal';
import PublishModal from './PublishModal';
import FileUploadModal from './FileUploadModal';
import LinkInputModal from './LinkInputModal';
import UnifiedResourceLibraryModal from './UnifiedResourceLibraryModal';
import InteractiveViewerModal from './InteractiveViewerModal';
import ResourceInlineViewer, { InlineViewResource } from './ResourceInlineViewer';
import { useLanguage } from '@/contexts/LanguageContext';
import { TaskEditModal, NoteInfoModal } from '@/app/teacher/note-config/modals';
import { useRouter } from 'next/navigation';
import { usePersistedState } from '../utils/storage';
import { PublishScope } from '@/types/self-study';
import type { ErrorQuestion, HistoricalTest, Note as KnowledgeNote, InteractiveWebpage } from '@/data/mockKnowledgeBase';
import TaskExpandedCard from './task/TaskExpandedCard';
import TaskResultReview from './task/TaskResultReview';
import GrowthTimelinePanel from '@/app/student/components/GrowthTimelinePanel';
import { QuickResultData, ExamProcessingConfig, ExamProcessingStep } from './task/taskTypes';
import ExamDetectedModal from './ExamDetectedModal';
import TaskSettingsPopover from './TaskSettingsPopover';
import ResourceSettingsPopover from './ResourceSettingsPopover';
import type { TaskSettings, ResourceVisibility } from '@/types/shared-context';

// 主题配置 - 修改这里即可改变整体风格
const THEME = {
  // 强调色 - 使用主题变量（会随 globals.css 中的主题改变）
  accent: {
    bg: 'bg-primary-600',
    bgHover: 'hover:bg-primary-700',
    text: 'text-primary-600',
    textHover: 'hover:text-primary-700',
    border: 'border-primary-300',
    borderHover: 'hover:border-primary-400',
  },
  // 中性色 - 用于大部分 UI
  neutral: {
    bg: 'bg-gray-50',
    bgHover: 'hover:bg-gray-100',
    text: 'text-gray-600',
    textLight: 'text-gray-400',
    border: 'border-gray-200',
    borderHover: 'hover:border-gray-300',
  },
};

// 年级列表
const GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级'];

// 班级列表
const MOCK_CLASSES = [
  '四年级1班',
  '四年级2班',
  '四年级3班',
  '五年级1班',
  '五年级2班',
  '五年级3班',
];

// 知识点库（简化版）
const KNOWLEDGE_POINTS_LIBRARY = [
  {
    id: 'kp1',
    title: '水循环的概念',
    subject: '地理',
    grade: '四年级',
  },
  {
    id: 'kp2',
    title: '光合作用原理',
    subject: '生物',
    grade: '五年级',
  },
];

interface SelfStudyWorkbenchProps {
  config?: SpaceConfig;
  spaceId?: string;
  mode?: 'teacher' | 'student';
  onBack?: () => void;
  onUpdateConfig?: (config: SpaceConfig) => void;
  isAIGenerating?: boolean;
  onCreateNewSpace?: () => void;
  onViewResults?: () => void;
  pendingExamFiles?: File[] | null;
  onExamFilesHandled?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // 消息类型
  messageType?: 'normal' | 'knowledge_checkpoint' | 'topic_transition' | 'resource_reference' | 'mode_transition';
  // 知识检查点
  checkpoint?: {
    question: string;
    options?: string[];
    correctAnswer?: string;
    userAnswer?: string;
    status: 'pending' | 'answered' | 'correct' | 'incorrect';
    explanation?: string;
    relatedNodeId?: string;
  };
  // 主题过渡
  transition?: {
    fromTopic: string;
    toTopic: string;
    fromNodeId: string;
    toNodeId: string;
    summary: string;
  };
  // 推荐回复和功能按钮
  suggestions?: {
    quickReplies?: Array<{ id: string; label: string }>;
    actionButtons?: Array<{
      id: string;
      label: string;
      iconName: string; // Lucide icon name
      studioToolId: string;
    }>;
  };
  // 资源引用
  resourceRef?: {
    resourceId: string;
    resourceTitle: string;
    excerpt?: string;
  };
  // 模式切换
  modeTransition?: {
    fromMode: LearningMode;
    toMode: LearningMode;
  };
  // 可选：嵌入的任务卡片
  embeddedTask?: Task;
  // 任务状态（用于保持答题进度）
  taskState?: {
    currentQuestionIndex: number;
    selectedAnswers: Record<string, string | string[]>;
    submissionText: string;
    status: 'idle' | 'in_progress' | 'submitting' | 'grading' | 'completed';
    quickResult?: {
      allCorrect: boolean;
      correctCount: number;
      totalCount: number;
      details: any[];
    };
  };
}

// Note interfaces for EnhancedNotesPanel
interface VoiceRecording {
  id: string;
  url: string;
  duration: number;
  timestamp: Date;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  images: string[];
  voiceRecordings: VoiceRecording[];
}

// Helper function to get icon component from icon name
function getIconComponent(iconName: string) {
  const iconMap: Record<string, any> = {
    'FileEdit': FileEdit,
    'TestTube2': TestTube2,
    'Presentation': Presentation,
    'Film': Film,
    'CreditCard': CreditCard,
    'Workflow': Workflow,
    'Database': Database,
    'Globe': Globe,
    'AlertCircle': AlertCircle,
    'Share2': Share2,
    'Layout': Layout,
    'ChevronUp': ChevronUp,
    'ChevronDown': ChevronDown,
    'TrendingUp': TrendingUp,
    'Award': Award,
    'Layers': Layers,
    'Trash2': Trash2,
    'Mic': Mic,
    'ImageIcon': ImageIcon,
    'Edit': Edit,
    'GitBranch': GitBranch,
    'RotateCcw': RotateCcw,
    'Pause': Pause,
    'MessageSquare': MessageSquare,
    'Bot': Bot,
    'Circle': Circle,
    'CheckCircle2': CheckCircle2,
    'Map': Map,
    'BarChart3': BarChart3,
    'Search': Search,
    'Eye': Eye,
    'Download': Download,
    'Play': Play,
    'ChevronLeft': ChevronLeft,
    'ChevronRight': ChevronRight,
    'ListChecks': ListChecks,
    'FolderOpen': FolderOpen,
    'Clock': Clock,
    'MessageCircle': MessageCircle,
    'Lightbulb': Lightbulb,
    'Target': Target,
    'Save': Save,
    'Pencil': Pencil,
    'Activity': Activity,
    'Zap': Zap,
    'Check': Check,
    'X': X,
    'GripVertical': GripVertical,
    'Link': Link,
    'Upload': Upload,
    'Plus': Plus,
    'FileSpreadsheet': FileSpreadsheet,
    'Video': Video,
    'FileText': FileText,
    'Sparkles': Sparkles,
    'Brain': Brain,
    'BookOpen': BookOpen,
    'Settings': Settings,
    'Send': Send,
    'ArrowLeft': ArrowLeft,
  };
  return iconMap[iconName] || AlertCircle;
}

function Resizer({ onResize }: { onResize: (delta: number) => void }) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const deltaPercent = (delta / window.innerWidth) * 100;
      onResize(deltaPercent);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div onMouseDown={handleMouseDown} className="w-[1px] bg-gray-200 hover:bg-gray-400 cursor-col-resize transition-colors relative group flex-shrink-0">
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}

// Mock learning path data (ai_guided mode) - will be created inside component with t()
const MOCK_CURRENT_NODE = 'node_3';

// Mock generated tasks for self-directed mode - will be created inside component with t()

// Enhanced Notes Panel component
function EnhancedNotesPanel({ learningMode, isAIGenerating, getThemeClass, configId }: { learningMode?: LearningMode; isAIGenerating?: boolean; getThemeClass: (type: 'bg' | 'bgHover' | 'text' | 'border' | 'icon') => string; configId?: string }) {
  const { t } = useLanguage();
  const [notes, setNotes] = usePersistedState<Note[]>(`self-study:wb:${configId ?? 'default'}:notes`, []);
  const [activeNoteId, setActiveNoteId] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: `${t('笔记')} ${notes.length + 1}`,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      images: [],
      voiceRecordings: [],
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setShowNoteEditor(true);
  };

  // AI-assisted note generation (for guided mode)
  const generateAINote = () => {
    setIsGeneratingNote(true);
    setGenerationProgress(0);

    // Simulate AI generation process
    const steps = [
      { progress: 20, delay: 500 },
      { progress: 50, delay: 800 },
      { progress: 80, delay: 600 },
      { progress: 100, delay: 400 },
    ];

    let currentStep = 0;
    const runStep = () => {
      if (currentStep < steps.length) {
        setTimeout(() => {
          setGenerationProgress(steps[currentStep].progress);
          currentStep++;
          runStep();
        }, steps[currentStep].delay);
      } else {
        // Generation complete
        setTimeout(() => {
          const aiNote: Note = {
            id: Date.now().toString(),
            title: `📚 ${t('AI生成：关键公式与推导笔记')}`,
            content: `# ${t('关键公式与推导')}\n\n## ${t('核心公式')}\n\n### ${t('公式1：基本定义')}\n$$E = mc^2$$\n\n### ${t('公式2：推导过程')}\n1. ${t('从基本假设出发...')}\n2. ${t('应用数学变换...')}\n3. ${t('得到最终结果...')}\n\n## ${t('重点理解')}\n- ${t('公式的物理意义')}\n- ${t('适用条件和范围')}\n- ${t('常见错误分析')}\n\n## ${t('练习建议')}\n${t('尝试用自己的话解释这个公式的含义。')}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            images: [],
            voiceRecordings: [],
          };
          setNotes([aiNote, ...notes]);
          setActiveNoteId(aiNote.id);
          setIsGeneratingNote(false);
          setShowNoteEditor(true);
        }, 300);
      }
    };
    runStep();
  };

  const deleteNote = (noteId: string) => {
    if (notes.length === 1) {
      alert(t('至少需要保留一个笔记'));
      return;
    }
    const newNotes = notes.filter((n) => n.id !== noteId);
    setNotes(newNotes);
    if (activeNoteId === noteId) {
      setActiveNoteId(newNotes[0].id);
    }
  };

  const updateNote = (updates: Partial<Note>) => {
    setNotes(
      notes.map((n) =>
        n.id === activeNoteId ? { ...n, ...updates, updatedAt: new Date() } : n
      )
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          if (newImages.length === files.length) {
            updateNote({ images: [...activeNote.images, ...newImages] });
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      const newRecording: VoiceRecording = {
        id: Date.now().toString(),
        url: '',
        duration: recordingTime,
        timestamp: new Date(),
      };
      updateNote({
        voiceRecordings: [...activeNote.voiceRecordings, newRecording],
      });
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
    }
  };

  const formatRecTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Note list view
  if (!showNoteEditor) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 space-y-2">
          <button
            onClick={createNote}
            className={`w-full px-4 py-3 ${getThemeClass('bg')} ${getThemeClass('bgHover')} text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
          >
            <Plus size={18} />
            {t('添加笔记')}
          </button>
          {learningMode === 'ai_guided' && (
            <button
              onClick={generateAINote}
              disabled={isGeneratingNote}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isGeneratingNote ? (
                <>
                  <Activity size={18} className="animate-spin" />
                  <span>{t('正在从知识库提取...')} {generationProgress}%</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {t('AI 生成笔记')}
                </>
              )}
            </button>
          )}
        </div>
        {/* Generation progress indicator - 仅显示笔记生成进度 */}
        {isGeneratingNote && (
          <div className="px-4 py-2 bg-primary-50 border-b border-primary-100">
            <div className="flex items-center gap-2 text-xs text-primary-700 mb-2">
              <Brain size={14} className="animate-pulse" />
              <span>{t('AI 正在分析当前学习内容并生成笔记...')}</span>
            </div>
            <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300 animate-pulse"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Pencil size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-2">{t('还没有笔记')}</p>
              <p className="text-xs text-gray-400">{t('点击上方按钮创建第一个笔记')}</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setActiveNoteId(note.id);
                  setShowNoteEditor(true);
                }}
                className={`p-3 bg-white border border-gray-200 rounded-lg hover:${getThemeClass('border')} hover:shadow-md cursor-pointer transition-all`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate mb-1">
                      {note.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {note.content.slice(0, 50) || t('空笔记')}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(note.updatedAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <Edit size={14} className="text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Note editor view
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNoteEditor(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('返回列表')}
          >
            <X size={16} className="text-gray-600" />
          </button>
          <div className="h-4 w-px bg-gray-300" />
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isPreviewMode ? 'bg-gray-100 text-gray-700' : 'bg-primary-600 text-white'
            }`}
          >
            {isPreviewMode ? <Eye size={14} className="inline mr-1" /> : <Edit size={14} className="inline mr-1" />}
            {isPreviewMode ? t('预览') : t('编辑')}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ImageIcon size={16} className="text-gray-600" />
            </div>
          </label>
          <button
            onClick={toggleRecording}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isRecording ? 'animate-pulse' : ''}`}
            title={isRecording ? t('停止录音') : t('开始录音')}
          >
            <Mic size={16} className={isRecording ? 'text-red-600' : 'text-gray-600'} />
          </button>
          {isRecording && (
            <span className="text-xs font-mono text-red-600">{formatRecTime(recordingTime)}</span>
          )}
          <div className="h-4 w-px bg-gray-300" />
          <button
            onClick={() => deleteNote(activeNoteId)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title={t('删除笔记')}
          >
            <Trash2 size={16} className="text-gray-600 hover:text-red-600" />
          </button>
        </div>
      </div>

      {/* Editor / Preview area */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => updateNote({ title: e.target.value })}
          className="w-full text-lg font-bold text-gray-800 border-none outline-none mb-3 bg-transparent"
          placeholder={t('笔记标题')}
        />
        {isPreviewMode ? (
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeNote.content}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={activeNote.content}
            onChange={(e) => updateNote({ content: e.target.value })}
            className="w-full h-full min-h-[300px] bg-transparent border-none outline-none resize-none text-sm text-gray-700 leading-relaxed font-mono"
            placeholder={`# ${t('开始记录你的学习笔记...')}\n\n${t('支持Markdown格式')}`}
          />
        )}

        {/* Image grid */}
        {activeNote.images.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-bold text-gray-600 mb-2">{t('图片')} ({activeNote.images.length})</div>
            <div className="grid grid-cols-3 gap-2">
              {activeNote.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt={`uploaded-${idx}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                  <button
                    onClick={() => {
                      const newImages = activeNote.images.filter((_, i) => i !== idx);
                      updateNote({ images: newImages });
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice recordings list */}
        {activeNote.voiceRecordings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-bold text-gray-600 mb-2">{t('语音笔记')} ({activeNote.voiceRecordings.length})</div>
            <div className="space-y-2">
              {activeNote.voiceRecordings.map((recording) => (
                <div key={recording.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <button className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <Play size={12} />
                  </button>
                  <div className="flex-1">
                    <div className="text-xs text-gray-700">{t('语音笔记')} {new Date(recording.timestamp).toLocaleString('zh-CN')}</div>
                    <div className="text-xs text-gray-500">{t('时长')}: {formatRecTime(recording.duration)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 学习状态面板组件
function LearningStatusPanel({
  elapsedTime,
  learningMode,
  learningPath,
  observations,
}: {
  elapsedTime: number;
  learningMode: LearningMode;
  learningPath: LearningPathNode[];
  observations: Array<{ id: string; type: 'praise' | 'suggestion' | 'insight'; icon: string; message: string; timestamp: Date }>;
}) {
  const { t } = useLanguage();
  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} ${t('分钟')}`;
  };

  const masteredCount = learningPath.filter((n) => n.status === 'mastered').length;
  const totalCount = learningPath.length;
  const progressPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // 简化版能力画像数据
  const competencies = [
    { name: t('批判性思维'), value: 65, color: 'primary' },
    { name: t('信息整合'), value: 72, color: 'emerald' },
    { name: t('元认知'), value: 58, color: 'amber' },
  ];

  // 当前学习节点
  const currentNode = learningPath.find((n) => n.status === 'learning');

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* 学习概况 */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-4 border border-primary-100">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} className="text-primary-600" />
          <span className="text-xs font-bold text-primary-700">{t('学习概况')}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">{formatMinutes(elapsedTime)}</div>
            <div className="text-xs text-gray-500">{t('学习时长')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">{masteredCount}/{totalCount}</div>
            <div className="text-xs text-gray-500">{t('已掌握概念')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-fresh-600">{progressPercent}%</div>
            <div className="text-xs text-gray-500">{t('完成进度')}</div>
          </div>
        </div>
      </div>

      {/* 学习路径 - 仅AI引导模式显示 */}
      {learningMode === 'ai_guided' && (
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Map size={14} className="text-primary-600" />
              <span className="text-xs font-bold text-primary-700">{t('学习路径')}</span>
            </div>
            <span className="text-xs text-primary-600">
              <Activity size={10} className="inline animate-pulse mr-1" />
              {t('AI 动态规划')}
            </span>
          </div>
          <div className="space-y-2">
            {learningPath.map((node, idx) => (
              <div
                key={node.id}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                  node.status === 'learning'
                    ? 'bg-primary-100 border border-primary-300'
                    : node.status === 'mastered'
                    ? 'bg-white/60 border border-primary-100'
                    : 'bg-white/40 border border-gray-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    node.status === 'mastered'
                      ? 'bg-primary-500'
                      : node.status === 'learning'
                      ? 'bg-primary-500'
                      : 'bg-gray-300'
                  }`}
                >
                  {node.status === 'mastered' ? (
                    <CheckCircle2 size={12} className="text-white" />
                  ) : node.status === 'learning' ? (
                    <Circle size={12} className="text-white" />
                  ) : (
                    <span className="text-xs text-white font-medium">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${
                      node.status === 'mastered'
                        ? 'text-primary-700 line-through'
                        : node.status === 'learning'
                        ? 'text-primary-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {node.title}
                  </p>
                  {node.estimatedTime && node.status !== 'mastered' && (
                    <p className="text-xs text-gray-400">{t('预计')} {node.estimatedTime} {t('分钟')}</p>
                  )}
                </div>
                {node.status === 'learning' && (
                  <span className="text-xs bg-primary-200 text-primary-700 px-1.5 py-0.5 rounded-full font-medium animate-pulse">
                    {t('当前')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 能力画像 */}
      <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-4 border border-accent-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-accent-600" />
            <span className="text-xs font-bold text-accent-600">{t('能力画像')}</span>
          </div>
          <span className="text-xs text-accent-600">
            <TrendingUp size={10} className="inline mr-1" />
            {t('实时更新')}
          </span>
        </div>
        <div className="space-y-3">
          {competencies.map((comp) => (
            <div key={comp.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{comp.name}</span>
                <span className="text-xs font-medium text-gray-700">{comp.value}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${comp.color}-500 rounded-full transition-all`}
                  style={{ width: `${comp.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI 观察记录 */}
      <div className="bg-gradient-to-br from-accent-50 to-primary-50 rounded-lg p-4 border border-accent-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-accent-600" />
          <span className="text-xs font-bold text-accent-700">{t('AI 观察记录')}</span>
        </div>
        <div className="space-y-2">
          {observations.slice(0, 3).map((obs) => (
            <div key={obs.id} className="bg-white/80 rounded-lg p-2 border border-accent-100">
              <div className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">{obs.icon}</span>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{obs.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 主组件
export default function SelfStudyWorkbench({
  config: initialConfig,
  spaceId,
  mode = 'teacher',
  onBack,
  onUpdateConfig,
  isAIGenerating = false,
  onCreateNewSpace,
  onViewResults,
  pendingExamFiles,
  onExamFilesHandled
}: SelfStudyWorkbenchProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const isStudentMode = mode === 'student';

  // 如果传入 spaceId，从 localStorage 加载配置（学生模式）
  const [config, setConfig] = useState<SpaceConfig>(() => {
    if (spaceId && !initialConfig) {
      const stored = localStorage.getItem(`self-study:space:${spaceId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return initialConfig || {
      id: spaceId || `space_${Date.now()}`,
      title: '新学习空间',
      learningMode: 'self_directed' as LearningMode,
      resources: [],
      resourceSource: 'user_uploaded' as any,
      tasks: [],
      userProfile: {
        preferences: {
          aiStyle: 'patient' as any,
          knowledgeBoundary: 'moderate' as any,
        },
      },
      noteTemplate: 'blank' as any,
      competencyDimensions: [],
      publishStatus: 'unpublished' as any,
      publishedVersions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // 同步外部 config 变化
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  // 更新配置的包装函数
  const handleUpdateConfig = (newConfig: SpaceConfig) => {
    setConfig(newConfig);
    if (onUpdateConfig) {
      onUpdateConfig(newConfig);
    }
    // 保存到 localStorage
    localStorage.setItem(`self-study:space:${newConfig.id}`, JSON.stringify(newConfig));
  };

  // 主题色工具函数
  const getThemeClass = (type: 'bg' | 'bgHover' | 'text' | 'border' | 'icon'): string => {
    const map: Record<string, string> = {
      bg: 'bg-primary-600',
      bgHover: 'hover:bg-primary-700',
      text: 'text-primary-600',
      border: 'border-primary-500',
      icon: 'text-primary-600',
    };
    return map[type] ?? '';
  };

  // Mock data with translations
  const MOCK_LEARNING_PATH: LearningPathNode[] = [
    { id: 'node_1', title: t('基础概念与定义'), status: 'mastered', estimatedTime: 15 },
    { id: 'node_2', title: t('核心原理解析'), status: 'mastered', estimatedTime: 20 },
    { id: 'node_3', title: t('关键公式与推导'), status: 'learning', estimatedTime: 25 },
    { id: 'node_4', title: t('典型例题分析'), status: 'pending', estimatedTime: 20 },
    { id: 'node_5', title: t('综合应用与拓展'), status: 'pending', estimatedTime: 30 },
  ];

  const MOCK_AI_RESOURCES = [
    { id: 'ai_res_1', title: t('概念图解：核心原理可视化'), type: 'ai_generated', status: 'ready', icon: '🎨' },
    { id: 'ai_res_2', title: t('练习题：基础概念巩固'), type: 'ai_generated', status: 'ready', icon: '📝' },
    { id: 'ai_res_3', title: t('知识卡片：公式速记'), type: 'ai_generated', status: 'generating', icon: '🃏' },
    { id: 'ai_res_4', title: t('思维导图：知识结构'), type: 'ai_generated', status: 'pending', icon: '🗺️' },
  ];

  const MOCK_AI_OBSERVATIONS = [
    {
      id: 'obs_1',
      type: 'praise' as const,
      icon: '🌟',
      message: t('你对基础概念的理解非常扎实，能够准确地用自己的话解释核心原理。'),
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: 'obs_2',
      type: 'suggestion' as const,
      icon: '💡',
      message: t('建议在推导公式时多画图辅助理解，这样可以更直观地把握变量之间的关系。'),
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: 'obs_3',
      type: 'insight' as const,
      icon: '🔍',
      message: t('你倾向于先理解整体框架再深入细节，这是一种很好的学习策略。'),
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
    },
  ];

  const SELF_DIRECTED_QUICK_ACTIONS = [
    { id: 'search', label: t('搜索概念'), icon: Search, color: 'primary' },
    { id: 'summarize', label: t('总结要点'), icon: FileText, color: 'emerald' },
    { id: 'example', label: t('举个例子'), icon: Lightbulb, color: 'amber' },
    { id: 'generate_quiz', label: t('生成测试'), icon: Zap, color: 'purple' },
  ];

  const AI_GUIDED_QUICK_ACTIONS = [
    { id: 'quiz', label: t('考考我'), icon: Zap, color: 'amber' },
    { id: 'next', label: t('下一知识点'), icon: ChevronRight, color: 'emerald' },
    { id: 'path', label: t('查看路径'), icon: Map, color: 'primary' },
    { id: 'hint', label: t('给我提示'), icon: Lightbulb, color: 'purple' },
  ];

  const STUDIO_TOOLS = [
    // 资源生成类工具
    { id: 'audio_overview', label: t('音频概述'), icon: '🎧', description: t('生成音频摘要'), status: 'ready' as const, type: 'resource' as const },
    { id: 'mind_map', label: t('思维导图'), icon: '🗺️', description: t('可视化知识结构'), status: 'ready' as const, type: 'resource' as const },
    { id: 'flashcards', label: t('记忆卡片'), icon: '🃏', description: t('生成复习卡片'), status: 'ready' as const, type: 'resource' as const },
    { id: 'timeline', label: t('时间线'), icon: '📅', description: t('梳理知识脉络'), status: 'ready' as const, type: 'resource' as const },
    { id: 'summary', label: t('学习报告'), icon: '📊', description: t('生成学习总结'), status: 'ready' as const, type: 'resource' as const },
    { id: 'concept_search', label: t('搜索概念'), icon: '🔍', description: t('智能搜索知识点'), status: 'ready' as const, type: 'resource' as const },
    { id: 'key_points', label: t('总结要点'), icon: '📋', description: t('提取核心内容'), status: 'ready' as const, type: 'resource' as const },
    { id: 'examples', label: t('举例说明'), icon: '💡', description: t('生成实例解释'), status: 'ready' as const, type: 'resource' as const },
    // 任务生成类工具
    { id: 'quiz', label: t('知识测验'), icon: '📝', description: t('生成测试题目'), status: 'ready' as const, type: 'task' as const },
    { id: 'practice', label: t('练习题'), icon: '✍️', description: t('生成练习任务'), status: 'ready' as const, type: 'task' as const },
    { id: 'generate_variant_question', label: t('生成变种题'), icon: '🔄', description: t('基于错题生成变种练习'), status: 'ready' as const, type: 'task' as const },
    // 互动内容生成类工具
    { id: 'interactive_animation', label: t('说明动画'), icon: '🎬', description: t('生成互动说明动画'), status: 'ready' as const, type: 'interactive' as const },
    { id: 'interactive_visualization', label: t('可视化'), icon: '📊', description: t('生成数据可视化'), status: 'ready' as const, type: 'interactive' as const },
    { id: 'interactive_simulation', label: t('互动模拟'), icon: '🔬', description: t('生成互动模拟实验'), status: 'ready' as const, type: 'interactive' as const },
    { id: 'interactive_test', label: t('互动测试'), icon: '🧪', description: t('生成互动测试'), status: 'ready' as const, type: 'interactive' as const },
  ];

  const MOCK_GENERATED_TASKS = [
    {
      id: 'gen_task_1',
      type: 'quiz' as const,
      title: t('AI生成：植物工厂基础测验'),
      status: 'optional' as const,
      questionCount: 8,
      questions: [
        {
          id: 'q1',
          type: 'single_choice',
          content: '观察下面的植物工厂图片，植物工厂的主要优势是什么？\n\n![植物工厂](https://picsum.photos/seed/plant1/600/300)',
          options: [
            t('不受气候影响，可全年生产'),
            t('成本低廉'),
            t('不需要任何技术'),
            t('产量低但质量好')
          ],
          answer: t('不受气候影响，可全年生产'),
          explanation: '植物工厂最大的优势在于通过人工控制环境，实现全年不间断生产，不受自然气候条件的限制。',
          points: 1,
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          content: t('以下哪些是植物工厂中需要控制的关键环境因素？（多选）'),
          options: [
            t('温度和湿度'),
            t('光照强度与光谱'),
            t('CO₂ 浓度'),
            t('土壤酸碱度')
          ],
          answer: [t('温度和湿度'), t('光照强度与光谱'), t('CO₂ 浓度')],
          explanation: '植物工厂通常采用无土栽培，因此不涉及土壤酸碱度。温度、湿度、光照和 CO₂ 浓度是核心控制参数。',
          points: 2,
        },
        {
          id: 'q3',
          type: 'true_false',
          content: t('植物工厂可以完全不使用土壤进行种植。'),
          answer: 'true',
          explanation: '植物工厂普遍采用水培、气雾培等无土栽培技术，通过营养液直接为植物根系提供养分。',
          points: 1,
        },
        {
          id: 'q4',
          type: 'fill_in_blank',
          content: t('植物工厂通常使用___技术来提供植物所需的营养。'),
          answer: t('水培'),
          explanation: '水培（Hydroponics）是植物工厂最常用的栽培方式，通过营养液循环系统为植物提供所需的水分和矿物质。',
          blanks: 1,
          points: 1,
        },
        {
          id: 'q5',
          type: 'single_choice',
          content: t('LED灯在植物工厂中的主要作用是？'),
          options: [
            t('装饰美观'),
            t('提供光合作用所需的特定光谱'),
            t('加热空气'),
            t('驱赶害虫')
          ],
          answer: t('提供光合作用所需的特定光谱'),
          explanation: 'LED 灯可以精确调节光谱组成（如红光、蓝光比例），为不同生长阶段的植物提供最优光照条件。',
          points: 1,
        },
        {
          id: 'q6',
          type: 'multiple_choice',
          content: t('植物工厂相比传统农业的优势包括哪些？（多选）'),
          options: [
            t('单位面积产量更高'),
            t('可实现农药零使用'),
            t('初始建设成本更低'),
            t('生产周期可精确控制')
          ],
          answer: [t('单位面积产量更高'), t('可实现农药零使用'), t('生产周期可精确控制')],
          explanation: '植物工厂的初始建设成本实际上远高于传统农业，但在产量、食品安全和生产可控性方面具有显著优势。',
          points: 2,
        },
        {
          id: 'q7',
          type: 'fill_in_blank',
          content: t('植物工厂中，红光促进植物___，蓝光促进植物___。'),
          answer: t('开花结果|茎叶生长'),
          blanks: 2,
          explanation: '红光（620-780nm）主要促进植物的开花和结果，蓝光（400-500nm）则有利于茎叶的营养生长。',
          points: 2,
        },
        {
          id: 'q8',
          type: 'single_choice',
          content: t('下列哪种作物最适合在植物工厂中种植？'),
          options: [
            t('小麦'),
            t('生菜'),
            t('苹果树'),
            t('水稻')
          ],
          answer: t('生菜'),
          explanation: '叶菜类（如生菜）生长周期短、株型小、对光照需求适中，是植物工厂中最常见也最经济的种植品种。',
          points: 1,
        },
      ],
      passScore: 60,
      generatedAt: new Date(Date.now() - 1000 * 60 * 10),
    },
    {
      id: 'gen_task_2',
      type: 'assignment' as const,
      title: t('AI生成：学习反思'),
      status: 'optional' as const,
      teacherHint: t('请结合今天学习的内容，思考以下问题：\n1. 你学到了哪些新知识？\n2. 哪些概念你还不太理解？\n3. 你打算如何应用这些知识？'),
      wordLimit: { min: 200, max: 500 },
      generatedAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  ];

  // Mock 对话数据 - 模拟从自由探索到 AI 引导的完整流程
  const MOCK_SELF_DIRECTED_MESSAGES: ChatMessage[] = [
    // 1. AI 欢迎（待命风格）
    {
      id: 'mock_sd_1',
      role: 'assistant',
      content: `${t('你好！👋 欢迎来到「')}${config.title}${t('」的学习空间！')}\n\n${t('我是你的AI学习助手，在这里我会**待命**，等你有问题时随时帮助你。')}\n\n📚 **${t('学习建议')}**：\n1. ${t('左侧是你的学习资料，可以自由浏览')}\n2. ${t('有任何疑问随时在这里问我')}\n3. ${t('右侧可以记录你的学习笔记')}\n\n${t('开始你的探索之旅吧！有什么想了解的？')}`,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    // 2. 用户问"植物工厂是什么？"
    {
      id: 'mock_sd_2',
      role: 'user',
      content: t('植物工厂是什么？跟普通温室有什么区别？'),
      timestamp: new Date(Date.now() - 1000 * 60 * 28),
    },
    // 3. AI 解释 + 资源引用
    {
      id: 'mock_sd_3',
      role: 'assistant',
      content: `${t('好问题！让我来帮你梳理一下。')}\n\n**${t('植物工厂')}** ${t('是一种完全封闭的室内农业系统，通过人工精确控制光照、温度、湿度、CO₂浓度和营养液等环境因素，实现作物的高效生产。')}\n\n| ${t('对比维度')} | ${t('植物工厂')} | ${t('普通温室')} |\n|---------|---------|--------|\n| ${t('环境控制')} | ${t('完全人工控制')} | ${t('半自然+辅助调控')} |\n| ${t('光源')} | LED${t('人工光')} | ${t('自然光为主')} |\n| ${t('种植方式')} | ${t('水培/气雾培')} | ${t('土培为主')} |\n| ${t('产量')} | ${t('极高（多层立体）')} | ${t('中等')} |\n| ${t('能耗')} | ${t('较高')} | ${t('较低')} |\n\n${t('简单来说，植物工厂就像是给植物建了一个"太空舱"，一切条件都可以精确调控。')}`,
      timestamp: new Date(Date.now() - 1000 * 60 * 27),
      messageType: 'resource_reference',
      resourceRef: {
        resourceId: 'res_1',
        resourceTitle: t('认识植物工厂学生手册'),
        excerpt: t('第一章：植物工厂概述与发展历程'),
      },
    },
    // 4. 用户追问水培
    {
      id: 'mock_sd_4',
      role: 'user',
      content: t('水培技术听起来很有意思，植物没有土壤怎么活？'),
      timestamp: new Date(Date.now() - 1000 * 60 * 22),
    },
    // 5. AI 解释水培原理 + 资源引用
    {
      id: 'mock_sd_5',
      role: 'assistant',
      content: `${t('这个问题问得好！其实植物需要的不是"土壤"本身，而是土壤中的**水分**和**矿物质营养**。')}\n\n🌱 **${t('水培的核心原理')}**：\n\n${t('把植物需要的营养元素（氮、磷、钾、钙等16种必需元素）溶解在水中，配制成**营养液**，直接供给植物根系。')}\n\n**${t('三种常见水培方式')}**：\n1. **NFT（${t('薄膜技术')}）**：${t('营养液像薄膜一样流过根系')}\n2. **DFT（${t('深液流技术')}）**：${t('根系浸泡在营养液中')}\n3. **${t('气雾培')}**：${t('将营养液雾化喷洒到根系上')}\n\n${t('水培植物的根系通常更发达、更白净，因为它们可以直接高效地吸收养分。')}`,
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      messageType: 'resource_reference',
      resourceRef: {
        resourceId: 'res_2',
        resourceTitle: t('水培植物工厂学生手册'),
        excerpt: t('第三章：无土栽培技术详解'),
      },
    },
    // 6. 用户追问营养液
    {
      id: 'mock_sd_6',
      role: 'user',
      content: t('那营养液的配方是怎么确定的？'),
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
  ];

  const MOCK_AI_GUIDED_EXTRA_MESSAGES: ChatMessage[] = [
    // 7. 模式切换卡片
    {
      id: 'mock_ag_7',
      role: 'assistant',
      content: t('好的，让我来带你学习！我会根据你之前的探索情况，从当前进度继续引导。'),
      timestamp: new Date(Date.now() - 1000 * 60 * 14),
      messageType: 'mode_transition',
      modeTransition: {
        fromMode: 'self_directed',
        toMode: 'ai_guided',
      },
    },
    // 8. AI 总结已学内容 + 学习路径
    {
      id: 'mock_ag_8',
      role: 'assistant',
      content: `📊 **${t('学习进度总结')}**\n\n${t('根据你刚才的探索，你已经涉及了以下知识点：')}\n- ✅ ${t('植物工厂的基本概念与定义')}\n- ✅ ${t('植物工厂 vs 传统温室的区别')}\n- ✅ ${t('水培技术的基本原理')}\n\n🗺️ **${t('接下来的学习路径')}**：\n1. 📍 ${t('核心原理解析')}（LED${t('光谱控制')}）← ${t('当前')}\n2. ⬜ ${t('关键公式与推导')}\n3. ⬜ ${t('典型例题分析')}\n4. ⬜ ${t('综合应用与拓展')}\n\n${t('让我们从 LED 光谱控制开始吧！')}`,
      timestamp: new Date(Date.now() - 1000 * 60 * 13),
    },
    // 9. AI 教知识点
    {
      id: 'mock_ag_9',
      role: 'assistant',
      content: `📍 **${t('核心原理解析：LED 光谱控制')}**\n\n${t('在植物工厂中，LED 灯不只是"照亮"植物，而是通过精确控制**光谱组成**来调控植物生长。')}\n\n🔴 **${t('红光')}（620-780nm）**：${t('促进开花结果、茎伸长')}\n🔵 **${t('蓝光')}（400-500nm）**：${t('促进叶片生长、气孔开放')}\n🟢 **${t('绿光')}（500-565nm）**：${t('穿透冠层，促进下层叶片光合作用')}\n\n💡 **${t('关键概念')}**：\n${t('不同生长阶段需要不同的红蓝光比例：')}\n- ${t('育苗期')}：${t('红:蓝 = 1:1（促进健壮生长）')}\n- ${t('营养生长期')}：${t('红:蓝 = 3:1（促进叶片扩展）')}\n- ${t('开花结果期')}：${t('红:蓝 = 5:1（促进开花）')}\n\n${t('理解了吗？让我来检查一下你的掌握情况。')}`,
      timestamp: new Date(Date.now() - 1000 * 60 * 11),
    },
    // 10. 知识检查点（已答对）
    {
      id: 'mock_ag_10',
      role: 'assistant',
      content: '',
      timestamp: new Date(Date.now() - 1000 * 60 * 9),
      messageType: 'knowledge_checkpoint',
      checkpoint: {
        question: t('在植物工厂中，哪种光谱主要促进植物的叶片生长和气孔开放？'),
        options: [t('红光（620-780nm）'), t('蓝光（400-500nm）'), t('绿光（500-565nm）'), t('紫外光（<400nm）')],
        correctAnswer: t('蓝光（400-500nm）'),
        userAnswer: t('蓝光（400-500nm）'),
        status: 'correct',
        explanation: t('蓝光（400-500nm）主要促进叶片的营养生长和气孔开放，是植物营养生长阶段的关键光谱。'),
        relatedNodeId: 'node_2',
      },
    },
    // 11. 主题过渡卡片
    {
      id: 'mock_ag_11',
      role: 'assistant',
      content: '',
      timestamp: new Date(Date.now() - 1000 * 60 * 7),
      messageType: 'topic_transition',
      transition: {
        fromTopic: t('核心原理解析'),
        toTopic: t('关键公式与推导'),
        fromNodeId: 'node_2',
        toNodeId: 'node_3',
        summary: t('你已经掌握了 LED 光谱控制的基本原理，包括红蓝绿光的作用和不同生长阶段的配比。'),
      },
    },
    // 12. 待回答的检查点
    {
      id: 'mock_ag_12',
      role: 'assistant',
      content: '',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      messageType: 'knowledge_checkpoint',
      checkpoint: {
        question: t('植物工厂中，营养液的 EC 值（电导率）主要反映了什么？'),
        options: [t('营养液的温度'), t('营养液中离子的总浓度'), t('营养液的酸碱度'), t('营养液的溶氧量')],
        correctAnswer: t('营养液中离子的总浓度'),
        status: 'pending',
        explanation: t('EC 值（Electrical Conductivity）即电导率，反映的是营养液中溶解离子的总浓度。EC 值越高，说明营养液中的矿物质含量越多。'),
        relatedNodeId: 'node_3',
      },
    },
  ];

  // 布局状态
  const [leftWidth, setLeftWidth] = useState(25);
  const [rightWidth, setRightWidth] = useState(25);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // 折叠宽度（像素）- 参考 NotebookLM 的设计
  const COLLAPSED_WIDTH = 72;

  // 聊天状态
  const [messages, setMessages] = usePersistedState<ChatMessage[]>(`self-study:wb:${config.id}:messages`, []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [flashingToolId, setFlashingToolId] = useState<string | null>(null);
  const [flashingButtonId, setFlashingButtonId] = useState<string | null>(null);
  const [generatingButtonId, setGeneratingButtonId] = useState<string | null>(null);

  // 任务交互状态
  const [expandedTask, setExpandedTask] = useState<Task | null>(null);
  const [taskDisplayMode, setTaskDisplayMode] = useState<'fullscreen' | 'embedded' | 'result_review'>('fullscreen');
  const [taskStatus, setTaskStatus] = useState<'idle' | 'submitting' | 'grading' | 'completed'>('idle');
  const [quickResult, setQuickResult] = useState<{
    allCorrect: boolean;
    correctCount: number;
    totalCount: number;
    details: any[];
  } | null>(null);
  const [completedTasksArray, setCompletedTasksArray] = usePersistedState<string[]>(`self-study:wb:${config.id}:completedTasks`, []);
  const completedTasks = new Set(completedTasksArray);
  const setCompletedTasks = (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    if (typeof updater === 'function') {
      setCompletedTasksArray(prev => [...updater(new Set(prev))]);
    } else {
      setCompletedTasksArray([...updater]);
    }
  };

  // 计时器状态
  const [elapsedTime, setElapsedTime] = usePersistedState<number>(`self-study:wb:${config.id}:elapsedTime`, 0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 右侧面板标签 - AI引导模式默认显示学习状态
  const [rightTab, setRightTab] = useState<'workspace' | 'status'>(
    config.learningMode === 'ai_guided' ? 'status' : 'workspace'
  );

  // 学习路径状态
  const [learningPath, setLearningPath] = usePersistedState<LearningPathNode[]>(`self-study:wb:${config.id}:learningPath`, MOCK_LEARNING_PATH);
  const [currentNodeId, setCurrentNodeId] = usePersistedState<string>(`self-study:wb:${config.id}:currentNodeId`, MOCK_CURRENT_NODE);

  // 设置弹窗
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 发布弹窗
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // 文件上传弹窗
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);

  // 链接输入弹窗
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);

  // 资源库导入弹窗
  const [showKnowledgeBaseModal, setShowKnowledgeBaseModal] = useState(false);

  // 试卷检测状态
  const [examDetectedFiles, setExamDetectedFiles] = useState<File[] | null>(null);
  const [examProcessingStep, setExamProcessingStep] = useState<ExamProcessingStep | null>(null);
  const [examProcessingTaskId, setExamProcessingTaskId] = useState<string | null>(null);

  // 响应来自 page.tsx 的外部试卷文件（新建空间时上传）
  useEffect(() => {
    if (pendingExamFiles && pendingExamFiles.length > 0) {
      setExamDetectedFiles(pendingExamFiles);
    }
  }, [pendingExamFiles]);

  // 任务/资源设置弹窗
  const [settingsTaskId, setSettingsTaskId] = useState<string | null>(null);
  const [settingsResourceId, setSettingsResourceId] = useState<string | null>(null);

  // 空间名称编辑状态
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(config.title);

  // 笔记信息配置弹窗
  const [showNoteInfoModal, setShowNoteInfoModal] = useState(false);

  // 资源和任务选中状态
  const [selectedResourceIds, setSelectedResourceIds] = useState<Set<string>>(new Set());
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  const toggleResourceSelection = (id: string) => {
    setSelectedResourceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllResources = () => {
    const allIds = [...config.resources.map(r => r.id), ...aiGeneratedResources.map(r => r.id), ...MOCK_AI_RESOURCES.map(r => r.id)];
    setSelectedResourceIds(prev => prev.size === allIds.length ? new Set() : new Set(allIds));
  };

  const toggleAllTasks = () => {
    const allIds = generatedTasks.map(t => t.id);
    setSelectedTaskIds(prev => prev.size === allIds.length ? new Set() : new Set(allIds));
  };

  // 面板折叠状态
  const [collapsedPanels, setCollapsedPanels] = useState<Record<string, boolean>>({
    sources: false,
    tasks: true, // 初始收起
    aiResources: false,
    learningPath: false,
    studio: false,
  });

  // 生成的任务列表（初始为空）
  const [generatedTasks, setGeneratedTasks] = usePersistedState<typeof MOCK_GENERATED_TASKS>(`self-study:wb:${config.id}:generatedTasks`, []);
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);
  const [isReflectionDismissed, setIsReflectionDismissed] = useState(false);

  // 学生模式：自动打开第一个未完成的 quiz
  useEffect(() => {
    if (mode === 'student' && generatedTasks.length > 0 && !expandedTask) {
      const firstIncompleteQuiz = generatedTasks.find(
        task => task.type === 'quiz' && !completedTasks.has(task.id)
      );
      if (firstIncompleteQuiz) {
        setExpandedTask(firstIncompleteQuiz as any);
        setTaskDisplayMode('fullscreen');
      }
    }
  }, [mode, generatedTasks, completedTasks, expandedTask]);

  // 任务编辑弹窗
  const [editingTask, setEditingTask] = useState<typeof MOCK_GENERATED_TASKS[0] | null>(null);

  // AI生成的资源列表
  const [aiGeneratedResources, setAiGeneratedResources] = usePersistedState<Array<{
    id: string;
    title: string;
    type: 'ai_generated';
    icon: string;
    status: 'ready' | 'generating';
    generatedAt: Date;
    toolId: string;
    interactiveCategory?: 'animation' | 'visualization' | 'simulation' | 'test';
    url?: string;
  }>>(`self-study:wb:${config.id}:aiGeneratedResources`, []);

  // Studio工具配置弹窗
  const [studioConfigModal, setStudioConfigModal] = useState<{
    isOpen: boolean;
    toolId: string | null;
  }>({ isOpen: false, toolId: null });

  // 正在生成的工具ID
  const [generatingToolId, setGeneratingToolId] = useState<string | null>(null);

  // 互动资源查看器
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);

  // 左侧面板内联查看的资源
  const [inlineViewingResource, setInlineViewingResource] = useState<InlineViewResource | null>(null);

  // 统一的资源点击处理
  const handleResourceClick = (resource: Resource | typeof aiGeneratedResources[0]) => {
    const hasUrl = 'url' in resource && !!resource.url;
    const isInteractive = (resource.type === 'interactive' || resource.type === 'ai_generated') && hasUrl &&
      ('interactiveCategory' in resource && !!resource.interactiveCategory);

    const viewResource: InlineViewResource = {
      id: resource.id,
      title: resource.title,
      type: resource.type,
      url: 'url' in resource ? resource.url : undefined,
      interactiveCategory: 'interactiveCategory' in resource ? resource.interactiveCategory as InlineViewResource['interactiveCategory'] : undefined,
      description: 'description' in resource ? resource.description : undefined,
      textContent: 'textContent' in resource ? resource.textContent : undefined,
      icon: 'icon' in resource ? resource.icon : undefined,
      toolId: 'toolId' in resource ? resource.toolId : undefined,
    };

    setInlineViewingResource(viewResource);

    if (isInteractive) {
      // H5 资源默认全屏打开
      setViewingResource({
        id: resource.id,
        title: resource.title,
        type: 'interactive',
        description: 'description' in resource ? (resource.description || '') : '',
        url: 'url' in resource ? resource.url : undefined,
        interactiveCategory: 'interactiveCategory' in resource ? resource.interactiveCategory as Resource['interactiveCategory'] : undefined,
      });
    }
  };

  // 生成测试任务
  const handleGenerateTest = () => {
    setIsGeneratingTask(true);
    // 模拟生成过程
    setTimeout(() => {
      setGeneratedTasks(MOCK_GENERATED_TASKS);
      setCollapsedPanels(prev => ({ ...prev, tasks: false })); // 展开任务区域
      setIsGeneratingTask(false);
    }, 1500);
  };

  // 处理Studio工具点击
  const handleStudioToolClick = (tool: typeof STUDIO_TOOLS[0]) => {
    if (tool.type === 'resource') {
      // 生成资源
      setGeneratingToolId(tool.id);

      // 模拟生成过程
      setTimeout(() => {
        const newResource = {
          id: `ai_res_${Date.now()}`,
          title: `🤖 ${t('AI生成')}：${tool.label}`,
          type: 'ai_generated' as const,
          icon: tool.icon,
          status: 'ready' as const,
          generatedAt: new Date(),
          toolId: tool.id,
        };

        setAiGeneratedResources(prev => [newResource, ...prev]);
        setGeneratingToolId(null);

        // 展开资源区域（如果是折叠的）
        if (config.learningMode === 'ai_guided') {
          setCollapsedPanels(prev => ({ ...prev, aiResources: false }));
        } else {
          setCollapsedPanels(prev => ({ ...prev, sources: false }));
        }
      }, 2000);
    } else if (tool.type === 'task') {
      // 生成任务
      setGeneratingToolId(tool.id);

      setTimeout(() => {
        // 特殊处理：生成变种题
        if (tool.id === 'generate_variant_question') {
          const variantTask = {
            id: `gen_task_${Date.now()}`,
            type: 'quiz' as const,
            title: `🔄 ${t('变种练习题')}`,
            status: 'optional' as const,
            questionCount: 3,
            questions: [
              {
                id: `q_${Date.now()}_1`,
                type: 'single_choice',
                content: t('【变种题】这是基于你的错题生成的变种练习，考查相同知识点但换了不同角度。'),
                options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')],
                answer: t('选项B'),
                explanation: t('这道变种题从另一个角度考查了相同的知识点，帮助你更全面地理解。'),
                points: 1,
              },
              {
                id: `q_${Date.now()}_2`,
                type: 'single_choice',
                content: t('【变种题】继续巩固这个知识点，这次从应用场景出发。'),
                options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')],
                answer: t('选项C'),
                explanation: t('通过实际应用场景，你可以更好地理解这个概念。'),
                points: 1,
              },
              {
                id: `q_${Date.now()}_3`,
                type: 'true_false',
                content: t('【变种题】判断题形式，检验你对核心概念的理解是否准确。'),
                options: [t('正确'), t('错误')],
                answer: t('正确'),
                explanation: t('这个判断帮助你明确概念的边界和适用范围。'),
                points: 1,
              },
            ],
            passScore: 60,
            generatedAt: new Date(),
          };
          setGeneratedTasks(prev => [variantTask, ...prev]);
          setGeneratingToolId(null);
          setCollapsedPanels(prev => ({ ...prev, tasks: false }));

          // 发送确认消息
          const confirmMsg: ChatMessage = {
            id: `msg_variant_${Date.now()}`,
            role: 'assistant',
            content: `✅ **变种练习题已生成**\n\n我为你生成了 3 道变种练习题，它们：\n- 考查相同的知识点\n- 从不同角度出题\n- 帮助你全面掌握这个概念\n\n点击左侧任务列表中的「🔄 变种练习题」开始练习吧！`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, confirmMsg]);
        } else {
          // 普通任务生成
          const newTask = {
            id: `gen_task_${Date.now()}`,
            type: 'quiz' as const,
            title: `🤖 ${t('AI生成')}：${tool.label}`,
            status: 'optional' as const,
            questionCount: 3,
            questions: [
              {
                id: `q_${Date.now()}_1`,
                type: 'single_choice',
                content: t('这是一道AI生成的示例题目，请选择正确答案。'),
                options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')],
                answer: t('选项A'),
                explanation: t('选项A是正确答案。'),
                points: 1,
              },
              {
                id: `q_${Date.now()}_2`,
                type: 'true_false',
                content: t('这是一道判断题示例。'),
                answer: 'true',
                explanation: t('该说法是正确的。'),
                points: 1,
              },
              {
                id: `q_${Date.now()}_3`,
                type: 'fill_in_blank',
                content: t('这是一道填空题示例，请填写___。'),
                answer: t('答案'),
                blanks: 1,
                explanation: t('正确答案是"答案"。'),
                points: 1,
              },
            ],
            passScore: 60,
            generatedAt: new Date(),
          };

          setGeneratedTasks(prev => [newTask, ...prev]);
          setGeneratingToolId(null);
          setCollapsedPanels(prev => ({ ...prev, tasks: false })); // 展开任务区域
        }
      }, 2000);
    } else if (tool.type === 'interactive') {
      // 生成互动资源
      setGeneratingToolId(tool.id);

      const categoryMap: Record<string, 'animation' | 'visualization' | 'simulation' | 'test'> = {
        interactive_animation: 'animation',
        interactive_visualization: 'visualization',
        interactive_simulation: 'simulation',
        interactive_test: 'test',
      };

      const urlMap: Record<string, string> = {
        interactive_animation: '/mock-h5/animation.html',
        interactive_visualization: '/mock-h5/visualization.html',
        interactive_simulation: '/mock-h5/simulation.html',
        interactive_test: '/mock-h5/test.html',
      };

      setTimeout(() => {
        const newResource = {
          id: `ai_res_${Date.now()}`,
          title: `🤖 ${t('AI生成')}：${tool.label}`,
          type: 'ai_generated' as const,
          icon: tool.icon,
          status: 'ready' as const,
          generatedAt: new Date(),
          toolId: tool.id,
          interactiveCategory: categoryMap[tool.id],
          url: urlMap[tool.id] || '/mock-h5/animation.html',
        };

        setAiGeneratedResources(prev => [newResource, ...prev]);
        setGeneratingToolId(null);

        if (config.learningMode === 'ai_guided') {
          setCollapsedPanels(prev => ({ ...prev, aiResources: false }));
        } else {
          setCollapsedPanels(prev => ({ ...prev, sources: false }));
        }
      }, 2000);
    }
  };

  // 打开工具配置弹窗
  const handleOpenToolConfig = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudioConfigModal({ isOpen: true, toolId });
  };

  const togglePanel = (panelId: string) => {
    setCollapsedPanels(prev => ({ ...prev, [panelId]: !prev[panelId] }));
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 计时器管理
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  // 初始化欢迎消息 - 改为空白引导状态
  useEffect(() => {
    if (messages.length > 0) return; // already have persisted messages

    // 设置开场引导消息，带推荐回复和功能按钮
    setMessages([{
      id: 'welcome-guide',
      role: 'assistant',
      content: '你好！我是你的学习助手 🤖\n\n我可以帮你：\n\n📄 **分析学习资料** - 上传文件或从知识库导入\n💬 **解答疑问** - 直接向我提问任何学习问题\n🎯 **生成学习内容** - 使用右侧 Studio 工具生成思维导图、测试题等\n\n准备好开始学习了吗？',
      timestamp: new Date(),
      suggestions: {
        quickReplies: [
          { id: 'start_learning', label: '开始学习' },
          { id: 'upload_material', label: '我想上传资料' },
          { id: 'ask_question', label: '我有问题' }
        ],
        actionButtons: [
          { id: 'mind_map', label: '生成思维导图', iconName: 'Workflow', studioToolId: 'mind_map' },
          { id: 'quiz', label: '生成知识测验', iconName: 'TestTube2', studioToolId: 'quiz' },
          { id: 'flashcards', label: '生成记忆卡片', iconName: 'CreditCard', studioToolId: 'flashcards' }
        ]
      }
    }]);
  }, []);

  // 学习模式切换时自动切换右侧标签
  useEffect(() => {
    if (config.learningMode === 'ai_guided') {
      setRightTab('status');
    } else {
      setRightTab('workspace');
    }
  }, [config.learningMode]);

  // 监听 isAIGenerating 变化，自动展开任务面板并填充数据
  useEffect(() => {
    if (isAIGenerating && generatedTasks.length === 0) {
      // 立即展开任务面板
      setCollapsedPanels(prev => ({ ...prev, tasks: false }));
      setIsGeneratingTask(true);

      // 模拟AI生成过程，延迟后填充mock数据
      const timer = setTimeout(() => {
        setGeneratedTasks(MOCK_GENERATED_TASKS);
        setIsGeneratingTask(false);
      }, 2000); // 2秒后完成生成

      return () => clearTimeout(timer);
    }
  }, [isAIGenerating, generatedTasks.length]);

  // 快速回复处理函数
  const handleQuickReply = (messageText: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // 模拟 AI 回复（与 handleSendMessage 中的逻辑相同）
    const userInput = messageText.toLowerCase();
    setTimeout(() => {
      let aiContent = '';

      if (config.learningMode === 'self_directed') {
        if (userInput.includes('搜索') || userInput.includes('概念')) {
          aiContent = `🔍 **${t('概念解析')}**\n\n${t('让我帮你搜索相关概念...')}\n\n${t('根据知识库检索，这个概念的核心要点是：')}\n\n1. **${t('定义')}**：...\n2. **${t('特征')}**：...\n3. **${t('应用场景')}**：...\n\n${t('你想深入了解哪个方面？')}`;
        } else if (userInput.includes('总结') || userInput.includes('要点')) {
          aiContent = `📋 **${t('要点总结')}**\n\n${t('根据你目前的学习内容，我来帮你梳理关键要点：')}\n\n**${t('核心概念')}**\n- ${t('要点一：...')}\n- ${t('要点二：...')}\n\n**${t('重要公式')}**\n- ${t('公式一：...')}\n\n**${t('常见误区')}**\n- ${t('注意事项：...')}\n\n${t('需要我详细解释某个要点吗？')}`;
        } else if (userInput.includes('例子') || userInput.includes('举例')) {
          aiContent = `💡 **${t('实例说明')}**\n\n${t('让我用一个生活中的例子来解释：')}\n\n${t('想象一下...')}\n\n${t('这就像是...')}\n\n${t('通过这个例子，你能理解核心原理了吗？')}`;
        } else {
          aiContent = `${t('这是一个很好的问题！让我来帮你解答...')}\n\n${t('根据你的问题，我认为关键点在于：')}\n\n1. **${t('首先')}**，${t('我们需要理解...')}\n2. **${t('其次')}**，${t('要注意...')}\n3. **${t('最后')}**，${t('可以这样应用...')}\n\n${t('你还有其他想了解的吗？')}`;
        }
        const userMsgCount = messages.filter(m => m.role === 'user').length + 1;
        if (userMsgCount % 4 === 0 && userMsgCount >= 4) {
          aiContent += `\n\n---\n💡 ${t('顺便说一下，根据你的提问，你已经涉及了')} ${masteredCount}/${totalNodes} ${t('个核心知识点。想看看完整的学习路径吗？')}`;
        }
      } else {
        if (userInput.includes('考考') || userInput.includes('测试')) {
          aiContent = `🧪 **${t('知识检测')}**\n\n${t('好的，让我来考考你！')}\n\n**${t('问题')}**：${t('关于「')}${learningPath.find(n => n.id === currentNodeId)?.title}${t('」，请回答：')}\n\n${t('这个概念的核心定义是什么？它与前面学过的内容有什么联系？')}\n\n💭 *${t('提示：可以结合之前学习的基础概念来思考')}*`;
        } else if (userInput.includes('下一') || userInput.includes('继续')) {
          aiContent = `⏭️ **${t('进入下一知识点')}**\n\n${t('很好！你已经掌握了当前内容。')}\n\n📍 ${t('正在为你准备下一个知识点：「')}${learningPath.find(n => n.status === 'pending')?.title || t('综合应用')}${t('」')}\n\n🔄 *${t('正在从知识库加载相关资源...')}*\n\n${t('准备好了吗？让我们开始吧！')}`;
        } else if (userInput.includes('路径') || userInput.includes('进度')) {
          const mastered = learningPath.filter(n => n.status === 'mastered').length;
          aiContent = `🗺️ **${t('学习路径概览')}**\n\n**${t('当前进度')}**：${mastered}/${learningPath.length} ${t('个知识点已掌握')}\n\n**${t('学习路径')}**：\n${learningPath.map((n, i) => `${n.status === 'mastered' ? '✅' : n.id === currentNodeId ? '📍' : '⬜'} ${i + 1}. ${n.title}`).join('\n')}\n\n${t('继续加油！你已经完成了')} ${Math.round((mastered / learningPath.length) * 100)}%`;
        } else if (userInput.includes('提示') || userInput.includes('帮助')) {
          aiContent = `💡 **${t('学习提示')}**\n\n${t('关于「')}${learningPath.find(n => n.id === currentNodeId)?.title}${t('」，这里有一些提示：')}\n\n1. 🔑 **${t('关键词')}**：${t('注意理解核心术语的含义')}\n2. 🔗 **${t('联系')}**：${t('思考与前面知识点的关联')}\n3. 📝 **${t('练习')}**：${t('尝试用自己的话复述')}\n\n${t('需要更具体的帮助吗？')}`;
        } else {
          aiContent = `${t('很好的思考！👍')}\n\n${t('让我来引导你深入理解这个概念...')}\n\n**${t('关键点')}**：\n1. ${t('首先，我们需要明确...')}\n2. ${t('其次，要理解...')}\n3. ${t('最后，可以这样应用...')}\n\n🎯 **${t('小测验')}**：${t('现在，你能用自己的话解释一下吗？这样我可以确认你是否理解了。')}`;
        }
      }

      const aiReply: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiReply]);
      setIsLoading(false);
    }, 1200);
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = inputMessage.toLowerCase();
    setInputMessage('');
    setIsLoading(true);

    // 模拟 AI 回复 - 根据模式和输入内容生成不同回复
    setTimeout(() => {
      let aiContent = '';

      if (config.learningMode === 'self_directed') {
        // 自由探索模式的回复
        if (userInput.includes('搜索') || userInput.includes('概念')) {
          aiContent = `🔍 **${t('概念解析')}**\n\n${t('让我帮你搜索相关概念...')}\n\n${t('根据知识库检索，这个概念的核心要点是：')}\n\n1. **${t('定义')}**：...\n2. **${t('特征')}**：...\n3. **${t('应用场景')}**：...\n\n${t('你想深入了解哪个方面？')}`;
        } else if (userInput.includes('总结') || userInput.includes('要点')) {
          aiContent = `📋 **${t('要点总结')}**\n\n${t('根据你目前的学习内容，我来帮你梳理关键要点：')}\n\n**${t('核心概念')}**\n- ${t('要点一：...')}\n- ${t('要点二：...')}\n\n**${t('重要公式')}**\n- ${t('公式一：...')}\n\n**${t('常见误区')}**\n- ${t('注意事项：...')}\n\n${t('需要我详细解释某个要点吗？')}`;
        } else if (userInput.includes('例子') || userInput.includes('举例')) {
          aiContent = `💡 **${t('实例说明')}**\n\n${t('让我用一个生活中的例子来解释：')}\n\n${t('想象一下...')}\n\n${t('这就像是...')}\n\n${t('通过这个例子，你能理解核心原理了吗？')}`;
        } else {
          aiContent = `${t('这是一个很好的问题！让我来帮你解答...')}\n\n${t('根据你的问题，我认为关键点在于：')}\n\n1. **${t('首先')}**，${t('我们需要理解...')}\n2. **${t('其次')}**，${t('要注意...')}\n3. **${t('最后')}**，${t('可以这样应用...')}\n\n${t('你还有其他想了解的吗？')}`;
        }
        // 自由探索模式隐性追踪：对话达到一定轮数时偶尔提醒进度
        const userMsgCount = messages.filter(m => m.role === 'user').length + 1;
        if (userMsgCount % 4 === 0 && userMsgCount >= 4) {
          aiContent += `\n\n---\n💡 ${t('顺便说一下，根据你的提问，你已经涉及了')} ${masteredCount}/${totalNodes} ${t('个核心知识点。想看看完整的学习路径吗？')}`;
        }
      } else {
        // 目标导向模式的回复
        if (userInput.includes('考考') || userInput.includes('测试')) {
          aiContent = `🧪 **${t('知识检测')}**\n\n${t('好的，让我来考考你！')}\n\n**${t('问题')}**：${t('关于「')}${learningPath.find(n => n.id === currentNodeId)?.title}${t('」，请回答：')}\n\n${t('这个概念的核心定义是什么？它与前面学过的内容有什么联系？')}\n\n💭 *${t('提示：可以结合之前学习的基础概念来思考')}*`;
        } else if (userInput.includes('下一') || userInput.includes('继续')) {
          aiContent = `⏭️ **${t('进入下一知识点')}**\n\n${t('很好！你已经掌握了当前内容。')}\n\n📍 ${t('正在为你准备下一个知识点：「')}${learningPath.find(n => n.status === 'pending')?.title || t('综合应用')}${t('」')}\n\n🔄 *${t('正在从知识库加载相关资源...')}*\n\n${t('准备好了吗？让我们开始吧！')}`;
        } else if (userInput.includes('路径') || userInput.includes('进度')) {
          const mastered = learningPath.filter(n => n.status === 'mastered').length;
          aiContent = `🗺️ **${t('学习路径概览')}**\n\n**${t('当前进度')}**：${mastered}/${learningPath.length} ${t('个知识点已掌握')}\n\n**${t('学习路径')}**：\n${learningPath.map((n, i) => `${n.status === 'mastered' ? '✅' : n.id === currentNodeId ? '📍' : '⬜'} ${i + 1}. ${n.title}`).join('\n')}\n\n${t('继续加油！你已经完成了')} ${Math.round((mastered / learningPath.length) * 100)}%`;
        } else if (userInput.includes('提示') || userInput.includes('帮助')) {
          aiContent = `💡 **${t('学习提示')}**\n\n${t('关于「')}${learningPath.find(n => n.id === currentNodeId)?.title}${t('」，这里有一些提示：')}\n\n1. 🔑 **${t('关键词')}**：${t('注意理解核心术语的含义')}\n2. 🔗 **${t('联系')}**：${t('思考与前面知识点的关联')}\n3. 📝 **${t('练习')}**：${t('尝试用自己的话复述')}\n\n${t('需要更具体的帮助吗？')}`;
        } else {
          aiContent = `${t('很好的思考！👍')}\n\n${t('让我来引导你深入理解这个概念...')}\n\n**${t('关键点')}**：\n1. ${t('首先，我们需要明确...')}\n2. ${t('其次，要理解...')}\n3. ${t('最后，可以这样应用...')}\n\n🎯 **${t('小测验')}**：${t('现在，你能用自己的话解释一下吗？这样我可以确认你是否理解了。')}`;
        }
      }

      // 根据对话内容生成推荐回复和功能按钮
      let suggestions: ChatMessage['suggestions'] = undefined;

      if (config.learningMode === 'self_directed') {
        // 自由探索模式的建议
        if (userInput.includes('搜索') || userInput.includes('概念')) {
          suggestions = {
            quickReplies: [
              { id: 'more_detail', label: t('再详细一点') },
              { id: 'example', label: t('举个例子') },
              { id: 'related', label: t('相关概念') }
            ],
            actionButtons: [
              { id: 'mind_map', label: t('生成思维导图'), iconName: 'Workflow', studioToolId: 'mind_map' },
              { id: 'flashcards', label: t('生成记忆卡片'), iconName: 'CreditCard', studioToolId: 'flashcards' }
            ]
          };
        } else if (userInput.includes('总结') || userInput.includes('要点')) {
          suggestions = {
            quickReplies: [
              { id: 'quiz_me', label: t('考考我') },
              { id: 'continue', label: t('继续学习') }
            ],
            actionButtons: [
              { id: 'quiz', label: t('基于要点生成测试'), iconName: 'TestTube2', studioToolId: 'quiz' },
              { id: 'mind_map', label: t('生成思维导图'), iconName: 'Workflow', studioToolId: 'mind_map' }
            ]
          };
        } else if (userInput.includes('例子') || userInput.includes('举例')) {
          suggestions = {
            quickReplies: [
              { id: 'more_examples', label: t('更多例子') },
              { id: 'practice', label: t('我来试试') }
            ],
            actionButtons: [
              { id: 'animation', label: t('生成讲解动画'), iconName: 'Film', studioToolId: 'interactive_animation' }
            ]
          };
        } else {
          suggestions = {
            quickReplies: [
              { id: 'quiz_me', label: t('考考我') },
              { id: 'explain_more', label: t('再解释一下') },
              { id: 'example', label: t('举个例子') }
            ]
          };
        }
      } else {
        // AI引导模式的建议
        if (userInput.includes('考考') || userInput.includes('测试')) {
          suggestions = {
            quickReplies: [
              { id: 'more_quiz', label: t('考考我更多') },
              { id: 'hint', label: t('给我提示') }
            ],
            actionButtons: [
              { id: 'quiz', label: t('生成正式测试'), iconName: 'TestTube2', studioToolId: 'quiz' }
            ]
          };
        } else if (userInput.includes('下一') || userInput.includes('继续')) {
          suggestions = {
            quickReplies: [
              { id: 'ready', label: t('准备好了') },
              { id: 'review', label: t('先复习一下') }
            ]
          };
        } else if (userInput.includes('路径') || userInput.includes('进度')) {
          suggestions = {
            quickReplies: [
              { id: 'continue', label: t('继续学习') },
              { id: 'review', label: t('复习已学内容') }
            ],
            actionButtons: [
              { id: 'summary', label: t('生成学习报告'), iconName: 'BarChart3', studioToolId: 'summary' }
            ]
          };
        } else {
          suggestions = {
            quickReplies: [
              { id: 'quiz_me', label: t('考考我') },
              { id: 'next', label: t('下一知识点') },
              { id: 'hint', label: t('给我提示') }
            ]
          };
        }
      }

      const aiReply: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
        suggestions,
      };
      setMessages((prev) => [...prev, aiReply]);
      setIsLoading(false);
    }, 1200);
  };

  // 处理聊天功能按钮点击
  const handleChatAction = (studioToolId: string, buttonId?: string) => {
    const tool = STUDIO_TOOLS.find(t => t.id === studioToolId);
    if (tool) {
      if (buttonId) {
        setGeneratingButtonId(buttonId);
      }
      handleStudioToolClick(tool);
      setFlashingToolId(studioToolId);
      if (buttonId) {
        setFlashingButtonId(buttonId);
      }
      // 在Studio工具生成完成后清除loading状态（2秒后，与handleStudioToolClick中的setTimeout一致）
      setTimeout(() => {
        if (buttonId) {
          setGeneratingButtonId(null);
        }
      }, 2000);
      setTimeout(() => {
        setFlashingToolId(null);
        if (buttonId) {
          setFlashingButtonId(null);
        }
      }, 1500);
    }
  };

  // 切换计时器
  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setElapsedTime(0);
    setIsTimerRunning(true);
  };

  // 发布相关函数
  const handlePublish = async (metadata: import('@/types/self-study').PublishMetadata, scope: PublishScope) => {
    // 生成分享链接
    const shareLink = `${window.location.origin}/learn/${config.id}`;

    // 标记所有现有资源和任务为教师发布的内容
    const publishedResources = config.resources.map(r => ({
      ...r,
      source: r.source || 'teacher' as const,
    }));
    const publishedTasks = config.tasks.map(t => ({
      ...t,
      source: t.source || 'teacher' as const,
    }));

    // 创建新版本
    const newVersion: import('@/types/self-study').PublishVersion = {
      version: (config.publishedVersions?.length || 0) + 1,
      publishedAt: new Date(),
      scope,
      shareLink,
      snapshot: {
        title: metadata.spaceName || config.title,
        resources: scope.includeResources ? publishedResources : [],
        tasks: scope.includeTasks ? publishedTasks : [],
        userProfile: scope.includeAISettings ? config.userProfile : undefined,
        learningPath: scope.includeLearningPath ? config.learningPath : undefined,
      },
    };

    // 更新配置
    handleUpdateConfig({
      ...config,
      title: metadata.spaceName || config.title,
      resources: publishedResources,
      tasks: publishedTasks,
      publishStatus: 'published',
      publishMetadata: {
        ...metadata,
        publishedAt: new Date(),
      },
      publishedVersions: [...(config.publishedVersions || []), newVersion],
      currentPublishVersion: newVersion.version,
    });
  };

  const handleSave = () => {
    // 保存当前配置
    handleUpdateConfig({ ...config, updatedAt: new Date() });
    // TODO: 显示保存成功提示
  };

  const handleViewAnalytics = () => {
    if (onViewResults) {
      onViewResults();
    } else {
      router.push(`/teacher/self-study/${config.id}/results`);
    }
  };

  // 试卷关键词正则
  const EXAM_PATTERN = /(?:试卷|测验|测试|考试|期中|期末|月考|模拟|真题|quiz|exam|test|midterm|final|assessment)/i;

  // 处理文件上传
  const handleFileUpload = (files: File[]) => {
    // 检测是否包含试卷文件
    const examFiles = files.filter(f => EXAM_PATTERN.test(f.name));
    if (examFiles.length > 0) {
      console.log('[ExamDetect] 检测到试卷文件:', examFiles.map(f => f.name));
      setExamDetectedFiles(examFiles);
      // 非试卷文件正常处理
      const normalFiles = files.filter(f => !EXAM_PATTERN.test(f.name));
      if (normalFiles.length > 0) {
        // 场景 A：任意文件上传（脚本化对话）
        loadArbitraryFileScenario(normalFiles);
      }
      setIsFileUploadOpen(false);
      return;
    }

    // 场景 A：任意文件上传（脚本化对话）
    loadArbitraryFileScenario(files);
    setIsFileUploadOpen(false);
  };

  // 处理试卷转换确认
  const handleExamConfirm = (processingConfig: ExamProcessingConfig) => {
    console.log('[ExamProcess] 开始转换:', processingConfig);
    setExamDetectedFiles(null);
    onExamFilesHandled?.();
    const taskId = `task_exam_${Date.now()}`;
    setExamProcessingTaskId(taskId);
    setExamProcessingStep('detecting');

    // Mock 转换进度
    setTimeout(() => setExamProcessingStep('extracting'), 1000);
    setTimeout(() => setExamProcessingStep('converting'), 2500);
    setTimeout(() => {
      setExamProcessingStep('done');

      // 场景路由：根据 includeHandwriting 判断
      if (processingConfig.includeHandwriting) {
        // 场景 C：批量学生答卷（成绩识别与分析）
        loadMultiStudentScenario(taskId, processingConfig.files[0]?.name);
      } else {
        // 场景 B：空白试卷（交互式答题）
        loadBlankExamScenario(taskId, processingConfig.files[0]?.name);
      }

      // 清除进度
      setTimeout(() => {
        setExamProcessingStep(null);
        setExamProcessingTaskId(null);
      }, 1500);
    }, 4000);
  };

  // 场景 B：加载空白试卷场景
  const loadBlankExamScenario = (taskId: string, fileName?: string) => {
    console.log('[Demo] 加载场景 B：空白试卷');

    // 添加试卷资源
    const examResource: Resource = {
      id: `resource_exam_${Date.now()}`,
      title: fileName || '数学试卷',
      type: 'document',
      description: '试卷原文件',
      sourceType: 'exam_paper',
    };
    handleUpdateConfig({
      ...config,
      resources: [...config.resources, examResource],
    });

    // 生成交互式答题任务
    const blankExamTask = {
      id: taskId,
      type: 'quiz' as const,
      title: fileName?.replace(/\.[^.]+$/, '') || '数学试卷测试',
      status: 'available' as const,
      questionCount: blankExamScenario.questions.length,
      generatedAt: new Date().toISOString(),
      settings: {
        showAnswersAfterSubmit: true,
        showExplanationsAfterSubmit: true,
        allowRetry: true,
        fullscreenMode: true,
        allowViewResources: false,
        source: 'exam_converted',
      },
      questions: blankExamScenario.questions,
    };
    setGeneratedTasks(prev => [blankExamTask as any, ...prev]);

    // AI 发送欢迎消息
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        role: 'assistant' as const,
        content: blankExamScenario.welcomeMessage,
        timestamp: new Date(),
      }]);
    }, 500);
  };

  // 场景 C：加载批量学生答卷场景
  const loadMultiStudentScenario = (taskId: string, fileName?: string) => {
    console.log('[Demo] 加载场景 C：批量学生答卷');

    // 添加多份学生试卷资源
    const studentResources = multiStudentScenario.resources.map(r => ({
      ...r,
      id: `${r.id}_${Date.now()}`,
    }));
    handleUpdateConfig({
      ...config,
      resources: [...config.resources, ...studentResources],
    });

    // 生成干净的原题任务
    const cleanExamTask = {
      id: taskId,
      type: 'quiz' as const,
      title: fileName?.replace(/\.[^.]+$/, '') || '数学试卷（原题）',
      status: 'available' as const,
      questionCount: multiStudentScenario.originalQuestions.length,
      generatedAt: new Date().toISOString(),
      settings: {
        showAnswersAfterSubmit: true,
        showExplanationsAfterSubmit: true,
        allowRetry: true,
        fullscreenMode: true,
        allowViewResources: false,
        source: 'exam_converted',
      },
      questions: multiStudentScenario.originalQuestions,
    };
    setGeneratedTasks(prev => [cleanExamTask as any, ...prev]);

    // 自动发送分析对话序列
    setTimeout(() => {
      multiStudentScenario.analysisMessages.forEach((msg, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            ...msg,
            id: `${msg.id}_${Date.now()}`,
            timestamp: new Date(),
          }]);
        }, index * 1500);
      });

      // 最后生成变式练习题
      setTimeout(() => {
        const practiceTask = {
          ...multiStudentScenario.practiceTask,
          id: `${multiStudentScenario.practiceTask.id}_${Date.now()}`,
          generatedAt: new Date().toISOString(),
          settings: {
            showAnswersAfterSubmit: true,
            showExplanationsAfterSubmit: true,
            allowRetry: true,
            fullscreenMode: true,
            allowViewResources: true,
          },
        };
        setGeneratedTasks(prev => [...prev, practiceTask as any]);
      }, multiStudentScenario.analysisMessages.length * 1500 + 500);
    }, 1000);
  };

  // 场景 A：加载任意文件场景（脚本化对话）
  const loadArbitraryFileScenario = (files: File[]) => {
    console.log('[Demo] 加载场景 A：任意文件上传');

    // 添加文件资源
    const newResources: Resource[] = files.map((file) => ({
      id: `resource_${Date.now()}_${Math.random()}`,
      title: file.name,
      type: file.type.includes('video') ? 'video' :
            file.type.includes('presentation') ? 'presentation' : 'document',
      description: `上传于 ${new Date().toLocaleString('zh-CN')}`,
      source: isStudentMode ? 'student' : 'teacher',
    }));
    handleUpdateConfig({
      ...config,
      resources: [...config.resources, ...newResources],
    });

    // 自动播放脚本化对话序列
    setTimeout(() => {
      arbitraryFileScenario.dialogueScript.forEach((msg, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            ...msg,
            id: `${msg.id}_${Date.now()}`,
            timestamp: new Date(),
          }]);
        }, index * 1500);
      });

      // 最后生成练习任务
      setTimeout(() => {
        const practiceTask = {
          ...arbitraryFileScenario.practiceTask,
          id: `${arbitraryFileScenario.practiceTask.id}_${Date.now()}`,
          generatedAt: new Date().toISOString(),
          settings: {
            showAnswersAfterSubmit: true,
            showExplanationsAfterSubmit: true,
            allowRetry: true,
            fullscreenMode: true,
            allowViewResources: true,
          },
        };
        setGeneratedTasks(prev => [...prev, practiceTask as any]);
      }, arbitraryFileScenario.dialogueScript.length * 1500 + 500);
    }, 1000);
  };

  // 保存任务设置
  const handleSaveTaskSettings = (taskId: string, settings: TaskSettings) => {
    console.log('[TaskSettings] 保存:', taskId, settings);
    setGeneratedTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, settings } : t
    ));
    setSettingsTaskId(null);
  };

  // 保存资源可见性
  const handleSaveResourceVisibility = (resourceId: string, visibility: ResourceVisibility) => {
    console.log('[ResourceVisibility] 保存:', resourceId, visibility);
    handleUpdateConfig({
      ...config,
      resources: config.resources.map(r =>
        r.id === resourceId ? { ...r, visibility } : r
      ),
    });
    setSettingsResourceId(null);
  };

  // 错题闭环 handlers
  const handleRetryWrongQuestions = () => {
    console.log('[ErrorLoop] 重做错题');
    if (expandedTask) {
      setTaskDisplayMode('fullscreen');
      setQuickResult(null);
    }
  };

  const handleGeneratePractice = () => {
    console.log('[ErrorLoop] 生成针对性练习');
    // Mock: 生成新任务
    const practiceTask = {
      id: `task_practice_${Date.now()}`,
      type: 'quiz',
      title: `${expandedTask?.title || '测试'} - 针对性练习`,
      status: 'available',
      questionCount: 3,
      generatedAt: new Date().toISOString(),
      questions: [
        { id: 'pq1', type: 'single_choice', content: '针对你的薄弱点：光合作用中，水的光解发生在哪里？', options: ['类囊体薄膜', '叶绿体基质', '线粒体', '细胞质'], answer: 'A', explanation: '水的光解是光反应的一部分，发生在类囊体薄膜上。' },
        { id: 'pq2', type: 'true_false', content: 'C4植物比C3植物更适应高温干旱环境。', options: ['正确', '错误'], answer: 'A', explanation: 'C4植物有特殊的CO₂固定机制，能在高温下维持较高光合速率。' },
        { id: 'pq3', type: 'single_choice', content: '暗反应（Calvin循环）的主要产物是？', options: ['G3P（甘油醛-3-磷酸）', 'ATP', 'NADPH', 'O₂'], answer: 'A', explanation: 'Calvin循环固定CO₂最终生成G3P，用于合成葡萄糖。' },
      ],
    };
    setGeneratedTasks(prev => [practiceTask as any, ...prev]);
    setTaskDisplayMode('embedded');
    setExpandedTask(practiceTask as any);
  };

  const handleBackToChat = () => {
    console.log('[ErrorLoop] 回到对话区');
    setTaskDisplayMode('embedded');
    // 同步错题上下文到对话
    if (expandedTask && quickResult) {
      const wrongDetails = quickResult.details.filter(d => !d.correct);
      if (wrongDetails.length > 0) {
        const syncMsg: ChatMessage = {
          id: `msg_error_sync_${Date.now()}`,
          role: 'assistant',
          content: `📊 **错题分析已同步**\n\n刚才的「${expandedTask.title}」中，你有 ${wrongDetails.length} 道题需要加强：\n${wrongDetails.map((d, i) => {
            const q = expandedTask.questions?.find(q => q.id === d.questionId);
            return `${i + 1}. ${q?.content?.substring(0, 40) || '题目'}...`;
          }).join('\n')}\n\n我可以帮你：\n- 深入讲解这些知识点\n- 推荐相关学习资料\n- 生成更多练习题\n\n你想从哪个开始？`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, syncMsg]);
      }
    }
  };

  const handleExplainQuestion = (question: TaskQuestion, userAnswer: string | string[], correctAnswer: string | string[]) => {
    console.log('[ExplainQuestion] 深入详解题目:', question.id);
    // 关闭结果回顾，回到对话区
    setTaskDisplayMode('embedded');

    // 格式化答案
    const formatAnswer = (ans: string | string[]) => {
      return Array.isArray(ans) ? ans.join(', ') : ans;
    };

    // 构建详细的讲解内容
    const detailedExplanation = question.explanation
      ? `${question.explanation}\n\n---\n\n**深入分析：**\n\n这道题的关键在于理解核心概念。让我从几个维度帮你分析：\n\n**🎯 知识点定位**\n这道题主要考查的是基础概念的理解和应用。你需要掌握相关定义，并能在具体情境中灵活运用。\n\n**💡 解题思路**\n1. 首先，仔细审题，明确题目问的是什么\n2. 然后，回忆相关的知识点和概念\n3. 最后，结合题目信息进行逻辑推理\n\n**⚠️ 易错点提醒**\n很多同学在这类题目上容易出错，主要原因是：\n- 对概念的理解不够深入\n- 容易混淆相似的概念\n- 没有注意题目中的关键信息\n\n**📚 知识拓展**\n这个知识点在实际应用中非常重要，建议你：\n- 多做几道类似的题目巩固理解\n- 尝试用自己的话解释这个概念\n- 思考这个知识点在不同场景下的应用`
      : `让我为你深入讲解这道题：\n\n**🎯 知识点定位**\n这道题考查的是核心概念的理解。你需要掌握相关定义，并能在具体情境中灵活运用。\n\n**💡 解题思路**\n1. **审题**：仔细阅读题目，找出关键信息\n2. **回忆**：联想相关的知识点和概念\n3. **推理**：结合题目信息进行逻辑分析\n4. **验证**：检查答案是否符合题意\n\n**⚠️ 易错点提醒**\n这类题目的常见错误：\n- 对概念理解不够准确\n- 容易被干扰选项误导\n- 忽略了题目中的限定条件\n\n**📚 学习建议**\n为了更好地掌握这个知识点：\n- 回顾教材中的相关章节\n- 多做几道类似题目\n- 尝试总结解题规律\n- 与同学讨论交流理解`;

    // 发送AI讲解消息
    const explainMsg: ChatMessage = {
      id: `msg_explain_${Date.now()}`,
      role: 'assistant',
      content: `📝 **深入详解这道错题**\n\n---\n\n**📋 题目回顾**\n${question.content}\n\n**📊 答案对比**\n- 你的答案：${formatAnswer(userAnswer)}\n- 正确答案：${formatAnswer(correctAnswer)}\n\n---\n\n${detailedExplanation}\n\n---\n\n💬 如果还有不清楚的地方，随时问我！我可以换个角度再解释，或者举更多例子帮你理解。`,
      timestamp: new Date(),
      suggestions: {
        quickReplies: [
          { id: 'more_examples', label: '再举个例子' },
          { id: 'related_concepts', label: '相关知识点' },
          { id: 'understand', label: '我明白了' },
        ],
        actionButtons: [
          {
            id: 'generate_variant',
            label: '生成变种题',
            iconName: 'RotateCcw',
            studioToolId: 'generate_variant_question',
          },
        ],
      },
    };

    setMessages(prev => [...prev, explainMsg]);
  };

  // 处理链接添加
  const handleLinkAdd = (url: string, title?: string, resourceType?: string, interactiveCategory?: string) => {
    const newResource: Resource = {
      id: `resource_${Date.now()}`,
      title: title || url,
      type: resourceType === 'interactive' ? 'interactive' : 'document',
      description: url,
      ...(resourceType === 'interactive' ? {
        url,
        interactiveCategory: interactiveCategory as Resource['interactiveCategory'],
      } : {}),
    };

    handleUpdateConfig({
      ...config,
      resources: [...config.resources, newResource],
    });
    setIsLinkInputOpen(false);
  };

  // 处理知识库导入 - 错题本
  const handleKnowledgeBaseImport = (errorQuestions: ErrorQuestion[]) => {
    console.log('[Demo] 加载场景 D2：错题本导入');
    loadErrorQuestionsScenario(errorQuestions);
    setShowKnowledgeBaseModal(false);
  };

  // 处理知识库导入 - 历史测验
  const handleHistoricalTestImport = (testRecord: HistoricalTest) => {
    console.log('[Demo] 加载场景 D1：历史测验导入');
    loadHistoricalTestScenario(testRecord);
    setShowKnowledgeBaseModal(false);
  };

  // 处理笔记导入
  const handleNotesImport = (notes: KnowledgeNote[]) => {
    console.log('[Demo] 导入笔记:', notes);
    // 将笔记转换为资源格式并添加
    const noteResources: Resource[] = notes.map(note => ({
      id: note.id,
      title: note.title,
      type: 'document',
      path: `notes/${note.id}.md`,
      description: note.content.substring(0, 100) + '...',
      textContent: note.content,
      duration: '笔记',
    }));

    setConfig(prev => ({
      ...prev,
      resources: [...prev.resources, ...noteResources],
    }));
    setShowKnowledgeBaseModal(false);
  };

  // 处理互动网页导入
  const handleWebpagesImport = (webpages: InteractiveWebpage[]) => {
    console.log('[Demo] 导入互动网页:', webpages);
    // 将互动网页转换为资源格式并添加
    const webpageResources: Resource[] = webpages.map(wp => ({
      id: wp.id,
      title: wp.title,
      type: 'interactive',
      path: wp.url,
      description: wp.description,
      duration: wp.duration,
    }));

    setConfig(prev => ({
      ...prev,
      resources: [...prev.resources, ...webpageResources],
    }));
    setShowKnowledgeBaseModal(false);
  };

  // 处理学习资料导入
  const handleResourcesImport = (resources: Resource[]) => {
    console.log('[Demo] 导入学习资料:', resources);
    setConfig(prev => ({
      ...prev,
      resources: [...prev.resources, ...resources],
    }));
    setShowKnowledgeBaseModal(false);
  };

  // 场景 D1：加载历史测验场景
  const loadHistoricalTestScenario = (testRecord: any) => {
    // 添加测验记录资源
    const testResource: Resource = {
      id: `resource_test_${Date.now()}`,
      title: testRecord.title,
      type: 'document',
      description: `得分：${testRecord.score}/${testRecord.totalScore}，正确率：${Math.round(testRecord.correctCount / testRecord.questionCount * 100)}%`,
      source: 'student',
    };
    handleUpdateConfig({
      ...config,
      resources: [...config.resources, testResource],
    });

    // 自动播放分析对话序列
    setTimeout(() => {
      historicalTestScenario.analysisDialogue.forEach((msg, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            ...msg,
            id: `${msg.id}_${Date.now()}`,
            timestamp: new Date(),
          }]);
        }, index * 1500);
      });

      // 最后生成针对性练习题
      setTimeout(() => {
        const practiceTask = {
          ...historicalTestScenario.practiceTask,
          id: `${historicalTestScenario.practiceTask.id}_${Date.now()}`,
          generatedAt: new Date().toISOString(),
          settings: {
            showAnswersAfterSubmit: true,
            showExplanationsAfterSubmit: true,
            allowRetry: true,
            fullscreenMode: true,
            allowViewResources: true,
          },
        };
        setGeneratedTasks(prev => [...prev, practiceTask as any]);
      }, historicalTestScenario.analysisDialogue.length * 1500 + 500);
    }, 1000);
  };

  // 场景 D2：加载错题本场景
  const loadErrorQuestionsScenario = (errorQuestions: any[]) => {
    // 添加错题本资源
    const errorResource: Resource = {
      id: `resource_errors_${Date.now()}`,
      title: '错题本',
      type: 'document',
      description: `包含 ${errorQuestions.length} 道错题`,
      source: 'student',
    };
    handleUpdateConfig({
      ...config,
      resources: [...config.resources, errorResource],
    });

    // 自动播放引导消息
    setTimeout(() => {
      errorQuestionsScenario.guidanceMessages.forEach((msg, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            ...msg,
            id: `${msg.id}_${Date.now()}`,
            timestamp: new Date(),
          }]);
        }, index * 1500);
      });

      // 最后生成变式练习题
      setTimeout(() => {
        const practiceTask = {
          ...errorQuestionsScenario.practiceTask,
          id: `${errorQuestionsScenario.practiceTask.id}_${Date.now()}`,
          generatedAt: new Date().toISOString(),
          questions: errorQuestionsScenario.practiceTask.questions,
          settings: {
            showAnswersAfterSubmit: true,
            showExplanationsAfterSubmit: true,
            allowRetry: true,
            fullscreenMode: true,
            allowViewResources: true,
          },
        };
        setGeneratedTasks(prev => [...prev, practiceTask as any]);
      }, errorQuestionsScenario.guidanceMessages.length * 1500 + 500);
    }, 1000);
  };

  // 处理空间名称保存
  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== config.title) {
      handleUpdateConfig({
        ...config,
        title: editedTitle.trim(),
      });
    }
    setIsEditingTitle(false);
  };

  // 处理空间名称取消
  const handleTitleCancel = () => {
    setEditedTitle(config.title);
    setIsEditingTitle(false);
  };

  // 处理笔记信息配置保存
  const handleNoteInfoSave = (updatedConfig: any) => {
    console.log('=== handleNoteInfoSave 被调用 ===');
    console.log('接收到的配置:', updatedConfig);

    handleUpdateConfig({
      ...config,
      title: updatedConfig.title,
      cover: updatedConfig.cover,
      tags: updatedConfig.tags,
      subjects: updatedConfig.subjects,
      grade: updatedConfig.grade,
      bindClasses: updatedConfig.bindClasses,
      publishScope: updatedConfig.publishScope,
      publishedLink: updatedConfig.publishedLink,
      publishedCode: updatedConfig.publishedCode,
    });

    // 如果是发布操作（有 publishedLink 和 publishedCode），不关闭弹窗
    // NoteInfoModal 会显示成功界面，用户手动关闭时才会触发 onClose
    const isPublishAction = updatedConfig.publishedLink && updatedConfig.publishedCode;
    if (!isPublishAction) {
      setShowNoteInfoModal(false);
      console.log('✅ 配置已保存，弹窗已关闭');
    } else {
      console.log('✅ 发布操作完成，等待用户关闭成功弹窗');
    }
  };

  // 切换学习模式
  const handleModeChange = (mode: LearningMode) => {
    if (mode === config.learningMode) return;

    const transitionMsg: ChatMessage = {
      id: `msg_transition_${Date.now()}`,
      role: 'assistant',
      content: mode === 'ai_guided'
        ? t('好的，让我来带你学习！我会根据你之前的探索情况，从当前进度继续引导。')
        : t('好的，切换到自由探索模式。我会在旁边待命，有问题随时问我。'),
      timestamp: new Date(),
      messageType: 'mode_transition',
      modeTransition: { fromMode: config.learningMode, toMode: mode },
    };
    setMessages(prev => [...prev, transitionMsg]);

    // 切换到 AI 引导时，逐步追加完整的引导内容
    if (mode === 'ai_guided') {
      const mastered = learningPath.filter(n => n.status === 'mastered');
      const currentNode = learningPath.find(n => n.status === 'learning');
      const pendingNodes = learningPath.filter(n => n.status === 'pending');

      // Step 1: 学习进度总结（800ms 后）
      setTimeout(() => {
        const summaryMsg: ChatMessage = {
          id: `msg_guided_summary_${Date.now()}`,
          role: 'assistant',
          content: `📊 **${t('学习进度总结')}**\n\n${t('根据你刚才的探索，你已经涉及了以下知识点：')}\n${mastered.map(n => `- ✅ ${n.title}`).join('\n')}\n\n🗺️ **${t('接下来的学习路径')}**：\n${currentNode ? `1. 📍 ${currentNode.title} ← ${t('当前')}` : ''}\n${pendingNodes.map((n, i) => `${currentNode ? i + 2 : i + 1}. ⬜ ${n.title}`).join('\n')}\n\n${currentNode ? t('让我们从「') + currentNode.title + t('」继续吧！') : t('让我们开始吧！')}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, summaryMsg]);
      }, 800);

      // Step 2: 教学内容（2000ms 后）
      if (currentNode) {
        setTimeout(() => {
          const teachMsg: ChatMessage = {
            id: `msg_guided_teach_${Date.now()}`,
            role: 'assistant',
            content: `📍 **${t('核心原理解析：LED 光谱控制')}**\n\n${t('在植物工厂中，LED 灯不只是"照亮"植物，而是通过精确控制**光谱组成**来调控植物生长。')}\n\n🔴 **${t('红光')}（620-780nm）**：${t('促进开花结果、茎伸长')}\n🔵 **${t('蓝光')}（400-500nm）**：${t('促进叶片生长、气孔开放')}\n🟢 **${t('绿光')}（500-565nm）**：${t('穿透冠层，促进下层叶片光合作用')}\n\n💡 **${t('关键概念')}**：\n${t('不同生长阶段需要不同的红蓝光比例：')}\n- ${t('育苗期')}：${t('红:蓝 = 1:1（促进健壮生长）')}\n- ${t('营养生长期')}：${t('红:蓝 = 3:1（促进叶片扩展）')}\n- ${t('开花结果期')}：${t('红:蓝 = 5:1（促进开花）')}\n\n${t('理解了吗？让我来检查一下你的掌握情况。')}`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, teachMsg]);
        }, 2000);

        // Step 3: 知识检查点（3500ms 后）
        setTimeout(() => {
          const checkpointMsg: ChatMessage = {
            id: `msg_guided_checkpoint_${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            messageType: 'knowledge_checkpoint',
            checkpoint: {
              question: t('在植物工厂中，哪种光谱主要促进植物的叶片生长和气孔开放？'),
              options: [t('红光（620-780nm）'), t('蓝光（400-500nm）'), t('绿光（500-565nm）'), t('紫外光（<400nm）')],
              correctAnswer: t('蓝光（400-500nm）'),
              status: 'pending',
              explanation: t('蓝光（400-500nm）主要促进叶片的营养生长和气孔开放，是植物营养生长阶段的关键光谱。'),
              relatedNodeId: currentNode.id,
            },
          };
          setMessages(prev => [...prev, checkpointMsg]);
        }, 3500);
      }
    }

    handleUpdateConfig({ ...config, learningMode: mode });
  };

  // 处理检查点答题
  const handleCheckpointAnswer = (messageId: string, selectedOption: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.checkpoint) {
        const isCorrect = selectedOption === msg.checkpoint.correctAnswer;
        return {
          ...msg,
          checkpoint: {
            ...msg.checkpoint,
            userAnswer: selectedOption,
            status: isCorrect ? 'correct' as const : 'incorrect' as const,
          },
        };
      }
      return msg;
    }));
  };

  // 处理用户点击任务 - 将任务作为智能体推送的消息嵌入对话
  const handleTaskClick = (task: any) => {
    // 创建一条智能体消息，嵌入任务卡片
    const taskIntroMessage: ChatMessage = {
      id: `msg_task_${task.id}_${Date.now()}`,
      role: 'assistant',
      content: task.type === 'quiz'
        ? `好的，让我们来做一个知识测验，检验一下你的掌握情况：`
        : task.type === 'reflection'
        ? `现在是一个很好的时机来反思你的学习过程。请认真思考以下问题：`
        : `接下来让我们完成这个任务，这将帮助你更深入地理解所学内容：`,
      timestamp: new Date(),
      embeddedTask: task,
      // 初始化任务状态
      taskState: {
        currentQuestionIndex: 0,
        selectedAnswers: {},
        submissionText: '',
        status: 'idle',
      },
    };

    setMessages(prev => [...prev, taskIntroMessage]);
    setExpandedTask(task);
    setTaskDisplayMode('fullscreen'); // 默认以全屏模式打开
  };

  // 切换任务显示模式
  const toggleTaskDisplayMode = () => {
    setTaskDisplayMode(prev => prev === 'fullscreen' ? 'embedded' : 'fullscreen');
  };

  // 关闭任务 - 只关闭全屏，不删除对话中的任务卡片
  const closeTask = () => {
    // 不清空 expandedTask，保持任务状态
    setTaskDisplayMode('embedded'); // 切换到嵌入式模式，保留在对话中
  };

  // 更新任务状态到消息中
  const updateTaskState = (taskId: string, stateUpdate: Partial<ChatMessage['taskState']>) => {
    setMessages(prev => prev.map(msg => {
      if (msg.embeddedTask?.id === taskId) {
        return {
          ...msg,
          taskState: {
            ...msg.taskState!,
            ...stateUpdate,
          },
        };
      }
      return msg;
    }));
  };

  // 切换任务完成状态 - 两阶段提交
  const toggleTaskCompletion = async (taskId: string, answer?: string) => {
    // 如果正在提交或批改中，不再处理
    if (taskStatus === 'submitting' || taskStatus === 'grading') {
      return;
    }

    // 找到任务信息（从 generatedTasks 中查找）
    const task = generatedTasks.find(t => t.id === taskId);
    if (!task) return;

    // 第一阶段：标记为提交中
    setTaskStatus('submitting');
    setIsLoading(true);

    try {
      // 主观题：先标记为批改中状态
      if ((task.type as string) === 'assignment' || (task.type as string) === 'reflection') {
        setTaskStatus('grading');
      }

      // 调用任务提交API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          action: 'submit_task',
          taskId,
          taskAnswer: answer || '已完成任务',
        }),
      });

      if (!response.ok) {
        throw new Error('任务提交失败');
      }

      const data = await response.json();

      // 处理客观题（quiz）- 两阶段流程
      if (data.taskType === 'quiz' && data.quickResult) {
        // 立即显示快速判题结果
        setQuickResult(data.quickResult);

        // 全屏模式下自动进入结果回顾
        if (taskDisplayMode === 'fullscreen') {
          setTaskDisplayMode('result_review');
        }

        // 只有全对才标记任务为已完成
        if (data.quickResult.allCorrect) {
          setTaskStatus('completed');
          setCompletedTasks((prev) => {
            const newSet = new Set(prev);
            newSet.add(taskId);
            return newSet;
          });
        } else {
          // 未全对，重置状态允许重做
          setTimeout(() => {
            setTaskStatus('idle');
          }, 2000); // 2秒后重置，让用户看到结果
        }

        // 添加loading消息到对话区
        const loadingMessage: ChatMessage = {
          id: `msg_${Date.now()}_loading`,
          role: 'assistant',
          content: '正在为你生成详细的学习反馈，请稍候...',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, loadingMessage]);

        // 异步调用AI分析（不阻塞）
        setTimeout(async () => {
          try {
            const analysisResponse = await fetch('/api/analyze-quiz', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                taskId,
                taskTitle: task.title,
                questions: task.questions,
                userAnswers: JSON.parse(answer || '{}'),
                results: data.quickResult.details,
                attemptNumber: data.attemptNumber,
              }),
            });

            if (!analysisResponse.ok) {
              throw new Error('AI分析请求失败');
            }

            // 处理流式响应
            const reader = analysisResponse.body?.getReader();
            const decoder = new TextDecoder();
            let aiAnalysis = '';

            if (reader) {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiAnalysis += chunk;

                // 实时更新消息（替换loading消息和之前的分析消息）
                setMessages((prev) => {
                  const analysisMessageId = `msg_${taskId}_analysis`;
                  const filtered = prev.filter(m =>
                    m.id !== loadingMessage.id && m.id !== analysisMessageId
                  );
                  return [
                    ...filtered,
                    {
                      id: analysisMessageId,
                      role: 'assistant',
                      content: aiAnalysis,
                      timestamp: new Date(),
                    },
                  ];
                });
              }
            }
          } catch (error) {
            console.error('AI分析失败:', error);
            // 移除loading消息，显示错误
            setMessages((prev) => {
              const filtered = prev.filter(m => m.id !== loadingMessage.id);
              return [
                ...filtered,
                {
                  id: `msg_${Date.now()}_error`,
                  role: 'assistant',
                  content: 'AI分析暂时无法完成，但你的答题结果已经保存。',
                  timestamp: new Date(),
                },
              ];
            });
          }
        }, 500); // 短暂延迟，让用户看到快速判题结果
      }
      // 处理主观题（assignment/reflection）
      else if (data.taskType === 'assignment' || data.taskType === 'reflection') {
        // 主观题批改完成
        setTaskStatus('completed');

        // 标记任务为已完成
        setCompletedTasks((prev) => {
          const newSet = new Set(prev);
          newSet.add(taskId);
          return newSet;
        });

        // 显示评估反馈
        if (data.message) {
          const feedbackMessage: ChatMessage = {
            id: `msg_${Date.now()}_feedback`,
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, feedbackMessage]);
        }
      }

    } catch (error) {
      console.error('任务提交失败:', error);

      // 重置状态
      setTaskStatus('idle');
      setQuickResult(null);

      // 显示错误消息
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: '任务提交失败，请稍后再试。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== 内联 UI 子组件 =====

  // 知识检查点卡片
  const KnowledgeCheckpointCard = ({ message }: { message: ChatMessage }) => {
    const cp = message.checkpoint;
    if (!cp) return null;
    const isAnswered = cp.status !== 'pending';

    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500 flex-shrink-0 flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <div className="max-w-[80%] w-full">
          <div className="rounded-lg border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
            <div className="px-4 py-2.5 bg-amber-100/60 border-b border-amber-200">
              <span className="text-xs font-bold text-amber-800">🧪 {t('知识检查点')}</span>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-800 mb-3">{cp.question}</p>
              <div className="space-y-2">
                {cp.options?.map((option, idx) => {
                  const isSelected = cp.userAnswer === option;
                  const isCorrectOption = cp.correctAnswer === option;
                  let optionStyle = 'bg-white border-gray-200 hover:border-amber-400 hover:bg-amber-50 cursor-pointer';

                  if (isAnswered) {
                    if (isCorrectOption) {
                      optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800';
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = 'bg-red-50 border-red-400 text-red-800';
                    } else {
                      optionStyle = 'bg-gray-50 border-gray-200 text-gray-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !isAnswered && handleCheckpointAnswer(message.id, option)}
                      disabled={isAnswered}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-2 ${optionStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold">
                        {isAnswered && isCorrectOption ? <Check size={12} /> : isAnswered && isSelected ? <X size={12} /> : String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
              {isAnswered && cp.explanation && (
                <div className={`mt-3 p-3 rounded-lg text-xs leading-relaxed ${
                  cp.status === 'correct'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <span className="font-bold">{cp.status === 'correct' ? '✅ ' + t('回答正确！') : '❌ ' + t('回答有误')}</span>
                  <span className="ml-1">{cp.explanation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 主题过渡卡片
  const TopicTransitionCard = ({ message }: { message: ChatMessage }) => {
    const tr = message.transition;
    if (!tr) return null;

    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 rounded-full shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="font-medium">{tr.fromTopic}</span>
          </div>
          <ChevronRight size={14} className="text-gray-400" />
          <div className="flex items-center gap-1.5 text-xs text-primary-700">
            <Target size={14} className="text-primary-500" />
            <span className="font-medium">{tr.toTopic}</span>
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
      </div>
    );
  };

  // 模式切换提示条
  const ModeTransitionCard = ({ message }: { message: ChatMessage }) => {
    const mt = message.modeTransition;
    if (!mt) return null;
    const isToGuided = mt.toMode === 'ai_guided';

    return (
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-gray-200" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          isToGuided
            ? 'bg-primary-50 text-primary-700 border border-primary-200'
            : 'bg-gray-50 text-gray-600 border border-gray-200'
        }`}>
          <RotateCcw size={12} />
          <span>
            {isToGuided ? t('已切换到 AI 引导学习模式') : t('已切换到自由探索模式')}
          </span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    );
  };

  // 资源引用标签
  const ResourceReferenceTag = ({ resourceRef }: { resourceRef: NonNullable<ChatMessage['resourceRef']> }) => (
    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs text-gray-500 hover:bg-gray-150 transition-colors">
      <FileText size={11} className="text-gray-400" />
      <span>{t('来源')}：{resourceRef.resourceTitle}</span>
      {resourceRef.excerpt && (
        <span className="text-gray-400 ml-1">· {resourceRef.excerpt}</span>
      )}
    </div>
  );

  // 学习路径进度计算
  const masteredCount = learningPath.filter(n => n.status === 'mastered').length;
  const totalNodes = learningPath.length;
  const currentLearningNode = learningPath.find(n => n.status === 'learning');

  return (
    <>
      {/* 全屏任务弹窗 */}
      {expandedTask && taskDisplayMode === 'fullscreen' && (() => {
        // 获取当前任务的消息和状态
        const taskMessage = messages.find(m => m.embeddedTask?.id === expandedTask.id);
        return (
          <TaskExpandedCard
            task={expandedTask}
            onClose={closeTask}
            onComplete={toggleTaskCompletion}
            isCompleted={completedTasks.has(expandedTask.id)}
            taskStatus={taskStatus}
            quickResult={quickResult}
            displayMode="fullscreen"
            onToggleMode={toggleTaskDisplayMode}
            taskState={taskMessage?.taskState}
            onStateUpdate={(stateUpdate) => updateTaskState(expandedTask.id, stateUpdate)}
          />
        );
      })()}

      {/* 全屏结果回顾 */}
      {expandedTask && taskDisplayMode === 'result_review' && quickResult && (() => {
        const taskMessage = messages.find(m => m.embeddedTask?.id === expandedTask.id);
        return (
          <TaskResultReview
            task={expandedTask}
            quickResult={quickResult}
            selectedAnswers={taskMessage?.taskState?.selectedAnswers || {}}
            onClose={() => { setTaskDisplayMode('embedded'); }}
            onRetryWrongQuestions={handleRetryWrongQuestions}
            onGeneratePractice={handleGeneratePractice}
            onBackToChat={handleBackToChat}
            onExplainQuestion={handleExplainQuestion}
          />
        );
      })()}

      <div className="h-full flex flex-col bg-gray-50">
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
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') handleTitleCancel();
                  }}
                  className="text-base font-semibold text-gray-900 border border-primary-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                <button
                  onClick={handleTitleSave}
                  className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title={t('保存')}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={handleTitleCancel}
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
                  onClick={() => setShowNoteInfoModal(true)}
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
        <div className="flex items-center gap-2">
          {/* 设置 - 仅教师模式显示 */}
          {!isStudentMode && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings size={15} />
              {t('设置')}
            </button>
          )}

          {/* 发布 - 仅教师模式显示 */}
          {!isStudentMode && (
            <button
              onClick={() => setShowNoteInfoModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Share2 size={15} />
              {t('发布')}
            </button>
          )}

          {/* 分析 - 仅教师模式显示 */}
          {!isStudentMode && (
            <button
              onClick={handleViewAnalytics}
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

      {/* 主内容区 - 三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 */}
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
                  onClick={() => setIsLeftCollapsed(false)}
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
                        onClick={() => setIsLeftCollapsed(false)}
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
                        onClick={() => setIsLeftCollapsed(false)}
                        className="w-full px-3 py-3 hover:bg-gray-100 transition-colors flex flex-col items-center gap-1 group rounded-lg"
                        title={resource.title}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sparkles size={20} className="text-gray-500" />
                        </div>
                      </button>
                    ))}
                    {MOCK_AI_RESOURCES.map((resource) => (
                      <button
                        key={resource.id}
                        onClick={() => setIsLeftCollapsed(false)}
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
                          onClick={() => setIsLeftCollapsed(false)}
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
                      onClick={() => setIsLeftCollapsed(false)}
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
                  <><FolderOpen size={16} className="text-gray-500" />Sources</>
                )}
              </h2>
              <button
                onClick={() => setIsLeftCollapsed(true)}
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
                    onClick={() => setIsFileUploadOpen(true)}
                    className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    {t('添加资料来源')}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFileUploadOpen(true)}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Upload size={12} />
                      {t('上传文件')}
                    </button>
                    <button
                      onClick={() => setIsLinkInputOpen(true)}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Link size={12} />
                      {t('粘贴链接')}
                    </button>
                    <button
                      onClick={() => setShowKnowledgeBaseModal(true)}
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
                        onBack={() => setInlineViewingResource(null)}
                        onFullscreen={() => {
                          if (inlineViewingResource.url) {
                            setViewingResource({
                              id: inlineViewingResource.id,
                              title: inlineViewingResource.title,
                              type: 'interactive',
                              description: inlineViewingResource.description || '',
                              url: inlineViewingResource.url,
                              interactiveCategory: inlineViewingResource.interactiveCategory,
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
                      onClick={() => handleResourceClick(resource)}
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
                  {MOCK_AI_RESOURCES.map((resource) => (
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
                          onClick={() => handleResourceClick(resource)}
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
                              onClick={(e) => { e.stopPropagation(); setSettingsResourceId(resource.id); }}
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
                  onClick={() => togglePanel('tasks')}
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
                            handleGenerateTest();
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
                          onClick={handleGenerateTest}
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
                          onClick={() => handleTaskClick(task)}
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
                            </div>
                          </div>
                          {!isStudentMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSettingsTaskId(task.id);
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
                        onClick={handleGenerateTest}
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
                    onClick={() => setIsFileUploadOpen(true)}
                    className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    {t('添加资料来源')}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFileUploadOpen(true)}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Upload size={12} />
                      {t('上传文件')}
                    </button>
                    <button
                      onClick={() => setIsLinkInputOpen(true)}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Link size={12} />
                      {t('粘贴链接')}
                    </button>
                    <button
                      onClick={() => setShowKnowledgeBaseModal(true)}
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
                        onBack={() => setInlineViewingResource(null)}
                        onFullscreen={() => {
                          if (inlineViewingResource.url) {
                            setViewingResource({
                              id: inlineViewingResource.id,
                              title: inlineViewingResource.title,
                              type: 'interactive',
                              description: inlineViewingResource.description || '',
                              url: inlineViewingResource.url,
                              interactiveCategory: inlineViewingResource.interactiveCategory,
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
                        <span className="text-xs text-gray-500">{config.resources.length + aiGeneratedResources.length + MOCK_AI_RESOURCES.length} {t('个来源')}</span>
                        <button
                          onClick={() => toggleAllResources()}
                          className="text-xs text-gray-600 hover:text-gray-800 font-medium p-2 rounded-lg"
                        >
                          {selectedResourceIds.size === config.resources.length + aiGeneratedResources.length + MOCK_AI_RESOURCES.length ? t('取消全选') : t('全选')}
                        </button>
                      </div>

                      {/* AI生成的资源 */}
                      {aiGeneratedResources.map((resource) => (
                        <div
                          key={resource.id}
                          onClick={(e) => { e.stopPropagation(); handleResourceClick(resource); }}
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
                            handleResourceClick(resource);
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
                                onClick={(e) => { e.stopPropagation(); setSettingsResourceId(resource.id); }}
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
                  onClick={() => togglePanel('tasks')}
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
                            handleGenerateTest();
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
                          onClick={handleGenerateTest}
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
                          onClick={() => handleTaskClick(task)}
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
                            </div>
                          </div>
                          {!isStudentMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSettingsTaskId(task.id);
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
                        onClick={handleGenerateTest}
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

        {/* 左侧调整器 - 仅在未折叠时显示 */}
        {!isLeftCollapsed && (
          <Resizer
            onResize={(delta) => {
              const newLeftWidth = Math.max(18, Math.min(35, leftWidth + delta));
              setLeftWidth(newLeftWidth);
            }}
          />
        )}

        {/* 中间聊天面板 */}
        <div className="flex-1 flex flex-col bg-white">
          {/* 对话区头部 */}
          <div className="px-4 border-b border-gray-200">
            <div className="h-12 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <MessageSquare size={16} className={getThemeClass('icon')} />
                {t('AI 学习对话')}
              </h2>

              {/* 模式切换 - 紧凑版 */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => handleModeChange('self_directed')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    config.learningMode === 'self_directed'
                      ? `${getThemeClass('bg')} text-white shadow-sm`
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageCircle size={12} className="inline mr-1" />
                  {t('自由探索')}
                </button>
                <button
                  onClick={() => handleModeChange('ai_guided')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    config.learningMode === 'ai_guided'
                      ? `${getThemeClass('bg')} text-white shadow-sm`
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <GitBranch size={12} className="inline mr-1" />
                  {t('AI 自适应学习')}
                </button>
              </div>
            </div>

            {/* AI引导模式 - 学习路径进度点 */}
            {config.learningMode === 'ai_guided' && (
              <div className="pb-2 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {learningPath.map((node, idx) => (
                    <div key={node.id} className="flex items-center gap-1">
                      <div
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          node.status === 'mastered'
                            ? 'bg-emerald-500'
                            : node.status === 'learning'
                            ? 'bg-primary-500 ring-2 ring-primary-200'
                            : 'bg-gray-300'
                        }`}
                        title={node.title}
                      />
                      {idx < learningPath.length - 1 && (
                        <div className={`w-3 h-0.5 ${
                          node.status === 'mastered' ? 'bg-emerald-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  {masteredCount}/{totalNodes} {t('已掌握')}
                </span>
              </div>
            )}
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((message) => {
              // 特殊卡片类型渲染
              if (message.messageType === 'knowledge_checkpoint') {
                return <KnowledgeCheckpointCard key={message.id} message={message} />;
              }
              if (message.messageType === 'topic_transition') {
                return <TopicTransitionCard key={message.id} message={message} />;
              }
              if (message.messageType === 'mode_transition') {
                return <ModeTransitionCard key={message.id} message={message} />;
              }

              // 普通消息渲染
              return (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div className={`${message.role === 'user' ? 'max-w-[80%]' : 'flex flex-col gap-2 max-w-[80%]'}`}>
                  {/* 消息气泡 */}
                  <div
                    className={`rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-none'
                        : 'bg-white border border-gray-200 rounded-tl-none overflow-hidden'
                    }`}
                  >
                    {/* 消息内容 */}
                    <div className="p-4">
                      <div
                        className={`text-sm leading-relaxed whitespace-pre-line ${
                          message.role === 'user' ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                    </div>

                    {/* 功能按钮 - 内嵌在对话框底部 */}
                    {message.role === 'assistant' && message.suggestions?.actionButtons && message.suggestions.actionButtons.length > 0 && (
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.actionButtons.map((button) => {
                            const IconComponent = getIconComponent(button.iconName);
                            const buttonFullId = `${message.id}-${button.id}`;
                            const isGenerating = generatingButtonId === buttonFullId;
                            const isFlashing = flashingButtonId === buttonFullId;

                            return (
                              <button
                                key={button.id}
                                onClick={() => !isGenerating && handleChatAction(button.studioToolId, buttonFullId)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 group transition-all ${
                                  isGenerating
                                    ? 'bg-gray-50 border-gray-200 animate-pulse cursor-wait'
                                    : isFlashing
                                    ? 'bg-primary-100 border-primary-500 ring-2 ring-primary-400 shadow-lg scale-105'
                                    : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700 hover:text-primary-700 hover:shadow-sm cursor-pointer'
                                }`}
                              >
                                {IconComponent && <IconComponent size={16} className={`transition-colors ${
                                  isGenerating
                                    ? 'text-gray-500'
                                    : isFlashing
                                    ? 'text-primary-600 animate-pulse'
                                    : 'text-gray-500 group-hover:text-primary-600'
                                }`} />}
                                <div className="flex flex-col items-start">
                                  <span className={`font-medium ${isFlashing ? 'text-primary-700' : ''}`}>{button.label}</span>
                                  {isGenerating ? (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Activity size={10} className="animate-spin" />
                                      {t('生成中...')}
                                    </span>
                                  ) : !isFlashing && (
                                    <ChevronRight size={14} className={`transition-colors text-gray-400 group-hover:text-primary-500`} />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 资源引用标签 */}
                  {message.role === 'assistant' && message.resourceRef && (
                    <ResourceReferenceTag resourceRef={message.resourceRef} />
                  )}

                  {/* 嵌入的任务卡片 (作为智能体消息的一部分) */}
                  {message.role === 'assistant' && message.embeddedTask && (() => {
                    const isCurrentTask = expandedTask?.id === message.embeddedTask.id;
                    const shouldShowEmbedded = !isCurrentTask || taskDisplayMode === 'embedded';

                    if (!shouldShowEmbedded) {
                      // 当前任务正在全屏显示或结果回顾中
                      return (
                        <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                            <span>{taskDisplayMode === 'result_review' ? '正在查看结果回顾...' : '正在全屏做题中...'}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="mt-2">
                        <TaskExpandedCard
                          task={message.embeddedTask}
                          onClose={closeTask}
                          onComplete={toggleTaskCompletion}
                          isCompleted={completedTasks.has(message.embeddedTask.id)}
                          taskStatus={taskStatus}
                          quickResult={quickResult}
                          displayMode="embedded"
                          onToggleMode={toggleTaskDisplayMode}
                          taskState={message.taskState}
                          onStateUpdate={(stateUpdate) => updateTaskState(message.embeddedTask!.id, stateUpdate)}
                        />
                      </div>
                    );
                  })()}

                  {/* 推荐回复 - 在对话框外下方，长条形输入框样式 */}
                  {message.role === 'assistant' && message.suggestions?.quickReplies && message.suggestions.quickReplies.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                      {message.suggestions.quickReplies.map((reply) => (
                        <button
                          key={reply.id}
                          onClick={() => handleQuickReply(reply.label)}
                          className="px-4 py-3 text-sm text-left rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700 transition-all hover:shadow-sm flex items-start gap-2"
                        >
                          <Send size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{reply.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              );
            })}

            {/* 加载指示器 */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Activity size={14} className="animate-spin" />
                    <span className="text-sm">{t('思考中...')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 阶段性反思引导卡片 */}
            {messages.length >= 6 && !isReflectionDismissed && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm relative">
                <button
                  onClick={() => setIsReflectionDismissed(true)}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={14} className="text-gray-400" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <Lightbulb size={18} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">💭 {t('阶段性反思时间')}</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      {t('你已经学习了一段时间，让我们暂停一下，回顾总结学到的内容。')}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-gray-600">1</span>
                        </div>
                        <p className="text-xs text-gray-600">{t('今天学习的最重要的三个知识点是什么？')}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-gray-600">2</span>
                        </div>
                        <p className="text-xs text-gray-600">{t('你遇到了哪些困难？是如何解决的？')}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-gray-600">3</span>
                        </div>
                        <p className="text-xs text-gray-600">{t('这些知识可以在生活中的哪些地方应用？')}</p>
                      </div>
                    </div>
                    <button className="mt-3 w-full px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5">
                      <MessageCircle size={14} />
                      {t('开始反思')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 输入框 */}
          <div className="p-3 bg-white border-t border-gray-200">
            {/* AI引导模式 - 当前知识点提示 */}
            {config.learningMode === 'ai_guided' && currentLearningNode && (
              <div className="mb-2 flex items-center gap-1.5 px-2 py-1 bg-primary-50 border border-primary-100 rounded-md">
                <Target size={12} className="text-primary-500 flex-shrink-0" />
                <span className="text-xs text-primary-600">
                  {t('AI正在引导学习')}「{currentLearningNode.title}」
                </span>
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder={
                  config.learningMode === 'self_directed'
                    ? t('有什么问题？随时问我...')
                    : t('回答问题或提出疑问...')
                }
                disabled={isLoading}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 右侧调整器 - 仅在未折叠时显示 */}
        {!isRightCollapsed && (
          <Resizer
            onResize={(delta) => {
              const newRightWidth = Math.max(18, Math.min(35, rightWidth - delta));
              setRightWidth(newRightWidth);
            }}
          />
        )}

        {/* 右侧面板 */}
        <div
          style={{
            width: isRightCollapsed ? `${COLLAPSED_WIDTH}px` : `${rightWidth}%`,
            transition: 'width 0.3s ease-in-out'
          }}
          className="bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-hidden"
        >
          {isRightCollapsed ? (
            // 折叠状态：显示竖向的工具图标列表（参考 NotebookLM）
            <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
              {/* 展开按钮 */}
              <div className="p-3 border-b border-gray-200 flex justify-center">
                <button
                  onClick={() => setIsRightCollapsed(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title={t('展开面板')}
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
              </div>

              {/* Studio 工具图标 */}
              <div className="flex-1 overflow-y-auto py-2 space-y-1">
                {STUDIO_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setIsRightCollapsed(false);
                      // 如果需要，可以在这里触发工具的默认行为
                    }}
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
              {/* 标签切换 */}
              <div className="flex border-b border-gray-200">
            <button
              onClick={() => setRightTab('workspace')}
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
              onClick={() => setRightTab('status')}
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
              onClick={() => setIsRightCollapsed(true)}
              className="px-2 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
              title={t('折叠面板')}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* 内容区 */}
          {rightTab === 'workspace' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 笔记区域 - Studio收起时自动扩展 */}
              <div
                className="flex-1 min-h-0 overflow-hidden transition-all"
                style={{
                  flex: collapsedPanels.studio ? '1 1 auto' : '0 0 50%'
                }}
              >
                <EnhancedNotesPanel learningMode={config.learningMode} isAIGenerating={isAIGenerating} getThemeClass={getThemeClass} configId={config.id} />
              </div>

              {/* Studio 工具区域 - 可折叠，展开时占50% */}
              <div
                className="border-t border-gray-200 bg-white transition-all flex flex-col min-h-0 overflow-hidden"
                style={{
                  flex: collapsedPanels.studio ? '0 0 auto' : '0 0 50%'
                }}
              >
                {/* 可折叠的标题栏 - 收起时高度与中间对话区输入框对齐 */}
                <div
                  className={`px-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-all flex flex-col justify-center ${collapsedPanels.studio ? 'h-[70px]' : 'h-12'}`}
                  onClick={() => togglePanel('studio')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Sparkles size={14} className="text-gray-500" />
                        Studio
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

                {/* 可折叠的内容区域 */}
                {!collapsedPanels.studio && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-2">
                    {STUDIO_TOOLS.map((tool) => {
                      const isGenerating = generatingToolId === tool.id;
                      const isFlashing = flashingToolId === tool.id;
                      return (
                        <div
                          key={tool.id}
                          onClick={() => !isGenerating && handleStudioToolClick(tool)}
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
                                onClick={(e) => handleOpenToolConfig(tool.id, e)}
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
      </div>

      {/* 设置弹窗 */}
      {isSettingsOpen && (
        <SettingsModal
          config={config}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(newConfig) => {
            handleUpdateConfig(newConfig);
            setIsSettingsOpen(false);
          }}
        />
      )}

      {/* Studio工具配置弹窗 */}
      {studioConfigModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* 弹窗头部 */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-accent-50 to-accent-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Settings size={18} className="text-accent-600" />
                  {t('工具配置')}
                </h3>
                <button
                  onClick={() => setStudioConfigModal({ isOpen: false, toolId: null })}
                  className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} className="text-accent-600" />
                </div>
                <h4 className="text-base font-semibold text-gray-800 mb-2">
                  {STUDIO_TOOLS.find(t => t.id === studioConfigModal.toolId)?.label}
                </h4>
                <p className="text-sm text-gray-500 mb-6">
                  {t('自定义工具的生成参数和输出格式')}
                </p>

                {/* 配置选项示例 */}
                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('输出详细程度')}
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>{t('简洁')}</option>
                      <option selected>{t('标准')}</option>
                      <option>{t('详细')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('生成语言')}
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option selected>{t('中文')}</option>
                      <option>{t('英文')}</option>
                      <option>{t('双语')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('难度级别')}
                    </label>
                    <div className="flex gap-2">
                      {[t('基础'), t('中级'), t('高级')].map((level, idx) => (
                        <button
                          key={level}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            idx === 1
                              ? 'bg-accent-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs font-medium text-gray-700">{t('包含示例')}</span>
                    <div className="w-10 h-6 bg-accent-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
              <button
                onClick={() => setStudioConfigModal({ isOpen: false, toolId: null })}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('取消')}
              </button>
              <button
                onClick={() => setStudioConfigModal({ isOpen: false, toolId: null })}
                className="flex-1 px-4 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg hover:bg-accent-600 transition-colors"
              >
                {t('保存配置')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 任务编辑弹窗 */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={(updatedTask: typeof editingTask) => {
            setGeneratedTasks(prev =>
              prev.map(t => t.id === updatedTask.id ? updatedTask : t)
            );
            setEditingTask(null);
          }}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* 发布弹窗 */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublish}
        isPublished={config.publishStatus === 'published'}
        shareLink={config.publishedVersions?.[config.publishedVersions.length - 1]?.shareLink}
        currentSpaceName={config.title}
      />

      {/* 笔记信息配置弹窗 */}
      {showNoteInfoModal && (
        <NoteInfoModal
          config={config}
          onSave={handleNoteInfoSave}
          onClose={() => setShowNoteInfoModal(false)}
          knowledgeLibrary={KNOWLEDGE_POINTS_LIBRARY}
          grades={GRADES}
          classes={MOCK_CLASSES}
        />
      )}

      {/* 文件上传弹窗 */}
      <FileUploadModal
        isOpen={isFileUploadOpen}
        onClose={() => setIsFileUploadOpen(false)}
        onUpload={handleFileUpload}
      />

      {/* 链接输入弹窗 */}
      <LinkInputModal
        isOpen={isLinkInputOpen}
        onClose={() => setIsLinkInputOpen(false)}
        onAdd={handleLinkAdd}
      />

      {/* 资源库导入弹窗 */}
      <UnifiedResourceLibraryModal
        isOpen={showKnowledgeBaseModal}
        onClose={() => setShowKnowledgeBaseModal(false)}
        onImportResources={handleResourcesImport}
        onImportErrorQuestions={handleKnowledgeBaseImport}
        onImportHistoricalTest={handleHistoricalTestImport}
        onImportNotes={handleNotesImport}
        onImportWebpages={handleWebpagesImport}
      />

      {/* 试卷检测弹窗 */}
      {examDetectedFiles && (
        <ExamDetectedModal
          files={examDetectedFiles}
          onConfirm={handleExamConfirm}
          onCancel={() => { setExamDetectedFiles(null); onExamFilesHandled?.(); }}
        />
      )}

      {/* 任务设置弹窗 */}
      {settingsTaskId && (() => {
        const t = generatedTasks.find(task => task.id === settingsTaskId);
        return t ? (
          <TaskSettingsPopover
            task={t}
            onSave={handleSaveTaskSettings}
            onClose={() => setSettingsTaskId(null)}
          />
        ) : null;
      })()}

      {/* 资源设置弹窗 */}
      {settingsResourceId && (() => {
        const r = config.resources.find(res => res.id === settingsResourceId);
        return r ? (
          <ResourceSettingsPopover
            resource={r}
            tasks={generatedTasks.map(t => ({ id: t.id, title: t.title }))}
            onSave={handleSaveResourceVisibility}
            onClose={() => setSettingsResourceId(null)}
          />
        ) : null;
      })()}

      {/* 互动资源查看器 */}
      <InteractiveViewerModal
        resource={viewingResource}
        onClose={() => setViewingResource(null)}
        onShrinkToInline={() => {
          if (viewingResource) {
            setInlineViewingResource({
              id: viewingResource.id,
              title: viewingResource.title,
              type: viewingResource.type,
              icon: viewingResource.type === 'interactive' ? '🔬' : '📄',
              toolId: viewingResource.id,
              url: viewingResource.url,
              description: viewingResource.description,
              interactiveCategory: viewingResource.interactiveCategory,
            });
            setViewingResource(null);
          }
        }}
      />
    </div>
    </>
  );
}