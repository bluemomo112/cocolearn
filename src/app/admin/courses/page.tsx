'use client'

import { useState } from 'react'

// 模拟数据
const courses = [
  {
    id: '1',
    title: '水循环与气候变化探究',
    cover: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=400&h=300&fit=crop',
    creator: '张明华',
    school: '北京四中',
    subjects: ['地理', '物理'],
    grade: '高中',
    students: 1250,
    rating: 4.9,
    status: 'published',
    source: 'official',
    createdAt: '2024-10-15',
    publishedAt: '2024-10-20',
    views: 5680,
    completionRate: 78,
  },
  {
    id: '2',
    title: '数学建模与环境保护',
    cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    creator: '李文静',
    school: '上海中学',
    subjects: ['数学', '生物'],
    grade: '高中',
    students: 856,
    rating: 4.8,
    status: 'published',
    source: 'school',
    createdAt: '2024-09-10',
    publishedAt: '2024-09-15',
    views: 3420,
    completionRate: 82,
  },
  {
    id: '3',
    title: '文艺复兴的科学革命',
    cover: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop',
    creator: '王建国',
    school: '深圳中学',
    subjects: ['历史', '物理'],
    grade: '初中',
    students: 643,
    rating: 4.8,
    status: 'pending',
    source: 'school',
    createdAt: '2024-12-18',
    publishedAt: null,
    views: 0,
    completionRate: 0,
  },
  {
    id: '4',
    title: '音乐中的数学之美',
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop',
    creator: '刘晓燕',
    school: '杭州二中',
    subjects: ['数学', '音乐'],
    grade: '初中',
    students: 428,
    rating: 4.7,
    status: 'published',
    source: 'official',
    createdAt: '2024-08-05',
    publishedAt: '2024-08-10',
    views: 2150,
    completionRate: 75,
  },
  {
    id: '5',
    title: '化学反应与艺术创作',
    cover: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop',
    creator: '陈志强',
    school: '成都七中',
    subjects: ['化学', '美术'],
    grade: '高中',
    students: 312,
    rating: 4.6,
    status: 'draft',
    source: 'school',
    createdAt: '2024-12-20',
    publishedAt: null,
    views: 0,
    completionRate: 0,
  },
  {
    id: '6',
    title: '编程思维与逻辑推理',
    cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop',
    creator: '赵美玲',
    school: '北京四中',
    subjects: ['信息技术', '数学'],
    grade: '初中',
    students: 567,
    rating: 4.5,
    status: 'rejected',
    source: 'school',
    createdAt: '2024-12-10',
    publishedAt: null,
    views: 0,
    completionRate: 0,
    rejectReason: '内容与已有课程重复度较高，建议调整课程结构',
  },
]

const subjects = ['全部学科', '数学', '物理', '化学', '生物', '地理', '历史', '语文', '英语', '信息技术', '音乐', '美术']
const grades = ['全部年级', '小学', '初中', '高中']
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'published', label: '已发布' },
  { value: 'pending', label: '待审核' },
  { value: 'draft', label: '草稿' },
  { value: 'rejected', label: '已驳回' },
]
const sourceOptions = [
  { value: 'all', label: '全部来源' },
  { value: 'official', label: '官方' },
  { value: 'school', label: '学校' },
]

const subjectColors: Record<string, string> = {
  '数学': 'bg-blue-100 text-blue-600',
  '物理': 'bg-blue-100 text-blue-600',
  '化学': 'bg-amber-100 text-amber-600',
  '生物': 'bg-green-100 text-green-600',
  '地理': 'bg-cyan-100 text-cyan-600',
  '历史': 'bg-sky-100 text-sky-600',
  '语文': 'bg-pink-100 text-pink-600',
  '英语': 'bg-orange-100 text-orange-600',
  '信息技术': 'bg-indigo-100 text-indigo-600',
  '音乐': 'bg-sky-100 text-sky-600',
  '美术': 'bg-rose-100 text-rose-600',
}

export default function CourseManagement() {
  const [selectedSubject, setSelectedSubject] = useState('全部学科')
  const [selectedGrade, setSelectedGrade] = useState('全部年级')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const filteredCourses = courses.filter((course) => {
    if (selectedSubject !== '全部学科' && !course.subjects.includes(selectedSubject)) return false
    if (selectedGrade !== '全部年级' && course.grade !== selectedGrade) return false
    if (selectedStatus !== 'all' && course.status !== selectedStatus) return false
    if (selectedSource !== 'all' && course.source !== selectedSource) return false
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const pendingCount = courses.filter(c => c.status === 'pending').length
  const publishedCount = courses.filter(c => c.status === 'published').length
  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0)
  const avgRating = (courses.filter(c => c.rating > 0).reduce((sum, c) => sum + c.rating, 0) / courses.filter(c => c.rating > 0).length).toFixed(1)

  const openReviewModal = (course: typeof courses[0]) => {
    setSelectedCourse(course)
    setShowReviewModal(true)
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="h-full px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">课程管理</h1>
            <p className="text-sm text-gray-500">共 {courses.length} 门课程</p>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-600 text-sm font-medium rounded-full">
                {pendingCount} 待审核
              </span>
            )}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">已发布课程</p>
                <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">待审核</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">总学习人数</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">平均评分</p>
                <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-600 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="搜索课程名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filters */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {grades.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sourceOptions.map((source) => (
                <option key={source.value} value={source.value}>{source.label}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 ml-auto">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Course List/Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">课程信息</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">创建者</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-gray-500">学科</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-gray-500">学习人数</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-gray-500">评分</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.cover}
                          alt={course.title}
                          className="w-16 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{course.title}</p>
                          <p className="text-sm text-gray-500">{course.grade} · {course.source === 'official' ? '官方' : '学校'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{course.creator}</p>
                      <p className="text-xs text-gray-500">{course.school}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {course.subjects.map((subject) => (
                          <span
                            key={subject}
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${subjectColors[subject] || 'bg-gray-100 text-gray-600'}`}
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <p className="text-sm font-medium text-gray-900">{course.students.toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {course.rating > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900">{course.rating}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">暂无</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          course.status === 'published'
                            ? 'bg-blue-100 text-blue-600'
                            : course.status === 'pending'
                            ? 'bg-amber-100 text-amber-600'
                            : course.status === 'draft'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {course.status === 'published' ? '已发布' :
                         course.status === 'pending' ? '待审核' :
                         course.status === 'draft' ? '草稿' : '已驳回'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {course.status === 'pending' && (
                          <button
                            onClick={() => openReviewModal(course)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            审核
                          </button>
                        )}
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                显示 1-{filteredCourses.length} 条，共 {filteredCourses.length} 条
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50" disabled>
                  上一页
                </button>
                <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">1</button>
                <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50" disabled>
                  下一页
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative h-40">
                  <img src={course.cover} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-lg ${
                        course.status === 'published'
                          ? 'bg-blue-500 text-white'
                          : course.status === 'pending'
                          ? 'bg-amber-500 text-white'
                          : course.status === 'draft'
                          ? 'bg-gray-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {course.status === 'published' ? '已发布' :
                       course.status === 'pending' ? '待审核' :
                       course.status === 'draft' ? '草稿' : '已驳回'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-semibold text-white line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-white/80">{course.creator} · {course.school}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.subjects.map((subject) => (
                      <span
                        key={subject}
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${subjectColors[subject] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{course.students.toLocaleString()} 学生</span>
                    {course.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {course.rating}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {course.status === 'pending' ? (
                      <button
                        onClick={() => openReviewModal(course)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        审核
                      </button>
                    ) : (
                      <button className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                        查看详情
                      </button>
                    )}
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showReviewModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">课程审核</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {/* Course Preview */}
              <div className="flex gap-4 mb-6">
                <img
                  src={selectedCourse.cover}
                  alt={selectedCourse.title}
                  className="w-32 h-24 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{selectedCourse.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">{selectedCourse.creator} · {selectedCourse.school}</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCourse.subjects.map((subject) => (
                      <span
                        key={subject}
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${subjectColors[subject] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Checklist */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-3">审核项目</h5>
                <div className="space-y-2">
                  {[
                    '课程内容符合教学大纲要求',
                    '跨学科整合设计合理',
                    '资源质量符合标准',
                    '无版权问题',
                    '无不当内容',
                  ].map((item, index) => (
                    <label key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reject Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">驳回原因（如驳回）</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="请输入驳回原因..."
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors">
                  驳回
                </button>
                <button className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                  通过
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
