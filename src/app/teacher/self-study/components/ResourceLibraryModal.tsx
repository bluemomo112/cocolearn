'use client';

import { useState } from 'react';
import { X, Search, FileText, Presentation, Video, Check } from 'lucide-react';
import { Resource } from '@/types/shared-context';
import { mockResources } from '@/data/mockLearningData';

interface ResourceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (resources: Resource[]) => void;
}

export default function ResourceLibraryModal({ isOpen, onClose, onSelect }: ResourceLibraryModalProps) {
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // 模拟混合资料库数据（个人资源 + 共享资源）
  const libraryResources = mockResources.map((resource, index) => ({
    ...resource,
    source: index % 3 === 0 ? 'personal' : 'shared', // 模拟资源来源
  }));

  // 搜索过滤
  const filteredResources = libraryResources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleResource = (resourceId: string) => {
    setSelectedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    const selected = libraryResources.filter(r => selectedResources.has(r.id));
    onSelect(selected);
    setSelectedResources(new Set());
    setSearchQuery('');
  };

  const handleClose = () => {
    setSelectedResources(new Set());
    setSearchQuery('');
    onClose();
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'presentation':
        return Presentation;
      case 'video':
        return Video;
      default:
        return FileText;
    }
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />

      {/* 模态框内容 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[90%] max-w-4xl">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">从资源库选择</h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索资源..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">没有找到相关资源</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredResources.map((resource) => {
                const Icon = getResourceIcon(resource.type);
                const isSelected = selectedResources.has(resource.id);

                return (
                  <button
                    key={resource.id}
                    onClick={() => toggleResource(resource.id)}
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
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          resource.source === 'personal'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-primary-100 text-primary-700'
                        }`}>
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
              })}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            已选择 {selectedResources.size} 个资源
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedResources.size === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              确认选择
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
