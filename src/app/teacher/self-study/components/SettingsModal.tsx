'use client';

import { useState, useMemo } from 'react';
import { X, Settings2, MessageCircle, GitBranch, Activity, FileEdit, Sliders, ChevronDown, ChevronUp, Bot, Route, Pencil, Info, Trash2 } from 'lucide-react';
import { SpaceConfig, LearningMode, AIStyle, KnowledgeBoundary, LearningFlow, LEARNING_MODE_CONFIG } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMockAgents, getMockWorkflows, getMockStrategies, getNoteTemplates } from '../constants/mockData';
import MetaConfigModal from './MetaConfigModal';

interface SettingsModalProps {
  config: SpaceConfig;
  onSave: (config: SpaceConfig) => void;
  onClose: () => void;
}

export default function SettingsModal({ config, onSave, onClose }: SettingsModalProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'free' | 'guided' | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const { t } = useLanguage();

  // 使用 t() 获取国际化后的 mock 数据
  const MOCK_AGENTS = useMemo(() => getMockAgents(t), [t]);
  const MOCK_WORKFLOWS = useMemo(() => getMockWorkflows(t), [t]);
  const MOCK_STRATEGIES = useMemo(() => getMockStrategies(t), [t]);
  const NOTE_TEMPLATES = useMemo(() => getNoteTemplates(t), [t]);

  // Initialize default configs if not present
  if (!localConfig.freeConfig) {
    localConfig.freeConfig = {
      selectedAgentId: MOCK_AGENTS[0].id,
      teacherPrompt: '',
      enableFence: false,
    };
  }
  if (!localConfig.guidedConfig) {
    localConfig.guidedConfig = {
      selectedWorkflowId: MOCK_WORKFLOWS[0].id,
      stagePrompts: {},
    };
  }
  if (!localConfig.metaConfig) {
    localConfig.metaConfig = {
      selectedStrategyId: MOCK_STRATEGIES[1].id,
      teacherPrompt: '',
    };
  }

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const selectedAgent = MOCK_AGENTS.find((a) => a.id === localConfig.freeConfig?.selectedAgentId);
  const selectedWorkflow = MOCK_WORKFLOWS.find((w) => w.id === localConfig.guidedConfig?.selectedWorkflowId);
  const selectedStrategy = MOCK_STRATEGIES.find((s) => s.id === localConfig.metaConfig?.selectedStrategyId);

  const toggleSection = (section: 'free' | 'guided') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const updateStagePrompt = (stageId: string, prompt: string) => {
    setLocalConfig({
      ...localConfig,
      guidedConfig: {
        ...localConfig.guidedConfig!,
        stagePrompts: { ...localConfig.guidedConfig!.stagePrompts, [stageId]: prompt },
      },
    });
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Settings2 size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">{t('自学空间')}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content area - scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">

              {/* 基础配置区 */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-800 mb-4">{t('基础配置')}</h3>
                <div className="space-y-4">
                  {/* 学习方式 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('学习方式')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['self_directed', 'ai_guided'] as LearningMode[]).map(mode => (
                        <label key={mode} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          localConfig.learningMode === mode ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="learningMode"
                            checked={localConfig.learningMode === mode}
                            onChange={() => setLocalConfig({ ...localConfig, learningMode: mode })}
                            className="sr-only"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{t(LEARNING_MODE_CONFIG[mode].label)}</p>
                            <p className="text-xs text-gray-500">{t(LEARNING_MODE_CONFIG[mode].feeling)}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 学习目标 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('学习目标')}</label>
                    <textarea
                      value={localConfig.userProfile.goal || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        userProfile: { ...localConfig.userProfile, goal: e.target.value }
                      })}
                      placeholder={t('例如：通过 CPA 考试')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={2}
                    />
                  </div>
                </div>
              </section>

              {/* AI 交互配置区 */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-800 mb-4">{t('AI 交互配置')}</h3>
                <div className="space-y-4">
                  {/* 自由模式配置 - 手风琴 */}
                  <div className="rounded-xl border border-primary-100 overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 bg-primary-50/30 cursor-pointer hover:bg-primary-50/50 transition-colors"
                      onClick={() => toggleSection('free')}
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle size={16} className="text-primary-600" />
                        <span className="text-sm font-medium text-gray-700">{t('自由对话模式')}</span>
                        <span className="text-xs text-gray-500">— {selectedAgent?.name || t('未选择')}</span>
                      </div>
                      {expandedSection === 'free' ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>

                    {expandedSection === 'free' && (
                      <div className="p-4 border-t border-primary-100 space-y-4">
                        {/* Agent selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            {t('选择 AI 助手')} <span className="text-gray-400 font-normal">({t('继承自通用版')})</span>
                          </label>
                          <div className="space-y-2">
                            {MOCK_AGENTS.map((agent) => (
                              <label
                                key={agent.id}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                                  localConfig.freeConfig?.selectedAgentId === agent.id
                                    ? 'bg-primary-50 border-primary-300'
                                    : 'bg-white border-gray-200 hover:border-primary-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="agent"
                                  checked={localConfig.freeConfig?.selectedAgentId === agent.id}
                                  onChange={() => setLocalConfig({
                                    ...localConfig,
                                    freeConfig: { ...localConfig.freeConfig!, selectedAgentId: agent.id }
                                  })}
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

                        {/* Teacher prompt textarea */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('教师追加指令')} <span className="text-gray-400 font-normal">(user_prompt)</span>
                          </label>
                          <textarea
                            value={localConfig.freeConfig?.teacherPrompt || ''}
                            onChange={(e) => setLocalConfig({
                              ...localConfig,
                              freeConfig: { ...localConfig.freeConfig!, teacherPrompt: e.target.value }
                            })}
                            placeholder={t('例如：请用幽默的口吻回答，所有比喻都和「水」有关...')}
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 outline-none min-h-[80px] resize-none"
                          />
                        </div>

                        {/* Toggle switch for knowledge fence */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <span className="text-sm font-medium text-gray-700">{t('启用知识围栏')}</span>
                            <p className="text-xs text-gray-500">{t('只允许回答与课程资料相关的问题')}</p>
                          </div>
                          <button
                            onClick={() => setLocalConfig({
                              ...localConfig,
                              freeConfig: { ...localConfig.freeConfig!, enableFence: !localConfig.freeConfig?.enableFence }
                            })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${
                              localConfig.freeConfig?.enableFence ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform absolute top-0.5 ${
                                localConfig.freeConfig?.enableFence ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 引导模式配置 - 手风琴 */}
                  <div className="rounded-xl border border-emerald-100 overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 bg-emerald-50/30 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                      onClick={() => toggleSection('guided')}
                    >
                      <div className="flex items-center gap-2">
                        <GitBranch size={16} className="text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">{t('引导学习模式')}</span>
                        <span className="text-xs text-gray-500">— {selectedWorkflow?.name || t('未选择')}</span>
                      </div>
                      {expandedSection === 'guided' ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>

                    {expandedSection === 'guided' && (
                      <div className="p-4 border-t border-emerald-100 space-y-4">
                        {/* Workflow selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            {t('选择教学法')} <span className="text-gray-400 font-normal">({t('继承自通用版')})</span>
                          </label>
                          <div className="space-y-2">
                            {MOCK_WORKFLOWS.map((workflow) => (
                              <label
                                key={workflow.id}
                                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                                  localConfig.guidedConfig?.selectedWorkflowId === workflow.id
                                    ? 'bg-emerald-50 border-emerald-300'
                                    : 'bg-white border-gray-200 hover:border-emerald-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="workflow"
                                  checked={localConfig.guidedConfig?.selectedWorkflowId === workflow.id}
                                  onChange={() => setLocalConfig({
                                    ...localConfig,
                                    guidedConfig: { ...localConfig.guidedConfig!, selectedWorkflowId: workflow.id, stagePrompts: {} }
                                  })}
                                  className="w-4 h-4 text-emerald-600"
                                />
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                  <Route size={18} className="text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-700">{workflow.name}</p>
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                      {workflow.stages?.length || 0} {t('阶段')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">{workflow.description}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Stage-specific prompt customization */}
                        {selectedWorkflow && selectedWorkflow.stages && (
                          <div className="border-t border-gray-200 pt-4">
                            <div className="mb-3">
                              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Pencil size={14} />
                                {t('各阶段提示词微调')}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">{t('可根据课程内容自定义每个阶段的AI指导方式')}</p>
                            </div>

                            <div className="space-y-3">
                              {selectedWorkflow.stages.map((stage, idx) => {
                                const customPrompt = localConfig.guidedConfig?.stagePrompts?.[stage.id] || '';
                                const isStageExpanded = expandedStage === stage.id;

                                return (
                                  <div
                                    key={stage.id}
                                    className={`rounded-xl border transition-all ${
                                      customPrompt ? 'bg-amber-50/50 border-amber-200' : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    {/* Collapsible header */}
                                    <div
                                      className="flex items-center gap-3 p-4 cursor-pointer"
                                      onClick={() => setExpandedStage(isStageExpanded ? null : stage.id)}
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
                                              {t('已自定义')}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{stage.defaultPrompt}</p>
                                      </div>
                                      {isStageExpanded ? (
                                        <ChevronUp size={16} className="text-gray-400" />
                                      ) : (
                                        <ChevronDown size={16} className="text-gray-400" />
                                      )}
                                    </div>

                                    {/* Expanded content */}
                                    {isStageExpanded && (
                                      <div className="px-4 pb-4 space-y-3">
                                        {/* Default prompt display */}
                                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Info size={12} className="text-gray-400" />
                                            <span className="text-xs text-gray-500">{t('默认提示词')}</span>
                                          </div>
                                          <p className="text-sm text-gray-600">{stage.defaultPrompt}</p>
                                        </div>

                                        {/* Custom prompt textarea */}
                                        <div>
                                          <label className="block text-xs font-medium text-gray-600 mb-1">
                                            {t('自定义提示词')} <span className="text-gray-400 font-normal">({t('可选，会追加到默认提示词之后')})</span>
                                          </label>
                                          <textarea
                                            value={customPrompt}
                                            onChange={(e) => updateStagePrompt(stage.id, e.target.value)}
                                            placeholder={t('例如：针对特定主题，') + stage.name.split(' ')[0] + t('阶段可以...')}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                            rows={3}
                                          />
                                        </div>

                                        {/* Clear button */}
                                        {customPrompt && (
                                          <button
                                            onClick={() => updateStagePrompt(stage.id, '')}
                                            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                                          >
                                            <Trash2 size={10} />
                                            {t('清除自定义')}
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
                    )}
                  </div>
                </div>
              </section>

              {/* 笔记与监控配置区 */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-800 mb-4">{t('笔记与监控配置')}</h3>
                <div className="space-y-4">
                  {/* 笔记模板 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FileEdit size={14} className="text-primary-500" />
                      {t('笔记模板')}
                    </label>
                    <select
                      value={localConfig.noteTemplate}
                      onChange={(e) => setLocalConfig({ ...localConfig, noteTemplate: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {NOTE_TEMPLATES.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} - {template.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* AI 监控配置 */}
                  <div className="p-4 bg-accent-50/30 rounded-xl border border-accent-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-accent-600" />
                        <span className="text-sm font-medium text-gray-700">{t('学情监控 (元认知)')}</span>
                      </div>
                      <button
                        onClick={() => setShowMetaModal(true)}
                        className="text-xs px-3 py-1.5 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
                      >
                        {t('配置监控')}
                      </button>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>{t('• 监控策略:')} <span className="font-medium">{selectedStrategy?.name || t('未选择')}</span></p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 高级配置区 */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Sliders size={16} className="text-gray-600" />
                  <h3 className="text-base font-bold text-gray-800">{t('高级配置')}</h3>
                </div>
                <div className="space-y-4">
                  {/* AI 风格 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('AI 风格')}</label>
                    <select
                      value={localConfig.userProfile.preferences?.aiStyle || 'patient'}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        userProfile: {
                          ...localConfig.userProfile,
                          preferences: { aiStyle: e.target.value as AIStyle, knowledgeBoundary: localConfig.userProfile.preferences?.knowledgeBoundary || 'moderate', ...localConfig.userProfile.preferences }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="patient">{t('耐心解释型')}</option>
                      <option value="socratic">{t('启发提问型')}</option>
                      <option value="challenging">{t('挑战辩论型')}</option>
                    </select>
                  </div>

                  {/* 知识边界 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('知识边界')}</label>
                    <select
                      value={localConfig.userProfile.preferences?.knowledgeBoundary || 'moderate'}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        userProfile: {
                          ...localConfig.userProfile,
                          preferences: { aiStyle: localConfig.userProfile.preferences?.aiStyle || 'patient', knowledgeBoundary: e.target.value as KnowledgeBoundary, ...localConfig.userProfile.preferences }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="strict">{t('只基于我的资料')}</option>
                      <option value="moderate">{t('适度扩展')}</option>
                      <option value="free">{t('自由发挥')}</option>
                    </select>
                  </div>

                  {/* 能力追踪维度 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('能力追踪维度')}</label>
                    <div className="space-y-2">
                      {['critical_thinking', 'information_synthesis', 'metacognition'].map(dim => (
                        <label key={dim} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={localConfig.competencyDimensions.includes(dim as any)}
                            onChange={(e) => {
                              const dims = e.target.checked
                                ? [...localConfig.competencyDimensions, dim as any]
                                : localConfig.competencyDimensions.filter(d => d !== dim);
                              setLocalConfig({ ...localConfig, competencyDimensions: dims });
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">
                            {dim === 'critical_thinking' ? t('批判性思维') : dim === 'information_synthesis' ? t('信息整合') : t('元认知')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 学习流程 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('学习流程')}</label>
                    <select
                      value={localConfig.userProfile.preferences?.learningFlow || 'custom'}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        userProfile: {
                          ...localConfig.userProfile,
                          preferences: { aiStyle: localConfig.userProfile.preferences?.aiStyle || 'patient', knowledgeBoundary: localConfig.userProfile.preferences?.knowledgeBoundary || 'moderate', ...localConfig.userProfile.preferences, learningFlow: e.target.value as LearningFlow }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="5E">{t('5E 教学法')}</option>
                      <option value="PBL">{t('PBL 问题式学习')}</option>
                      <option value="feynman">{t('费曼技巧')}</option>
                      <option value="custom">{t('自定义')}</option>
                    </select>
                  </div>

                  {/* 自定义 AI 指令 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('自定义 AI 指令')}</label>
                    <textarea
                      value={localConfig.userProfile.customInstructions || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        userProfile: { ...localConfig.userProfile, customInstructions: e.target.value }
                      })}
                      placeholder={t('输入自定义指令...')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={4}
                    />
                  </div>
                </div>
              </section>

            </div>
          </div>

          {/* Footer buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
            <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
              {t('取消')}
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
              {t('保存')}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {showMetaModal && localConfig.metaConfig && (
        <MetaConfigModal
          config={localConfig.metaConfig}
          onSave={(newConfig) => {
            setLocalConfig({ ...localConfig, metaConfig: newConfig });
            setShowMetaModal(false);
          }}
          onClose={() => setShowMetaModal(false)}
        />
      )}
    </>
  );
}
