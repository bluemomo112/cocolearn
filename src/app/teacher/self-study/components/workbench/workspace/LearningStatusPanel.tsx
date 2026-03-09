'use client';

import { useState } from 'react';
import { LearningMode, LearningPathNode } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Activity, Map, CheckCircle2, Circle, Award, TrendingUp, Sparkles,
  ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';

// 5.1 根据节点标题/描述判断事件类别，映射到对应颜色
function getNodeCategoryColor(node: LearningPathNode): {
  bg: string; border: string; iconBg: string; text: string;
} {
  const title = (node.title || '').toLowerCase();
  const desc = (node.description || '').toLowerCase();
  const combined = title + ' ' + desc;

  // AI 主场（AI 对话、AI 洞察）→ 浅紫色
  if (/ai|智能|洞察|对话|chat|insight/.test(combined)) {
    return {
      bg: 'bg-purple-50', border: 'border-purple-200',
      iconBg: 'bg-purple-500', text: 'text-purple-700',
    };
  }
  // 完成任务（做题、提交、练习、测试）→ 浅绿色
  if (/完成|做题|提交|练习|测试|quiz|submit|task|exercise/.test(combined)) {
    return {
      bg: 'bg-green-50', border: 'border-green-200',
      iconBg: 'bg-green-500', text: 'text-green-700',
    };
  }
  // 学习（阅读资源、浏览内容、学习、阅读）→ 浅蓝色
  if (/学习|阅读|浏览|资源|内容|read|learn|study|resource/.test(combined)) {
    return {
      bg: 'bg-blue-50', border: 'border-blue-200',
      iconBg: 'bg-blue-500', text: 'text-blue-700',
    };
  }
  // 其他（提问、能力变化等）→ 灰色/橙色
  return {
    bg: 'bg-orange-50', border: 'border-orange-200',
    iconBg: 'bg-gray-400', text: 'text-gray-600',
  };
}

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
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  // 5.2 折叠摘要数据
  const elapsedMins = Math.floor(elapsedTime / 60);
  const hasLearningData = totalCount > 0 || observations.length > 0 || elapsedTime > 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* 5.2 标题栏 + 折叠按钮 */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-100 cursor-pointer select-none hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-primary-600" />
          <span className="text-xs font-bold text-primary-700">{t('学习状态')}</span>
        </div>
        <div className="flex items-center gap-2">
          {isCollapsed && hasLearningData && (
            <span className="text-xs text-gray-400">
              {t('今日学习')} {elapsedMins}min · {t('完成')} {masteredCount} {t('个任务')}
            </span>
          )}
          {isCollapsed ? (
            <ChevronDown size={14} className="text-gray-400" />
          ) : (
            <ChevronUp size={14} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* 5.2 折叠后隐藏内容 */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* 5.3 空状态 */}
          {!hasLearningData ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <BookOpen size={24} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {t('开始学习后，你的学习轨迹将在这里显示')}
              </p>
            </div>
          ) : (
            <>
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

              {/* 学习路径 - 仅AI引导模式显示，5.1 统一颜色分类 */}
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
                    {learningPath.map((node, idx) => {
                      const colors = getNodeCategoryColor(node);
                      return (
                        <div
                          key={node.id}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                            node.status === 'learning'
                              ? `${colors.bg} border ${colors.border}`
                              : node.status === 'mastered'
                              ? `bg-white/60 border ${colors.border}`
                              : 'bg-white/40 border border-gray-200'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              node.status === 'mastered'
                                ? colors.iconBg
                                : node.status === 'learning'
                                ? colors.iconBg
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
                                  ? `${colors.text} line-through`
                                  : node.status === 'learning'
                                  ? colors.text
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
                      );
                    })}
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
