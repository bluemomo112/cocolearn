'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Lock, Unlock, Download, Upload } from 'lucide-react';
import { SpaceConfig, LearningMode, AIStyle, KnowledgeBoundary, LearningFlow, LEARNING_MODE_CONFIG } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';

interface SettingsModalProps {
  config: SpaceConfig;
  onSave: (config: SpaceConfig) => void;
  onClose: () => void;
}

export default function SettingsModal({ config, onSave, onClose }: SettingsModalProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  const [expertModeUnlocked, setExpertModeUnlocked] = useState(false);
  const { t } = useLanguage();

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* 右侧滑出面板 */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('设置')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto">
          {/* 第一层：基础设置 */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('basic')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium text-gray-900">{t('基础设置')}</span>
              {expandedSections.includes('basic') ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </button>
            {expandedSections.includes('basic') && (
              <div className="px-6 pb-4 space-y-4">
                {/* 学习方式 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('学习方式')}</label>
                  <div className="space-y-2">
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
                        <div>
                          <p className="text-sm font-medium text-gray-900">{LEARNING_MODE_CONFIG[mode].label}</p>
                          <p className="text-xs text-gray-500">{LEARNING_MODE_CONFIG[mode].feeling}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

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

                {/* 笔记模板 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('笔记模板')}</label>
                  <select
                    value={localConfig.noteTemplate}
                    onChange={(e) => setLocalConfig({ ...localConfig, noteTemplate: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="blank">{t('空白')}</option>
                    <option value="cornell">{t('康奈尔笔记')}</option>
                    <option value="sky_rain_umbrella">{t('空雨伞')}</option>
                  </select>
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
            )}
          </div>

          {/* 第二层：高级设置 */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('advanced')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{t('高级设置')}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{t('高级')}</span>
              </div>
              {expandedSections.includes('advanced') ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </button>
            {expandedSections.includes('advanced') && (
              <div className="px-6 pb-4 space-y-4">
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
              </div>
            )}
          </div>

          {/* 第三层：专家模式 */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => expertModeUnlocked && toggleSection('expert')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{t('专家模式')}</span>
                {!expertModeUnlocked ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpertModeUnlocked(true); }}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                  >
                    <Lock size={12} />
                    {t('点击解锁')}
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                    <Unlock size={12} />
                    {t('已解锁')}
                  </span>
                )}
              </div>
              {expertModeUnlocked && (expandedSections.includes('expert') ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              ))}
            </button>
            {expertModeUnlocked && expandedSections.includes('expert') && (
              <div className="px-6 pb-4 space-y-4">
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

                {/* 导出/导入 */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                    <Download size={16} />
                    {t('导出配置')}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                    <Upload size={16} />
                    {t('导入配置')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
            {t('取消')}
          </button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
            {t('保存')}
          </button>
        </div>
      </div>
    </>
  );
}
