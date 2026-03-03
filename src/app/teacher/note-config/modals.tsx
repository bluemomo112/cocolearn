import { useState, useEffect } from 'react';
import { PublishSuccessModal } from './PublishSuccessModal';
import {
  X,
  Bot,
  MessageCircle,
  GitBranch,
  FileEdit,
  Activity,
  Eye,
  Info,
  Sparkles,
  Check,
  Route,
  Sliders,
  Pencil,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Send,
  FileText,
  Layers,
  Brain,
  Video,
  Globe,
  Play,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Zap,
  ListChecks,
  Trash2,
  Plus,
  Key,
  Loader2,
  ArrowLeft,
  Users,
  CheckCircle,
  Calendar,
  Clock,
  Target,
  FolderOpen,
  MessageSquare,
  Layout,
  TrendingUp,
  GripVertical,
  Network,
  Settings,
  Database,
  HelpCircle,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

// 导入重构后的可视化组件
import {
  CompetencyDistributionChart,
  StudentListItem,
  StudentDetailPanel,
  renderStars,
  getStarsText,
  type CompetencyType as ResultsCompetencyType,
  type ClassCompetencyDistribution,
  type StudentCompetencyProfile,
  COMPETENCY_DEFINITIONS as RESULTS_COMPETENCY_DEFINITIONS,
} from './results-view';

// 能力维度类型定义（跨学科通用能力）
type CrossCompetencyType =
  | 'critical_thinking'      // 批判性思维
  | 'information_synthesis'  // 信息整合
  | 'metacognition'          // 元认知
  | 'question_quality'       // 提问质量
  | 'creativity'             // 创造性
  | 'persistence';           // 坚持性

// 跨学科能力定义（通用能力，所有学科共享）
const CROSS_COMPETENCY_DEFINITIONS: Record<CrossCompetencyType, { name: string; description: string; icon: any }> = {
  critical_thinking: {
    name: '批判性思维',
    description: '评估信息、识别假设、分析论证的能力',
    icon: Brain,
  },
  information_synthesis: {
    name: '信息整合',
    description: '从多个来源整合信息、建立联系的能力',
    icon: Network,
  },
  metacognition: {
    name: '元认知',
    description: '反思学习过程、调整学习策略的能力',
    icon: Eye,
  },
  question_quality: {
    name: '提问质量',
    description: '提出有深度、有洞察力问题的能力',
    icon: HelpCircle,
  },
  creativity: {
    name: '创造性',
    description: '产生新颖想法、解决方案的能力',
    icon: Lightbulb,
  },
  persistence: {
    name: '坚持性',
    description: '面对挑战持续努力、不轻易放弃的品质',
    icon: Target,
  },
};

// 学科能力定义（学科特定的核心素养）
interface SubjectCompetency {
  id: string;
  name: string;
  description: string;
}

interface SubjectCompetencies {
  [subject: string]: SubjectCompetency[];
}

// 学科能力数据（从后台配置获取，这里为 mock 数据）
const SUBJECT_COMPETENCIES: SubjectCompetencies = {
  '语文': [
    { id: 'chinese_culture', name: '文化自信', description: '认同中华文化，理解多样文化' },
    { id: 'language_use', name: '语言运用', description: '有效表达和交流沟通能力' },
    { id: 'thinking_quality', name: '思维能力', description: '逻辑思维、直觉思维的品质' },
    { id: 'aesthetic_creation', name: '审美创造', description: '感受美、发现美、创造美' },
  ],
  '数学': [
    { id: 'math_abstraction', name: '数学抽象', description: '从具体情境中抽象出数学概念' },
    { id: 'logical_reasoning', name: '逻辑推理', description: '从已有事实推出新结论的能力' },
    { id: 'math_modeling', name: '数学建模', description: '用数学解决实际问题的能力' },
    { id: 'math_operation', name: '数学运算', description: '正确进行运算的能力' },
    { id: 'spatial_imagination', name: '直观想象', description: '几何直观和空间想象能力' },
    { id: 'data_analysis', name: '数据分析', description: '收集、整理、分析数据的能力' },
  ],
  '科学': [
    { id: 'science_inquiry', name: '科学探究', description: '提出问题、设计探究、得出结论' },
    { id: 'science_attitude', name: '科学态度', description: '严谨认真、实事求是的科学态度' },
    { id: 'science_responsibility', name: '社会责任', description: '爱护环境、保护生态的责任感' },
  ],
  '英语': [
    { id: 'language_ability', name: '语言能力', description: '听、说、读、看、写等语言技能' },
    { id: 'cultural_awareness', name: '文化意识', description: '理解中外文化差异' },
    { id: 'thinking_quality', name: '思维品质', description: '思维的逻辑性、批判性、创新性' },
    { id: 'learning_ability', name: '学习能力', description: '学习策略和自主学习能力' },
  ],
  '历史': [
    { id: 'historical_materialism', name: '唯物史观', description: '用历史唯物主义观点分析历史' },
    { id: 'historical_interpretation', name: '历史解释', description: '对历史事物的理性分析和阐释' },
    { id: 'historical_values', name: '家国情怀', description: '对国家认同、民族认同的情感' },
  ],
  '地理': [
    { id: 'human_land_coordination', name: '人地协调观', description: '人类活动与地理环境的关系' },
    { id: 'comprehensive_thinking', name: '综合思维', description: '要素综合、时空综合、区域综合' },
    { id: 'regional_cognition', name: '区域认知', description: '认识区域特征、差异与联系' },
    { id: 'geographic_practice', name: '地理实践力', description: '地理工具使用和实践活动能力' },
  ],
  '物理': [
    { id: 'physics_concept', name: '物理观念', description: '物质、运动、相互作用、能量等观念' },
    { id: 'scientific_thinking', name: '科学思维', description: '模型建构、推理论证、质疑创新' },
    { id: 'scientific_inquiry', name: '科学探究', description: '问题、证据、解释、交流' },
    { id: 'scientific_attitude', name: '科学态度与责任', description: '科学本质、STSE、科学态度' },
  ],
  '化学': [
    { id: 'macro_micro_identification', name: '宏观辨识', description: '从宏观和微观角度认识化学物质' },
    { id: 'evidence_reasoning', name: '证据推理', description: '基于证据进行逻辑推理' },
    { id: 'model_innovation', name: '模型认知', description: '构建化学模型并应用创新' },
    { id: 'scientific_attitude', name: '科学态度', description: '严谨求实、探索未知的科学精神' },
  ],
  '生物': [
    { id: 'life_concept', name: '生命观念', description: '对生命现象及关系的认识' },
    { id: 'scientific_thinking', name: '科学思维', description: '归纳概括、演绎推理、模型建模' },
    { id: 'scientific_inquiry', name: '科学探究', description: '发现问题、实验设计、得出结论' },
    { id: 'social_responsibility', name: '社会责任', description: '生物科学价值观和责任感' },
  ],
};

// 可调整大小的分隔条组件
export function Resizer({ onResize, position }: { onResize: (delta: number) => void; position: 'left' | 'right' }) {
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

// AI 推荐函数（Mock 实现）
const generateCoverRecommendation = (title: string): string => {
  // 基于关键词匹配预设图库
  const coverMap: Record<string, string> = {
    '水': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    '循环': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    '植物': 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400',
    '动物': 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400',
    '地球': 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400',
    '科学': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
    '数学': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    '历史': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400',
  };

  for (const [keyword, url] of Object.entries(coverMap)) {
    if (title.includes(keyword)) {
      return url;
    }
  }

  // 默认封面
  return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400';
};

const generateTagRecommendations = (title: string, subjects: string[]): string[] => {
  const allTags = ['知识点', '实验', '探究', '跨学科', '项目式学习', '观察', '分析', '创新'];

  // 基于标题和学科推荐标签
  const recommendedTags: string[] = [];

  if (title.includes('实验') || title.includes('观察')) {
    recommendedTags.push('实验', '观察');
  }
  if (title.includes('探究') || title.includes('研究')) {
    recommendedTags.push('探究', '分析');
  }
  if (subjects.length > 1) {
    recommendedTags.push('跨学科');
  }
  if (title.includes('项目') || title.includes('设计')) {
    recommendedTags.push('项目式学习', '创新');
  }

  // 如果没有匹配，返回默认推荐
  if (recommendedTags.length === 0) {
    return ['知识点', '探究'];
  }

  return [...new Set(recommendedTags)]; // 去重
};

// 跨学科标签（精选推荐，限制在10个以内）
const CROSS_DISCIPLINARY_TAGS = [
  '系统与平衡', '生态系统', '数据分析', '逻辑思维',
  '文化传承', '可持续发展', '创新思维', '批判性思考',
  '问题解决', '信息素养',
];

// 完整学科列表
const ALL_SUBJECTS = [
  '语文', '数学', '英语', '物理', '化学', '生物',
  '历史', '地理', '政治', '科学', '信息技术', '通用技术',
  '音乐', '美术', '体育', '心理健康', '劳动技术', '综合实践',
];

// NoteInfoModal - 跨学科配置模态框
export function NoteInfoModal({ config, onSave, onClose, knowledgeLibrary, grades, classes }: any) {
  const [localConfig, setLocalConfig] = useState({
    title: config.title || '',
    cover: config.cover || '',
    tags: config.tags || [],
    subjects: config.subjects || [],
    grade: config.grade || '',
    bindClasses: config.bindClasses || [],
  });
  const [showMoreConfig, setShowMoreConfig] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [publishData, setPublishData] = useState({ link: '', code: '' });
  const [publishError, setPublishError] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');
  const [showShareLink, setShowShareLink] = useState(false);

  const allSubjects = ALL_SUBJECTS;

  // AI 自动推荐封面和标签
  useEffect(() => {
    if (!localConfig.title) return;

    const timer = setTimeout(() => {
      setIsGeneratingAI(true);

      // 模拟 AI 生成延迟
      setTimeout(() => {
        const newCover = generateCoverRecommendation(localConfig.title);
        const newTags = generateTagRecommendations(localConfig.title, localConfig.subjects);

        setLocalConfig((prev) => ({
          ...prev,
          cover: newCover,
          tags: newTags,
        }));

        setIsGeneratingAI(false);
      }, 800);
    }, 500); // 防抖 500ms

    return () => clearTimeout(timer);
  }, [localConfig.title, localConfig.subjects]);

  const toggleSubject = (subject: string) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s: string) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const toggleTag = (tag: string) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t: string) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const toggleClass = (className: string) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      bindClasses: prev.bindClasses.includes(className)
        ? prev.bindClasses.filter((c: string) => c !== className)
        : [...prev.bindClasses, className],
    }));
  };

  const regenerateCover = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const newCover = generateCoverRecommendation(localConfig.title);
      setLocalConfig((prev) => ({ ...prev, cover: newCover }));
      setIsGeneratingAI(false);
    }, 800);
  };

  const handlePublish = () => {
    console.log('=== 发布按钮被点击 ===');
    console.log('当前配置:', localConfig);

    // 清除之前的错误
    setPublishError('');

    // 验证发布配置
    if (!localConfig.grade) {
      console.log('❌ 验证失败: 未选择年级');
      setPublishError('请选择年级后再发布');
      return;
    }
    if (localConfig.bindClasses.length === 0) {
      console.log('❌ 验证失败: 未绑定班级');
      setPublishError('请至少绑定一个班级后再发布');
      return;
    }

    console.log('✅ 验证通过，开始发布...');

    // 生成课程链接和随机码（mock）
    const courseId = Math.random().toString(36).substring(2, 10);
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const link = `https://student.example.com/course/${courseId}`;

    console.log('生成的发布数据:', { link, code: randomCode });

    // 保存配置（包含发布信息）
    onSave({
      ...localConfig,
      publishedLink: link,
      publishedCode: randomCode,
    });

    setPublishData({ link, code: randomCode });
    setShowPublishSuccess(true);

    console.log('✅ 发布成功弹窗应该显示了, showPublishSuccess=', true);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-[900px] max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-gray-100" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Settings size={22} />
                </div>
                笔记基本信息配置
              </h2>
              <p className="text-primary-100 text-sm mt-1.5 ml-11">配置课程信息并发布到班级</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-7 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="space-y-7">
            {/* 课程基本信息 - 左右布局 */}
            <div className="flex gap-6">
              {/* 左侧：标题和学科 */}
              <div className="flex-1 space-y-5">
                {/* 标题 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary-600 rounded-full"></div>
                    课程名称
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={localConfig.title}
                    onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                    placeholder="例如：水循环与水资源"
                  />
                </div>

                {/* 涉及学科 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary-600 rounded-full"></div>
                    <Network size={16} className="text-primary-600" />
                    涉及学科
                    <span className="text-xs font-normal text-gray-500 ml-1">可多选</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {allSubjects.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => toggleSubject(subject)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          localConfig.subjects.includes(subject)
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右侧：封面 */}
              <div className="w-64 shrink-0">
                <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary-600 rounded-full"></div>
                  {isGeneratingAI ? (
                    <Loader2 size={16} className="text-primary-600 animate-spin" />
                  ) : (
                    <Sparkles size={16} className="text-primary-600" />
                  )}
                  课程封面
                  <span className="text-xs font-normal text-gray-500 ml-1">AI 推荐</span>
                </label>
                <div className="space-y-3">
                  <div className="w-full h-40 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
                    {localConfig.cover ? (
                      <img src={localConfig.cover} alt="封面" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        {isGeneratingAI ? 'AI 推荐中...' : '暂无封面'}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={regenerateCover}
                    disabled={isGeneratingAI}
                    className="w-full px-4 py-2.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-200"
                  >
                    {isGeneratingAI ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    重新生成
                  </button>
                </div>
              </div>
            </div>

            {/* 跨学科标签 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary-600 rounded-full"></div>
                {isGeneratingAI ? (
                  <Loader2 size={16} className="text-primary-600 animate-spin" />
                ) : (
                  <Sparkles size={16} className="text-primary-600" />
                )}
                跨学科标签
                <span className="text-xs font-normal text-gray-500 ml-1">AI 推荐，可自定义</span>
              </label>

              {/* 已选标签展示 */}
              {localConfig.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {localConfig.tags.map((tag: string) => (
                    <div
                      key={tag}
                      className="px-3.5 py-2 rounded-xl text-sm font-medium bg-primary-600 text-white shadow-md shadow-primary-200 flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => toggleTag(tag)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 推荐标签 */}
              <div className="flex flex-wrap gap-2.5 mb-3">
                {isGeneratingAI && localConfig.tags.length === 0 ? (
                  <div className="text-sm text-gray-500 flex items-center gap-2 py-2">
                    <Loader2 size={16} className="animate-spin" />
                    AI 推荐中...
                  </div>
                ) : (
                  CROSS_DISCIPLINARY_TAGS.filter((tag: string) => !localConfig.tags.includes(tag)).map((tag: string) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    >
                      {tag}
                    </button>
                  ))
                )}
              </div>

              {/* 自定义标签输入 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customTagInput.trim()) {
                      e.preventDefault();
                      const newTag = customTagInput.trim();
                      if (!localConfig.tags.includes(newTag)) {
                        setLocalConfig({ ...localConfig, tags: [...localConfig.tags, newTag] });
                      }
                      setCustomTagInput('');
                    }
                  }}
                  placeholder="输入自定义标签，按回车添加"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                />
                <button
                  onClick={() => {
                    if (customTagInput.trim()) {
                      const newTag = customTagInput.trim();
                      if (!localConfig.tags.includes(newTag)) {
                        setLocalConfig({ ...localConfig, tags: [...localConfig.tags, newTag] });
                      }
                      setCustomTagInput('');
                    }
                  }}
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  添加
                </button>
              </div>
            </div>

            {/* 发布配置 */}
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={() => setShowMoreConfig(!showMoreConfig)}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 hover:text-gray-900 mb-5 group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary-600 rounded-full"></div>
                  发布配置
                </div>
                <div className={`p-1.5 rounded-lg group-hover:bg-gray-100 transition-all ${showMoreConfig ? 'rotate-180' : ''}`}>
                  <ChevronDown size={18} />
                </div>
              </button>

              {showMoreConfig && (
                <div className="space-y-5">
                  {/* 年级 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2.5">
                      年级
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={localConfig.grade}
                      onChange={(e) => {
                        setLocalConfig({ ...localConfig, grade: e.target.value });
                        setPublishError('');
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                    >
                      <option value="">请选择年级</option>
                      {grades.map((grade: string) => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>

                  {/* 绑定班级 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2.5 flex items-center gap-2">
                      <Users size={16} className="text-emerald-600" />
                      绑定班级
                      <span className="text-xs font-normal text-gray-500">可多选</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {classes.map((className: string) => (
                        <button
                          key={className}
                          onClick={() => {
                            toggleClass(className);
                            setPublishError('');
                          }}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            localConfig.bindClasses.includes(className)
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          {className}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="px-7 py-5 border-t border-gray-200 bg-gray-50">
          {publishError && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{publishError}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-medium transition-all"
              >
                取消
              </button>
              {/* 查看分享链接按钮 */}
              {config.publishedLink && (
                <button
                  onClick={() => setShowShareLink(true)}
                  className="px-5 py-2.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl font-medium transition-all flex items-center gap-2 border border-primary-200"
                >
                  <ExternalLink size={16} />
                  查看分享链接
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log('保存草稿按钮被点击');
                  onSave(localConfig);
                  onClose();
                }}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-medium transition-all shadow-sm"
              >
                保存草稿
              </button>
              <button
                onClick={(e) => {
                  console.log('发布按钮点击事件触发', e);
                  handlePublish();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:from-primary-700 hover:to-accent-700 font-medium transition-all flex items-center gap-2 shadow-lg shadow-primary-200"
              >
                <Send size={16} />
                发布到班级
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 查看分享链接弹窗 */}
      {showShareLink && config.publishedLink && (
        <PublishSuccessModal
          courseTitle={localConfig.title}
          courseLink={config.publishedLink}
          accessCode={config.publishedCode || ''}
          onClose={() => setShowShareLink(false)}
        />
      )}

      {/* 发布成功弹窗 */}
      {showPublishSuccess && (
        <PublishSuccessModal
          courseTitle={localConfig.title}
          courseLink={publishData.link}
          accessCode={publishData.code}
          onClose={() => {
            console.log('关闭发布成功弹窗');
            setShowPublishSuccess(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}

// 自由对话模式配置弹窗
export function FreeModeModal({ config, inheritedAgents, onSave, onClose }: any) {
  const [localConfig, setLocalConfig] = useState({ ...config });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-[600px] rounded-2xl shadow-2xl overflow-hidden animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageCircle size={20} />
            自由对话模式配置
          </h2>
          <p className="text-primary-100 text-sm mt-1">选择 AI 助手并追加教学指令</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择 AI 助手 <span className="text-gray-400 font-normal">(继承自通用版)</span>
            </label>
            <div className="space-y-2">
              {inheritedAgents.map((agent: any) => (
                <label
                  key={agent.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    localConfig.selectedAgentId === agent.id
                      ? 'bg-primary-50 border-primary-300'
                      : 'bg-white border-gray-200 hover:border-primary-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="agent"
                    checked={localConfig.selectedAgentId === agent.id}
                    onChange={() => setLocalConfig({ ...localConfig, selectedAgentId: agent.id })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Bot size={14} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              教师追加指令 <span className="text-gray-400 font-normal">(user_prompt)</span>
            </label>
            <textarea
              value={localConfig.teacherPrompt}
              onChange={(e) => setLocalConfig({ ...localConfig, teacherPrompt: e.target.value })}
              placeholder="例如：请用幽默的口吻回答，所有比喻都和「水」有关..."
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 outline-none min-h-[80px] resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <span className="text-sm font-medium text-gray-700">启用知识围栏</span>
              <p className="text-xs text-gray-500">只允许回答与课程资料相关的问题</p>
            </div>
            <button
              onClick={() => setLocalConfig({ ...localConfig, enableFence: !localConfig.enableFence })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                localConfig.enableFence ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform absolute top-0.5 ${
                  localConfig.enableFence ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              ></div>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            取消
          </button>
          <button
            onClick={() => onSave(localConfig)}
            className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// 引导学习模式配置弹窗
export function GuidedModeModal({ config, inheritedWorkflows, onSave, onClose }: any) {
  const [localConfig, setLocalConfig] = useState({ ...config });
  const selectedWorkflow = inheritedWorkflows.find((w: any) => w.id === localConfig.selectedWorkflowId);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const updateStagePrompt = (stageId: string, prompt: string) => {
    setLocalConfig({
      ...localConfig,
      stagePrompts: {
        ...localConfig.stagePrompts,
        [stageId]: prompt,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-[750px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <GitBranch size={20} />
            引导学习模式配置
          </h2>
          <p className="text-emerald-100 text-sm mt-1">选择教学法流程，可微调各阶段的AI提示词</p>
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择教学法 <span className="text-gray-400 font-normal">(继承自通用版)</span>
            </label>
            <div className="space-y-2">
              {inheritedWorkflows.map((workflow: any) => (
                <label
                  key={workflow.id}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                    localConfig.selectedWorkflowId === workflow.id
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-white border-gray-200 hover:border-emerald-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="workflow"
                    checked={localConfig.selectedWorkflowId === workflow.id}
                    onChange={() => setLocalConfig({ ...localConfig, selectedWorkflowId: workflow.id, stagePrompts: {} })}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Route size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-700">{workflow.name}</p>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        {workflow.stages?.length || 0} 阶段
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{workflow.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedWorkflow && selectedWorkflow.stages && (
            <div className="border-t border-gray-200 pt-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Sliders size={14} />
                  各阶段提示词微调
                </h3>
                <p className="text-xs text-gray-500 mt-1">可根据课程内容自定义每个阶段的AI指导方式</p>
              </div>

              <div className="space-y-3">
                {selectedWorkflow.stages.map((stage: any, idx: number) => {
                  const customPrompt = localConfig.stagePrompts?.[stage.id] || '';
                  const isExpanded = expandedStage === stage.id;

                  return (
                    <div
                      key={stage.id}
                      className={`rounded-xl border transition-all ${
                        customPrompt ? 'bg-amber-50/50 border-amber-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div
                        className="flex items-center gap-3 p-4 cursor-pointer"
                        onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            customPrompt ? 'bg-amber-500 text-white' : 'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                            {customPrompt && (
                              <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded flex items-center gap-1">
                                <Pencil size={10} />
                                已自定义
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{stage.defaultPrompt}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3">
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Info size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-500">默认提示词</span>
                            </div>
                            <p className="text-sm text-gray-600">{stage.defaultPrompt}</p>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              自定义提示词 <span className="text-gray-400 font-normal">(可选，会追加到默认提示词之后)</span>
                            </label>
                            <textarea
                              value={customPrompt}
                              onChange={(e) => updateStagePrompt(stage.id, e.target.value)}
                              placeholder={`例如：针对"水资源"主题，${stage.name.split(' ')[0]}阶段可以...`}
                              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                              rows={3}
                            />
                          </div>

                          {customPrompt && (
                            <button
                              onClick={() => updateStagePrompt(stage.id, '')}
                              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                            >
                              <Trash2 size={10} />
                              清除自定义
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            取消
          </button>
          <button
            onClick={() => onSave(localConfig)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// 笔记模板配置弹窗
export function NotesModal({ config, inheritedTemplates, onSave, onClose }: any) {
  const [selectedTemplate, setSelectedTemplate] = useState(config.noteTemplate);
  const [enableSubmit, setEnableSubmit] = useState(config.enableSubmit);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-[700px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileEdit size={20} />
            笔记模板配置
          </h2>
          <p className="text-primary-100 text-sm mt-1">选择笔记模板，学生将使用该模板记录学习内容</p>
        </div>

        <div className="flex h-[55vh]">
          <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto p-3 space-y-2">
            {inheritedTemplates.map((tpl: any) => (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedTemplate === tpl.id
                    ? 'bg-white border-2 border-primary-400 shadow-sm'
                    : 'bg-white border border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedTemplate === tpl.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                  >
                    <FileText size={18} className={selectedTemplate === tpl.id ? 'text-primary-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{tpl.name}</p>
                  </div>
                </div>
                {tpl.structure.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tpl.structure.map((s: string, i: number) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Eye size={14} />
                模板预览
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="h-32 bg-white border border-gray-200 rounded-lg p-3 flex flex-col">
                  <div className="flex-1 border border-dashed border-gray-300 rounded bg-gray-50 p-2">
                    <p className="text-xs text-gray-400">学生在这里记录笔记...</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Send size={14} className="text-green-600" />
                  启用提交功能
                </span>
                <p className="text-xs text-gray-500 mt-1">学生可一键提交笔记给老师批阅</p>
              </div>
              <button
                onClick={() => setEnableSubmit(!enableSubmit)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  enableSubmit ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform absolute top-0.5 ${
                    enableSubmit ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            取消
          </button>
          <button
            onClick={() => onSave({ noteTemplate: selectedTemplate, enableSubmit })}
            className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// 元认知监控配置弹窗
export function MetaModal({ config, inheritedStrategies, onSave, onClose }: any) {
  const [selectedStrategy, setSelectedStrategy] = useState(config.metacognitionStrategy);
  const [prompt, setPrompt] = useState(config.metacognitionPrompt);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-[500px] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-accent-500 to-primary-500 text-white p-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Activity size={20} />
            学情监控配置
          </h2>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">选择监控策略</label>
            <div className="space-y-2">
              {inheritedStrategies.map((strategy: any) => (
                <label
                  key={strategy.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    selectedStrategy === strategy.id
                      ? 'bg-accent-50 border-accent-300'
                      : 'bg-white border-gray-200 hover:border-accent-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="strategy"
                    checked={selectedStrategy === strategy.id}
                    onChange={() => setSelectedStrategy(strategy.id)}
                    className="w-4 h-4 text-accent-600"
                  />
                  <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                    <Brain size={14} className="text-accent-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{strategy.name}</p>
                    <p className="text-xs text-gray-500">{strategy.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              教师追加指令 <span className="text-gray-400 font-normal">(user_prompt)</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：当学生在视频资源上停留超过5分钟未操作时，提醒他们..."
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-accent-500 outline-none min-h-[80px] resize-none"
            />
          </div>

          {/* 能力评估预览 */}
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 border border-primary-200">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-primary-600" />
              <h3 className="text-sm font-bold text-gray-800">能力评估预览</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              AI将在学习过程中监控以下能力的发展情况，并在元认知监控中提供针对性反馈
            </p>

            {/* 能力标签展示 */}
            <div className="flex flex-wrap gap-2">
              {config.tasks && config.tasks.length > 0 ? (
                (() => {
                  // 收集所有已配置的能力维度
                  const allCompetencies = new Set<CrossCompetencyType>();
                  config.tasks.forEach((task: any) => {
                    if (task.assignedCompetencies) {
                      task.assignedCompetencies.forEach((comp: CrossCompetencyType) => allCompetencies.add(comp));
                    }
                    if (task.crossCompetencies) {
                      task.crossCompetencies.forEach((comp: CrossCompetencyType) => allCompetencies.add(comp));
                    }
                  });

                  return allCompetencies.size > 0 ? (
                    Array.from(allCompetencies).map((competency) => {
                      const def = CROSS_COMPETENCY_DEFINITIONS[competency];
                      const Icon = def.icon;
                      return (
                        <div
                          key={competency}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-primary-700 border border-primary-300 shadow-sm"
                          title={def.description}
                        >
                          <Icon size={12} />
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

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            取消
          </button>
          <button
            onClick={() => onSave({ metacognitionStrategy: selectedStrategy, metacognitionPrompt: prompt })}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// 资源预览弹窗
export function ResourcePreviewModal({ resource, onClose }: any) {
  if (!resource) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-[700px] max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-r from-${resource.color}-500 to-${resource.color}-600 text-white p-5 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              {resource.type === 'video' && <Video size={20} />}
              {resource.type === 'pdf' && <FileText size={20} />}
              {resource.type === 'ppt' && <FileSpreadsheet size={20} />}
              {resource.type === 'web' && <Globe size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold">{resource.title}</h2>
              <p className="text-sm opacity-80">
                {resource.duration || (resource.pages ? `${resource.pages}页` : resource.url ? '网页链接' : '文件')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 bg-gray-50">
          {resource.type === 'video' && (
            <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play size={40} className="text-white ml-1" />
                </div>
                <p className="text-lg font-medium">{resource.title}</p>
                <p className="text-sm text-gray-400 mt-2">时长: {resource.duration}</p>
              </div>
            </div>
          )}

          {(resource.type === 'pdf' || resource.type === 'ppt') && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12">
              <div className="text-center">
                <div className={`w-20 h-20 rounded-2xl bg-${resource.color}-100 flex items-center justify-center mx-auto mb-4`}>
                  {resource.type === 'pdf' && <FileText size={40} className={`text-${resource.color}-600`} />}
                  {resource.type === 'ppt' && <FileSpreadsheet size={40} className={`text-${resource.color}-600`} />}
                </div>
                <p className="text-xl font-bold text-gray-700">{resource.title}</p>
                {resource.description && <p className="text-sm text-gray-500 mt-2">{resource.description}</p>}
                <div className="mt-6 inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                  <FileText size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-700">共 {resource.pages} 页</span>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Eye size={14} />
                    查看文档
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors flex items-center gap-2">
                    <Download size={14} />
                    下载
                  </button>
                </div>
              </div>
            </div>
          )}

          {resource.type === 'web' && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Globe size={40} className="text-green-600" />
                </div>
                <p className="text-xl font-bold text-gray-700">{resource.title}</p>
                {resource.description && <p className="text-sm text-gray-500 mt-2">{resource.description}</p>}
                <div className="mt-6 inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <ExternalLink size={16} className="text-green-600" />
                  <span className="text-sm text-green-700 font-mono">{resource.url}</span>
                </div>
                <div className="mt-6">
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto">
                    <ExternalLink size={14} />
                    在新窗口打开
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 任务编辑弹窗
export function TaskEditModal({ task, onSave, onClose }: any) {
  const [localTask, setLocalTask] = useState({ ...task });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [aiGenConfig, setAiGenConfig] = useState({
    questionTypes: ['choice'] as string[],
    questionCount: 5,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    customPrompt: '',
  });

  if (!task) return null;

  const updateField = (field: string, value: any) => {
    setLocalTask({ ...localTask, [field]: value });
  };

  const generateQuestions = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const generatedQuestions = [];
    const typeMap: Record<string, string> = {
      choice: '单选题',
      multipleChoice: '多选题',
      fillBlank: '填空题',
      trueFalse: '判断题',
      shortAnswer: '简答题',
    };

    for (let i = 0; i < aiGenConfig.questionCount; i++) {
      const randomType = aiGenConfig.questionTypes[Math.floor(Math.random() * aiGenConfig.questionTypes.length)];
      const difficultyLabel = aiGenConfig.difficulty === 'easy' ? '基础' : aiGenConfig.difficulty === 'medium' ? '中等' : '困难';

      generatedQuestions.push({
        id: `q_${Date.now()}_${i}`,
        type: randomType,
        content: `AI生成的${typeMap[randomType]} ${i + 1} (难度: ${difficultyLabel})`,
        options: randomType.includes('choice') || randomType.includes('Choice')
          ? ['选项A', '选项B', '选项C', randomType === 'multipleChoice' ? '选项D' : null].filter(Boolean)
          : undefined,
        answer: randomType === 'choice' ? 0 : randomType === 'multipleChoice' ? [0, 1] : randomType === 'trueFalse' ? true : '',
        aiGenerated: true,
        difficulty: aiGenConfig.difficulty,
        generatedAt: new Date().toISOString(),
      });
    }

    updateField('questions', generatedQuestions);
    setIsGenerating(false);
  };

  // 添加新题目
  const addQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      type: 'choice' as 'choice' | 'fillblank' | 'truefalse' | 'shortanswer',
      content: '',
      options: ['选项A', '选项B', '选项C', '选项D'],
      answer: 0,
    };
    setEditingQuestion(newQuestion);
    setShowQuestionEditor(true);
  };

  // 编辑现有题目
  const editQuestion = (question: any) => {
    setEditingQuestion({ ...question });
    setShowQuestionEditor(true);
  };

  // 保存题目
  const saveQuestion = () => {
    if (!editingQuestion.content?.trim()) {
      alert('请输入题目内容');
      return;
    }

    const existingQuestions = localTask.questions || [];
    const questionIndex = existingQuestions.findIndex((q: any) => q.id === editingQuestion.id);

    let updatedQuestions;
    if (questionIndex >= 0) {
      // 更新现有题目
      updatedQuestions = [...existingQuestions];
      updatedQuestions[questionIndex] = editingQuestion;
    } else {
      // 添加新题目
      updatedQuestions = [...existingQuestions, editingQuestion];
    }

    updateField('questions', updatedQuestions);
    setShowQuestionEditor(false);
    setEditingQuestion(null);
  };

  // 删除题目
  const deleteQuestion = (questionId: string) => {
    if (confirm('确定要删除这道题目吗？')) {
      const updatedQuestions = (localTask.questions || []).filter((q: any) => q.id !== questionId);
      updateField('questions', updatedQuestions);
    }
  };

  const GRADING_AGENTS = [
    {
      id: 'agent_default',
      name: '通用作业批改助手',
      description: '适用于各学科的通用批改，提供客观评价和建议',
      type: 'system',
      difyConfig: { agentId: 'dify_grading_001', apiKey: 'sk-xxx' },
    },
    {
      id: 'agent_creative_writing',
      name: '创意写作批改专家',
      description: '专注于创意写作、作文批改，评价文笔、修辞和创意',
      type: 'system',
      difyConfig: { agentId: 'dify_grading_002', apiKey: 'sk-xxx' },
    },
    {
      id: 'agent_science_lab',
      name: '科学实验报告批改',
      description: '针对科学实验报告，评估实验设计、数据分析和结论',
      type: 'system',
      difyConfig: { agentId: 'dify_grading_003', apiKey: 'sk-xxx' },
    },
    {
      id: 'agent_math_problem',
      name: '数学解题过程批改',
      description: '评价数学解题步骤、逻辑严密性和答案准确性',
      type: 'system',
      difyConfig: { agentId: 'dify_grading_004', apiKey: 'sk-xxx' },
    },
    {
      id: 'agent_analytical',
      name: '批判性思维评估',
      description: '评估论证质量、逻辑推理和批判性分析能力',
      type: 'system',
      difyConfig: { agentId: 'dify_grading_005', apiKey: 'sk-xxx' },
    },
    {
      id: 'agent_quick_feedback',
      name: '快速反馈助手',
      description: '提供简洁快速的批改反馈，适合日常练习',
      type: 'system',
      difyConfig: { agentId: 'dify_grading_006', apiKey: 'sk-xxx' },
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-[650px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`bg-gradient-to-r ${
            localTask.type === 'quiz' ? 'from-green-500 to-emerald-500' : 'from-primary-500 to-accent-500'
          } text-white p-5`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                {localTask.type === 'quiz' ? <Zap size={20} /> : <FileEdit size={20} />}
              </div>
              <div>
                <h2 className="text-lg font-bold">{localTask.type === 'quiz' ? '编辑测验' : '编辑作业'}</h2>
                <p className="text-sm opacity-80">{localTask.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
              <input
                type="text"
                value={localTask.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localTask.status === 'required'}
                  onChange={(e) => updateField('status', e.target.checked ? 'required' : 'optional')}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm text-gray-600">必修任务</span>
              </label>
              {localTask.type === 'quiz' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">及格分:</span>
                  <input
                    type="number"
                    value={localTask.passScore}
                    onChange={(e) => updateField('passScore', parseInt(e.target.value))}
                    className="w-16 bg-gray-50 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                  />
                </div>
              )}
            </div>

            {localTask.type === 'quiz' && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-700">测验题目</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAIConfig(!showAIConfig)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-all flex items-center gap-1"
                    >
                      <Settings size={12} />
                      {showAIConfig ? '隐藏配置' : '生成配置'}
                    </button>
                    <button
                      onClick={generateQuestions}
                      disabled={isGenerating}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-xs font-medium hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          AI生成题目
                        </>
                      )}
                    </button>
                    <button
                      onClick={addQuestion}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-1"
                    >
                      <Plus size={12} />
                      手动添加
                    </button>
                  </div>
                </div>

                {/* AI生成配置面板 */}
                {showAIConfig && (
                  <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 space-y-4">
                    {/* 题型选择 */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">题型选择（可多选）</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'choice', label: '单选题' },
                          { value: 'multipleChoice', label: '多选题' },
                          { value: 'fillBlank', label: '填空题' },
                          { value: 'trueFalse', label: '判断题' },
                          { value: 'shortAnswer', label: '简答题' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => {
                              const types = aiGenConfig.questionTypes.includes(type.value)
                                ? aiGenConfig.questionTypes.filter((t) => t !== type.value)
                                : [...aiGenConfig.questionTypes, type.value];
                              if (types.length > 0) {
                                setAiGenConfig({ ...aiGenConfig, questionTypes: types });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              aiGenConfig.questionTypes.includes(type.value)
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 题目数量 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">题目数量</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={aiGenConfig.questionCount}
                          onChange={(e) =>
                            setAiGenConfig({ ...aiGenConfig, questionCount: parseInt(e.target.value) || 1 })
                          }
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-500 outline-none"
                        />
                      </div>

                      {/* 难度级别 */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">难度级别</label>
                        <select
                          value={aiGenConfig.difficulty}
                          onChange={(e) =>
                            setAiGenConfig({ ...aiGenConfig, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })
                          }
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-500 outline-none"
                        >
                          <option value="easy">基础</option>
                          <option value="medium">中等</option>
                          <option value="hard">困难</option>
                        </select>
                      </div>
                    </div>

                    {/* 自定义提示词 */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        自定义生成提示词（可选）
                      </label>
                      <textarea
                        value={aiGenConfig.customPrompt}
                        onChange={(e) => setAiGenConfig({ ...aiGenConfig, customPrompt: e.target.value })}
                        placeholder="例如：请围绕水循环主题，生成适合四年级学生的题目..."
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-500 outline-none resize-none"
                        rows={2}
                      />
                    </div>

                    {/* 配置摘要 */}
                    <div className="bg-white/80 rounded-lg p-3 border border-purple-100">
                      <p className="text-xs text-gray-600">
                        将生成 <span className="font-bold text-accent-600">{aiGenConfig.questionCount}</span> 道题目，
                        题型：
                        <span className="font-bold text-accent-600">
                          {aiGenConfig.questionTypes
                            .map((t) => ({ choice: '单选', multipleChoice: '多选', fillBlank: '填空', trueFalse: '判断', shortAnswer: '简答' }[t]))
                            .join('、')}
                        </span>
                        ，难度：
                        <span className="font-bold text-accent-600">
                          {aiGenConfig.difficulty === 'easy' ? '基础' : aiGenConfig.difficulty === 'medium' ? '中等' : '困难'}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* 题目列表 */}
                {(localTask.questions && localTask.questions.length > 0) ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {localTask.questions.map((question: any, index: number) => {
                      const typeLabels: Record<string, string> = {
                        choice: '单选题',
                        multipleChoice: '多选题',
                        fillBlank: '填空题',
                        trueFalse: '判断题',
                        shortAnswer: '简答题',
                      };

                      return (
                        <div
                          key={question.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-500">题目 {index + 1}</span>
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                  {typeLabels[question.type] || question.type}
                                </span>
                                {question.aiGenerated && (
                                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                    AI生成
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-800 line-clamp-2">{question.content}</p>
                              {question.type === 'choice' && question.options && (
                                <div className="mt-2 space-y-1">
                                  {question.options.map((option: string, optIndex: number) => (
                                    <div key={optIndex} className="text-xs text-gray-600 flex items-center gap-2">
                                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                        question.answer === optIndex
                                          ? 'border-green-500 bg-green-50 text-green-700'
                                          : 'border-gray-300'
                                      }`}>
                                        {question.answer === optIndex ? '✓' : String.fromCharCode(65 + optIndex)}
                                      </span>
                                      <span className={question.answer === optIndex ? 'font-medium text-green-700' : ''}>
                                        {option || '(空选项)'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => editQuestion(question)}
                                className="p-1.5 hover:bg-blue-50 rounded transition-colors text-blue-600"
                                title="编辑"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => deleteQuestion(question.id)}
                                className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-600"
                                title="删除"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <ListChecks size={24} className="mx-auto mb-2" />
                    <p className="text-xs">配置参数后点击"AI生成题目"，或手动添加题目</p>
                  </div>
                )}

                {/* 高级选项 - 能力维度配置 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-600" />
                      <span className="text-sm font-bold text-amber-800">高级选项：能力维度配置</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-700">可选配置</span>
                      {showAdvancedOptions ? <ChevronUp size={16} className="text-amber-600" /> : <ChevronDown size={16} className="text-amber-600" />}
                    </div>
                  </button>

                  {showAdvancedOptions && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl border border-amber-200 space-y-4">
                      {/* 学科能力维度 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                          <Target size={14} className="text-blue-500" />
                          学科能力维度
                          <span className="text-xs text-gray-500 font-normal ml-1">(根据课程设置的学科显示)</span>
                        </label>
                        <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-700">
                            当前课程学科：<span className="font-bold">科学、地理</span>
                          </p>
                        </div>
                        <div className="space-y-3">
                          {['科学', '地理'].map((subject) => {
                            const subjectCompetencies = SUBJECT_COMPETENCIES[subject];
                            if (!subjectCompetencies || subjectCompetencies.length === 0) return null;

                            return (
                              <div key={subject}>
                                <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  {subject}学科核心素养
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {subjectCompetencies.map((competency) => {
                                    const isSelected = localTask.subjectCompetencies?.includes(competency.id) || false;

                                    return (
                                      <button
                                        key={competency.id}
                                        type="button"
                                        onClick={() => {
                                          const current = localTask.subjectCompetencies || [];
                                          const updated = isSelected
                                            ? current.filter((c: string) => c !== competency.id)
                                            : [...current, competency.id];
                                          updateField('subjectCompetencies', updated.length > 0 ? updated : undefined);
                                        }}
                                        className={`
                                          px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                          ${
                                            isSelected
                                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-400 shadow-sm'
                                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                          }
                                        `}
                                        title={competency.description}
                                      >
                                        {competency.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          选择本测验重点评估的学科核心素养，这些能力与学科教学目标直接相关
                        </p>
                      </div>

                      {/* 跨学科能力维度 */}
                      <div className="pt-4 border-t border-amber-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                          <Network size={14} className="text-indigo-500" />
                          跨学科能力维度
                          <span className="text-xs text-gray-500 font-normal ml-1">(通用能力，可跨课程追踪)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(CROSS_COMPETENCY_DEFINITIONS) as CrossCompetencyType[]).map((competency) => {
                            const def = CROSS_COMPETENCY_DEFINITIONS[competency];
                            const Icon = def.icon;
                            const isSelected = localTask.crossCompetencies?.includes(competency) || false;

                            return (
                              <button
                                key={`cross-${competency}`}
                                type="button"
                                onClick={() => {
                                  const current = localTask.crossCompetencies || [];
                                  const updated = isSelected
                                    ? current.filter((c: CrossCompetencyType) => c !== competency)
                                    : [...current, competency];
                                  updateField('crossCompetencies', updated.length > 0 ? updated : undefined);
                                }}
                                className={`
                                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
                                  ${
                                    isSelected
                                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-400 shadow-sm'
                                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                  }
                                `}
                                title={def.description}
                              >
                                <Icon size={14} />
                                {def.name}
                              </button>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          选择跨学科通用能力维度，这些能力将跨课程追踪学生的发展
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {localTask.type === 'assignment' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">作业要求/提示</label>
                  <textarea
                    value={localTask.teacherHint || ''}
                    onChange={(e) => updateField('teacherHint', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none"
                    placeholder="请输入作业要求，例如：请结合生活实际，提出至少3条节水建议..."
                  />
                </div>

                {/* 高级选项 - 能力维度配置和AI批改 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-600" />
                      <span className="text-sm font-bold text-amber-800">高级选项：学习能力与AI批改</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-700">可选配置</span>
                      {showAdvancedOptions ? <ChevronUp size={16} className="text-amber-600" /> : <ChevronDown size={16} className="text-amber-600" />}
                    </div>
                  </button>

                  {showAdvancedOptions && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl border border-amber-200 space-y-4">
                      {/* 学科能力维度 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                          <Target size={14} className="text-blue-500" />
                          学科能力维度
                          <span className="text-xs text-gray-500 font-normal ml-1">(根据课程设置的学科显示)</span>
                        </label>
                        <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-700">
                            当前课程学科：<span className="font-bold">科学、地理</span>
                          </p>
                        </div>
                        <div className="space-y-3">
                          {['科学', '地理'].map((subject) => {
                            const subjectCompetencies = SUBJECT_COMPETENCIES[subject];
                            if (!subjectCompetencies || subjectCompetencies.length === 0) return null;

                            return (
                              <div key={subject}>
                                <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  {subject}学科核心素养
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {subjectCompetencies.map((competency) => {
                                    const isSelected = localTask.subjectCompetencies?.includes(competency.id) || false;

                                    return (
                                      <button
                                        key={competency.id}
                                        type="button"
                                        onClick={() => {
                                          const current = localTask.subjectCompetencies || [];
                                          const updated = isSelected
                                            ? current.filter((c: string) => c !== competency.id)
                                            : [...current, competency.id];
                                          updateField('subjectCompetencies', updated.length > 0 ? updated : undefined);
                                        }}
                                        className={`
                                          px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                          ${
                                            isSelected
                                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-400 shadow-sm'
                                              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                          }
                                        `}
                                        title={competency.description}
                                      >
                                        {competency.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          选择本次作业重点培养的学科核心素养，这些能力与学科教学目标直接相关
                        </p>
                      </div>

                      {/* 跨学科能力维度 */}
                      <div className="pt-4 border-t border-amber-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                          <Network size={14} className="text-indigo-500" />
                          跨学科能力维度
                          <span className="text-xs text-gray-500 font-normal ml-1">(通用能力，可跨课程追踪)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(CROSS_COMPETENCY_DEFINITIONS) as CrossCompetencyType[]).map((competency) => {
                            const def = CROSS_COMPETENCY_DEFINITIONS[competency];
                            const Icon = def.icon;
                            const isSelected = localTask.crossCompetencies?.includes(competency) || false;

                            return (
                              <button
                                key={`cross-${competency}`}
                                type="button"
                                onClick={() => {
                                  const current = localTask.crossCompetencies || [];
                                  const updated = isSelected
                                    ? current.filter((c: CrossCompetencyType) => c !== competency)
                                    : [...current, competency];
                                  updateField('crossCompetencies', updated.length > 0 ? updated : undefined);
                                }}
                                className={`
                                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
                                  ${
                                    isSelected
                                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-400 shadow-sm'
                                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                  }
                                `}
                                title={def.description}
                              >
                                <Icon size={14} />
                                {def.name}
                              </button>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          选择跨学科通用能力维度，这些能力将跨课程追踪学生的发展
                        </p>
                      </div>

                      {/* AI智能批改 */}
                      <div className="pt-4 border-t border-amber-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-purple-700 flex items-center gap-2">
                            <Bot size={14} />
                            AI智能批改
                          </h4>
                          <button
                            onClick={() =>
                              updateField('aiGrading', {
                                ...localTask.aiGrading,
                                enabled: !localTask.aiGrading?.enabled,
                              })
                            }
                            className={`w-12 h-6 rounded-full transition-colors relative ${
                              localTask.aiGrading?.enabled ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform absolute top-0.5 ${
                                localTask.aiGrading?.enabled ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                            ></div>
                          </button>
                        </div>
                        {localTask.aiGrading?.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-accent-600 mb-2">选择批改Agent</label>
                              <div className="space-y-2 max-h-80 overflow-y-auto">
                                {GRADING_AGENTS.map((agent) => {
                                  const isSelected = (localTask.aiGrading?.agentId || 'agent_default') === agent.id;
                                  return (
                                    <button
                                      key={agent.id}
                                      onClick={() =>
                                        updateField('aiGrading', { ...localTask.aiGrading, agentId: agent.id })
                                      }
                                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                        isSelected
                                          ? 'border-purple-500 bg-purple-50'
                                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-bold text-sm text-gray-800">{agent.name}</h5>
                                          {agent.type === 'system' && (
                                            <span className="px-1.5 py-0.5 bg-blue-100 text-primary-700 rounded text-[10px] font-medium">
                                              系统
                                            </span>
                                          )}
                                        </div>
                                        {isSelected && (
                                          <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg
                                              className="w-3 h-3 text-white"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                              />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-600 leading-relaxed">{agent.description}</p>
                                      {agent.difyConfig && (
                                        <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-500">
                                          <span className="px-2 py-0.5 bg-gray-100 rounded font-mono">
                                            Dify: {agent.difyConfig.agentId}
                                          </span>
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-accent-600 mb-2">
                                批改标准（可选）
                              </label>
                              <textarea
                                value={localTask.aiGrading?.customCriteria || ''}
                                onChange={(e) =>
                                  updateField('aiGrading', {
                                    ...localTask.aiGrading,
                                    customCriteria: e.target.value,
                                  })
                                }
                                placeholder="例如：重点关注学生的思维过程和实际应用能力..."
                                className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-accent-500 outline-none resize-none"
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
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            取消
          </button>
          <button
            onClick={() => onSave(localTask)}
            className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-sm"
          >
            保存
          </button>
        </div>
      </div>

      {/* 题目编辑器模态框 */}
      {showQuestionEditor && editingQuestion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setShowQuestionEditor(false)}>
          <div
            className="bg-white w-[600px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileEdit size={20} />
                {editingQuestion.id && localTask.questions?.some((q: any) => q.id === editingQuestion.id) ? '编辑题目' : '添加题目'}
              </h2>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {/* 题目类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">题目类型</label>
                <select
                  value={editingQuestion.type}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    type: e.target.value as any,
                    answer: e.target.value === 'choice' ? 0 : e.target.value === 'trueFalse' ? true : '',
                  })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="choice">单选题</option>
                  <option value="fillBlank">填空题</option>
                  <option value="trueFalse">判断题</option>
                </select>
              </div>

              {/* 题目内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">题目内容 *</label>
                <textarea
                  value={editingQuestion.content}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, content: e.target.value })}
                  placeholder="请输入题目内容..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                />
              </div>

              {/* 选项配置（仅单选题） */}
              {editingQuestion.type === 'choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选项配置</label>
                  <div className="space-y-2">
                    {editingQuestion.options?.map((option: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={editingQuestion.answer === index}
                          onChange={() => setEditingQuestion({ ...editingQuestion, answer: index })}
                          className="w-4 h-4 text-green-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(editingQuestion.options || [])];
                            newOptions[index] = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          }}
                          placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                          className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">点击单选按钮标记正确答案</p>
                </div>
              )}

              {/* 答案配置（填空题和判断题） */}
              {editingQuestion.type === 'fillBlank' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">参考答案</label>
                  <input
                    type="text"
                    value={editingQuestion.answer || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })}
                    placeholder="请输入参考答案..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              )}

              {editingQuestion.type === 'trueFalse' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">正确答案</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="trueFalseAnswer"
                        checked={editingQuestion.answer === true}
                        onChange={() => setEditingQuestion({ ...editingQuestion, answer: true })}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm text-gray-700">正确</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="trueFalseAnswer"
                        checked={editingQuestion.answer === false}
                        onChange={() => setEditingQuestion({ ...editingQuestion, answer: false })}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm text-gray-700">错误</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowQuestionEditor(false);
                  setEditingQuestion(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={saveQuestion}
                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-sm"
              >
                保存题目
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 学生预览头部
export function PreviewHeader({ config, onExit }: any) {
  return (
    <header className="h-14 bg-gray-800 text-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500 px-3 py-1 rounded font-bold text-sm">学生视角预览</div>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-300">{config.noteInfo.title}</span>
      </div>
      <button
        onClick={onExit}
        className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
      >
        <X size={14} />
        退出预览
      </button>
    </header>
  );
}

// 学生预览组件
export function StudentPreview({ config, leftWidth, rightWidth }: any) {
  const [rightTab, setRightTab] = useState('workspace');

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 左侧：资源列表 */}
      <div style={{ width: `${leftWidth}%` }} className="bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <FolderOpen size={14} className="text-primary-500" />
            学习资料库
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {config.resources.map((resource: any) => (
            <div
              key={resource.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl bg-${resource.color}-100 flex items-center justify-center`}>
                {resource.type === 'video' && <Video size={16} className={`text-${resource.color}-600`} />}
                {resource.type === 'pdf' && <FileText size={16} className={`text-${resource.color}-600`} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                <p className="text-xs text-gray-400">{resource.duration || `${resource.pages}页`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 中间：对话区 */}
      <div style={{ width: `${100 - leftWidth - rightWidth}%` }} className="flex flex-col bg-gray-50">
        <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <MessageSquare size={16} className="text-indigo-600" />
            AI 学习对话
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center">
            <span className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs">
              ✨ 已进入「自学模式」
            </span>
          </div>
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm max-w-[80%]">
              <p className="text-sm text-gray-700 leading-relaxed">
                欢迎进入自学模式！今天我们要学习《{config.noteInfo.title}》。有任何问题都可以问我哦！
              </p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-white border-t border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="输入你的问题或想法..."
              disabled
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm text-gray-400"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 右侧：学习工作室 */}
      <div style={{ width: `${rightWidth}%` }} className="bg-white border-l border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h2 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
            <Layout size={14} className="text-emerald-600" />
            学习工作室
          </h2>
        </div>
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setRightTab('workspace')}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              rightTab === 'workspace' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500'
            }`}
          >
            工作区
          </button>
          <button
            onClick={() => setRightTab('status')}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              rightTab === 'status' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500'
            }`}
          >
            学习状态
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {rightTab === 'workspace' ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-600 block mb-2">康奈尔笔记</span>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 min-h-[180px]">
                  <p className="text-xs text-gray-400">在这里记录笔记...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={12} className="text-primary-600" />
                    <span className="text-xs text-primary-700">专注时长</span>
                  </div>
                  <p className="text-lg font-bold text-primary-600">00:00</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target size={12} className="text-emerald-600" />
                    <span className="text-xs text-emerald-700">理解度</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">--%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Use视角头部 - 学生使用界面预览
export function UseViewHeader({ config, onBack, onPublish }: any) {
  return (
    <header className="h-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded">
          <span className="text-xs font-medium text-emerald-700">CocoStudy Teacher</span>
        </div>
        <div className="w-px h-5 bg-gray-200"></div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-sm font-semibold text-gray-900">{config.noteInfo.title}</h1>
          <span className="text-xs text-gray-400">{config.noteInfo.grade || '未设置年级'}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
        >
          <ArrowLeft size={14} />
          编辑视角
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-700"
        >
          <Eye size={14} />
          使用视角
        </button>
        <a
          href="/teacher/courses/1/results"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
        >
          <Activity size={14} />
          查看课程报告
        </a>
        <div className="w-px h-5 bg-gray-200"></div>
        <button
          onClick={onPublish}
          className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Send size={14} />
          发布到班级
        </button>
      </div>
    </header>
  );
}

// Results视角头部 - 学习数据统计
export function ResultsViewHeader({ config, onBack, onSwitchToUse, onPublish }: any) {
  return (
    <header className="h-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 rounded">
          <span className="text-xs font-medium text-purple-700">CocoStudy Teacher</span>
        </div>
        <div className="w-px h-5 bg-gray-200"></div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-sm font-semibold text-gray-900">{config.noteInfo.title}</h1>
          <span className="text-xs text-gray-400">{config.noteInfo.grade || '未设置年级'}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
        >
          <Pencil size={14} />
          编辑视角
        </button>
        <button
          onClick={onSwitchToUse}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
        >
          <Eye size={14} />
          使用视角
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-purple-100 text-purple-700"
        >
          <Activity size={14} />
          结果视角
        </button>
        <div className="w-px h-5 bg-gray-200"></div>
        <button
          onClick={onPublish}
          className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Send size={14} />
          发布到班级
        </button>
      </div>
    </header>
  );
}

// Results视角仪表板 - 学习数据展示
export function ResultsViewDashboard({ config }: any) {
  // 模拟学生列表数据（增强版 - 包含详细的能力评估、任务完成、跨课程画像）
  const mockStudentsRaw = [
    { id: 1, name: '张晓明', avatar: '👦', status: 'online' as const, progress: 85, lastActive: '2分钟前', competencies: { critical_thinking: 4, information_synthesis: 3, metacognition: 4 } },
    { id: 2, name: '李思琪', avatar: '👧', status: 'online' as const, progress: 92, lastActive: '刚刚', competencies: { critical_thinking: 3, information_synthesis: 4, metacognition: 3 } },
    { id: 3, name: '王浩宇', avatar: '👦', status: 'offline' as const, progress: 45, lastActive: '1小时前', competencies: { critical_thinking: 2, information_synthesis: 2, metacognition: 2 } },
    { id: 4, name: '刘雨欣', avatar: '👧', status: 'online' as const, progress: 78, lastActive: '5分钟前', competencies: { critical_thinking: 3, information_synthesis: 3, metacognition: 4 } },
    { id: 5, name: '陈思远', avatar: '👦', status: 'offline' as const, progress: 60, lastActive: '30分钟前', competencies: { critical_thinking: 2, information_synthesis: 3, metacognition: 2 } },
    { id: 6, name: '赵梓涵', avatar: '👧', status: 'online' as const, progress: 95, lastActive: '1分钟前', competencies: { critical_thinking: 4, information_synthesis: 4, metacognition: 4 } },
  ];

  // 增强的能力评估数据生成器
  const generateEnhancedAssessments = (studentId: number, competencies: Record<string, number>) => {
    const assessmentData: Record<string, any> = {
      critical_thinking: {
        4: {
          description: '能够深入分析问题的多个层面，识别隐含假设，并提出有说服力的论证。在讨论水资源问题时，不仅关注表面现象，还能分析背后的社会、经济因素。',
          highlights: ['能识别论证中的逻辑漏洞', '提出反例验证观点', '从多角度评估问题'],
          areasForImprovement: ['可以尝试更系统地运用批判性思维框架'],
          suggestions: ['阅读相关的论证分析案例', '练习识别常见的逻辑谬误', '尝试从相反立场思考问题'],
          evidence: [
            { id: 'e1', type: 'dialogue' as const, content: '学生在对话中质疑："如果所有人都节约用水，是否真的能解决水资源短缺问题？还需要考虑工业用水和农业用水的占比。"', timestamp: '2024-01-08 14:23', sourceRef: '对话 #12' },
            { id: 'e2', type: 'note' as const, content: '笔记中记录：对比了城市和农村的水资源利用效率，发现农业灌溉的用水量远超生活用水。', timestamp: '2024-01-08 14:45', sourceRef: '康奈尔笔记' },
          ]
        },
        3: {
          description: '能够识别基本的论证结构，对信息进行初步评估。在课堂讨论中表现出一定的质疑精神，但分析深度还需提升。',
          highlights: ['会提出"为什么"类问题', '能发现明显的矛盾'],
          areasForImprovement: ['需要更深入地分析问题根源', '提高论证的系统性'],
          suggestions: ['多阅读不同观点的文章', '练习总结论证的主要步骤', '尝试写出自己的论证大纲'],
          evidence: [
            { id: 'e3', type: 'dialogue' as const, content: '在讨论中提问："为什么海水淡化技术不能大规模应用？"', timestamp: '2024-01-08 15:10', sourceRef: '对话 #8' },
          ]
        },
        2: {
          description: '对问题的分析较为表面，主要依赖已知信息，缺乏深入质疑。需要培养批判性思考的习惯。',
          highlights: ['能理解基本概念', '愿意参与讨论'],
          areasForImprovement: ['需要养成质疑的习惯', '学会识别假设', '提高分析问题的深度'],
          suggestions: ['从简单的案例开始，练习找出隐含假设', '尝试对日常生活中的现象提出"为什么"', '阅读一些入门级的批判性思维材料'],
          evidence: [
            { id: 'e4', type: 'task' as const, content: '在作业中基本复述了课程内容，缺少自己的分析和见解。', timestamp: '2024-01-08 16:30', sourceRef: '作业提交' },
          ]
        }
      },
      information_synthesis: {
        4: {
          description: '能够熟练地从多个资源中提取关键信息，建立概念之间的联系，形成结构化的知识体系。在学习水循环时，成功整合了地理、化学、生态等多学科知识。',
          highlights: ['建立了清晰的知识网络', '能跨学科整合信息', '善于使用图表组织信息'],
          areasForImprovement: ['可以尝试更复杂的信息整合任务'],
          suggestions: ['尝试制作跨学科的概念图', '练习用自己的话综合不同来源的信息', '挑战整合相互矛盾的信息源'],
          evidence: [
            { id: 'e5', type: 'note' as const, content: '笔记中绘制了一张完整的水循环思维导图，连接了蒸发、降水、径流等概念，并标注了人类活动的影响。', timestamp: '2024-01-08 14:50', sourceRef: '康奈尔笔记' },
            { id: 'e6', type: 'behavior' as const, content: '观看了3个不同的视频资源后，主动对比总结了共同点和差异。', timestamp: '2024-01-08 15:20', sourceRef: '学习行为' },
          ]
        },
        3: {
          description: '能够从多个来源获取信息并进行基本整合，但知识网络的系统性还需加强。',
          highlights: ['会使用多个资源学习', '能找到信息之间的联系'],
          areasForImprovement: ['提高信息整合的系统性', '加强知识网络的构建'],
          suggestions: ['练习制作简单的概念图', '尝试用表格对比不同来源的信息', '定期回顾和整理学习笔记'],
          evidence: [
            { id: 'e7', type: 'note' as const, content: '笔记中记录了视频和文档的主要内容，但缺少整合和总结。', timestamp: '2024-01-08 15:35', sourceRef: '康奈尔笔记' },
          ]
        },
        2: {
          description: '主要依赖单一资源学习，信息整合能力较弱。需要培养从多个角度看待问题的习惯。',
          highlights: ['能理解单一资源的内容', '开始尝试使用多个资源'],
          areasForImprovement: ['学会从多个来源获取信息', '提高信息筛选和整合能力', '建立知识之间的联系'],
          suggestions: ['每次学习尝试至少查看2-3个不同资源', '练习用自己的话总结信息', '尝试画简单的信息关系图'],
          evidence: [
            { id: 'e8', type: 'behavior' as const, content: '主要观看了1个视频资源，较少查阅其他材料。', timestamp: '2024-01-08 14:15', sourceRef: '学习行为' },
          ]
        }
      },
      metacognition: {
        4: {
          description: '展现出优秀的自我反思能力，能够主动监控学习进度，识别知识盲区，并调整学习策略。在学习过程中多次主动寻求反馈。',
          highlights: ['主动识别学习困难点', '会调整学习方法', '善于自我评估'],
          areasForImprovement: ['可以尝试更多元的学习策略'],
          suggestions: ['记录不同学习策略的效果', '定期进行学习反思', '尝试向他人讲解学习内容以检验理解'],
          evidence: [
            { id: 'e9', type: 'dialogue' as const, content: '学生主动说："我发现自己对水资源的分配问题理解不够，需要再看一遍相关视频。"', timestamp: '2024-01-08 15:45', sourceRef: '对话 #15' },
            { id: 'e10', type: 'behavior' as const, content: '在完成30%进度后，主动返回复习前面的内容。', timestamp: '2024-01-08 16:00', sourceRef: '学习行为' },
          ]
        },
        3: {
          description: '具备基本的自我监控意识，能够识别部分学习困难，但策略调整还不够主动。',
          highlights: ['会评估自己的理解程度', '能识别一些困难点'],
          areasForImprovement: ['提高策略调整的主动性', '加强学习过程的监控'],
          suggestions: ['每次学习后进行简短的自我评估', '遇到困难时尝试不同的学习方法', '建立学习日志记录反思'],
          evidence: [
            { id: 'e11', type: 'dialogue' as const, content: '在AI提示下，学生表示："这个部分确实比较难理解。"', timestamp: '2024-01-08 15:50', sourceRef: '对话 #10' },
          ]
        },
        2: {
          description: '自我监控能力较弱，较少主动反思学习过程。需要培养元认知意识。',
          highlights: ['能完成基本的学习任务', '在引导下能进行简单反思'],
          areasForImprovement: ['培养自我监控的习惯', '学会识别学习困难', '提高反思的主动性'],
          suggestions: ['尝试在学习前设定目标', '学习后问自己"学到了什么"', '遇到困难时记录下来并寻求帮助'],
          evidence: [
            { id: 'e12', type: 'behavior' as const, content: '学习过程较为线性，很少返回复习或调整策略。', timestamp: '2024-01-08 14:30', sourceRef: '学习行为' },
          ]
        }
      }
    };

    return Object.entries(competencies).map(([type, stars]) => ({
      type: type as ResultsCompetencyType,
      stars: stars as 1 | 2 | 3 | 4,
      ...(assessmentData[type]?.[stars] || {
        description: `在${RESULTS_COMPETENCY_DEFINITIONS[type as ResultsCompetencyType].name}方面的表现。`,
        highlights: ['展现了相关能力'],
        areasForImprovement: ['继续提升'],
        suggestions: ['保持学习热情'],
        evidence: []
      })
    }));
  };

  // 生成任务完成记录
  const generateTaskCompletions = (studentId: number, competencies: Record<string, number>) => {
    const avgStars = Object.values(competencies).reduce((a, b) => a + b, 0) / Object.values(competencies).length;
    const baseScore = avgStars * 20 + 20; // 转换为40-100分

    return [
      {
        taskId: 'task_quiz_1',
        taskTitle: '水循环基础知识测验',
        taskType: 'quiz' as const,
        score: Math.round(baseScore + (Math.random() * 10 - 5)),
        maxScore: 100,
        competencyTags: ['critical_thinking', 'information_synthesis'] as ResultsCompetencyType[],
        completedAt: '2024-01-08 15:30',
        status: 'completed' as const,
      },
      {
        taskId: 'task_assignment_1',
        taskTitle: '节水方案设计',
        taskType: 'assignment' as const,
        score: Math.round(baseScore + (Math.random() * 10 - 5)),
        maxScore: 100,
        competencyTags: ['creativity', 'information_synthesis'] as ResultsCompetencyType[],
        completedAt: '2024-01-08 16:45',
        status: 'completed' as const,
      },
    ];
  };

  // 生成跨课程能力画像
  const generateCrossCourseProfiles = (studentId: number, competencies: Record<string, number>) => {
    const profiles: any[] = [];

    // 为每个能力维度生成跨课程记录
    Object.entries(competencies).forEach(([type, currentStars]) => {
      const records = [
        {
          courseId: 'course_geo_01',
          courseName: '地理-气候变化',
          date: '2023-12',
          competencyType: type as ResultsCompetencyType,
          stars: Math.max(1, Math.min(4, currentStars - 1 + Math.floor(Math.random() * 2))) as 1 | 2 | 3 | 4,
        },
        {
          courseId: 'course_bio_01',
          courseName: '生物-生态系统',
          date: '2024-01',
          competencyType: type as ResultsCompetencyType,
          stars: Math.max(1, Math.min(4, currentStars - 1 + Math.floor(Math.random() * 3))) as 1 | 2 | 3 | 4,
        },
        {
          courseId: 'course_current',
          courseName: config.noteInfo.title,
          date: '2024-01',
          competencyType: type as ResultsCompetencyType,
          stars: currentStars as 1 | 2 | 3 | 4,
        },
      ];

      // 计算趋势
      const firstStars = records[0].stars;
      const lastStars = records[records.length - 1].stars;
      const trend = lastStars > firstStars ? 'rising' : lastStars < firstStars ? 'declining' : 'stable';
      const averageStars = records.reduce((sum, r) => sum + r.stars, 0) / records.length;

      profiles.push({
        competencyType: type as ResultsCompetencyType,
        records,
        trend: trend as 'rising' | 'stable' | 'declining',
        averageStars: parseFloat(averageStars.toFixed(1)),
      });
    });

    return profiles;
  };

  // 转换为 StudentCompetencyProfile 格式
  const mockStudents: StudentCompetencyProfile[] = mockStudentsRaw.map((student) => ({
    studentId: String(student.id),
    studentName: student.name,
    avatar: student.avatar,
    status: student.status,
    learningDuration: 30 + student.id * 5, // 模拟学习时长
    progress: student.progress,
    lastActive: student.lastActive,
    currentCourseAssessments: generateEnhancedAssessments(student.id, student.competencies),
    taskCompletions: generateTaskCompletions(student.id, student.competencies),
    crossCourseProfiles: generateCrossCourseProfiles(student.id, student.competencies),
    aiDetectedCompetencies: student.id === 1 || student.id === 4 || student.id === 6
      ? [{ type: 'metacognition' as ResultsCompetencyType, confidence: 0.85, description: '在学习过程中展现了良好的自我反思能力，能主动调整学习策略' }]
      : student.id === 2
      ? [{ type: 'question_quality' as ResultsCompetencyType, confidence: 0.78, description: '提出了多个深层次的"为什么"类问题，显示出强烈的探究意识' }]
      : [],
  }));

  // 模拟资源查看统计
  const mockResourceViews = config.resources.map((resource: any, idx: number) => ({
    ...resource,
    views: [42, 38, 35, 40, 45, 41][idx] || 30,
    avgTime: ['12分35秒', '8分20秒', '15分10秒', '6分45秒', '18分30秒', '10分15秒'][idx] || '10分钟',
    completionRate: [95, 88, 78, 92, 85, 90][idx] || 80,
  }));

  // 模拟任务完成统计
  const mockTaskCompletions = config.tasks.map((task: any, idx: number) => ({
    ...task,
    submitted: [38, 35, 40, 42][idx] || 35,
    avgScore: task.type === 'quiz' ? [85, 78, 92, 88][idx] || 80 : null,
    excellent: [15, 12, 18, 20][idx] || 15,
    good: [18, 20, 16, 15][idx] || 18,
    fair: [5, 3, 6, 7][idx] || 5,
  }));

  // 收集所有已配置的能力维度
  const allCompetencies = new Set<CrossCompetencyType>();
  config.tasks?.forEach((task: any) => {
    if (task.assignedCompetencies) {
      task.assignedCompetencies.forEach((comp: CrossCompetencyType) => allCompetencies.add(comp));
    }
    if (task.crossCompetencies) {
      task.crossCompetencies.forEach((comp: CrossCompetencyType) => allCompetencies.add(comp));
    }
  });
  const competencyList = Array.from(allCompetencies);

  // 模拟AI发现的其他能力表现
  const aiDetectedCompetencies = [
    { type: 'metacognition', name: '元认知', studentCount: 15, description: '展现了良好的自我反思能力' },
    { type: 'question_quality', name: '提问质量', studentCount: 8, description: '提出了深层次的"为什么"类问题' },
  ];

  // 选中的学生（用于显示能力详情弹窗）
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <Users size={24} className="text-primary-600" />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">45</p>
            <p className="text-sm text-gray-500 mt-1">绑定学生总数</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">68%</p>
            <p className="text-sm text-gray-500 mt-1">平均完成进度</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
                <Clock size={24} className="text-accent-600" />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">42min</p>
            <p className="text-sm text-gray-500 mt-1">平均学习时长</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Target size={24} className="text-amber-600" />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">84.5</p>
            <p className="text-sm text-gray-500 mt-1">平均任务得分</p>
          </div>
        </div>

        {/* 能力维度分布（使用重构后的组件） */}
        {(() => {
          if (allCompetencies.size === 0) return null;

          // 转换为 ClassCompetencyDistribution 接口格式
          const competencyDistributions: ClassCompetencyDistribution[] = Array.from(allCompetencies).map((competency, idx) => {
            // 使用固定模拟数据，根据索引确定不同的分布（避免hydration问题）
            const distributions = [
              { star4: 12, star3: 18, star2: 10, star1: 5 },
              { star4: 15, star3: 16, star2: 9, star1: 5 },
              { star4: 10, star3: 20, star2: 11, star1: 4 },
            ];
            const dist = distributions[idx % distributions.length];
            const total = dist.star4 + dist.star3 + dist.star2 + dist.star1;
            const avgStars = (dist.star4 * 4 + dist.star3 * 3 + dist.star2 * 2 + dist.star1 * 1) / total;

            return {
              competencyType: competency as ResultsCompetencyType,
              distribution: {
                star1: dist.star1,
                star2: dist.star2,
                star3: dist.star3,
                star4: dist.star4,
              },
              averageStars: parseFloat(avgStars.toFixed(1)),
              totalStudents: total,
            };
          });

          return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Target size={18} className="text-primary-600" />
                    能力维度分布（本课程关注的能力）
                  </h3>
                  <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border border-primary-200">
                    跨学科核心能力评估
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  {competencyDistributions.map((distribution) => (
                    <CompetencyDistributionChart
                      key={distribution.competencyType}
                      distribution={distribution}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* AI发现的其他能力表现（新增） */}
        {aiDetectedCompetencies.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-accent-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles size={18} className="text-accent-600" />
                  AI发现的其他能力表现
                </h3>
                <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border border-purple-200">
                  智能识别 · 补充维度
                </span>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                除教师指定维度外，AI在学习过程中识别到以下能力表现：
              </p>

              <div className="grid grid-cols-2 gap-4">
                {aiDetectedCompetencies.map((detected) => (
                  <div
                    key={detected.type}
                    className="bg-gradient-to-br from-accent-50 to-cyan-50/30 rounded-xl p-4 border border-purple-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                        <Brain size={16} className="text-accent-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800">{detected.name}</h4>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                        {detected.studentCount}名学生
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{detected.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 学生列表（增强：添加能力维度列） */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-primary-600" />
              学生列表
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">学生</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">状态</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">进度</th>
                  {competencyList.map((comp) => {
                    const def = CROSS_COMPETENCY_DEFINITIONS[comp];
                    return (
                      <th key={comp} className="text-center px-3 py-3 text-xs font-semibold text-gray-600">
                        {def.name}
                      </th>
                    );
                  })}
                  {aiDetectedCompetencies.length > 0 && (
                    <th className="text-center px-3 py-3 text-xs font-semibold text-accent-600">AI发现</th>
                  )}
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockStudents.map((student) => (
                  <StudentListItem
                    key={student.studentId}
                    profile={student}
                    competencyTypes={competencyList as ResultsCompetencyType[]}
                    aiDetectedTypes={aiDetectedCompetencies.map(c => c.type as ResultsCompetencyType)}
                    onClick={() => setSelectedStudent(student)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 资源查看统计 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Eye size={18} className="text-emerald-600" />
              资源查看统计
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">资源名称</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">查看人数</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">平均时长</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">完成率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockResourceViews.map((resource: any) => (
                  <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-${resource.color}-100 flex items-center justify-center`}>
                          {resource.type === 'video' && <Video size={16} className={`text-${resource.color}-600`} />}
                          {resource.type === 'pdf' && <FileText size={16} className={`text-${resource.color}-600`} />}
                          {resource.type === 'ppt' && (
                            <FileSpreadsheet size={16} className={`text-${resource.color}-600`} />
                          )}
                        </div>
                        <span className="font-medium text-gray-700">{resource.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-700">{resource.views}/45</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">{resource.avgTime}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-emerald-600">{resource.completionRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 任务完成统计 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-accent-50 to-primary-50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle size={18} className="text-accent-600" />
              任务完成统计
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">任务名称</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">类型</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">提交人数</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">平均得分</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">评级分布</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockTaskCompletions.map((task: any) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            task.type === 'quiz' ? 'bg-green-100' : 'bg-blue-100'
                          }`}
                        >
                          {task.type === 'quiz' ? (
                            <Zap size={16} className="text-green-600" />
                          ) : (
                            <FileEdit size={16} className="text-primary-600" />
                          )}
                        </div>
                        <span className="font-medium text-gray-700">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          task.type === 'quiz'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-primary-700'
                        }`}
                      >
                        {task.type === 'quiz' ? '测验' : '作业'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-700">{task.submitted}/45</span>
                    </td>
                    <td className="px-5 py-4">
                      {task.avgScore !== null ? (
                        <span className="text-sm font-semibold text-emerald-600">{task.avgScore}分</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-600">优</span>
                          <span className="text-xs font-medium text-gray-700">{task.excellent}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-primary-600">良</span>
                          <span className="text-xs font-medium text-gray-700">{task.good}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-amber-600">中</span>
                          <span className="text-xs font-medium text-gray-700">{task.fair}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 学生能力详情面板（使用重构后的组件） */}
      {selectedStudent && (
        <StudentDetailPanel
          profile={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
