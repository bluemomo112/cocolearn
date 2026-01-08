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
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Sidebar,
  Image as ImageIcon,
  Mic,
  Trash2,
} from 'lucide-react';
import CompetencyRadarChart from '../components/CompetencyRadarChart';
import {
  mockLearnerProfile,
  mockCourseCompetencyReport,
  mockAIObservations,
  mockCompetencyGuidedMessages,
  getCompetencyStars,
  getTrendIcon,
  COMPETENCY_METADATA,
  CompetencyType,
  CompetencyRating,
} from '@/data/mockCompetencyData';

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
  description?: string;
  questions?: TaskQuestion[];
  submissionPlaceholder?: string;
}

interface TaskQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
}

// 任务展开卡片组件 - 在中间聊天区显示
function TaskExpandedCard({
  task,
  onClose,
  onComplete,
  isCompleted,
}: {
  task: Task;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  isCompleted: boolean;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');

  const handleSubmit = () => {
    onComplete(task.id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden mb-4">
      {/* 卡片头部 */}
      <div className={`px-4 py-3 flex items-center justify-between ${
        task.type === 'quiz'
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            task.type === 'quiz' ? 'bg-amber-100' : 'bg-blue-100'
          }`}>
            {task.type === 'quiz' ? (
              <Zap size={18} className="text-amber-600" />
            ) : (
              <FileEdit size={18} className="text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{task.title}</h3>
            <p className="text-xs text-gray-500">
              {task.status === 'required' ? '必修任务' : '选修任务'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* 卡片内容 */}
      <div className="p-4">
        {/* 测验类型任务 */}
        {task.type === 'quiz' && task.questions && (
          <div className="space-y-4">
            {task.questions.map((q, idx) => (
              <div key={q.id} className="space-y-3">
                <p className="text-sm text-gray-700 font-medium">
                  {idx + 1}. {q.question}
                </p>
                {q.options && (
                  <div className="space-y-2">
                    {q.options.map((option, optIdx) => (
                      <label
                        key={optIdx}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedOption === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === option
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedOption === option && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 作业类型任务 */}
        {task.type === 'assignment' && (
          <div className="space-y-3">
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder={task.submissionPlaceholder || '请在这里提交你的作业内容...'}
              className="w-full h-32 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={isCompleted}
          className={`mt-4 w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isCompleted
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isCompleted ? (
            <>
              <Check size={16} />
              已完成
            </>
          ) : (
            <>
              <Check size={16} />
              提交任务
            </>
          )}
        </button>
      </div>
    </div>
  );
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

  // 聊天消息 - 使用能力培养引导演示对话
  const [messages, setMessages] = useState<ChatMessage[]>(mockCompetencyGuidedMessages as ChatMessage[]);
  const [inputMessage, setInputMessage] = useState('');

  // 计时器状态
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 左侧内容状态
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isResourceFullscreen, setIsResourceFullscreen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // 笔记面板状态
  const [isNotePanelOpen, setIsNotePanelOpen] = useState(false);

  // 当前展开的任务
  const [expandedTask, setExpandedTask] = useState<Task | null>(null);

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
        questions: [
          {
            id: 'q1',
            question: '水循环的主要驱动力是什么？',
            options: ['太阳能', '风能', '地热能', '潮汐能'],
            correctAnswer: '太阳能',
          },
          {
            id: 'q2',
            question: '以下哪个不是水循环的主要环节？',
            options: ['蒸发', '降水', '光合作用', '径流'],
            correctAnswer: '光合作用',
          },
        ],
      },
      {
        id: 't2',
        type: 'assignment',
        title: '节水方案设计',
        status: 'optional',
        submissionPlaceholder: '请描述你的节水方案，包括：\n1. 方案名称\n2. 适用场景\n3. 具体措施\n4. 预期效果',
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

  // 切换任务完成状态
  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
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
          selectedResource={selectedResource}
          isResourceFullscreen={isResourceFullscreen}
          setSelectedResource={setSelectedResource}
          setIsResourceFullscreen={setIsResourceFullscreen}
          completedTasks={completedTasks}
          toggleTaskCompletion={toggleTaskCompletion}
          onTaskClick={(task: Task) => setExpandedTask(task)}
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
          expandedTask={expandedTask}
          onCloseTask={() => setExpandedTask(null)}
          onCompleteTask={toggleTaskCompletion}
          completedTasks={completedTasks}
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
          isNotePanelOpen={isNotePanelOpen}
          setIsNotePanelOpen={setIsNotePanelOpen}
        />
      </div>
    </div>
  );
}

// 左侧面板 - 学习资料库（嵌入式显示）
function LeftPanel({
  config,
  width,
  selectedResource,
  isResourceFullscreen,
  setSelectedResource,
  setIsResourceFullscreen,
  completedTasks,
  toggleTaskCompletion,
  onTaskClick,
}: {
  config: NoteConfig;
  width: number;
  selectedResource: Resource | null;
  isResourceFullscreen: boolean;
  setSelectedResource: (resource: Resource | null) => void;
  setIsResourceFullscreen: (fullscreen: boolean) => void;
  completedTasks: Set<string>;
  toggleTaskCompletion: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}) {
  const [activeView, setActiveView] = useState<'list' | 'resource'>('list');

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    setActiveView('resource');
  };

  const handleBackToList = () => {
    setActiveView('list');
    setSelectedResource(null);
    setIsResourceFullscreen(false);
  };

  return (
    <div style={{ width: `${width}%` }} className="bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* 资源列表视图 */}
      {activeView === 'list' && (
        <>
          {/* 资源区域 - 占50% */}
          <div className="flex-1 flex flex-col min-h-0" style={{ flex: '1 1 50%' }}>
            {/* 资源列表头部 */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
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
                  onClick={() => handleResourceClick(resource)}
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
          </div>

          {/* 任务区域 - 占50% */}
          <div className="flex-1 flex flex-col min-h-0 border-t border-gray-200" style={{ flex: '1 1 50%' }}>
            {/* 任务列表头部 */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ListChecks size={16} className="text-amber-500" />
                学习任务
              </h3>
              <p className="text-xs text-gray-500 mt-1">点击任务在对话区展开</p>
            </div>

            {/* 任务列表 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {config.tasks.map((task) => {
                const isCompleted = completedTasks.has(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group border-2 ${
                      isCompleted
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? 'bg-green-100'
                          : task.type === 'quiz'
                          ? 'bg-amber-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={18} className="text-green-600" />
                      ) : task.type === 'quiz' ? (
                        <Zap size={18} className="text-amber-600" />
                      ) : (
                        <FileEdit size={18} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isCompleted ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400">{task.type === 'quiz' ? '测验' : '作业'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isCompleted && task.status === 'required' && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">必修</span>
                      )}
                      {isCompleted && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">已完成</span>
                      )}
                      <ChevronRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 资源查看视图 */}
      {activeView === 'resource' && selectedResource && (
        <ResourceViewer
          resource={selectedResource}
          isFullscreen={isResourceFullscreen}
          setIsFullscreen={setIsResourceFullscreen}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
}

// 资源查看器（嵌入式，支持全屏）
function ResourceViewer({
  resource,
  isFullscreen,
  setIsFullscreen,
  onBack,
}: {
  resource: Resource;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  onBack: () => void;
}) {
  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* 头部导航 */}
      <div className={`p-4 border-b border-gray-200 bg-gradient-to-r from-${resource.color}-500 to-${resource.color}-600 text-white flex items-center justify-between`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate">{resource.title}</h3>
            <p className="text-xs text-white/80">{resource.description}</p>
          </div>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ml-2"
          title={isFullscreen ? '退出全屏' : '全屏'}
        >
          {isFullscreen ? <X size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {resource.type === 'video' && (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <Video size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-70">视频播放器</p>
                <p className="text-xs opacity-50 mt-1">时长: {resource.duration}</p>
              </div>
            </div>
          </div>
        )}

        {resource.type === 'pdf' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300 min-h-[400px] flex flex-col items-center justify-center">
              <FileText size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600">PDF 文档阅读器</p>
              <p className="text-xs text-gray-400 mt-1">共 {resource.pages} 页</p>
            </div>
          </div>
        )}

        {resource.type === 'ppt' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300 min-h-[400px] flex flex-col items-center justify-center">
              <FileSpreadsheet size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600">PPT 演示文稿</p>
              <p className="text-xs text-gray-400 mt-1">共 {resource.pages} 页</p>
            </div>
          </div>
        )}

        {resource.type === 'web' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300 min-h-[400px] flex flex-col items-center justify-center">
              <Globe size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600">外部网页</p>
              <p className="text-xs text-gray-400 mt-2 break-all">{resource.url}</p>
            </div>
          </div>
        )}
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
  expandedTask,
  onCloseTask,
  onCompleteTask,
  completedTasks,
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
        {messages.length === 0 && !expandedTask && (
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

        {messages.map((message: ChatMessage) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'assistant' && (
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] ${
                message.role === 'user'
                  ? ''
                  : 'flex flex-col gap-2'
              }`}
            >
              {/* 能力培养提示标签 (仅AI消息) */}
              {message.role === 'assistant' && (message as any).competencyHint && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg w-fit">
                  <Target size={12} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">
                    培养 {COMPETENCY_METADATA[(message as any).competencyHint.type as CompetencyType]?.name}
                  </span>
                  <span className="text-xs text-purple-500">• {(message as any).competencyHint.strategy}</span>
                </div>
              )}

              {/* 消息内容 */}
              <div
                className={`p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 rounded-tl-none'
                }`}
              >
                <p className={`text-sm leading-relaxed whitespace-pre-line ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        ))}

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

        {/* 展开的任务卡片 - 在对话最下方 */}
        {expandedTask && (
          <TaskExpandedCard
            task={expandedTask}
            onClose={onCloseTask}
            onComplete={onCompleteTask}
            isCompleted={completedTasks.has(expandedTask.id)}
          />
        )}
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

// 能力成长面板组件
function CompetencyGrowthPanel() {
  const [showCrossCoursProfile, setShowCrossCoursProfile] = useState(false);

  // 获取当前课程的能力评估（合并教师指定和AI检测的能力）
  const currentCompetencies: Partial<Record<CompetencyType, CompetencyRating>> = {};

  // 从assignedCompetencies提取
  Object.entries(mockCourseCompetencyReport.assignedCompetencies).forEach(([type, assessment]) => {
    if (assessment) {
      currentCompetencies[type as CompetencyType] = assessment.rating as CompetencyRating;
    }
  });

  // 从detectedCompetencies提取（如果没有在assigned中）
  Object.entries(mockCourseCompetencyReport.detectedCompetencies).forEach(([type, assessment]) => {
    if (assessment && !currentCompetencies[type as CompetencyType]) {
      currentCompetencies[type as CompetencyType] = assessment.rating as CompetencyRating;
    }
  });

  return (
    <div className="space-y-4">
      {/* 当前课程能力雷达图 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <Award size={14} className="text-blue-600" />
          <span className="text-xs font-bold text-blue-700">本课程能力画像</span>
        </div>
        <CompetencyRadarChart
          competencies={currentCompetencies}
          size="small"
          showLegend={false}
        />
      </div>

      {/* AI实时观察 */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-purple-600" />
          <span className="text-xs font-bold text-purple-700">AI实时观察</span>
        </div>
        <div className="space-y-3">
          {mockAIObservations.slice(0, 2).map((obs) => {
            return (
              <div key={obs.id} className="bg-white/80 rounded-lg p-3 border border-purple-100">
                <div className="flex items-start gap-2 mb-2">
                  <div className="text-lg mt-0.5 flex-shrink-0">{obs.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-700 capitalize">
                        {obs.type === 'praise' ? '赞赏' : obs.type === 'suggestion' ? '建议' : '洞察'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(obs.timestamp).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {obs.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 跨课程能力画像 (可折叠) */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 overflow-hidden">
        <button
          onClick={() => setShowCrossCoursProfile(!showCrossCoursProfile)}
          className="w-full p-4 flex items-center justify-between hover:bg-emerald-100/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">我的跨课程能力画像</span>
          </div>
          {showCrossCoursProfile ? (
            <ChevronUp size={14} className="text-emerald-600" />
          ) : (
            <ChevronDown size={14} className="text-emerald-600" />
          )}
        </button>

        {showCrossCoursProfile && (
          <div className="p-4 pt-0 space-y-3">
            {/* 全局能力趋势 */}
            {Object.entries(mockLearnerProfile.globalCompetencies).map(([type, comp]: [string, any]) => {
              const metadata = COMPETENCY_METADATA[type as keyof typeof COMPETENCY_METADATA];
              if (!comp || !metadata) return null;

              return (
                <div key={type} className="bg-white/80 rounded-lg p-3 border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: metadata.color }}
                      />
                      <span className="text-xs font-medium text-gray-700">{metadata.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {getCompetencyStars(comp.overallRating)}
                      </span>
                      <span className="text-xs">{getTrendIcon(comp.trend)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    涉及课程: {comp.history.length} 门
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {comp.latestObservation}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 学习元数据 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
          <div className="flex items-center gap-1 mb-1">
            <Layers size={10} className="text-blue-600" />
            <span className="text-xs text-blue-700">已完成课程</span>
          </div>
          <p className="text-sm font-bold text-blue-600">
            {mockLearnerProfile.metadata.totalCoursesCompleted} 门
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={10} className="text-emerald-600" />
            <span className="text-xs text-emerald-700">累计学习</span>
          </div>
          <p className="text-sm font-bold text-emerald-600">
            {mockLearnerProfile.metadata.totalLearningTime} 小时
          </p>
        </div>
      </div>
    </div>
  );
}

// 增强笔记面板组件
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  images: string[];
  voiceRecordings: VoiceRecording[];
}

interface VoiceRecording {
  id: string;
  url: string;
  duration: number;
  timestamp: Date;
}

function EnhancedNotesPanel() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: '我的学习笔记',
      content: '# 欢迎使用增强笔记\n\n你可以：\n- 记录Markdown格式的笔记\n- 上传图片\n- 录制语音笔记\n\n开始你的学习之旅吧！',
      createdAt: new Date(),
      updatedAt: new Date(),
      images: [],
      voiceRecordings: []
    }
  ]);
  const [activeNoteId, setActiveNoteId] = useState('1');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  // 创建新笔记
  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: `笔记 ${notes.length + 1}`,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      images: [],
      voiceRecordings: []
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setShowNoteEditor(true);
  };

  // 删除笔记
  const deleteNote = (noteId: string) => {
    if (notes.length === 1) {
      alert('至少需要保留一个笔记');
      return;
    }
    const newNotes = notes.filter(n => n.id !== noteId);
    setNotes(newNotes);
    if (activeNoteId === noteId) {
      setActiveNoteId(newNotes[0].id);
    }
  };

  // 更新笔记内容
  const updateNote = (updates: Partial<Note>) => {
    setNotes(notes.map(n =>
      n.id === activeNoteId
        ? { ...n, ...updates, updatedAt: new Date() }
        : n
    ));
  };

  // 图片上传处理
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    Array.from(files).forEach(file => {
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

  // 录音计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // 开始/停止录音
  const toggleRecording = () => {
    if (isRecording) {
      // 停止录音（这里需要集成实际的录音API）
      setIsRecording(false);
      setRecordingTime(0);
      // 模拟保存录音
      const newRecording: VoiceRecording = {
        id: Date.now().toString(),
        url: '',
        duration: recordingTime,
        timestamp: new Date()
      };
      updateNote({
        voiceRecordings: [...activeNote.voiceRecordings, newRecording]
      });
    } else {
      // 开始录音
      setIsRecording(true);
      setRecordingTime(0);
      // 这里需要请求麦克风权限并开始录音
    }
  };

  // 格式化录音时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 简单的Markdown渲染（仅用于演示，生产环境建议使用react-markdown等库）
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-800 my-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-800 my-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-800 my-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-gray-800">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic text-gray-700">$1</em>')
      .replace(/\n/gim, '<br />');
  };

  // 如果没有打开编辑器，显示简洁的笔记列表
  if (!showNoteEditor) {
    return (
      <div className="flex flex-col h-full">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNote}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            添加笔记
          </button>
        </div>

        {/* 笔记列表 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => {
                setActiveNoteId(note.id);
                setShowNoteEditor(true);
              }}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
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

  // 笔记编辑器（展开状态）
  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
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
              isPreviewMode
                ? 'bg-gray-100 text-gray-700'
                : 'bg-blue-600 text-white'
            }`}
          >
            {isPreviewMode ? <Eye size={14} className="inline mr-1" /> : <Edit size={14} className="inline mr-1" />}
            {isPreviewMode ? '预览' : '编辑'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="上传图片"
            >
              <ImageIcon size={16} className="text-gray-600" />
            </button>
          </label>
          <button
            onClick={toggleRecording}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
              isRecording ? 'animate-pulse' : ''
            }`}
            title={isRecording ? '停止录音' : '开始录音'}
          >
            <Mic size={16} className={isRecording ? 'text-red-600' : 'text-gray-600'} />
          </button>
          {isRecording && (
            <span className="text-xs font-mono text-red-600">
              {formatTime(recordingTime)}
            </span>
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

      {/* 编辑/预览区 */}
      <div className="flex-1 overflow-y-auto p-3 bg-white">
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => updateNote({ title: e.target.value })}
          className="w-full text-lg font-bold text-gray-800 border-none outline-none mb-3 bg-transparent"
          placeholder="笔记标题"
        />

        {isPreviewMode ? (
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(activeNote.content) }}
          />
        ) : (
          <textarea
            value={activeNote.content}
            onChange={(e) => updateNote({ content: e.target.value })}
            className="w-full h-full min-h-[400px] bg-transparent border-none outline-none resize-none text-sm text-gray-700 leading-relaxed font-mono"
            placeholder="# 开始记录你的学习笔记...\n\n支持Markdown格式：\n- **粗体**\n- *斜体*\n- # 标题\n\n你也可以上传图片和录制语音笔记"
          />
        )}

        {/* 图片列表 */}
        {activeNote.images.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-bold text-gray-600 mb-2">
              图片 ({activeNote.images.length})
            </div>
            <div className="grid grid-cols-3 gap-2">
              {activeNote.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt={`uploaded-${idx}`}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                  />
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

        {/* 语音录音列表 */}
        {activeNote.voiceRecordings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-bold text-gray-600 mb-2">
              语音笔记 ({activeNote.voiceRecordings.length})
            </div>
            <div className="space-y-2">
              {activeNote.voiceRecordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <button className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Play size={12} />
                  </button>
                  <div className="flex-1">
                    <div className="text-xs text-gray-700">
                      语音笔记 {new Date(recording.timestamp).toLocaleString('zh-CN')}
                    </div>
                    <div className="text-xs text-gray-500">
                      时长: {formatTime(recording.duration)}
                    </div>
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

// 右侧面板 - 学习工作室
function RightPanel({ config, rightTab, setRightTab, width, elapsedTime, tasks, isNotePanelOpen, setIsNotePanelOpen }: any) {
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
          我的能力成长
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {rightTab === 'workspace' ? (
          <EnhancedNotesPanel />
        ) : (
          <div className="flex-1 overflow-y-auto p-3">
            <CompetencyGrowthPanel />
          </div>
        )}
      </div>
    </div>
  );
}
