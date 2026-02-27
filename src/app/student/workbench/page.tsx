'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isAIEnabled } from '@/lib/ai-config';
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
  BarChart3,
} from 'lucide-react';
import CompetencyRadarChart from '../components/CompetencyRadarChart';
import {
  LinearCompetencyView,
  RadarCompetencyView,
  BarCompetencyView,
  CrossCourseGrowthTimeline,
  GroupCollaborationView,
} from '../components/CompetencyVisualizations';
import {
  mockLearnerProfile,
  mockCourseCompetencyReport,
  mockAIObservations,
  getCompetencyStars,
  getTrendIcon,
  COMPETENCY_METADATA,
  CompetencyType,
  CompetencyRating,
  CompetencyTrend,
} from '@/data/mockCompetencyData';
import { mockResources, mockTasks } from '@/data/mockLearningData';
import GrowthTimelinePanel from '../components/GrowthTimelinePanel';
import { Resource, Task, TaskQuestion, TaskRubric } from '@/types/shared-context';

// 任务展开卡片组件 - 在中间聊天区显示
function TaskExpandedCard({
  task,
  onClose,
  onComplete,
  isCompleted,
  taskStatus,
  quickResult,
}: {
  task: Task;
  onClose: () => void;
  onComplete: (taskId: string, answer?: string) => void;
  isCompleted: boolean;
  taskStatus?: 'idle' | 'submitting' | 'grading' | 'completed';
  quickResult?: {
    allCorrect: boolean;
    correctCount: number;
    totalCount: number;
    details: any[];
  };
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});
  const [submissionText, setSubmissionText] = useState('');

  const handleQuestionAnswer = (questionId: string, answer: string | string[], isMultiple: boolean) => {
    if (isMultiple) {
      const currentAnswers = (selectedAnswers[questionId] as string[]) || [];
      const answerStr = answer as string;
      const newAnswers = currentAnswers.includes(answerStr)
        ? currentAnswers.filter(a => a !== answerStr)
        : [...currentAnswers, answerStr];
      setSelectedAnswers(prev => ({ ...prev, [questionId]: newAnswers }));
    } else {
      setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
    }
  };

  const handleSubmit = () => {
    let answer = '';
    if (task.type === 'quiz') {
      answer = JSON.stringify(selectedAnswers);
    } else if (task.type === 'assignment' || task.type === 'reflection') {
      answer = submissionText;
    }
    onComplete(task.id, answer);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden mb-4">
      {/* 卡片头部 */}
      <div className={`px-4 py-3 flex items-center justify-between ${
        task.type === 'quiz'
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100'
          : task.type === 'reflection'
          ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100'
          : 'bg-gradient-to-r from-primary-50 to-accent-50 border-b border-primary-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            task.type === 'quiz' ? 'bg-amber-100' : task.type === 'reflection' ? 'bg-purple-100' : 'bg-primary-100'
          }`}>
            {task.type === 'quiz' ? (
              <Zap size={18} className="text-amber-600" />
            ) : task.type === 'reflection' ? (
              <Brain size={18} className="text-purple-600" />
            ) : (
              <FileEdit size={18} className="text-primary-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{task.title}</h3>
            <p className="text-xs text-gray-500">
              {task.required ? '必修任务' : '选修任务'}
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
        {/* 任务描述 */}
        {task.description && (
          <p className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">{task.description}</p>
        )}

        {/* 测验类型任务 */}
        {task.type === 'quiz' && task.questions && (
          <div className="space-y-6">
            {task.questions.map((q, idx) => {
              const isMultiple = q.type === 'multiple_choice';
              const currentAnswer = selectedAnswers[q.id];

              return (
                <div key={q.id} className="space-y-3">
                  <p className="text-sm text-gray-700 font-medium">
                    {idx + 1}. {q.content}
                    {isMultiple && <span className="ml-2 text-xs text-blue-600">(多选题)</span>}
                  </p>
                  {q.options && (
                    <div className="space-y-2">
                      {q.options.map((option, optIdx) => {
                        const isSelected = isMultiple
                          ? Array.isArray(currentAnswer) && currentAnswer.includes(option)
                          : currentAnswer === option;

                        return (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-5 h-5 ${isMultiple ? 'rounded' : 'rounded-full'} border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                isMultiple ? (
                                  <Check size={14} className="text-white" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )
                              )}
                            </div>
                            <button
                              onClick={() => handleQuestionAnswer(q.id, option, isMultiple)}
                              className="text-sm text-gray-700 text-left flex-1"
                            >
                              {option}
                            </button>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 作业/反思类型任务 */}
        {(task.type === 'assignment' || task.type === 'reflection') && (
          <div className="space-y-3">
            {task.prompt && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                <p className="text-xs text-blue-900 whitespace-pre-line">{task.prompt}</p>
              </div>
            )}
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder={task.submissionPlaceholder || '请在这里提交你的作业内容...'}
              className="w-full h-40 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}

        {/* 快速判题结果 - 仅测验类型显示 */}
        {task.type === 'quiz' && quickResult && (
          <div className={`mt-4 p-4 rounded-xl border-2 ${
            quickResult.allCorrect
              ? 'bg-green-50 border-green-300'
              : 'bg-amber-50 border-amber-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {quickResult.allCorrect ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <AlertCircle size={20} className="text-amber-600" />
                )}
                <span className={`text-sm font-bold ${
                  quickResult.allCorrect ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {quickResult.allCorrect ? '全部正确！' : '部分正确'}
                </span>
              </div>
              <span className={`text-sm font-medium ${
                quickResult.allCorrect ? 'text-green-600' : 'text-amber-600'
              }`}>
                {quickResult.correctCount}/{quickResult.totalCount} 题正确
              </span>
            </div>
            <p className="text-xs text-gray-600">
              AI正在为你生成详细的学习反馈...
            </p>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={taskStatus === 'submitting' || taskStatus === 'grading'}
          className={`mt-4 w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            taskStatus === 'submitting' || taskStatus === 'grading'
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : isCompleted && quickResult?.allCorrect
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {taskStatus === 'submitting' ? (
            <>
              <Activity size={16} className="animate-spin" />
              提交中...
            </>
          ) : taskStatus === 'grading' ? (
            <>
              <Activity size={16} className="animate-spin" />
              批改中...
            </>
          ) : isCompleted && quickResult?.allCorrect ? (
            <>
              <Check size={16} />
              已完成
            </>
          ) : (
            <>
              <Check size={16} />
              {quickResult && !quickResult.allCorrect ? '重新提交' : '提交任务'}
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
  // 可选：嵌入的任务卡片
  embeddedTask?: Task;
  // 可选：能力培养提示
  competencyHint?: {
    type: CompetencyType;
    strategy: string;
  };
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

// 主组件
export default function StudentWorkbenchPage() {
  const router = useRouter();

  // 布局状态
  const [leftWidth, setLeftWidth] = useState(25);
  const [rightWidth, setRightWidth] = useState(25);

  // 交互模式
  const [chatMode, setChatMode] = useState<'free' | 'guided'>('free');

  // 右侧工作室标签
  const [rightTab, setRightTab] = useState<'workspace' | 'status'>('workspace');

  // 聊天消息 - 初始化为空，由useEffect添加欢迎消息
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);

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

  // 任务提交状态管理
  const [taskStatus, setTaskStatus] = useState<'idle' | 'submitting' | 'grading' | 'completed'>('idle');
  const [quickResult, setQuickResult] = useState<{
    allCorrect: boolean;
    correctCount: number;
    totalCount: number;
    details: any[];
  } | null>(null);

  // 能力画像状态
  const [competencyProfile, setCompetencyProfile] = useState<Partial<Record<CompetencyType, number>>>({
    critical_thinking: 2,
    information_synthesis: 2,
    metacognition: 2,
  });

  // 模拟配置数据
  const config: NoteConfig = {
    title: '植物工厂探索',
    description: '了解植物工厂的原理、技术与应用',
    subjects: ['科学', '技术', '生物'],
    grade: '五年级',
    resources: mockResources,
    tasks: mockTasks,
    interactionMode: 'free',
    noteTemplate: 'cornell',
  };

  // 计算必修任务完成情况（需要在config定义之后）
  const requiredTasks = config.tasks.filter(t => t.required);
  const completedRequiredTasks = requiredTasks.filter(t => completedTasks.has(t.id)).length;
  const allRequiredCompleted = requiredTasks.length > 0 && completedRequiredTasks === requiredTasks.length;

  // 发送消息处理
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 调用真实API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
          action: 'chat',
        }),
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const data = await response.json();

      // 添加AI回复
      const aiReply: ChatMessage = {
        id: data.messageId || `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiReply]);

      // 如果有能力更新，更新能力画像
      if (data.competencyUpdates && data.competencyUpdates.length > 0) {
        console.log('能力更新:', data.competencyUpdates);

        // 更新能力画像
        setCompetencyProfile((prev) => {
          const updated = { ...prev };
          data.competencyUpdates.forEach((update: any) => {
            if (update.type in updated) {
              // 简单平均更新（实际应该使用加权平均）
              updated[update.type as keyof typeof updated] =
                (updated[update.type as keyof typeof updated] + update.rating) / 2;
            }
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 显示错误消息
      const errorReply: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换任务完成状态 - 两阶段提交
  const toggleTaskCompletion = async (taskId: string, answer?: string) => {
    // 如果正在提交或批改中，不再处理
    if (taskStatus === 'submitting' || taskStatus === 'grading') {
      return;
    }

    // 找到任务信息
    const task = config.tasks.find(t => t.id === taskId);
    if (!task) return;

    // 第一阶段：标记为提交中
    setTaskStatus('submitting');
    setIsLoading(true);

    try {
      // 主观题：先标记为批改中状态
      if (task.type === 'assignment' || task.type === 'reflection') {
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

        // 添加loading消息到对话区（仅在AI启用时）
        if (isAIEnabled()) {
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

        // 如果有能力更新，更新能力画像
        if (data.competencyUpdates && data.competencyUpdates.length > 0) {
          console.log('能力更新:', data.competencyUpdates);

          setCompetencyProfile((prev) => {
            const updated = { ...prev };
            data.competencyUpdates.forEach((update: any) => {
              if (update.type in updated) {
                updated[update.type as keyof typeof updated] =
                  (updated[update.type as keyof typeof updated] + update.rating) / 2;
              }
            });
            return updated;
          });
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

  // 初始化欢迎消息 - 智能体主动开启对话
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      role: 'assistant',
      content: `你好！👋 欢迎来到「${config.title}」的学习之旅！

我是你的AI学习助手，在学习过程中我会陪伴你一起探索和思考。

📚 **学习建议**：
1. 先浏览左侧的学习资料，从课件或视频开始了解基础知识
2. 有任何疑问随时问我，我会帮助你理解和思考
3. 准备好了就可以尝试完成学习任务

你想从哪里开始呢？可以先看看《认识植物工厂课件》，或者告诉我你对植物工厂已经了解多少？`,
      timestamp: new Date(),
      competencyHint: {
        type: 'metacognition' as CompetencyType,
        strategy: '激活先验知识，建立学习目标'
      }
    };
    setMessages([welcomeMessage]);
  }, []); // 只在组件挂载时执行一次

  // 处理用户点击任务 - 将任务作为智能体推送的消息嵌入对话
  const handleTaskClick = (task: Task) => {
    // 创建一条智能体消息，嵌入任务卡片
    const taskIntroMessage: ChatMessage = {
      id: `msg_task_${task.id}_${Date.now()}`,
      role: 'assistant',
      content: task.type === 'quiz'
        ? `好的，让我们来做一个知识测验，检验一下你对植物工厂基础知识的掌握情况：`
        : task.type === 'reflection'
        ? `现在是一个很好的时机来反思你的学习过程。请认真思考以下问题：`
        : `接下来让我们完成这个任务，这将帮助你更深入地理解所学内容：`,
      timestamp: new Date(),
      embeddedTask: task,
    };

    setMessages(prev => [...prev, taskIntroMessage]);
    setExpandedTask(task);
  };

  // 处理资源查看事件 - 通知智能体用户正在查看资源
  const handleResourceView = (resource: Resource) => {
    // 添加一条智能体消息，表示注意到用户正在查看资源
    const resourceMessage: ChatMessage = {
      id: `msg_resource_${resource.id}_${Date.now()}`,
      role: 'assistant',
      content: `我看到你正在查看「${resource.title}」${resource.type === 'video' ? '视频' : resource.type === 'presentation' ? '课件' : '文档'}。

${resource.type === 'video'
  ? '📹 观看视频时，注意观察关键的演示环节。看完后可以告诉我你的发现或疑问！'
  : resource.type === 'presentation'
  ? '📊 浏览课件时，注意理解每一页的核心概念。有不明白的地方随时问我！'
  : '📄 阅读文档时，可以边读边做笔记。遇到困难的部分我可以帮你解释！'}`,
      timestamp: new Date(),
      competencyHint: {
        type: 'information_synthesis' as CompetencyType,
        strategy: '引导有目的的资源学习'
      }
    };

    setMessages(prev => [...prev, resourceMessage]);
  };

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
            <Brain size={20} className="text-primary-600" />
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
          {allRequiredCompleted && (
            <button
              onClick={() => router.push('/student/courses/plant-factory/report')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
              title="查看学习报告"
            >
              <BarChart3 size={16} />
              查看报告
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
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
          onTaskClick={handleTaskClick}
          onResourceView={handleResourceView}
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
          onCompleteTask={toggleTaskCompletion}
          completedTasks={completedTasks}
          isLoading={isLoading}
          taskStatus={taskStatus}
          quickResult={quickResult}
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
          competencyProfile={competencyProfile}
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
  onResourceView,
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
  onResourceView: (resource: Resource) => void;
}) {
  const [activeView, setActiveView] = useState<'list' | 'resource'>('list');

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    setActiveView('resource');
    // 通知智能体用户正在查看资源
    onResourceView(resource);
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
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50 flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FolderOpen size={16} className="text-primary-500" />
                学习资料库
              </h2>
              <p className="text-xs text-gray-500 mt-1">点击资源开始学习</p>
            </div>

            {/* 资源列表 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {config.resources.map((resource) => {
                // 根据资源类型选择图标和颜色
                let IconComponent = FileText;
                let colorClass = 'blue';
                let bgColorClass = 'bg-blue-100';
                let textColorClass = 'text-blue-600';
                let hoverBgClass = 'hover:bg-blue-700';
                let tagBgClass = 'bg-blue-50';
                let tagTextClass = 'text-blue-600';

                if (resource.type === 'video') {
                  IconComponent = Video;
                  colorClass = 'red';
                  bgColorClass = 'bg-red-100';
                  textColorClass = 'text-red-600';
                  hoverBgClass = 'hover:bg-red-700';
                  tagBgClass = 'bg-red-50';
                  tagTextClass = 'text-red-600';
                } else if (resource.type === 'presentation') {
                  IconComponent = FileSpreadsheet;
                  colorClass = 'orange';
                  bgColorClass = 'bg-orange-100';
                  textColorClass = 'text-orange-600';
                  hoverBgClass = 'hover:bg-orange-700';
                  tagBgClass = 'bg-orange-50';
                  tagTextClass = 'text-orange-600';
                }

                return (
                  <div
                    key={resource.id}
                    className="bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* 资源信息区 */}
                    <div className="p-3">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl ${bgColorClass} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent size={20} className={textColorClass} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 mb-1 leading-snug">
                            {resource.title}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
                            {resource.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${tagBgClass} ${tagTextClass} font-medium`}>
                              {resource.type === 'video' ? '视频' : resource.type === 'presentation' ? 'PPT' : 'Word'}
                            </span>
                            {resource.duration && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock size={10} />
                                  {resource.duration}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 快捷操作按钮 */}
                      <div className="flex gap-2">
                        {resource.type === 'video' ? (
                          <button
                            onClick={() => handleResourceClick(resource)}
                            className={`flex-1 px-3 py-2 bg-${colorClass}-600 ${hoverBgClass} text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5`}
                          >
                            <Play size={14} />
                            播放视频
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleResourceClick(resource)}
                              className={`flex-1 px-3 py-2 bg-${colorClass}-600 ${hoverBgClass} text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5`}
                            >
                              <Eye size={14} />
                              查看
                            </button>
                            <a
                              href={`/${resource.path}`}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Download size={14} />
                              下载
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                const isCompleted = completedTasks.has(task.id) || task.status === 'completed';
                const isLocked = task.status === 'locked';
                return (
                  <div
                    key={task.id}
                    onClick={() => !isLocked && onTaskClick(task)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all group border-2 ${
                      isLocked
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : isCompleted
                        ? 'border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer'
                        : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isLocked
                          ? 'bg-gray-200'
                          : isCompleted
                          ? 'bg-green-100'
                          : task.type === 'quiz'
                          ? 'bg-amber-100'
                          : task.type === 'reflection'
                          ? 'bg-purple-100'
                          : 'bg-primary-100'
                      }`}
                    >
                      {isLocked ? (
                        <AlertCircle size={18} className="text-gray-400" />
                      ) : isCompleted ? (
                        <Check size={18} className="text-green-600" />
                      ) : task.type === 'quiz' ? (
                        <Zap size={18} className="text-amber-600" />
                      ) : task.type === 'reflection' ? (
                        <Brain size={18} className="text-purple-600" />
                      ) : (
                        <FileEdit size={18} className="text-primary-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isCompleted ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {task.type === 'quiz' ? '测验' : task.type === 'reflection' ? '反思' : '作业'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isCompleted && !isLocked && task.required && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">必修</span>
                      )}
                      {isLocked && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">未解锁</span>
                      )}
                      {isCompleted && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">已完成</span>
                      )}
                      {!isLocked && <ChevronRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
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
  // 根据资源类型确定头部颜色
  const getHeaderColor = () => {
    if (resource.type === 'video') return 'from-red-500 to-red-600';
    if (resource.type === 'presentation') return 'from-orange-500 to-orange-600';
    if (resource.type === 'document') return 'from-blue-500 to-blue-600';
    return 'from-primary-500 to-primary-600';
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* 头部导航 */}
      <div className={`p-4 border-b border-gray-200 bg-gradient-to-r ${getHeaderColor()} text-white flex items-center justify-between`}>
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
            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
              <video
                controls
                className="w-full h-full"
                src={`/${resource.path}`}
              >
                <source src={`/${resource.path}`} type="video/mp4" />
                您的浏览器不支持视频播放
              </video>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={14} />
                <span>{resource.duration}</span>
              </div>
            </div>
          </div>
        )}

        {resource.type === 'document' && (
          <div className="space-y-4">
            {resource.textContent ? (
              // 显示预提取的文本内容
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {resource.textContent}
                  </div>
                </div>
              </div>
            ) : (
              // 如果没有预提取内容,显示下载提示
              <div className="bg-white rounded-xl p-8 border border-gray-200 min-h-[400px]">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{resource.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">Word 文档</span>
                    <span>•</span>
                    <span>{resource.duration}</span>
                  </div>
                </div>

                <div className="max-w-md mx-auto space-y-3">
                  <a
                    href={`/${resource.path}`}
                    download
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    下载文档
                  </a>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    提示：Word 文档需要下载后使用 Microsoft Word 或 WPS 等软件打开查看
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {resource.type === 'presentation' && (
          <div className="space-y-4">
            {resource.textContent ? (
              // 显示预提取的文本内容
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {resource.textContent}
                  </div>
                </div>
              </div>
            ) : (
              // 如果没有预提取内容,显示下载提示
              <div className="bg-white rounded-xl p-8 border border-gray-200 min-h-[400px]">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet size={32} className="text-orange-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{resource.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded">PPT 演示文稿</span>
                    <span>•</span>
                    <span>{resource.duration}</span>
                  </div>
                </div>

                <div className="max-w-md mx-auto space-y-3">
                  <a
                    href={`/${resource.path}`}
                    download
                    className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    下载演示文稿
                  </a>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    提示:PPT 演示文稿需要下载后使用 Microsoft PowerPoint 或 WPS 等软件打开查看
                  </p>
                </div>
              </div>
            )}
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
  onCompleteTask,
  completedTasks,
  isLoading,
  taskStatus,
  quickResult,
}: any) {
  return (
    <div style={{ width: `${width}%` }} className="flex flex-col bg-gray-50">
      {/* 对话区头部 */}
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <MessageSquare size={18} className="text-accent-600" />
            AI 学习对话
          </h2>
        </div>

        {/* 模式切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => setChatMode('free')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              chatMode === 'free'
                ? 'bg-primary-500 text-white shadow-sm'
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
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-accent-600" />
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
              <div className="w-9 h-9 rounded-full bg-accent-600 flex-shrink-0 flex items-center justify-center">
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
                <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-50 border border-accent-200 rounded-lg w-fit">
                  <Target size={12} className="text-accent-600" />
                  <span className="text-xs font-medium text-accent-700">
                    培养 {COMPETENCY_METADATA[(message as any).competencyHint.type as CompetencyType]?.name}
                  </span>
                  <span className="text-xs text-accent-500">• {(message as any).competencyHint.strategy}</span>
                </div>
              )}

              {/* 消息内容 */}
              <div
                className={`p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 rounded-tl-none'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-line text-white">
                    {message.content}
                  </p>
                ) : (
                  <div className="text-sm leading-relaxed text-gray-700 prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-strong:text-gray-800 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* 嵌入的任务卡片 (作为智能体消息的一部分) */}
              {message.role === 'assistant' && message.embeddedTask && (
                <div className="mt-2">
                  <TaskExpandedCard
                    task={message.embeddedTask}
                    onClose={() => {}}
                    onComplete={onCompleteTask}
                    isCompleted={completedTasks.has(message.embeddedTask.id)}
                    taskStatus={taskStatus}
                    quickResult={quickResult}
                  />
                </div>
              )}
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

      </div>

      {/* 输入框 */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && onSendMessage()}
            placeholder={isLoading ? "AI正在思考..." : "输入你的问题或想法..."}
            disabled={isLoading}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={onSendMessage}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// 能力成长面板组件
function CompetencyGrowthPanel({ competencyProfile }: {
  competencyProfile: Partial<Record<CompetencyType, number>>;
}) {
  const [showCrossCourseProfile, setShowCrossCourseProfile] = useState(false);

  // 转换数据格式：从 object 转为 CompetencyData 数组
  const competencies: Array<{
    type: CompetencyType;
    rating: CompetencyRating;
    trend?: CompetencyTrend;
  }> = Object.entries(competencyProfile).map(([type, rating]) => ({
    type: type as CompetencyType,
    rating: Math.round(rating) as CompetencyRating,
    trend: 'stable' as CompetencyTrend,
  }));

  const count = competencies.length;

  // 智能路由：根据维度数量选择可视化组件
  const renderVisualization = () => {
    if (count === 0) return null;
    if (count <= 2) return <LinearCompetencyView competencies={competencies} />;
    if (count <= 6) return <RadarCompetencyView competencies={competencies} />;
    return <BarCompetencyView competencies={competencies} />;
  };

  return (
    <div className="space-y-4">
      {/* 当前课程能力画像 - 自适应可视化 */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 border border-primary-100">
        <div className="flex items-center gap-2 mb-3">
          <Award size={14} className="text-primary-600" />
          <span className="text-xs font-bold text-primary-700">本课程能力画像</span>
        </div>
        {renderVisualization()}
      </div>

      {/* AI实时观察 */}
      <div className="bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl p-4 border border-accent-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-accent-600" />
          <span className="text-xs font-bold text-accent-700">AI实时观察</span>
        </div>
        <div className="space-y-3">
          {mockAIObservations.slice(0, 2).map((obs) => {
            return (
              <div key={obs.id} className="bg-white/80 rounded-lg p-3 border border-accent-100">
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

      {/* 跨课程能力画像 (可折叠) - 使用CrossCourseGrowthTimeline组件 */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 overflow-hidden">
        <button
          onClick={() => setShowCrossCourseProfile(!showCrossCourseProfile)}
          className="w-full p-4 flex items-center justify-between hover:bg-emerald-100/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">我的跨课程能力画像</span>
          </div>
          {showCrossCourseProfile ? (
            <ChevronUp size={14} className="text-emerald-600" />
          ) : (
            <ChevronDown size={14} className="text-emerald-600" />
          )}
        </button>

        {showCrossCourseProfile && (
          <div className="p-4 pt-0">
            <CrossCourseGrowthTimeline globalCompetencies={mockLearnerProfile.globalCompetencies} />
          </div>
        )}
      </div>

      {/* 学习元数据 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-primary-50 rounded-lg p-2 border border-primary-100">
          <div className="flex items-center gap-1 mb-1">
            <Layers size={10} className="text-primary-600" />
            <span className="text-xs text-primary-700">已完成课程</span>
          </div>
          <p className="text-sm font-bold text-primary-600">
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
            className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-accent-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                : 'bg-primary-600 text-white'
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
                  <button className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
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
function RightPanel({ config, rightTab, setRightTab, width, elapsedTime, tasks, isNotePanelOpen, setIsNotePanelOpen, competencyProfile }: any) {
  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedTasks = tasks?.filter((t: Task) => t.status === 'completed')?.length || 0;
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
          我的能力成长
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {rightTab === 'workspace' ? (
          <EnhancedNotesPanel />
        ) : (
          <div className="flex-1 overflow-y-auto p-3">
            <GrowthTimelinePanel competencyProfile={competencyProfile} />
          </div>
        )}
      </div>
    </div>
  );
}
