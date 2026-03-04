'use client';

import { useState } from 'react';
import { X, Activity, Brain } from 'lucide-react';
import { MOCK_STRATEGIES } from '../constants/mockData';

interface MetaConfigModalProps {
  config: {
    selectedStrategyId: string;
    teacherPrompt: string;
  };
  onSave: (config: { selectedStrategyId: string; teacherPrompt: string }) => void;
  onClose: () => void;
}

export default function MetaConfigModal({ config, onSave, onClose }: MetaConfigModalProps) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-[500px] rounded-2xl shadow-2xl overflow-hidden animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-500 to-primary-500 text-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity size={20} />
                学情监控配置
              </h2>
              <p className="text-accent-100 text-sm mt-1">选择监控策略并自定义监控指令</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Strategy selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">选择监控策略</label>
            <div className="space-y-2">
              {MOCK_STRATEGIES.map((strategy) => (
                <label
                  key={strategy.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    localConfig.selectedStrategyId === strategy.id
                      ? 'bg-accent-50 border-accent-300'
                      : 'bg-white border-gray-200 hover:border-accent-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="strategy"
                    checked={localConfig.selectedStrategyId === strategy.id}
                    onChange={() => setLocalConfig({ ...localConfig, selectedStrategyId: strategy.id })}
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

          {/* Teacher prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              教师追加指令 <span className="text-gray-400 font-normal">(user_prompt)</span>
            </label>
            <textarea
              value={localConfig.teacherPrompt}
              onChange={(e) => setLocalConfig({ ...localConfig, teacherPrompt: e.target.value })}
              placeholder="例如：当学生在视频资源上停留超过5分钟未操作时，提醒他们..."
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-accent-500 outline-none min-h-[80px] resize-none"
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 font-medium shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}