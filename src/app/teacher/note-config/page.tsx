'use client';

import { useState } from 'react';
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

interface KnowledgePoint {
  id: string;
  subject: string;
  point: string;
  difficulty?: '基础' | '中级' | '高级';
  source: 'library' | 'custom';
}

interface NoteConfig {
  noteInfo: {
    title: string;
    description: string;
    subjects?: string[];
    grade?: string;
    bindClasses?: string[];
    knowledgePoints?: KnowledgePoint[];
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

const KNOWLEDGE_POINTS_LIBRARY: Record<string, KnowledgePoint[]> = {
  科学: [
    { id: 'sci_001', subject: '科学', point: '水的三态变化', difficulty: '基础', source: 'library' },
    { id: 'sci_002', subject: '科学', point: '水循环过程', difficulty: '中级', source: 'library' },
    { id: 'sci_003', subject: '科学', point: '蒸发与凝结', difficulty: '基础', source: 'library' },
    { id: 'sci_004', subject: '科学', point: '水资源分布规律', difficulty: '高级', source: 'library' },
  ],
  地理: [
    { id: 'geo_001', subject: '地理', point: '水文特征', difficulty: '中级', source: 'library' },
    { id: 'geo_002', subject: '地理', point: '流域与水系', difficulty: '中级', source: 'library' },
    { id: 'geo_003', subject: '地理', point: '气候对水资源的影响', difficulty: '高级', source: 'library' },
  ],
  环境教育: [
    { id: 'env_001', subject: '环境教育', point: '水资源保护意识', difficulty: '基础', source: 'library' },
    { id: 'env_002', subject: '环境教育', point: '节约用水方法', difficulty: '基础', source: 'library' },
    { id: 'env_003', subject: '环境教育', point: '水污染防治', difficulty: '中级', source: 'library' },
  ],
  数学: [
    { id: 'math_001', subject: '数学', point: '百分比计算', difficulty: '基础', source: 'library' },
    { id: 'math_002', subject: '数学', point: '统计图表分析', difficulty: '中级', source: 'library' },
  ],
};

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
  const getInitialViewPerspective = () => {
    if (typeof window === 'undefined') return 'edit';
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam === 'use' || viewParam === 'results' || viewParam === 'edit') {
      return viewParam as 'edit' | 'use' | 'results';
    }
    return 'edit';
  };
  const [viewPerspective, setViewPerspective] = useState<'edit' | 'use' | 'results'>(getInitialViewPerspective());
  const [leftWidth, setLeftWidth] = useState(20);
  const [rightWidth, setRightWidth] = useState(30);

  // 配置数据
  const [config, setConfig] = useState<NoteConfig>({
    noteInfo: {
      title: '水循环与水资源',
      description: '探索水的循环过程，理解水资源的重要性',
      subjects: ['科学', '地理', '环境教育'],
      grade: '四年级',
      bindClasses: ['四年级1班', '四年级2班'],
      knowledgePoints: [
        { id: 'kp1', subject: '科学', point: '水循环过程', difficulty: '中级', source: 'library' },
        { id: 'kp2', subject: '地理', point: '水文特征', difficulty: '中级', source: 'library' },
        { id: 'kp3', subject: '环境教育', point: '水资源保护意识', difficulty: '基础', source: 'library' },
      ],
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

  // Use视角：学生使用界面预览
  if (viewPerspective === 'use') {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <UseViewHeader
          config={config}
          onBack={() => setViewPerspective('edit')}
          onSwitchToResults={() => setViewPerspective('results')}
        />
        <StudentPreview config={config} leftWidth={leftWidth} rightWidth={rightWidth} />
      </div>
    );
  }

  // Results视角：学习数据统计
  if (viewPerspective === 'results') {
    return (
      <div className="h-screen flex flex-col bg-slate-100">
        <ResultsViewHeader
          config={config}
          onBack={() => setViewPerspective('edit')}
          onSwitchToUse={() => setViewPerspective('use')}
        />
        <ResultsViewDashboard config={config} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* 顶部工具栏 - Edit视角 */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            笔记配置
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">编辑视角</span>
          </h1>
          <p className="text-sm text-slate-500">{config.noteInfo.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewPerspective('use')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Eye size={16} />
            使用视角
          </button>
          <button
            onClick={() => setViewPerspective('results')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Activity size={16} />
            结果视角
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Save size={16} />
            保存配置
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
            const newLeftWidth = Math.max(15, Math.min(40, leftWidth + delta));
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
            const newRightWidth = Math.max(15, Math.min(40, rightWidth - delta));
            setRightWidth(newRightWidth);
          }}
        />

        {/* 右侧：帮助和说明 */}
        <RightPanel width={rightWidth} />
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
    <div style={{ width: `${width}%` }} className="bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
      {/* 资源列表 */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <FolderOpen size={16} className="text-blue-500" />
            学习资源
          </h3>
          <button
            onClick={onOpenLibrary}
            className="p-1 hover:bg-blue-50 rounded transition-colors"
          >
            <Plus size={16} className="text-blue-600" />
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
              className={`flex items-center gap-3 p-2 bg-slate-50 rounded-lg hover:bg-blue-50 cursor-move transition-all group ${
                draggedResourceIndex === index ? 'opacity-50 scale-95' : ''
              }`}
            >
              <div className="cursor-grab active:cursor-grabbing p-1 flex-shrink-0">
                <GripVertical size={14} className="text-slate-400" />
              </div>
              <div className={`w-10 h-10 rounded-lg bg-${resource.color}-100 flex items-center justify-center flex-shrink-0`}>
                {resource.type === 'video' && <Video size={16} className={`text-${resource.color}-600`} />}
                {resource.type === 'pdf' && <FileText size={16} className={`text-${resource.color}-600`} />}
                {resource.type === 'ppt' && <FileSpreadsheet size={16} className={`text-${resource.color}-600`} />}
                {resource.type === 'web' && <Globe size={16} className={`text-${resource.color}-600`} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{resource.title}</p>
                <p className="text-xs text-slate-400">{resource.duration || `${resource.pages}页`}</p>
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
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
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
              className={`flex items-center gap-2 p-3 bg-slate-50 rounded-lg hover:bg-amber-50 cursor-move transition-all group ${
                draggedTaskIndex === index ? 'opacity-50 scale-95' : ''
              }`}
            >
              <div className="cursor-grab active:cursor-grabbing p-1 flex-shrink-0">
                <GripVertical size={14} className="text-slate-400" />
              </div>
              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                task.status === 'required' ? 'bg-red-100' : 'bg-slate-100'
              }`}>
                {task.type === 'quiz' ? (
                  <Zap size={14} className={task.status === 'required' ? 'text-red-600' : 'text-slate-500'} />
                ) : (
                  <FileEdit size={14} className={task.status === 'required' ? 'text-red-600' : 'text-slate-500'} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                <p className="text-xs text-slate-400">{task.type === 'quiz' ? '测验' : '作业'}</p>
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
            className="py-2 border border-dashed border-green-300 rounded-lg text-green-600 hover:bg-green-50 text-xs flex items-center justify-center gap-1"
          >
            <Plus size={12} />
            添加测验
          </button>
          <button
            onClick={() => addTask('assignment')}
            className="py-2 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 text-xs flex items-center justify-center gap-1"
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
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 基本信息 */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">笔记标题</label>
              <input
                type="text"
                value={config.noteInfo.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    noteInfo: { ...config.noteInfo, title: e.target.value },
                  })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">描述</label>
              <textarea
                value={config.noteInfo.description}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    noteInfo: { ...config.noteInfo, description: e.target.value },
                  })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows={3}
              />
            </div>

            {/* 跨学科配置概览 */}
            {(config.noteInfo.subjects?.length > 0 ||
              config.noteInfo.grade ||
              config.noteInfo.bindClasses?.length > 0 ||
              config.noteInfo.knowledgePoints?.length > 0) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 space-y-2">
                {config.noteInfo.subjects?.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-600">学科:</span>
                    {config.noteInfo.subjects.map((subject: string) => (
                      <span
                        key={subject}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
                {config.noteInfo.grade && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600">年级:</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                      {config.noteInfo.grade}
                    </span>
                  </div>
                )}
                {config.noteInfo.bindClasses?.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-600">班级:</span>
                    {config.noteInfo.bindClasses.map((cls: string) => (
                      <span
                        key={cls}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                )}
                {config.noteInfo.knowledgePoints?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600">知识点:</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                      已配置 {config.noteInfo.knowledgePoints.length} 个
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onOpenNoteInfo}
              className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 rounded-lg px-4 py-3 text-sm font-medium text-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              高级配置（学科、年级、知识点）
            </button>
          </div>
        </section>

        {/* 交互策略 */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">交互策略</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setConfig({ ...config, interactionMode: 'free' });
                onOpenFreeConfig();
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                config.interactionMode === 'free'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <MessageCircle size={24} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">自由对话</h3>
              <p className="text-xs text-slate-500">学生可自由提问，AI灵活回答</p>
              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFreeConfig();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto"
                >
                  <Settings size={12} />
                  配置
                </button>
              </div>
            </button>

            <button
              onClick={() => {
                setConfig({ ...config, interactionMode: 'guided' });
                onOpenGuidedConfig();
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                config.interactionMode === 'guided'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <GitBranch size={24} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">引导学习</h3>
              <p className="text-xs text-slate-500">按教学法流程逐步引导</p>
              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenGuidedConfig();
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mx-auto"
                >
                  <Settings size={12} />
                  配置
                </button>
              </div>
            </button>
          </div>
        </section>

        {/* 产出与监控 */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">产出与监控</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onOpenNotesConfig}
              className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileEdit size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-1">笔记配置</h3>
                  <p className="text-xs text-slate-500 mb-2">
                    当前模板: {NOTE_TEMPLATES.find((t) => t.id === config.outputConfig.noteTemplate)?.name}
                  </p>
                  <span className="text-xs text-blue-600 flex items-center gap-1">
                    <Settings size={10} />
                    修改
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={onOpenMetaConfig}
              className="p-4 rounded-xl border-2 border-slate-200 hover:border-purple-300 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Activity size={18} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-1">学情监控</h3>
                  <p className="text-xs text-slate-500 mb-2">
                    当前策略: {META_STRATEGIES.find((s) => s.id === config.outputConfig.metacognitionStrategy)?.name}
                  </p>
                  <span className="text-xs text-purple-600 flex items-center gap-1">
                    <Settings size={10} />
                    修改
                  </span>
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// 右侧帮助面板
function RightPanel({ width }: any) {
  return (
    <div style={{ width: `${width}%` }} className="bg-gradient-to-br from-slate-50 to-blue-50 border-l border-slate-200 p-6 overflow-y-auto flex-shrink-0">
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Info size={16} className="text-blue-500" />
            配置指南
          </h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="font-medium text-blue-700 mb-1">1. 添加学习资源</p>
              <p className="text-xs text-slate-500">从资源库选择视频、文档等材料</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="font-medium text-blue-700 mb-1">2. 配置交互策略</p>
              <p className="text-xs text-slate-500">选择自由对话或引导学习模式</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="font-medium text-blue-700 mb-1">3. 设置任务</p>
              <p className="text-xs text-slate-500">添加测验或作业任务</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="font-medium text-blue-700 mb-1">4. 预览效果</p>
              <p className="text-xs text-slate-500">点击"学生预览"查看学生端界面</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-2 mb-2">
            <Lightbulb size={16} className="text-amber-600 mt-0.5" />
            <p className="text-sm font-bold text-amber-800">小提示</p>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            建议为每个笔记配置2-3个核心资源，1-2个必修任务，这样能保证学习效果又不会让学生感到负担过重。
          </p>
        </div>
      </div>
    </div>
  );
}

// 以下是所有模态框组件的简化实现
// 由于篇幅限制，这里只展示核心结构，完整实现会在下一个文件中继续

function ResourceLibraryModal({ onSelect, onClose }: any) {
  const [selectedCategory, setSelectedCategory] = useState('视频');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-[700px] max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Database size={20} />
            知识库资源选择
          </h2>
        </div>

        <div className="px-5 py-3 border-b border-slate-200 flex gap-2">
          {Object.keys(RESOURCE_LIBRARY).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="p-5 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {RESOURCE_LIBRARY[selectedCategory as keyof typeof RESOURCE_LIBRARY]?.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 flex items-center justify-center`}>
                    {item.type === 'video' && <Video size={20} className={`text-${item.color}-600`} />}
                    {item.type === 'pdf' && <FileText size={20} className={`text-${item.color}-600`} />}
                    {item.type === 'ppt' && <FileSpreadsheet size={20} className={`text-${item.color}-600`} />}
                    {item.type === 'web' && <Globe size={20} className={`text-${item.color}-600`} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
