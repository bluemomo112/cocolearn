'use client';

import { useState, useEffect } from 'react';
import {
  Video,
  FileText,
  FileSpreadsheet,
  Globe,
  Plus,
  Trash2,
  Play,
  Settings,
  MessageCircle,
  GitBranch,
  FileEdit,
  Activity,
  Eye,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  ListChecks,
  ClipboardList,
  Bot,
  Zap,
  Database,
  ExternalLink,
  Info,
  Sparkles,
  Check,
  Network,
  Layers,
  CreditCard,
  Clock,
  Target,
  Brain,
  Lightbulb,
  Send,
  Layout,
  FolderOpen,
  MessageSquare,
  Key,
  Route,
  Sliders,
  Pencil,
  ChevronUp,
  HelpCircle,
  Download,
  Upload,
} from 'lucide-react';
import {
  FreeModeModal,
  GuidedModeModal,
  NotesModal,
  MetaModal,
  ResourcePreviewModal,
  TaskEditModal,
  PreviewHeader,
  StudentPreview,
  UseViewHeader,
  ResultsViewHeader,
  ResultsViewDashboard,
  Resizer,
  NoteInfoModal,
} from './modals';

// 类型定义
// 能力维度类型定义
type CompetencyType =
  | 'critical_thinking'      // 批判性思维
  | 'information_synthesis'  // 信息整合
  | 'metacognition'          // 元认知
  | 'question_quality'       // 提问质量
  | 'creativity'             // 创造性
  | 'persistence';           // 坚持性

// 能力维度定义（用于UI展示）
const COMPETENCY_DEFINITIONS: Record<CompetencyType, { name: string; description: string; icon: string }> = {
  critical_thinking: {
    name: '批判性思维',
    description: '评估信息、识别假设、分析论证的能力',
    icon: 'Brain',
  },
  information_synthesis: {
    name: '信息整合',
    description: '从多个来源整合信息、建立联系的能力',
    icon: 'Network',
  },
  metacognition: {
    name: '元认知',
    description: '反思学习过程、调整学习策略的能力',
    icon: 'Eye',
  },
  question_quality: {
    name: '提问质量',
    description: '提出有深度、有洞察力问题的能力',
    icon: 'HelpCircle',
  },
  creativity: {
    name: '创造性',
    description: '产生新颖想法、解决方案的能力',
    icon: 'Lightbulb',
  },
  persistence: {
    name: '坚持性',
    description: '面对挑战持续努力、不轻易放弃的品质',
    icon: 'Target',
  },
};

interface Resource {
  id: string;
  type: 'video' | 'pdf' | 'ppt' | 'web';
  title: string;
  description?: string;
  icon: string;
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
  questions?: Question[];
  teacherHint?: string;
  wordLimit?: { min: number; max: number };
  assignedCompetencies?: CompetencyType[]; // 教师指定的能力维度（仅用于作业类任务）
  aiGrading?: {
    enabled: boolean;
    agentId?: string;
    customPrompt?: string;
    gradingCriteria?: string;
  };
  passScore?: number;
}

interface Question {
  id: string;
  type: 'choice' | 'fillblank' | 'truefalse' | 'shortanswer';
  content: string;
  options?: string[];
  answer: any;
  aiGenerated?: boolean;
}

interface NoteConfig {
  noteInfo: {
    title: string;
    description: string;
    subjects?: string[];
    grade?: string;
    bindClasses?: string[];
  };
  resources: Resource[];
  tasks: Task[];
  interactionMode: 'free' | 'guided';
  freeConfig: {
    selectedAgentId: string;
    teacherPrompt: string;
    enableFence: boolean;
  };
  guidedConfig: {
    selectedWorkflowId: string;
    stagePrompts: Record<string, string>;
  };
  outputConfig: {
    noteTemplate: string;
    enableSubmit: boolean;
    metacognitionStrategy: string;
    metacognitionPrompt: string;
  };
}

// 模拟数据
const MOCK_AGENTS = [
  { id: 'agent_socratic', name: '苏格拉底教练', description: '通过提问引导思考' },
  { id: 'agent_explain', name: '知识讲解员', description: '详细解释概念' },
  { id: 'agent_tutor', name: '个性化导师', description: '因材施教' },
];

const MOCK_WORKFLOWS = [
  {
    id: 'workflow_5e',
    name: '5E教学法',
    description: '投入 → 探索 → 解释 → 迁移 → 评价',
    stages: [
      { id: 's1', name: '投入 Engage', icon: 'Zap', defaultPrompt: '激发学生兴趣和好奇心' },
      { id: 's2', name: '探索 Explore', icon: 'Search', defaultPrompt: '引导学生主动探索' },
      { id: 's3', name: '解释 Explain', icon: 'MessageCircle', defaultPrompt: '帮助学生理解核心概念' },
      { id: 's4', name: '迁移 Elaborate', icon: 'ArrowRight', defaultPrompt: '应用到新情境' },
      { id: 's5', name: '评价 Evaluate', icon: 'CheckCircle', defaultPrompt: '评估学习成果' },
    ],
  },
  {
    id: 'workflow_pbl',
    name: 'PBL问题式学习',
    description: '问题 → 探究 → 解决 → 反思',
    stages: [
      { id: 'p1', name: '问题呈现', icon: 'HelpCircle', defaultPrompt: '提出真实问题' },
      { id: 'p2', name: '自主探究', icon: 'Search', defaultPrompt: '学生自主研究' },
      { id: 'p3', name: '方案设计', icon: 'Lightbulb', defaultPrompt: '设计解决方案' },
      { id: 'p4', name: '反思总结', icon: 'Brain', defaultPrompt: '反思学习过程' },
    ],
  },
];

const NOTE_TEMPLATES = [
  { id: 'blank', name: '空白笔记', structure: [] },
  { id: 'cornell', name: '康奈尔笔记', structure: ['要点区', '笔记区', '总结区'] },
  { id: 'umbrella', name: '空雨伞', structure: ['空(事实)', '雨(解读)', '伞(行动)'] },
];

const META_STRATEGIES = [
  { id: 'meta_basic', name: '基础监控', description: '跟踪学习时长和理解度' },
  { id: 'meta_advanced', name: '深度监控', description: 'AI实时分析学习状态' },
  { id: 'meta_adaptive', name: '自适应监控', description: '动态调整学习路径' },
];

const GRADING_AGENTS = [
  { id: 'grading_default', name: '通用批改Agent', description: '适用于大多数作业类型' },
  { id: 'grading_creative', name: '创意批改Agent', description: '侧重创新性和独特性评价' },
  { id: 'grading_analytical', name: '分析批改Agent', description: '注重逻辑和论证质量' },
];

const RESOURCE_LIBRARY = {
  视频: [
    {
      id: 'lib_v1',
      type: 'video' as const,
      title: '水循环动画演示',
      description: '生动展示水的三态变化过程',
      icon: 'Video',
      color: 'red',
      duration: '8:32',
    },
    {
      id: 'lib_v2',
      type: 'video' as const,
      title: '水资源保护纪录片',
      description: '了解水资源现状与保护措施',
      icon: 'Video',
      color: 'red',
      duration: '15:20',
    },
  ],
  文档: [
    {
      id: 'lib_d1',
      type: 'pdf' as const,
      title: '水循环知识点总结',
      description: '核心知识点梳理',
      icon: 'FileText',
      color: 'blue',
      pages: 12,
    },
  ],
  PPT: [
    {
      id: 'lib_p1',
      type: 'ppt' as const,
      title: '水循环教学课件',
      description: '完整课堂演示文稿',
      icon: 'FileSpreadsheet',
      color: 'amber',
      pages: 25,
    },
  ],
  网页: [
    {
      id: 'lib_w1',
      type: 'web' as const,
      title: '中国水资源分布图',
      description: '互动地图',
      icon: 'Globe',
      color: 'green',
      url: 'https://example.com/water-map',
    },
  ],
};

const KNOWLEDGE_POINTS_LIBRARY = [
  {
    id: 'kp1',
    title: '水循环的概念',
    subject: '科学',
    grade: '四年级',
    description: '了解水在自然界中的循环过程',
  },
  {
    id: 'kp2',
    title: '水资源的分布',
    subject: '地理',
    grade: '四年级',
    description: '认识地球上水资源的分布情况',
  },
  {
    id: 'kp3',
    title: '节约用水的方法',
    subject: '环境教育',
    grade: '四年级',
    description: '学习日常生活中的节水方法',
  },
];

const GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级'];

const MOCK_CLASSES = [
  '四年级1班',
  '四年级2班',
  '四年级3班',
  '五年级1班',
  '五年级2班',
];

export default function NoteConfigPage() {
  // 视角状态：'edit' | 'use' | 'results'
  // Initialize with 'edit' to ensure server and client match
  const [viewPerspective, setViewPerspective] = useState<'edit' | 'use' | 'results'>('edit');
  const [leftWidth, setLeftWidth] = useState(25);
  const [rightWidth, setRightWidth] = useState(25);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update view perspective from URL after hydration (client-side only)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam === 'use' || viewParam === 'results' || viewParam === 'edit') {
      setViewPerspective(viewParam as 'edit' | 'use' | 'results');
    }
  }, []);

  // 配置数据
  const [config, setConfig] = useState<NoteConfig>({
    noteInfo: {
      title: '水循环与水资源',
      description: '探索水的循环过程，理解水资源的重要性',
      subjects: ['科学', '地理', '环境教育'],
      grade: '四年级',
      bindClasses: ['四年级1班', '四年级2班'],
    },
    resources: [
      {
        id: 'r1',
        type: 'video',
        title: '水循环基础知识',
        description: '了解水循环的基本概念',
        icon: 'Video',
        color: 'red',
        duration: '10:25',
      },
    ],
    tasks: [
      {
        id: 't1',
        type: 'quiz',
        title: '水循环知识自测',
        status: 'required',
        passScore: 60,
        questions: [],
      },
    ],
    interactionMode: 'free',
    freeConfig: {
      selectedAgentId: 'agent_socratic',
      teacherPrompt: '',
      enableFence: true,
    },
    guidedConfig: {
      selectedWorkflowId: 'workflow_5e',
      stagePrompts: {},
    },
    outputConfig: {
      noteTemplate: 'cornell',
      enableSubmit: true,
      metacognitionStrategy: 'meta_basic',
      metacognitionPrompt: '',
    },
  });

  // 模态框状态
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // 视角切换处理
  const handleViewSwitch = (newView: 'edit' | 'use' | 'results') => {
    if (newView === viewPerspective) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setViewPerspective(newView);
      setIsTransitioning(false);
    }, 150);
  };

  // Use视角：学生使用界面预览
  if (viewPerspective === 'use') {
    return (
      <div className={`h-[calc(100vh-4rem)] flex flex-col bg-gray-50 transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <UseViewHeader
          config={config}
          onBack={() => handleViewSwitch('edit')}
          onSwitchToResults={() => handleViewSwitch('results')}
        />
        <StudentPreview config={config} leftWidth={leftWidth} rightWidth={rightWidth} />
      </div>
    );
  }

  // Results视角：学习数据统计
  if (viewPerspective === 'results') {
    return (
      <div className={`h-[calc(100vh-4rem)] flex flex-col bg-gray-100 transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <ResultsViewHeader
          config={config}
          onBack={() => handleViewSwitch('edit')}
          onSwitchToUse={() => handleViewSwitch('use')}
        />
        <ResultsViewDashboard config={config} />
      </div>
    );
  }

  return (
    <div className={`h-[calc(100vh-4rem)] flex flex-col bg-gray-50 transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {/* 顶部工具栏 - Edit视角 */}
      <header className="h-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-50 rounded">
            <span className="text-xs font-medium text-primary-700">CocoLearn Teacher</span>
          </div>
          <div className="w-px h-5 bg-gray-200"></div>
          <button
            onClick={() => setActiveModal('noteInfo')}
            className="group flex items-center gap-1.5 hover:bg-gray-50 px-2 py-0.5 rounded transition-colors"
          >
            <h1 className="text-sm font-semibold text-gray-900">{config.noteInfo.title}</h1>
            <span className="text-xs text-gray-400 group-hover:text-primary-600 transition-colors">
              {config.noteInfo.grade || '未设置年级'}
            </span>
            <ChevronDown size={12} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewSwitch('edit')}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all bg-primary-100 text-primary-700"
          >
            <Pencil size={14} />
            编辑视角
          </button>
          <button
            onClick={() => handleViewSwitch('use')}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all text-gray-600 hover:bg-gray-100"
          >
            <Eye size={14} />
            使用视角
          </button>
          <button
            onClick={() => handleViewSwitch('results')}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all text-gray-600 hover:bg-gray-100"
          >
            <Activity size={14} />
            结果视角
          </button>
          <div className="w-px h-5 bg-gray-200"></div>
          <button className="flex items-center gap-1.5 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <Save size={14} />
            发布到班级
          </button>
        </div>
      </header>

      {/* 主内容区 - 三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：资源和任务 */}
        <LeftPanel
          config={config}
          setConfig={setConfig}
          onResourceClick={setSelectedResource}
          onTaskClick={setSelectedTask}
          onOpenLibrary={() => setActiveModal('library')}
          width={leftWidth}
        />

        {/* 左侧调整器 */}
        <Resizer
          position="left"
          onResize={(delta) => {
            const newLeftWidth = Math.max(18, Math.min(35, leftWidth + delta));
            setLeftWidth(newLeftWidth);
          }}
        />

        {/* 中间：配置面板 */}
        <CenterPanel
          config={config}
          setConfig={setConfig}
          onOpenNoteInfo={() => setActiveModal('noteInfo')}
          onOpenFreeConfig={() => setActiveModal('free')}
          onOpenGuidedConfig={() => setActiveModal('guided')}
          onOpenNotesConfig={() => setActiveModal('notes')}
          onOpenMetaConfig={() => setActiveModal('meta')}
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
          width={rightWidth}
          config={config}
          setConfig={setConfig}
          onOpenNotesConfig={() => setActiveModal('notes')}
          onOpenMetaConfig={() => setActiveModal('meta')}
        />
      </div>

      {/* 模态框 */}
      {activeModal === 'library' && (
        <ResourceLibraryModal
          onSelect={(resource: any) => {
            setConfig({
              ...config,
              resources: [...config.resources, { ...resource, id: `r_${Date.now()}` }],
            });
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'noteInfo' && (
        <NoteInfoModal
          config={config.noteInfo}
          knowledgeLibrary={KNOWLEDGE_POINTS_LIBRARY}
          grades={GRADES}
          classes={MOCK_CLASSES}
          onSave={(newNoteInfo: any) => {
            setConfig({ ...config, noteInfo: newNoteInfo });
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'free' && (
        <FreeModeModal
          config={config.freeConfig}
          inheritedAgents={MOCK_AGENTS}
          onSave={(newConfig: any) => {
            setConfig({ ...config, freeConfig: newConfig });
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'guided' && (
        <GuidedModeModal
          config={config.guidedConfig}
          inheritedWorkflows={MOCK_WORKFLOWS}
          onSave={(newConfig: any) => {
            setConfig({ ...config, guidedConfig: newConfig });
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'notes' && (
        <NotesModal
          config={config.outputConfig}
          inheritedTemplates={NOTE_TEMPLATES}
          onSave={(newConfig: any) => {
            setConfig({
              ...config,
              outputConfig: { ...config.outputConfig, ...newConfig },
            });
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'meta' && (
        <MetaModal
          config={config.outputConfig}
          inheritedStrategies={META_STRATEGIES}
          onSave={(newConfig: any) => {
            setConfig({
              ...config,
              outputConfig: { ...config.outputConfig, ...newConfig },
            });
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {selectedResource && (
        <ResourcePreviewModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}

      {selectedTask && (
        <TaskEditModal
          task={selectedTask}
          onSave={(updatedTask: any) => {
            setConfig({
              ...config,
              tasks: config.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
            });
            setSelectedTask(null);
          }}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

// 左侧面板组件
function LeftPanel({ config, setConfig, onResourceClick, onTaskClick, onOpenLibrary, width }: any) {
  const [draggedResourceIndex, setDraggedResourceIndex] = useState<number | null>(null);
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);

  const addTask = (type: 'quiz' | 'assignment') => {
    const newTask: Task = {
      id: `t_${Date.now()}`,
      type,
      title: type === 'quiz' ? '新测验' : '新作业',
      status: 'optional',
      questions: [],
    };
    setConfig({ ...config, tasks: [...config.tasks, newTask] });
  };

  const handleResourceDragStart = (index: number) => {
    setDraggedResourceIndex(index);
  };

  const handleResourceDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedResourceIndex === null || draggedResourceIndex === index) return;

    const newResources = [...config.resources];
    const draggedItem = newResources[draggedResourceIndex];
    newResources.splice(draggedResourceIndex, 1);
    newResources.splice(index, 0, draggedItem);

    setConfig({ ...config, resources: newResources });
    setDraggedResourceIndex(index);
  };

  const handleResourceDragEnd = () => {
    setDraggedResourceIndex(null);
  };

  const handleTaskDragStart = (index: number) => {
    setDraggedTaskIndex(index);
  };

  const handleTaskDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedTaskIndex === null || draggedTaskIndex === index) return;

    const newTasks = [...config.tasks];
    const draggedItem = newTasks[draggedTaskIndex];
    newTasks.splice(draggedTaskIndex, 1);
    newTasks.splice(index, 0, draggedItem);

    setConfig({ ...config, tasks: newTasks });
    setDraggedTaskIndex(index);
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskIndex(null);
  };

  return (
    <div style={{ width: `${width}%` }} className="bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* 资源列表 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <FolderOpen size={16} className="text-primary-500" />
            学习资源
          </h3>
          <button
            onClick={onOpenLibrary}
            className="p-1 hover:bg-primary-50 rounded transition-colors"
          >
            <Plus size={16} className="text-primary-600" />
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {config.resources.map((resource: Resource, index: number) => (
            <div
              key={resource.id}
              draggable
              onDragStart={() => handleResourceDragStart(index)}
              onDragOver={(e) => handleResourceDragOver(e, index)}
              onDragEnd={handleResourceDragEnd}
              onClick={() => onResourceClick(resource)}
              className={`flex items-center gap-3 p-2 bg-gray-50 rounded-xl hover:bg-primary-50 cursor-move transition-all group ${
                draggedResourceIndex === index ? 'opacity-50 scale-95' : ''
              }`}
            >
              <div className="cursor-grab active:cursor-grabbing p-1 flex-shrink-0">
                <GripVertical size={14} className="text-gray-400" />
              </div>
              <div className={`w-10 h-10 rounded-lg bg-${resource.color}-100 flex items-center justify-center flex-shrink-0`}>
                {resource.type === 'video' && <Video size={16} className={`text-${resource.color}-600`} />}
                {resource.type === 'pdf' && <FileText size={16} className={`text-${resource.color}-600`} />}
                {resource.type === 'ppt' && <FileSpreadsheet size={16} className={`text-${resource.color}-600`} />}
                {resource.type === 'web' && <Globe size={16} className={`text-${resource.color}-600`} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                <p className="text-xs text-gray-400">{resource.duration || `${resource.pages}页`}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfig({
                    ...config,
                    resources: config.resources.filter((r: Resource) => r.id !== resource.id),
                  });
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all flex-shrink-0"
              >
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 任务列表 */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <ListChecks size={16} className="text-amber-500" />
            学习任务
          </h3>
        </div>
        <div className="space-y-2 mb-4">
          {config.tasks.map((task: Task, index: number) => (
            <div
              key={task.id}
              draggable
              onDragStart={() => handleTaskDragStart(index)}
              onDragOver={(e) => handleTaskDragOver(e, index)}
              onDragEnd={handleTaskDragEnd}
              onClick={() => onTaskClick(task)}
              className={`flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-amber-50 cursor-move transition-all group ${
                draggedTaskIndex === index ? 'opacity-50 scale-95' : ''
              }`}
            >
              <div className="cursor-grab active:cursor-grabbing p-1 flex-shrink-0">
                <GripVertical size={14} className="text-gray-400" />
              </div>
              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfig({
                    ...config,
                    tasks: config.tasks.filter((t: Task) => t.id !== task.id),
                  });
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all flex-shrink-0"
              >
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addTask('quiz')}
            className="py-2 border border-dashed border-green-300 rounded-xl text-green-600 hover:bg-green-50 text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Plus size={12} />
            添加测验
          </button>
          <button
            onClick={() => addTask('assignment')}
            className="py-2 border border-dashed border-primary-300 rounded-xl text-primary-600 hover:bg-primary-50 text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Plus size={12} />
            添加作业
          </button>
        </div>
      </div>
    </div>
  );
}

// 中间面板组件
function CenterPanel({
  config,
  setConfig,
  onOpenNoteInfo,
  onOpenFreeConfig,
  onOpenGuidedConfig,
  onOpenNotesConfig,
  onOpenMetaConfig,
}: any) {
  const [expandedPrompt, setExpandedPrompt] = useState<'free' | 'guided' | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* 交互策略 - 所见即所得版本 */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">AI 交互策略</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info size={14} />
              <span>学生将看到的AI助手</span>
            </div>
          </div>

          {/* 模式切换 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setConfig({ ...config, interactionMode: 'free' })}
              className={`p-4 rounded-xl border-2 transition-all ${
                config.interactionMode === 'free'
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  config.interactionMode === 'free' ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <MessageCircle size={20} className={config.interactionMode === 'free' ? 'text-primary-600' : 'text-gray-500'} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm text-gray-800">自由对话</h3>
                  <p className="text-xs text-gray-500">灵活问答</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setConfig({ ...config, interactionMode: 'guided' })}
              className={`p-4 rounded-xl border-2 transition-all ${
                config.interactionMode === 'guided'
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  config.interactionMode === 'guided' ? 'bg-emerald-100' : 'bg-gray-100'
                }`}>
                  <GitBranch size={20} className={config.interactionMode === 'guided' ? 'text-emerald-600' : 'text-gray-500'} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm text-gray-800">引导学习</h3>
                  <p className="text-xs text-gray-500">流程化</p>
                </div>
              </div>
            </button>
          </div>

          {/* 自由对话配置 */}
          {config.interactionMode === 'free' && (
            <div className="space-y-4 p-4 bg-primary-50/50 rounded-xl border border-primary-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Bot size={14} className="text-primary-600" />
                  选择 AI 助手
                  <span className="text-xs text-gray-400 font-normal">(继承自通用版)</span>
                </label>
                <select
                  value={config.freeConfig.selectedAgentId}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      freeConfig: { ...config.freeConfig, selectedAgentId: e.target.value },
                    })
                  }
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {MOCK_AGENTS.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Pencil size={14} className="text-primary-600" />
                    教师追加指令
                    <span className="text-xs text-gray-400 font-normal">(user_prompt)</span>
                  </label>
                  <button
                    onClick={() => setExpandedPrompt(expandedPrompt === 'free' ? null : 'free')}
                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    {expandedPrompt === 'free' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {expandedPrompt === 'free' ? '收起' : '展开'}
                  </button>
                </div>
                {expandedPrompt === 'free' && (
                  <textarea
                    value={config.freeConfig.teacherPrompt}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        freeConfig: { ...config.freeConfig, teacherPrompt: e.target.value },
                      })
                    }
                    placeholder="例如：请用幽默的口吻回答，所有比喻都和「水」有关..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                    rows={4}
                  />
                )}
                {!expandedPrompt && config.freeConfig.teacherPrompt && (
                  <div className="text-xs text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-200 truncate">
                    {config.freeConfig.teacherPrompt}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Key size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-700">启用知识围栏</span>
                  <span className="text-xs text-gray-400">(仅回答课程相关)</span>
                </div>
                <button
                  onClick={() =>
                    setConfig({
                      ...config,
                      freeConfig: { ...config.freeConfig, enableFence: !config.freeConfig.enableFence },
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    config.freeConfig.enableFence ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform absolute top-0.5 ${
                      config.freeConfig.enableFence ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* 引导学习配置 */}
          {config.interactionMode === 'guided' && (
            <div className="space-y-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Route size={14} className="text-emerald-600" />
                  选择教学法流程
                  <span className="text-xs text-gray-400 font-normal">(继承自通用版)</span>
                </label>
                <select
                  value={config.guidedConfig.selectedWorkflowId}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      guidedConfig: { ...config.guidedConfig, selectedWorkflowId: e.target.value },
                    })
                  }
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {MOCK_WORKFLOWS.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.name} - {workflow.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* 流程预览 */}
              {MOCK_WORKFLOWS.find((w) => w.id === config.guidedConfig.selectedWorkflowId) && (
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers size={14} className="text-emerald-600" />
                    <span className="text-xs font-medium text-gray-700">流程阶段预览</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {MOCK_WORKFLOWS.find((w) => w.id === config.guidedConfig.selectedWorkflowId)?.stages.map(
                      (stage: any, idx: number) => (
                        <div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                              {idx + 1}
                            </div>
                            <span className="text-xs text-gray-600 mt-1 whitespace-nowrap">{stage.name.split(' ')[0]}</span>
                          </div>
                          {idx < MOCK_WORKFLOWS.find((w) => w.id === config.guidedConfig.selectedWorkflowId)!.stages.length - 1 && (
                            <ChevronRight size={14} className="text-gray-400" />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={onOpenGuidedConfig}
                className="w-full bg-white hover:bg-emerald-50 border-2 border-emerald-200 rounded-lg px-4 py-2.5 text-sm font-medium text-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Sliders size={14} />
                微调各阶段提示词
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// 右侧面板 - 学习工作室
function RightPanel({ width, config, setConfig, onOpenNotesConfig, onOpenMetaConfig }: any) {
  const [showNotePreview, setShowNotePreview] = useState(false);
  const selectedTemplate = NOTE_TEMPLATES.find((t) => t.id === config.outputConfig.noteTemplate);

  return (
    <div style={{ width: `${width}%` }} className="bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <h2 className="font-bold text-gray-700 flex items-center gap-2">
          <Layout size={18} className="text-emerald-600" />
          学习工作室
        </h2>
        <p className="text-xs text-gray-500 mt-1">学生端的笔记与监控</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 笔记模板配置 */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2">
              <FileEdit size={14} className="text-primary-500" />
              笔记模板
            </h3>
            <button
              onClick={() => setShowNotePreview(!showNotePreview)}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Eye size={12} />
              {showNotePreview ? '隐藏预览' : '预览'}
            </button>
          </div>

          <div className="space-y-3">
            <select
              value={config.outputConfig.noteTemplate}
              onChange={(e) =>
                setConfig({
                  ...config,
                  outputConfig: { ...config.outputConfig, noteTemplate: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {NOTE_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>

            {/* 笔记预览 */}
            {showNotePreview && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={12} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">学生端效果预览</span>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200 min-h-[120px]">
                  {selectedTemplate?.structure?.length && selectedTemplate.structure.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTemplate.structure.map((section: string, i: number) => (
                        <div key={i} className="border-b border-gray-100 pb-2 last:border-0">
                          <div className="text-xs font-medium text-gray-600 mb-1">{section}</div>
                          <div className="h-8 bg-gray-50 rounded border border-dashed border-gray-300"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-gray-400">空白笔记区域</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 学情监控配置 - 展开所有配置 */}
        <div className="p-4">
          <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-3">
            <Activity size={14} className="text-accent-500" />
            学情监控
            <span className="text-xs text-gray-400 font-normal">(继承自通用版)</span>
          </h3>

          <div className="space-y-4">
            {/* 策略选择 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">监控策略</label>
              <select
                value={config.outputConfig.metacognitionStrategy}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    outputConfig: { ...config.outputConfig, metacognitionStrategy: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                {META_STRATEGIES.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 策略说明 */}
            {META_STRATEGIES.find((s) => s.id === config.outputConfig.metacognitionStrategy) && (
              <div className="bg-accent-50 rounded-lg p-3 border border-accent-200">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={12} className="text-accent-600" />
                  <span className="text-xs font-medium text-accent-700">策略说明</span>
                </div>
                <p className="text-xs text-accent-700 leading-relaxed">
                  {META_STRATEGIES.find((s) => s.id === config.outputConfig.metacognitionStrategy)?.description}
                </p>
              </div>
            )}

            {/* 教师追加指令 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                教师追加指令 <span className="text-gray-400 font-normal">(user_prompt)</span>
              </label>
              <textarea
                value={config.outputConfig.metacognitionPrompt || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    outputConfig: { ...config.outputConfig, metacognitionPrompt: e.target.value },
                  })
                }
                placeholder="例如：当学生在视频资源上停留超过5分钟未操作时，提醒他们..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-accent-500 outline-none min-h-[80px] resize-none"
              />
            </div>

            {/* 能力评估预览 */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-3 border border-primary-200">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-primary-600" />
                <h4 className="text-xs font-bold text-gray-800">能力评估预览</h4>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                AI将在学习过程中监控以下能力的发展情况，并在元认知监控中提供针对性反馈
              </p>

              {/* 能力标签展示 */}
              <div className="flex flex-wrap gap-2">
                {config.tasks && config.tasks.length > 0 ? (
                  (() => {
                    // 收集所有已配置的能力维度
                    const allCompetencies = new Set<CompetencyType>();
                    config.tasks.forEach((task: any) => {
                      if (task.assignedCompetencies) {
                        task.assignedCompetencies.forEach((comp: CompetencyType) => allCompetencies.add(comp));
                      }
                    });

                    return allCompetencies.size > 0 ? (
                      Array.from(allCompetencies).map((competency) => {
                        const def = COMPETENCY_DEFINITIONS[competency];
                        return (
                          <div
                            key={competency}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg text-xs font-medium text-primary-700 border border-primary-300 shadow-sm"
                            title={def.description}
                          >
                            {def.name}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-gray-500 italic bg-white/60 px-3 py-2 rounded-lg w-full">
                        当前暂无配置能力维度，请在"任务区"的作业任务中添加能力维度标记
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-xs text-gray-500 italic bg-white/60 px-3 py-2 rounded-lg w-full">
                    当前暂无任务，请先在"任务区"添加作业任务
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 以下是所有模态框组件的简化实现
// 由于篇幅限制，这里只展示核心结构，完整实现会在下一个文件中继续

function ResourceLibraryModal({ onSelect, onClose }: any) {
  const [selectedCategory, setSelectedCategory] = useState('视频');
  const [uploadMode, setUploadMode] = useState<'library' | 'local'>('library');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let type: 'video' | 'pdf' | 'ppt' | 'web' = 'pdf';
      let color = 'blue';

      if (['mp4', 'avi', 'mov', 'wmv'].includes(fileExtension || '')) {
        type = 'video';
        color = 'red';
      } else if (fileExtension === 'pdf') {
        type = 'pdf';
        color = 'blue';
      } else if (['ppt', 'pptx'].includes(fileExtension || '')) {
        type = 'ppt';
        color = 'orange';
      }

      const newResource: Resource = {
        id: `local_${Date.now()}_${Math.random()}`,
        type,
        title: file.name,
        description: `本地上传 - ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        icon: type === 'video' ? 'Video' : type === 'pdf' ? 'FileText' : 'FileSpreadsheet',
        color,
      };

      onSelect(newResource);
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-[700px] max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Database size={20} />
            添加学习资源
          </h2>
        </div>

        {/* 切换模式 */}
        <div className="px-5 py-3 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setUploadMode('library')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                uploadMode === 'library'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              从知识库选择
            </button>
            <button
              onClick={() => setUploadMode('local')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                uploadMode === 'local'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              本地上传
            </button>
          </div>
        </div>

        {uploadMode === 'library' ? (
          <>
            {/* 知识库分类选择 */}
            <div className="px-5 py-3 border-b border-gray-200 flex gap-2">
              {Object.keys(RESOURCE_LIBRARY).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* 知识库资源列表 */}
            <div className="p-5 max-h-[50vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {RESOURCE_LIBRARY[selectedCategory as keyof typeof RESOURCE_LIBRARY]?.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 flex items-center justify-center`}>
                        {item.type === 'video' && <Video size={20} className={`text-${item.color}-600`} />}
                        {item.type === 'pdf' && <FileText size={20} className={`text-${item.color}-600`} />}
                        {item.type === 'ppt' && <FileSpreadsheet size={20} className={`text-${item.color}-600`} />}
                        {item.type === 'web' && <Globe size={20} className={`text-${item.color}-600`} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 本地上传界面 */}
            <div className="p-8 max-h-[50vh] overflow-y-auto flex items-center justify-center">
              <label className="w-full max-w-md cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Upload size={32} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">点击或拖拽文件到此处上传</p>
                      <p className="text-xs text-gray-500">支持 MP4, PDF, PPT 等格式</p>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".mp4,.avi,.mov,.wmv,.pdf,.ppt,.pptx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </>
        )}

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
