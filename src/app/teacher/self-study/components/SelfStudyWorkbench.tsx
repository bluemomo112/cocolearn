'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SpaceConfig, LearningMode, LEARNING_MODE_CONFIG } from '@/types/self-study';
import { Resource, Task } from '@/types/shared-context';
import {
  ArrowLeft, Send, Settings, BookOpen, Brain, Sparkles, FileText, Video,
  FileSpreadsheet, Plus, Upload, Link, GripVertical, X, Check, Zap, FileEdit,
  Activity, Pencil, Save, Target, Lightbulb, MessageCircle, Clock, FolderOpen,
  ListChecks, ChevronRight, Play, Download, Eye,
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

export default function SelfStudyWorkbench({ config, onBack, onUpdateConfig }: SelfStudyWorkbenchProps) {
  const [leftWidth, setLeftWidth] = useState(25);
  const [rightWidth, setRightWidth] = useState(25);
  const [learningMode, setLearningMode] = useState<LearningMode>(config.learningMode);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [resources] = useState<Resource[]>(config.resources);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcomeMessage = learningMode === 'ai_guided'
      ? `你好！我将带你系统学习「${config.topic || config.title}」。\n\n首先，让我了解一下你目前的基础。你能用自己的话说说你已经知道什么吗？`
      : `你好！我是你的学习助手。关于「${config.topic || config.title}」，你可以随时问我任何问题。\n\n有什么想了解的吗？`;
    setMessages([{ id: 'welcome', role: 'assistant', content: welcomeMessage, timestamp: new Date() }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMessage: ChatMessage = { id: `msg_${Date.now()}`, role: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const aiReply: ChatMessage = {
      id: `msg_${Date.now()}_ai`,
      role: 'assistant',
      content: learningMode === 'ai_guided'
        ? `这是一个很好的问题！让我来帮你理解。\n\n首先，我们需要明确几个关键概念...\n\n你觉得这样解释清楚吗？`
        : `关于你的问题，这里有一些信息：\n\n1. 首先...\n2. 其次...\n\n还有其他想了解的吗？`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiReply]);
    setIsLoading(false);
  };

  const handleModeChange = (mode: LearningMode) => {
    setLearningMode(mode);
    onUpdateConfig({ ...config, learningMode: mode });
    setMessages(prev => [...prev, {
      id: `mode_${Date.now()}`,
      role: 'assistant',
      content: `已切换到「${LEARNING_MODE_CONFIG[mode].label}」模式。${LEARNING_MODE_CONFIG[mode].description}`,
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">返回</span>
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="font-semibold text-gray-900">{config.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* 学习模式切换 */}
          {(['self_directed', 'ai_guided'] as LearningMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                learningMode === mode ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {LEARNING_MODE_CONFIG[mode].label}
            </button>
          ))}
          <div className="h-6 w-px bg-gray-200" />
          {/* 设置按钮 - 右上角齿轮图标 */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="设置"
          >
            <Settings size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* 三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 - 资源和快捷操作 */}
        <div className="bg-white border-r border-gray-200 flex flex-col overflow-hidden" style={{ width: `${leftWidth}%` }}>
          <div className="flex-1 overflow-y-auto">
            {/* 资源区域 */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FolderOpen size={16} className="text-primary-500" />
                  学习资料
                </h3>
                <button className="w-7 h-7 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center transition-colors border border-gray-200">
                  <Plus size={16} className="text-gray-600" />
                </button>
              </div>
              {resources.length === 0 ? (
                <div className="text-center py-6">
                  <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">上传资料开始学习</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {resources.map(resource => (
                    <div key={resource.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-primary-200 cursor-pointer transition-all">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        {resource.type === 'video' ? <Video size={18} className="text-primary-600" /> : <FileText size={18} className="text-primary-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{resource.title}</p>
                        <p className="text-xs text-gray-500 truncate">{resource.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 快捷操作 */}
            <div className="p-4">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                <Zap size={16} className="text-amber-500" />
                快捷操作
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Target, label: '考考我', color: 'amber' },
                  { icon: Lightbulb, label: '总结要点', color: 'purple' },
                  { icon: MessageCircle, label: '深入讨论', color: 'blue' },
                ].map(({ icon: Icon, label, color }) => (
                  <button key={label} className={`w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-${color}-200 hover:bg-${color}-50 transition-all text-left`}>
                    <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                      <Icon size={16} className={`text-${color}-600`} />
                    </div>
                    <span className="text-sm text-gray-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Resizer onResize={(delta) => setLeftWidth(prev => Math.max(15, Math.min(40, prev + delta)))} />

        {/* 中间面板 - AI 对话 */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none'
                }`}>
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-primary-500 animate-spin" />
                    <span className="text-sm text-gray-500">思考中...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="输入你的问题..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        <Resizer onResize={(delta) => setRightWidth(prev => Math.max(15, Math.min(40, prev - delta)))} />

        {/* 右侧面板 - 只有笔记 */}
        <div className="bg-white border-l border-gray-200 flex flex-col overflow-hidden" style={{ width: `${rightWidth}%` }}>
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Pencil size={16} className="text-primary-500" />
              学习笔记
            </h3>
            <button onClick={() => setIsEditingNote(!isEditingNote)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              {isEditingNote ? '完成' : '编辑'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {isEditingNote ? (
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="在这里记录你的学习笔记..."
                className="w-full h-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            ) : noteContent ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{noteContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12">
                <Pencil size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-3">还没有笔记</p>
                <button onClick={() => setIsEditingNote(true)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  开始记录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 设置弹窗 */}
      {showSettings && (
        <SettingsModal
          config={config}
          onSave={(newConfig) => onUpdateConfig(newConfig)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
