'use client';

import { useState } from 'react';
import {
  Brain,
  Network,
  Eye,
  HelpCircle,
  Lightbulb,
  Target,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  FileText,
  Route,
  Activity,
  Video,
  FileSpreadsheet,
  Zap,
  FileEdit,
  Star,
} from 'lucide-react';

// ============================================
// 类型定义
// ============================================

// 能力维度类型
export type CompetencyType =
  | 'critical_thinking'      // 批判性思维
  | 'information_synthesis'  // 信息整合
  | 'metacognition'          // 元认知
  | 'question_quality'       // 提问质量
  | 'creativity'             // 创造性
  | 'persistence';           // 坚持性

// 能力维度定义
export const COMPETENCY_DEFINITIONS: Record<CompetencyType, {
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}> = {
  critical_thinking: {
    name: '批判性思维',
    description: '评估信息、识别假设、分析论证的能力',
    icon: Brain,
    color: 'blue',
  },
  information_synthesis: {
    name: '信息整合',
    description: '从多个来源整合信息、建立联系的能力',
    icon: Network,
    color: 'indigo',
  },
  metacognition: {
    name: '元认知',
    description: '反思学习过程、调整学习策略的能力',
    icon: Eye,
    color: 'purple',
  },
  question_quality: {
    name: '提问质量',
    description: '提出有深度、有洞察力问题的能力',
    icon: HelpCircle,
    color: 'cyan',
  },
  creativity: {
    name: '创造性',
    description: '产生新颖想法、解决方案的能力',
    icon: Lightbulb,
    color: 'amber',
  },
  persistence: {
    name: '坚持性',
    description: '面对挑战持续努力、不轻易放弃的品质',
    icon: Target,
    color: 'emerald',
  },
};

// 能力评估详情
export interface CompetencyAssessment {
  type: CompetencyType;
  stars: 1 | 2 | 3 | 4;  // 1-4 星评级
  description: string;   // 描述性评价
  highlights: string[];  // 亮点
  areasForImprovement: string[];  // 待提升
  suggestions: string[];  // 建议
  evidence: Evidence[];   // 证据支撑
}

// 证据条目
export interface Evidence {
  id: string;
  type: 'dialogue' | 'note' | 'task' | 'behavior';
  content: string;
  timestamp: string;
  sourceRef?: string;  // 如 "对话 #23"
}

// 任务完成记录
export interface TaskCompletion {
  taskId: string;
  taskTitle: string;
  taskType: 'quiz' | 'assignment';
  score: number;
  maxScore: number;
  competencyTags: CompetencyType[];
  completedAt: string;
  status: 'completed' | 'pending' | 'in_progress';
}

// 跨课程能力记录
export interface CrossCourseCompetencyRecord {
  courseId: string;
  courseName: string;
  date: string;
  competencyType: CompetencyType;
  stars: 1 | 2 | 3 | 4;
}

// 跨课程能力画像
export interface CrossCourseProfile {
  competencyType: CompetencyType;
  records: CrossCourseCompetencyRecord[];
  trend: 'rising' | 'stable' | 'declining';
  averageStars: number;
}

// 学生能力档案
export interface StudentCompetencyProfile {
  studentId: string;
  studentName: string;
  avatar: string;
  status: 'online' | 'offline';
  learningDuration: number;  // 分钟
  progress: number;  // 0-100
  lastActive: string;

  // 本课程能力评估
  currentCourseAssessments: CompetencyAssessment[];

  // 任务完成情况
  taskCompletions: TaskCompletion[];

  // 跨课程能力画像
  crossCourseProfiles: CrossCourseProfile[];

  // AI 发现的额外能力
  aiDetectedCompetencies: {
    type: CompetencyType;
    confidence: number;
    description: string;
  }[];
}

// 班级能力分布统计
export interface ClassCompetencyDistribution {
  competencyType: CompetencyType;
  distribution: {
    star1: number;
    star2: number;
    star3: number;
    star4: number;
  };
  averageStars: number;
  totalStudents: number;
}

// 班级概览数据
export interface ClassOverview {
  totalStudents: number;
  onlineStudents: number;
  averageProgress: number;
  averageLearningDuration: number;
  averageScore: number;
  competencyDistributions: ClassCompetencyDistribution[];
  aiDetectedInsights: {
    type: CompetencyType;
    studentCount: number;
    description: string;
  }[];
}

// ============================================
// 辅助函数
// ============================================

// 渲染星级
export function renderStars(count: 1 | 2 | 3 | 4, size: 'sm' | 'md' | 'lg' = 'md') {
  const sizeMap = { sm: 12, md: 16, lg: 20 };
  const starSize = sizeMap[size];

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={starSize}
          className={i <= count ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

// 获取星级文本
export function getStarsText(count: 1 | 2 | 3 | 4): string {
  return '★'.repeat(count) + '☆'.repeat(4 - count);
}

// 获取星级颜色
export function getStarLevelColor(stars: 1 | 2 | 3 | 4): string {
  const colors = {
    4: 'from-primary-500 to-accent-500',
    3: 'from-primary-400 to-accent-400',
    2: 'from-primary-300 to-accent-300',
    1: 'from-primary-200 to-accent-200',
  };
  return colors[stars];
}

// ============================================
// 组件: 能力雷达图
// ============================================
export function CompetencyRadarChart({
  assessments,
  size = 200,
}: {
  assessments: CompetencyAssessment[];
  size?: number;
}) {
  if (assessments.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200"
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-gray-400">暂无能力数据</p>
      </div>
    );
  }

  const center = size / 2;
  const maxRadius = (size / 2) - 30;
  const angleStep = (2 * Math.PI) / assessments.length;

  // 计算每个能力的坐标点
  const points = assessments.map((assessment, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = (assessment.stars / 4) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      labelX: center + (maxRadius + 20) * Math.cos(angle),
      labelY: center + (maxRadius + 20) * Math.sin(angle),
      assessment,
    };
  });

  // 生成多边形路径
  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // 生成背景网格
  const gridLevels = [1, 2, 3, 4];

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* 背景网格 */}
      {gridLevels.map((level) => {
        const r = (level / 4) * maxRadius;
        const gridPoints = assessments.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        }).join(' ');

        return (
          <polygon
            key={level}
            points={gridPoints}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* 轴线 */}
      {assessments.map((_, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const endX = center + maxRadius * Math.cos(angle);
        const endY = center + maxRadius * Math.sin(angle);

        return (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={endX}
            y2={endY}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* 数据区域 */}
      <path
        d={polygonPath}
        fill="rgba(59, 130, 246, 0.2)"
        stroke="rgb(59, 130, 246)"
        strokeWidth="2"
      />

      {/* 数据点 */}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="5"
          fill="rgb(59, 130, 246)"
          stroke="white"
          strokeWidth="2"
        />
      ))}

      {/* 标签 */}
      {points.map((point, index) => {
        const def = COMPETENCY_DEFINITIONS[point.assessment.type];
        return (
          <text
            key={index}
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-gray-600 font-medium"
          >
            {def.name}
          </text>
        );
      })}
    </svg>
  );
}

// ============================================
// 组件: 能力详情卡片
// ============================================
export function CompetencyDetailCard({
  assessment,
  expanded = false,
  onToggle,
}: {
  assessment: CompetencyAssessment;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const def = COMPETENCY_DEFINITIONS[assessment.type];
  const Icon = def.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 头部 */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-${def.color}-100 flex items-center justify-center`}>
            <Icon size={24} className={`text-${def.color}-600`} />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-gray-800">{def.name}</h4>
            <p className="text-xs text-gray-500">{def.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {renderStars(assessment.stars, 'md')}
          {onToggle && (
            expanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
          {/* 描述性评价 */}
          <div className="pt-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">评价</h5>
            <p className="text-sm text-gray-600 leading-relaxed">{assessment.description}</p>
          </div>

          {/* 亮点 & 待提升 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-lg p-4">
              <h5 className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                <Sparkles size={12} />
                亮点
              </h5>
              <ul className="space-y-1">
                {assessment.highlights.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <h5 className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
                <Target size={12} />
                待提升
              </h5>
              <ul className="space-y-1">
                {assessment.areasForImprovement.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 建议 */}
          <div className="bg-primary-50 rounded-lg p-4">
            <h5 className="text-xs font-semibold text-primary-700 mb-2 flex items-center gap-1">
              <Lightbulb size={12} />
              建议
            </h5>
            <ul className="space-y-1">
              {assessment.suggestions.map((item, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 证据 */}
          {assessment.evidence.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <FileText size={12} />
                证据支撑
              </h5>
              <div className="space-y-2">
                {assessment.evidence.map((ev) => (
                  <div key={ev.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        {ev.sourceRef || ev.type}
                      </span>
                      <span className="text-xs text-gray-400">{ev.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700">{ev.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 组件: 跨课程能力时间线
// ============================================
export function CrossCourseTimeline({
  profiles,
}: {
  profiles: CrossCourseProfile[];
}) {
  if (profiles.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-400">暂无跨课程数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {profiles.map((profile) => {
        const def = COMPETENCY_DEFINITIONS[profile.competencyType];
        const Icon = def.icon;
        const maxStars = Math.max(...profile.records.map(r => r.stars));

        return (
          <div key={profile.competencyType} className="bg-white rounded-xl p-5 border border-gray-200">
            {/* 头部 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${def.color}-100 flex items-center justify-center`}>
                  <Icon size={20} className={`text-${def.color}-600`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{def.name}</h4>
                  <p className="text-xs text-gray-500">
                    平均 {profile.averageStars.toFixed(1)} 星
                  </p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                profile.trend === 'rising'
                  ? 'bg-green-100 text-green-700'
                  : profile.trend === 'declining'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {profile.trend === 'rising' ? '↗ 上升' : profile.trend === 'declining' ? '↘ 下降' : '→ 稳定'}
              </span>
            </div>

            {/* 时间线 */}
            <div className="space-y-3">
              {profile.records.map((record, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-28 text-sm text-gray-600 shrink-0">
                    {record.courseName}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-7 flex items-center relative overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getStarLevelColor(record.stars)} rounded-full flex items-center justify-end pr-3 transition-all`}
                      style={{ width: `${(record.stars / 4) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{record.stars}★</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-20 shrink-0">{record.date}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// 组件: 能力分布条形图
// ============================================
export function CompetencyDistributionChart({
  distribution,
}: {
  distribution: ClassCompetencyDistribution;
}) {
  const def = COMPETENCY_DEFINITIONS[distribution.competencyType];
  const Icon = def.icon;
  const { star1, star2, star3, star4 } = distribution.distribution;
  const maxCount = Math.max(star1, star2, star3, star4);
  const total = distribution.totalStudents;

  const bars = [
    { level: 4, count: star4, label: '★★★★' },
    { level: 3, count: star3, label: '★★★' },
    { level: 2, count: star2, label: '★★' },
    { level: 1, count: star1, label: '★' },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
      {/* 标题和平均值 */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg bg-${def.color}-100 flex items-center justify-center`}>
          <Icon size={20} className={`text-${def.color}-600`} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-800">{def.name}</h4>
          <p className="text-xs text-gray-500">{def.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">班级平均</div>
          <div className="text-xl font-bold text-primary-600">{distribution.averageStars.toFixed(1)} ★</div>
        </div>
      </div>

      {/* 条形图 */}
      <div className="space-y-2">
        {bars.map((bar) => (
          <div key={bar.level} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-14 shrink-0">{bar.label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getStarLevelColor(bar.level as 1 | 2 | 3 | 4)} rounded-full flex items-center justify-end pr-2 transition-all`}
                style={{ width: maxCount > 0 ? `${(bar.count / maxCount) * 100}%` : '0%' }}
              >
                {bar.count > 0 && (
                  <span className="text-xs font-bold text-white">{bar.count}人</span>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-500 w-10 text-right">
              {total > 0 ? Math.round((bar.count / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 组件: 学生列表项
// ============================================
export function StudentListItem({
  profile,
  competencyTypes,
  aiDetectedTypes,
  onClick,
}: {
  profile: StudentCompetencyProfile;
  competencyTypes: CompetencyType[];
  aiDetectedTypes: CompetencyType[];
  onClick?: () => void;
}) {
  // 从当前评估中获取星级
  const getStarsForCompetency = (type: CompetencyType): number => {
    const assessment = profile.currentCourseAssessments.find(a => a.type === type);
    return assessment?.stars || 0;
  };

  // 获取 AI 发现的能力
  const aiDetected = profile.aiDetectedCompetencies.find(
    c => aiDetectedTypes.includes(c.type)
  );

  return (
    <tr
      onClick={onClick}
      className="hover:bg-primary-50 transition-colors cursor-pointer"
    >
      {/* 学生信息 */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{profile.avatar}</div>
          <div>
            <span className="font-medium text-gray-700">{profile.studentName}</span>
            <p className="text-xs text-gray-400">{profile.lastActive}</p>
          </div>
        </div>
      </td>

      {/* 状态 */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            profile.status === 'online'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              profile.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          {profile.status === 'online' ? '在线' : '离线'}
        </span>
      </td>

      {/* 进度 */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-full h-2 w-16">
            <div
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all"
              style={{ width: `${profile.progress}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700">{profile.progress}%</span>
        </div>
      </td>

      {/* 各能力维度星级 */}
      {competencyTypes.map((type) => {
        const stars = getStarsForCompetency(type);
        return (
          <td key={type} className="px-3 py-4 text-center">
            {stars > 0 ? (
              <span className="text-sm font-bold text-gray-800">
                {getStarsText(stars as 1 | 2 | 3 | 4)}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>
        );
      })}

      {/* AI 发现 */}
      {aiDetectedTypes.length > 0 && (
        <td className="px-3 py-4 text-center">
          {aiDetected ? (
            <span className="text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded-full">
              {COMPETENCY_DEFINITIONS[aiDetected.type].name}↑
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
      )}

      {/* 操作 */}
      <td className="px-5 py-4">
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          查看详情
        </button>
      </td>
    </tr>
  );
}

// ============================================
// 组件: 学生详情面板
// ============================================
export function StudentDetailPanel({
  profile,
  onClose,
}: {
  profile: StudentCompetencyProfile;
  onClose: () => void;
}) {
  const [expandedCompetency, setExpandedCompetency] = useState<CompetencyType | null>(null);

  // 计算平均星级
  const avgStars = profile.currentCourseAssessments.length > 0
    ? (profile.currentCourseAssessments.reduce((sum, a) => sum + a.stars, 0) / profile.currentCourseAssessments.length).toFixed(1)
    : '--';

  // 转换为 CrossCourseProfile 格式
  const crossCourseProfiles: CrossCourseProfile[] = profile.crossCourseProfiles;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-[900px] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{profile.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold">{profile.studentName}</h2>
                <p className="text-sm opacity-90 mt-1">
                  学习时长：{profile.learningDuration}分钟 · 完成度：{profile.progress}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{avgStars} ★</div>
              <p className="text-xs opacity-90 mt-1">综合能力评级</p>
            </div>
          </div>
        </div>

        {/* 内容区域 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. 本课程能力评估（使用雷达图） */}
          <div className="bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target size={18} className="text-primary-600" />
              本课程能力评估
            </h3>

            <div className="flex gap-6">
              {/* 雷达图 */}
              <div className="flex-shrink-0">
                <CompetencyRadarChart assessments={profile.currentCourseAssessments} size={200} />
              </div>

              {/* 能力卡片网格 */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                {profile.currentCourseAssessments.map((assessment) => {
                  const def = COMPETENCY_DEFINITIONS[assessment.type];
                  const Icon = def.icon;
                  return (
                    <div key={assessment.type} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg bg-${def.color}-100 flex items-center justify-center`}>
                          <Icon size={16} className={`text-${def.color}-600`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{def.name}</span>
                      </div>
                      {renderStars(assessment.stars, 'md')}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. 能力详情（使用 CompetencyDetailCard） */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary-600" />
              能力详情
            </h3>

            <div className="space-y-3">
              {profile.currentCourseAssessments.map((assessment) => (
                <CompetencyDetailCard
                  key={assessment.type}
                  assessment={assessment}
                  expanded={expandedCompetency === assessment.type}
                  onToggle={() => setExpandedCompetency(
                    expandedCompetency === assessment.type ? null : assessment.type
                  )}
                />
              ))}
            </div>
          </div>

          {/* 3. 跨课程能力画像（使用 CrossCourseTimeline） */}
          {crossCourseProfiles.length > 0 && (
            <div className="bg-gradient-to-br from-accent-50 to-cyan-50/30 rounded-xl p-6 border border-accent-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Network size={18} className="text-accent-600" />
                跨课程能力画像
              </h3>
              <CrossCourseTimeline profiles={crossCourseProfiles} />
            </div>
          )}

          {/* 4. 任务完成情况 */}
          {profile.taskCompletions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle size={16} className="text-primary-600" />
                  任务完成情况
                </h3>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-xs font-semibold text-gray-600">任务</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-600">类型</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-600">得分</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-600">能力标签</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-600">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.taskCompletions.map((task) => (
                      <tr key={task.taskId} className="border-b border-gray-100 last:border-0">
                        <td className="py-2">{task.taskTitle}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            task.taskType === 'quiz'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-primary-100 text-primary-700'
                          }`}>
                            {task.taskType === 'quiz' ? '客观题' : '主观题'}
                          </span>
                        </td>
                        <td className="py-2 font-semibold">{task.score}/{task.maxScore}</td>
                        <td className="py-2">
                          {task.competencyTags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {task.competencyTags.map((tag) => (
                                <span key={tag} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                                  {COMPETENCY_DEFINITIONS[tag].name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2">
                          <span className={`text-xs ${
                            task.status === 'completed'
                              ? 'text-green-600'
                              : task.status === 'in_progress'
                              ? 'text-amber-600'
                              : 'text-gray-500'
                          }`}>
                            {task.status === 'completed' ? '✅ 完成' : task.status === 'in_progress' ? '⏳ 进行中' : '⏸ 待完成'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. AI 发现的额外能力 */}
          {profile.aiDetectedCompetencies.length > 0 && (
            <div className="bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl p-4 border border-accent-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-accent-600" />
                <h4 className="text-sm font-bold text-gray-800">AI 发现的额外能力表现</h4>
              </div>
              <div className="space-y-2">
                {profile.aiDetectedCompetencies.map((detected) => {
                  const def = COMPETENCY_DEFINITIONS[detected.type];
                  const Icon = def.icon;
                  return (
                    <div key={detected.type} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-accent-100">
                      <div className={`w-8 h-8 rounded-lg bg-${def.color}-100 flex items-center justify-center`}>
                        <Icon size={16} className={`text-${def.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">{def.name}</span>
                          <span className="text-xs bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full">
                            置信度 {Math.round(detected.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{detected.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. 学习轨迹提示 */}
          <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
            <div className="flex items-center gap-2 mb-2">
              <Route size={16} className="text-primary-600" />
              <h4 className="text-sm font-semibold text-gray-800">学习轨迹</h4>
            </div>
            <p className="text-xs text-gray-600">
              点击"展开查看详细时间线"可以查看该学生的完整学习轨迹，包括资源访问、任务提交、AI对话等所有活动记录。
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
          >
            返回班级概览
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 注意: 所有类型已在定义时通过 export interface 导出
// ============================================
