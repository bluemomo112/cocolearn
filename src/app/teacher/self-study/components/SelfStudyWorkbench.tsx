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
  ListChecks, ChevronRight, Play, Download, Eye, Search, BarChart3, Map,
  CheckCircle2, Circle, Bot, MessageSquare, Pause, RotateCcw, GitBranch,
  Edit, Image as ImageIcon, Mic, Trash2, Layers, Award, TrendingUp,
  ChevronDown, ChevronUp, Layout,
} from 'lucide-react';
import SettingsModal from './SettingsModal';

interface SelfStudyWorkbenchProps {
  config: SpaceConfig;
  onBack: () => void;
  onUpdateConfig: (config: SpaceConfig) => void;
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

// Mock learning path data (ai_guided mode)
const MOCK_LEARNING_PATH: LearningPathNode[] = [
  { id: 'node_1', title: '基础概念与定义', status: 'mastered', estimatedTime: 15 },
  { id: 'node_2', title: '核心原理解析', status: 'mastered', estimatedTime: 20 },
  { id: 'node_3', title: '关键公式与推导', status: 'learning', estimatedTime: 25 },
  { id: 'node_4', title: '典型例题分析', status: 'pending', estimatedTime: 20 },
  { id: 'node_5', title: '综合应用与拓展', status: 'pending', estimatedTime: 30 },
];

const MOCK_CURRENT_NODE = 'node_3';

// Mock AI-generated resources for guided mode
const MOCK_AI_RESOURCES = [
  { id: 'ai_res_1', title: '概念图解：核心原理可视化', type: 'ai_generated', status: 'ready', icon: '🎨' },
  { id: 'ai_res_2', title: '练习题：基础概念巩固', type: 'ai_generated', status: 'ready', icon: '📝' },
  { id: 'ai_res_3', title: '知识卡片：公式速记', type: 'ai_generated', status: 'generating', icon: '🃏' },
  { id: 'ai_res_4', title: '思维导图：知识结构', type: 'ai_generated', status: 'pending', icon: '🗺️' },
];

// Mock AI observations (inline, no external import)
const MOCK_AI_OBSERVATIONS = [
  {
    id: 'obs_1',
    type: 'praise' as const,
    icon: '🌟',
    message: '你对基础概念的理解非常扎实，能够准确地用自己的话解释核心原理。',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'obs_2',
    type: 'suggestion' as const,
    icon: '💡',
    message: '建议在推导公式时多画图辅助理解，这样可以更直观地把握变量之间的关系。',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'obs_3',
    type: 'insight' as const,
    icon: '🔍',
    message: '你倾向于先理解整体框架再深入细节，这是一种很好的学习策略。',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
];

// Quick actions for different modes
const SELF_DIRECTED_QUICK_ACTIONS = [
  { id: 'search', label: '搜索概念', icon: Search, color: 'primary' },
  { id: 'summarize', label: '总结要点', icon: FileText, color: 'emerald' },
  { id: 'example', label: '举个例子', icon: Lightbulb, color: 'amber' },
  { id: 'generate_quiz', label: '生成测试', icon: Zap, color: 'purple' },
];

const AI_GUIDED_QUICK_ACTIONS = [
  { id: 'quiz', label: '考考我', icon: Zap, color: 'amber' },
  { id: 'next', label: '下一知识点', icon: ChevronRight, color: 'emerald' },
  { id: 'path', label: '查看路径', icon: Map, color: 'primary' },
  { id: 'hint', label: '给我提示', icon: Lightbulb, color: 'purple' },
];

// Studio tools (NotebookLM style) for right panel
const STUDIO_TOOLS = [
  { id: 'audio_overview', label: '音频概述', icon: '🎧', description: '生成音频摘要', status: 'ready' as const },
  { id: 'mind_map', label: '思维导图', icon: '🗺️', description: '可视化知识结构', status: 'ready' as const },
  { id: 'flashcards', label: '记忆卡片', icon: '🃏', description: '生成复习卡片', status: 'ready' as const },
  { id: 'quiz', label: '知识测验', icon: '📝', description: '生成测试题目', status: 'ready' as const },
  { id: 'summary', label: '学习报告', icon: '📊', description: '生成学习总结', status: 'generating' as const },
  { id: 'timeline', label: '时间线', icon: '📅', description: '梳理知识脉络', status: 'pending' as const },
];

// Mock generated tasks for self-directed mode
const MOCK_GENERATED_TASKS = [
  {
    id: 'gen_task_1',
    type: 'quiz' as const,
    title: 'AI生成：植物工厂基础测验',
    status: 'available' as const,
    questionCount: 5,
    generatedAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: 'gen_task_2',
    type: 'reflection' as const,
    title: 'AI生成：学习反思',
    status: 'available' as const,
    generatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
];

// Enhanced Notes Panel component
function EnhancedNotesPanel({ learningMode }: { learningMode?: LearningMode }) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: '我的学习笔记',
      content: '# 欢迎使用增强笔记\n\n你可以：\n- 记录Markdown格式的笔记\n- 上传图片\n- 录制语音笔记\n\n开始你的学习之旅吧！',
      createdAt: new Date(),
      updatedAt: new Date(),
      images: [],
      voiceRecordings: [],
    },
  ]);
  const [activeNoteId, setActiveNoteId] = useState('1');
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
      title: `笔记 ${notes.length + 1}`,
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
            title: '📚 AI生成：关键公式与推导笔记',
            content: `# 关键公式与推导\n\n## 核心公式\n\n### 公式1：基本定义\n$$E = mc^2$$\n\n### 公式2：推导过程\n1. 从基本假设出发...\n2. 应用数学变换...\n3. 得到最终结果...\n\n## 重点理解\n- 公式的物理意义\n- 适用条件和范围\n- 常见错误分析\n\n## 练习建议\n尝试用自己的话解释这个公式的含义。`,
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
      alert('至少需要保留一个笔记');
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
            添加笔记
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
                  <span>正在从知识库提取... {generationProgress}%</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  AI 生成笔记
                </>
              )}
            </button>
          )}
        </div>
        {/* Generation progress indicator */}
        {isGeneratingNote && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100">
            <div className="flex items-center gap-2 text-xs text-emerald-700 mb-2">
              <Brain size={14} className="animate-pulse" />
              <span>AI 正在分析当前学习内容并生成笔记...</span>
            </div>
            <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-emerald-600 mt-1">
              <span>📖 提取知识点</span>
              <span>🔍 整理结构</span>
              <span>✨ 生成笔记</span>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notes.map((note) => (
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
                    {note.content.slice(0, 50) || '空笔记'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(note.updatedAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                <Edit size={14} className="text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
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
            title="返回列表"
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
            {isPreviewMode ? '预览' : '编辑'}
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
            title={isRecording ? '停止录音' : '开始录音'}
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
            title="删除笔记"
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
          placeholder="笔记标题"
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
            placeholder="# 开始记录你的学习笔记...\n\n支持Markdown格式"
          />
        )}

        {/* Image grid */}
        {activeNote.images.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-bold text-gray-600 mb-2">图片 ({activeNote.images.length})</div>
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
            <div className="text-xs font-bold text-gray-600 mb-2">语音笔记 ({activeNote.voiceRecordings.length})</div>
            <div className="space-y-2">
              {activeNote.voiceRecordings.map((recording) => (
                <div key={recording.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <button className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <Play size={12} />
                  </button>
                  <div className="flex-1">
                    <div className="text-xs text-gray-700">语音笔记 {new Date(recording.timestamp).toLocaleString('zh-CN')}</div>
                    <div className="text-xs text-gray-500">时长: {formatRecTime(recording.duration)}</div>
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
}: {
  elapsedTime: number;
  learningMode: LearningMode;
  learningPath: LearningPathNode[];
}) {
  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} 分钟`;
  };

  const masteredCount = learningPath.filter((n) => n.status === 'mastered').length;
  const totalCount = learningPath.length;
  const progressPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // 简化版能力画像数据
  const competencies = [
    { name: '批判性思维', value: 65, color: 'primary' },
    { name: '信息整合', value: 72, color: 'emerald' },
    { name: '元认知', value: 58, color: 'amber' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4">
      {/* 学习概况 */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 border border-primary-100">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} className="text-primary-600" />
          <span className="text-xs font-bold text-primary-700">学习概况</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">{formatMinutes(elapsedTime)}</div>
            <div className="text-xs text-gray-500">学习时长</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">{masteredCount}/{totalCount}</div>
            <div className="text-xs text-gray-500">已掌握概念</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-600">{progressPercent}%</div>
            <div className="text-xs text-gray-500">完成进度</div>
          </div>
        </div>
      </div>

      {/* 能力画像 */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
        <div className="flex items-center gap-2 mb-3">
          <Award size={14} className="text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">能力画像</span>
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
          <span className="text-xs font-bold text-accent-700">AI 观察记录</span>
        </div>
        <div className="space-y-2">
          {MOCK_AI_OBSERVATIONS.slice(0, 3).map((obs) => (
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
export default function SelfStudyWorkbench({ config, onBack, onUpdateConfig }: SelfStudyWorkbenchProps) {
  // 布局状态
  const [leftWidth, setLeftWidth] = useState(28);
  const [rightWidth, setRightWidth] = useState(25);

  // 聊天状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 计时器状态
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 右侧面板标签
  const [rightTab, setRightTab] = useState<'workspace' | 'status'>('workspace');

  // 学习路径状态
  const [learningPath, setLearningPath] = useState<LearningPathNode[]>(MOCK_LEARNING_PATH);
  const [currentNodeId, setCurrentNodeId] = useState(MOCK_CURRENT_NODE);

  // 设置弹窗
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
          ? `你好！👋 欢迎来到「${config.title}」的学习空间！\n\n我是你的AI学习助手，在这里我会**待命**，等你有问题时随时帮助你。\n\n📚 **学习建议**：\n1. 左侧是你的学习资料，可以自由浏览\n2. 有任何疑问随时在这里问我\n3. 右侧可以记录你的学习笔记\n\n开始你的探索之旅吧！有什么想了解的？`
          : `你好！👋 欢迎来到「${config.title}」的学习空间！\n\n我是你的AI学习导师，我会**主动引导**你完成学习目标。\n\n🗺️ **学习路径**：\n我已经为你规划好了学习路径，左侧可以看到完整的知识点地图。\n\n让我们从第一个知识点「${learningPath[0]?.title}」开始吧！\n\n你对这个主题有什么了解吗？或者我们直接开始学习？`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

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
          aiContent = `🔍 **概念解析**\n\n让我帮你搜索相关概念...\n\n根据知识库检索，这个概念的核心要点是：\n\n1. **定义**：...\n2. **特征**：...\n3. **应用场景**：...\n\n你想深入了解哪个方面？`;
        } else if (userInput.includes('总结') || userInput.includes('要点')) {
          aiContent = `📋 **要点总结**\n\n根据你目前的学习内容，我来帮你梳理关键要点：\n\n**核心概念**\n- 要点一：...\n- 要点二：...\n\n**重要公式**\n- 公式一：...\n\n**常见误区**\n- 注意事项：...\n\n需要我详细解释某个要点吗？`;
        } else if (userInput.includes('例子') || userInput.includes('举例')) {
          aiContent = `💡 **实例说明**\n\n让我用一个生活中的例子来解释：\n\n想象一下...\n\n这就像是...\n\n通过这个例子，你能理解核心原理了吗？`;
        } else {
          aiContent = `这是一个很好的问题！让我来帮你解答...\n\n根据你的问题，我认为关键点在于：\n\n1. **首先**，我们需要理解...\n2. **其次**，要注意...\n3. **最后**，可以这样应用...\n\n你还有其他想了解的吗？`;
        }
      } else {
        // 目标导向模式的回复
        if (userInput.includes('考考') || userInput.includes('测试')) {
          aiContent = `🧪 **知识检测**\n\n好的，让我来考考你！\n\n**问题**：关于「${learningPath.find(n => n.id === currentNodeId)?.title}」，请回答：\n\n这个概念的核心定义是什么？它与前面学过的内容有什么联系？\n\n💭 *提示：可以结合之前学习的基础概念来思考*`;
        } else if (userInput.includes('下一') || userInput.includes('继续')) {
          aiContent = `⏭️ **进入下一知识点**\n\n很好！你已经掌握了当前内容。\n\n📍 正在为你准备下一个知识点：「${learningPath.find(n => n.status === 'pending')?.title || '综合应用'}」\n\n🔄 *正在从知识库加载相关资源...*\n\n准备好了吗？让我们开始吧！`;
        } else if (userInput.includes('路径') || userInput.includes('进度')) {
          const mastered = learningPath.filter(n => n.status === 'mastered').length;
          aiContent = `🗺️ **学习路径概览**\n\n**当前进度**：${mastered}/${learningPath.length} 个知识点已掌握\n\n**学习路径**：\n${learningPath.map((n, i) => `${n.status === 'mastered' ? '✅' : n.id === currentNodeId ? '📍' : '⬜'} ${i + 1}. ${n.title}`).join('\n')}\n\n继续加油！你已经完成了 ${Math.round((mastered / learningPath.length) * 100)}%`;
        } else if (userInput.includes('提示') || userInput.includes('帮助')) {
          aiContent = `💡 **学习提示**\n\n关于「${learningPath.find(n => n.id === currentNodeId)?.title}」，这里有一些提示：\n\n1. 🔑 **关键词**：注意理解核心术语的含义\n2. 🔗 **联系**：思考与前面知识点的关联\n3. 📝 **练习**：尝试用自己的话复述\n\n需要更具体的帮助吗？`;
        } else {
          aiContent = `很好的思考！👍\n\n让我来引导你深入理解这个概念...\n\n**关键点**：\n1. 首先，我们需要明确...\n2. 其次，要理解...\n3. 最后，可以这样应用...\n\n🎯 **小测验**：现在，你能用自己的话解释一下吗？这样我可以确认你是否理解了。`;
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

  // 切换学习模式
  const handleModeChange = (mode: LearningMode) => {
    onUpdateConfig({ ...config, learningMode: mode });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部状态栏 */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">返回</span>
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-primary-600" />
            <h1 className="text-base font-semibold text-gray-900">{config.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 计时器 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
            <Clock size={14} className="text-primary-600" />
            <span className="text-sm font-medium text-primary-700">{formatTime(elapsedTime)}</span>
          </div>
          <button
            onClick={toggleTimer}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title={isTimerRunning ? '暂停计时' : '继续计时'}
          >
            {isTimerRunning ? <Pause size={16} className="text-gray-700" /> : <Play size={16} className="text-gray-700" />}
          </button>
          <button
            onClick={resetTimer}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="重置计时器"
          >
            <RotateCcw size={16} className="text-gray-700" />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Settings size={16} className="text-gray-700" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <Save size={16} />
            保存进度
          </button>
        </div>
      </header>

      {/* 主内容区 - 三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 */}
        <div style={{ width: `${leftWidth}%` }} className="bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {config.learningMode === 'ai_guided' ? (
            // 目标导向模式：上方AI资源 + 下方学习路径（类似学生端布局）
            <>
              {/* AI生成资源区域 - 占40% */}
              <div className="flex flex-col min-h-0" style={{ flex: '0 0 40%' }}>
                <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    AI 智能资源
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">根据学习进度动态生成</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {MOCK_AI_RESOURCES.map((resource) => (
                    <div
                      key={resource.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                        resource.status === 'generating'
                          ? 'bg-purple-50 border-2 border-purple-200 animate-pulse'
                          : resource.status === 'ready'
                          ? 'bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md'
                          : 'bg-gray-50 border border-gray-200 opacity-60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        resource.status === 'generating'
                          ? 'bg-purple-100'
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
                            <span className="text-purple-600 flex items-center gap-1">
                              <Activity size={10} className="animate-spin" />
                              正在生成...
                            </span>
                          ) : resource.status === 'ready' ? (
                            <span className="text-emerald-600">✓ 已就绪</span>
                          ) : (
                            '待生成'
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

              {/* 学习路径区域 - 占60% */}
              <div className="flex-1 flex flex-col min-h-0 border-t-2 border-emerald-200">
                <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Map size={16} className="text-emerald-500" />
                    学习路径
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    已完成 {learningPath.filter(n => n.status === 'mastered').length}/{learningPath.length} 个知识点
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {learningPath.map((node, idx) => (
                    <div
                      key={node.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        node.id === currentNodeId
                          ? 'bg-emerald-50 border-2 border-emerald-300 shadow-md'
                          : node.status === 'mastered'
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          node.status === 'mastered'
                            ? 'bg-green-500'
                            : node.id === currentNodeId
                            ? 'bg-emerald-500'
                            : 'bg-gray-300'
                        }`}
                      >
                        {node.status === 'mastered' ? (
                          <CheckCircle2 size={16} className="text-white" />
                        ) : node.id === currentNodeId ? (
                          <Circle size={16} className="text-white" />
                        ) : (
                          <span className="text-xs text-white font-medium">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            node.status === 'mastered'
                              ? 'text-green-700 line-through'
                              : node.id === currentNodeId
                              ? 'text-emerald-700'
                              : 'text-gray-500'
                          }`}
                        >
                          {node.title}
                        </p>
                        {node.estimatedTime && (
                          <p className="text-xs text-gray-400">预计 {node.estimatedTime} 分钟</p>
                        )}
                      </div>
                      {node.id === currentNodeId && (
                        <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium animate-pulse">
                          当前
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // 自由探索模式：Sources 面板（类似 NotebookLM）+ 任务区（类似 student-workbench）
            <>
              {/* 资源区域 - 占60% */}
              <div className="flex flex-col min-h-0" style={{ flex: '0 0 60%' }}>
                <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50">
                  <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FolderOpen size={16} className="text-primary-500" />
                    Sources
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">自由浏览，随时提问</p>
                </div>

                {/* 添加资源入口 */}
                <div className="p-3 border-b border-gray-100 space-y-2">
                  <button className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
                    <Plus size={16} />
                    添加资料来源
                  </button>
                  <div className="flex gap-2">
                    <button className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">
                      <Upload size={12} />
                      上传文件
                    </button>
                    <button className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">
                      <Link size={12} />
                      粘贴链接
                    </button>
                  </div>
                </div>

                {/* 资源列表 - 使用 mockResources */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {/* 全选控制 */}
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-xs text-gray-500">{mockResources.length} 个来源</span>
                    <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">全选</button>
                  </div>

                  {mockResources.map((resource) => (
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
                </div>
              </div>

              {/* 任务区域 - 可折叠 (类似 student-workbench) */}
              <div className={`flex flex-col min-h-0 border-t-2 border-amber-200 transition-all ${
                collapsedPanels.tasks ? '' : 'flex-1'
              }`}>
                {/* 可折叠的标题栏 */}
                <div
                  className="p-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 cursor-pointer hover:bg-amber-100/50 transition-colors"
                  onClick={() => togglePanel('tasks')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <ListChecks size={16} className="text-amber-500" />
                      学习任务
                      {generatedTasks.length > 0 && (
                        <span className="text-xs bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full">
                          {generatedTasks.length}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      {collapsedPanels.tasks && generatedTasks.length === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateTest();
                          }}
                          disabled={isGeneratingTask}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-70"
                        >
                          {isGeneratingTask ? (
                            <>
                              <Activity size={12} className="animate-spin" />
                              生成中...
                            </>
                          ) : (
                            <>
                              <Zap size={12} />
                              生成测试
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
                  <p className="text-xs text-gray-500 mt-1">AI 生成的测试和练习</p>
                </div>

                {/* 可折叠的内容区域 */}
                {!collapsedPanels.tasks && (
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {generatedTasks.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <Zap size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs mb-3">点击"生成测试"创建学习任务</p>
                        <button
                          onClick={handleGenerateTest}
                          disabled={isGeneratingTask}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto disabled:opacity-70"
                        >
                          {isGeneratingTask ? (
                            <>
                              <Activity size={14} className="animate-spin" />
                              生成中...
                            </>
                          ) : (
                            <>
                              <Zap size={14} />
                              生成测试
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      generatedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            task.type === 'quiz' ? 'bg-amber-100' : 'bg-purple-100'
                          }`}>
                            {task.type === 'quiz' ? (
                              <Zap size={18} className="text-amber-600" />
                            ) : (
                              <Brain size={18} className="text-purple-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              {task.type === 'quiz' && task.questionCount && (
                                <span>{task.questionCount} 道题</span>
                              )}
                              <span>•</span>
                              <span>{new Date(task.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      ))
                    )}

                    {/* 生成更多任务按钮 - 仅当已有任务时显示 */}
                    {generatedTasks.length > 0 && (
                      <button
                        onClick={handleGenerateTest}
                        disabled={isGeneratingTask}
                        className="w-full px-3 py-2.5 border-2 border-dashed border-amber-300 rounded-xl text-sm text-amber-600 hover:border-amber-400 hover:bg-amber-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isGeneratingTask ? (
                          <>
                            <Activity size={14} className="animate-spin" />
                            生成中...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            AI 生成更多任务
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

        {/* 左侧调整器 */}
        <Resizer
          onResize={(delta) => {
            const newLeftWidth = Math.max(18, Math.min(35, leftWidth + delta));
            setLeftWidth(newLeftWidth);
          }}
        />

        {/* 中间聊天面板 */}
        <div style={{ width: `${100 - leftWidth - rightWidth}%` }} className="flex flex-col bg-gray-50">
          {/* 对话区头部 + 模式切换 */}
          <div className="p-3 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <MessageSquare size={18} className="text-accent-600" />
                AI 学习对话
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
                自由探索
              </button>
              <button
                onClick={() => handleModeChange('ai_guided')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  config.learningMode === 'ai_guided'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <GitBranch size={14} className="inline mr-1" />
                AI 自适应学习
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
                    <span className="text-sm">思考中...</span>
                  </div>
                </div>
              </div>
            )}

            {/* 阶段性反思引导卡片 */}
            {messages.length >= 6 && (
              <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center">
                    <Lightbulb size={18} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-2">💭 阶段性反思时间</h4>
                    <p className="text-xs text-amber-700 mb-3">
                      你已经学习了一段时间，让我们暂停一下，回顾总结学到的内容。
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-amber-700">1</span>
                        </div>
                        <p className="text-xs text-amber-800">今天学习的最重要的三个知识点是什么？</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-amber-700">2</span>
                        </div>
                        <p className="text-xs text-amber-800">你遇到了哪些困难？是如何解决的？</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-amber-700">3</span>
                        </div>
                        <p className="text-xs text-amber-800">这些知识可以在生活中的哪些地方应用？</p>
                      </div>
                    </div>
                    <button className="mt-3 w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5">
                      <MessageCircle size={14} />
                      开始反思
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 输入框 */}
          <div className="p-3 bg-white border-t border-gray-200">
            {/* Quick Actions - above input */}
            <div className="mb-3 flex flex-wrap gap-2">
              {(config.learningMode === 'self_directed' ? SELF_DIRECTED_QUICK_ACTIONS : AI_GUIDED_QUICK_ACTIONS).map((action) => {
                const IconComp = action.icon;
                const colorMap: Record<string, string> = {
                  primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100 border-primary-200',
                  emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200',
                  amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200',
                  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
                };
                return (
                  <button
                    key={action.id}
                    onClick={() => setInputMessage(action.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${colorMap[action.color]}`}
                  >
                    <IconComp size={14} />
                    {action.label}
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder={
                  config.learningMode === 'self_directed'
                    ? '有什么问题？随时问我...'
                    : '回答问题或提出疑问...'
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

        {/* 右侧调整器 */}
        <Resizer
          onResize={(delta) => {
            const newRightWidth = Math.max(18, Math.min(35, rightWidth - delta));
            setRightWidth(newRightWidth);
          }}
        />

        {/* 右侧面板 */}
        <div style={{ width: `${rightWidth}%` }} className="bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
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
              工作区
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
              学习状态
            </button>
          </div>

          {/* 内容区 */}
          {rightTab === 'workspace' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 笔记区域 - 上半部分 */}
              <div className="flex-1 min-h-0 overflow-hidden" style={{ flex: config.learningMode === 'self_directed' ? '0 0 55%' : '1 1 auto' }}>
                <EnhancedNotesPanel learningMode={config.learningMode} />
              </div>

              {/* Studio 工具区域 - 仅自由探索模式显示 (类似 NotebookLM) */}
              {config.learningMode === 'self_directed' && (
                <div className="border-t-2 border-purple-200 bg-gradient-to-b from-purple-50/50 to-white" style={{ flex: '0 0 45%' }}>
                  <div className="p-3 border-b border-purple-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2">
                        <Sparkles size={14} className="text-purple-600" />
                        Studio
                      </h3>
                      <span className="text-xs text-purple-500">AI 学习工具</span>
                    </div>
                  </div>
                  <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(100% - 48px)' }}>
                    <div className="grid grid-cols-2 gap-2">
                      {STUDIO_TOOLS.map((tool) => (
                        <button
                          key={tool.id}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            tool.status === 'generating'
                              ? 'bg-purple-50 border-purple-200 animate-pulse'
                              : tool.status === 'ready'
                              ? 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer'
                              : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                          }`}
                          disabled={tool.status === 'pending'}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{tool.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">{tool.label}</p>
                              {tool.status === 'generating' ? (
                                <p className="text-xs text-purple-600 flex items-center gap-1 mt-0.5">
                                  <Activity size={10} className="animate-spin" />
                                  生成中...
                                </p>
                              ) : (
                                <p className="text-xs text-gray-400 mt-0.5 truncate">{tool.description}</p>
                              )}
                            </div>
                            {tool.status === 'ready' && (
                              <Pencil size={12} className="text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-3">
                      添加资料后，点击生成学习工具
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <LearningStatusPanel
              elapsedTime={elapsedTime}
              learningMode={config.learningMode}
              learningPath={learningPath}
            />
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
    </div>
  );
}