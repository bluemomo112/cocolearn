'use client';

import { useState } from 'react';
import { X, FileText, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExamProcessingConfig } from './task/taskTypes';

interface ExamDetectedModalProps {
  files: File[];
  onConfirm: (config: ExamProcessingConfig) => void;
  onCancel: () => void;
}

export default function ExamDetectedModal({ files, onConfirm, onCancel }: ExamDetectedModalProps) {
  const isBatch = files.length > 1;
  const { t } = useLanguage();

  const [mode, setMode] = useState<ExamProcessingConfig['mode']>('exact_extract');
  const [batchMode, setBatchMode] = useState<ExamProcessingConfig['batchMode']>('separate');
  const [includeHandwriting, setIncludeHandwriting] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm({
      mode,
      ...(isBatch ? { batchMode } : {}),
      includeHandwriting,
      files,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {isBatch ? t('检测到多份试卷文件') : t('检测到试卷文件')}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* File info */}
          {isBatch ? (
            <BatchFileList files={files} t={t} />
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>📄</span>
              <span className="truncate">{files[0]?.name}</span>
            </div>
          )}

          {/* Batch mode selection */}
          {isBatch && (
            <>
              <p className="text-sm font-medium text-gray-700">{t('这些文件看起来是：')}</p>
              <div className="border border-gray-200 rounded-xl p-1 space-y-0.5">
                <RadioItem
                  selected={batchMode === 'separate'}
                  onSelect={() => setBatchMode('separate')}
                  label={t('不同的试卷')}
                  description={t('每份分别生成一个学习任务')}
                />
                <RadioItem
                  selected={batchMode === 'same_exam_multi_student'}
                  onSelect={() => setBatchMode('same_exam_multi_student')}
                  label={t('同一试卷的多份学生答卷')}
                  description={t('提取统一题干 + 各学生答题结果\n→ 题干作为资源\n→ 每份答卷标记为"张三的答题结果"')}
                />
                <RadioItem
                  selected={batchMode === 'merge'}
                  onSelect={() => setBatchMode('merge')}
                  label={t('合并为一份')}
                  description={t('将所有内容合并为一个学习任务')}
                />
              </div>
            </>
          )}

          {/* Processing mode */}
          <p className="text-sm font-medium text-gray-700">
            {isBatch ? t('处理方式：') : t('请选择处理方式：')}
          </p>
          {isBatch ? (
            <div className="flex items-center gap-4">
              <InlineRadio selected={mode === 'exact_extract'} onSelect={() => setMode('exact_extract')} label={t('精确提取')} />
              <InlineRadio selected={mode === 'extract_and_regenerate'} onSelect={() => setMode('extract_and_regenerate')} label={t('提取并重新生成')} />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-1 space-y-0.5">
              <RadioItem
                selected={mode === 'exact_extract'}
                onSelect={() => setMode('exact_extract')}
                label={t('精确提取')}
                description={t('原样提取题目，保持内容不变')}
              />
              <RadioItem
                selected={mode === 'extract_and_regenerate'}
                onSelect={() => setMode('extract_and_regenerate')}
                label={t('提取并重新生成')}
                description={t('提取题目后生成相似的新题目（适合用作练习/复习）')}
              />
            </div>
          )}

          {/* Advanced options */}
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>{t('⚙️ 高级选项')}</span>
            {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {advancedOpen && (
            <div className="pl-1">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeHandwriting}
                  onChange={(e) => setIncludeHandwriting(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{t('包含手写批注/答案识别')}</span>
                  <p className="text-xs text-gray-500">{t('（识别学生手写的答题内容）')}</p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="border border-gray-300 text-gray-700 rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {t('取消')}
          </button>
          <button
            onClick={handleConfirm}
            className="bg-primary-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            {t('开始转换')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function BatchFileList({ files, t }: { files: File[]; t: (text: string) => string }) {
  return (
    <div className="space-y-1.5">
      <div className="space-y-1 max-h-28 overflow-y-auto">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <span>📄</span>
            <span className="truncate">{f.name}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">{t('共')} {files.length} {t('份文件')}</p>
    </div>
  );
}

function RadioItem({
  selected,
  onSelect,
  label,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
        selected ? 'bg-primary-50' : 'hover:bg-gray-50'
      }`}
    >
      <span
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? 'border-primary-600' : 'border-gray-300'
        }`}
      >
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 whitespace-pre-line">{description}</p>
      </div>
    </button>
  );
}

function InlineRadio({
  selected,
  onSelect,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button onClick={onSelect} className="flex items-center gap-2 text-sm text-gray-700">
      <span
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? 'border-primary-600' : 'border-gray-300'
        }`}
      >
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
      </span>
      {label}
    </button>
  );
}
