'use client'

import { useState } from 'react'

// 模拟数据
const teachers = [
  {
    id: '1',
    name: '张明华',
    avatar: '张',
    email: 'zhangmh@example.com',
    phone: '138****1234',
    school: '北京四中',
    subjects: ['物理', '数学'],
    level: '高级教师',
    status: 'active',
    courses: 8,
    students: 245,
    rating: 4.9,
    joinDate: '2023-06-15',
    lastActive: '2小时前',
  },
  {
    id: '2',
    name: '李文静',
    avatar: '李',
    email: 'liwj@example.com',
    phone: '139****5678',
    school: '上海中学',
    subjects: ['数学', '信息技术'],
    level: '特级教师',
    status: 'active',
    courses: 6,
    students: 198,
    rating: 4.8,
    joinDate: '2023-03-20',
    lastActive: '30分钟前',
  },
  {
    id: '3',
    name: '王建国',
    avatar: '王',
    email: 'wangjg@example.com',
    phone: '137****9012',
    school: '深圳中学',
    subjects: ['化学', '生物'],
    level: '高级教师',
    status: 'active',
    courses: 7,
    students: 212,
    rating: 4.8,
    joinDate: '2023-08-10',
    lastActive: '1小时前',
  },
  {
    id: '4',
    name: '刘晓燕',
    avatar: '刘',
    email: 'liuxy@example.com',
    phone: '136****3456',
    school: '杭州二中',
    subjects: ['历史', '地理'],
    level: '一级教师',
    status: 'inactive',
    courses: 5,
    students: 156,
    rating: 4.7,
    joinDate: '2023-09-05',
    lastActive: '3天前',
  },
  {
    id: '5',
    name: '陈志强',
    avatar: '陈',
    email: 'chenzq@example.com',
    phone: '135****7890',
    school: '成都七中',
    subjects: ['物理', '化学'],
    level: '高级教师',
    status: 'pending',
    courses: 0,
    students: 0,
    rating: 0,
    joinDate: '2024-12-20',
    lastActive: '-',
  },
  {
    id: '6',
    name: '赵美玲',
    avatar: '赵',
    email: 'zhaoml@example.com',
    phone: '134****2345',
    school: '北京四中',
    subjects: ['语文', '英语'],
    level: '一级教师',
    status: 'active',
    courses: 4,
    students: 128,
    rating: 4.6,
    joinDate: '2023-11-12',
    lastActive: '5小时前',
  },
]

const schools = ['全部学校', '北京四中', '上海中学', '深圳中学', '杭州二中', '成都七中']
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '正常' },
  { value: 'inactive', label: '未激活' },
  { value: 'pending', label: '待审核' },
]

const subjectColors: Record<string, string> = {
  '数学': 'bg-primary-100 text-primary-600',
  '物理': 'bg-primary-100 text-primary-600',
  '化学': 'bg-amber-100 text-amber-600',
  '生物': 'bg-green-100 text-green-600',
  '地理': 'bg-cyan-100 text-cyan-600',
  '历史': 'bg-accent-100 text-accent-600',
  '语文': 'bg-pink-100 text-pink-600',
  '英语': 'bg-orange-100 text-orange-600',
  '信息技术': 'bg-accent-100 text-accent-600',
}

export default function TeacherManagement() {
  const [selectedSchool, setSelectedSchool] = useState('全部学校')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([])
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<typeof teachers[0] | null>(null)

  const filteredTeachers = teachers.filter((teacher) => {
    if (selectedSchool !== '全部学校' && teacher.school !== selectedSchool) return false
    if (selectedStatus !== 'all' && teacher.status !== selectedStatus) return false
    if (searchQuery && !teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !teacher.email.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleSelectAll = () => {
    if (selectedTeachers.length === filteredTeachers.length) {
      setSelectedTeachers([])
    } else {
      setSelectedTeachers(filteredTeachers.map(t => t.id))
    }
  }

  const handleSelectTeacher = (id: string) => {
    setSelectedTeachers(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const openTeacherDetail = (teacher: typeof teachers[0]) => {
    setSelectedTeacher(teacher)
    setShowDetailModal(true)
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="h-full px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">教师管理</h1>
            <p className="text-sm text-gray-500">共 {teachers.length} 位教师</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加教师
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
                <p className="text-sm text-gray-500 mb-1">活跃教师</p>
                <p className="text-2xl font-bold text-gray-900">{teachers.filter(t => t.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">待审核</p>
                <p className="text-2xl font-bold text-gray-900">{teachers.filter(t => t.status === 'pending').length}</p>
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
                <p className="text-sm text-gray-500 mb-1">总课程数</p>
                <p className="text-2xl font-bold text-gray-900">{teachers.reduce((sum, t) => sum + t.courses, 0)}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">平均评分</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(teachers.filter(t => t.rating > 0).reduce((sum, t) => sum + t.rating, 0) / teachers.filter(t => t.rating > 0).length).toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-600 fill-current" viewBox="0 0 20 20">
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
                placeholder="搜索教师姓名或邮箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

            {/* School Filter */}
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {schools.map((school) => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            {/* Batch Actions */}
            {selectedTeachers.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500">已选择 {selectedTeachers.length} 项</span>
                <button className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  批量删除
                </button>
                <button className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  批量激活
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-4 px-4">
                  <input
                    type="checkbox"
                    checked={selectedTeachers.length === filteredTeachers.length && filteredTeachers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">教师信息</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">学校</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">学科</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-gray-500">课程/学生</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-gray-500">评分</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-gray-500">状态</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher.id)}
                      onChange={() => handleSelectTeacher(teacher.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-medium">
                        {teacher.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{teacher.name}</p>
                        <p className="text-sm text-gray-500">{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-900">{teacher.school}</p>
                    <p className="text-xs text-gray-500">{teacher.level}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject) => (
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
                    <p className="text-sm font-medium text-gray-900">{teacher.courses}</p>
                    <p className="text-xs text-gray-500">{teacher.students} 学生</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {teacher.rating > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{teacher.rating}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">暂无</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        teacher.status === 'active'
                          ? 'bg-primary-100 text-primary-600'
                          : teacher.status === 'inactive'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          teacher.status === 'active'
                            ? 'bg-primary-500'
                            : teacher.status === 'inactive'
                            ? 'bg-gray-400'
                            : 'bg-amber-500'
                        }`}
                      ></span>
                      {teacher.status === 'active' ? '正常' : teacher.status === 'inactive' ? '未激活' : '待审核'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openTeacherDetail(teacher)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
              显示 1-{filteredTeachers.length} 条，共 {filteredTeachers.length} 条
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50" disabled>
                上一页
              </button>
              <button className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg">1</button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50" disabled>
                下一页
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">教师详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedTeacher.avatar}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedTeacher.name}</h4>
                  <p className="text-gray-500">{selectedTeacher.level} · {selectedTeacher.school}</p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full ${
                      selectedTeacher.status === 'active'
                        ? 'bg-primary-100 text-primary-600'
                        : selectedTeacher.status === 'inactive'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {selectedTeacher.status === 'active' ? '正常' : selectedTeacher.status === 'inactive' ? '未激活' : '待审核'}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">邮箱</p>
                  <p className="font-medium text-gray-900">{selectedTeacher.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">手机</p>
                  <p className="font-medium text-gray-900">{selectedTeacher.phone}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">加入时间</p>
                  <p className="font-medium text-gray-900">{selectedTeacher.joinDate}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">最后活跃</p>
                  <p className="font-medium text-gray-900">{selectedTeacher.lastActive}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-primary-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedTeacher.courses}</p>
                  <p className="text-sm text-gray-600">创建课程</p>
                </div>
                <div className="p-4 bg-primary-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedTeacher.students}</p>
                  <p className="text-sm text-gray-600">教授学生</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-amber-600">{selectedTeacher.rating || '-'}</p>
                  <p className="text-sm text-gray-600">平均评分</p>
                </div>
              </div>

              {/* Subjects */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">教授学科</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTeacher.subjects.map((subject) => (
                    <span
                      key={subject}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full ${subjectColors[subject] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  查看课程
                </button>
                <button className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors">
                  发送消息
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
