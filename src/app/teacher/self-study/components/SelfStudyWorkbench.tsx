'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SpaceConfig, LearningMode, LearningPathNode, LEARNING_MODE_CONFIG } from '@/types/self-study';
import { Resource, Task } from '@/types/shared-context';
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

// Enhanced Notes Panel component
function EnhancedNotesPanel() {
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
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNote}
            className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-accent-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            添加笔记
          </button>
        </div>
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
    setInputMessage('');
    setIsLoading(true);

    // 模拟 AI 回复
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content:
          config.learningMode === 'self_directed'
            ? `这是一个很好的问题！让我来帮你解答...\n\n根据你的问题，我认为关键点在于...\n\n你还有其他想了解的吗？`
            : `很好的思考！👍\n\n让我来引导你深入理解这个概念...\n\n**关键点**：\n1. 首先...\n2. 其次...\n\n现在，你能用自己的话解释一下吗？这样我可以确认你是否理解了。`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiReply]);
      setIsLoading(false);
    }, 1000);
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
          {/* 模式切换 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleModeChange('self_directed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                config.learningMode === 'self_directed'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageCircle size={14} />
              自由探索
            </button>
            <button
              onClick={() => handleModeChange('ai_guided')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                config.learningMode === 'ai_guided'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <GitBranch size={14} />
              目标导向
            </button>
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
            // 目标导向模式：学习路径
            <>
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Map size={16} className="text-emerald-500" />
                  学习路径
                </h2>
                <p className="text-xs text-gray-500 mt-1">按顺序完成知识点</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {learningPath.map((node, idx) => (
                  <div
                    key={node.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      node.id === currentNodeId
                        ? 'bg-emerald-50 border-2 border-emerald-300'
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
                      <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">当前</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            // 自由探索模式：资源列表
            <>
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50">
                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FolderOpen size={16} className="text-primary-500" />
                  学习资料
                </h2>
                <p className="text-xs text-gray-500 mt-1">自由浏览，随时提问</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {config.resources.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无学习资料</p>
                    <p className="text-xs mt-1">可以上传资料或添加链接</p>
                  </div>
                ) : (
                  config.resources.map((resource: Resource) => (
                    <div
                      key={resource.id}
                      className="p-3 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          {resource.type === 'video' ? (
                            <Video size={18} className="text-primary-600" />
                          ) : resource.type === 'presentation' ? (
                            <FileSpreadsheet size={18} className="text-primary-600" />
                          ) : (
                            <FileText size={18} className="text-primary-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                          <p className="text-xs text-gray-400">{resource.type}</p>
                        </div>
                      </div>
                    </div>
                  ))
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
          {/* 对话区头部 */}
          <div className="p-3 bg-white border-b border-gray-200">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
              <MessageSquare size={18} className="text-accent-600" />
              AI 学习对话
            </h2>
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
            <EnhancedNotesPanel />
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