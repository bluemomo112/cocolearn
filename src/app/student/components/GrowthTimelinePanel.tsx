'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, TrendingUp } from 'lucide-react';
import {
  CompetencyType,
  CompetencyRating,
  CompetencyTrend,
  COMPETENCY_METADATA,
  getCompetencyStars,
} from '@/data/mockCompetencyData';
import {
  mockLearningLog,
  LOG_ENTRY_CONFIG,
  type LearningLogEntry,
} from '@/data/mockLearningLogData';
import { CrossCourseGrowthTimeline } from './CompetencyVisualizations';
import { mockLearnerProfile } from '@/data/mockCompetencyData';

// ============ 紧凑能力指标条 ============

function CompactCompetencyBar({
  competencyProfile,
}: {
  competencyProfile: Partial<Record<CompetencyType, number>>;
}) {
  const entries = Object.entries(competencyProfile) as [CompetencyType, number][];
  if (entries.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-3 border border-primary-100">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs font-bold text-primary-700">能力快照</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {entries.map(([type, rating]) => {
          const meta = COMPETENCY_METADATA[type];
          const stars = getCompetencyStars(Math.round(rating) as CompetencyRating);
          return (
            <div key={type} className="flex items-center gap-1 text-xs">
              <span className="text-gray-600">{meta.name}</span>
              <span className="text-yellow-500 text-[10px] tracking-tight">{stars}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ 时间线条目 ============

function TimelineEntry({ entry }: { entry: LearningLogEntry }) {
  const config = LOG_ENTRY_CONFIG[entry.type];
  const time = entry.timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isMilestone = entry.type === 'milestone';

  return (
    <div className="relative flex gap-3 pb-4">
      {/* 竖线 */}
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor} ring-2 ring-white flex-shrink-0 z-10`} />
        <div className="w-px flex-1 bg-gray-200" />
      </div>

      {/* 卡片 */}
      <div
        className={`flex-1 rounded-lg p-2.5 border -mt-0.5 ${
          isMilestone
            ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300'
            : `${config.bgColor} border-gray-100`
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{config.icon}</span>
            <span className={`text-xs font-medium ${isMilestone ? 'text-amber-800' : 'text-gray-800'}`}>
              {entry.title}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{time}</span>
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
          {entry.description}
        </p>

        {/* 特殊 metadata 渲染 */}
        <EntryBadges entry={entry} />
      </div>
    </div>
  );
}

// ============ 条目特殊 Badge ============

function EntryBadges({ entry }: { entry: LearningLogEntry }) {
  const { metadata, type } = entry;
  if (!metadata) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {type === 'resource_complete' && metadata.duration && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
          {metadata.duration}min
        </span>
      )}
      {type === 'task_complete' && metadata.score != null && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700">
          {metadata.score}分
        </span>
      )}
      {type === 'competency_upgrade' && metadata.previousRating != null && metadata.newRating != null && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-yellow-100 text-yellow-700">
          {'★'.repeat(metadata.previousRating)}{'☆'.repeat(4 - metadata.previousRating)}
          {' → '}
          {'★'.repeat(metadata.newRating)}{'☆'.repeat(4 - metadata.newRating)}
        </span>
      )}
    </div>
  );
}

// ============ 主面板 ============

export default function GrowthTimelinePanel({
  competencyProfile,
}: {
  competencyProfile: Partial<Record<CompetencyType, number>>;
}) {
  const [showCrossCourse, setShowCrossCourse] = useState(false);

  const sortedLog = [...mockLearningLog].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="space-y-3">
      <CompactCompetencyBar competencyProfile={competencyProfile} />

      <div>
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <span className="text-xs font-bold text-gray-700">今日学习轨迹</span>
          <span className="text-[10px] text-gray-400">{sortedLog.length} 条记录</span>
        </div>
        <div className="pl-1">
          {sortedLog.map((entry) => (
            <TimelineEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 overflow-hidden">
        <button
          onClick={() => setShowCrossCourse(!showCrossCourse)}
          className="w-full p-3 flex items-center justify-between hover:bg-emerald-100/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">我的跨课程能力画像</span>
          </div>
          {showCrossCourse ? (
            <ChevronUp size={14} className="text-emerald-600" />
          ) : (
            <ChevronDown size={14} className="text-emerald-600" />
          )}
        </button>
        {showCrossCourse && (
          <div className="p-3 pt-0">
            <CrossCourseGrowthTimeline globalCompetencies={mockLearnerProfile.globalCompetencies} />
          </div>
        )}
      </div>
    </div>
  );
}

