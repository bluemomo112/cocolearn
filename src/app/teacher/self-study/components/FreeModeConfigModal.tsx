'use client';

import { useState, useMemo } from 'react';
import { X, Bot, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMockAgents } from '../constants/mockData';

interface FreeModeConfigModalProps {
  config: {
    selectedAgentId: string;
    teacherPrompt: string;
    enableFence: boolean;
  };
  onSave: (config: { selectedAgentId: string; teacherPrompt: string; enableFence: boolean }) => void;
  onClose: () => void;
}

export default function FreeModeConfigModal({ config, onSave, onClose }: FreeModeConfigModalProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const { t } = useLanguage();

  const MOCK_AGENTS = useMemo(() => getMockAgents(t), [t]);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-[600px] rounded-2xl shadow-2xl overflow-hidden animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MessageCircle size={20} />
                {t('自由对话模式配置')}
              </h2>
              <p className="text-primary-100 text-sm mt-1">{t('选择 AI 助手并追加教学指令')}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6 space-y-5">
          {/* Agent selection with radio buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('选择 AI 助手')} <span className="text-gray-400 font-normal">({t('继承自通用版')})</span>
            </label>
            <div className="space-y-2">
              {MOCK_AGENTS.map((agent) => (
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

          {/* Teacher prompt textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('教师追加指令')} <span className="text-gray-400 font-normal">(user_prompt)</span>
            </label>
            <textarea
              value={localConfig.teacherPrompt}
              onChange={(e) => setLocalConfig({ ...localConfig, teacherPrompt: e.target.value })}
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
              onClick={() => setLocalConfig({ ...localConfig, enableFence: !localConfig.enableFence })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                localConfig.enableFence ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform absolute top-0.5 ${
                  localConfig.enableFence ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            {t('取消')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-sm"
          >
            {t('保存')}
          </button>
        </div>
      </div>
    </div>
  );
}
