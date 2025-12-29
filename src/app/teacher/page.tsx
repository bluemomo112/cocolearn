'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 模拟数据
const recentCourses = [
  {
    id: '1',
    title: '水循环与气候变化',
    subjects: ['地理', '物理'],
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
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-sky-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
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
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}>{tab.icon}</span>
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
                      stat.change.startsWith('+') ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
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
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-100 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">探索更多课程资源</h3>
                <p className="text-gray-600 text-sm">发现平台上的优质跨学科课程资源</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/course-center"
                  className="flex items-center gap-2 px-5 py-2.5 border border-blue-300 text-blue-700 text-sm font-medium rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  进入课程中心
                </Link>
                <button
                  onClick={() => setShowCourseTypeModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
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
                          ? 'bg-blue-500 text-white'
                          : course.status === 'draft'
                          ? 'bg-gray-500 text-white'
                          : 'bg-sky-500 text-white'
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
                            className="h-full bg-blue-500 rounded-full transition-all"
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
                        <Link
                          href={`/teacher/courses/${course.id}/teach`}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors text-center"
                        >
                          授课
                        </Link>
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
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 hover:border-blue-500'
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
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
              <a
                href="/LMS-Teacher-Teaching.html"
                className="group relative bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-100 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  {/* 图标 */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-lg">实时同步</span>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-lg">统一进度</span>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-lg">课堂互动</span>
                  </div>
                </div>

                {/* 箭头指示 */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              {/* 以学生为中心的课堂 */}
              <a
                href="/LMS-Teacher-NoteConfig.html"
                className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
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
              </a>
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

  return (
    <div className="space-y-6">
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
                  metric.good ? 'text-blue-600' : 'text-red-500'
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
                            course.completion >= 80 ? 'bg-blue-500' : course.completion >= 60 ? 'bg-amber-500' : 'bg-red-500'
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
                          ? 'bg-blue-100 text-blue-600'
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
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  ? 'bg-blue-50 border-blue-100'
                  : suggestion.type === 'success'
                  ? 'bg-blue-50 border-blue-100'
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
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      : suggestion.type === 'success'
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
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
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">个人知识库</h3>
            </div>
            <button className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              + 上传文件
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {personalKnowledge.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'document' ? 'bg-blue-100' :
                    item.type === 'presentation' ? 'bg-orange-100' : 'bg-green-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      item.type === 'document' ? 'text-blue-600' :
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
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">共享知识库</h3>
            </div>
            <button className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              浏览更多
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {sharedKnowledge.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'folder' ? 'bg-amber-100' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      item.type === 'folder' ? 'text-amber-600' : 'text-blue-600'
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
                  <button className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
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
        <div className="bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl p-5 text-white">
          <p className="text-white/80 text-sm mb-2">教学时长</p>
          <p className="text-3xl font-bold">156</p>
          <p className="text-white/60 text-sm">小时</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl p-5 text-white">
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
                  ? 'bg-blue-500 text-white'
                  : level.current
                  ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-200'
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
                  level.completed ? 'bg-blue-500' : 'bg-gray-200'
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
