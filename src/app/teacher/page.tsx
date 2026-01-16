'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 模拟数据
const recentCourses = [
  {
    id: '1',
    title: '植物工厂探究',
    subjects: ['科学', '数学', '信息技术'],
    progress: 75,
    students: 32,
    lastUpdate: '2小时前',
    status: 'ongoing',
    cover: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: '数学建模与环境保护',
    subjects: ['数学', '生物'],
    progress: 100,
    students: 28,
    lastUpdate: '1天前',
    status: 'completed',
    cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: '文艺复兴的科学革命',
    subjects: ['历史', '物理'],
    progress: 30,
    students: 25,
    lastUpdate: '3天前',
    status: 'ongoing',
    cover: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop',
  },
]

const studentActivities = [
  { id: '1', name: '李明', action: '完成了课程测验', course: '水循环与气候变化', time: '5分钟前', avatar: '李' },
  { id: '2', name: '王芳', action: '提交了作业', course: '数学建模与环境保护', time: '15分钟前', avatar: '王' },
  { id: '3', name: '张伟', action: '发起了讨论', course: '水循环与气候变化', time: '30分钟前', avatar: '张' },
  { id: '4', name: '刘洋', action: '请求了AI辅导', course: '文艺复兴的科学革命', time: '1小时前', avatar: '刘' },
]

const quickStats = [
  { label: '进行中课程', value: '3', change: '+1', icon: '📚', color: 'blue' },
  { label: '活跃学生', value: '85', change: '+12', icon: '👥', color: 'blue' },
  { label: '待批改作业', value: '12', change: '-5', icon: '📝', color: 'amber' },
  { label: '本周互动', value: '156', change: '+23%', icon: '💬', color: 'blue' },
]

const todayTasks = [
  { id: '1', title: '批改《水循环》单元测验', priority: 'high', time: '10:00', done: false },
  { id: '2', title: '准备明天的课程资料', priority: 'medium', time: '14:00', done: false },
  { id: '3', title: '回复学生问题 (3条)', priority: 'low', time: '16:00', done: true },
  { id: '4', title: '参加教研组会议', priority: 'medium', time: '15:00', done: false },
]

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

// API Response: Main data structure for teacher competency insights
interface TeacherCompetencyInsights {
  distribution: Record<CompetencyType, CompetencyDistributionData>;
  trends: Record<CompetencyType, CourseTrendPoint[]>;
  alerts: {
    lowPerformance: StudentAlertData[];
    highPerformance: StudentAlertData[];
  };
  insights: AIInsight[];
}

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

// Single point in cross-course trend timeline
interface CourseTrendPoint {
  courseId: string;
  courseName: string;
  date: string;
  distribution: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  };
}

// Student alert data (low/high performance)
interface StudentAlertData {
  studentId: string;
  name: string;
  rating?: number;  // 单个能力评级
  competencyType?: CompetencyType;  // 单个能力类型
  competencyTypes?: CompetencyType[];  // 多个能力类型(高表现学生)
  avgRating?: number;  // 平均评级
}

// AI-generated insight
interface AIInsight {
  type: 'trend' | 'alert';
  competency: CompetencyType;
  message: string;
}

// Filter options for competency insights
interface CompetencyFilterOptions {
  courseIds?: string[];
  timeRange?: { start: Date; end: Date };
  studentGroup?: 'all' | 'active' | 'inactive';
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<'my-courses' | 'insights' | 'knowledge' | 'growth'>('my-courses')
  const [showCourseTypeModal, setShowCourseTypeModal] = useState(false)

  // 获取当前日期
  const today = new Date()
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来，Mo老师 👋</h1>
          <p className="text-gray-600">今天是 {dateStr}</p>
        </div>

        {/* Tabs - 教师中心子导航 */}
        <div className="flex items-center gap-6 mb-8 border-b border-gray-200 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {[
            { id: 'my-courses', label: '我的课程', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )},
            { id: 'insights', label: '教学洞察', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )},
            { id: 'knowledge', label: '知识库', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            )},
            { id: 'growth', label: '成长档案', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )},
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'my-courses' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.change.startsWith('+') ? 'bg-primary-100 text-primary-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* 探索更多课程资源 Banner */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-100 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">探索更多课程资源</h3>
                <p className="text-gray-600 text-sm">发现平台上的优质跨学科课程资源</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/course-center"
                  className="flex items-center gap-2 px-5 py-2.5 border border-primary-300 text-primary-700 text-sm font-medium rounded-xl hover:bg-primary-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  进入课程中心
                </Link>
                <button
                  onClick={() => setShowCourseTypeModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  创建新课程
                </button>
              </div>
            </div>

            {/* Course List Header */}
            <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <h2 className="text-xl font-semibold text-gray-900">课程列表</h2>
              <span className="text-sm text-gray-500">共 4 门课程 · 2 已发布 · 2 草稿</span>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {recentCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Course Cover */}
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={course.cover}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        course.status === 'completed'
                          ? 'bg-primary-500 text-white'
                          : course.status === 'draft'
                          ? 'bg-gray-500 text-white'
                          : 'bg-accent-500 text-white'
                      }`}>
                        {course.status === 'completed' ? '已发布' : course.status === 'draft' ? '草稿' : '已发布'}
                      </span>
                    </div>

                    {/* Menu Button */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>

                    {/* Subjects */}
                    <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
                      {course.subjects.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-white/90 text-gray-700 rounded text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">{course.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {course.students}
                      </span>
                      <span>·</span>
                      <span>{course.lastUpdate}</span>
                    </div>

                    {/* Progress */}
                    {course.status !== 'draft' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">完成进度</span>
                          <span className="font-medium text-gray-900">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/teacher/courses/${course.id}/edit`}
                        className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
                      >
                        编辑
                      </Link>
                      {course.status !== 'draft' && (
                        <>
                          <button
                            onClick={() => setShowCourseTypeModal(true)}
                            className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors text-center"
                          >
                            授课
                          </button>
                          <Link
                            href={`/teacher/courses/${course.id}/results`}
                            className="flex-1 px-3 py-2 border border-accent-300 text-accent-700 text-sm font-medium rounded-xl hover:bg-accent-50 transition-colors text-center"
                          >
                            查看结果
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Draft Course Card */}
              <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-500 text-white">
                      草稿
                    </span>
                  </div>
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">能源与可持续发展</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <span>化学 · 地理</span>
                    <span>·</span>
                    <span>1周前</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/teacher/courses/4/edit"
                      className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
                    >
                      继续编辑
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              {/* Right Column - Tasks & Activities */}
              <div className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                {/* Today's Tasks */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">今日待办</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {todayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          task.done ? 'bg-gray-50' : 'bg-white border border-gray-100'
                        }`}
                      >
                        <button
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.done
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-gray-300 hover:border-primary-500'
                          }`}
                        >
                          {task.done && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-400">{task.time}</p>
                        </div>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            task.priority === 'high'
                              ? 'bg-red-500'
                              : task.priority === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-gray-300'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Student Activities */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">学生动态</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {studentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {activity.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.name}</span>{' '}
                            <span className="text-gray-600">{activity.action}</span>
                          </p>
                          <p className="text-xs text-gray-400">{activity.course} · {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="animate-fade-in">
            <TeachingInsights />
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="animate-fade-in">
            <KnowledgeBase />
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="animate-fade-in">
            <GrowthArchive />
          </div>
        )}
      </div>

      {/* 课程类型选择弹窗 */}
      {showCourseTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCourseTypeModal(false)}
          />

          {/* 弹窗内容 */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8 animate-fade-in-up">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowCourseTypeModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 标题 */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">选择课堂模式</h2>
              <p className="text-gray-500">请根据您的教学需求选择合适的课堂模式</p>
            </div>

            {/* 课堂模式选项卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 以教师为中心课堂 */}
              <button
                onClick={() => window.open('https://beta.pbl.cocorobo.cn/pbl-teacher-table/dist/#/pptEasy?cid=ae814d33-ef5d-11f0-9b8a-005056924926&userid=e9b3eb89-2446-11ee-91d8-005056b86db5&oid=45facc0a-1211-11ec-80ad-005056b86db5&org=&role=0', '_blank')}
                className="group relative w-full bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left"
              >
                <div className="flex flex-col items-center text-center">
                  {/* 图标 */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">以教师为中心课堂</h3>

                  {/* 描述 */}
                  <p className="text-sm text-gray-500 mb-4">
                    教师实时控制课堂节奏，学生跟随教师统一进度学习
                  </p>

                  {/* 特点标签 */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-2.5 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-lg">实时同步</span>
                    <span className="px-2.5 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-lg">统一进度</span>
                    <span className="px-2.5 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-lg">课堂互动</span>
                  </div>
                </div>

                {/* 箭头指示 */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* 以学生为中心的课堂 */}
              <button
                onClick={() => window.open('https://cocolearn.cocorobo.cn/teacher/create', '_blank')}
                className="group relative w-full bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left"
              >
                <div className="flex flex-col items-center text-center">
                  {/* 图标 */}
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">以学生为中心的课堂</h3>

                  {/* 描述 */}
                  <p className="text-sm text-gray-500 mb-4">
                    学生自主探索学习，教师提供个性化指导与资源
                  </p>

                  {/* 特点标签 */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-lg">自主学习</span>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-lg">个性进度</span>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-lg">AI辅导</span>
                  </div>
                </div>

                {/* 箭头指示 */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* 底部提示 */}
            <p className="text-center text-xs text-gray-400 mt-6">
              选择后可随时在课程设置中更改课堂模式
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// 我的课程列表组件 - 不再使用，功能已合并到主组件
// function MyCoursesList() { ... }

// ============================================
// Mock Data for Competency Insights
// (Moved before TeachingInsights component to avoid hoisting issues)
// ============================================

// Generate mock competency distribution data
const mockCompetencyDistributions: Record<CompetencyType, CompetencyDistributionData> = {
  critical_thinking: {
    source: 'teacher_assigned',
    level1: 8,    // 8 students with ★
    level2: 22,   // 22 students with ★★
    level3: 38,   // 38 students with ★★★
    level4: 17,   // 17 students with ★★★★
    avgRating: 2.8,
    totalStudents: 85,
  },
  information_synthesis: {
    source: 'teacher_assigned',
    level1: 5,
    level2: 18,
    level3: 42,
    level4: 20,
    avgRating: 2.9,
    totalStudents: 85,
  },
  metacognition: {
    source: 'ai_detected',
    level1: 12,
    level2: 25,
    level3: 30,
    level4: 18,
    avgRating: 2.6,
    totalStudents: 85,
    studentsDetected: 52, // AI只在52名学生中检测到元认知表现
  },
  question_quality: {
    source: 'ai_detected',
    level1: 10,
    level2: 28,
    level3: 35,
    level4: 12,
    avgRating: 2.5,
    totalStudents: 85,
    studentsDetected: 65,
  },
  creativity: {
    source: 'ai_detected',
    level1: 15,
    level2: 30,
    level3: 25,
    level4: 15,
    avgRating: 2.4,
    totalStudents: 85,
    studentsDetected: 58,
  },
  persistence: {
    source: 'ai_detected',
    level1: 8,
    level2: 20,
    level3: 40,
    level4: 17,
    avgRating: 2.7,
    totalStudents: 85,
    studentsDetected: 70,
  },
};

// Mock student alert data
const mockAlerts = {
  lowPerformance: [
    { studentId: '3', name: '王浩宇', competencyType: 'critical_thinking' as CompetencyType, rating: 1 },
    { studentId: '5', name: '陈思远', competencyType: 'metacognition' as CompetencyType, rating: 2 },
    { studentId: '12', name: '赵明远', competencyType: 'information_synthesis' as CompetencyType, rating: 1 },
    { studentId: '18', name: '孙雨晴', competencyType: 'critical_thinking' as CompetencyType, rating: 2 },
  ],
  highPerformance: [
    { studentId: '6', name: '赵梓涵', competencyTypes: ['critical_thinking', 'information_synthesis', 'metacognition'] as CompetencyType[], avgRating: 4 },
    { studentId: '2', name: '李思琪', competencyTypes: ['information_synthesis', 'metacognition'] as CompetencyType[], avgRating: 3.5 },
    { studentId: '1', name: '张晓明', competencyTypes: ['critical_thinking', 'metacognition'] as CompetencyType[], avgRating: 3.8 },
  ],
};

// Mock cross-course trend data
const mockCompetencyTrends: Record<CompetencyType, CourseTrendPoint[]> = {
  critical_thinking: [
    { courseId: 'geo_01', courseName: '地理-气候变化', date: '2023-11', distribution: { level1: 12, level2: 28, level3: 32, level4: 13 } },
    { courseId: 'bio_01', courseName: '生物-生态系统', date: '2023-12', distribution: { level1: 10, level2: 25, level3: 35, level4: 15 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 8, level2: 22, level3: 38, level4: 17 } },
  ],
  information_synthesis: [
    { courseId: 'geo_01', courseName: '地理-气候变化', date: '2023-11', distribution: { level1: 8, level2: 22, level3: 38, level4: 17 } },
    { courseId: 'phy_01', courseName: '物理-能量转换', date: '2023-12', distribution: { level1: 7, level2: 20, level3: 40, level4: 18 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 5, level2: 18, level3: 42, level4: 20 } },
  ],
  metacognition: [
    { courseId: 'math_01', courseName: '数学-函数思维', date: '2023-10', distribution: { level1: 15, level2: 30, level3: 28, level4: 12 } },
    { courseId: 'bio_01', courseName: '生物-生态系统', date: '2023-12', distribution: { level1: 13, level2: 27, level3: 30, level4: 15 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 12, level2: 25, level3: 30, level4: 18 } },
  ],
  question_quality: [
    { courseId: 'sci_01', courseName: '科学探究', date: '2023-11', distribution: { level1: 12, level2: 30, level3: 32, level4: 11 } },
    { courseId: 'geo_01', courseName: '地理-气候变化', date: '2023-12', distribution: { level1: 11, level2: 29, level3: 33, level4: 12 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 10, level2: 28, level3: 35, level4: 12 } },
  ],
  creativity: [
    { courseId: 'art_01', courseName: '艺术创作', date: '2023-10', distribution: { level1: 18, level2: 32, level3: 23, level4: 12 } },
    { courseId: 'tech_01', courseName: '技术创新', date: '2023-12', distribution: { level1: 16, level2: 31, level3: 24, level4: 14 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 15, level2: 30, level3: 25, level4: 15 } },
  ],
  persistence: [
    { courseId: 'math_01', courseName: '数学-函数思维', date: '2023-10', distribution: { level1: 10, level2: 22, level3: 38, level4: 15 } },
    { courseId: 'phy_01', courseName: '物理-能量转换', date: '2023-12', distribution: { level1: 9, level2: 21, level3: 39, level4: 16 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 8, level2: 20, level3: 40, level4: 17 } },
  ],
};

// 教学洞察组件
function TeachingInsights() {
  const metrics = [
    { label: '平均完成率', value: '78%', trend: '+5%', good: true },
    { label: '学生满意度', value: '4.6', trend: '+0.2', good: true },
    { label: '互动频率', value: '23次/课', trend: '+3', good: true },
    { label: '作业提交率', value: '92%', trend: '-2%', good: false },
  ]

  const coursePerformance = [
    { name: '水循环与气候变化', completion: 85, satisfaction: 4.8, engagement: 92 },
    { name: '数学建模与环境保护', completion: 78, satisfaction: 4.5, engagement: 85 },
    { name: '文艺复兴的科学革命', completion: 65, satisfaction: 4.2, engagement: 70 },
    { name: '音乐中的数学之美', completion: 72, satisfaction: 4.6, engagement: 88 },
  ]

  const aiSuggestions = [
    {
      type: 'improvement',
      title: '提升《文艺复兴》课程互动率',
      description: '该课程互动率偏低，建议增加小组讨论环节和实时问答',
      action: '查看建议',
    },
    {
      type: 'success',
      title: '《水循环》课程表现优异',
      description: '学生参与度和完成率均超过平均水平，可作为其他课程参考',
      action: '生成报告',
    },
    {
      type: 'warning',
      title: '注意作业提交率下降',
      description: '近两周作业提交率有所下降，可能需要调整作业难度或截止时间',
      action: '查看详情',
    },
  ]

  // ============================================
  // Competency Insights State & Handlers
  // ============================================
  const [competencyFilters, setCompetencyFilters] = useState<CompetencyFilterOptions>({
    courseIds: [],
    studentGroup: 'all',
  })

  const [showFilterPanel, setShowFilterPanel] = useState(false)

  const handleFilterChange = (newFilters: Partial<CompetencyFilterOptions>) => {
    setCompetencyFilters({ ...competencyFilters, ...newFilters })
  }

  const handleResetFilters = () => {
    setCompetencyFilters({
      courseIds: [],
      studentGroup: 'all',
    })
  }

  // ============================================
  // Filtered Data Computation with useMemo
  // ============================================

  // 1. Filtered Competency Distributions
  // Note: Current mock data represents class-level aggregate without courseId,
  // so we return as-is. In production, this would filter by selected courses.
  const filteredCompetencyDistributions = useMemo(() => {
    return mockCompetencyDistributions;
  }, [competencyFilters.courseIds]);

  // 2. Filtered Student Alerts (by studentGroup)
  const filteredAlerts = useMemo(() => {
    if (competencyFilters.studentGroup === 'all') {
      return mockAlerts;
    }

    // Simulate active/inactive filtering based on studentId
    // In production, this would use actual student activity data
    const isActive = (studentId: string) => parseInt(studentId) < 10;

    return {
      lowPerformance: mockAlerts.lowPerformance.filter((alert) =>
        competencyFilters.studentGroup === 'active' ? isActive(alert.studentId) : !isActive(alert.studentId)
      ),
      highPerformance: mockAlerts.highPerformance.filter((alert) =>
        competencyFilters.studentGroup === 'active' ? isActive(alert.studentId) : !isActive(alert.studentId)
      ),
    };
  }, [competencyFilters.studentGroup]);

  // 3. Filtered Competency Trends (by courseIds and timeRange)
  const filteredCompetencyTrends = useMemo(() => {
    const result: Record<CompetencyType, CourseTrendPoint[]> = {
      critical_thinking: [],
      information_synthesis: [],
      metacognition: [],
      question_quality: [],
      creativity: [],
      persistence: [],
    };

    (Object.keys(mockCompetencyTrends) as CompetencyType[]).forEach((competencyType) => {
      let trends = mockCompetencyTrends[competencyType];

      // Filter by courseIds if specified
      if (competencyFilters.courseIds && competencyFilters.courseIds.length > 0) {
        trends = trends.filter((point) => competencyFilters.courseIds!.includes(point.courseId));
      }

      // Filter by timeRange if specified
      if (competencyFilters.timeRange) {
        const { start, end } = competencyFilters.timeRange;
        trends = trends.filter((point) => {
          const pointDate = new Date(point.date + '-01'); // Append day to YYYY-MM format
          return pointDate >= start && pointDate <= end;
        });
      }

      result[competencyType] = trends;
    });

    return result;
  }, [competencyFilters.courseIds, competencyFilters.timeRange]);

  // CompetencyFilterBar Component
  const CompetencyFilterBar = () => {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">能力洞察筛选器</h3>
              <p className="text-xs text-gray-500">
                {competencyFilters.courseIds && competencyFilters.courseIds.length > 0
                  ? `已选 ${competencyFilters.courseIds.length} 门课程`
                  : '全部课程'}
                {' · '}
                {competencyFilters.studentGroup === 'all' ? '全部学生' :
                 competencyFilters.studentGroup === 'active' ? '活跃学生' : '不活跃学生'}
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showFilterPanel && (
          <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-4 animate-fade-in">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程筛选（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {recentCourses.map((course) => {
                  const isSelected = competencyFilters.courseIds?.includes(course.id) || false
                  return (
                    <button
                      key={course.id}
                      onClick={() => {
                        const current = competencyFilters.courseIds || []
                        const updated = isSelected
                          ? current.filter(id => id !== course.id)
                          : [...current, course.id]
                        handleFilterChange({ courseIds: updated })
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {course.title}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Student Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学生群体
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: '全部学生' },
                  { value: 'active', label: '活跃学生' },
                  { value: 'inactive', label: '不活跃学生' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange({ studentGroup: option.value as 'all' | 'active' | 'inactive' })}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      competencyFilters.studentGroup === option.value
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                时间范围
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">开始日期</label>
                  <input
                    type="date"
                    value={competencyFilters.timeRange?.start.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const start = new Date(e.target.value)
                      handleFilterChange({
                        timeRange: {
                          start,
                          end: competencyFilters.timeRange?.end || new Date(),
                        },
                      })
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">结束日期</label>
                  <input
                    type="date"
                    value={competencyFilters.timeRange?.end.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const end = new Date(e.target.value)
                      handleFilterChange({
                        timeRange: {
                          start: competencyFilters.timeRange?.start || new Date(),
                          end,
                        },
                      })
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                重置筛选
              </button>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
              >
                应用筛选
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Competency Filter Bar */}
      <CompetencyFilterBar />

      {/* Competency Distribution Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              能力维度班级分布
            </h3>
            <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border border-primary-200">
              跨学科核心能力评估
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(Object.keys(filteredCompetencyDistributions) as CompetencyType[]).map((competencyType) => {
              const data = filteredCompetencyDistributions[competencyType];

              // Transform to ClassCompetencyDistribution format for the reusable component
              const distribution: ClassCompetencyDistribution = {
                competencyType: competencyType,
                distribution: {
                  star1: data.level1,
                  star2: data.level2,
                  star3: data.level3,
                  star4: data.level4,
                },
                averageStars: data.avgRating,
                totalStudents: data.totalStudents,
              };

              return (
                <CompetencyDistributionChart
                  key={competencyType}
                  distribution={distribution}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Student Alert Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Performance Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
          <div className="p-5 border-b border-red-100 bg-gradient-to-r from-red-50 to-amber-50">
            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              需要关注的学生
            </h3>
            <p className="text-xs text-red-600 mt-1">在关键能力维度表现较弱，建议重点辅导</p>
          </div>
          <div className="p-5 space-y-3">
            {filteredAlerts.lowPerformance.map((alert) => {
              const competencyDef = {
                critical_thinking: { name: '批判性思维', icon: '🧠' },
                information_synthesis: { name: '信息整合', icon: '🔗' },
                metacognition: { name: '元认知', icon: '👁️' },
                question_quality: { name: '提问质量', icon: '❓' },
                creativity: { name: '创造性', icon: '💡' },
                persistence: { name: '坚持性', icon: '🎯' },
              }[alert.competencyType!];

              return (
                <div key={alert.studentId} className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl hover:bg-red-50 transition-colors cursor-pointer border border-red-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm">
                    {alert.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        {competencyDef.icon} {competencyDef.name}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(alert.rating)].map((_, i) => (
                          <span key={i} className="text-amber-400 text-xs">★</span>
                        ))}
                        {[...Array(4 - alert.rating!)].map((_, i) => (
                          <span key={i} className="text-gray-300 text-xs">★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Performance Highlights */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              表现优异的学生
            </h3>
            <p className="text-xs text-emerald-600 mt-1">在多个能力维度表现突出，值得表扬与激励</p>
          </div>
          <div className="p-5 space-y-3">
            {filteredAlerts.highPerformance.map((alert) => {
              const competencyDefs = {
                critical_thinking: { name: '批判性思维', icon: '🧠' },
                information_synthesis: { name: '信息整合', icon: '🔗' },
                metacognition: { name: '元认知', icon: '👁️' },
                question_quality: { name: '提问质量', icon: '❓' },
                creativity: { name: '创造性', icon: '💡' },
                persistence: { name: '坚持性', icon: '🎯' },
              };

              return (
                <div key={alert.studentId} className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer border border-emerald-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm">
                    {alert.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-emerald-700 font-medium flex items-center gap-0.5">
                        平均 {alert.avgRating?.toFixed(1)}⭐
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {alert.competencyTypes?.slice(0, 2).map((type) => (
                          <span key={type} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
                            {competencyDefs[type].icon}
                          </span>
                        ))}
                        {alert.competencyTypes && alert.competencyTypes.length > 2 && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
                            +{alert.competencyTypes.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cross-Course Competency Trends */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              跨课程能力发展趋势
            </h3>
            <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border border-cyan-200">
              追踪学生能力成长轨迹
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {(Object.keys(filteredCompetencyTrends) as CompetencyType[])
              .filter((type) => filteredCompetencyTrends[type].length > 0)
              .map((competencyType) => {
                const trends = filteredCompetencyTrends[competencyType];
                const competencyDef = {
                  critical_thinking: { name: '批判性思维', icon: '🧠', color: 'blue' },
                  information_synthesis: { name: '信息整合', icon: '🔗', color: 'purple' },
                  metacognition: { name: '元认知', icon: '👁️', color: 'indigo' },
                  question_quality: { name: '提问质量', icon: '❓', color: 'teal' },
                  creativity: { name: '创造性', icon: '💡', color: 'amber' },
                  persistence: { name: '坚持性', icon: '🎯', color: 'rose' },
                }[competencyType];

                // Calculate class average stars for each course
                const courseAverages = trends.map((point) => {
                  const total = point.distribution.level1 + point.distribution.level2 + point.distribution.level3 + point.distribution.level4;
                  const avgStars = (
                    point.distribution.level1 * 1 +
                    point.distribution.level2 * 2 +
                    point.distribution.level3 * 3 +
                    point.distribution.level4 * 4
                  ) / total;
                  return { ...point, avgStars, total };
                });

                // Determine overall trend
                const firstAvg = courseAverages[0].avgStars;
                const lastAvg = courseAverages[courseAverages.length - 1].avgStars;
                const trendDirection = lastAvg > firstAvg + 0.1 ? 'rising' : lastAvg < firstAvg - 0.1 ? 'declining' : 'stable';

                return (
                  <div key={competencyType} className="bg-gradient-to-br from-cyan-50/30 to-blue-50/30 rounded-xl p-5 border border-cyan-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-${competencyDef.color}-100 flex items-center justify-center text-2xl`}>
                          {competencyDef.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{competencyDef.name}</h4>
                          <p className="text-xs text-gray-500">
                            {courseAverages.length} 门课程 ·
                            {trendDirection === 'rising' ? (
                              <span className="text-green-600 ml-1">↗ 上升趋势</span>
                            ) : trendDirection === 'declining' ? (
                              <span className="text-red-600 ml-1">↘ 下降趋势</span>
                            ) : (
                              <span className="text-gray-600 ml-1">→ 稳定表现</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">当前班级平均</p>
                        <p className="text-lg font-bold text-cyan-700">{lastAvg.toFixed(1)} ⭐</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-200 via-cyan-300 to-cyan-200"></div>

                      {/* Course Points */}
                      <div className="flex justify-between items-start relative">
                        {courseAverages.map((course, idx) => {
                          const progressPercent = ((course.avgStars - 1) / 3) * 100; // 1-4 stars mapped to 0-100%

                          return (
                            <div key={course.courseId} className="flex flex-col items-center flex-1 relative">
                              {/* Connection Line to Next Point */}
                              {idx < courseAverages.length - 1 && (
                                <div
                                  className={`absolute top-8 left-1/2 w-full h-1 ${
                                    courseAverages[idx + 1].avgStars > course.avgStars
                                      ? 'bg-gradient-to-r from-cyan-400 to-green-400'
                                      : courseAverages[idx + 1].avgStars < course.avgStars
                                      ? 'bg-gradient-to-r from-cyan-400 to-red-400'
                                      : 'bg-cyan-400'
                                  }`}
                                  style={{ zIndex: 1 }}
                                ></div>
                              )}

                              {/* Course Point */}
                              <div className="relative z-10 mb-3">
                                <div
                                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-lg ${
                                    idx === courseAverages.length - 1
                                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                                      : 'bg-gradient-to-br from-cyan-400 to-blue-400'
                                  }`}
                                >
                                  <span className="text-white text-lg font-bold">{course.avgStars.toFixed(1)}</span>
                                  <span className="text-white text-[10px]">⭐</span>
                                </div>
                                {idx === courseAverages.length - 1 && (
                                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                              </div>

                              {/* Course Info */}
                              <div className="text-center max-w-[120px]">
                                <p className="text-xs font-semibold text-gray-700 mb-1 line-clamp-2">{course.courseName}</p>
                                <p className="text-[10px] text-gray-500">{course.date}</p>
                                <div className="mt-2 flex items-center gap-0.5 justify-center">
                                  {[...Array(4)].map((_, starIdx) => (
                                    <span
                                      key={starIdx}
                                      className={`text-xs ${starIdx < Math.round(course.avgStars) ? 'text-amber-400' : 'text-gray-300'}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Progress Indicator */}
                              {idx < courseAverages.length - 1 && (
                                <div className="absolute top-20 left-full w-full flex items-center justify-center">
                                  {courseAverages[idx + 1].avgStars > course.avgStars ? (
                                    <span className="text-xs text-green-600 font-medium">
                                      +{(courseAverages[idx + 1].avgStars - course.avgStars).toFixed(1)}
                                    </span>
                                  ) : courseAverages[idx + 1].avgStars < course.avgStars ? (
                                    <span className="text-xs text-red-600 font-medium">
                                      {(courseAverages[idx + 1].avgStars - course.avgStars).toFixed(1)}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400 font-medium">-</span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Distribution Summary */}
                    <div className="mt-6 pt-4 border-t border-cyan-200">
                      <p className="text-xs text-gray-600 mb-2">最新课程能力分布：</p>
                      <div className="flex gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400">★★★★</span>
                          <span className="text-gray-600">{trends[trends.length - 1].distribution.level4}人</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400">★★★</span>
                          <span className="text-gray-600">{trends[trends.length - 1].distribution.level3}人</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400">★★</span>
                          <span className="text-gray-600">{trends[trends.length - 1].distribution.level2}人</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">★</span>
                          <span className="text-gray-600">{trends[trends.length - 1].distribution.level1}人</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="bg-white rounded-2xl p-5 border border-gray-100 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <p className="text-sm text-gray-500 mb-2">{metric.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              <span
                className={`text-sm font-medium ${
                  metric.good ? 'text-primary-600' : 'text-red-500'
                }`}
              >
                {metric.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Course Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h3 className="font-semibold text-gray-900 mb-4">课程表现对比</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">课程名称</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">完成率</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">满意度</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">互动率</th>
              </tr>
            </thead>
            <tbody>
              {coursePerformance.map((course) => (
                <tr key={course.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{course.name}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            course.completion >= 80 ? 'bg-primary-500' : course.completion >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${course.completion}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{course.completion}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-600">{course.satisfaction}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.engagement >= 85
                          ? 'bg-primary-100 text-primary-600'
                          : course.engagement >= 70
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {course.engagement}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="font-semibold text-gray-900">AI 教学建议</h3>
        </div>
        <div className="space-y-3">
          {aiSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${
                suggestion.type === 'improvement'
                  ? 'bg-primary-50 border-primary-100'
                  : suggestion.type === 'success'
                  ? 'bg-primary-50 border-primary-100'
                  : 'bg-amber-50 border-amber-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </div>
                <button
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    suggestion.type === 'improvement'
                      ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                      : suggestion.type === 'success'
                      ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                      : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                  }`}
                >
                  {suggestion.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 知识库组件
function KnowledgeBase() {
  const personalKnowledge = [
    { id: '1', title: '跨学科教学设计模板', type: 'document', size: '2.4 MB', date: '2024-12-20' },
    { id: '2', title: '水循环课程PPT', type: 'presentation', size: '15.8 MB', date: '2024-12-18' },
    { id: '3', title: '学生评估量表', type: 'spreadsheet', size: '156 KB', date: '2024-12-15' },
  ]

  const sharedKnowledge = [
    { id: '1', title: '跨学科教学案例集', author: '教研组', downloads: 156, type: 'document' },
    { id: '2', title: 'STEM课程资源包', author: '平台精选', downloads: 892, type: 'folder' },
    { id: '3', title: '项目式学习指南', author: '李老师', downloads: 234, type: 'document' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 个人知识库 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">个人知识库</h3>
            </div>
            <button className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              + 上传文件
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {personalKnowledge.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'document' ? 'bg-primary-100' :
                    item.type === 'presentation' ? 'bg-orange-100' : 'bg-green-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      item.type === 'document' ? 'text-primary-600' :
                      item.type === 'presentation' ? 'text-orange-600' : 'text-green-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.size} · {item.date}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 共享知识库 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">共享知识库</h3>
            </div>
            <button className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              浏览更多
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {sharedKnowledge.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'folder' ? 'bg-amber-100' : 'bg-primary-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      item.type === 'folder' ? 'text-amber-600' : 'text-primary-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.type === 'folder' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.author} · {item.downloads} 次下载</p>
                  </div>
                  <button className="px-3 py-1.5 text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                    引用
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 成长档案组件
function GrowthArchive() {
  const achievements = [
    { id: '1', title: '跨学科教学新星', desc: '完成10门跨学科课程设计', date: '2024-12-15', icon: '🌟' },
    { id: '2', title: '学生好评教师', desc: '连续3个月学生满意度4.5+', date: '2024-11-20', icon: '❤️' },
    { id: '3', title: '创新教学先锋', desc: '首次使用AI辅助教学功能', date: '2024-10-08', icon: '🚀' },
  ]

  const growthPath = [
    { level: 1, name: '入门教师', completed: true, courses: 3 },
    { level: 2, name: '进阶教师', completed: true, courses: 10 },
    { level: 3, name: '资深教师', completed: false, courses: 25, current: 15 },
    { level: 4, name: '专家教师', completed: false, courses: 50 },
  ]

  return (
    <div className="space-y-6">
      {/* 成长概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl p-5 text-white">
          <p className="text-white/80 text-sm mb-2">教学时长</p>
          <p className="text-3xl font-bold">156</p>
          <p className="text-white/60 text-sm">小时</p>
        </div>
        <div className="bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl p-5 text-white">
          <p className="text-white/80 text-sm mb-2">累计学生</p>
          <p className="text-3xl font-bold">328</p>
          <p className="text-white/60 text-sm">人次</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
          <p className="text-white/80 text-sm mb-2">获得成就</p>
          <p className="text-3xl font-bold">12</p>
          <p className="text-white/60 text-sm">枚徽章</p>
        </div>
      </div>

      {/* 成长路径 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">成长路径</h3>
        <div className="flex items-center justify-between">
          {growthPath.map((level, index) => (
            <div key={level.level} className="flex-1 flex flex-col items-center">
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                level.completed
                  ? 'bg-primary-500 text-white'
                  : level.current
                  ? 'bg-primary-100 text-primary-600 ring-4 ring-primary-200'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {level.completed ? '✓' : level.level}
              </div>
              <p className={`mt-2 text-sm font-medium ${level.completed || level.current ? 'text-gray-900' : 'text-gray-400'}`}>
                {level.name}
              </p>
              <p className="text-xs text-gray-500">
                {level.current ? `${level.current}/${level.courses} 课程` : `${level.courses} 课程`}
              </p>
              {index < growthPath.length - 1 && (
                <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
                  level.completed ? 'bg-primary-500' : 'bg-gray-200'
                }`} style={{ transform: 'translateX(50%)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 成就徽章 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">最近成就</h3>
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center text-2xl">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{achievement.title}</p>
                <p className="text-sm text-gray-500">{achievement.desc}</p>
              </div>
              <p className="text-xs text-gray-400">{achievement.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
