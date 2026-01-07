'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Video,
  FileText,
  FileSpreadsheet,
  Globe,
  Bot,
  MessageCircle,
  GitBranch,
  Send,
  Eye,
  Layout,
  FolderOpen,
  MessageSquare,
  Clock,
  Target,
  ListChecks,
  Zap,
  FileEdit,
  GripVertical,
  ChevronRight,
  Play,
  Download,
  Check,
  Brain,
  Sparkles,
  Activity,
  Layers,
  Pencil,
  Save,
  Pause,
  RotateCcw,
  AlertCircle,
  X,
  Lightbulb,
} from 'lucide-react';

// 类型定义
interface Resource {
  id: string;
  type: 'video' | 'pdf' | 'ppt' | 'web';
  title: string;
  description?: string;
  color: string;
  duration?: string;
  pages?: number;
  url?: string;
}

interface Task {
  id: string;
  type: 'quiz' | 'assignment';
  title: string;
  status: 'required' | 'optional';
  completed?: boolean;
  score?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface NoteConfig {
  title: string;
  description: string;
  subjects?: string[];
  grade?: string;
  resources: Resource[];
  tasks: Task[];
  interactionMode: 'free' | 'guided';
  noteTemplate: string;
}

// 可调整大小的分隔条组件
function Resizer({ onResize, position }: { onResize: (delta: number) => void; position: 'left' | 'right' }) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const viewportWidth = window.innerWidth;
      const deltaPercent = (delta / viewportWidth) * 100;
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
    <div
      onMouseDown={handleMouseDown}
      className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors relative group flex-shrink-0"
    >
      <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white rounded-full p-1">
          <GripVertical size={12} />
        </div>
      </div>
    </div>
  );
}

// 主组件
export default function StudentWorkbenchPage() {
  // 布局状态
  const [leftWidth, setLeftWidth] = useState(25);
  const [rightWidth, setRightWidth] = useState(25);

  // 交互模式
  const [chatMode, setChatMode] = useState<'free' | 'guided'>('free');

  // 右侧工作室标签
  const [rightTab, setRightTab] = useState<'workspace' | 'status'>('workspace');

  // 聊天消息
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  // 计时器状态
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 模态框状态
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // 模拟配置数据
  const config: NoteConfig = {
    title: '水循环与水资源',
    description: '探索水的循环过程，理解水资源的重要性',
    subjects: ['科学', '地理', '环境教育'],
    grade: '四年级',
    resources: [
      {
        id: 'r1',
        type: 'video',
        title: '水循环基础知识',
        description: '了解水循环的基本概念',
        color: 'red',
        duration: '10:25',
      },
      {
        id: 'r2',
        type: 'pdf',
        title: '水循环知识点总结',
        color: 'blue',
        pages: 12,
      },
    ],
    tasks: [
      {
        id: 't1',
        type: 'quiz',
        title: '水循环知识自测',
        status: 'required',
      },
      {
        id: 't2',
        type: 'assignment',
        title: '节水方案设计',
        status: 'optional',
      },
    ],
    interactionMode: 'free',
    noteTemplate: 'cornell',
  };

  // 发送消息处理
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // 模拟AI回复
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: '这是一个很好的问题！让我来帮你理解...',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1000);
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setElapsedTime(0);
    setIsTimerRunning(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部状态栏 */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-blue-600" />
            <h1 className="text-base font-semibold text-gray-900">{config.title}</h1>
          </div>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{config.grade}</span>
            <span>•</span>
            <span>{config.subjects?.join(' · ')}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
            <Clock size={14} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{formatTime(elapsedTime)}</span>
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
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Save size={16} />
            保存进度
          </button>
        </div>
      </header>

      {/* 主内容区 - 三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：学习资料库 */}
        <LeftPanel
          config={config}
          width={leftWidth}
          onResourceClick={setSelectedResource}
          onTaskClick={setSelectedTask}
        />

        {/* 左侧调整器 */}
        <Resizer
          position="left"
          onResize={(delta) => {
            const newLeftWidth = Math.max(18, Math.min(35, leftWidth + delta));
            setLeftWidth(newLeftWidth);
          }}
        />

        {/* 中间：AI学习对话区 */}
        <CenterPanel
          config={config}
          chatMode={chatMode}
          setChatMode={setChatMode}
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={handleSendMessage}
          width={100 - leftWidth - rightWidth}
        />

        {/* 右侧调整器 */}
        <Resizer
          position="right"
          onResize={(delta) => {
            const newRightWidth = Math.max(18, Math.min(35, rightWidth - delta));
            setRightWidth(newRightWidth);
          }}
        />

        {/* 右侧：学习工作室 */}
        <RightPanel
          config={config}
          rightTab={rightTab}
          setRightTab={setRightTab}
          width={rightWidth}
          elapsedTime={elapsedTime}
          tasks={config.tasks}
        />
      </div>

      {/* 模态框 */}
      {selectedResource && (
        <ResourcePreviewModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

// 左侧面板 - 学习资料库
function LeftPanel({
  config,
  width,
  onResourceClick,
  onTaskClick,
}: {
  config: NoteConfig;
  width: number;
  onResourceClick: (resource: Resource) => void;
  onTaskClick: (task: Task) => void;
}) {
  return (
    <div style={{ width: `${width}%` }} className="bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* 资源列表头部 */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <FolderOpen size={16} className="text-blue-500" />
          学习资料库
        </h2>
        <p className="text-xs text-gray-500 mt-1">点击资源开始学习</p>
      </div>

      {/* 资源列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {config.resources.map((resource) => (
          <div
            key={resource.id}
            onClick={() => onResourceClick(resource)}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
          >
            <div className={`w-10 h-10 rounded-xl bg-${resource.color}-100 flex items-center justify-center`}>
              {resource.type === 'video' && <Video size={16} className={`text-${resource.color}-600`} />}
              {resource.type === 'pdf' && <FileText size={16} className={`text-${resource.color}-600`} />}
              {resource.type === 'ppt' && <FileSpreadsheet size={16} className={`text-${resource.color}-600`} />}
              {resource.type === 'web' && <Globe size={16} className={`text-${resource.color}-600`} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
              <p className="text-xs text-gray-400">{resource.duration || `${resource.pages}页`}</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* 任务列表 */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
          <ListChecks size={16} className="text-amber-500" />
          学习任务
        </h3>
        <div className="space-y-2">
          {config.tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="flex items-center gap-2 p-3 bg-white rounded-lg hover:bg-amber-50 cursor-pointer transition-colors border border-gray-200"
            >
              <div className={`w-8 h-8 rounded flex items-center justify-center ${
                task.status === 'required' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {task.type === 'quiz' ? (
                  <Zap size={14} className={task.status === 'required' ? 'text-red-600' : 'text-gray-500'} />
                ) : (
                  <FileEdit size={14} className={task.status === 'required' ? 'text-red-600' : 'text-gray-500'} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                <p className="text-xs text-gray-400">{task.type === 'quiz' ? '测验' : '作业'}</p>
              </div>
              {task.status === 'required' && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">必修</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 中间面板 - AI学习对话区
function CenterPanel({
  config,
  chatMode,
  setChatMode,
  messages,
  inputMessage,
  setInputMessage,
  onSendMessage,
  width,
}: any) {
  return (
    <div style={{ width: `${width}%` }} className="flex flex-col bg-gray-50">
      {/* 对话区头部 */}
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-600" />
            AI 学习对话
          </h2>
        </div>

        {/* 模式切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => setChatMode('free')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              chatMode === 'free'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MessageCircle size={14} className="inline mr-1" />
            自由对话
          </button>
          <button
            onClick={() => setChatMode('guided')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              chatMode === 'guided'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <GitBranch size={14} className="inline mr-1" />
            引导学习
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              {chatMode === 'free' ? '自由对话模式' : '引导学习模式'}
            </h3>
            <p className="text-sm text-gray-500">
              {chatMode === 'free'
                ? '向我提问任何关于课程的问题吧！'
                : '我将引导你一步步完成学习目标'}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'assistant' && (
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white border border-gray-200 rounded-tl-none'
              }`}
            >
              <p className={`text-sm leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                {message.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 输入框 */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="输入你的问题或想法..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={onSendMessage}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// 右侧面板 - 学习工作室
function RightPanel({ config, rightTab, setRightTab, width, elapsedTime, tasks }: any) {
  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedTasks = tasks?.filter((t: Task) => t.completed)?.length || 0;
  const totalTasks = tasks?.length || 1;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div style={{ width: `${width}%` }} className="bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      {/* 工作室头部 */}
      <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <h2 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
          <Layout size={16} className="text-emerald-600" />
          学习工作室
        </h2>
      </div>

      {/* 标签切换 */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setRightTab('workspace')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            rightTab === 'workspace'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
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
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Activity size={12} className="inline mr-1" />
          学习状态
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-3">
        {rightTab === 'workspace' ? (
          <div className="space-y-4">
            {/* 笔记区 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-600">康奈尔笔记</span>
                <button className="text-xs text-blue-600 hover:text-blue-700">
                  <Eye size={12} className="inline mr-1" />
                  模板说明
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 min-h-[200px]">
                <textarea
                  placeholder="在这里记录笔记..."
                  className="w-full h-full bg-transparent border-none outline-none resize-none text-sm text-gray-700"
                />
              </div>
            </div>

            {/* 快捷工具 */}
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                <Sparkles size={12} className="inline mr-1" />
                AI总结
              </button>
              <button className="p-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors">
                <Brain size={12} className="inline mr-1" />
                知识图谱
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 学习统计 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={12} className="text-blue-600" />
                  <span className="text-xs text-blue-700">专注时长</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{formatMinutes(elapsedTime)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target size={12} className="text-emerald-600" />
                  <span className="text-xs text-emerald-700">完成进度</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{completionRate}%</p>
              </div>
            </div>

            {/* 学习建议 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} className="text-purple-600" />
                <span className="text-xs font-bold text-purple-700">AI学习建议</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                开始你的学习之旅吧！建议先浏览左侧的学习资料，有疑问随时向我提问。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 资源预览模态框
function ResourcePreviewModal({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-[700px] max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 模态框头部 */}
        <div className={`bg-gradient-to-r from-${resource.color}-500 to-${resource.color}-600 text-white p-5 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {resource.type === 'video' && <Video size={24} className="text-white" />}
              {resource.type === 'pdf' && <FileText size={24} className="text-white" />}
              {resource.type === 'ppt' && <FileSpreadsheet size={24} className="text-white" />}
              {resource.type === 'web' && <Globe size={24} className="text-white" />}
            </div>
            <div>
              <h3 className="text-lg font-bold">{resource.title}</h3>
              <p className="text-sm text-white/80">{resource.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 模态框内容 */}
        <div className="p-6">
          {resource.type === 'video' && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
                <div className="text-center text-white">
                  <Video size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-70">视频播放器占位</p>
                  <p className="text-xs opacity-50 mt-1">时长: {resource.duration}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  开始播放
                </button>
                <button className="px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>
          )}

          {resource.type === 'pdf' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600">PDF 文档预览</p>
                <p className="text-xs text-gray-400 mt-1">共 {resource.pages} 页</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  打开阅读
                </button>
                <button className="px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>
          )}

          {resource.type === 'ppt' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                <FileSpreadsheet size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600">PPT 演示文稿预览</p>
                <p className="text-xs text-gray-400 mt-1">共 {resource.pages} 页</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  打开查看
                </button>
                <button className="px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>
          )}

          {resource.type === 'web' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                <Globe size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600">外部网页链接</p>
                <p className="text-xs text-gray-400 mt-1">{resource.url}</p>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                在新窗口打开
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 任务详情模态框
function TaskDetailModal({ task, onClose }: { task: Task; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-[600px] max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 模态框头部 */}
        <div className={`bg-gradient-to-r ${task.type === 'quiz' ? 'from-amber-500 to-orange-600' : 'from-purple-500 to-pink-600'} text-white p-5 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {task.type === 'quiz' ? <Zap size={24} /> : <FileEdit size={24} />}
            </div>
            <div>
              <h3 className="text-lg font-bold">{task.title}</h3>
              <p className="text-sm text-white/80">{task.type === 'quiz' ? '知识测验' : '实践作业'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 模态框内容 */}
        <div className="p-6">
          {task.type === 'quiz' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">测验说明</p>
                    <p className="text-xs">本测验包含多道选择题，用于检验你对学习内容的掌握程度。</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">题目数量</span>
                  <span className="font-medium text-gray-900">10 题</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">预计时间</span>
                  <span className="font-medium text-gray-900">15 分钟</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">及格分数</span>
                  <span className="font-medium text-gray-900">60 分</span>
                </div>
              </div>

              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition-colors">
                开始测验
              </button>
            </div>
          )}

          {task.type === 'assignment' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-purple-600 mt-0.5" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">作业说明</p>
                    <p className="text-xs">请根据所学知识完成以下实践任务，并提交你的成果。</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 min-h-[120px]">
                <p className="text-sm text-gray-700 leading-relaxed">
                  任务要求：请设计一个节约用水的方案，说明具体措施和预期效果。可以采用文字、图片或视频等形式提交。
                </p>
              </div>

              <div className="space-y-2">
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-medium transition-colors">
                  开始作业
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors">
                  查看已提交内容
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
