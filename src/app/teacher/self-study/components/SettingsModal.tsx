'use client';

import { useState, useMemo } from 'react';
import { X, Settings2, MessageCircle, GitBranch, Activity, FileEdit, Sliders } from 'lucide-react';
import { SpaceConfig, LearningMode, AIStyle, KnowledgeBoundary, LearningFlow, LEARNING_MODE_CONFIG } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMockAgents, getMockWorkflows, getMockStrategies, getNoteTemplates } from '../constants/mockData';
import FreeModeConfigModal from './FreeModeConfigModal';
import GuidedModeConfigModal from './GuidedModeConfigModal';
import MetaConfigModal from './MetaConfigModal';

interface SettingsModalProps {
  config: SpaceConfig;
  onSave: (config: SpaceConfig) => void;
  onClose: () => void;
}

export default function SettingsModal({ config, onSave, onClose }: SettingsModalProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [showGuidedModal, setShowGuidedModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
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
              <h2 className="text-lg font-semibold text-gray-900">{t('自习室配置')}</h2>
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
                  {/* 自由模式配置 */}
                  <div className="p-4 bg-primary-50/30 rounded-xl border border-primary-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={16} className="text-primary-600" />
                        <span className="text-sm font-medium text-gray-700">{t('自由对话模式')}</span>
                      </div>
                      <button
                        onClick={() => setShowFreeModal(true)}
                        className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        {t('配置 AI 助手')}
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>{t('• 当前助手:')} <span className="font-medium">{selectedAgent?.name || t('未选择')}</span></p>
                      <p>{t('• 知识围栏:')} <span className="font-medium">{localConfig.freeConfig?.enableFence ? t('已启用') : t('未启用')}</span></p>
                    </div>
                  </div>

                  {/* 引导模式配置 */}
                  <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GitBranch size={16} className="text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">{t('引导学习模式')}</span>
                      </div>
                      <button
                        onClick={() => setShowGuidedModal(true)}
                        className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        {t('配置教学法')}
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>{t('• 当前教学法:')} <span className="font-medium">{selectedWorkflow?.name || t('未选择')}</span></p>
                      <p>{t('• 自定义阶段:')} <span className="font-medium">{Object.keys(localConfig.guidedConfig?.stagePrompts || {}).length} {t('个')}</span></p>
                    </div>
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
      {showFreeModal && localConfig.freeConfig && (
        <FreeModeConfigModal
          config={localConfig.freeConfig}
          onSave={(newConfig) => {
            setLocalConfig({ ...localConfig, freeConfig: newConfig });
            setShowFreeModal(false);
          }}
          onClose={() => setShowFreeModal(false)}
        />
      )}

      {showGuidedModal && localConfig.guidedConfig && (
        <GuidedModeConfigModal
          config={localConfig.guidedConfig}
          onSave={(newConfig) => {
            setLocalConfig({ ...localConfig, guidedConfig: newConfig });
            setShowGuidedModal(false);
          }}
          onClose={() => setShowGuidedModal(false)}
        />
      )}

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
