'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SpaceConfig, LearningMode, LearningPathNode, LEARNING_MODE_CONFIG } from '@/types/self-study';
import { Resource, Task } from '@/types/shared-context';
import { mockResources } from '@/data/mockLearningData';
import {
  ArrowLeft, Send, Settings, BookOpen, Brain, Sparkles, FileText, Video,
  FileSpreadsheet, Plus, Upload, Link, GripVertical, X, Check, Zap, FileEdit,
  Activity, Pencil, Save, Target, Lightbulb, MessageCircle, Clock, FolderOpen,
  ListChecks, ChevronRight, ChevronLeft, Play, Download, Eye, Search, BarChart3, Map,
  CheckCircle2, Circle, Bot, MessageSquare, Pause, RotateCcw, GitBranch,
  Edit, Image as ImageIcon, Mic, Trash2, Layers, Award, TrendingUp,
  ChevronDown, ChevronUp, Layout, Share2,
} from 'lucide-react';
import SettingsModal from './SettingsModal';
import PublishModal from './PublishModal';
import FileUploadModal from './FileUploadModal';
import LinkInputModal from './LinkInputModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { TaskEditModal } from '@/app/teacher/note-config/modals';
import { useRouter } from 'next/navigation';
import { PublishMode, PublishScope } from '@/types/self-study';

interface SelfStudyWorkbenchProps {
  config: SpaceConfig;
  onBack: () => void;
  onUpdateConfig: (config: SpaceConfig) => void;
  isAIGenerating?: boolean;
  onCreateNewSpace?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
    <div onMouseDown={handleMouseDown} className="w-1 bg-gray-200 hover:bg-primary-400 cursor-col-resize transition-colors relative group flex-shrink-0">
      <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary-500 text-white rounded-full p-1">
          <GripVertical size={12} />
        </div>
      </div>
    </div>
  );
}

// Mock learning path data (ai_guided mode) - will be created inside component with t()
const MOCK_CURRENT_NODE = 'node_3';

// Mock generated tasks for self-directed mode - will be created inside component with t()

// Enhanced Notes Panel component
function EnhancedNotesPanel({ learningMode, isAIGenerating }: { learningMode?: LearningMode; isAIGenerating?: boolean }) {
  const { t } = useLanguage();
  const [notes, setNotes] = useState<Note[]>([]);
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
            className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-accent-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            {t('添加笔记')}
          </button>
          {learningMode === 'ai_guided' && (
            <button
              onClick={generateAINote}
              disabled={isGeneratingNote}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
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
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                className="p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md cursor-pointer transition-all"
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
      <div className="flex-1 overflow-y-auto p-3 bg-white">
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
    <div className="flex-1 overflow-y-auto p-3 space-y-4">
      {/* 学习概况 */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 border border-primary-100">
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
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
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
      <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-4 border border-accent-200">
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
      <div className="bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl p-4 border border-accent-200">
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
export default function SelfStudyWorkbench({ config, onBack, onUpdateConfig, isAIGenerating = false, onCreateNewSpace }: SelfStudyWorkbenchProps) {
  const { t } = useLanguage();
  const router = useRouter();

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
  ];

  const MOCK_GENERATED_TASKS = [
    {
      id: 'gen_task_1',
      type: 'quiz' as const,
      title: t('AI生成：植物工厂基础测验'),
      status: 'optional' as const,
      questionCount: 5,
      questions: [
        {
          id: 'q1',
          type: 'choice',
          content: t('植物工厂的主要优势是什么？'),
          options: [
            t('不受气候影响，可全年生产'),
            t('成本低廉'),
            t('不需要任何技术'),
            t('产量低但质量好')
          ],
          answer: 0,
          aiGenerated: true,
        },
        {
          id: 'q2',
          type: 'choice',
          content: t('植物工厂中最重要的环境因素是？'),
          options: [
            t('温度'),
            t('光照'),
            t('湿度'),
            t('以上都是')
          ],
          answer: 3,
          aiGenerated: true,
        },
        {
          id: 'q3',
          type: 'trueFalse',
          content: t('植物工厂可以完全不使用土壤进行种植。'),
          answer: true,
          aiGenerated: true,
        },
        {
          id: 'q4',
          type: 'fillBlank',
          content: t('植物工厂通常使用___技术来提供植物所需的营养。'),
          answer: t('水培或营养液'),
          aiGenerated: true,
        },
        {
          id: 'q5',
          type: 'choice',
          content: t('LED灯在植物工厂中的作用是？'),
          options: [
            t('装饰美观'),
            t('提供光合作用所需的光照'),
            t('加热空气'),
            t('驱赶害虫')
          ],
          answer: 1,
          aiGenerated: true,
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

  // 布局状态
  const [leftWidth, setLeftWidth] = useState(28);
  const [rightWidth, setRightWidth] = useState(25);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // 折叠宽度（像素）- 参考 NotebookLM 的设计
  const COLLAPSED_WIDTH = 72;

  // 聊天状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 计时器状态
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 右侧面板标签 - AI引导模式默认显示学习状态
  const [rightTab, setRightTab] = useState<'workspace' | 'status'>(
    config.learningMode === 'ai_guided' ? 'status' : 'workspace'
  );

  // 学习路径状态
  const [learningPath, setLearningPath] = useState<LearningPathNode[]>(MOCK_LEARNING_PATH);
  const [currentNodeId, setCurrentNodeId] = useState(MOCK_CURRENT_NODE);

  // 设置弹窗
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 发布弹窗
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // 文件上传弹窗
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);

  // 链接输入弹窗
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);

  // 空间名称编辑状态
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(config.title);

  // 面板折叠状态
  const [collapsedPanels, setCollapsedPanels] = useState<Record<string, boolean>>({
    sources: false,
    tasks: true, // 初始收起
    aiResources: false,
    learningPath: false,
    studio: false,
  });

  // 生成的任务列表（初始为空）
  const [generatedTasks, setGeneratedTasks] = useState<typeof MOCK_GENERATED_TASKS>([]);
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);

  // 任务编辑弹窗
  const [editingTask, setEditingTask] = useState<typeof MOCK_GENERATED_TASKS[0] | null>(null);

  // AI生成的资源列表
  const [aiGeneratedResources, setAiGeneratedResources] = useState<Array<{
    id: string;
    title: string;
    type: 'ai_generated';
    icon: string;
    status: 'ready' | 'generating';
    generatedAt: Date;
    toolId: string;
  }>>([]);

  // Studio工具配置弹窗
  const [studioConfigModal, setStudioConfigModal] = useState<{
    isOpen: boolean;
    toolId: string | null;
  }>({ isOpen: false, toolId: null });

  // 正在生成的工具ID
  const [generatingToolId, setGeneratingToolId] = useState<string | null>(null);

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
        const newTask = {
          id: `gen_task_${Date.now()}`,
          type: 'quiz' as const,
          title: `🤖 ${t('AI生成')}：${tool.label}`,
          status: 'optional' as const,
          questionCount: 3,
          questions: [
            {
              id: `q_${Date.now()}_1`,
              type: 'choice',
              content: t('这是一道AI生成的示例题目，请选择正确答案。'),
              options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')],
              answer: 0,
              aiGenerated: true,
            },
            {
              id: `q_${Date.now()}_2`,
              type: 'trueFalse',
              content: t('这是一道判断题示例。'),
              answer: true,
              aiGenerated: true,
            },
            {
              id: `q_${Date.now()}_3`,
              type: 'fillBlank',
              content: t('这是一道填空题示例，请填写___。'),
              answer: t('答案'),
              aiGenerated: true,
            },
          ],
          passScore: 60,
          generatedAt: new Date(),
        };

        setGeneratedTasks(prev => [newTask, ...prev]);
        setGeneratingToolId(null);
        setCollapsedPanels(prev => ({ ...prev, tasks: false })); // 展开任务区域
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

  // 初始化欢迎消息
  useEffect(() => {
    const modeConfig = LEARNING_MODE_CONFIG[config.learningMode];
    const welcomeMessage: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      role: 'assistant',
      content:
        config.learningMode === 'self_directed'
          ? `${t('你好！👋 欢迎来到「')}${config.title}${t('」的学习空间！')}\n\n${t('我是你的AI学习助手，在这里我会**待命**，等你有问题时随时帮助你。')}\n\n📚 **${t('学习建议')}**：\n1. ${t('左侧是你的学习资料，可以自由浏览')}\n2. ${t('有任何疑问随时在这里问我')}\n3. ${t('右侧可以记录你的学习笔记')}\n\n${t('开始你的探索之旅吧！有什么想了解的？')}`
          : `${t('你好！👋 欢迎来到「')}${config.title}${t('」的学习空间！')}\n\n${t('我是你的AI学习导师，我会**主动引导**你完成学习目标。')}\n\n🗺️ **${t('学习路径')}**：\n${t('我已经为你规划好了学习路径，右侧可以看到完整的知识点地图。')}\n\n${t('让我们从第一个知识点「')}${learningPath[0]?.title}${t('」开始吧！')}\n\n${t('你对这个主题有什么了解吗？或者我们直接开始学习？')}`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
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

  // 切换计时器
  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setElapsedTime(0);
    setIsTimerRunning(true);
  };

  // 发布相关函数
  const handlePublish = async (mode: PublishMode, scope: PublishScope) => {
    // 生成分享链接和访问码
    const shareLink = `${window.location.origin}/learn/${config.id}`;
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 创建新版本
    const newVersion: import('@/types/self-study').PublishVersion = {
      version: (config.publishedVersions?.length || 0) + 1,
      publishedAt: new Date(),
      mode,
      scope,
      shareLink,
      accessCode,
      snapshot: {
        title: config.title,
        resources: scope.includeResources ? config.resources : [],
        tasks: scope.includeTasks ? config.tasks : [],
        userProfile: scope.includeAISettings ? config.userProfile : undefined,
        learningPath: scope.includeLearningPath ? config.learningPath : undefined,
      },
    };

    // 更新配置
    onUpdateConfig({
      ...config,
      publishStatus: 'published',
      publishedVersions: [...(config.publishedVersions || []), newVersion],
      currentPublishVersion: newVersion.version,
    });
  };

  const handleSave = () => {
    // 保存当前配置
    onUpdateConfig({ ...config, updatedAt: new Date() });
    // TODO: 显示保存成功提示
  };

  const handleViewAnalytics = () => {
    router.push(`/teacher/self-study/${config.id}/results`);
  };

  // 处理文件上传
  const handleFileUpload = (files: File[]) => {
    const newResources: Resource[] = files.map((file) => ({
      id: `resource_${Date.now()}_${Math.random()}`,
      title: file.name,
      type: file.type.includes('video') ? 'video' :
            file.type.includes('presentation') ? 'presentation' : 'document',
      description: `上传于 ${new Date().toLocaleString('zh-CN')}`,
    }));

    onUpdateConfig({
      ...config,
      resources: [...config.resources, ...newResources],
    });
    setIsFileUploadOpen(false);
  };

  // 处理链接添加
  const handleLinkAdd = (url: string, title?: string) => {
    const newResource: Resource = {
      id: `resource_${Date.now()}`,
      title: title || url,
      type: 'document',
      description: url,
    };

    onUpdateConfig({
      ...config,
      resources: [...config.resources, newResource],
    });
    setIsLinkInputOpen(false);
  };

  // 处理空间名称保存
  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== config.title) {
      onUpdateConfig({
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

  // 切换学习模式
  const handleModeChange = (mode: LearningMode) => {
    onUpdateConfig({ ...config, learningMode: mode });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部状态栏 */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
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
                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title={t('保存')}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={handleTitleCancel}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                  title={t('取消')}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-base font-semibold text-gray-900">{config.title}</h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                  title={t('编辑名称')}
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 创建新学习空间 */}
          {onCreateNewSpace && (
            <button
              onClick={onCreateNewSpace}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">{t('创建新学习空间')}</span>
            </button>
          )}

          {/* 设置 */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title={t('设置')}
          >
            <Settings size={16} className="text-gray-700" />
          </button>

          {/* 保存 */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Save size={16} />
            {t('保存')}
          </button>

          {/* 发布/重新发布 */}
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Share2 size={16} />
            {config.publishStatus === 'published' ? t('重新发布') : t('发布')}
          </button>

          {/* 查看分析 - 仅在已发布状态下显示 */}
          {config.publishStatus === 'published' && (
            <button
              onClick={handleViewAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <BarChart3 size={16} />
              {t('查看分析')}
            </button>
          )}
        </div>
      </header>

      {/* 主内容区 - 三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 */}
        <div
          style={{
            width: isLeftCollapsed ? `${COLLAPSED_WIDTH}px` : `${leftWidth}%`,
            transition: 'width 0.3s ease-in-out'
          }}
          className="bg-white border-r border-gray-200 flex flex-col flex-shrink-0"
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
                // AI引导模式：显示AI资源和任务图标
                <>
                  {/* AI资源图标 */}
                  <div className="flex-1 overflow-y-auto py-2 space-y-1">
                    {aiGeneratedResources.map((resource) => (
                      <button
                        key={resource.id}
                        onClick={() => setIsLeftCollapsed(false)}
                        className="w-full px-3 py-3 hover:bg-accent-100 transition-colors flex flex-col items-center gap-1 group"
                        title={resource.title}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sparkles size={20} className="text-accent-600" />
                        </div>
                      </button>
                    ))}
                    {MOCK_AI_RESOURCES.map((resource) => (
                      <button
                        key={resource.id}
                        onClick={() => setIsLeftCollapsed(false)}
                        className="w-full px-3 py-3 hover:bg-accent-100 transition-colors flex flex-col items-center gap-1 group"
                        title={resource.title}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Brain size={20} className="text-accent-600" />
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
                          className="w-full px-3 py-3 hover:bg-primary-100 transition-colors flex flex-col items-center gap-1 group"
                          title={task.title}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                      className="w-full px-3 py-3 hover:bg-primary-100 transition-colors flex flex-col items-center gap-1 group"
                      title={resource.title}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {resource.type === 'document' ? (
                          <FileText size={20} className="text-primary-600" />
                        ) : resource.type === 'presentation' ? (
                          <FileSpreadsheet size={20} className="text-primary-600" />
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
            {config.learningMode === 'ai_guided' ? (
            // AI引导模式：上方AI资源 + 下方学习任务
            <>
              {/* AI生成资源区域 - 任务收起时自动扩展 */}
              <div
                className="flex flex-col min-h-0"
                style={{
                  flex: collapsedPanels.tasks ? '1 1 auto' : '0 0 50%'
                }}
              >
                <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-accent-50 to-accent-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Sparkles size={16} className="text-accent-500" />
                        {t('AI 智能资源')}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Activity size={10} className="animate-pulse text-accent-500" />
                          {t('根据学习进度动态生成')}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setIsLeftCollapsed(true)}
                      className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                      title={t('折叠面板')}
                    >
                      <ChevronLeft size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
                {/* AI生成进度指示器 */}
                {isAIGenerating && (
                  <div className="px-3 py-2 bg-accent-50 border-b border-accent-100">
                    <div className="flex items-center gap-2 text-xs text-accent-600 mb-2">
                      <Brain size={14} className="animate-pulse" />
                      <span>{t('AI 正在为你生成学习资源...')}</span>
                    </div>
                    <div className="h-1.5 bg-accent-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-500 rounded-full transition-all duration-300 animate-pulse" style={{ width: '100%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-accent-600 mt-1">
                      <span>📖 {t('分析主题')}</span>
                      <span>🔍 {t('匹配资源')}</span>
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {/* AI生成的资源 */}
                  {aiGeneratedResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer bg-gradient-to-r from-accent-50 to-accent-100 border-2 border-accent-200 hover:border-accent-300 hover:shadow-md"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br from-purple-100 to-pink-100">
                        {resource.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                        <p className="text-xs text-accent-600 flex items-center gap-1">
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
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                        resource.status === 'generating'
                          ? 'bg-accent-50 border-2 border-accent-200 animate-pulse'
                          : resource.status === 'ready'
                          ? 'bg-white border border-gray-200 hover:border-accent-300 hover:shadow-md'
                          : 'bg-gray-50 border border-gray-200 opacity-60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        resource.status === 'generating'
                          ? 'bg-accent-100'
                          : resource.status === 'ready'
                          ? 'bg-gradient-to-br from-purple-100 to-pink-100'
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
                </div>
              </div>

              {/* 学习任务区域 - 可折叠，展开时占50% */}
              <div
                className="flex flex-col min-h-0 border-t-2 border-fresh-200 transition-all"
                style={{
                  flex: collapsedPanels.tasks ? '0 0 auto' : '0 0 50%'
                }}
              >
                {/* 可折叠的标题栏 */}
                <div
                  className="p-3 border-b border-gray-100 bg-gradient-to-r from-fresh-50 to-fresh-100 cursor-pointer hover:bg-fresh-100/50 transition-colors"
                  onClick={() => togglePanel('tasks')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <ListChecks size={16} className="text-fresh-500" />
                        {t('学习任务')}
                        {generatedTasks.length > 0 && (
                          <span className="text-xs bg-fresh-200 text-fresh-600 px-1.5 py-0.5 rounded-full">
                            {generatedTasks.length}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Activity size={10} className="animate-pulse text-fresh-500" />
                          {t('AI 动态生成的学习任务')}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {collapsedPanels.tasks && generatedTasks.length === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateTest();
                          }}
                          disabled={isGeneratingTask}
                          className="px-2.5 py-1 bg-fresh-500 hover:bg-fresh-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-70"
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
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {/* AI生成进度指示器 */}
                    {isAIGenerating && (
                      <div className="px-3 py-3 bg-fresh-50 border border-fresh-200 rounded-xl">
                        <div className="flex items-center gap-2 text-xs text-fresh-600 mb-2">
                          <Brain size={14} className="animate-pulse" />
                          <span>{t('AI 正在为你生成学习任务...')}</span>
                        </div>
                        <div className="h-1.5 bg-fresh-100 rounded-full overflow-hidden">
                          <div className="h-full bg-fresh-500 rounded-full transition-all duration-300 animate-pulse" style={{ width: '100%' }} />
                        </div>
                        <div className="flex justify-between text-xs text-fresh-600 mt-1">
                          <span>✨ {t('生成任务')}</span>
                          <span>🎯 {t('设置目标')}</span>
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
                      generatedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-fresh-300 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            task.type === 'quiz' ? 'bg-fresh-100' : 'bg-accent-100'
                          }`}>
                            {task.type === 'quiz' ? (
                              <Zap size={18} className="text-fresh-600" />
                            ) : (
                              <Brain size={18} className="text-accent-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              {task.type === 'quiz' && task.questionCount && (
                                <span>{task.questionCount} {t('道题')}</span>
                              )}
                              <span>•</span>
                              <span>{new Date(task.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-fresh-50 rounded-lg transition-all"
                            title={t('编辑任务')}
                          >
                            <Pencil size={16} className="text-fresh-600" />
                          </button>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      ))
                    )}

                    {/* 生成更多任务按钮 - 仅当已有任务时显示 */}
                    {generatedTasks.length > 0 && (
                      <button
                        onClick={handleGenerateTest}
                        disabled={isGeneratingTask}
                        className="w-full px-3 py-2.5 border-2 border-dashed border-fresh-300 rounded-xl text-sm text-fresh-600 hover:border-fresh-400 hover:bg-fresh-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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
                className="flex flex-col min-h-0"
                style={{
                  flex: collapsedPanels.tasks ? '1 1 auto' : '0 0 50%'
                }}
              >
                <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <FolderOpen size={16} className="text-primary-500" />
                        Sources
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">{t('自由浏览，随时提问')}</p>
                    </div>
                    <button
                      onClick={() => setIsLeftCollapsed(true)}
                      className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                      title={t('折叠面板')}
                    >
                      <ChevronLeft size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* 添加资源入口 */}
                <div className="p-3 border-b border-gray-100 space-y-2">
                  <button
                    onClick={() => setIsFileUploadOpen(true)}
                    className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
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
                  </div>
                </div>

                {/* AI生成进度指示器 */}
                {isAIGenerating && (
                  <div className="px-3 py-2 bg-primary-50 border-b border-primary-100">
                    <div className="flex items-center gap-2 text-xs text-primary-700 mb-2">
                      <Brain size={14} className="animate-pulse" />
                      <span>{t('AI 正在为你生成学习资源...')}</span>
                    </div>
                    <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all duration-300 animate-pulse" style={{ width: '100%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-primary-600 mt-1">
                      <span>📖 {t('分析主题')}</span>
                      <span>🔍 {t('匹配资源')}</span>
                    </div>
                  </div>
                )}

                {/* 资源列表 */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                        <span className="text-xs text-gray-500">{config.resources.length + aiGeneratedResources.length} {t('个来源')}</span>
                        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">{t('全选')}</button>
                      </div>

                      {/* AI生成的资源 */}
                      {aiGeneratedResources.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-start gap-3 p-3 bg-gradient-to-r from-accent-50 to-accent-100 border-2 border-accent-200 rounded-xl hover:border-accent-300 hover:shadow-md transition-all cursor-pointer group"
                        >
                          {/* 选中指示器 */}
                          <div className="w-5 h-5 rounded border-2 border-accent-400 bg-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={12} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-accent-100">
                                <span className="text-sm">{resource.icon}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                            </div>
                            <p className="text-xs text-accent-600 line-clamp-1 ml-8 flex items-center gap-1">
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
                          className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                        >
                          {/* 选中指示器 */}
                          <div className="w-5 h-5 rounded border-2 border-primary-400 bg-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={12} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                                resource.type === 'video' ? 'bg-red-100' :
                                resource.type === 'presentation' ? 'bg-orange-100' : 'bg-blue-100'
                              }`}>
                                {resource.type === 'video' ? (
                                  <Video size={12} className="text-red-600" />
                                ) : resource.type === 'presentation' ? (
                                  <FileSpreadsheet size={12} className="text-orange-600" />
                                ) : (
                                  <FileText size={12} className="text-blue-600" />
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-1 ml-8">{resource.description}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* 任务区域 - 可折叠，展开时占50% */}
              <div
                className="flex flex-col min-h-0 border-t-2 border-fresh-200 transition-all"
                style={{
                  flex: collapsedPanels.tasks ? '0 0 auto' : '0 0 50%'
                }}
              >
                {/* 可折叠的标题栏 */}
                <div
                  className="p-3 border-b border-gray-100 bg-gradient-to-r from-fresh-50 to-fresh-100 cursor-pointer hover:bg-fresh-100/50 transition-colors"
                  onClick={() => togglePanel('tasks')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <ListChecks size={16} className="text-fresh-500" />
                        {t('学习任务')}
                        {generatedTasks.length > 0 && (
                          <span className="text-xs bg-fresh-200 text-fresh-600 px-1.5 py-0.5 rounded-full">
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
                          className="px-2.5 py-1 bg-fresh-500 hover:bg-fresh-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-70"
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
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {/* AI生成进度指示器 */}
                    {isAIGenerating && (
                      <div className="px-3 py-3 bg-fresh-50 border border-fresh-200 rounded-xl">
                        <div className="flex items-center gap-2 text-xs text-fresh-600 mb-2">
                          <Brain size={14} className="animate-pulse" />
                          <span>{t('AI 正在为你生成学习任务...')}</span>
                        </div>
                        <div className="h-1.5 bg-fresh-100 rounded-full overflow-hidden">
                          <div className="h-full bg-fresh-500 rounded-full transition-all duration-300 animate-pulse" style={{ width: '100%' }} />
                        </div>
                        <div className="flex justify-between text-xs text-fresh-600 mt-1">
                          <span>✨ {t('生成任务')}</span>
                          <span>🎯 {t('设置目标')}</span>
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
                      generatedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-fresh-300 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            task.type === 'quiz' ? 'bg-fresh-100' : 'bg-accent-100'
                          }`}>
                            {task.type === 'quiz' ? (
                              <Zap size={18} className="text-fresh-600" />
                            ) : (
                              <Brain size={18} className="text-accent-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              {task.type === 'quiz' && task.questionCount && (
                                <span>{task.questionCount} {t('道题')}</span>
                              )}
                              <span>•</span>
                              <span>{new Date(task.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-fresh-50 rounded-lg transition-all"
                            title={t('编辑任务')}
                          >
                            <Pencil size={16} className="text-fresh-600" />
                          </button>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      ))
                    )}

                    {/* 生成更多任务按钮 - 仅当已有任务时显示 */}
                    {generatedTasks.length > 0 && (
                      <button
                        onClick={handleGenerateTest}
                        disabled={isGeneratingTask}
                        className="w-full px-3 py-2.5 border-2 border-dashed border-fresh-300 rounded-xl text-sm text-fresh-600 hover:border-fresh-400 hover:bg-fresh-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* 对话区头部 + 模式切换 */}
          <div className="p-3 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <MessageSquare size={18} className="text-accent-600" />
                {t('AI 学习对话')}
              </h2>
            </div>

            {/* 模式切换 - 类似学生端 */}
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange('self_directed')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  config.learningMode === 'self_directed'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MessageCircle size={14} className="inline mr-1" />
                {t('自由探索')}
              </button>
              <button
                onClick={() => handleModeChange('ai_guided')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  config.learningMode === 'ai_guided'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <GitBranch size={14} className="inline mr-1" />
                {t('AI 自适应学习')}
              </button>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex-shrink-0 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 rounded-tl-none'
                  }`}
                >
                  <div
                    className={`text-sm leading-relaxed whitespace-pre-line ${
                      message.role === 'user' ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {/* 加载指示器 */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex-shrink-0 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Activity size={14} className="animate-spin" />
                    <span className="text-sm">{t('思考中...')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 阶段性反思引导卡片 */}
            {messages.length >= 6 && (
              <div className="mt-4 bg-gradient-to-br from-fresh-50 to-fresh-100 border border-fresh-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-fresh-100 flex-shrink-0 flex items-center justify-center">
                    <Lightbulb size={18} className="text-fresh-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-fresh-600 mb-2">💭 {t('阶段性反思时间')}</h4>
                    <p className="text-xs text-fresh-600 mb-3">
                      {t('你已经学习了一段时间，让我们暂停一下，回顾总结学到的内容。')}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-fresh-600">1</span>
                        </div>
                        <p className="text-xs text-amber-800">{t('今天学习的最重要的三个知识点是什么？')}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-fresh-600">2</span>
                        </div>
                        <p className="text-xs text-amber-800">{t('你遇到了哪些困难？是如何解决的？')}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-fresh-600">3</span>
                        </div>
                        <p className="text-xs text-amber-800">{t('这些知识可以在生活中的哪些地方应用？')}</p>
                      </div>
                    </div>
                    <button className="mt-3 w-full px-3 py-2 bg-fresh-500 hover:bg-fresh-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5">
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
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
          className="bg-white border-l border-gray-200 flex flex-col flex-shrink-0"
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
                    className="w-full px-3 py-3 hover:bg-accent-100 transition-colors flex flex-col items-center gap-1 group"
                    title={tool.label}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles size={20} className="text-accent-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* 标签切换 */}
              <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setRightTab('workspace')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                rightTab === 'workspace'
                  ? 'text-accent-600 border-b-2 border-accent-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Pencil size={12} className="inline mr-1" />
              {t('工作区')}
            </button>
            <button
              onClick={() => setRightTab('status')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                rightTab === 'status'
                  ? 'text-accent-600 border-b-2 border-accent-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Activity size={12} className="inline mr-1" />
              {t('学习状态')}
            </button>
            <button
              onClick={() => setIsRightCollapsed(true)}
              className="px-2 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
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
                <EnhancedNotesPanel learningMode={config.learningMode} isAIGenerating={isAIGenerating} />
              </div>

              {/* Studio 工具区域 - 可折叠，展开时占50% */}
              <div
                className="border-t-2 border-accent-200 bg-gradient-to-b from-purple-50/50 to-white transition-all flex flex-col min-h-0"
                style={{
                  flex: collapsedPanels.studio ? '0 0 auto' : '0 0 50%'
                }}
              >
                {/* 可折叠的标题栏 */}
                <div
                  className="p-3 border-b border-accent-100 cursor-pointer hover:bg-accent-50/50 transition-colors"
                  onClick={() => togglePanel('studio')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-accent-600 flex items-center gap-2">
                        <Sparkles size={14} className="text-accent-600" />
                        Studio
                      </h3>
                      <p className="text-xs text-accent-500 mt-1">{t('AI 学习工具')}</p>
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
                  <div className="flex-1 overflow-y-auto p-3">
                    <div className="grid grid-cols-2 gap-2">
                    {STUDIO_TOOLS.map((tool) => {
                      const isGenerating = generatingToolId === tool.id;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => !isGenerating && handleStudioToolClick(tool)}
                          className={`p-3 rounded-xl border text-left transition-all relative group ${
                            isGenerating
                              ? 'bg-accent-50 border-accent-200 animate-pulse cursor-wait'
                              : 'bg-white border-gray-200 hover:border-accent-300 hover:shadow-md cursor-pointer'
                          }`}
                          disabled={isGenerating}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{tool.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">{tool.label}</p>
                              {isGenerating ? (
                                <p className="text-xs text-accent-600 flex items-center gap-1 mt-0.5">
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
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent-100 rounded"
                                title={t('配置')}
                              >
                                <Pencil size={12} className="text-gray-400 hover:text-accent-600" />
                              </button>
                            )}
                          </div>
                        </button>
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
            <LearningStatusPanel
              elapsedTime={elapsedTime}
              learningMode={config.learningMode}
              learningPath={learningPath}
              observations={MOCK_AI_OBSERVATIONS}
            />
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
            onUpdateConfig(newConfig);
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
        accessCode={config.publishedVersions?.[config.publishedVersions.length - 1]?.accessCode}
      />

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
    </div>
  );
}