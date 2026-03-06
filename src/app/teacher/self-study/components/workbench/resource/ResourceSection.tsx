'use client';

import { Resource } from '@/types/shared-context';
import { LearningMode } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Plus, Upload, Link, Database, Brain, FileText, Video, FileSpreadsheet,
  Globe, X, Eye, Settings as SettingsIcon
} from 'lucide-react';

interface ResourceSectionProps {
  resources: Resource[];
  aiResources?: Array<{ id: string; title: string; type: string; icon: string }>;
  learningMode: LearningMode;
  isAIGenerating?: boolean;
  collapsedPanels: { resources: boolean; tasks: boolean };
  onResourceClick: (resource: Resource) => void;
  onFileUploadOpen: () => void;
  onLinkInputOpen: () => void;
  onKnowledgeBaseOpen: () => void;
  onResourceSettingsClick: (resource: Resource, event: React.MouseEvent) => void;
}

export function ResourceSection({
  resources,
  aiResources = [],
  learningMode,
  isAIGenerating,
  collapsedPanels,
  onResourceClick,
  onFileUploadOpen,
  onLinkInputOpen,
  onKnowledgeBaseOpen,
  onResourceSettingsClick,
}: ResourceSectionProps) {
  const { t } = useLanguage();

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText size={16} className="text-blue-600" />;
      case 'video':
        return <Video size={16} className="text-red-600" />;
      case 'presentation':
        return <FileSpreadsheet size={16} className="text-green-600" />;
      case 'interactive':
        return <Globe size={16} className="text-purple-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  return (
    <div
      className="flex flex-col min-h-0 overflow-hidden"
      style={{
        flex: collapsedPanels.tasks ? '1 1 auto' : '0 0 50%'
      }}
    >
      <div className="p-3 border-b border-gray-100 space-y-2">
        <button
          onClick={onFileUploadOpen}
          className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          {t('添加资料来源')}
        </button>
        <div className="flex gap-2">
          <button
            onClick={onFileUploadOpen}
            className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
          >
            <Upload size={12} />
            {t('上传文件')}
          </button>
          <button
            onClick={onLinkInputOpen}
            className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
          >
            <Link size={12} />
            {t('粘贴链接')}
          </button>
          <button
            onClick={onKnowledgeBaseOpen}
            className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
          >
            <Database size={12} />
            {t('从资源库导入')}
          </button>
        </div>
      </div>

      {isAIGenerating && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <Brain size={14} className="animate-pulse" />
            <span>{t('AI 正在为你生成学习资源...')}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-400 rounded-full transition-all duration-300 animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {learningMode === 'ai_guided' && aiResources.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
              <Brain size={12} />
              {t('AI 推荐资源')}
            </div>
            {aiResources.map((res) => (
              <div
                key={res.id}
                className="p-2 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-lg hover:shadow-md cursor-pointer transition-all mb-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{res.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{res.title}</p>
                    <p className="text-xs text-gray-500">{res.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FileText size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">{t('还没有添加资料')}</p>
            <p className="text-xs text-gray-400">{t('点击上方按钮添加学习资料')}</p>
          </div>
        ) : (
          <>
            <div className="text-xs font-bold text-gray-500 mb-2">{t('我的资料')} ({resources.length})</div>
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="group relative p-2.5 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md cursor-pointer transition-all"
                onClick={() => onResourceClick(resource)}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate mb-0.5">
                      {resource.title}
                    </p>
                    {resource.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{resource.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => onResourceSettingsClick(resource, e)}
                    className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all"
                    title={t('设置')}
                  >
                    <SettingsIcon size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
