'use client'

import { useState, useMemo, use } from 'react'
import Link from 'next/link'
import { ClassCompetencyDistribution, COMPETENCY_DEFINITIONS, getStarLevelColor } from '../../../note-config/results-view'

// ============================================
// Type Definitions
// ============================================

type CompetencyType =
  | 'critical_thinking'
  | 'information_synthesis'
  | 'metacognition'
  | 'question_quality'
  | 'creativity'
  | 'persistence';

type StudentStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_attention';

interface ClassInfo {
  classId: string;
  className: string;
  studentCount: number;
}

// 资源查看记录（来源：ResourceAccessLog）
interface StudentResourceView {
  resourceId: string;
  viewCount: number;
  totalViewTime: number; // 秒
  lastViewedAt: Date | null;
}

// 任务提交详情（来源：TaskSubmission + TaskAssessment）
interface StudentTaskSubmission {
  taskId: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  submittedAt?: Date;
  score?: number;
  totalScore?: number;
  correctCount?: number;
  totalCount?: number;
  assessment?: {
    level: 'excellent' | 'good' | 'pass' | 'fail';
    feedback: string;
    competencyRatings?: Record<CompetencyType, number>;
  };
  studentAnswer?: string;
}

// AI 对话记录（来源：Message[]）
interface AIConversation {
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentType?: 'tutor' | 'assessor' | 'metacognition';
}

// 完整学生数据
interface StudentDetail {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  status: StudentStatus;
  progress: number;
  learningDuration: number;
  objectiveScore?: number;
  competencyScores?: Record<CompetencyType, number>;
  resourceViews: StudentResourceView[];
  taskSubmissions: StudentTaskSubmission[];
  aiConversations: AIConversation[];
}

// 资源定义
interface ResourceInfo {
  resourceId: string;
  title: string;
  type: 'document' | 'presentation' | 'video';
  duration?: string;
}

// 任务定义
interface TaskInfo {
  taskId: string;
  title: string;
  type: 'quiz' | 'assignment' | 'reflection';
  required: boolean;
  hasCompetencyConfig: boolean;
  assignedCompetencies?: CompetencyType[];
}

// ============================================
// Mock Data - 资源和任务定义
// ============================================

const mockResources: ResourceInfo[] = [
  { resourceId: 'resource_1', title: '认识植物工厂学生手册', type: 'document', duration: '约15分钟' },
  { resourceId: 'resource_2', title: '水培植物工厂与集中控制学生手册', type: 'document', duration: '约20分钟' },
  { resourceId: 'resource_3', title: '设计水培容器学生手册', type: 'document', duration: '约15分钟' },
  { resourceId: 'resource_4', title: '认识植物工厂课件', type: 'presentation', duration: '约10分钟' },
  { resourceId: 'resource_5', title: '水培植物工厂与集中控制课件', type: 'presentation', duration: '约10分钟' },
  { resourceId: 'resource_6', title: '植物工厂介绍视频', type: 'video', duration: '约5分钟' },
]

const mockTasks: TaskInfo[] = [
  { taskId: 'task_quiz_1', title: '植物工厂基础知识测验', type: 'quiz', required: true, hasCompetencyConfig: false },
  { taskId: 'task_assignment_1', title: '植物工厂优缺点分析', type: 'assignment', required: true, hasCompetencyConfig: true, assignedCompetencies: ['critical_thinking', 'information_synthesis'] },
  { taskId: 'task_assignment_2', title: '设计我的水培系统', type: 'assignment', required: true, hasCompetencyConfig: true, assignedCompetencies: ['information_synthesis'] },
  { taskId: 'task_reflection_1', title: '学习反思', type: 'reflection', required: false, hasCompetencyConfig: true, assignedCompetencies: ['metacognition'] },
]

// ============================================
// Mock Data - 班级
// ============================================

const mockClasses: ClassInfo[] = [
  { classId: 'class-1', className: '一班', studentCount: 28 },
  { classId: 'class-2', className: '二班', studentCount: 30 },
  { classId: 'class-3', className: '三班', studentCount: 27 },
]

// ============================================
// Mock Data - 学生完整数据生成
// ============================================

function generateMockStudents(): StudentDetail[] {
  const students: StudentDetail[] = []
  const names = [
    '张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十',
    '陈一', '林二', '黄三', '刘四', '杨五', '许六', '何七', '罗八',
    '高一', '梁二', '郭三', '钱四', '孔五', '严六', '华七', '金八',
  ]

  let studentIndex = 0
  mockClasses.forEach(classInfo => {
    for (let i = 0; i < 8; i++) {
      const studentId = `s${studentIndex + 1}`
      const studentName = names[studentIndex] || `学生${studentIndex + 1}`

      const statuses: StudentStatus[] = ['completed', 'completed', 'completed', 'in_progress', 'in_progress', 'not_started', 'needs_attention', 'completed']
      const status = statuses[i % statuses.length]

      const progress = status === 'completed' ? 100 : status === 'not_started' ? 0 : Math.floor(Math.random() * 60) + 30
      const learningDuration = status === 'not_started' ? 0 : Math.floor(Math.random() * 40) + 20
      const objectiveScore = status !== 'not_started' ? Math.floor(Math.random() * 40) + 60 : undefined

      // 生成资源查看记录
      const resourceViews: StudentResourceView[] = mockResources.map(r => ({
        resourceId: r.resourceId,
        viewCount: status === 'not_started' ? 0 : Math.floor(Math.random() * 3) + 1,
        totalViewTime: status === 'not_started' ? 0 : Math.floor(Math.random() * 600) + 120,
        lastViewedAt: status === 'not_started' ? null : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      }))

      // 生成任务提交记录
      const taskSubmissions: StudentTaskSubmission[] = mockTasks.map(t => {
        const taskStatus = status === 'not_started' ? 'not_started' :
                          status === 'completed' ? 'graded' :
                          Math.random() > 0.5 ? 'submitted' : 'in_progress'

        const submission: StudentTaskSubmission = {
          taskId: t.taskId,
          status: taskStatus,
        }

        if (taskStatus === 'submitted' || taskStatus === 'graded') {
          submission.submittedAt = new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)

          if (t.type === 'quiz') {
            submission.correctCount = Math.floor(Math.random() * 2) + 1
            submission.totalCount = 3
            submission.score = Math.round((submission.correctCount / submission.totalCount) * 100)
            submission.totalScore = 100
          } else if (taskStatus === 'graded') {
            submission.score = Math.floor(Math.random() * 30) + 70
            submission.totalScore = 100
            submission.assessment = {
              level: submission.score >= 90 ? 'excellent' : submission.score >= 80 ? 'good' : submission.score >= 60 ? 'pass' : 'fail',
              feedback: submission.score >= 80 ? '分析全面，观点清晰，有自己的思考。' : '基本完成任务，但可以更深入分析。',
              competencyRatings: t.hasCompetencyConfig && t.assignedCompetencies ?
                Object.fromEntries(t.assignedCompetencies.map(c => [c, Math.floor(Math.random() * 2) + 2])) as Record<CompetencyType, number> :
                undefined,
            }
            submission.studentAnswer = '这是学生的作答内容示例。植物工厂是一种通过高科技手段，在密闭环境中实现植物全年连续生产的现代化农业系统...'
          }
        }

        return submission
      })

      // 生成 AI 对话记录
      const aiConversations: AIConversation[] = status === 'not_started' ? [] : [
        {
          messageId: `${studentId}-msg-1`,
          role: 'user',
          content: '什么是植物工厂？',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          messageId: `${studentId}-msg-2`,
          role: 'assistant',
          content: '植物工厂是一种通过设施内高精度环境控制实现农作物周年连续生产的高效农业系统。它利用计算机对植物生育的温度、湿度、光照、CO2浓度以及营养液等环境条件进行自动控制。',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5000),
          agentType: 'tutor',
        },
        {
          messageId: `${studentId}-msg-3`,
          role: 'user',
          content: '水培和土培有什么区别？',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          messageId: `${studentId}-msg-4`,
          role: 'assistant',
          content: '水培（Hydroponics）是无土栽培技术，植物根系直接浸泡在营养液中吸收养分。相比土培，水培有几个优势：1. 养分可控 2. 节水90%以上 3. 无土壤病害 4. 生长速度快30%。',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5000),
          agentType: 'tutor',
        },
      ]

      // 生成能力评分（基于任务评估）
      let competencyScores: Record<CompetencyType, number> | undefined
      if (status === 'completed') {
        competencyScores = {
          critical_thinking: Math.floor(Math.random() * 3) + 2,
          information_synthesis: Math.floor(Math.random() * 3) + 2,
          metacognition: Math.floor(Math.random() * 3) + 1,
          question_quality: Math.floor(Math.random() * 3) + 1,
          creativity: Math.floor(Math.random() * 3) + 1,
          persistence: Math.floor(Math.random() * 3) + 2,
        }
      }

      students.push({
        studentId,
        studentName,
        classId: classInfo.classId,
        className: classInfo.className,
        status,
        progress,
        learningDuration,
        objectiveScore,
        competencyScores,
        resourceViews,
        taskSubmissions,
        aiConversations,
      })

      studentIndex++
    }
  })

  // 生成更多学生到85人
  for (let i = studentIndex; i < 85; i++) {
    const classIndex = i % 3
    const classInfo = mockClasses[classIndex]
    const statuses: StudentStatus[] = ['completed', 'in_progress', 'not_started', 'needs_attention']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const progress = status === 'completed' ? 100 : status === 'not_started' ? 0 : Math.floor(Math.random() * 80) + 20

    students.push({
      studentId: `s${i + 1}`,
      studentName: `学生${i + 1}`,
      classId: classInfo.classId,
      className: classInfo.className,
      status,
      progress,
      learningDuration: Math.floor(Math.random() * 40) + 20,
      objectiveScore: status !== 'not_started' ? Math.floor(Math.random() * 40) + 60 : undefined,
      competencyScores: status === 'completed' ? {
        critical_thinking: Math.floor(Math.random() * 3) + 1,
        information_synthesis: Math.floor(Math.random() * 3) + 1,
        metacognition: Math.floor(Math.random() * 3) + 1,
        question_quality: Math.floor(Math.random() * 3) + 1,
        creativity: Math.floor(Math.random() * 3) + 1,
        persistence: Math.floor(Math.random() * 3) + 1,
      } : undefined,
      resourceViews: mockResources.map(r => ({
        resourceId: r.resourceId,
        viewCount: status === 'not_started' ? 0 : Math.floor(Math.random() * 3),
        totalViewTime: status === 'not_started' ? 0 : Math.floor(Math.random() * 600),
        lastViewedAt: status === 'not_started' ? null : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      })),
      taskSubmissions: mockTasks.map(t => ({
        taskId: t.taskId,
        status: status === 'not_started' ? 'not_started' : status === 'completed' ? 'graded' : 'in_progress',
      })),
      aiConversations: [],
    })
  }

  return students
}

const mockStudents = generateMockStudents()

// ============================================
// Helper Functions
// ============================================

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}小时${remainingMinutes}分钟`
}

function formatDate(date: Date | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ============================================
// Components
// ============================================

// 班级多选组件
function ClassMultiSelect({
  selectedClasses,
  onToggleClass,
  totalStudents,
}: {
  selectedClasses: string[];
  onToggleClass: (classId: string) => void;
  totalStudents: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-700">选择班级对比</h3>
        <span className="text-xs text-gray-500">（可多选）</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {mockClasses.map(classInfo => {
          const isSelected = selectedClasses.includes(classInfo.classId)
          return (
            <button
              key={classInfo.classId}
              onClick={() => onToggleClass(classInfo.classId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                isSelected ? 'border-white bg-white' : 'border-gray-400'
              }`}>
                {isSelected && <svg className="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>}
              </span>
              {classInfo.className}
              <span className="opacity-75">({classInfo.studentCount}人)</span>
            </button>
          )
        })}
      </div>
      {selectedClasses.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          已选择 {selectedClasses.length} 个班级，共 {totalStudents} 名学生
        </p>
      )}
    </div>
  )
}

// 班级统计卡片组件
function ClassStatCard({
  classInfo,
  students,
}: {
  classInfo: ClassInfo;
  students: StudentDetail[];
}) {
  const classStudents = students.filter(s => s.classId === classInfo.classId)
  const avgProgress = Math.round(classStudents.reduce((sum, s) => sum + s.progress, 0) / classStudents.length)
  const avgDuration = Math.round(classStudents.reduce((sum, s) => sum + s.learningDuration, 0) / classStudents.length)
  const completedCount = classStudents.filter(s => s.status === 'completed').length
  const needsAttentionCount = classStudents.filter(s => s.status === 'needs_attention').length

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center font-bold">
          {classInfo.className.charAt(0)}
        </span>
        {classInfo.className}
      </h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs">平均进度</p>
          <p className="font-semibold text-gray-900">{avgProgress}%</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">平均时长</p>
          <p className="font-semibold text-gray-900">{avgDuration}分钟</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">已完成</p>
          <p className="font-semibold text-green-600">{completedCount}人</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">需关注</p>
          <p className="font-semibold text-orange-600">{needsAttentionCount}人</p>
        </div>
      </div>
    </div>
  )
}

// 资源/任务详情视图组件
function ResourceTaskDetailsView({
  students,
  onSelectStudent,
}: {
  students: StudentDetail[];
  onSelectStudent: (student: StudentDetail) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'resources' | 'tasks'>('resources')

  // 计算资源统计
  const resourceStats = mockResources.map(resource => {
    const viewedStudents = students.filter(s => {
      const view = s.resourceViews.find(v => v.resourceId === resource.resourceId)
      return view && view.viewCount > 0
    })
    const totalViewTime = students.reduce((sum, s) => {
      const view = s.resourceViews.find(v => v.resourceId === resource.resourceId)
      return sum + (view?.totalViewTime || 0)
    }, 0)

    return {
      ...resource,
      viewedCount: viewedStudents.length,
      viewRate: Math.round((viewedStudents.length / students.length) * 100),
      avgViewTime: viewedStudents.length > 0 ? Math.round(totalViewTime / viewedStudents.length) : 0,
      notViewedStudents: students.filter(s => {
        const view = s.resourceViews.find(v => v.resourceId === resource.resourceId)
        return !view || view.viewCount === 0
      }),
    }
  })

  // 计算任务统计
  const taskStats = mockTasks.map(task => {
    const submittedStudents = students.filter(s => {
      const submission = s.taskSubmissions.find(t => t.taskId === task.taskId)
      return submission && (submission.status === 'submitted' || submission.status === 'graded')
    })
    const gradedStudents = students.filter(s => {
      const submission = s.taskSubmissions.find(t => t.taskId === task.taskId)
      return submission && submission.status === 'graded'
    })
    const avgScore = gradedStudents.length > 0
      ? Math.round(gradedStudents.reduce((sum, s) => {
          const submission = s.taskSubmissions.find(t => t.taskId === task.taskId)
          return sum + (submission?.score || 0)
        }, 0) / gradedStudents.length)
      : undefined

    // AI 评估分布（仅对有能力配置的任务）
    const assessmentDistribution = task.hasCompetencyConfig ? {
      excellent: gradedStudents.filter(s => {
        const submission = s.taskSubmissions.find(t => t.taskId === task.taskId)
        return submission?.assessment?.level === 'excellent'
      }).length,
      good: gradedStudents.filter(s => {
        const submission = s.taskSubmissions.find(t => t.taskId === task.taskId)
        return submission?.assessment?.level === 'good'
      }).length,
      pass: gradedStudents.filter(s => {
        const submission = s.taskSubmissions.find(t => t.taskId === task.taskId)
        return submission?.assessment?.level === 'pass'
      }).length,
      fail: gradedStudents.filter(s => {
        const submission = s.taskSubmissions.find(t => t.taskId === task.taskId)
        return submission?.assessment?.level === 'fail'
      }).length,
    } : undefined

    return {
      ...task,
      submittedCount: submittedStudents.length,
      gradedCount: gradedStudents.length,
      completionRate: Math.round((submittedStudents.length / students.length) * 100),
      avgScore,
      assessmentDistribution,
      notSubmittedStudents: students.filter(s => {
        const submission = s.taskSubmissions.find(t => t.taskId === task.taskId)
        return !submission || submission.status === 'not_started' || submission.status === 'in_progress'
      }),
    }
  })

  const typeConfig = {
    document: { icon: '📄', label: '文档' },
    presentation: { icon: '📊', label: '课件' },
    video: { icon: '🎬', label: '视频' },
    quiz: { icon: '❓', label: '测验', color: 'bg-purple-100 text-purple-700' },
    assignment: { icon: '📝', label: '作业', color: 'bg-blue-100 text-blue-700' },
    reflection: { icon: '💭', label: '反思', color: 'bg-green-100 text-green-700' },
  }

  return (
    <div className="space-y-4">
      {/* 切换按钮 */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewType('resources')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewType === 'resources'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📚 学习资源 ({mockResources.length})
        </button>
        <button
          onClick={() => setViewType('tasks')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewType === 'tasks'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📋 学习任务 ({mockTasks.length})
        </button>
      </div>

      {/* 资源列表 */}
      {viewType === 'resources' && (
        <div className="space-y-3">
          {resourceStats.map(resource => {
            const isExpanded = expandedId === resource.resourceId
            const config = typeConfig[resource.type]

            return (
              <div key={resource.resourceId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : resource.resourceId)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">{config.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800">{resource.title}</p>
                    <p className="text-xs text-gray-500">{resource.duration}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{resource.viewRate}%</p>
                      <p className="text-xs text-gray-500">查看率</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{resource.viewedCount}/{students.length}</p>
                      <p className="text-xs text-gray-500">已查看</p>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* 进度条 */}
                <div className="px-4 pb-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                      style={{ width: `${resource.viewRate}%` }}
                    />
                  </div>
                </div>

                {/* 展开详情 */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        未查看学生 ({resource.notViewedStudents.length}人)
                      </p>
                      {resource.notViewedStudents.length === 0 ? (
                        <p className="text-sm text-green-600">✓ 全部学生已查看</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {resource.notViewedStudents.slice(0, 10).map(s => (
                            <button
                              key={s.studentId}
                              onClick={() => onSelectStudent(s)}
                              className="px-2 py-1 bg-white rounded text-xs text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors border border-gray-200"
                            >
                              {s.studentName}
                            </button>
                          ))}
                          {resource.notViewedStudents.length > 10 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                              +{resource.notViewedStudents.length - 10}人
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 任务列表 */}
      {viewType === 'tasks' && (
        <div className="space-y-3">
          {taskStats.map(task => {
            const isExpanded = expandedId === task.taskId
            const config = typeConfig[task.type]

            return (
              <div key={task.taskId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : task.taskId)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {task.required && <span className="text-red-500">必做</span>}
                      {task.hasCompetencyConfig && <span className="text-purple-500">含能力评估</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{task.completionRate}%</p>
                      <p className="text-xs text-gray-500">完成率</p>
                    </div>
                    {task.avgScore !== undefined && (
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{task.avgScore}分</p>
                        <p className="text-xs text-gray-500">平均分</p>
                      </div>
                    )}
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* 进度条 */}
                <div className="px-4 pb-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                      style={{ width: `${task.completionRate}%` }}
                    />
                  </div>
                </div>

                {/* 展开详情 */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 space-y-4">
                    {/* AI 评估分布 */}
                    {task.assessmentDistribution && (
                      <div className="pt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">AI 评估分布</p>
                        <div className="flex gap-2">
                          {[
                            { level: 'excellent', label: '优秀', color: 'bg-green-500', count: task.assessmentDistribution.excellent },
                            { level: 'good', label: '良好', color: 'bg-blue-500', count: task.assessmentDistribution.good },
                            { level: 'pass', label: '及格', color: 'bg-yellow-500', count: task.assessmentDistribution.pass },
                            { level: 'fail', label: '待改进', color: 'bg-red-500', count: task.assessmentDistribution.fail },
                          ].map(item => (
                            <div key={item.level} className="flex-1 text-center">
                              <div className={`h-16 ${item.color} rounded-lg flex items-end justify-center pb-1`}>
                                <span className="text-white font-bold">{item.count}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 未完成学生 */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        未完成学生 ({task.notSubmittedStudents.length}人)
                      </p>
                      {task.notSubmittedStudents.length === 0 ? (
                        <p className="text-sm text-green-600">✓ 全部学生已完成</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {task.notSubmittedStudents.slice(0, 10).map(s => (
                            <button
                              key={s.studentId}
                              onClick={() => onSelectStudent(s)}
                              className="px-2 py-1 bg-white rounded text-xs text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors border border-gray-200"
                            >
                              {s.studentName}
                            </button>
                          ))}
                          {task.notSubmittedStudents.length > 10 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                              +{task.notSubmittedStudents.length - 10}人
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// 学生列表视图组件
function StudentListView({
  students,
  onSelectStudent,
}: {
  students: StudentDetail[];
  onSelectStudent: (student: StudentDetail) => void;
}) {
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'score' | 'duration'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterStatus, setFilterStatus] = useState<StudentStatus | 'all'>('all')

  const filteredStudents = useMemo(() => {
    let result = [...students]

    // 筛选
    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus)
    }

    // 排序
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.studentName.localeCompare(b.studentName)
          break
        case 'progress':
          comparison = a.progress - b.progress
          break
        case 'score':
          comparison = (a.objectiveScore || 0) - (b.objectiveScore || 0)
          break
        case 'duration':
          comparison = a.learningDuration - b.learningDuration
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [students, sortBy, sortOrder, filterStatus])

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const statusConfig = {
    completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
    in_progress: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
    not_started: { label: '未开始', color: 'bg-gray-100 text-gray-700' },
    needs_attention: { label: '需关注', color: 'bg-orange-100 text-orange-700' },
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* 筛选和排序 */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">状态筛选:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StudentStatus | 'all')}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部 ({students.length})</option>
            <option value="completed">已完成 ({students.filter(s => s.status === 'completed').length})</option>
            <option value="in_progress">进行中 ({students.filter(s => s.status === 'in_progress').length})</option>
            <option value="not_started">未开始 ({students.filter(s => s.status === 'not_started').length})</option>
            <option value="needs_attention">需关注 ({students.filter(s => s.status === 'needs_attention').length})</option>
          </select>
        </div>
        <div className="flex-1" />
        <span className="text-sm text-gray-500">
          显示 {filteredStudents.length} / {students.length} 名学生
        </span>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900">
                  姓名
                  {sortBy === 'name' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">班级</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort('progress')} className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900">
                  进度
                  {sortBy === 'progress' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort('score')} className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900">
                  测验分数
                  {sortBy === 'score' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort('duration')} className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900">
                  学习时长
                  {sortBy === 'duration' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.map(student => (
              <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{student.studentName}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{student.className}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[student.status].color}`}>
                    {statusConfig[student.status].label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900">
                    {student.objectiveScore !== undefined ? `${student.objectiveScore}分` : '-'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{student.learningDuration}分钟</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSelectStudent(student)}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 学生详情侧边栏组件
function StudentDetailSidebar({
  student,
  onClose,
}: {
  student: StudentDetail;
  onClose: () => void;
}) {
  const [expandedSection, setExpandedSection] = useState<'resources' | 'tasks' | 'chat' | null>('tasks')

  const statusConfig = {
    completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
    in_progress: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
    not_started: { label: '未开始', color: 'bg-gray-100 text-gray-700' },
    needs_attention: { label: '需关注', color: 'bg-orange-100 text-orange-700' },
  }

  const taskStatusConfig = {
    not_started: { label: '未开始', color: 'text-gray-500' },
    in_progress: { label: '进行中', color: 'text-blue-600' },
    submitted: { label: '已提交', color: 'text-yellow-600' },
    graded: { label: '已批改', color: 'text-green-600' },
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* 侧边栏 */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {student.studentName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{student.studentName}</h2>
              <p className="text-white/80">{student.className}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig[student.status].color}`}>
                {statusConfig[student.status].label}
              </span>
            </div>
          </div>

          {/* 概览统计 */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{student.progress}%</p>
              <p className="text-xs text-white/70">学习进度</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{student.objectiveScore ?? '-'}</p>
              <p className="text-xs text-white/70">测验分数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{student.learningDuration}</p>
              <p className="text-xs text-white/70">学习时长(分钟)</p>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-4 space-y-4">
          {/* 资源查看情况 */}
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'resources' ? null : 'resources')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="font-semibold text-gray-800">📚 资源查看情况</span>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'resources' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'resources' && (
              <div className="px-4 pb-4 space-y-2">
                {student.resourceViews.map(view => {
                  const resource = mockResources.find(r => r.resourceId === view.resourceId)
                  if (!resource) return null
                  const hasViewed = view.viewCount > 0

                  return (
                    <div key={view.resourceId} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                      <span className={`text-lg ${hasViewed ? '' : 'opacity-30'}`}>
                        {resource.type === 'document' ? '📄' : resource.type === 'presentation' ? '📊' : '🎬'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${hasViewed ? 'text-gray-800' : 'text-gray-400'}`}>
                          {resource.title}
                        </p>
                        {hasViewed && (
                          <p className="text-xs text-gray-500">
                            查看 {view.viewCount} 次 · 共 {formatDuration(view.totalViewTime)}
                          </p>
                        )}
                      </div>
                      {hasViewed ? (
                        <span className="text-green-500 text-sm">✓</span>
                      ) : (
                        <span className="text-gray-400 text-xs">未查看</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 任务完成情况 */}
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'tasks' ? null : 'tasks')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="font-semibold text-gray-800">📋 任务完成情况</span>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'tasks' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'tasks' && (
              <div className="px-4 pb-4 space-y-3">
                {student.taskSubmissions.map(submission => {
                  const task = mockTasks.find(t => t.taskId === submission.taskId)
                  if (!task) return null
                  const statusCfg = taskStatusConfig[submission.status]

                  return (
                    <div key={submission.taskId} className="bg-white rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{task.title}</p>
                          <p className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</p>
                        </div>
                        {submission.score !== undefined && (
                          <span className="text-lg font-bold text-primary-600">{submission.score}分</span>
                        )}
                      </div>

                      {/* AI 评估 */}
                      {submission.assessment && (
                        <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-purple-600 font-medium">AI 评估</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              submission.assessment.level === 'excellent' ? 'bg-green-100 text-green-700' :
                              submission.assessment.level === 'good' ? 'bg-blue-100 text-blue-700' :
                              submission.assessment.level === 'pass' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {submission.assessment.level === 'excellent' ? '优秀' :
                               submission.assessment.level === 'good' ? '良好' :
                               submission.assessment.level === 'pass' ? '及格' : '待改进'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{submission.assessment.feedback}</p>

                          {/* 能力评分 */}
                          {submission.assessment.competencyRatings && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {Object.entries(submission.assessment.competencyRatings).map(([type, rating]) => (
                                <span key={type} className="px-1.5 py-0.5 bg-white rounded text-xs text-gray-600">
                                  {COMPETENCY_DEFINITIONS[type as CompetencyType]?.name}: {'★'.repeat(rating as number)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 学生作答 */}
                      {submission.studentAnswer && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">学生作答:</p>
                          <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded line-clamp-3">
                            {submission.studentAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* AI 对话记录 */}
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'chat' ? null : 'chat')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="font-semibold text-gray-800">💬 AI 对话记录 ({student.aiConversations.length})</span>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'chat' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'chat' && (
              <div className="px-4 pb-4">
                {student.aiConversations.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">暂无对话记录</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {student.aiConversations.map(msg => (
                      <div
                        key={msg.messageId}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 ${
                          msg.role === 'user'
                            ? 'bg-primary-500 text-white'
                            : 'bg-white border border-gray-200'
                        }`}>
                          {msg.role === 'assistant' && msg.agentType && (
                            <p className="text-xs text-purple-600 mb-1">
                              {msg.agentType === 'tutor' ? '🎓 学习助手' :
                               msg.agentType === 'assessor' ? '📝 评估助手' : '🧠 元认知助手'}
                            </p>
                          )}
                          <p className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                            {msg.content}
                          </p>
                          <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                            {formatDate(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 能力维度（条件显示） */}
          {student.competencyScores && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3">🎯 能力维度评估</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(student.competencyScores).map(([type, rating]) => {
                  const def = COMPETENCY_DEFINITIONS[type as CompetencyType]
                  if (!def) return null
                  return (
                    <div key={type} className="bg-white rounded-lg p-2">
                      <p className="text-xs text-gray-600 mb-1">{def.name}</p>
                      <p className="text-sm font-medium text-yellow-500">{'★'.repeat(rating)}{'☆'.repeat(4 - rating)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

interface SpaceResultsPageProps {
  params: Promise<{
    spaceId: string
  }>
}

export default function SpaceResultsPage({ params }: SpaceResultsPageProps) {
  const { spaceId } = use(params)
  const [selectedClasses, setSelectedClasses] = useState<string[]>(mockClasses.map(c => c.classId))
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null)
  const [showResourceTaskDetails, setShowResourceTaskDetails] = useState(false)

  // 过滤选中班级的学生
  const filteredStudents = useMemo(() => {
    if (selectedClasses.length === 0) return mockStudents
    return mockStudents.filter(s => selectedClasses.includes(s.classId))
  }, [selectedClasses])

  // 切换班级选择
  const toggleClass = (classId: string) => {
    setSelectedClasses(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId)
      } else {
        return [...prev, classId]
      }
    })
  }

  // 计算整体统计
  const overallStats = useMemo(() => {
    const students = filteredStudents
    return {
      totalStudents: students.length,
      avgProgress: Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length),
      avgDuration: Math.round(students.reduce((sum, s) => sum + s.learningDuration, 0) / students.length),
      completedCount: students.filter(s => s.status === 'completed').length,
      needsAttentionCount: students.filter(s => s.status === 'needs_attention').length,
    }
  }, [filteredStudents])

  const space = {
    id: spaceId,
    title: 'Python 数据分析入门',
    topic: 'Python数据分析',
    isPublished: true,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/teacher/self-study"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回学习空间
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{space.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{overallStats.totalStudents} 名学生</span>
                <span>{space.isPublished ? '已发布' : '草稿'}</span>
                {space.topic && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                    {space.topic}
                  </span>
                )}
              </div>
            </div>
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

        {/* 左右两栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧概览栏 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 班级多选 */}
            <ClassMultiSelect
              selectedClasses={selectedClasses}
              onToggleClass={toggleClass}
              totalStudents={filteredStudents.length}
            />

            {/* 整体统计卡片 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">平均进度</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.avgProgress}%</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">平均时长</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.avgDuration}分钟</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">已完成</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.completedCount}人</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">需关注</p>
                <p className="text-2xl font-bold text-orange-600">{overallStats.needsAttentionCount}人</p>
              </div>
            </div>

            {/* 班级对比卡片 */}
            {selectedClasses.length > 1 && (
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">班级对比</h3>
                <div className="space-y-3">
                  {selectedClasses.map(classId => {
                    const classInfo = mockClasses.find(c => c.classId === classId)
                    if (!classInfo) return null
                    return (
                      <ClassStatCard
                        key={classId}
                        classInfo={classInfo}
                        students={mockStudents}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* 资源/任务详情 - 可折叠区域 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowResourceTaskDetails(!showResourceTaskDetails)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800">📋 资源/任务详情</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${showResourceTaskDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showResourceTaskDetails && (
                <div className="p-4 border-t border-gray-100">
                  <ResourceTaskDetailsView
                    students={filteredStudents}
                    onSelectStudent={setSelectedStudent}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 右侧学生列表栏 */}
          <div className="lg:col-span-2">
            <StudentListView
              students={filteredStudents}
              onSelectStudent={setSelectedStudent}
            />
          </div>
        </div>
      </div>

      {/* Student Detail Sidebar */}
      {selectedStudent && (
        <StudentDetailSidebar
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
