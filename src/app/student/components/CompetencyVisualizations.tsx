'use client';

import { useState } from 'react';
import { Award, TrendingUp, Users, User, Layers, Target, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import CompetencyRadarChart from './CompetencyRadarChart';
import {
  CompetencyType,
  CompetencyRating,
  CompetencyTrend,
  GlobalCompetency,
  COMPETENCY_METADATA,
  getCompetencyStars,
  getTrendIcon,
} from '@/data/mockCompetencyData';

// ============ 类型定义 ============

interface CompetencyData {
  type: CompetencyType;
  rating: CompetencyRating;
  trend?: CompetencyTrend;
  isNew?: boolean; // 是否是本课程新增的维度
}

interface CourseCompetencyData {
  courseCompetencies: CompetencyData[];
  globalCompetencies?: Partial<Record<CompetencyType, GlobalCompetency>>;
}

interface GroupCompetencyData {
  groupAverage: Partial<Record<CompetencyType, CompetencyRating>>;
  personalContribution: Partial<Record<CompetencyType, number>>; // 个人贡献度 0-100
  memberCount: number;
}

// ============ 1-2维度：水平进度条可视化 ============

export function LinearCompetencyView({ competencies }: { competencies: CompetencyData[] }) {
  if (competencies.length === 0) return null;

  return (
    <div className="space-y-3">
      {competencies.map((comp) => {
        const metadata = COMPETENCY_METADATA[comp.type];
        const percentage = (comp.rating / 4) * 100;

        return (
          <div key={comp.type} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metadata.color }}
                />
                <span className="text-xs font-medium text-gray-700">
                  {metadata.icon} {metadata.name}
                </span>
                {comp.isNew && (
                  <span className="text-xs bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full font-medium">
                    新维度
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {getCompetencyStars(comp.rating)}
                </span>
                {comp.trend && (
                  <span className="text-sm">{getTrendIcon(comp.trend)}</span>
                )}
              </div>
            </div>

            {/* 进度条 */}
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: metadata.color,
                  opacity: 0.8,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-700 relative z-10">
                  {comp.rating}/4
                </span>
              </div>
            </div>

            {/* 评级描述 */}
            <p className="text-xs text-gray-500 leading-relaxed">
              {getRatingDescription(comp.rating)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ============ 3-6维度：雷达图可视化 (保留现有) ============

export function RadarCompetencyView({ competencies }: { competencies: CompetencyData[] }) {
  if (competencies.length === 0) return null;

  const competencyMap: Partial<Record<CompetencyType, CompetencyRating>> = {};
  competencies.forEach((comp) => {
    competencyMap[comp.type] = comp.rating;
  });

  return (
    <div className="space-y-3">
      <CompetencyRadarChart
        competencies={competencyMap}
        size="small"
        showLegend={false}
      />

      {/* 维度列表 */}
      <div className="grid grid-cols-2 gap-2">
        {competencies.map((comp) => {
          const metadata = COMPETENCY_METADATA[comp.type];
          return (
            <div
              key={comp.type}
              className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: metadata.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">
                  {metadata.name}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">
                    {getCompetencyStars(comp.rating)}
                  </span>
                  {comp.trend && (
                    <span className="text-xs">{getTrendIcon(comp.trend)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ 7+维度：垂直滚动条形图 ============

export function BarCompetencyView({ competencies }: { competencies: CompetencyData[] }) {
  if (competencies.length === 0) return null;

  // 按评分排序（高到低）
  const sortedCompetencies = [...competencies].sort((a, b) => b.rating - a.rating);

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
      {sortedCompetencies.map((comp) => {
        const metadata = COMPETENCY_METADATA[comp.type];
        const percentage = (comp.rating / 4) * 100;

        return (
          <div key={comp.type} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs">{metadata.icon}</span>
                <span className="text-xs font-medium text-gray-700">
                  {metadata.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-600 font-medium">
                  {comp.rating}/4
                </span>
                {comp.trend && (
                  <span className="text-xs">{getTrendIcon(comp.trend)}</span>
                )}
              </div>
            </div>

            {/* 水平条形图 */}
            <div className="relative h-6 bg-gray-100 rounded-md overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-md transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: metadata.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ 跨课程能力成长时间线 ============

export function CrossCourseGrowthTimeline({
  globalCompetencies,
}: {
  globalCompetencies: Partial<Record<CompetencyType, GlobalCompetency>>;
}) {
  // 只显示有历史记录且至少2门课程的能力
  const competenciesWithHistory = Object.entries(globalCompetencies)
    .filter(([_, comp]) => comp && comp.history.length >= 2)
    .map(([type, comp]) => ({
      type: type as CompetencyType,
      data: comp!,
    }));

  if (competenciesWithHistory.length === 0) {
    return null; // 不显示，而非空状态
  }

  return (
    <div className="space-y-3">
      {competenciesWithHistory.map(({ type, data }) => {
        const metadata = COMPETENCY_METADATA[type];
        const sortedHistory = [...data.history].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        return (
          <div key={type} className="bg-white/80 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: metadata.color }}
                />
                <span className="text-xs font-semibold text-gray-700">
                  {metadata.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-600">
                  {getCompetencyStars(data.overallRating)}
                </span>
                <span className="text-xs">{getTrendIcon(data.trend)}</span>
              </div>
            </div>

            {/* 迷你时间线 */}
            <div className="flex items-center gap-1 mb-2">
              {sortedHistory.map((record, idx) => (
                <div key={idx} className="flex-1 flex items-center">
                  <div
                    className="h-1.5 w-full rounded transition-all"
                    style={{
                      backgroundColor: metadata.color,
                      opacity: 0.3 + (record.rating / 4) * 0.7,
                    }}
                    title={`${record.courseName}: ${record.rating}星`}
                  />
                  {idx < sortedHistory.length - 1 && (
                    <ArrowRight size={10} className="text-gray-400 mx-0.5" />
                  )}
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              跨 {data.history.length} 门课程 •
              {data.trend === 'ascending' && ' 持续上升'}
              {data.trend === 'stable' && ' 保持稳定'}
              {data.trend === 'descending' && ' 有所下降'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ 小组协作能力对比可视化 ============

export function GroupCollaborationView({
  personalCompetencies,
  groupData,
}: {
  personalCompetencies: CompetencyData[];
  groupData: GroupCompetencyData;
}) {
  const [viewMode, setViewMode] = useState<'personal' | 'group' | 'contribution'>('personal');

  if (personalCompetencies.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* 视图切换 */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setViewMode('personal')}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
            viewMode === 'personal'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <User size={12} className="inline mr-1" />
          我的能力
        </button>
        <button
          onClick={() => setViewMode('group')}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
            viewMode === 'group'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users size={12} className="inline mr-1" />
          小组平均
        </button>
        <button
          onClick={() => setViewMode('contribution')}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
            viewMode === 'contribution'
              ? 'bg-white text-amber-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Target size={12} className="inline mr-1" />
          我的贡献
        </button>
      </div>

      {/* 视图内容 */}
      {viewMode === 'personal' && (
        <div className="space-y-2">
          {personalCompetencies.map((comp) => {
            const metadata = COMPETENCY_METADATA[comp.type];
            const percentage = (comp.rating / 4) * 100;

            return (
              <div key={comp.type} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">
                    {metadata.icon} {metadata.name}
                  </span>
                  <span className="text-xs text-gray-600">
                    {getCompetencyStars(comp.rating)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: metadata.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'group' && (
        <div className="space-y-2">
          {personalCompetencies.map((comp) => {
            const metadata = COMPETENCY_METADATA[comp.type];
            const personalPercentage = (comp.rating / 4) * 100;
            const groupRating = groupData.groupAverage[comp.type] || 2;
            const groupPercentage = (groupRating / 4) * 100;

            return (
              <div key={comp.type} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">
                    {metadata.icon} {metadata.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-primary-600 font-medium">我: {comp.rating}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-emerald-600 font-medium">组: {groupRating}</span>
                  </div>
                </div>

                {/* 对比条形图 */}
                <div className="space-y-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${personalPercentage}%`,
                        backgroundColor: metadata.color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${groupPercentage}%`,
                        backgroundColor: metadata.color,
                        opacity: 0.4,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="mt-3 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-xs text-emerald-700">
              <Users size={12} className="inline mr-1" />
              小组共 {groupData.memberCount} 人
            </p>
          </div>
        </div>
      )}

      {viewMode === 'contribution' && (
        <div className="space-y-2">
          {personalCompetencies.map((comp) => {
            const metadata = COMPETENCY_METADATA[comp.type];
            const contribution = groupData.personalContribution[comp.type] || 0;

            return (
              <div key={comp.type} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">
                    {metadata.icon} {metadata.name}
                  </span>
                  <span className="text-xs font-semibold text-amber-600">
                    {contribution}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${contribution}%`,
                      background: `linear-gradient(90deg, ${metadata.color} 0%, #f59e0b 100%)`,
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-700">
              <Target size={12} className="inline mr-1" />
              贡献度反映你在小组任务中的参与程度
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ 辅助函数 ============

function getRatingDescription(rating: CompetencyRating): string {
  switch (rating) {
    case 1:
      return '初步发展 - 刚刚开始展现这项能力';
    case 2:
      return '基本掌握 - 在引导下能够展现';
    case 3:
      return '熟练运用 - 能够独立展现并应用';
    case 4:
      return '卓越表现 - 持续稳定地展现优秀水平';
  }
}
