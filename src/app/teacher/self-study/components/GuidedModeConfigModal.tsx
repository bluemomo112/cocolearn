'use client';

import { useState, useMemo } from 'react';
import { X, GitBranch, Route, ChevronDown, ChevronUp, Pencil, Info, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMockWorkflows } from '../constants/mockData';

interface GuidedModeConfigModalProps {
  config: {
    selectedWorkflowId: string;
    stagePrompts: Record<string, string>;
  };
  onSave: (config: { selectedWorkflowId: string; stagePrompts: Record<string, string> }) => void;
  onClose: () => void;
}

export default function GuidedModeConfigModal({ config, onSave, onClose }: GuidedModeConfigModalProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const { t } = useLanguage();

  const MOCK_WORKFLOWS = useMemo(() => getMockWorkflows(t), [t]);

  const selectedWorkflow = MOCK_WORKFLOWS.find((w) => w.id === localConfig.selectedWorkflowId);

  const updateStagePrompt = (stageId: string, prompt: string) => {
    setLocalConfig({
      ...localConfig,
      stagePrompts: { ...localConfig.stagePrompts, [stageId]: prompt },
    });
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-[750px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <GitBranch size={20} />
                {t('引导学习模式配置')}
              </h2>
              <p className="text-emerald-100 text-sm mt-1">{t('选择教学法流程，可微调各阶段的AI提示词')}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
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
            <div className="border-t border-gray-200 pt-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Pencil size={14} />
                  {t('各阶段提示词微调')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{t('可根据课程内容自定义每个阶段的AI指导方式')}</p>
              </div>

              <div className="space-y-3">
                {selectedWorkflow.stages.map((stage, idx) => {
                  const customPrompt = localConfig.stagePrompts?.[stage.id] || '';
                  const isExpanded = expandedStage === stage.id;

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
                                {t('已自定义')}
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

                      {/* Expanded content */}
                      {isExpanded && (
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

        {/* Footer buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            {t('取消')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-sm"
          >
            {t('保存')}
          </button>
        </div>
      </div>
    </div>
  );
}
