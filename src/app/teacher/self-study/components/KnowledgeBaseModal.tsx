'use client';

import { useState, useMemo } from 'react';
import { X, Search, CheckSquare, Square } from 'lucide-react';
import type { ErrorQuestion } from '@/data/mockKnowledgeBase';
import { mockErrorQuestions } from '@/data/mockKnowledgeBase';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: ErrorQuestion[]) => void;
}

// 题型映射
const QUESTION_TYPE_MAP: Record<string, string> = {
  'single_choice': '单选',
  'multiple_choice': '多选',
  'fill_in_blank': '填空',
  'true_false': '判断'
};

export default function KnowledgeBaseModal({
  isOpen,
  onClose,
  onImport
}: KnowledgeBaseModalProps) {
  const [activeTab, setActiveTab] = useState<'error_questions' | 'notes' | 'saved_resources' | 'shared'>('error_questions');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  // 使用 mock 数据
  const [errorQuestions] = useState<ErrorQuestion[]>(mockErrorQuestions);

  // 获取所有标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    errorQuestions.forEach(eq => {
      eq.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [errorQuestions]);

  // 过滤后的题目列表
  const filteredQuestions = useMemo(() => {
    return errorQuestions.filter(eq => {
      // 搜索过滤
      if (searchQuery && !eq.question.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // 题型过滤
      if (filterType !== 'all' && eq.question.type !== filterType) {
        return false;
      }
      // 标签过滤
      if (filterTag !== 'all' && !eq.tags?.includes(filterTag)) {
        return false;
      }
      return true;
    });
  }, [errorQuestions, searchQuery, filterType, filterTag]);

  // 切换选择
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  // 导入选中题目
  const handleImport = () => {
    const selected = errorQuestions.filter(eq => selectedIds.has(eq.id));
    onImport(selected);
    setSelectedIds(new Set());
    setSearchQuery('');
    setFilterType('all');
    setFilterTag('all');
  };

  // 关闭弹窗
  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    setFilterType('all');
    setFilterTag('all');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />

      {/* 模态框内容 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[90%] max-w-3xl">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">从知识库导入</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 标签页 */}
        <div className="px-6 pt-4 border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('error_questions')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'error_questions'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-400 cursor-not-allowed'
              }`}
            >
              错题本
            </button>
            <button
              disabled
              className="pb-3 px-1 text-sm font-medium border-b-2 border-transparent text-gray-300 cursor-not-allowed"
            >
              笔记
            </button>
            <button
              disabled
              className="pb-3 px-1 text-sm font-medium border-b-2 border-transparent text-gray-300 cursor-not-allowed"
            >
              收藏的资料
            </button>
            <button
              disabled
              className="pb-3 px-1 text-sm font-medium border-b-2 border-transparent text-gray-300 cursor-not-allowed"
            >
              他人分享的
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* 搜索和筛选 */}
          <div className="mb-4 space-y-3">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索题目内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* 筛选器 */}
            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部题型</option>
                <option value="single_choice">单选题</option>
                <option value="multiple_choice">多选题</option>
                <option value="fill_in_blank">填空题</option>
                <option value="true_false">判断题</option>
              </select>

              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部标签</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 全选 */}
          {filteredQuestions.length > 0 && (
            <div className="mb-3 flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {selectedIds.size === filteredQuestions.length ? (
                  <CheckSquare className="w-4 h-4 text-primary-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>全选</span>
              </button>
            </div>
          )}

          {/* 题目列表 */}
          <div className="space-y-2">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>暂无符合条件的错题</p>
              </div>
            ) : (
              filteredQuestions.map(eq => (
                <div
                  key={eq.id}
                  onClick={() => toggleSelection(eq.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedIds.has(eq.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* 复选框 */}
                    <div className="mt-0.5">
                      {selectedIds.has(eq.id) ? (
                        <CheckSquare className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* 题目内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          {QUESTION_TYPE_MAP[eq.question.type]}
                        </span>
                        <span className="text-sm text-gray-900 truncate">
                          {eq.question.content.length > 50
                            ? eq.question.content.substring(0, 50) + '...'
                            : eq.question.content}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        错误日期: {eq.attemptDate} · 订正: {eq.correctionCount}次
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            已选择 {selectedIds.size} 道题目
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleImport}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              导入选中题目
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

