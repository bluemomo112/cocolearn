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
