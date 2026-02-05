'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  Target,
  Activity,
  Lightbulb,
  Download,
  Calendar,
  BookOpen,
  FileText,
  Video,
  Zap,
  Brain,
  AlertCircle,
  BarChart3,
  LineChart,
  Info,
} from 'lucide-react';
import CompetencyRadarChart from '../../../components/CompetencyRadarChart';
import { CompetencyType } from '@/types/shared-context';

// 定义 CompetencyRating 为 1-4 的数字
type CompetencyRating = 1 | 2 | 3 | 4;

// ============= 类型定义 =============

interface LearningSession {
  id: string;
  courseId: string;
  courseName: string;
  startTime: Date;
  endTime: Date;
  totalDuration: number; // 秒
}

interface ResourceProgress {
  resourceId: string;
  title: string;
  type: 'video' | 'document' | 'presentation';
  completed: boolean;
  viewDuration: number; // 秒
  totalDuration?: number;
}

interface TaskPerformance {
  taskId: string;
  title: string;
  type: 'quiz' | 'assignment' | 'reflection';
  required: boolean;
  completed: boolean;
  score?: number;
  totalScore?: number;
  correctCount?: number;
  totalCount?: number;
  timeSpent: number; // 秒
  competencyTags?: CompetencyType[]; // 能力标签，用于推断是否有能力配置
  attempts: number;
  improvements?: {
    betterThanPrevious: boolean;
    scoreImprovement?: number;
    timeImprovement?: number;
  };
}

interface ReportData {
  session: LearningSession;
  resources: ResourceProgress[];
  tasks: TaskPerformance[];
  previousSessions?: {
    sessionId: string;
    date: Date;
    completionRate: number;
    avgScore: number;
  }[];
  // 基于统计的变动数据
  progress?: {
    completionRateChange: number; // 百分比变化
    avgScoreChange: number;
    streakDays: number;
    achievements: string[];
  };
  // AI观察（仅在有主观题且已批改时）
  aiObservations?: {
    id: string;
    type: 'praise' | 'suggestion' | 'insight';
    message: string;
    timestamp: Date;
  }[];
}

// ============= 辅助函数 =============

/**
 * 从任务元数据推断是否有能力配置
 * 逻辑：如果有任何任务包含competencyTags，则认为课程配置了能力评估
 */
function hasCompetencyConfiguration(tasks: TaskPerformance[]): boolean {
  return tasks.some(task =>
    task.competencyTags &&
    task.competencyTags.length > 0
  );
}

/**
 * 从任务中提取能力维度评分
 * 简化版本：基于任务完成度和分数推断
 * 实际应该从教师的批改数据中获取
 */
function extractCompetencyScores(tasks: TaskPerformance[]): Partial<Record<CompetencyType, CompetencyRating>> {
  const competencyScores: Record<string, { totalScore: number; count: number }> = {
    critical_thinking: { totalScore: 0, count: 0 },
    information_synthesis: { totalScore: 0, count: 0 },
    metacognition: { totalScore: 0, count: 0 },
  };

  tasks.forEach(task => {
    if (!task.completed || !task.competencyTags) return;

    // 简化推断：基于任务分数
    const taskScore = task.score ? (task.score / (task.totalScore || 1)) : 0;
    const rating = taskScore >= 0.9 ? 4 : taskScore >= 0.75 ? 3 : taskScore >= 0.6 ? 2 : 1;

    task.competencyTags.forEach(tag => {
      if (competencyScores[tag]) {
        competencyScores[tag].totalScore += rating;
        competencyScores[tag].count += 1;
      }
    });
  });

  // 计算平均分
  const result: Partial<Record<CompetencyType, CompetencyRating>> = {};
  Object.entries(competencyScores).forEach(([type, data]) => {
    if (data.count > 0) {
      result[type as CompetencyType] = Math.round(data.totalScore / data.count) as CompetencyRating;
    }
  });

  return result;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

// ============= 子组件 =============

/**
 * 第一层：统计数据面板（必然存在）
 */
function StatisticsPanel({ reportData }: { reportData: ReportData }) {
  const completedResources = reportData.resources.filter(r => r.completed).length;
  const totalResources = reportData.resources.length;
  const requiredTasks = reportData.tasks.filter(t => t.required);
  const completedRequiredTasks = requiredTasks.filter(t => t.completed).length;
  const totalRequiredTasks = requiredTasks.length;

  const quizTasks = reportData.tasks.filter(t => t.type === 'quiz' && t.completed);
  const totalCorrect = quizTasks.reduce((sum, t) => sum + (t.correctCount || 0), 0);
  const totalQuestions = quizTasks.reduce((sum, t) => sum + (t.totalCount || 0), 0);
  const avgCorrectRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <BarChart3 size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">学习数据回顾</h2>
            <p className="text-sm text-blue-100">
              {reportData.session.courseName} · {new Date(reportData.session.endTime).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
      </div>

      {/* 统计卡片网格 */}
      <div className="p-6 space-y-6">
        {/* 时间与进度 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 学习时长 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">学习时长</span>
            </div>
            <p className="text-3xl font-bold text-blue-700">
              {formatDuration(reportData.session.totalDuration)}
            </p>
          </div>

          {/* 资源完成度 */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={18} className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">资源浏览</span>
            </div>
            <p className="text-3xl font-bold text-emerald-700">
              {completedResources}/{totalResources}
            </p>
            <div className="mt-2 w-full bg-emerald-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${(completedResources / totalResources) * 100}%` }}
              />
            </div>
          </div>

          {/* 任务完成度 */}
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-4 border border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-violet-600" />
              <span className="text-sm font-medium text-violet-900">必修任务</span>
            </div>
            <p className="text-3xl font-bold text-violet-700">
              {completedRequiredTasks}/{totalRequiredTasks}
            </p>
            <div className="mt-2 w-full bg-violet-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all"
                style={{ width: `${(completedRequiredTasks / totalRequiredTasks) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 客观题表现 */}
        {quizTasks.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-amber-600" />
                <span className="text-sm font-medium text-amber-900">客观题正确率</span>
              </div>
              <span className="text-2xl font-bold text-amber-700">{avgCorrectRate}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <span>总计 {totalCorrect} 题正确 / {totalQuestions} 题</span>
              {avgCorrectRate >= 90 && (
                <span className="px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full">优秀</span>
              )}
            </div>
            {quizTasks.map(task => (
              <div key={task.taskId} className="mt-3 pt-3 border-t border-amber-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-900">{task.title}</span>
                  <span className="font-medium text-amber-700">
                    {task.correctCount}/{task.totalCount}
                    {task.improvements?.betterThanPrevious && (
                      <span className="ml-2 text-xs text-green-600">↑ 较上次提升</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 资源详细列表 */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <FileText size={16} />
            学习资源详情
          </h3>
          <div className="space-y-2">
            {reportData.resources.map(resource => (
              <div
                key={resource.resourceId}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  resource.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  resource.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {resource.type === 'video' ? (
                    <Video size={16} className={resource.completed ? 'text-green-600' : 'text-gray-400'} />
                  ) : (
                    <FileText size={16} className={resource.completed ? 'text-green-600' : 'text-gray-400'} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{resource.title}</p>
                  <p className="text-xs text-gray-500">
                    {resource.completed ? '已完成' : '未完成'}
                    {resource.viewDuration > 0 && ` · ${formatDuration(resource.viewDuration)}`}
                  </p>
                </div>
                {resource.completed && (
                  <CheckCircle size={18} className="text-green-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 第二层：进步变动面板（基于统计）
 */
function ProgressPanel({ reportData }: { reportData: ReportData }) {
  if (!reportData.progress) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <Info size={18} />
          <p className="text-sm">暂无历史数据，完成更多课程后将显示进步趋势</p>
        </div>
      </div>
    );
  }

  const { progress } = reportData;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">本课进步</h2>
            <p className="text-sm text-emerald-100">相比上次学习的表现</p>
          </div>
        </div>
      </div>

      {/* 进步指标 */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 完成率变化 */}
          <div className={`rounded-xl p-4 border-2 ${
            progress.completionRateChange >= 0
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">完成率变化</p>
                <p className={`text-2xl font-bold mt-1 ${
                  progress.completionRateChange >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {progress.completionRateChange >= 0 ? '+' : ''}{progress.completionRateChange}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                progress.completionRateChange >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {progress.completionRateChange >= 0 ? (
                  <TrendingUp size={24} className="text-green-600" />
                ) : (
                  <TrendingUp size={24} className="text-red-600 rotate-180" />
                )}
              </div>
            </div>
          </div>

          {/* 平均分变化 */}
          <div className={`rounded-xl p-4 border-2 ${
            progress.avgScoreChange >= 0
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">平均分变化</p>
                <p className={`text-2xl font-bold mt-1 ${
                  progress.avgScoreChange >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {progress.avgScoreChange >= 0 ? '+' : ''}{progress.avgScoreChange}分
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                progress.avgScoreChange >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {progress.avgScoreChange >= 0 ? (
                  <Award size={24} className="text-green-600" />
                ) : (
                  <AlertCircle size={24} className="text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 连续学习天数 */}
        {progress.streakDays > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900">连续学习</p>
                <p className="text-lg font-bold text-orange-700">{progress.streakDays} 天</p>
              </div>
              <p className="text-sm text-orange-700 ml-auto">继续保持！</p>
            </div>
          </div>
        )}

        {/* 成就标签 */}
        {progress.achievements && progress.achievements.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">本课成就</h3>
            <div className="flex flex-wrap gap-2">
              {progress.achievements.map((achievement, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-medium rounded-full flex items-center gap-1.5"
                >
                  <Award size={14} />
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 历史课程对比 */}
        {reportData.previousSessions && reportData.previousSessions.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <LineChart size={16} />
              历史课程对比
            </h3>
            <div className="space-y-2">
              {reportData.previousSessions.map((session, idx) => (
                <div
                  key={session.sessionId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">第{reportData.previousSessions!.length - idx}次</span>
                    <span className="text-sm text-gray-700">
                      {new Date(session.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">完成率 {session.completionRate}%</span>
                    <span className="text-gray-600">平均分 {session.avgScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 第三层：能力分析面板（条件渲染）
 */
function CompetencyPanel({ reportData }: { reportData: ReportData }) {
  const hasCompetencyConfig = hasCompetencyConfiguration(reportData.tasks);

  if (!hasCompetencyConfig) {
    // 降级展示：无能力配置时的友好提示
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Target size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">能力发展</h2>
              <p className="text-sm text-gray-200">能力维度评估</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  本课程专注于知识掌握
                </p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  教师未配置能力维度评估，你的学习数据已完整记录。
                  能力发展评估需要教师在设计课程时配置相关维度。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 有能力配置：显示能力分析
  const competencyScores = extractCompetencyScores(reportData.tasks);
  const hasScores = Object.keys(competencyScores).length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">能力发展</h2>
            <p className="text-sm text-purple-100">基于任务表现的评估</p>
          </div>
        </div>
      </div>

      {/* 能力分析内容 */}
      <div className="p-6 space-y-6">
        {hasScores ? (
          <>
            {/* 能力雷达图 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <CompetencyRadarChart
                competencies={competencyScores}
                size="medium"
                showLegend={true}
              />
            </div>

            {/* 能力详情列表 */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">能力维度详情</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(competencyScores).map(([type, rating]) => {
                  const metadata: Record<string, { name: string; color: string; description: string }> = {
                    critical_thinking: { name: '批判性思维', color: '#3B82F6', description: '分析、评估和推理的能力' },
                    information_synthesis: { name: '信息综合', color: '#10B981', description: '整合多源信息的能力' },
                    metacognition: { name: '元认知', color: '#F59E0B', description: '自我认知和调控能力' },
                  };

                  const info = metadata[type];
                  const stars = '★'.repeat(rating) + '☆'.repeat(4 - rating);

                  return (
                    <div
                      key={type}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: info.color }}
                        />
                        <span className="text-sm font-medium text-gray-800">{info.name}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg text-gray-700">{stars}</span>
                        <span className="text-xs text-gray-500">{info.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 突出表现 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <h3 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                <Lightbulb size={16} className="text-green-600" />
                本课突出表现
              </h3>
              <div className="space-y-2">
                {Object.entries(competencyScores)
                  .filter(([_, rating]) => rating >= 3)
                  .map(([type, rating]) => {
                    const metadata: Record<string, { name: string }> = {
                      critical_thinking: { name: '批判性思维' },
                      information_synthesis: { name: '信息综合' },
                      metacognition: { name: '元认知' },
                    };

                    const relatedTasks = reportData.tasks.filter(t =>
                      t.completed && t.competencyTags?.includes(type as CompetencyType)
                    );

                    return (
                      <div key={type} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-green-900">
                            {metadata[type]?.name}
                          </span>
                          <span className="text-green-700 ml-1">
                            ★★★★ - 在"{relatedTasks[0]?.title}"等任务中表现优秀
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 改进建议 */}
            {Object.entries(competencyScores).some(([_, rating]) => rating < 3) && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <Target size={16} className="text-amber-600" />
                  可以加强的方面
                </h3>
                <div className="space-y-2">
                  {Object.entries(competencyScores)
                    .filter(([_, rating]) => rating < 3)
                    .map(([type, rating]) => {
                      const metadata: Record<string, { name: string; suggestion: string }> = {
                        critical_thinking: {
                          name: '批判性思维',
                          suggestion: '建议：多角度分析问题，尝试找出论据的优缺点'
                        },
                        information_synthesis: {
                          name: '信息综合',
                          suggestion: '建议：练习跨资料整合，建立信息之间的联系'
                        },
                        metacognition: {
                          name: '元认知',
                          suggestion: '建议：定期反思学习过程，总结适合自己的学习方法'
                        },
                      };

                      const info = metadata[type];

                      return (
                        <div key={type} className="text-sm">
                          <span className="font-medium text-amber-900">{info.name}：</span>
                          <span className="text-amber-700">{info.suggestion}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Brain size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              完成带能力标签的任务后将显示评估结果
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * AI观察面板（仅在有主观题批改时显示）
 */
function AIObservationsPanel({ reportData }: { reportData: ReportData }) {
  if (!reportData.aiObservations || reportData.aiObservations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI观察</h2>
            <p className="text-sm text-indigo-100">来自AI的学习反馈</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {reportData.aiObservations.map(obs => (
          <div
            key={obs.id}
            className={`rounded-lg p-4 border-2 ${
              obs.type === 'praise'
                ? 'bg-green-50 border-green-200'
                : obs.type === 'suggestion'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                obs.type === 'praise'
                  ? 'bg-green-100'
                  : obs.type === 'suggestion'
                  ? 'bg-amber-100'
                  : 'bg-blue-100'
              }`}>
                {obs.type === 'praise' ? (
                  <Award size={16} className="text-green-600" />
                ) : obs.type === 'suggestion' ? (
                  <Lightbulb size={16} className="text-amber-600" />
                ) : (
                  <Activity size={16} className="text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-600 uppercase">
                    {obs.type === 'praise' ? '赞赏' : obs.type === 'suggestion' ? '建议' : '洞察'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(obs.timestamp).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{obs.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 学习建议面板
 */
function RecommendationsPanel({ reportData }: { reportData: ReportData }) {
  // 基于数据生成个性化建议
  const recommendations = [
    {
      type: 'review',
      icon: <BookOpen size={18} />,
      title: '复习要点',
      content: '回顾"光合作用效率"相关公式和计算方法',
      priority: 'high' as const,
    },
    {
      type: 'prepare',
      icon: <Calendar size={18} />,
      title: '预习准备',
      content: '下节课将学习"植物工厂自动化"，建议提前了解基础概念',
      priority: 'medium' as const,
    },
    {
      type: 'extend',
      icon: <Video size={18} />,
      title: '扩展学习',
      content: '观看"现代农业科技"扩展视频，深入了解实际应用',
      priority: 'low' as const,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Lightbulb size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">学习建议</h2>
            <p className="text-sm text-cyan-100">基于你的表现定制的建议</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-4 border-2 ${
              rec.priority === 'high'
                ? 'bg-red-50 border-red-200'
                : rec.priority === 'medium'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                rec.priority === 'high'
                  ? 'bg-red-100'
                  : rec.priority === 'medium'
                  ? 'bg-amber-100'
                  : 'bg-blue-100'
              }`}>
                {rec.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">{rec.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{rec.content}</p>
              </div>
              {rec.priority === 'high' && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  重要
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= 主页面组件 =============

export default function StudentReportPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: 从API加载真实数据
  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      const mockData: ReportData = {
        session: {
          id: 'session_001',
          courseId,
          courseName: '植物工厂探索',
          startTime: new Date(Date.now() - 45 * 60 * 1000),
          endTime: new Date(),
          totalDuration: 45 * 60, // 45分钟
        },
        resources: [
          {
            resourceId: 'res_001',
            title: '认识植物工厂课件',
            type: 'presentation',
            completed: true,
            viewDuration: 8 * 60,
          },
          {
            resourceId: 'res_002',
            title: '植物生长周期视频',
            type: 'video',
            completed: true,
            viewDuration: 12 * 60,
            totalDuration: 15 * 60,
          },
          {
            resourceId: 'res_003',
            title: '水培技术详解',
            type: 'document',
            completed: true,
            viewDuration: 5 * 60,
          },
          {
            resourceId: 'res_004',
            title: '实践案例分析',
            type: 'document',
            completed: false,
            viewDuration: 0,
          },
        ],
        tasks: [
          {
            taskId: 'task_001',
            title: '基础知识测验',
            type: 'quiz',
            required: true,
            completed: true,
            score: 95,
            totalScore: 100,
            correctCount: 19,
            totalCount: 20,
            timeSpent: 8 * 60,
            competencyTags: ['critical_thinking', 'information_synthesis'],
            attempts: 1,
            improvements: {
              betterThanPrevious: true,
              scoreImprovement: 5,
            },
          },
          {
            taskId: 'task_002',
            title: '综合练习',
            type: 'quiz',
            required: true,
            completed: true,
            score: 85,
            totalScore: 100,
            correctCount: 17,
            totalCount: 20,
            timeSpent: 12 * 60,
            competencyTags: ['critical_thinking', 'metacognition'],
            attempts: 1,
          },
          {
            taskId: 'task_003',
            title: '实践反思',
            type: 'reflection',
            required: true,
            completed: true,
            timeSpent: 15 * 60,
            competencyTags: ['metacognition', 'information_synthesis'],
            attempts: 1,
          },
          {
            taskId: 'task_004',
            title: '方案设计（选修）',
            type: 'assignment',
            required: false,
            completed: false,
            timeSpent: 0,
            attempts: 0,
          },
        ],
        previousSessions: [
          {
            sessionId: 'session_000',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            completionRate: 75,
            avgScore: 85,
          },
        ],
        progress: {
          completionRateChange: 25,
          avgScoreChange: 5,
          streakDays: 3,
          achievements: ['首次全对', '快速提升'],
        },
        aiObservations: [
          {
            id: 'obs_001',
            type: 'praise',
            message: '你在反思题中展现了出色的独立思考能力，能够结合实际情况分析问题。',
            timestamp: new Date(Date.now() - 20 * 60 * 1000),
          },
          {
            id: 'obs_002',
            type: 'suggestion',
            message: '建议下次尝试用图表或示意图辅助说明，会让你的观点更加清晰。',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
          },
        ],
      };

      setReportData(mockData);
      setIsLoading(false);
    }, 1000);
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity size={48} className="text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">正在生成报告...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">无法加载报告数据</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">学习报告</h1>
                <p className="text-sm text-gray-500">{reportData.session.courseName}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={16} />
              导出PDF
            </button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 完成提示 */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">🎉 课程完成！</h2>
                <p className="text-green-100">
                  太棒了！你已完成所有必修任务。查看下方报告了解你的学习成果。
                </p>
              </div>
            </div>
          </div>

          {/* 第一层：统计数据 */}
          <StatisticsPanel reportData={reportData} />

          {/* 第二层：进步变动 */}
          <ProgressPanel reportData={reportData} />

          {/* 第三层：能力分析（条件渲染） */}
          <CompetencyPanel reportData={reportData} />

          {/* AI观察（可选） */}
          <AIObservationsPanel reportData={reportData} />

          {/* 学习建议 */}
          <RecommendationsPanel reportData={reportData} />
        </div>
      </main>

      {/* 底部操作栏 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/student/workbench')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} />
              返回工作台
            </button>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                分享报告
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                继续学习
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
