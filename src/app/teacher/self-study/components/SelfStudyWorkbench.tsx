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

// ── workbench/ 子组件（只负责渲染，状态和 handler 留在本文件）
// 详见 ARCHITECTURE.md 了解各文件职责
import { WorkbenchHeader } from './workbench/header/WorkbenchHeader';
import { LeftPanel } from './workbench/resource/LeftPanel';
import { ChatPanel } from './workbench/chat/ChatPanel';
import { RightPanel } from './workbench/workspace/RightPanel';
import { EnhancedNotesPanel } from './workbench/workspace/EnhancedNotesPanel';
import { LearningStatusPanel } from './workbench/workspace/LearningStatusPanel';
import { Resizer } from './workbench/shared/Resizer';
import { THEME, COLLAPSED_WIDTH } from './workbench/shared/constants';
import { getIconComponent } from './workbench/shared/utils';
import type { ChatMessage, Note, VoiceRecording, SelfStudyWorkbenchProps } from './workbench/shared/types';

const MOCK_CURRENT_NODE = 'node_3';

// ─────────────────────────────────────────────────────────────
// 主组件
// 本文件职责：全局状态管理 + 事件处理 + 三栏布局编排
// 子组件渲染逻辑已拆分到 workbench/ 各目录
// ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // SECTION 1: Mock 数据（组件内，依赖 t() 翻译函数）
  // ─────────────────────────────────────────────────────────────
  // 使用 t() 的 Mock 数据（支持简繁转换）
  const GRADES = [
    t('一年级'), t('二年级'), t('三年级'), t('四年级'), t('五年级'),
    t('六年级'), t('七年级'), t('八年级'), t('九年级')
  ];

  const MOCK_CLASSES = [
    t('四年级1班'), t('四年级2班'), t('四年级3班'),
    t('五年级1班'), t('五年级2班'), t('五年级3班')
  ];

  const KNOWLEDGE_POINTS_LIBRARY = [
    { id: 'kp1', title: t('水循环的概念'), subject: t('地理'), grade: t('四年级') },
    { id: 'kp2', title: t('光合作用原理'), subject: t('生物'), grade: t('五年级') }
  ];

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

  // ─────────────────────────────────────────────────────────────
  // SECTION 2: State 定义
  // 所有状态分组说明见 ARCHITECTURE.md → "State 分组" 表
  // ─────────────────────────────────────────────────────────────

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
  const [quickResultMap, setQuickResultMap] = useState<Record<string, { allCorrect: boolean; correctCount: number; totalCount: number; details: any[] }>>({});
  const quickResult = expandedTask ? quickResultMap[expandedTask.id] || null : null;
  const [completedTasksArray, setCompletedTasksArray] = usePersistedState<string[]>(`self-study:wb:${config.id}:completedTasks`, []);
  const completedTasks = new Set(completedTasksArray);
  const setCompletedTasks = (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    if (typeof updater === 'function') {
      setCompletedTasksArray(prev => [...updater(new Set(prev))]);
    } else {
      setCompletedTasksArray([...updater]);
    }
  };

  // 任务历史记录
  const [taskHistory, setTaskHistory] = usePersistedState<Array<{
    taskId: string;
    attempts: Array<{
      attemptNumber: number;
      submittedAt: Date;
      score?: number;
    }>;
  }>>(`self-study:wb:${config.id}:taskHistory`, []);

  // 语音输入状态
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  // 初始化 Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition ||
                                (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.lang = 'zh-CN';

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(prev => prev + transcript);
        };

        recognitionInstance.onend = () => {
          setIsRecordingVoice(false);
        };

        recognitionRef.current = recognitionInstance;
      }
    }
  }, []);

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
    description?: string;
    textContent?: string;
    data?: any;
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

  // ─────────────────────────────────────────────────────────────
  // SECTION 3: Handlers（事件处理函数）
  // 子 section 标注各自归属的面板
  // ─────────────────────────────────────────────────────────────

  // [资源/任务] 统一的资源点击处理
  const handleResourceClick = (resource: Resource | typeof aiGeneratedResources[0]) => {
    const hasUrl = 'url' in resource && !!resource.url;
    const isInteractive = (resource.type === 'interactive' || resource.type === 'ai_generated') && hasUrl &&
      ('interactiveCategory' in resource && !!resource.interactiveCategory);
    const hasCustomViewer = 'toolId' in resource && ['flashcards', 'audio_overview', 'timeline', 'mind_map'].includes(resource.toolId || '');

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
      data: 'data' in resource ? resource.data : undefined,
    };

    if (isInteractive || hasCustomViewer) {
      // H5/自定义 viewer 类：只设 viewingResource（全屏），清除 inlineViewingResource
      setInlineViewingResource(null);
      setViewingResource({
        id: resource.id,
        title: resource.title,
        type: 'interactive',
        description: 'description' in resource ? (resource.description || '') : '',
        url: 'url' in resource ? resource.url : undefined,
        interactiveCategory: 'interactiveCategory' in resource ? resource.interactiveCategory as Resource['interactiveCategory'] : undefined,
        toolId: 'toolId' in resource ? resource.toolId : undefined,
        data: 'data' in resource ? resource.data : undefined,
        textContent: 'textContent' in resource ? resource.textContent : undefined,
      } as any);
    } else {
      // 文档/文本类：只设 inlineViewingResource（左侧内嵌），清除 viewingResource
      setViewingResource(null);
      setInlineViewingResource(viewResource);
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

  // [左侧面板] Studio 工具点击处理
  const RESOURCE_MOCK_DATA: Record<string, { 
    title: string; 
    description: string; 
    data?: any;
    textContent?: string;
  }> = {
    flashcards: {
      title: '光合作用記憶卡片',
      description: '10 張卡片幫助記憶光合作用的關鍵知識點',
      data: {
        cards: [
          { front: '光合作用的場所是什麼？', back: '葉綠體（包括類囊體和基質）' },
          { front: '光反應發生在哪裡？', back: '類囊體膜' },
          { front: '暗反應發生在哪裡？', back: '葉綠體基質' },
          { front: '光反應的產物有哪些？', back: 'ATP、NADPH、O₂' },
          { front: '暗反應的產物是什麼？', back: '葡萄糖（C₆H₁₂O₆）' },
          { front: '光合作用的總反應式是什麼？', back: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂' },
          { front: '卡爾文循環的三個階段是什麼？', back: 'CO₂ 固定、C₃ 還原、RuBP 再生' },
          { front: '影響光合作用的主要因素有哪些？', back: '光照強度、CO₂ 濃度、溫度、水分' },
          { front: '光反應需要光嗎？', back: '需要' },
          { front: '暗反應需要光嗎？', back: '不需要光，但需要光反應的產物（ATP 和 NADPH）' },
        ],
      },
    },
    audio_overview: {
      title: '光合作用音頻概述',
      description: '15分鐘音頻講解光合作用的完整過程',
      data: {
        chapters: [
          { time: '00:00', title: '引言', content: '光合作用的定義與重要性，在生態系統中的角色' },
          { time: '03:00', title: '光反應階段', content: '葉綠體的結構、光能的吸收與轉換、ATP 和 NADPH 的生成' },
          { time: '08:00', title: '暗反應階段', content: '卡爾文循環的三個步驟、二氧化碳的固定、葡萄糖的合成' },
          { time: '13:00', title: '總結', content: '光合作用的意義、影響因素分析' },
        ],
      },
    },
    timeline: {
      title: '光合作用研究時間線',
      description: '光合作用研究的重要歷史事件',
      data: {
        events: [
          { year: '1648', icon: '🌱', title: '范·海爾蒙特實驗', description: '柳樹實驗，發現植物生長不僅依賴土壤' },
          { year: '1771', icon: '🕯️', title: '普里斯特利實驗', description: '蠟燭與植物實驗，發現植物能"淨化"空氣' },
          { year: '1779', icon: '☀️', title: '英格豪斯實驗', description: '發現光照的重要性，證明只有在光照下植物才能淨化空氣' },
          { year: '1845', icon: '⚡', title: '邁爾提出能量轉換', description: '提出光能轉化為化學能的概念' },
          { year: '1864', icon: '🔬', title: '薩克斯實驗', description: '證明光合作用產生澱粉，使用碘液檢測澱粉' },
          { year: '1880', icon: '🦠', title: '恩格爾曼實驗', description: '水綿與好氧細菌實驗，證明葉綠體是光合作用的場所' },
          { year: '1937', icon: '💧', title: '希爾反應', description: '發現水的光解，證明光反應中水是電子供體' },
          { year: '1940s', icon: '🔄', title: '卡爾文循環', description: '使用放射性同位素 ¹⁴C，闡明暗反應的詳細過程' },
        ],
      },
    },
    mind_map: {
      title: '光合作用思維導圖',
      description: '結構化展示光合作用的核心概念和關係',
      data: {
        nodes: {
          center: '光合作用',
          branches: [
            {
              title: '定義與場所',
              items: ['植物利用光能合成有機物', '化學方程式：6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', '場所：葉綠體（類囊體和基質）'],
            },
            {
              title: '光反應',
              items: ['位置：類囊體膜', '條件：需要光', '過程：光能吸收 → 水的光解 → ATP 和 NADPH 生成', '產物：ATP、NADPH、O₂'],
            },
            {
              title: '暗反應（卡爾文循環）',
              items: ['位置：葉綠體基質', '條件：不需要光', '三個階段：CO₂ 固定、C₃ 還原、RuBP 再生', '產物：葡萄糖'],
            },
            {
              title: '影響因素',
              items: ['光照強度：影響光反應速率', 'CO₂ 濃度：影響暗反應速率', '溫度：影響酶活性', '水分：原料之一'],
            },
          ],
        },
      },
    },
    summary: {
      title: '光合作用學習報告',
      description: '全面總結光合作用的學習成果',
      textContent: `## 📈 學習進度概覽

**已掌握內容**
✅ 光合作用的基本概念
✅ 光反應的詳細過程
✅ 暗反應（卡爾文循環）
✅ 影響因素分析

**需要加強的內容**
⚠️ 光合作用與呼吸作用的關係
⚠️ 不同植物的光合作用差異（C3、C4、CAM）

## 🎯 重點知識總結

### 1. 光合作用的意義
- 為生物界提供有機物
- 維持大氣中 O₂ 和 CO₂ 的平衡
- 將光能轉化為化學能

### 2. 光反應要點
- **場所**：類囊體膜
- **條件**：光、色素、酶
- **過程**：光能吸收 → 水的光解 → ATP 和 NADPH 生成
- **產物**：ATP、NADPH、O₂

### 3. 暗反應要點
- **場所**：葉綠體基質
- **條件**：ATP、NADPH、CO₂、酶
- **過程**：CO₂ 固定 → C₃ 還原 → RuBP 再生
- **產物**：葡萄糖`,
    },
    concept_search: {
      title: '光合作用概念搜索結果',
      description: '搜索"光合作用"相關的核心概念',
      textContent: `## 🎯 核心概念

### 光合作用 (Photosynthesis)
**定義：** 綠色植物、藻類和某些細菌利用光能，將二氧化碳和水轉化為有機物，並釋放氧氣的過程。

**關鍵特徵：**
- 能量轉換：光能 → 化學能
- 物質轉換：無機物 → 有機物
- 場所：葉綠體

## 🔗 相關概念

### 1. 葉綠體 (Chloroplast)
- 光合作用的場所
- 包含類囊體和基質
- 含有葉綠素等色素

### 2. 光反應 (Light Reaction)
- 需要光的階段
- 發生在類囊體膜
- 產生 ATP 和 NADPH

### 3. 暗反應 (Dark Reaction)
- 不需要光的階段
- 發生在葉綠體基質
- 又稱卡爾文循環`,
    },
    key_points: {
      title: '光合作用核心要點',
      description: '提煉光合作用的關鍵知識點',
      textContent: `## 🎯 必記要點

### 1. 光合作用的定義
- 綠色植物利用光能合成有機物的過程
- 化學方程式：**6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂**

### 2. 光合作用的場所
- **葉綠體**
  - 類囊體：光反應
  - 基質：暗反應

### 3. 光反應（需要光）
- **場所**：類囊體膜
- **原料**：H₂O、ADP、Pi、NADP⁺
- **產物**：O₂、ATP、NADPH

### 4. 暗反應（不需要光）
- **場所**：葉綠體基質
- **原料**：CO₂、ATP、NADPH
- **產物**：C₆H₁₂O₆、ADP、Pi、NADP⁺

### 5. 兩個階段的聯繫
- 光反應為暗反應提供 **ATP** 和 **NADPH**
- 暗反應為光反應提供 **ADP**、**Pi** 和 **NADP⁺**`,
    },
    examples: {
      title: '光合作用實例說明',
      description: '通過具體實例理解光合作用',
      textContent: `## 實例 1：溫室蔬菜栽培

**場景描述**
農民在溫室中種植番茄，為了提高產量，採取了以下措施：
- 增加光照時間（補光燈）
- 提高 CO₂ 濃度（CO₂ 發生器）
- 控制溫度（25-30°C）

**原理解釋**
- **增加光照**：提高光反應速率，產生更多 ATP 和 NADPH
- **提高 CO₂**：提高暗反應速率，合成更多有機物
- **適宜溫度**：保證酶的最適活性

---

## 實例 2：水生植物實驗

**場景描述**
將金魚藻放入水中，用漏斗和試管收集氣體，光照下產生氣泡。

**原理解釋**
- 光照下進行光合作用
- 光反應產生 O₂
- O₂ 以氣泡形式釋放

---

## 實例 3：秋天葉片變色

**場景描述**
秋天時，樹葉由綠色變為黃色或紅色。

**原理解釋**
- 氣溫降低，葉綠素分解
- 類胡蘿蔔素（黃色）和花青素（紅色）顯現
- 光合作用效率降低`,
    },
  };

  const handleStudioToolClick = (tool: typeof STUDIO_TOOLS[0]) => {
    if (tool.type === 'resource') {
      // 生成资源
      setGeneratingToolId(tool.id);

      // 获取对应的 mock 数据
      const mockData = RESOURCE_MOCK_DATA[tool.id];

      // 模拟生成过程
      setTimeout(() => {
        const newResource = {
          id: `ai_res_${Date.now()}`,
          title: mockData ? `🤖 ${mockData.title}` : `🤖 ${t('AI生成')}：${tool.label}`,
          type: 'ai_generated' as const,
          icon: tool.icon,
          status: 'ready' as const,
          generatedAt: new Date(),
          toolId: tool.id,
          description: mockData?.description,
          textContent: mockData?.textContent,
          data: mockData?.data,
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
      content: '你好！我是你的学习助手 🤖\n\n我可以帮你：\n\n📄 **分析学习资料** - 上传文件或从知识库导入\n💬 **解答疑问** - 直接向我提问任何学习问题\n🎯 **生成学习内容** - 使用右侧学习工具生成思维导图、测试题等\n\n准备好开始学习了吗？',
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

  // ── [对话区] ChatPanel handlers ──────────────────────────────
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

  // ── [任务] TaskExpandedCard handlers ─────────────────────────
  // 获取任务尝试次数
  const getAttemptCount = (taskId: string) => {
    return taskHistory.find(h => h.taskId === taskId)?.attempts.length || 0;
  };

  // 重做任务
  const handleRedoTask = (taskId: string) => {
    // 重置任务状态
    setMessages(prev => prev.map(msg =>
      msg.embeddedTask?.id === taskId
        ? { ...msg, taskState: { currentQuestionIndex: 0, selectedAnswers: {}, submissionText: '', status: 'in_progress' } }
        : msg
    ));
    // 从已完成列表移除
    setCompletedTasksArray(prev => prev.filter(id => id !== taskId));
  };

  // 语音输入切换
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isRecordingVoice) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecordingVoice(true);
    }
  };

  // 切换计时器
  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setElapsedTime(0);
    setIsTimerRunning(true);
  };

  // ── [Header] WorkbenchHeader handlers ────────────────────────
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

  // ── [Modal] 资源导入 handlers ─────────────────────────────────
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

  // 保存任务（新增或更新）- 用于统一编辑弹窗
  const handleSaveTask = (task: any) => {
    setGeneratedTasks(prev => {
      const exists = prev.some(t => t.id === task.id);
      if (exists) {
        return prev.map(t => t.id === task.id ? task : t);
      }
      return [task, ...prev];
    });
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
  // 回顾错题：保留答案，回到全屏查看
  const handleRetryWrongQuestions = () => {
    console.log('[ErrorLoop] 回顾错题');
    if (expandedTask) {
      setTaskDisplayMode('fullscreen');
    }
  };

  // 重做：清空答案，从第1题重新开始
  const handleRedoCurrentTask = () => {
    console.log('[ErrorLoop] 重做任务');
    if (expandedTask) {
      setQuickResultMap(prev => { const { [expandedTask.id]: _, ...rest } = prev; return rest; });
      setMessages(prev => prev.map(msg =>
        msg.embeddedTask?.id === expandedTask.id
          ? { ...msg, taskState: { currentQuestionIndex: 0, selectedAnswers: {}, submissionText: '', status: 'in_progress' } }
          : msg
      ));
      setTaskDisplayMode('fullscreen');
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
    // 同步错题上下文到对话（仅当AI分析消息尚未存在时）
    if (expandedTask && quickResult) {
      const hasAnalysis = messages.some(m => m.id === `msg_${expandedTask.id}_analysis`);
      const wrongDetails = quickResult.details.filter(d => !d.correct);
      if (!hasAnalysis && wrongDetails.length > 0) {
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

  // 处理直接添加资源（如粘贴文本）
  const handleAddResource = (resource: Resource) => {
    handleUpdateConfig({
      ...config,
      resources: [...config.resources, resource],
    });
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

  // ── [Header] 标题编辑 handlers ───────────────────────────────
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

  // ── [任务×对话] 跨 section 核心逻辑 ─────────────────────────
  // 处理用户点击任务 - 将任务作为智能体推送的消息嵌入对话
  const handleTaskClick = (task: any) => {
    // 去重：如果该任务已有对应消息，直接展开，不再创建新消息
    const existingMessage = messages.find(m => m.embeddedTask?.id === task.id);
    if (existingMessage) {
      setExpandedTask(task);
      // 已完成且有结果 → 显示结果页；否则全屏做题
      if (completedTasks.has(task.id) && task.id in quickResultMap) {
        setTaskDisplayMode('result_review');
      } else {
        setTaskDisplayMode('fullscreen');
      }
      return;
    }

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
    if (completedTasks.has(task.id) && task.id in quickResultMap) {
      setTaskDisplayMode('result_review');
    } else {
      setTaskDisplayMode('fullscreen');
    }
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

  // toggleTaskCompletion - 两阶段提交（核心逻辑，涉及 4+ 个 section 的 state）
  // 修改前请参考 ARCHITECTURE.md → "已知技术债"
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
        setQuickResultMap(prev => { return { ...prev, [taskId]: data.quickResult }; });

        // 全屏模式下自动进入结果回顾
        if (taskDisplayMode === 'fullscreen') {
          setTaskDisplayMode('result_review');
        }

        // 只有全对才标记任务为已完成
        if (data.quickResult.allCorrect) {
          setTaskStatus('completed');
          // Delay the completion state update so result review shows first
          setTimeout(() => {
            setCompletedTasks((prev) => {
              const newSet = new Set(prev);
              newSet.add(taskId);
              return newSet;
            });
          }, 500);
        } else {
          // 未全对，重置状态允许重做
          setTimeout(() => {
            setTaskStatus('idle');
          }, 2000); // 2秒后重置，让用户看到结果
        }

        // 保存任务历史记录
        const attemptNumber = (taskHistory.find(h => h.taskId === taskId)?.attempts.length || 0) + 1;
        setTaskHistory(prev => {
          const existing = prev.find(h => h.taskId === taskId);
          const newAttempt = {
            attemptNumber,
            submittedAt: new Date(),
            score: data.quickResult?.correctCount,
          };
          if (existing) {
            return prev.map(h =>
              h.taskId === taskId
                ? { ...h, attempts: [...h.attempts, newAttempt] }
                : h
            );
          }
          return [...prev, { taskId, attempts: [newAttempt] }];
        });

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
      if (expandedTask) {
        setQuickResultMap(prev => { const { [expandedTask.id]: _, ...rest } = prev; return rest; });
      }

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

  // ─────────────────────────────────────────────────────────────
  // SECTION 4: 内联 UI 子组件
  // 待提取到 workbench/chat/ 目录（见 ARCHITECTURE.md 技术债）
  // ─────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────
  // SECTION 5: JSX Render（三栏布局编排 + Modal 渲染）
  // 子组件渲染：WorkbenchHeader / LeftPanel / ChatPanel / RightPanel
  // ─────────────────────────────────────────────────────────────

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
          <div className="animate-in fade-in duration-200">
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
          </div>
        );
      })()}

      {/* 全屏结果回顾 */}
      {expandedTask && taskDisplayMode === 'result_review' && quickResult && (() => {
        const taskMessage = messages.find(m => m.embeddedTask?.id === expandedTask.id);
        return (
          <div className="animate-in fade-in duration-300">
            <TaskResultReview
              task={expandedTask}
              quickResult={quickResult}
              selectedAnswers={taskMessage?.taskState?.selectedAnswers || {}}
              onClose={() => { setTaskDisplayMode('embedded'); }}
              onRetryWrongQuestions={handleRetryWrongQuestions}
              onRedoTask={handleRedoCurrentTask}
              onGeneratePractice={handleGeneratePractice}
              onBackToChat={handleBackToChat}
              onExplainQuestion={handleExplainQuestion}
            />
          </div>
        );
      })()}

      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <WorkbenchHeader
            config={config}
            isStudentMode={isStudentMode}
            isEditingTitle={isEditingTitle}
            editedTitle={editedTitle}
            onBack={onBack}
            onTitleEdit={() => setIsEditingTitle(true)}
            onTitleSave={handleTitleSave}
            onTitleCancel={handleTitleCancel}
            onTitleChange={setEditedTitle}
            onSettingsOpen={() => setIsSettingsOpen(true)}
            onPublishOpen={() => setShowNoteInfoModal(true)}
            onViewAnalytics={handleViewAnalytics}
            onNoteInfoOpen={() => setShowNoteInfoModal(true)}
          />

      {/* 主内容区 - 三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel
          config={config}
          isLeftCollapsed={isLeftCollapsed}
          leftWidth={leftWidth}
          isStudentMode={isStudentMode}
          isAIGenerating={isAIGenerating}
          collapsedPanels={collapsedPanels}
          completedTasks={completedTasks}
          expandedTask={expandedTask}
          taskDisplayMode={taskDisplayMode}
          inlineViewingResource={inlineViewingResource}
          generatedTasks={generatedTasks}
          isGeneratingTask={isGeneratingTask}
          aiGeneratedResources={aiGeneratedResources}
          examProcessingStep={examProcessingStep}
          messages={messages}
          quickResult={quickResult}
          taskStatus={taskStatus}
          settingsTaskId={settingsTaskId}
          settingsResourceId={settingsResourceId}
          mockAIResources={MOCK_AI_RESOURCES}
          selectedResourceIds={selectedResourceIds}
          selectedTaskIds={selectedTaskIds}
          getThemeClass={getThemeClass}
          getAttemptCount={getAttemptCount}
          onSetLeftCollapsed={setIsLeftCollapsed}
          onTogglePanel={togglePanel}
          onResourceClick={handleResourceClick}
          onFileUploadOpen={() => setIsFileUploadOpen(true)}
          onLinkInputOpen={() => setIsLinkInputOpen(true)}
          onKnowledgeBaseOpen={() => setShowKnowledgeBaseModal(true)}
          onTaskClick={handleTaskClick}
          onGenerateTest={handleGenerateTest}
          onRedoTask={handleRedoTask}
          onSaveResourceVisibility={handleSaveResourceVisibility}
          onSaveTaskSettings={handleSaveTaskSettings}
          onSetSettingsTaskId={setSettingsTaskId}
          onSetSettingsResourceId={setSettingsResourceId}
          onSetInlineViewingResource={setInlineViewingResource}
          onToggleTaskCompletion={toggleTaskCompletion}
          toggleResourceSelection={toggleResourceSelection}
          toggleAllTasks={toggleAllTasks}
          toggleAllResources={toggleAllResources}
          toggleTaskSelection={toggleTaskSelection}
          setEditingTask={setEditingTask}
          onSaveTask={handleSaveTask}
          onAddResource={handleAddResource}
          onSetViewingResource={setViewingResource}
        />

        {/* 左侧调整器 - 仅在未折叠时显示 */}
        {!isLeftCollapsed && (
          <Resizer
            onResize={(delta) => {
              const newLeftWidth = Math.max(18, Math.min(35, leftWidth + delta));
              setLeftWidth(newLeftWidth);
            }}
          />
        )}

        <ChatPanel
          config={config}
          messages={messages}
          inputMessage={inputMessage}
          isRecordingVoice={isRecordingVoice}
          isLoading={isLoading}
          expandedTask={expandedTask}
          completedTasks={completedTasks}
          taskDisplayMode={taskDisplayMode}
          taskStatus={taskStatus}
          quickResult={quickResult}
          learningPath={learningPath}
          flashingButtonId={flashingButtonId}
          generatingButtonId={generatingButtonId}
          isReflectionDismissed={isReflectionDismissed}
          getThemeClass={getThemeClass}
          onSendMessage={handleSendMessage}
          onInputChange={setInputMessage}
          onQuickReply={handleQuickReply}
          onChatAction={handleChatAction}
          onModeChange={handleModeChange}
          onToggleVoiceInput={toggleVoiceInput}
          onTaskClick={handleTaskClick}
          onCloseTask={closeTask}
          onToggleTaskCompletion={toggleTaskCompletion}
          onToggleTaskDisplayMode={toggleTaskDisplayMode}
          onUpdateTaskState={updateTaskState}
          onSetReflectionDismissed={setIsReflectionDismissed}
          renderKnowledgeCheckpoint={(msg) => <KnowledgeCheckpointCard message={msg} />}
          renderTopicTransition={(msg) => <TopicTransitionCard message={msg} />}
          renderModeTransition={(msg) => <ModeTransitionCard message={msg} />}
        />

        {/* 右侧调整器 - 仅在未折叠时显示 */}
        {!isRightCollapsed && (
          <Resizer
            onResize={(delta) => {
              const newRightWidth = Math.max(18, Math.min(35, rightWidth - delta));
              setRightWidth(newRightWidth);
            }}
          />
        )}

        <RightPanel
          isRightCollapsed={isRightCollapsed}
          rightWidth={rightWidth}
          rightTab={rightTab}
          learningMode={config.learningMode}
          isAIGenerating={isAIGenerating}
          configId={config.id}
          studioTools={STUDIO_TOOLS}
          collapsedPanels={collapsedPanels}
          generatingToolId={generatingToolId}
          flashingToolId={flashingToolId}
          getThemeClass={getThemeClass}
          onSetRightCollapsed={setIsRightCollapsed}
          onSetRightTab={setRightTab}
          onToggleStudioPanel={() => togglePanel('studio')}
          onStudioToolClick={handleStudioToolClick}
          onOpenToolConfig={handleOpenToolConfig}
        />
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
              toolId: (viewingResource as any).toolId || viewingResource.id,
              url: viewingResource.url,
              description: viewingResource.description,
              interactiveCategory: viewingResource.interactiveCategory,
              data: (viewingResource as any).data,
              textContent: (viewingResource as any).textContent,
            });
            setViewingResource(null);
          }
        }}
      />
    </div>
    </>
  );
}