'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  SpaceConfig,
  LearningMode,
  LEARNING_MODE_CONFIG,
  mapLearningModeToInteractionMode,
} from '@/types/self-study';
import { Resource, Task } from '@/types/shared-context';
import {
  ArrowLeft,
  Send,
  Settings,
  BookOpen,
  Brain,
  Sparkles,
  FileText,
  Video,
  FileSpreadsheet,
  Plus,
  Upload,
  Link,
  GripVertical,
  X,
  Check,
  Zap,
  FileEdit,
  Activity,
  AlertCircle,
  Pencil,
  Save,
  ChevronDown,
  ChevronUp,
  Target,
  Lightbulb,
  MessageCircle,
} from 'lucide-react';

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

// 可调整大小的分隔条组件
function Resizer({ onResize }: { onResize: (delta: number) => void }) {
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
      className="w-1 bg-gray-200 hover:bg-primary-400 cursor-col-resize transition-colors relative group flex-shrink-0"
    >
      <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary-500 text-white rounded-full p-1">
          <GripVertical size={12} />
        </div>
      </div>
    </div>
  );
}

export default function SelfStudyWorkbench({
  config,
  onBack,
  onUpdateConfig,
}: SelfStudyWorkbenchProps) {
  // 布局状态
  const [leftWidth, setLeftWidth] = useState(25);
  const [rightWidth, setRightWidth] = useState(25);

  // 学习模式
  const [learningMode, setLearningMode] = useState<LearningMode>(config.learningMode);

  // 聊天状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 右侧面板标签
  const [rightTab, setRightTab] = useState<'notes' | 'settings'>('notes');

  // 笔记内容
  const [noteContent, setNoteContent] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);

  // 资源列表（模拟）
  const [resources, setResources] = useState<Resource[]>(config.resources);

  // 设置面板展开状态
  const [expandedSettings, setExpandedSettings] = useState<string[]>(['basic']);

  // 初始化欢迎消息
  useEffect(() => {
    const welcomeMessage = getWelcomeMessage(learningMode, config.topic);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 获取欢迎消息
  function getWelcomeMessage(mode: LearningMode, topic?: string): string {
    const topicText = topic ? `「${topic}」` : '这个主题';
    switch (mode) {
      case 'self_directed':
        return `你好！我是你的学习助手。关于${topicText}，你可以随时问我任何问题，我会尽力帮助你。\n\n有什么想了解的吗？`;
      case 'ai_guided':
        return `你好！我将带你系统学习${topicText}。\n\n首先，让我了解一下你目前的基础。你能用自己的话说说你已经知道什么吗？`;
      case 'diagnostic':
        return `你好！在开始学习${topicText}之前，让我先了解一下你的水平。\n\n我会问你几个问题，帮助我为你制定最适合的学习计划。准备好了吗？`;
      default:
        return `你好！欢迎来到学习空间。有什么我可以帮助你的吗？`;
    }
  }

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // 模拟 AI 回复
    await new Promise(resolve => setTimeout(resolve, 1000));

    const aiReply: ChatMessage = {
      id: `msg_${Date.now()}_ai`,
      role: 'assistant',
      content: generateAIResponse(inputMessage, learningMode),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiReply]);
    setIsLoading(false);
  };

  // 生成 AI 回复（模拟）
  function generateAIResponse(userMessage: string, mode: LearningMode): string {
    // 检测模式切换请求
    if (userMessage.includes('帮我规划') || userMessage.includes('带我学')) {
      return '好的，我来帮你规划学习路径。让我先了解一下你的学习目标是什么？\n\n*（已切换到"你带我学"模式）*';
    }
    if (userMessage.includes('自己看') || userMessage.includes('自己学')) {
      return '没问题，你可以自己探索。有任何问题随时问我！\n\n*（已切换到"我自己学"模式）*';
    }

    // 根据模式生成不同风格的回复
    if (mode === 'ai_guided') {
      return `这是一个很好的问题！让我来帮你理解。\n\n首先，我们需要明确几个关键概念...\n\n你觉得这样解释清楚吗？如果有不明白的地方，我们可以继续深入讨论。`;
    } else {
      return `关于你的问题，这里有一些信息可能对你有帮助：\n\n1. 首先...\n2. 其次...\n3. 最后...\n\n还有其他想了解的吗？`;
    }
  }

  // 切换学习模式
  const handleModeChange = (mode: LearningMode) => {
    setLearningMode(mode);
    onUpdateConfig({ ...config, learningMode: mode });

    // 添加模式切换提示消息
    const modeConfig = LEARNING_MODE_CONFIG[mode];
    setMessages(prev => [
      ...prev,
      {
        id: `mode_${Date.now()}`,
        role: 'assistant',
        content: `已切换到「${modeConfig.label}」模式。${modeConfig.description}`,
        timestamp: new Date(),
      },
    ]);
  };

  // 添加资源
  const handleAddResource = () => {
    // 实际应用中应该打开文件选择器或链接输入框
    alert('添加资源功能开发中...');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">返回</span>
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="font-semibold text-gray-900">{config.title}</h1>
        </div>

        {/* 学习模式切换 */}
        <div className="flex items-center gap-2">
          {(Object.entries(LEARNING_MODE_CONFIG) as [LearningMode, typeof LEARNING_MODE_CONFIG[LearningMode]][])
            .filter(([mode]) => mode !== 'diagnostic')
            .map(([mode, modeConfig]) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  learningMode === mode
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {modeConfig.label}
              </button>
            ))}
        </div>
      </header>

      {/* 三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 - 资源和任务 */}
        <div
          className="bg-white border-r border-gray-200 flex flex-col overflow-hidden"
          style={{ width: `${leftWidth}%` }}
        >
          {/* 资源区域 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <BookOpen size={18} className="text-primary-500" />
                  学习资料
                </h3>
                <button
                  onClick={handleAddResource}
                  className="w-7 h-7 rounded-lg bg-primary-50 hover:bg-primary-100 flex items-center justify-center transition-colors"
                >
                  <Plus size={16} className="text-primary-600" />
                </button>
              </div>

              {resources.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-3">还没有学习资料</p>
                  <button
                    onClick={handleAddResource}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    上传资料
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 cursor-pointer transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {resource.type === 'video' ? (
                          <Video size={18} className="text-primary-600" />
                        ) : resource.type === 'presentation' ? (
                          <FileSpreadsheet size={18} className="text-primary-600" />
                        ) : (
                          <FileText size={18} className="text-primary-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {resource.title}
                        </p>
                        <p className="text-xs text-gray-500">{resource.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 快捷操作 */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <Zap size={18} className="text-amber-500" />
                快捷操作
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-all text-left">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Target size={16} className="text-amber-600" />
                  </div>
                  <span className="text-sm text-gray-700">考考我</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all text-left">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Lightbulb size={16} className="text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-700">总结要点</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <MessageCircle size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">深入讨论</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <Resizer
          onResize={(delta) => {
            setLeftWidth(prev => Math.max(15, Math.min(40, prev + delta)));
          }}
        />

        {/* 中间面板 - AI 对话 */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
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

          {/* 输入区域 */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="输入你的问题..."
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        <Resizer
          onResize={(delta) => {
            setRightWidth(prev => Math.max(15, Math.min(40, prev - delta)));
          }}
        />

        {/* 右侧面板 - 笔记和设置 */}
        <div
          className="bg-white border-l border-gray-200 flex flex-col overflow-hidden"
          style={{ width: `${rightWidth}%` }}
        >
          {/* 标签切换 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setRightTab('notes')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                rightTab === 'notes'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Pencil size={16} className="inline mr-2" />
              笔记
            </button>
            <button
              onClick={() => setRightTab('settings')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                rightTab === 'settings'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings size={16} className="inline mr-2" />
              设置
            </button>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto">
            {rightTab === 'notes' ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">学习笔记</h3>
                  <button
                    onClick={() => setIsEditingNote(!isEditingNote)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {isEditingNote ? '完成' : '编辑'}
                  </button>
                </div>
                {isEditingNote ? (
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="在这里记录你的学习笔记..."
                    className="w-full h-[calc(100vh-200px)] p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                ) : noteContent ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {noteContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Pencil size={20} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">还没有笔记</p>
                    <button
                      onClick={() => setIsEditingNote(true)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      开始记录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* 基础设置 */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedSettings(prev =>
                        prev.includes('basic')
                          ? prev.filter(s => s !== 'basic')
                          : [...prev, 'basic']
                      )
                    }
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-800">基础设置</span>
                    {expandedSettings.includes('basic') ? (
                      <ChevronUp size={18} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500" />
                    )}
                  </button>
                  {expandedSettings.includes('basic') && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          AI 风格
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                          <option value="patient">耐心解释型</option>
                          <option value="socratic">启发提问型</option>
                          <option value="challenging">挑战辩论型</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          笔记模板
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                          <option value="blank">空白</option>
                          <option value="cornell">康奈尔笔记</option>
                          <option value="sky_rain_umbrella">空雨伞</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          学习目标
                        </label>
                        <textarea
                          placeholder="例如：通过 CPA 考试"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 高级设置 */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedSettings(prev =>
                        prev.includes('advanced')
                          ? prev.filter(s => s !== 'advanced')
                          : [...prev, 'advanced']
                      )
                    }
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">高级设置</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                        高级
                      </span>
                    </div>
                    {expandedSettings.includes('advanced') ? (
                      <ChevronUp size={18} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500" />
                    )}
                  </button>
                  {expandedSettings.includes('advanced') && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          知识边界
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                          <option value="strict">只基于我的资料</option>
                          <option value="moderate">适度扩展</option>
                          <option value="free">自由发挥</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          自定义 AI 指令
                        </label>
                        <textarea
                          placeholder="输入自定义指令..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
