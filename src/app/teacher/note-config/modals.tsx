import { useState } from 'react';
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

// 能力维度类型定义
type CompetencyType =
  | 'critical_thinking'      // 批判性思维
  | 'information_synthesis'  // 信息整合
  | 'metacognition'          // 元认知
  | 'question_quality'       // 提问质量
  | 'creativity'             // 创造性
  | 'persistence';           // 坚持性

// 能力维度定义（用于UI展示）
const COMPETENCY_DEFINITIONS: Record<CompetencyType, { name: string; description: string; icon: any }> = {
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

// NoteInfoModal - 跨学科配置模态框
export function NoteInfoModal({ config, onSave, onClose, knowledgeLibrary, grades, classes }: any) {
  const [localConfig, setLocalConfig] = useState({
    title: config.title || '',
    description: config.description || '',
    subjects: config.subjects || [],
    grade: config.grade || '',
    bindClasses: config.bindClasses || [],
  });

  const allSubjects = Object.keys(knowledgeLibrary);

  const toggleSubject = (subject: string) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s: string) => s !== subject)
        : [...prev.subjects, subject],
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

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-[800px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings size={20} />
            笔记基本信息配置
          </h2>
        </div>

        <div className="p-6 max-h-[calc(85vh-140px)] overflow-y-auto">
          <div className="space-y-6">
            {/* 标题和描述 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">笔记标题 *</label>
                <input
                  type="text"
                  value={localConfig.title}
                  onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="例如：水循环与水资源"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">年级</label>
                <select
                  value={localConfig.grade}
                  onChange={(e) => setLocalConfig({ ...localConfig, grade: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">请选择年级</option>
                  {grades.map((grade: string) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <textarea
                value={localConfig.description}
                onChange={(e) => setLocalConfig({ ...localConfig, description: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows={3}
                placeholder="简要描述本笔记的学习目标和内容"
              />
            </div>

            {/* 跨学科选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Network size={16} className="text-blue-500" />
                涉及学科（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {allSubjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      localConfig.subjects.includes(subject)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* 绑定班级 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users size={16} className="text-emerald-500" />
                绑定班级（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {classes.map((className: string) => (
                  <button
                    key={className}
                    onClick={() => toggleClass(className)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      localConfig.bindClasses.includes(className)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {className}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium">
            取消
          </button>
          <button
            onClick={() => {
              onSave(localConfig);
              onClose();
            }}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
          >
            保存配置
          </button>
        </div>
      </div>
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
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageCircle size={20} />
            自由对话模式配置
          </h2>
          <p className="text-blue-100 text-sm mt-1">选择 AI 助手并追加教学指令</p>
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
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="agent"
                    checked={localConfig.selectedAgentId === agent.id}
                    onChange={() => setLocalConfig({ ...localConfig, selectedAgentId: agent.id })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Bot size={14} className="text-blue-600" />
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
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] resize-none"
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
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm"
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
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileEdit size={20} />
            笔记模板配置
          </h2>
          <p className="text-blue-100 text-sm mt-1">选择笔记模板，学生将使用该模板记录学习内容</p>
        </div>

        <div className="flex h-[55vh]">
          <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto p-3 space-y-2">
            {inheritedTemplates.map((tpl: any) => (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedTemplate === tpl.id
                    ? 'bg-white border-2 border-blue-400 shadow-sm'
                    : 'bg-white border border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedTemplate === tpl.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                  >
                    <FileText size={18} className={selectedTemplate === tpl.id ? 'text-blue-600' : 'text-gray-500'} />
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
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm"
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
        <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white p-5">
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
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-white border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="strategy"
                    checked={selectedStrategy === strategy.id}
                    onChange={() => setSelectedStrategy(strategy.id)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Brain size={14} className="text-purple-600" />
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
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none min-h-[80px] resize-none"
            />
          </div>

          {/* 能力评估预览 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-blue-600" />
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
                  const allCompetencies = new Set<CompetencyType>();
                  config.tasks.forEach((task: any) => {
                    if (task.assignedCompetencies) {
                      task.assignedCompetencies.forEach((comp: CompetencyType) => allCompetencies.add(comp));
                    }
                  });

                  return allCompetencies.size > 0 ? (
                    Array.from(allCompetencies).map((competency) => {
                      const def = COMPETENCY_DEFINITIONS[competency];
                      const Icon = def.icon;
                      return (
                        <div
                          key={competency}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-blue-700 border border-blue-300 shadow-sm"
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
            localTask.type === 'quiz' ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-indigo-500'
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
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
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
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
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
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                        rows={2}
                      />
                    </div>

                    {/* 配置摘要 */}
                    <div className="bg-white/80 rounded-lg p-3 border border-purple-100">
                      <p className="text-xs text-gray-600">
                        将生成 <span className="font-bold text-purple-600">{aiGenConfig.questionCount}</span> 道题目，
                        题型：
                        <span className="font-bold text-purple-600">
                          {aiGenConfig.questionTypes
                            .map((t) => ({ choice: '单选', multipleChoice: '多选', fillBlank: '填空', trueFalse: '判断', shortAnswer: '简答' }[t]))
                            .join('、')}
                        </span>
                        ，难度：
                        <span className="font-bold text-purple-600">
                          {aiGenConfig.difficulty === 'easy' ? '基础' : aiGenConfig.difficulty === 'medium' ? '中等' : '困难'}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-center py-6 text-gray-400">
                  <ListChecks size={24} className="mx-auto mb-2" />
                  <p className="text-xs">配置参数后点击"AI生成题目"，或手动添加题目</p>
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
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    placeholder="请输入作业要求，例如：请结合生活实际，提出至少3条节水建议..."
                  />
                </div>

                {/* 能力维度标记 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                    <Target size={14} className="text-blue-500" />
                    能力维度标记
                    <span className="text-xs text-gray-500 font-normal ml-1">(可选择多个)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(COMPETENCY_DEFINITIONS) as CompetencyType[]).map((competency) => {
                      const def = COMPETENCY_DEFINITIONS[competency];
                      const Icon = def.icon;
                      const isSelected = localTask.assignedCompetencies?.includes(competency) || false;

                      return (
                        <button
                          key={competency}
                          type="button"
                          onClick={() => {
                            const current = localTask.assignedCompetencies || [];
                            const updated = isSelected
                              ? current.filter((c: CompetencyType) => c !== competency)
                              : [...current, competency];
                            updateField('assignedCompetencies', updated.length > 0 ? updated : undefined);
                          }}
                          className={`
                            flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
                            ${
                              isSelected
                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-400 shadow-sm'
                                : 'bg-gray-50 text-gray-600 border border-gray-300 hover:bg-gray-100'
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
                    选择本次作业重点培养的能力维度，AI将在批改时重点评估这些能力的表现
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
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
                        <label className="block text-xs font-medium text-purple-600 mb-2">选择批改Agent</label>
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
                                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
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
                        <label className="block text-xs font-medium text-purple-600 mb-2">
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
                          className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 outline-none resize-none"
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

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            取消
          </button>
          <button
            onClick={() => onSave(localTask)}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
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
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <FolderOpen size={14} className="text-blue-500" />
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
                    <Clock size={12} className="text-blue-600" />
                    <span className="text-xs text-blue-700">专注时长</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">00:00</p>
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
export function UseViewHeader({ config, onBack, onSwitchToResults }: any) {
  return (
    <header className="h-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded">
          <span className="text-xs font-medium text-emerald-700">CocoLearn Teacher</span>
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
        <button
          onClick={onSwitchToResults}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
        >
          <Activity size={14} />
          结果视角
        </button>
        <div className="w-px h-5 bg-gray-200"></div>
        <button
          onClick={() => window.open('/student/workbench', '_blank')}
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
export function ResultsViewHeader({ config, onBack, onSwitchToUse }: any) {
  return (
    <header className="h-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 rounded">
          <span className="text-xs font-medium text-purple-700">CocoLearn Teacher</span>
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
          onClick={() => window.open('/student/workbench', '_blank')}
          className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Send size={14} />
          发布到班级
        </button>
      </div>
    </header>
  );
}

// 学生能力详情弹窗（改造：符合PRD的个体视角）
function StudentCompetencyModal({ student, competencies, onClose }: any) {
  if (!student || !competencies || competencies.length === 0) return null;

  // 为每个能力生成详细的评估数据
  const studentCompetencyData = competencies.map((competency: CompetencyType) => {
    const def = COMPETENCY_DEFINITIONS[competency];
    const stars = 1 + Math.floor(Math.random() * 4); // 1-4星

    return {
      type: competency,
      name: def.name,
      icon: def.icon,
      stars,
      // 描述性评价
      description: `${student.name}在本课程中展现了${stars >= 3 ? '优秀的' : '基本的'}${def.name}能力。${stars === 4 ? '多次主动质疑、寻找证据，展现了系统性批判思维。' : stars === 3 ? '能够提出有深度的问题并尝试寻找依据。' : '需要加强证据支持和逻辑分析。'}`,
      // 亮点
      highlight: stars >= 3 ? '在讨论气候变化时，主动对比了资料A和资料B的不同观点，并指出资料A缺乏数据支持。' : '初步展现了质疑意识',
      // 待提升
      improvement: stars === 4 ? '可以尝试更深入地分析论证逻辑，识别潜在的假设。' : stars === 3 ? '可以尝试更深入地分析论证逻辑。' : '需要加强从多个角度分析问题的能力。',
      // 建议
      suggestion: stars === 4 ? '继续保持批判思维习惯，可以挑战更复杂的论证结构。' : '多练习识别论证中的假设和证据支持。',
      // 具体证据
      evidence: [
        '"这个数据是哪年的？可能已经过时了"（对话 #23）',
        '"资料B的结论和资料A矛盾，我需要找更多证据"（对话 #31）',
        '笔记中对比了三份资料的核心观点差异',
      ].slice(0, stars >= 3 ? 3 : 1),
    };
  });

  // 跨课程能力画像（模拟数据）
  const crossCourseProfile = competencies.slice(0, 2).map((comp: CompetencyType) => {
    const def = COMPETENCY_DEFINITIONS[comp];
    return {
      type: comp,
      name: def.name,
      history: [
        { course: '科学探究课', date: '2025-01-05', stars: 3 + Math.floor(Math.random() * 2) },
        { course: '媒体素养课', date: '2025-01-03', stars: 3 + Math.floor(Math.random() * 2) },
        { course: '本课程', date: '2025-01-07', stars: student.competencies[comp] },
      ],
      trend: Math.random() > 0.5 ? '上升' : '稳定',
    };
  });

  // 计算平均星级
  const avgStars = (
    studentCompetencyData.reduce((sum: number, data: any) => sum + data.stars, 0) / studentCompetencyData.length
  ).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-[900px] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{student.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-sm opacity-90 mt-1">学习时长：52分钟 · 完成度：{student.progress}%</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{avgStars} ★</div>
              <p className="text-xs opacity-90 mt-1">综合能力评级</p>
            </div>
          </div>
        </div>

        {/* 内容区域 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. 本课程能力评估（能力雷达图简化版） */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              本课程能力评估
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {studentCompetencyData.map((data: any) => {
                const Icon = data.icon;
                return (
                  <div key={data.type} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon size={16} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{data.name}</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {'★'.repeat(data.stars)}
                      {'☆'.repeat(4 - data.stars)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. 能力详情（描述性评价） */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              能力详情
            </h3>

            <div className="space-y-4">
              {studentCompetencyData.map((data: any, idx: number) => (
                <div key={data.type} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">
                        {'★'.repeat(data.stars)}
                        {'☆'.repeat(4 - data.stars)}
                      </div>
                      <span className="font-semibold text-gray-800">{data.name}</span>
                    </div>
                    <ChevronDown size={18} className="text-gray-400" />
                  </button>

                  <div className="px-5 pb-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">评价</h4>
                      <p className="text-sm text-gray-600">{data.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-emerald-700 mb-1">亮点</h4>
                        <p className="text-xs text-gray-600">{data.highlight}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-amber-700 mb-1">待提升</h4>
                        <p className="text-xs text-gray-600">{data.improvement}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">证据</h4>
                      <ul className="space-y-1">
                        {data.evidence.map((evidence: string, eidx: number) => (
                          <li key={eidx} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{evidence}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. 跨课程能力画像 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50/30 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Network size={18} className="text-purple-600" />
              跨课程能力画像
            </h3>

            <div className="space-y-4">
              {crossCourseProfile.map((profile: any) => (
                <div key={profile.type} className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{profile.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${profile.trend === '上升' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        趋势：{profile.trend === '上升' ? '↗ 上升' : '→ 稳定'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {profile.history.map((h: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600 w-28">{h.course}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 flex items-center">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold"
                            style={{ width: `${(h.stars / 4) * 100}%` }}
                          >
                            {h.stars}★
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{h.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 任务完成情况 */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-600" />
                任务完成情况
              </h3>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs font-semibold text-gray-600">任务</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-600">类型</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-600">得分</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-600">能力标签</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-600">状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">知识检测Quiz</td>
                    <td className="py-2"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">客观题</span></td>
                    <td className="py-2 font-semibold">90/100</td>
                    <td className="py-2">-</td>
                    <td className="py-2"><span className="text-xs text-green-600">✅ 完成</span></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">观点分析作业</td>
                    <td className="py-2"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">主观题</span></td>
                    <td className="py-2 font-semibold">85/100</td>
                    <td className="py-2">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">批判性思维</span>
                    </td>
                    <td className="py-2"><span className="text-xs text-green-600">✅ 完成</span></td>
                  </tr>
                  <tr>
                    <td className="py-2">资料整合报告</td>
                    <td className="py-2"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">主观题</span></td>
                    <td className="py-2 font-semibold">80/100</td>
                    <td className="py-2">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">信息整合</span>
                    </td>
                    <td className="py-2"><span className="text-xs text-green-600">✅ 完成</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. 学习轨迹提示 */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Route size={16} className="text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-800">学习轨迹</h4>
            </div>
            <p className="text-xs text-gray-600">
              点击"展开查看详细时间线"可以查看该学生的完整学习轨迹，包括资源访问、任务提交、AI对话等所有活动记录。
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
          >
            返回班级概览
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

// Results视角仪表板 - 学习数据展示
export function ResultsViewDashboard({ config }: any) {
  // 模拟学生列表数据（增强：增加能力维度评级）
  const mockStudents = [
    { id: 1, name: '张晓明', avatar: '👦', status: 'online', progress: 85, lastActive: '2分钟前', competencies: { critical_thinking: 4, information_synthesis: 3, metacognition: 4 } },
    { id: 2, name: '李思琪', avatar: '👧', status: 'online', progress: 92, lastActive: '刚刚', competencies: { critical_thinking: 3, information_synthesis: 4, metacognition: 3 } },
    { id: 3, name: '王浩宇', avatar: '👦', status: 'offline', progress: 45, lastActive: '1小时前', competencies: { critical_thinking: 2, information_synthesis: 2, metacognition: 2 } },
    { id: 4, name: '刘雨欣', avatar: '👧', status: 'online', progress: 78, lastActive: '5分钟前', competencies: { critical_thinking: 3, information_synthesis: 3, metacognition: 4 } },
    { id: 5, name: '陈思远', avatar: '👦', status: 'offline', progress: 60, lastActive: '30分钟前', competencies: { critical_thinking: 2, information_synthesis: 3, metacognition: 2 } },
    { id: 6, name: '赵梓涵', avatar: '👧', status: 'online', progress: 95, lastActive: '1分钟前', competencies: { critical_thinking: 4, information_synthesis: 4, metacognition: 4 } },
  ];

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
  const allCompetencies = new Set<CompetencyType>();
  config.tasks?.forEach((task: any) => {
    if (task.assignedCompetencies) {
      task.assignedCompetencies.forEach((comp: CompetencyType) => allCompetencies.add(comp));
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
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
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Clock size={24} className="text-purple-600" />
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

        {/* 能力维度分布（改造：星级分布） */}
        {(() => {
          if (allCompetencies.size === 0) return null;

          // 模拟每个能力维度的班级星级分布数据（使用固定值避免hydration问题）
          const competencyStarDistribution = Array.from(allCompetencies).map((competency, idx) => {
            const def = COMPETENCY_DEFINITIONS[competency];
            // 使用固定模拟数据，根据索引确定不同的分布
            const distributions = [
              { star4: 12, star3: 18, star2: 10, star1: 5 },  // 第一个能力维度
              { star4: 15, star3: 16, star2: 9, star1: 5 },   // 第二个能力维度
              { star4: 10, star3: 20, star2: 11, star1: 4 }, // 第三个能力维度
            ];
            const dist = distributions[idx % distributions.length];
            const total = dist.star4 + dist.star3 + dist.star2 + dist.star1;
            const avgStars = ((dist.star4 * 4 + dist.star3 * 3 + dist.star2 * 2 + dist.star1 * 1) / total).toFixed(1);

            return {
              type: competency,
              name: def.name,
              icon: def.icon,
              description: def.description,
              distribution: dist,
              avgStars: parseFloat(avgStars),
              total,
            };
          });

          return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Target size={18} className="text-blue-600" />
                    能力维度分布（本课程关注的能力）
                  </h3>
                  <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border border-blue-200">
                    跨学科核心能力评估
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  {competencyStarDistribution.map((stat) => {
                    const Icon = stat.icon;
                    const maxCount = Math.max(stat.distribution.star4, stat.distribution.star3, stat.distribution.star2, stat.distribution.star1);

                    return (
                      <div
                        key={stat.type}
                        className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        {/* 能力标题和平均星级 */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Icon size={20} className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-800">{stat.name}</h4>
                            <p className="text-xs text-gray-500">{stat.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">班级平均</div>
                            <div className="text-xl font-bold text-blue-600">{stat.avgStars} ★</div>
                          </div>
                        </div>

                        {/* 星级分布条形图 */}
                        <div className="space-y-2">
                          {/* 4星 */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-12">★★★★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${(stat.distribution.star4 / maxCount) * 100}%` }}
                              >
                                <span className="text-xs font-bold text-white">{stat.distribution.star4}人</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 w-8">{Math.round((stat.distribution.star4 / stat.total) * 100)}%</span>
                          </div>

                          {/* 3星 */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-12">★★★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${(stat.distribution.star3 / maxCount) * 100}%` }}
                              >
                                <span className="text-xs font-bold text-white">{stat.distribution.star3}人</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 w-8">{Math.round((stat.distribution.star3 / stat.total) * 100)}%</span>
                          </div>

                          {/* 2星 */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-12">★★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${(stat.distribution.star2 / maxCount) * 100}%` }}
                              >
                                <span className="text-xs font-bold text-white">{stat.distribution.star2}人</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 w-8">{Math.round((stat.distribution.star2 / stat.total) * 100)}%</span>
                          </div>

                          {/* 1星 */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-12">★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${(stat.distribution.star1 / maxCount) * 100}%` }}
                              >
                                <span className="text-xs font-bold text-white">{stat.distribution.star1}人</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 w-8">{Math.round((stat.distribution.star1 / stat.total) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* AI发现的其他能力表现（新增） */}
        {aiDetectedCompetencies.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-600" />
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
                    className="bg-gradient-to-br from-purple-50 to-pink-50/30 rounded-xl p-4 border border-purple-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Brain size={16} className="text-purple-600" />
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
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
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
                    const def = COMPETENCY_DEFINITIONS[comp];
                    return (
                      <th key={comp} className="text-center px-3 py-3 text-xs font-semibold text-gray-600">
                        {def.name}
                      </th>
                    );
                  })}
                  {aiDetectedCompetencies.length > 0 && (
                    <th className="text-center px-3 py-3 text-xs font-semibold text-purple-600">AI发现</th>
                  )}
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{student.avatar}</div>
                        <span className="font-medium text-gray-700">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          student.status === 'online'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            student.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        ></span>
                        {student.status === 'online' ? '在线' : '离线'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 w-16">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{student.progress}%</span>
                      </div>
                    </td>
                    {competencyList.map((comp) => {
                      const stars = (student.competencies as any)[comp] || 0;
                      return (
                        <td key={comp} className="px-3 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-bold text-gray-800">
                              {'★'.repeat(stars)}
                              {'☆'.repeat(4 - stars)}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                    {aiDetectedCompetencies.length > 0 && (
                      <td className="px-3 py-4 text-center">
                        {student.id === 1 || student.id === 4 || student.id === 6 ? (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">元认知↑</span>
                        ) : student.id === 2 ? (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">提问↑</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        查看详情
                      </button>
                    </td>
                  </tr>
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
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle size={18} className="text-purple-600" />
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
                            <FileEdit size={16} className="text-blue-600" />
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
                            : 'bg-blue-100 text-blue-700'
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
                          <span className="text-xs text-blue-600">良</span>
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

      {/* 学生能力详情弹窗 */}
      {selectedStudent && (
        <StudentCompetencyModal
          student={selectedStudent}
          competencies={competencyList}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
