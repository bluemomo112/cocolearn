'use client';

import { useState, useRef } from 'react';
import {
  SpaceConfig,
  OnboardingState,
  PresetScenario,
  LearningMode,
  PRESET_SCENARIOS,
  LEARNING_MODE_CONFIG,
  createDefaultSpaceConfig,
} from '@/types/self-study';
import {
  Upload,
  Link,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Brain,
  Target,
  X,
  FileText,
  Loader2,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnboardingProps {
  onComplete: (config: SpaceConfig) => void;
  onCancel?: () => void;
}

// Self-directed mode preview component
function SelfDirectedPreview({ topic }: { topic: string }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white overflow-hidden">
      <div className="px-4 py-3 bg-primary-100/50 border-b border-primary-200">
        <span className="text-sm font-medium text-primary-700">💬 {t('自由探索模式预览')}</span>
      </div>
      <div className="p-4 space-y-3">
        {/* AI message */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain size={14} className="text-white" />
          </div>
          <div className="bg-gray-100 rounded-xl rounded-tl-none px-3 py-2 max-w-[85%]">
            <p className="text-sm text-gray-700">
              {t('你好！关于')}「{topic}」{t('，你可以随时问我任何问题。有什么想了解的吗？')}
            </p>
          </div>
        </div>
        {/* User message */}
        <div className="flex justify-end">
          <div className="bg-primary-600 text-white rounded-xl rounded-tr-none px-3 py-2 max-w-[85%]">
            <p className="text-sm">{t('什么是量子纠缠？')}</p>
          </div>
        </div>
        {/* AI response */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain size={14} className="text-white" />
          </div>
          <div className="bg-gray-100 rounded-xl rounded-tl-none px-3 py-2 max-w-[85%]">
            <p className="text-sm text-gray-700">
              {t('量子纠缠是指两个粒子之间存在一种神奇的关联...')}
              <br />
              <span className="text-gray-500">{t('你还想了解哪些方面？')}</span>
            </p>
          </div>
        </div>
        {/* Quick actions */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">{t('快捷操作:')}</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">🔍 {t('搜索概念')}</span>
            <span className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">📋 {t('总结要点')}</span>
            <span className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">💡 {t('举个例子')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// AI-guided mode preview component
function AiGuidedPreview({ topic }: { topic: string }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl border border-accent-200 bg-gradient-to-br from-accent-50 to-white overflow-hidden">
      <div className="px-4 py-3 bg-accent-100/50 border-b border-accent-200">
        <span className="text-sm font-medium text-accent-600">🗺️ {t('AI 自适应学习模式预览')}</span>
      </div>
      <div className="p-4 space-y-4">
        {/* Learning path progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">📊 {t('学习路径 (2/5 已完成)')}</span>
            <span className="text-xs text-accent-600 font-medium">40%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-[40%] bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
          </div>
        </div>
        {/* Learning steps */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-gray-500 line-through">{t('基础概念与定义')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-gray-500 line-through">{t('核心原理解析')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-accent-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-accent-600 font-medium">{t('关键公式与推导')}</span>
            <span className="text-xs text-accent-500 ml-1">← {t('当前')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Circle size={16} className="text-gray-300" />
            <span className="text-gray-400">{t('典型例题分析')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Circle size={16} className="text-gray-300" />
            <span className="text-gray-400">{t('综合应用与拓展')}</span>
          </div>
        </div>
        {/* AI guidance message */}
        <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain size={14} className="text-white" />
          </div>
          <div className="bg-accent-50 rounded-xl rounded-tl-none px-3 py-2 flex-1">
            <p className="text-sm text-gray-700">
              {t('很好！你已经掌握了基础概念。现在让我们来学习')}「{t('关键公式与推导')}」{t('。')}
              <br />
              {t('先看看这个公式：')}<span className="font-mono text-accent-600">E=mc²</span>...
              <br />
              <span className="text-accent-600">{t('你能解释一下这个公式的含义吗？')}</span>
            </p>
          </div>
        </div>
        {/* Quick actions */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">{t('快捷操作:')}</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">🧪 {t('考考我')}</span>
            <span className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">⏭️ {t('下一个知识点')}</span>
            <span className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">🗺️ {t('查看完整路径')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding({ onComplete, onCancel }: OnboardingProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<OnboardingState>({
    step: 'intent',
  });
  const [inputValue, setInputValue] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理主题输入
  const handleTopicSubmit = () => {
    if (!inputValue.trim()) return;
    setState({
      step: 'clarify',
      intent: {
        type: 'topic',
        value: inputValue.trim(),
      },
    });
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(files);
      setState({
        step: 'clarify',
        intent: {
          type: 'resource',
          files,
        },
      });
    }
  };

  // 处理场景选择
  const handleScenarioSelect = (scenario: PresetScenario) => {
    const scenarioConfig = PRESET_SCENARIOS.find(s => s.id === scenario);
    setState({
      step: 'clarify',
      intent: {
        type: 'scenario',
        scenario,
      },
      clarification: {
        learningMode: scenarioConfig?.defaultLearningMode || 'self_directed',
      },
    });
  };

  // 处理学习方式选择
  const handleLearningModeSelect = (mode: LearningMode) => {
    setState(prev => ({
      ...prev,
      clarification: {
        ...prev.clarification,
        learningMode: mode,
      },
    }));
  };

  // 处理水平选择
  const handleLevelSelect = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setState(prev => ({
      ...prev,
      clarification: {
        ...prev.clarification,
        level,
      },
    }));
  };

  // 生成学习空间
  const handleGenerate = async () => {
    setIsGenerating(true);
    setState(prev => ({ ...prev, step: 'generating' }));

    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 创建配置
    const title = state.intent?.type === 'topic'
      ? state.intent.value || t('新学习空间')
      : state.intent?.type === 'scenario'
      ? PRESET_SCENARIOS.find(s => s.id === state.intent?.scenario)?.title || t('新学习空间')
      : uploadedFiles.length > 0
      ? `${t('学习')}: ${uploadedFiles[0].name.replace(/\.[^/.]+$/, '')}`
      : t('新学习空间');

    const config = createDefaultSpaceConfig({
      title,
      topic: state.intent?.value,
      scenario: state.intent?.scenario,
      learningMode: state.clarification?.learningMode || 'self_directed',
      userProfile: {
        level: state.clarification?.level,
        preferences: {
          aiStyle: 'patient',
          knowledgeBoundary: 'moderate',
        },
      },
    });

    setIsGenerating(false);
    onComplete(config);
  };

  // 返回上一步
  const handleBack = () => {
    if (state.step === 'clarify') {
      setState({ step: 'intent' });
      setInputValue('');
      setUploadedFiles([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-6">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* 取消按钮 */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute -top-12 right-0 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
            <span className="text-sm">{t('返回')}</span>
          </button>
        )}

        {/* Step 1: 意图识别 */}
        {state.step === 'intent' && (
          <div className="animate-fade-in">
            {/* 欢迎标题 */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                {t('AI 增强型自学工具')}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {t('你今天想学什么？')}
              </h1>
              <p className="text-gray-600 text-lg">
                {t('输入主题、上传资料，或选择一个学习场景开始')}
              </p>
            </div>

            {/* 主输入框 */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTopicSubmit()}
                  placeholder={t('例如：量子力学基础、Python数据分析、CPA考试复习...')}
                  className="flex-1 text-lg px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleTopicSubmit}
                  disabled={!inputValue.trim()}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {t('开始学习')}
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* 分隔线 */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">{t('或者')}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* 上传和链接按钮 */}
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                  className="hidden"
                  multiple
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-3 px-4 py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all"
                >
                  <Upload size={20} />
                  <span className="font-medium">{t('上传学习资料')}</span>
                </button>
                <button
                  onClick={() => {
                    const url = prompt(t('请输入资料链接：'));
                    if (url) {
                      setState({
                        step: 'clarify',
                        intent: {
                          type: 'resource',
                          value: url,
                        },
                      });
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-3 px-4 py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all"
                >
                  <Link size={20} />
                  <span className="font-medium">{t('导入网页链接')}</span>
                </button>
              </div>
            </div>

            {/* 预设场景卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PRESET_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario.id)}
                  className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all text-left"
                >
                  <div className="text-3xl mb-3">{scenario.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-xs text-gray-500">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 深度了解 */}
        {state.step === 'clarify' && (
          <div className="animate-fade-in">
            {/* 返回按钮 */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-8"
            >
              <ArrowLeft size={18} />
              <span>{t('返回')}</span>
            </button>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {/* 显示用户意图 */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  {state.intent?.type === 'topic' ? (
                    <BookOpen size={24} className="text-primary-600" />
                  ) : state.intent?.type === 'resource' ? (
                    <FileText size={24} className="text-primary-600" />
                  ) : (
                    <Target size={24} className="text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {state.intent?.type === 'topic'
                      ? t('学习主题')
                      : state.intent?.type === 'resource'
                      ? t('学习资料')
                      : t('学习场景')}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {state.intent?.type === 'topic'
                      ? state.intent.value
                      : state.intent?.type === 'resource'
                      ? uploadedFiles.length > 0
                        ? uploadedFiles.map(f => f.name).join(', ')
                        : state.intent.value
                      : PRESET_SCENARIOS.find(s => s.id === state.intent?.scenario)?.title}
                  </p>
                </div>
              </div>

              {/* AI 对话气泡 */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4">
                    <p className="text-gray-700">
                      {state.clarification?.learningMode === 'self_directed'
                        ? t('好的，我会在旁边待命。你可以自由浏览资料，有任何问题随时问我。')
                        : state.clarification?.learningMode === 'ai_guided'
                        ? t('太好了！我会为你规划学习路径。首先让我了解你的基础，然后一步步带你学。')
                        : state.intent?.type === 'resource'
                        ? t('我看到你上传了资料。你希望我怎么帮你？')
                        : state.intent?.type === 'topic'
                        ? `${t('关于')}「${state.intent.value}」${t('，你目前了解多少？')}`
                        : t('你希望以什么方式学习？')}
                    </p>
                  </div>
                  {/* Feature tags - shown when a non-diagnostic mode is selected */}
                  {state.clarification?.learningMode && state.clarification.learningMode !== 'diagnostic' && (
                    <div className="flex items-center gap-2 mt-2 animate-fade-in">
                      {state.clarification.learningMode === 'self_directed' ? (
                        <>
                          <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">📖 {t('自由浏览')}</span>
                          <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">💬 {t('随时提问')}</span>
                          <span className="px-3 py-1 bg-fresh-50 text-fresh-600 rounded-full text-xs font-medium">📝 {t('自主笔记')}</span>
                        </>
                      ) : (
                        <>
                          <span className="px-3 py-1 bg-accent-50 text-accent-600 rounded-full text-xs font-medium">🗺️ {t('学习路径')}</span>
                          <span className="px-3 py-1 bg-accent-50 text-accent-600 rounded-full text-xs font-medium">🧪 {t('随堂检测')}</span>
                          <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">📊 {t('进度追踪')}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 学习方式选择 */}
              <div className="space-y-4 mb-8">
                <p className="text-sm font-medium text-gray-700">{t('选择学习方式：')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(Object.entries(LEARNING_MODE_CONFIG) as [LearningMode, typeof LEARNING_MODE_CONFIG[LearningMode]][]).map(
                    ([mode, config]) => (
                      <button
                        key={mode}
                        onClick={() => handleLearningModeSelect(mode)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          state.clarification?.learningMode === mode
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900 mb-1">{config.label}</p>
                        <p className="text-xs text-gray-500">{config.feeling}</p>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Mock Preview - shown when a non-diagnostic mode is selected */}
              {state.clarification?.learningMode && state.clarification.learningMode !== 'diagnostic' && (
                <div className="mb-8 animate-fade-in">
                  {state.clarification.learningMode === 'self_directed' ? (
                    <SelfDirectedPreview topic={state.intent?.value || '量子力学'} />
                  ) : (
                    <AiGuidedPreview topic={state.intent?.value || '量子力学'} />
                  )}
                </div>
              )}

              {/* 水平选择（仅主题驱动时显示） */}
              {state.intent?.type === 'topic' && (
                <div className="space-y-4 mb-8">
                  <p className="text-sm font-medium text-gray-700">{t('你目前的水平：')}</p>
                  <div className="flex gap-4">
                    {[
                      { value: 'beginner', label: t('完全零基础') },
                      { value: 'intermediate', label: t('知道一些基本概念') },
                      { value: 'advanced', label: t('有一定基础，想深入') },
                    ].map((level) => (
                      <button
                        key={level.value}
                        onClick={() => handleLevelSelect(level.value as 'beginner' | 'intermediate' | 'advanced')}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          state.clarification?.level === level.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 开始按钮 */}
              <button
                onClick={handleGenerate}
                disabled={!state.clarification?.learningMode}
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                {t('生成学习空间')}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 生成中 */}
        {state.step === 'generating' && (
          <div className="animate-fade-in text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 size={40} className="text-primary-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('正在为你准备学习空间...')}
              </h2>
              <p className="text-gray-500">
                {t('AI 正在分析你的需求，生成个性化的学习计划')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
