'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ClassCompetencyDistribution, COMPETENCY_DEFINITIONS, getStarLevelColor } from '../../../note-config/results-view'

// ============================================
// Teacher Competency Insights Type Definitions
// ============================================

// Competency dimension types (aligned with results-view.tsx)
type CompetencyType =
  | 'critical_thinking'      // 批判性思维
  | 'information_synthesis'  // 信息整合
  | 'metacognition'          // 元认知
  | 'question_quality'       // 提问质量
  | 'creativity'             // 创造性
  | 'persistence';           // 坚持性

// Distribution data for a single competency
interface CompetencyDistributionData {
  source: 'teacher_assigned' | 'ai_detected';
  level1: number;  // ★ 的学生百分比
  level2: number;  // ★★
  level3: number;  // ★★★
  level4: number;  // ★★★★
  avgRating: number;  // 班级平均分 1-4
  totalStudents: number;
  studentsDetected?: number;  // 仅AI识别维度需要
}

// Filter options for competency insights
interface CompetencyFilterOptions {
  courseIds?: string[];
  timeRange?: { start: Date; end: Date };
  studentGroup?: 'all' | 'active' | 'inactive';
}

// ============================================
// PRD V3 Data Model - Three Certainty Layers
// ============================================

// Class (班级) data model
interface ClassInfo {
  classId: string;
  className: string;
  studentCount: number;
}

// Student detail for drill-down
interface StudentDetail {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  status: StudentStatus;
  progress: number;
  learningDuration: number;
  objectiveScore?: number;
  competencyScores?: Record<CompetencyType, number>; // 1-4 stars
}

// Layer 1: Guaranteed Statistics (100% certain)
interface GuaranteedStatistics {
  totalStudents: number;
  enrolledStudents: number;
  lastActiveTime: string;
  averageProgress: number;  // 0-100
  averageLearningDuration: number;  // minutes
}

// Layer 2: Conditional Score Data (conditional)
interface ConditionalScoreData {
  objectiveScores?: {
    totalQuizzes: number;
    completedQuizzes: number;
    averageScore: number;  // 0-100
    scoreDistribution: {
      excellent: number;  // 90-100
      good: number;       // 80-89
      pass: number;       // 60-79
      fail: number;       // 0-59
    };
  };
  subjectiveScores?: {
    totalAssignments: number;
    gradedAssignments: number;
    averageScore: number;
  };
}

// Layer 3: Optional Competency Data (completely optional)
interface OptionalCompetencyData {
  hasCompetencyConfig: boolean;
  competencyDistributions: ClassCompetencyDistribution[];
}

// Student status types
type StudentStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_attention';

interface StudentStatusDistribution {
  notStarted: number;
  inProgress: number;
  completed: number;
  needsAttention: number;
}

// ============================================
// PRD V3 Mock Data - Complete Course Data
// ============================================

// Mock Classes
const mockClasses: ClassInfo[] = [
  { classId: 'class-1', className: '一班', studentCount: 28 },
  { classId: 'class-2', className: '二班', studentCount: 30 },
  { classId: 'class-3', className: '三班', studentCount: 27 },
]

// Mock Students (for drill-down)
const mockStudents: StudentDetail[] = [
  // 一班学生
  { studentId: 's1', studentName: '张三', classId: 'class-1', className: '一班', status: 'completed', progress: 100, learningDuration: 50, objectiveScore: 92, competencyScores: { critical_thinking: 4, information_synthesis: 3, metacognition: 3, question_quality: 4, creativity: 3, persistence: 4 } },
  { studentId: 's2', studentName: '李四', classId: 'class-1', className: '一班', status: 'completed', progress: 100, learningDuration: 48, objectiveScore: 88, competencyScores: { critical_thinking: 3, information_synthesis: 4, metacognition: 3, question_quality: 3, creativity: 4, persistence: 3 } },
  { studentId: 's3', studentName: '王五', classId: 'class-1', className: '一班', status: 'in_progress', progress: 75, learningDuration: 42, objectiveScore: 85, competencyScores: { critical_thinking: 3, information_synthesis: 3, metacognition: 4, question_quality: 3, creativity: 3, persistence: 3 } },
  { studentId: 's4', studentName: '赵六', classId: 'class-1', className: '一班', status: 'completed', progress: 100, learningDuration: 55, objectiveScore: 95, competencyScores: { critical_thinking: 4, information_synthesis: 4, metacognition: 4, question_quality: 4, creativity: 4, persistence: 4 } },
  { studentId: 's5', studentName: '孙七', classId: 'class-1', className: '一班', status: 'in_progress', progress: 68, learningDuration: 38, objectiveScore: 78, competencyScores: { critical_thinking: 2, information_synthesis: 3, metacognition: 2, question_quality: 3, creativity: 2, persistence: 3 } },
  { studentId: 's6', studentName: '周八', classId: 'class-1', className: '一班', status: 'completed', progress: 100, learningDuration: 52, objectiveScore: 90, competencyScores: { critical_thinking: 4, information_synthesis: 3, metacognition: 3, question_quality: 4, creativity: 3, persistence: 4 } },
  { studentId: 's7', studentName: '吴九', classId: 'class-1', className: '一班', status: 'needs_attention', progress: 45, learningDuration: 25, objectiveScore: 65, competencyScores: { critical_thinking: 2, information_synthesis: 2, metacognition: 2, question_quality: 2, creativity: 2, persistence: 1 } },
  { studentId: 's8', studentName: '郑十', classId: 'class-1', className: '一班', status: 'completed', progress: 100, learningDuration: 47, objectiveScore: 87, competencyScores: { critical_thinking: 3, information_synthesis: 3, metacognition: 3, question_quality: 3, creativity: 3, persistence: 3 } },

  // 二班学生
  { studentId: 's9', studentName: '陈一', classId: 'class-2', className: '二班', status: 'completed', progress: 100, learningDuration: 45, objectiveScore: 82, competencyScores: { critical_thinking: 3, information_synthesis: 3, metacognition: 3, question_quality: 3, creativity: 3, persistence: 3 } },
  { studentId: 's10', studentName: '林二', classId: 'class-2', className: '二班', status: 'in_progress', progress: 80, learningDuration: 40, objectiveScore: 80, competencyScores: { critical_thinking: 3, information_synthesis: 3, metacognition: 3, question_quality: 3, creativity: 3, persistence: 3 } },
  { studentId: 's11', studentName: '黄三', classId: 'class-2', className: '二班', status: 'completed', progress: 100, learningDuration: 50, objectiveScore: 88, competencyScores: { critical_thinking: 3, information_synthesis: 4, metacognition: 3, question_quality: 3, creativity: 3, persistence: 3 } },
  { studentId: 's12', studentName: '刘四', classId: 'class-2', className: '二班', status: 'not_started', progress: 0, learningDuration: 0, competencyScores: { critical_thinking: 1, information_synthesis: 1, metacognition: 1, question_quality: 1, creativity: 1, persistence: 1 } },
  { studentId: 's13', studentName: '杨五', classId: 'class-2', className: '二班', status: 'completed', progress: 100, learningDuration: 48, objectiveScore: 85, competencyScores: { critical_thinking: 3, information_synthesis: 3, metacognition: 3, question_quality: 3, creativity: 3, persistence: 3 } },
  { studentId: 's14', studentName: '许六', classId: 'class-2', className: '二班', status: 'in_progress', progress: 70, learningDuration: 35, objectiveScore: 75, competencyScores: { critical_thinking: 2, information_synthesis: 3, metacognition: 2, question_quality: 2, creativity: 3, persistence: 2 } },
  { studentId: 's15', studentName: '何七', classId: 'class-2', className: '二班', status: 'completed', progress: 100, learningDuration: 52, objectiveScore: 91, competencyScores: { critical_thinking: 4, information_synthesis: 3, metacognition: 3, question_quality: 4, creativity: 3, persistence: 4 } },
  { studentId: 's16', studentName: '罗八', classId: 'class-2', className: '二班', status: 'needs_attention', progress: 30, learningDuration: 18, objectiveScore: 58, competencyScores: { critical_thinking: 1, information_synthesis: 2, metacognition: 1, question_quality: 2, creativity: 1, persistence: 1 } },

  // 三班学生
  { studentId: 's17', studentName: '高一', classId: 'class-3', className: '三班', status: 'completed', progress: 100, learningDuration: 46, objectiveScore: 86, competencyScores: { critical_thinking: 3, information_synthesis: 3, metacognition: 3, question_quality: 3, creativity: 3, persistence: 3 } },
  { studentId: 's18', studentName: '梁二', classId: 'class-3', className: '三班', status: 'in_progress', progress: 72, learningDuration: 38, objectiveScore: 79, competencyScores: { critical_thinking: 3, information_synthesis: 3, metacognition: 2, question_quality: 3, creativity: 2, persistence: 3 } },
  { studentId: 's19', studentName: '郭三', classId: 'class-3', className: '三班', status: 'completed', progress: 100, learningDuration: 49, objectiveScore: 89, competencyScores: { critical_thinking: 3, information_synthesis: 3, metacognition: 3, question_quality: 3, creativity: 4, persistence: 3 } },
  { studentId: 's20', studentName: '钱四', classId: 'class-3', className: '三班', status: 'completed', progress: 100, learningDuration: 51, objectiveScore: 93, competencyScores: { critical_thinking: 4, information_synthesis: 4, metacognition: 3, question_quality: 4, creativity: 3, persistence: 4 } },
  { studentId: 's21', studentName: '孔五', classId: 'class-3', className: '三班', status: 'in_progress', progress: 65, learningDuration: 32, objectiveScore: 72, competencyScores: { critical_thinking: 2, information_synthesis: 2, metacognition: 3, question_quality: 2, creativity: 2, persistence: 2 } },
  { studentId: 's22', studentName: '严六', classId: 'class-3', className: '三班', status: 'not_started', progress: 0, learningDuration: 0, competencyScores: { critical_thinking: 1, information_synthesis: 1, metacognition: 1, question_quality: 1, creativity: 1, persistence: 1 } },
  { studentId: 's23', studentName: '华七', classId: 'class-3', className: '三班', status: 'completed', progress: 100, learningDuration: 47, objectiveScore: 84, competencyScores: { critical_thinking: 3, information_synthesis: 3, metacognition: 3, question_quality: 3, creativity: 3, persistence: 3 } },
  { studentId: 's24', studentName: '金八', classId: 'class-3', className: '三班', status: 'needs_attention', progress: 40, learningDuration: 22, objectiveScore: 62, competencyScores: { critical_thinking: 2, information_synthesis: 2, metacognition: 2, question_quality: 2, creativity: 1, persistence: 1 } },
]

// Generate more students to reach 85 total
for (let i = 25; i <= 85; i++) {
  const classIndex = (i - 1) % 3
  const classInfo = mockClasses[classIndex]
  const statuses: StudentStatus[] = ['completed', 'in_progress', 'not_started', 'needs_attention']
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  const progress = randomStatus === 'completed' ? 100 : randomStatus === 'not_started' ? 0 : Math.floor(Math.random() * 80) + 20
  const score = Math.floor(Math.random() * 40) + 60

  mockStudents.push({
    studentId: `s${i}`,
    studentName: `学生${i}`,
    classId: classInfo.classId,
    className: classInfo.className,
    status: randomStatus,
    progress,
    learningDuration: Math.floor(Math.random() * 40) + 20,
    objectiveScore: randomStatus !== 'not_started' ? score : undefined,
    competencyScores: {
      critical_thinking: Math.floor(Math.random() * 3) + 1,
      information_synthesis: Math.floor(Math.random() * 3) + 1,
      metacognition: Math.floor(Math.random() * 3) + 1,
      question_quality: Math.floor(Math.random() * 3) + 1,
      creativity: Math.floor(Math.random() * 3) + 1,
      persistence: Math.floor(Math.random() * 3) + 1,
    }
  })
}

// Layer 1: Guaranteed Statistics (ALWAYS available)
const mockGuaranteedStats: GuaranteedStatistics = {
  totalStudents: 85,
  enrolledStudents: 82,
  lastActiveTime: '2025-01-15T14:30:00Z',
  averageProgress: 75,
  averageLearningDuration: 45, // minutes
}

// Layer 2: Conditional Score Data
const mockConditionalScores: ConditionalScoreData = {
  objectiveScores: {
    totalQuizzes: 12,
    completedQuizzes: 10,
    averageScore: 82,
    scoreDistribution: {
      excellent: 18,  // 90-100
      good: 32,       // 80-89
      pass: 24,       // 60-79
      fail: 8,        // 0-59
    },
  },
  subjectiveScores: {
    totalAssignments: 8,
    gradedAssignments: 6,
    averageScore: 85,
  },
}

// Layer 3: Optional Competency Data
const mockOptionalCompetency: OptionalCompetencyData = {
  hasCompetencyConfig: true,
  competencyDistributions: [
    {
      competencyType: 'critical_thinking',
      distribution: { star1: 8, star2: 22, star3: 38, star4: 17 },
      averageStars: 2.8,
      totalStudents: 85,
    },
    {
      competencyType: 'information_synthesis',
      distribution: { star1: 5, star2: 18, star3: 42, star4: 20 },
      averageStars: 2.9,
      totalStudents: 85,
    },
    {
      competencyType: 'metacognition',
      distribution: { star1: 12, star2: 25, star3: 30, star4: 18 },
      averageStars: 2.6,
      totalStudents: 85,
    },
  ],
}

// Student Status Distribution
const mockStudentStatus: StudentStatusDistribution = {
  notStarted: 3,
  inProgress: 18,
  completed: 55,
  needsAttention: 9,
}

// Task Completion Data
interface TaskCompletion {
  taskId: string;
  taskName: string;
  taskType: 'quiz' | 'assignment' | 'project';
  totalStudents: number;
  completedStudents: number;
  averageScore?: number;
  averageDuration: number; // minutes
  dueDate?: string;
}

const mockTaskCompletions: TaskCompletion[] = [
  {
    taskId: 'task-1',
    taskName: '植物生长环境观测',
    taskType: 'assignment',
    totalStudents: 82,
    completedStudents: 78,
    averageScore: 87,
    averageDuration: 35,
  },
  {
    taskId: 'task-2',
    taskName: '数据收集与分析',
    taskType: 'project',
    totalStudents: 82,
    completedStudents: 65,
    averageScore: 82,
    averageDuration: 55,
  },
  {
    taskId: 'task-3',
    taskName: '植物工厂设计挑战',
    taskType: 'assignment',
    totalStudents: 82,
    completedStudents: 45,
    averageDuration: 70,
  },
  {
    taskId: 'task-4',
    taskName: '光合作用原理测验',
    taskType: 'quiz',
    totalStudents: 82,
    completedStudents: 72,
    averageScore: 79,
    averageDuration: 15,
  },
]

// High-frequency error questions (for objective score analysis)
interface ErrorQuestion {
  questionId: string;
  questionText: string;
  errorRate: number; // percentage
  averageScore: number;
  totalAttempts: number;
}

const mockErrorQuestions: ErrorQuestion[] = [
  {
    questionId: 'q-1',
    questionText: '植物光合作用的主要产物是什么？',
    errorRate: 42,
    averageScore: 58,
    totalAttempts: 75,
  },
  {
    questionId: 'q-2',
    questionText: '以下哪个因素对植物生长影响最大？',
    errorRate: 38,
    averageScore: 62,
    totalAttempts: 78,
  },
  {
    questionId: 'q-3',
    questionText: '植物工厂中LED灯的主要作用是什么？',
    errorRate: 35,
    averageScore: 65,
    totalAttempts: 80,
  },
]

// AI-discovered additional competencies
interface AIDiscoveredCompetency {
  competencyType: CompetencyType;
  studentCount: number;
  description: string;
  confidence: 'high' | 'medium' | 'low';
}

const mockAIDiscoveredCompetencies: AIDiscoveredCompetency[] = [
  {
    competencyType: 'question_quality',
    studentCount: 65,
    description: '学生在探究活动中表现出高质量提问能力',
    confidence: 'high',
  },
  {
    competencyType: 'creativity',
    studentCount: 58,
    description: '学生在植物工厂设计中展现创新思维',
    confidence: 'medium',
  },
  {
    competencyType: 'persistence',
    studentCount: 70,
    description: '学生在长期观测任务中表现出坚持性',
    confidence: 'high',
  },
]

// Data Delta Information (for change indicators)
interface DataDelta {
  value: number;
  delta: number;
  deltaLabel?: string;
}

const mockOverviewDeltas = {
  enrolledStudents: {
    current: 82,
    previous: 80,
    delta: 2,
    deltaLabel: '比上周',
  },
  averageProgress: {
    current: 75,
    previous: 68,
    delta: 7,
    deltaLabel: '比上次课',
  },
  averageDuration: {
    current: 45,
    previous: 42,
    delta: 3,
    deltaLabel: '比上周',
  },
}

interface CourseResultsPageProps {
  params: {
    id: string
  }
}

// Clickable Competency Distribution Chart Component
function ClickableCompetencyDistributionChart({
  distribution,
  onBarClick,
}: {
  distribution: ClassCompetencyDistribution;
  onBarClick: (level: 1 | 2 | 3 | 4, count: number) => void;
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
          <button
            key={bar.level}
            onClick={() => onBarClick(bar.level as 1 | 2 | 3 | 4, bar.count)}
            className="w-full flex items-center gap-2 hover:bg-white/50 rounded-lg p-1 -m-1 transition-colors cursor-pointer"
            disabled={bar.count === 0}
          >
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
            {bar.count > 0 && (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CourseResultsPage({ params }: CourseResultsPageProps) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StudentStatus | 'all'>('all')
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | 'all'>('all')
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean
    title: string
    students: StudentDetail[]
  }>({
    isOpen: false,
    title: '',
    students: [],
  })

  // 模拟课程数据
  const course = {
    id: params.id,
    title: '植物工厂探究',
    subjects: ['科学', '技术', '工程'],
    students: mockGuaranteedStats.totalStudents,
    status: 'ongoing' as const,
    isPublished: true,
    hasObjectiveQuestions: mockConditionalScores.objectiveScores !== undefined,
  }

  // Filter students by selected class
  const getFilteredStudents = () => {
    if (selectedClassId === 'all') return mockStudents
    return mockStudents.filter(s => s.classId === selectedClassId)
  }

  const filteredStudents = getFilteredStudents()

  // Recalculate statistics based on filtered students
  const filteredStats = {
    totalStudents: filteredStudents.length,
    enrolledStudents: filteredStudents.length,
    averageProgress: Math.round(filteredStudents.reduce((sum, s) => sum + s.progress, 0) / filteredStudents.length),
    averageLearningDuration: Math.round(filteredStudents.reduce((sum, s) => sum + s.learningDuration, 0) / filteredStudents.length),
    lastActiveTime: mockGuaranteedStats.lastActiveTime,
  }

  const filteredStudentStatus = {
    notStarted: filteredStudents.filter(s => s.status === 'not_started').length,
    inProgress: filteredStudents.filter(s => s.status === 'in_progress').length,
    completed: filteredStudents.filter(s => s.status === 'completed').length,
    needsAttention: filteredStudents.filter(s => s.status === 'needs_attention').length,
  }

  // Open drill-down modal
  const openDrillDown = (title: string, students: StudentDetail[]) => {
    setDrillDownModal({
      isOpen: true,
      title,
      students,
    })
  }

  // Close drill-down modal
  const closeDrillDown = () => {
    setDrillDownModal({
      isOpen: false,
      title: '',
      students: [],
    })
  }

  // Format last active time
  const formatLastActiveTime = (isoTime: string) => {
    const date = new Date(isoTime)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return '刚刚活跃'
    if (diffHours < 24) return `${diffHours}小时前活跃`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}天前活跃`
    return date.toLocaleDateString('zh-CN')
  }

  // Render delta indicator
  const renderDeltaIndicator = (delta: number, label: string) => {
    const isPositive = delta > 0
    const isNeutral = delta === 0

    return (
      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : isNeutral ? 'text-gray-400' : 'text-red-600'}`}>
        {isPositive ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        ) : isNeutral ? null : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        <span>{isNeutral ? '-' : `${isPositive ? '+' : ''}${delta}%`} ({label})</span>
      </div>
    )
  }

  // Get student status filter options
  const statusFilters = [
    { value: 'all' as const, label: '全部', count: filteredStats.enrolledStudents },
    { value: 'in_progress' as const, label: '进行中', count: filteredStudentStatus.inProgress },
    { value: 'completed' as const, label: '已完成', count: filteredStudentStatus.completed },
    { value: 'not_started' as const, label: '未开始', count: filteredStudentStatus.notStarted },
    { value: 'needs_attention' as const, label: '需关注', count: filteredStudentStatus.needsAttention },
  ]

  // Generate insights based on student status
  const generateStudentStatusInsights = () => {
    const insights = []

    if (filteredStudentStatus.needsAttention > 0) {
      insights.push(`${filteredStudentStatus.needsAttention}名学生超过48小时未活跃，建议关注`)
    }

    if (filteredStudentStatus.notStarted > 0) {
      insights.push(`${filteredStudentStatus.notStarted}名学生尚未开始学习，需要引导`)
    }

    if (filteredStudentStatus.completed === filteredStats.enrolledStudents) {
      insights.push('🎉 全部学生已完成学习任务')
    }

    return insights
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/teacher"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回课程列表
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {course.students} 名学生
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {course.isPublished ? '已发布' : '草稿'}
                </div>
                <div className="flex gap-1">
                  {course.subjects.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                导出报告
              </button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* Class Filter Section                        */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 animate-fade-in">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-700">班级筛选</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedClassId('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedClassId === 'all'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部班级
                <span className="ml-1 opacity-75">({mockGuaranteedStats.totalStudents}人)</span>
              </button>
              {mockClasses.map((classInfo) => (
                <button
                  key={classInfo.classId}
                  onClick={() => setSelectedClassId(classInfo.classId)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedClassId === classInfo.classId
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {classInfo.className}
                  <span className="ml-1 opacity-75">({classInfo.studentCount}人)</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* PRD V3 Section 5.2.1: Class Overview Cards    */}
        {/* Priority: 1 (ALWAYS_SHOW)                 */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Total Enrolled Students Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">参与学生</p>
                <p className="text-2xl font-bold text-gray-900">{filteredStats.enrolledStudents}</p>
              </div>
            </div>
            {renderDeltaIndicator(
              Math.round((mockOverviewDeltas.enrolledStudents.delta / mockOverviewDeltas.enrolledStudents.previous) * 100),
              mockOverviewDeltas.enrolledStudents.deltaLabel
            )}
          </div>

          {/* Average Progress Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">平均进度</p>
                <p className="text-2xl font-bold text-gray-900">{filteredStats.averageProgress}%</p>
              </div>
            </div>
            {renderDeltaIndicator(mockOverviewDeltas.averageProgress.delta, mockOverviewDeltas.averageProgress.deltaLabel)}
          </div>

          {/* Average Learning Duration Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">平均学习时长</p>
                <p className="text-2xl font-bold text-gray-900">{filteredStats.averageLearningDuration}</p>
              </div>
            </div>
            {renderDeltaIndicator(mockOverviewDeltas.averageDuration.delta, mockOverviewDeltas.averageDuration.deltaLabel)}
          </div>

          {/* Last Active Time Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">最近活跃</p>
                <p className="text-sm font-semibold text-gray-900">{formatLastActiveTime(filteredStats.lastActiveTime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* PRD V3 Section 5.2.2: Student Status Distribution */}
        {/* Priority: 2 (ALWAYS_SHOW)                 */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              学生状态分布
            </h3>
          </div>

          <div className="p-5">
            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-5">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatusFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStatusFilter === filter.value
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                  <span className="ml-1 opacity-75">({filter.count})</span>
                </button>
              ))}
            </div>

            {/* Status Distribution Visualization */}
            <div className="space-y-3 mb-5">
              {statusFilters
                .filter((f) => f.value !== 'all')
                .map((status) => {
                  const percentage = (status.count / filteredStats.enrolledStudents) * 100
                  const statusConfig = {
                    in_progress: { color: 'bg-blue-500', label: '进行中' },
                    completed: { color: 'bg-green-500', label: '已完成' },
                    not_started: { color: 'bg-gray-400', label: '未开始' },
                    needs_attention: { color: 'bg-orange-500', label: '需关注' },
                  }
                  const config = statusConfig[status.value as keyof typeof statusConfig]

                  return (
                    <button
                      key={status.value}
                      onClick={() => {
                        const studentsInStatus = filteredStudents.filter(s => s.status === status.value)
                        openDrillDown(`${config.label} (${studentsInStatus.length}人)`, studentsInStatus)
                      }}
                      className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                    >
                      <div className="w-20 text-sm text-gray-600">{config.label}</div>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${config.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-16 text-right text-sm font-medium text-gray-900">
                        {status.count}人 ({Math.round(percentage)}%)
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )
                })}
            </div>

            {/* Insight Messages */}
            {generateStudentStatusInsights().length > 0 && (
              <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 mb-1">班级状态洞察</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {generateStudentStatusInsights().map((insight, index) => (
                        <li key={index}>• {insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* PRD V3 Section 5.2.3: Task Completion        */}
        {/* Priority: 3 (ALWAYS_SHOW)                 */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              任务完成情况
            </h3>
          </div>

          <div className="p-5 space-y-3">
            {mockTaskCompletions.map((task) => {
              const completionRate = (task.completedStudents / task.totalStudents) * 100
              const isExpanded = expandedTaskId === task.taskId

              const taskTypeConfig = {
                quiz: { label: '测验', color: 'bg-purple-100 text-purple-700' },
                assignment: { label: '作业', color: 'bg-blue-100 text-blue-700' },
                project: { label: '项目', color: 'bg-green-100 text-green-700' },
              }
              const typeConfig = taskTypeConfig[task.taskType]

              return (
                <div
                  key={task.taskId}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 transition-colors"
                >
                  <button
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.taskId)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                      <span className="font-medium text-gray-800 text-left flex-1">{task.taskName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {task.completedStudents}/{task.totalStudents} 人完成
                        </span>
                        <span className="text-sm font-semibold text-primary-600">
                          {Math.round(completionRate)}%
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ml-2 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Progress Bar */}
                  <div className="px-4 pb-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 animate-fade-in">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">平均完成时长</p>
                          <p className="font-semibold text-gray-900">{task.averageDuration} 分钟</p>
                        </div>
                        {task.averageScore !== undefined && (
                          <div>
                            <p className="text-gray-500 mb-1">平均得分</p>
                            <p className="font-semibold text-gray-900">{task.averageScore} 分</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500 mb-1">完成率</p>
                          <p className="font-semibold text-gray-900">{Math.round(completionRate)}%</p>
                        </div>
                        {task.dueDate && (
                          <div>
                            <p className="text-gray-500 mb-1">截止日期</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ============================================ */}
        {/* PRD V3 Section 5.2.4: Objective Score Analysis */}
        {/* Priority: 4 (SHOW_WHEN_DATA)              */}
        {/* Conditional: Only show when has objective questions */}
        {/* ============================================ */}
        {course.hasObjectiveQuestions && mockConditionalScores.objectiveScores && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  客观题得分分析
                </h3>
                <span className="text-xs text-gray-500">
                  {mockConditionalScores.objectiveScores.completedQuizzes}/{mockConditionalScores.objectiveScores.totalQuizzes} 个测验已完成
                </span>
              </div>
            </div>

            <div className="p-5">
              {/* Class Average Score with Delta */}
              <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">班级平均分</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {mockConditionalScores.objectiveScores.averageScore}
                      <span className="text-lg text-gray-500 ml-1">分</span>
                    </p>
                  </div>
                  <div className="text-right">
                    {renderDeltaIndicator(5, '比上次')}
                    <p className="text-xs text-gray-500 mt-1">共 {mockConditionalScores.objectiveScores.totalQuizzes} 个测验</p>
                  </div>
                </div>
              </div>

              {/* Score Distribution */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">分数段分布</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { range: '90-100', label: '优秀', count: mockConditionalScores.objectiveScores.scoreDistribution.excellent, color: 'bg-green-500', min: 90, max: 100 },
                    { range: '80-89', label: '良好', count: mockConditionalScores.objectiveScores.scoreDistribution.good, color: 'bg-blue-500', min: 80, max: 89 },
                    { range: '60-79', label: '及格', count: mockConditionalScores.objectiveScores.scoreDistribution.pass, color: 'bg-yellow-500', min: 60, max: 79 },
                    { range: '0-59', label: '不及格', count: mockConditionalScores.objectiveScores.scoreDistribution.fail, color: 'bg-red-500', min: 0, max: 59 },
                  ].map((segment) => {
                    const percentage = (segment.count / filteredStats.enrolledStudents) * 100
                    return (
                      <button
                        key={segment.range}
                        onClick={() => {
                          // Filter students by score range
                          const studentsInRange = filteredStudents.filter(s => {
                            const score = s.objectiveScore;
                            return score !== undefined && score >= segment.min && score <= segment.max;
                          });
                          openDrillDown(`${segment.label} (${segment.range}分) - ${studentsInRange.length}人`, studentsInRange);
                        }}
                        className="text-center hover:scale-105 transition-transform cursor-pointer"
                      >
                        <div className={`h-20 ${segment.color} rounded-lg mb-2 flex items-end justify-center pb-2 hover:opacity-90 transition-opacity`}>
                          <span className="text-white font-bold text-lg">{segment.count}</span>
                        </div>
                        <p className="text-xs text-gray-500">{segment.range}分</p>
                        <p className="text-sm font-medium text-gray-700">{segment.label}</p>
                        <p className="text-xs text-gray-400">{Math.round(percentage)}%</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* High-frequency Error Questions */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">高频错误题目</h4>
                <div className="space-y-2">
                  {mockErrorQuestions.map((question) => (
                    <div key={question.questionId} className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-gray-800 flex-1">{question.questionText}</p>
                        <span className="ml-3 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium whitespace-nowrap">
                          错误率 {question.errorRate}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>平均得分: {question.averageScore}分</span>
                        <span>作答人数: {question.totalAttempts}人</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* PRD V3 Section 5.2.5: Competency Distribution  */}
        {/* Priority: 5 (SHOW_WHEN_CONFIG)            */}
        {/* Conditional: Only show when teacher configured competency dimensions */}
        {/* ============================================ */}
        {mockOptionalCompetency.hasCompetencyConfig && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  能力维度分布
                </h3>
                <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border border-primary-200">
                  跨学科核心能力评估
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockOptionalCompetency.competencyDistributions.map((distribution) => (
                  <ClickableCompetencyDistributionChart
                    key={distribution.competencyType}
                    distribution={distribution}
                    onBarClick={(level, count) => {
                      if (count === 0) return;
                      // Filter students by competency level
                      const studentsWithLevel = filteredStudents.filter(s => {
                        const competencyScore = s.competencyScores?.[distribution.competencyType];
                        return competencyScore === level;
                      });
                      const competencyName = COMPETENCY_DEFINITIONS[distribution.competencyType].name;
                      openDrillDown(`${competencyName} - ${'★'.repeat(level)} (${studentsWithLevel.length}人)`, studentsWithLevel);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* PRD V3 Section 5.2.6: AI-Discovered Competencies */}
        {/* Priority: 6 (SHOW_WHEN_DATA)              */}
        {/* Conditional: Only show when AI detected additional competencies */}
        {/* ============================================ */}
        {mockAIDiscoveredCompetencies.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI 发现的能力表现
                </h3>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  AI 智能分析
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="space-y-3">
                {mockAIDiscoveredCompetencies.map((competency) => {
                  const confidenceConfig = {
                    high: { color: 'bg-green-100 text-green-700', label: '高置信度' },
                    medium: { color: 'bg-yellow-100 text-yellow-700', label: '中置信度' },
                    low: { color: 'bg-gray-100 text-gray-700', label: '低置信度' },
                  }
                  const config = confidenceConfig[competency.confidence]

                  const competencyLabels: Record<CompetencyType, string> = {
                    critical_thinking: '批判性思维',
                    information_synthesis: '信息整合',
                    metacognition: '元认知',
                    question_quality: '提问质量',
                    creativity: '创造性',
                    persistence: '坚持性',
                  }

                  return (
                    <div
                      key={competency.competencyType}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800">
                              {competencyLabels[competency.competencyType]}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{competency.description}</p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-2xl font-bold text-primary-600">{competency.studentCount}</p>
                          <p className="text-xs text-gray-500">名学生表现出此能力</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* Student Drill-Down Modal                    */}
      {/* ============================================ */}
      {drillDownModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{drillDownModal.title}</h3>
                <button
                  onClick={closeDrillDown}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {drillDownModal.students.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500">暂无学生数据</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {drillDownModal.students.map((student) => (
                    <div
                      key={student.studentId}
                      className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{student.studentName}</h4>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {student.className}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              student.status === 'completed' ? 'bg-green-100 text-green-700' :
                              student.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              student.status === 'not_started' ? 'bg-gray-100 text-gray-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {student.status === 'completed' ? '已完成' :
                               student.status === 'in_progress' ? '进行中' :
                               student.status === 'not_started' ? '未开始' : '需关注'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">学习进度</p>
                              <p className="font-semibold text-gray-900">{student.progress}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">学习时长</p>
                              <p className="font-semibold text-gray-900">{student.learningDuration}分钟</p>
                            </div>
                            {student.objectiveScore !== undefined && (
                              <div>
                                <p className="text-gray-500 mb-1">客观题得分</p>
                                <p className="font-semibold text-gray-900">{student.objectiveScore}分</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // TODO: Navigate to student detail page
                            alert(`跳转到学生 ${student.studentName} 的详情页面`)
                          }}
                          className="ml-4 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                共 {drillDownModal.students.length} 名学生
              </p>
              <button
                onClick={closeDrillDown}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
