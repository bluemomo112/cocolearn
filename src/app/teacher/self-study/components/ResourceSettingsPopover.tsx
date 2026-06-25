'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, X, ChevronDown } from 'lucide-react';
import type { ResourceVisibility } from '@/types/shared-context';

interface ResourceSettingsPopoverProps {
  resource: { id: string; title: string; visibility?: ResourceVisibility };
  tasks: Array<{ id: string; title: string }>;
  onSave: (resourceId: string, visibility: ResourceVisibility) => void;
  onClose: () => void;
}

export default function ResourceSettingsPopover({
  resource,
  tasks,
  onSave,
  onClose,
}: ResourceSettingsPopoverProps) {
  const [visibility, setVisibility] = useState<ResourceVisibility>(
    resource.visibility ?? { mode: 'always' },
  );

  const handleModeChange = (mode: ResourceVisibility['mode']) => {
    setVisibility(mode === 'after_task' ? { mode, afterTaskId: tasks[0]?.id } : { mode });
  };

  const handleSave = () => {
    onSave(resource.id, visibility);
  };

  const radioOptions: { mode: ResourceVisibility['mode']; label: string; icon: React.ReactNode }[] = [
    { mode: 'always', label: '始终可见', icon: <Eye className="w-3.5 h-3.5" /> },
    { mode: 'after_task', label: '完成指定任务后可见', icon: <EyeOff className="w-3.5 h-3.5" /> },
    { mode: 'hidden', label: '隐藏（不对学生展示）', icon: <Lock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[600px] mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 truncate max-w-[300px]">
            资源设置：{resource.title}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
              <Eye className="w-3.5 h-3.5" />
              可见性
            </div>

            {radioOptions.map((opt) => (
              <div key={opt.mode}>
                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleModeChange(opt.mode)}>
                  {/* Custom radio circle */}
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      visibility.mode === opt.mode ? 'border-primary-600' : 'border-gray-300 group-hover:border-gray-400'
                    }`}
                  >
                    {visibility.mode === opt.mode && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                    )}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-700">
                    {opt.icon}
                    {opt.label}
                  </span>
                </label>

                {/* Task selector — shown when after_task is active */}
                {opt.mode === 'after_task' && visibility.mode === 'after_task' && (
                  <div className="ml-8 mt-2 mb-1">
                    <label className="text-xs text-gray-500 mb-1 block">选择任务:</label>
                    <div className="relative">
                      <select
                        value={visibility.afterTaskId ?? ''}
                        onChange={(e) => setVisibility({ mode: 'after_task', afterTaskId: e.target.value })}
                        className="w-full appearance-none text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                      >
                        {tasks.map((t) => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors whitespace-nowrap"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
