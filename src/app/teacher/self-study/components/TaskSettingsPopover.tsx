'use client';

import { useState } from 'react';
import { Settings, X, Eye, EyeOff, BookOpen, Monitor, Unlock } from 'lucide-react';
import type { TaskSettings } from '@/types/shared-context';

interface TaskSettingsPopoverProps {
  task: { id: string; title: string; settings?: TaskSettings };
  onSave: (taskId: string, settings: TaskSettings) => void;
  onClose: () => void;
}

function getDefaults(source?: string): Omit<TaskSettings, 'source'> {
  if (source === 'exam_converted') {
    return {
      showAnswersAfterSubmit: false,
      showExplanationsAfterSubmit: false,
      allowRetry: true,
      fullscreenMode: true,
      allowViewResources: false,
    };
  }
  return {
    showAnswersAfterSubmit: true,
    showExplanationsAfterSubmit: true,
    allowRetry: true,
    fullscreenMode: false,
    allowViewResources: true,
  };
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? 'bg-blue-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function TaskSettingsPopover({ task, onSave, onClose }: TaskSettingsPopoverProps) {
  const defaults = getDefaults(task.settings?.source);
  const [settings, setSettings] = useState({
    showAnswersAfterSubmit: task.settings?.showAnswersAfterSubmit ?? defaults.showAnswersAfterSubmit,
    showExplanationsAfterSubmit: task.settings?.showExplanationsAfterSubmit ?? defaults.showExplanationsAfterSubmit,
    allowRetry: task.settings?.allowRetry ?? defaults.allowRetry,
    fullscreenMode: task.settings?.fullscreenMode ?? defaults.fullscreenMode,
    allowViewResources: task.settings?.allowViewResources ?? defaults.allowViewResources,
  });

  const update = (key: keyof typeof settings) => (val: boolean) =>
    setSettings((s) => ({ ...s, [key]: val }));

  const handleSave = () => {
    onSave(task.id, {
      ...settings,
      source: task.settings?.source ?? 'manual',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800 truncate max-w-[280px]">
              任务设置：{task.title}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 答案与解析 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
              <Eye className="w-3.5 h-3.5" />
              答案与解析
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">提交后显示正确答案</span>
              <Toggle checked={settings.showAnswersAfterSubmit} onChange={update('showAnswersAfterSubmit')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">提交后显示解析</span>
              <Toggle checked={settings.showExplanationsAfterSubmit} onChange={update('showExplanationsAfterSubmit')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">允许重做错题</span>
              <Toggle checked={settings.allowRetry} onChange={update('allowRetry')} />
            </div>
          </div>

          {/* 考试模式 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
              <Monitor className="w-3.5 h-3.5" />
              考试模式
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">全屏答题模式</span>
              <Toggle checked={settings.fullscreenMode} onChange={update('fullscreenMode')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-700">允许查看资料</span>
                <span className="text-xs text-gray-400">(开卷)</span>
              </div>
              <Toggle checked={settings.allowViewResources} onChange={update('allowViewResources')} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
