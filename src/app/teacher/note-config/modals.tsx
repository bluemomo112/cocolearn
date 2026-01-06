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
  BarChart3,
  TrendingUp,
  GripVertical,
  Network,
  Settings,
  Database,
} from 'lucide-react';

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
      className="w-1 bg-slate-200 hover:bg-blue-400 cursor-col-resize transition-colors relative group flex-shrink-0"
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
    knowledgePoints: config.knowledgePoints || [],
  });
  const [showKnowledgeLibrary, setShowKnowledgeLibrary] = useState(false);
  const [selectedSubjectForKP, setSelectedSubjectForKP] = useState('');

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

  const addKnowledgePoint = (kp: any) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      knowledgePoints: [...prev.knowledgePoints, { ...kp, id: `kp_${Date.now()}` }],
    }));
  };

  const removeKnowledgePoint = (id: string) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      knowledgePoints: prev.knowledgePoints.filter((kp: any) => kp.id !== id),
    }));
  };

  const addCustomKnowledgePoint = () => {
    const customKP = {
      id: `kp_custom_${Date.now()}`,
      subject: selectedSubjectForKP || localConfig.subjects[0] || '自定义',
      point: '新知识点',
      source: 'custom' as const,
    };
    addKnowledgePoint(customKP);
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
                <label className="block text-sm font-medium text-slate-700 mb-2">笔记标题 *</label>
                <input
                  type="text"
                  value={localConfig.title}
                  onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="例如：水循环与水资源"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">年级</label>
                <select
                  value={localConfig.grade}
                  onChange={(e) => setLocalConfig({ ...localConfig, grade: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">请选择年级</option>
                  {grades.map((grade: string) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">描述</label>
              <textarea
                value={localConfig.description}
                onChange={(e) => setLocalConfig({ ...localConfig, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows={3}
                placeholder="简要描述本笔记的学习目标和内容"
              />
            </div>

            {/* 跨学科选择 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
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
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* 绑定班级 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
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
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {className}
                  </button>
                ))}
              </div>
            </div>

            {/* 知识点配置 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Target size={16} className="text-purple-500" />
                  核心知识点
                </label>
                <button
                  onClick={() => setShowKnowledgeLibrary(!showKnowledgeLibrary)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm transition-colors"
                >
                  <Database size={14} />
                  {showKnowledgeLibrary ? '隐藏' : '从知识库添加'}
                </button>
              </div>

              {/* 已选知识点列表 */}
              <div className="space-y-2 mb-3">
                {localConfig.knowledgePoints.map((kp: any) => (
                  <div
                    key={kp.id}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{kp.subject}</span>
                        <span className="text-sm font-medium text-slate-800">{kp.point}</span>
                        {kp.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            kp.difficulty === '基础' ? 'bg-green-100 text-green-700' :
                            kp.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {kp.difficulty}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {kp.source === 'library' ? '来自知识库' : '自定义'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeKnowledgePoint(kp.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                ))}
                {localConfig.knowledgePoints.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">暂未添加知识点</p>
                )}
              </div>

              {/* 知识库面板 */}
              {showKnowledgeLibrary && (
                <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-sm font-medium text-slate-700">选择学科：</label>
                    <select
                      value={selectedSubjectForKP}
                      onChange={(e) => setSelectedSubjectForKP(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="">全部学科</option>
                      {localConfig.subjects.map((subject: string) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                    <button
                      onClick={addCustomKnowledgePoint}
                      className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-white border border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-100 text-sm transition-colors"
                    >
                      <Plus size={14} />
                      添加自定义知识点
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {Object.entries(knowledgeLibrary)
                      .filter(([subject]) => !selectedSubjectForKP || subject === selectedSubjectForKP)
                      .flatMap(([subject, points]) =>
                        (points as any[]).map((kp) => (
                          <button
                            key={kp.id}
                            onClick={() => addKnowledgePoint(kp)}
                            disabled={localConfig.knowledgePoints.some((item: any) => item.id === kp.id)}
                            className="w-full text-left flex items-center gap-3 p-2 bg-white rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{subject}</span>
                            <span className="text-sm text-slate-700 flex-1">{kp.point}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              kp.difficulty === '基础' ? 'bg-green-100 text-green-700' :
                              kp.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {kp.difficulty}
                            </span>
                          </button>
                        ))
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-slate-600 hover:text-slate-800 font-medium">
            取消
          </button>
          <button
            onClick={() => {
              onSave(localConfig);
              onClose();
            }}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
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
            <label className="block text-sm font-medium text-slate-700 mb-3">
              选择 AI 助手 <span className="text-slate-400 font-normal">(继承自通用版)</span>
            </label>
            <div className="space-y-2">
              {inheritedAgents.map((agent: any) => (
                <label
                  key={agent.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    localConfig.selectedAgentId === agent.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-slate-200 hover:border-blue-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="agent"
                    checked={localConfig.selectedAgentId === agent.id}
                    onChange={() => setLocalConfig({ ...localConfig, selectedAgentId: agent.id })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Bot size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{agent.name}</p>
                    <p className="text-xs text-slate-500">{agent.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              教师追加指令 <span className="text-slate-400 font-normal">(user_prompt)</span>
            </label>
            <textarea
              value={localConfig.teacherPrompt}
              onChange={(e) => setLocalConfig({ ...localConfig, teacherPrompt: e.target.value })}
              placeholder="例如：请用幽默的口吻回答，所有比喻都和「水」有关..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-sm font-medium text-slate-700">启用知识围栏</span>
              <p className="text-xs text-slate-500">只允许回答与课程资料相关的问题</p>
            </div>
            <button
              onClick={() => setLocalConfig({ ...localConfig, enableFence: !localConfig.enableFence })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                localConfig.enableFence ? 'bg-blue-500' : 'bg-slate-300'
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

        <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800">
            取消
          </button>
          <button
            onClick={() => onSave(localConfig)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
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
            <label className="block text-sm font-medium text-slate-700 mb-3">
              选择教学法 <span className="text-slate-400 font-normal">(继承自通用版)</span>
            </label>
            <div className="space-y-2">
              {inheritedWorkflows.map((workflow: any) => (
                <label
                  key={workflow.id}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                    localConfig.selectedWorkflowId === workflow.id
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="workflow"
                    checked={localConfig.selectedWorkflowId === workflow.id}
                    onChange={() => setLocalConfig({ ...localConfig, selectedWorkflowId: workflow.id, stagePrompts: {} })}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Route size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-700">{workflow.name}</p>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {workflow.stages?.length || 0} 阶段
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{workflow.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedWorkflow && selectedWorkflow.stages && (
            <div className="border-t border-slate-200 pt-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Sliders size={14} />
                  各阶段提示词微调
                </h3>
                <p className="text-xs text-slate-500 mt-1">可根据课程内容自定义每个阶段的AI指导方式</p>
              </div>

              <div className="space-y-3">
                {selectedWorkflow.stages.map((stage: any, idx: number) => {
                  const customPrompt = localConfig.stagePrompts?.[stage.id] || '';
                  const isExpanded = expandedStage === stage.id;

                  return (
                    <div
                      key={stage.id}
                      className={`rounded-xl border transition-all ${
                        customPrompt ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
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
                            <span className="text-sm font-medium text-slate-700">{stage.name}</span>
                            {customPrompt && (
                              <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded flex items-center gap-1">
                                <Pencil size={10} />
                                已自定义
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{stage.defaultPrompt}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400" />
                        )}
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3">
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Info size={12} className="text-slate-400" />
                              <span className="text-xs text-slate-500">默认提示词</span>
                            </div>
                            <p className="text-sm text-slate-600">{stage.defaultPrompt}</p>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              自定义提示词 <span className="text-slate-400 font-normal">(可选，会追加到默认提示词之后)</span>
                            </label>
                            <textarea
                              value={customPrompt}
                              onChange={(e) => updateStagePrompt(stage.id, e.target.value)}
                              placeholder={`例如：针对"水资源"主题，${stage.name.split(' ')[0]}阶段可以...`}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
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

        <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800">
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
          <div className="w-64 border-r border-slate-200 bg-slate-50 overflow-y-auto p-3 space-y-2">
            {inheritedTemplates.map((tpl: any) => (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedTemplate === tpl.id
                    ? 'bg-white border-2 border-blue-400 shadow-sm'
                    : 'bg-white border border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedTemplate === tpl.id ? 'bg-blue-100' : 'bg-slate-100'
                    }`}
                  >
                    <FileText size={18} className={selectedTemplate === tpl.id ? 'text-blue-600' : 'text-slate-500'} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{tpl.name}</p>
                  </div>
                </div>
                {tpl.structure.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tpl.structure.map((s: string, i: number) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
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
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Eye size={14} />
                模板预览
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="h-32 bg-white border border-slate-200 rounded-lg p-3 flex flex-col">
                  <div className="flex-1 border border-dashed border-slate-300 rounded bg-slate-50 p-2">
                    <p className="text-xs text-slate-400">学生在这里记录笔记...</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Send size={14} className="text-green-600" />
                  启用提交功能
                </span>
                <p className="text-xs text-slate-500 mt-1">学生可一键提交笔记给老师批阅</p>
              </div>
              <button
                onClick={() => setEnableSubmit(!enableSubmit)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  enableSubmit ? 'bg-green-500' : 'bg-slate-300'
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

        <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800">
            取消
          </button>
          <button
            onClick={() => onSave({ noteTemplate: selectedTemplate, enableSubmit })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
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
            <label className="block text-sm font-medium text-slate-700 mb-3">选择监控策略</label>
            <div className="space-y-2">
              {inheritedStrategies.map((strategy: any) => (
                <label
                  key={strategy.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    selectedStrategy === strategy.id
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-white border-slate-200 hover:border-purple-200'
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
                    <p className="text-sm font-medium text-slate-700">{strategy.name}</p>
                    <p className="text-xs text-slate-500">{strategy.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              教师追加指令 <span className="text-slate-400 font-normal">(user_prompt)</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：当学生在视频资源上停留超过5分钟未操作时，提醒他们..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800">
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

        <div className="p-8 bg-slate-50">
          {resource.type === 'video' && (
            <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play size={40} className="text-white ml-1" />
                </div>
                <p className="text-lg font-medium">{resource.title}</p>
                <p className="text-sm text-slate-400 mt-2">时长: {resource.duration}</p>
              </div>
            </div>
          )}

          {(resource.type === 'pdf' || resource.type === 'ppt') && (
            <div className="bg-white rounded-xl border-2 border-slate-200 p-12">
              <div className="text-center">
                <div className={`w-20 h-20 rounded-2xl bg-${resource.color}-100 flex items-center justify-center mx-auto mb-4`}>
                  {resource.type === 'pdf' && <FileText size={40} className={`text-${resource.color}-600`} />}
                  {resource.type === 'ppt' && <FileSpreadsheet size={40} className={`text-${resource.color}-600`} />}
                </div>
                <p className="text-xl font-bold text-slate-700">{resource.title}</p>
                {resource.description && <p className="text-sm text-slate-500 mt-2">{resource.description}</p>}
                <div className="mt-6 inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
                  <FileText size={16} className="text-slate-600" />
                  <span className="text-sm text-slate-700">共 {resource.pages} 页</span>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Eye size={14} />
                    查看文档
                  </button>
                  <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors flex items-center gap-2">
                    <Download size={14} />
                    下载
                  </button>
                </div>
              </div>
            </div>
          )}

          {resource.type === 'web' && (
            <div className="bg-white rounded-xl border-2 border-slate-200 p-12">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Globe size={40} className="text-green-600" />
                </div>
                <p className="text-xl font-bold text-slate-700">{resource.title}</p>
                {resource.description && <p className="text-sm text-slate-500 mt-2">{resource.description}</p>}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">任务标题</label>
              <input
                type="text"
                value={localTask.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                <span className="text-sm text-slate-600">必修任务</span>
              </label>
              {localTask.type === 'quiz' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">及格分:</span>
                  <input
                    type="number"
                    value={localTask.passScore}
                    onChange={(e) => updateField('passScore', parseInt(e.target.value))}
                    className="w-16 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm text-center"
                  />
                </div>
              )}
            </div>

            {localTask.type === 'quiz' && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-700">测验题目</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAIConfig(!showAIConfig)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all flex items-center gap-1"
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
                      <label className="block text-xs font-medium text-slate-700 mb-2">题型选择（可多选）</label>
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
                                : 'bg-white text-slate-600 border border-slate-200'
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
                        <label className="block text-xs font-medium text-slate-700 mb-2">题目数量</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={aiGenConfig.questionCount}
                          onChange={(e) =>
                            setAiGenConfig({ ...aiGenConfig, questionCount: parseInt(e.target.value) || 1 })
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>

                      {/* 难度级别 */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">难度级别</label>
                        <select
                          value={aiGenConfig.difficulty}
                          onChange={(e) =>
                            setAiGenConfig({ ...aiGenConfig, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                          <option value="easy">基础</option>
                          <option value="medium">中等</option>
                          <option value="hard">困难</option>
                        </select>
                      </div>
                    </div>

                    {/* 自定义提示词 */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        自定义生成提示词（可选）
                      </label>
                      <textarea
                        value={aiGenConfig.customPrompt}
                        onChange={(e) => setAiGenConfig({ ...aiGenConfig, customPrompt: e.target.value })}
                        placeholder="例如：请围绕水循环主题，生成适合四年级学生的题目..."
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                        rows={2}
                      />
                    </div>

                    {/* 配置摘要 */}
                    <div className="bg-white/80 rounded-lg p-3 border border-purple-100">
                      <p className="text-xs text-slate-600">
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

                <div className="text-center py-6 text-slate-400">
                  <ListChecks size={24} className="mx-auto mb-2" />
                  <p className="text-xs">配置参数后点击"AI生成题目"，或手动添加题目</p>
                </div>
              </div>
            )}

            {localTask.type === 'assignment' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">作业要求/提示</label>
                  <textarea
                    value={localTask.teacherHint || ''}
                    onChange={(e) => updateField('teacherHint', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    placeholder="请输入作业要求，例如：请结合生活实际，提出至少3条节水建议..."
                  />
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
                        localTask.aiGrading?.enabled ? 'bg-purple-600' : 'bg-slate-300'
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
                                    : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-sm text-slate-800">{agent.name}</h5>
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
                                <p className="text-xs text-slate-600 leading-relaxed">{agent.description}</p>
                                {agent.difyConfig && (
                                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded font-mono">
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

        <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800">
            取消
          </button>
          <button
            onClick={() => onSave(localTask)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
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
    <header className="h-14 bg-slate-800 text-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500 px-3 py-1 rounded font-bold text-sm">学生视角预览</div>
        <span className="text-slate-300">|</span>
        <span className="text-sm text-slate-300">{config.noteInfo.title}</span>
      </div>
      <button
        onClick={onExit}
        className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
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
      <div style={{ width: `${leftWidth}%` }} className="bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FolderOpen size={14} className="text-blue-500" />
            学习资料库
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {config.resources.map((resource: any) => (
            <div
              key={resource.id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg bg-${resource.color}-100 flex items-center justify-center`}>
                {resource.type === 'video' && <Video size={16} className={`text-${resource.color}-600`} />}
                {resource.type === 'pdf' && <FileText size={16} className={`text-${resource.color}-600`} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{resource.title}</p>
                <p className="text-xs text-slate-400">{resource.duration || `${resource.pages}页`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 中间：对话区 */}
      <div style={{ width: `${100 - leftWidth - rightWidth}%` }} className="flex flex-col bg-slate-50">
        <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
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
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm max-w-[80%]">
              <p className="text-sm text-slate-700 leading-relaxed">
                欢迎进入自学模式！今天我们要学习《{config.noteInfo.title}》。有任何问题都可以问我哦！
              </p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-white border-t border-slate-200">
          <div className="relative">
            <input
              type="text"
              placeholder="输入你的问题或想法..."
              disabled
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-400"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 右侧：学习工作室 */}
      <div style={{ width: `${rightWidth}%` }} className="bg-white border-l border-slate-200 flex flex-col">
        <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
            <Layout size={14} className="text-emerald-600" />
            学习工作室
          </h2>
        </div>
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setRightTab('workspace')}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              rightTab === 'workspace' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500'
            }`}
          >
            工作区
          </button>
          <button
            onClick={() => setRightTab('status')}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              rightTab === 'status' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500'
            }`}
          >
            学习状态
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {rightTab === 'workspace' ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-2">康奈尔笔记</span>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 min-h-[180px]">
                  <p className="text-xs text-slate-400">在这里记录笔记...</p>
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
    <header className="h-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between px-6 shrink-0 shadow-lg">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">返回编辑</span>
        </button>
        <div className="w-px h-8 bg-white/20"></div>
        <div>
          <div className="flex items-center gap-2">
            <Eye size={18} />
            <h1 className="text-lg font-bold">使用视角</h1>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">学生体验预览</span>
          </div>
          <p className="text-sm text-emerald-100 mt-0.5">{config.noteInfo.title}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onSwitchToResults}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          <BarChart3 size={16} />
          查看学习数据
        </button>
      </div>
    </header>
  );
}

// Results视角头部 - 学习数据统计
export function ResultsViewHeader({ config, onBack, onSwitchToUse }: any) {
  return (
    <header className="h-16 bg-gradient-to-r from-purple-600 to-violet-600 text-white flex items-center justify-between px-6 shrink-0 shadow-lg">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">返回编辑</span>
        </button>
        <div className="w-px h-8 bg-white/20"></div>
        <div>
          <div className="flex items-center gap-2">
            <Activity size={18} />
            <h1 className="text-lg font-bold">结果视角</h1>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">学习数据分析</span>
          </div>
          <p className="text-sm text-purple-100 mt-0.5">{config.noteInfo.title}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-4 mr-4">
          <div className="text-right">
            <p className="text-xs text-purple-100">绑定学生</p>
            <p className="text-lg font-bold">45人</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-purple-100">平均进度</p>
            <p className="text-lg font-bold">68%</p>
          </div>
        </div>
        <button
          onClick={onSwitchToUse}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
        >
          <Eye size={16} />
          切换到使用视角
        </button>
      </div>
    </header>
  );
}

// Results视角仪表板 - 学习数据展示
export function ResultsViewDashboard({ config }: any) {
  // 模拟学生列表数据
  const mockStudents = [
    { id: 1, name: '张晓明', avatar: '👦', status: 'online', progress: 85, lastActive: '2分钟前' },
    { id: 2, name: '李思琪', avatar: '👧', status: 'online', progress: 92, lastActive: '刚刚' },
    { id: 3, name: '王浩宇', avatar: '👦', status: 'offline', progress: 45, lastActive: '1小时前' },
    { id: 4, name: '刘雨欣', avatar: '👧', status: 'online', progress: 78, lastActive: '5分钟前' },
    { id: 5, name: '陈思远', avatar: '👦', status: 'offline', progress: 60, lastActive: '30分钟前' },
    { id: 6, name: '赵梓涵', avatar: '👧', status: 'online', progress: 95, lastActive: '1分钟前' },
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

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">45</p>
            <p className="text-sm text-slate-500 mt-1">绑定学生总数</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">68%</p>
            <p className="text-sm text-slate-500 mt-1">平均完成进度</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock size={24} className="text-purple-600" />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">42min</p>
            <p className="text-sm text-slate-500 mt-1">平均学习时长</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Target size={24} className="text-amber-600" />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">84.5</p>
            <p className="text-sm text-slate-500 mt-1">平均任务得分</p>
          </div>
        </div>

        {/* 学生列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              学生学习进度
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">学生</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">状态</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">学习进度</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">最后活跃</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{student.avatar}</div>
                        <span className="font-medium text-slate-700">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          student.status === 'online'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            student.status === 'online' ? 'bg-green-500' : 'bg-slate-400'
                          }`}
                        ></span>
                        {student.status === 'online' ? '在线' : '离线'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[120px]">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500">{student.lastActive}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 资源查看统计 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Eye size={18} className="text-emerald-600" />
              资源查看统计
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">资源名称</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">查看人数</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">平均时长</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">完成率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockResourceViews.map((resource: any) => (
                  <tr key={resource.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${resource.color}-100 flex items-center justify-center`}>
                          {resource.type === 'video' && <Video size={16} className={`text-${resource.color}-600`} />}
                          {resource.type === 'pdf' && <FileText size={16} className={`text-${resource.color}-600`} />}
                          {resource.type === 'ppt' && (
                            <FileSpreadsheet size={16} className={`text-${resource.color}-600`} />
                          )}
                        </div>
                        <span className="font-medium text-slate-700">{resource.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-slate-700">{resource.views}/45</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">{resource.avgTime}</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-violet-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle size={18} className="text-purple-600" />
              任务完成统计
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">任务名称</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">类型</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">提交人数</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">平均得分</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">评级分布</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockTaskCompletions.map((task: any) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            task.type === 'quiz' ? 'bg-green-100' : 'bg-blue-100'
                          }`}
                        >
                          {task.type === 'quiz' ? (
                            <Zap size={16} className="text-green-600" />
                          ) : (
                            <FileEdit size={16} className="text-blue-600" />
                          )}
                        </div>
                        <span className="font-medium text-slate-700">{task.title}</span>
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
                      <span className="text-sm font-semibold text-slate-700">{task.submitted}/45</span>
                    </td>
                    <td className="px-5 py-4">
                      {task.avgScore !== null ? (
                        <span className="text-sm font-semibold text-emerald-600">{task.avgScore}分</span>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-600">优</span>
                          <span className="text-xs font-medium text-slate-700">{task.excellent}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-blue-600">良</span>
                          <span className="text-xs font-medium text-slate-700">{task.good}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-amber-600">中</span>
                          <span className="text-xs font-medium text-slate-700">{task.fair}</span>
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
    </div>
  );
}
