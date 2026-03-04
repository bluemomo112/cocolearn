'use client';

import { useState, useMemo } from 'react';
import { X, Search, CheckSquare, Square, FileText, Presentation, Video, Check, Globe, BookOpen, ClipboardList, FileEdit, Monitor } from 'lucide-react';
import { Resource } from '@/types/shared-context';
import { mockResources } from '@/data/mockLearningData';
import type { ErrorQuestion, HistoricalTest, Note, InteractiveWebpage } from '@/data/mockKnowledgeBase';
import { mockErrorQuestions, mockHistoricalTests, mockNotes, mockInteractiveWebpages } from '@/data/mockKnowledgeBase';

interface UnifiedResourceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportResources?: (resources: Resource[]) => void;
  onImportErrorQuestions?: (questions: ErrorQuestion[]) => void;
  onImportHistoricalTest?: (testRecord: HistoricalTest) => void;
  onImportNotes?: (notes: Note[]) => void;
  onImportWebpages?: (webpages: InteractiveWebpage[]) => void;
}

type TabType = 'resources' | 'error_questions' | 'historical_tests' | 'notes' | 'webpages';

// 题型映射
const QUESTION_TYPE_MAP: Record<string, string> = {
  'single_choice': '单选',
  'multiple_choice': '多选',
  'fill_in_blank': '填空',
  'true_false': '判断'
};

export default function UnifiedResourceLibraryModal({
  isOpen,
  onClose,
  onImportResources,
  onImportErrorQuestions,
  onImportHistoricalTest,
  onImportNotes,
  onImportWebpages
}: UnifiedResourceLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('resources');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  // 获取所有标签（用于错题本筛选）
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    mockErrorQuestions.forEach(eq => {
      eq.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  // 过滤后的学习资料
  const filteredResources = useMemo(() => {
    const libraryResources = mockResources.map((resource, index) => ({
      ...resource,
      source: index % 3 === 0 ? 'personal' : 'shared',
    }));

    return libraryResources.filter(resource =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // 过滤后的错题
  const filteredErrorQuestions = useMemo(() => {
    return mockErrorQuestions.filter(eq => {
      if (searchQuery && !eq.question.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterType !== 'all' && eq.question.type !== filterType) {
        return false;
      }
      if (filterTag !== 'all' && !eq.tags?.includes(filterTag)) {
        return false;
      }
      return true;
    });
  }, [searchQuery, filterType, filterTag]);

  // 过滤后的历史测验
  const filteredHistoricalTests = useMemo(() => {
    return mockHistoricalTests.filter(test =>
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // 过滤后的笔记
  const filteredNotes = useMemo(() => {
    return mockNotes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  // 过滤后的互动网页
  const filteredWebpages = useMemo(() => {
    return mockInteractiveWebpages.filter(webpage =>
      webpage.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webpage.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webpage.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

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
    let items: any[] = [];
    switch (activeTab) {
      case 'resources':
        items = filteredResources;
        break;
      case 'error_questions':
        items = filteredErrorQuestions;
        break;
      case 'notes':
        items = filteredNotes;
        break;
      case 'webpages':
        items = filteredWebpages;
        break;
    }

    if (selectedIds.size === items.length && items.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id)));
    }
  };

  // 导入选中内容
  const handleImport = () => {
    switch (activeTab) {
      case 'resources':
        if (onImportResources) {
          const selected = filteredResources
            .filter(r => selectedIds.has(r.id))
            .map(r => ({ ...r, source: 'teacher' as const }));
          onImportResources(selected);
        }
        break;
      case 'error_questions':
        if (onImportErrorQuestions) {
          const selected = mockErrorQuestions.filter(eq => selectedIds.has(eq.id));
          onImportErrorQuestions(selected);
        }
        break;
      case 'historical_tests':
        if (onImportHistoricalTest && selectedIds.size > 0) {
          const selectedId = Array.from(selectedIds)[0];
          const selectedTest = mockHistoricalTests.find(t => t.id === selectedId);
          if (selectedTest) {
            onImportHistoricalTest(selectedTest);
          }
        }
        break;
      case 'notes':
        if (onImportNotes) {
          const selected = mockNotes.filter(note => selectedIds.has(note.id));
          onImportNotes(selected);
        }
        break;
      case 'webpages':
        if (onImportWebpages) {
          const selected = mockInteractiveWebpages.filter(wp => selectedIds.has(wp.id));
          onImportWebpages(selected);
        }
        break;
    }
    handleClose();
  };

  // 关闭弹窗
  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    setFilterType('all');
    setFilterTag('all');
    onClose();
  };

  // 切换标签页时重置选择
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedIds(new Set());
    setSearchQuery('');
    setFilterType('all');
    setFilterTag('all');
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'presentation':
        return Presentation;
      case 'video':
        return Video;
      case 'interactive':
        return Globe;
      default:
        return FileText;
    }
  };

  const getWebpageTypeLabel = (type: string) => {
    switch (type) {
      case 'simulation':
        return '虚拟仿真';
      case 'visualization':
        return '可视化';
      case 'game':
        return '游戏';
      case 'tool':
        return '工具';
      default:
        return '其他';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />

      {/* 模态框内容 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[90%] max-w-4xl max-h-[85vh] flex flex-col">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900">资源库</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 标签页 */}
        <div className="px-6 pt-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex gap-6">
            <button
              onClick={() => handleTabChange('resources')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'resources'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen size={16} />
              学习资料
            </button>
            <button
              onClick={() => handleTabChange('error_questions')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'error_questions'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardList size={16} />
              错题本
            </button>
            <button
              onClick={() => handleTabChange('historical_tests')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'historical_tests'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText size={16} />
              历史测验
            </button>
            <button
              onClick={() => handleTabChange('notes')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'notes'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileEdit size={16} />
              笔记
            </button>
            <button
              onClick={() => handleTabChange('webpages')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'webpages'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Monitor size={16} />
              互动网页
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* 搜索和筛选 */}
            <div className="mb-4 space-y-3">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'resources' ? '搜索资源...' :
                    activeTab === 'error_questions' ? '搜索题目内容...' :
                    activeTab === 'historical_tests' ? '搜索测验...' :
                    activeTab === 'notes' ? '搜索笔记...' :
                    '搜索互动网页...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 错题本的筛选器 */}
              {activeTab === 'error_questions' && (
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
              )}
            </div>

            {/* 全选按钮（历史测验除外） */}
            {activeTab !== 'historical_tests' && (
              <div className="mb-3 flex items-center gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  {(() => {
                    let itemCount = 0;
                    switch (activeTab) {
                      case 'resources':
                        itemCount = filteredResources.length;
                        break;
                      case 'error_questions':
                        itemCount = filteredErrorQuestions.length;
                        break;
                      case 'notes':
                        itemCount = filteredNotes.length;
                        break;
                      case 'webpages':
                        itemCount = filteredWebpages.length;
                        break;
                    }
                    return selectedIds.size === itemCount && itemCount > 0 ? (
                      <CheckSquare className="w-4 h-4 text-primary-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    );
                  })()}
                  <span>全选</span>
                </button>
              </div>
            )}

            {/* 学习资料列表 */}
            {activeTab === 'resources' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredResources.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-gray-400">
                    <p>没有找到相关资源</p>
                  </div>
                ) : (
                  filteredResources.map((resource) => {
                    const Icon = getResourceIcon(resource.type);
                    const isSelected = selectedIds.has(resource.id);

                    return (
                      <button
                        key={resource.id}
                        onClick={() => toggleSelection(resource.id)}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${
                          isSelected ? 'bg-primary-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isSelected ? 'text-primary-600' : 'text-gray-600'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {resource.title}
                            </h4>
                            {isSelected && (
                              <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {resource.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                              {resource.source === 'personal' ? '我的资源' : '共享资源'}
                            </span>
                            {resource.duration && (
                              <span className="text-xs text-gray-500">
                                {resource.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* 错题本列表 */}
            {activeTab === 'error_questions' && (
              <div className="space-y-2">
                {filteredErrorQuestions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>暂无符合条件的错题</p>
                  </div>
                ) : (
                  filteredErrorQuestions.map(eq => (
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
                        <div className="mt-0.5">
                          {selectedIds.has(eq.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

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
            )}

            {/* 历史测验列表 */}
            {activeTab === 'historical_tests' && (
              <div className="space-y-3">
                {filteredHistoricalTests.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>没有找到相关测验</p>
                  </div>
                ) : (
                  filteredHistoricalTests.map(test => (
                    <div
                      key={test.id}
                      onClick={() => {
                        setSelectedIds(new Set([test.id]));
                      }}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedIds.has(test.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedIds.has(test.id)
                              ? 'border-primary-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedIds.has(test.id) && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-2">{test.title}</div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            <span>📅 {test.date}</span>
                            <span>📊 {test.score}/{test.totalScore}</span>
                            <span>✅ {test.correctCount}/{test.questionCount} 题</span>
                            {test.subject && <span>📚 {test.subject}</span>}
                            {test.duration && <span>⏱️ {test.duration}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 笔记列表 */}
            {activeTab === 'notes' && (
              <div className="space-y-3">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>没有找到相关笔记</p>
                  </div>
                ) : (
                  filteredNotes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => toggleSelection(note.id)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedIds.has(note.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {selectedIds.has(note.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            {note.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {note.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {note.tags?.map(tag => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                {tag}
                              </span>
                            ))}
                            <span className="text-xs text-gray-500">
                              {note.updatedDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 互动网页列表 */}
            {activeTab === 'webpages' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredWebpages.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-gray-400">
                    <p>没有找到相关互动网页</p>
                  </div>
                ) : (
                  filteredWebpages.map(webpage => {
                    const isSelected = selectedIds.has(webpage.id);

                    return (
                      <button
                        key={webpage.id}
                        onClick={() => toggleSelection(webpage.id)}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${
                          isSelected ? 'bg-primary-100' : 'bg-gray-100'
                        }`}>
                          <Globe className={`w-5 h-5 ${
                            isSelected ? 'text-primary-600' : 'text-gray-600'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {webpage.title}
                            </h4>
                            {isSelected && (
                              <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {webpage.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              {getWebpageTypeLabel(webpage.type)}
                            </span>
                            {webpage.duration && (
                              <span className="text-xs text-gray-500">
                                {webpage.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-600">
            {activeTab === 'historical_tests'
              ? selectedIds.size > 0 ? '已选择 1 条测验记录' : '请选择一条测验记录'
              : `已选择 ${selectedIds.size} 项`
            }
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
              导入选中内容
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

