'use client';

import { useState } from 'react';
import {
  SpaceSummary,
  PRESET_SCENARIOS,
  LEARNING_MODE_CONFIG,
} from '@/types/self-study';
import {
  Plus,
  Clock,
  BookOpen,
  MoreVertical,
  Trash2,
  Edit,
  FolderOpen,
  Sparkles,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SpaceManagerProps {
  spaces: SpaceSummary[];
  onCreateSpace: () => void;
  onOpenSpace: (spaceId: string) => void;
  onDeleteSpace: (spaceId: string) => void;
}

export default function SpaceManager({
  spaces,
  onCreateSpace,
  onOpenSpace,
  onDeleteSpace,
}: SpaceManagerProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { t } = useLanguage();

  // 格式化时间
  const formatTime = (date?: Date) => {
    if (!date) return t('从未访问');
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} ${t('分钟前')}`;
    if (hours < 24) return `${hours} ${t('小时前')}`;
    if (days < 7) return `${days} ${t('天前')}`;
    return date.toLocaleDateString('zh-CN');
  };

  // 获取场景图标
  const getScenarioIcon = (scenario?: string) => {
    const found = PRESET_SCENARIOS.find(s => s.id === scenario);
    return found?.icon || '📚';
  };

  // 获取学习模式标签
  const getLearningModeLabel = (mode: string) => {
    return LEARNING_MODE_CONFIG[mode as keyof typeof LEARNING_MODE_CONFIG]?.label || mode;
  };

  // 计算统计数据
  const totalSpaces = spaces.length;
  const totalProgress = spaces.reduce((sum, s) => sum + s.progress, 0);
  const avgProgress = totalSpaces > 0 ? Math.round(totalProgress / totalSpaces) : 0;
  const recentSpaces = spaces.filter(s => {
    if (!s.lastAccessedAt) return false;
    const diff = new Date().getTime() - s.lastAccessedAt.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000; // 7天内
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('我的学习空间')}</h1>
            <p className="text-gray-600">{t('管理你的自主学习项目')}</p>
          </div>
          <button
            onClick={onCreateSpace}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
          >
            <Plus size={20} />
            {t('新建学习空间')}
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <FolderOpen size={20} className="text-primary-600" />
              </div>
              <span className="text-sm text-gray-500">{t('学习空间')}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalSpaces}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-accent-600" />
              </div>
              <span className="text-sm text-gray-500">{t('平均进度')}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{avgProgress}%</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-amber-600" />
              </div>
              <span className="text-sm text-gray-500">{t('本周活跃')}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{recentSpaces}</p>
          </div>
        </div>

        {/* 空间列表 */}
        {spaces.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('还没有学习空间')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('创建你的第一个学习空间，开始自主学习之旅')}
            </p>
            <button
              onClick={onCreateSpace}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus size={20} />
              {t('创建学习空间')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 新建卡片 */}
            <button
              onClick={onCreateSpace}
              className="group bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 hover:border-primary-300 hover:bg-primary-50 transition-all flex flex-col items-center justify-center min-h-[240px]"
            >
              <div className="w-14 h-14 bg-gray-100 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <Plus size={28} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <p className="font-medium text-gray-600 group-hover:text-primary-600 transition-colors">
                {t('新建学习空间')}
              </p>
            </button>

            {/* 空间卡片 */}
            {spaces.map((space) => (
              <div
                key={space.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onOpenSpace(space.id)}
              >
                {/* 卡片头部 */}
                <div className="relative h-32 bg-gradient-to-br from-primary-100 to-accent-100 p-4">
                  <div className="absolute top-4 left-4 text-4xl">
                    {getScenarioIcon(space.scenario)}
                  </div>
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === space.id ? null : space.id);
                      }}
                      className="w-8 h-8 bg-white/80 hover:bg-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <MoreVertical size={16} className="text-gray-600" />
                    </button>

                    {/* 下拉菜单 */}
                    {menuOpenId === space.id && (
                      <div className="absolute top-10 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[140px] z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSpace(space.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <BookOpen size={16} />
                          {t('打开')}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(space.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          {t('删除')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 进度条 */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50">
                    <div
                      className="h-full bg-primary-500 transition-all"
                      style={{ width: `${space.progress}%` }}
                    />
                  </div>
                </div>

                {/* 卡片内容 */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {space.title}
                  </h3>
                  {space.topic && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                      {space.topic}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatTime(space.lastAccessedAt)}</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 rounded-lg">
                      {space.progress}% {t('完成')}
                    </span>
                  </div>

                  {/* 学习模式标签 */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs px-2 py-1 bg-primary-50 text-primary-600 rounded-lg">
                      {getLearningModeLabel(space.learningMode)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-fade-in-up">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('确认删除？')}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {t('删除后将无法恢复此学习空间的所有内容。')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                {t('取消')}
              </button>
              <button
                onClick={() => {
                  onDeleteSpace(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                {t('删除')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
