'use client';

import { LearningMode, LearningPathNode } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Activity, Map, CheckCircle2, Circle, Award, TrendingUp, Sparkles
} from 'lucide-react';

interface LearningStatusPanelProps {
  elapsedTime: number;
  learningMode: LearningMode;
  learningPath: LearningPathNode[];
  observations: Array<{ 
    id: string; 
    type: 'praise' | 'suggestion' | 'insight'; 
    icon: string; 
    message: string; 
    timestamp: Date 
  }>;
}

export function LearningStatusPanel({
  elapsedTime,
  learningMode,
  learningPath,
  observations,
}: LearningStatusPanelProps) {
  const { t } = useLanguage();
  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} ${t('分钟')}`;
  };

  const masteredCount = learningPath.filter((n) => n.status === 'mastered').length;
  const totalCount = learningPath.length;
  const progressPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // 简化版能力画像数据
  const competencies = [
    { name: t('批判性思维'), value: 65, color: 'primary' },
    { name: t('信息整合'), value: 72, color: 'emerald' },
    { name: t('元认知'), value: 58, color: 'amber' },
  ];

  // 当前学习节点
  const currentNode = learningPath.find((n) => n.status === 'learning');

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* 学习概况 */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-4 border border-primary-100">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} className="text-primary-600" />
          <span className="text-xs font-bold text-primary-700">{t('学习概况')}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">{formatMinutes(elapsedTime)}</div>
            <div className="text-xs text-gray-500">{t('学习时长')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">{masteredCount}/{totalCount}</div>
            <div className="text-xs text-gray-500">{t('已掌握概念')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-fresh-600">{progressPercent}%</div>
            <div className="text-xs text-gray-500">{t('完成进度')}</div>
          </div>
        </div>
      </div>

      {/* 学习路径 - 仅AI引导模式显示 */}
      {learningMode === 'ai_guided' && (
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Map size={14} className="text-primary-600" />
              <span className="text-xs font-bold text-primary-700">{t('学习路径')}</span>
            </div>
            <span className="text-xs text-primary-600">
              <Activity size={10} className="inline animate-pulse mr-1" />
              {t('AI 动态规划')}
            </span>
          </div>
          <div className="space-y-2">
            {learningPath.map((node, idx) => (
              <div
                key={node.id}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                  node.status === 'learning'
                    ? 'bg-primary-100 border border-primary-300'
                    : node.status === 'mastered'
                    ? 'bg-white/60 border border-primary-100'
                    : 'bg-white/40 border border-gray-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    node.status === 'mastered'
                      ? 'bg-primary-500'
                      : node.status === 'learning'
                      ? 'bg-primary-500'
                      : 'bg-gray-300'
                  }`}
                >
                  {node.status === 'mastered' ? (
                    <CheckCircle2 size={12} className="text-white" />
                  ) : node.status === 'learning' ? (
                    <Circle size={12} className="text-white" />
                  ) : (
                    <span className="text-xs text-white font-medium">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${
                      node.status === 'mastered'
                        ? 'text-primary-700 line-through'
                        : node.status === 'learning'
                        ? 'text-primary-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {node.title}
                  </p>
                  {node.estimatedTime && node.status !== 'mastered' && (
                    <p className="text-xs text-gray-400">{t('预计')} {node.estimatedTime} {t('分钟')}</p>
                  )}
                </div>
                {node.status === 'learning' && (
                  <span className="text-xs bg-primary-200 text-primary-700 px-1.5 py-0.5 rounded-full font-medium animate-pulse">
                    {t('当前')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 能力画像 */}
      <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-4 border border-accent-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-accent-600" />
            <span className="text-xs font-bold text-accent-600">{t('能力画像')}</span>
          </div>
          <span className="text-xs text-accent-600">
            <TrendingUp size={10} className="inline mr-1" />
            {t('实时更新')}
          </span>
        </div>
        <div className="space-y-3">
          {competencies.map((comp) => (
            <div key={comp.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{comp.name}</span>
                <span className="text-xs font-medium text-gray-700">{comp.value}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${comp.color}-500 rounded-full transition-all`}
                  style={{ width: `${comp.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI 观察记录 */}
      <div className="bg-gradient-to-br from-accent-50 to-primary-50 rounded-lg p-4 border border-accent-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-accent-600" />
          <span className="text-xs font-bold text-accent-700">{t('AI 观察记录')}</span>
        </div>
        <div className="space-y-2">
          {observations.slice(0, 3).map((obs) => (
            <div key={obs.id} className="bg-white/80 rounded-lg p-2 border border-accent-100">
              <div className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">{obs.icon}</span>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{obs.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
