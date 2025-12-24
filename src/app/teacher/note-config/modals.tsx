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
} from 'lucide-react';

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

  if (!task) return null;

  const updateField = (field: string, value: any) => {
    setLocalTask({ ...localTask, [field]: value });
  };

  const generateQuestions = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const generatedQuestions = [
      {
        id: `q_${Date.now()}_1`,
        type: 'choice',
        content: 'AI生成的选择题 1',
        options: ['选项A', '选项B', '选项C'],
        answer: 0,
        aiGenerated: true,
      },
      {
        id: `q_${Date.now()}_2`,
        type: 'choice',
        content: 'AI生成的选择题 2',
        options: ['选项A', '选项B', '选项C'],
        answer: 1,
        aiGenerated: true,
      },
    ];
    updateField('questions', generatedQuestions);
    setIsGenerating(false);
  };

  const GRADING_AGENTS = [
    { id: 'grading_default', name: '通用批改Agent', description: '适用于大多数作业类型' },
    { id: 'grading_creative', name: '创意批改Agent', description: '侧重创新性和独特性评价' },
    { id: 'grading_analytical', name: '分析批改Agent', description: '注重逻辑和论证质量' },
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
                <div className="text-center py-6 text-slate-400">
                  <ListChecks size={24} className="mx-auto mb-2" />
                  <p className="text-xs">点击"AI生成题目"或手动添加题目</p>
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
                        <label className="block text-xs font-medium text-purple-600 mb-1">批改Agent</label>
                        <select
                          value={localTask.aiGrading?.agentId || 'grading_default'}
                          onChange={(e) =>
                            updateField('aiGrading', { ...localTask.aiGrading, agentId: e.target.value })
                          }
                          className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm"
                        >
                          {GRADING_AGENTS.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
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
