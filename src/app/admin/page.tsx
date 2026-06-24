'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// 模拟数据
const overviewStats = [
  { label: '在用教师', value: '8', change: '+1', changeType: 'up', icon: '👨‍🏫', color: 'blue' },
  { label: '开设班级', value: '15', change: '+3', changeType: 'up', icon: '🏫', color: 'teal' },
  { label: '学生总数', value: '426', change: '+23', changeType: 'up', icon: '👨‍🎓', color: 'amber' },
  { label: '本学期课程', value: '12', change: '+2', changeType: 'up', icon: '📚', color: 'blue' },
]

const userTrendData = [
  { month: '9月', submissions: 320, active: 280 },
  { month: '10月', submissions: 410, active: 330 },
  { month: '11月', submissions: 450, active: 350 },
  { month: '12月', submissions: 380, active: 310 },
  { month: '1月', submissions: 290, active: 260 },
  { month: '2月', submissions: 240, active: 215 },
  { month: '3月', submissions: 480, active: 370 },
  { month: '4月', submissions: 530, active: 395 },
  { month: '5月', submissions: 510, active: 385 },
  { month: '6月', submissions: 420, active: 350 },
]

const courseDistribution = [
  { name: '科学+数学', value: 22, color: '#10b981' },
  { name: '历史+地理', value: 18, color: '#14b8a6' },
  { name: '数学+艺术', value: 15, color: '#f59e0b' },
  { name: '生物+化学', value: 14, color: '#22c55e' },
  { name: '物理+工程', value: 12, color: '#06b6d4' },
  { name: '语文+历史', value: 10, color: '#8b5cf6' },
  { name: '其他组合', value: 9, color: '#6b7280' },
]

const weeklyActivity = [
  { day: '周一', tasks: 28, interactions: 136 },
  { day: '周二', tasks: 35, interactions: 158 },
  { day: '周三', tasks: 31, interactions: 142 },
  { day: '周四', tasks: 40, interactions: 175 },
  { day: '周五', tasks: 26, interactions: 118 },
  { day: '周六', tasks: 8, interactions: 32 },
  { day: '周日', tasks: 5, interactions: 21 },
]

const topTeachers = [
  { id: '1', name: '张老师', department: '理综组', courses: 3, studentCount: 88, rating: 4.9, avatar: '张' },
  { id: '2', name: '李老师', department: '文综组', courses: 2, studentCount: 72, rating: 4.8, avatar: '李' },
  { id: '3', name: '王老师', department: '理综组', courses: 3, studentCount: 96, rating: 4.7, avatar: '王' },
  { id: '4', name: '刘老师', department: '艺综组', courses: 1, studentCount: 36, rating: 4.7, avatar: '刘' },
  { id: '5', name: '陈老师', department: '文综组', courses: 2, studentCount: 70, rating: 4.6, avatar: '陈' },
]

const recentActivities = [
  { id: '1', type: 'course', action: '发布了新课程', user: '张老师', target: '《水循环与生态平衡》', time: '30分钟前' },
  { id: '2', type: 'submission', action: '完成了本学期首个跨学科项目', user: '八年级(2)班', target: '《城市绿地规划》', time: '2小时前' },
  { id: '3', type: 'report', action: '学习预警：连续7天未登录', user: '七年级(1)班', target: '3名学生', time: '4小时前' },
  { id: '4', type: 'course', action: '的《植物工厂探究》完成率达90%', user: '李老师', target: '', time: '昨天' },
  { id: '5', type: 'report', action: '完成学期中期跨学科教学评估', user: '理综组', target: '', time: '昨天' },
]

const classProgress = [
  { className: '七年级(1)班', students: 30, completionRate: 82, avgScore: 87, activeRate: 92 },
  { className: '七年级(2)班', students: 29, completionRate: 75, avgScore: 83, activeRate: 86 },
  { className: '七年级(3)班', students: 28, completionRate: 68, avgScore: 79, activeRate: 78 },
  { className: '八年级(1)班', students: 30, completionRate: 88, avgScore: 91, activeRate: 95 },
  { className: '八年级(2)班', students: 29, completionRate: 80, avgScore: 85, activeRate: 88 },
  { className: '八年级(3)班', students: 28, completionRate: 71, avgScore: 80, activeRate: 82 },
  { className: '九年级(1)班', students: 30, completionRate: 76, avgScore: 84, activeRate: 85 },
  { className: '九年级(2)班', students: 28, completionRate: 84, avgScore: 88, activeRate: 91 },
]

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="h-full px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">学校数据总览</h1>
            <p className="text-sm text-gray-500">欢迎，管理员</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as typeof timeRange)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range === 'week' ? '本周' : range === 'month' ? '本月' : '本年'}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出报告
            </button>

            {/* Notification */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-primary-200/10 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
          {overviewStats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.changeType === 'up' ? 'bg-primary-100 text-primary-600' : 'bg-red-100 text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* User Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">全校学习活跃度趋势（2025-2026学年）</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
                  月度任务提交量
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-accent-500 rounded-full"></span>
                  月活跃学生数
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userTrendData}>
                <defs>
                  <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActive)"
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSubmissions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Course Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-semibold text-gray-900 mb-6">跨学科组合分布</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={courseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {courseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {courseDistribution.slice(0, 6).map((item) => (
                <span key={item.name} className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Weekly Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-semibold text-gray-900 mb-6">本周全校任务提交量</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Teachers */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">教师贡献榜</h3>
              <span className="text-xs text-gray-400">按学生满意度排序</span>
            </div>
            <div className="space-y-3">
              {topTeachers.map((teacher, index) => (
                <div key={teacher.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    index === 0 ? 'bg-amber-100 text-amber-600' :
                    index === 1 ? 'bg-gray-200 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
                    {teacher.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{teacher.name}</p>
                    <p className="text-xs text-gray-500 truncate">{teacher.department} · {teacher.courses}门课程</p>
                  </div>
                  <div className="text-sm font-semibold text-primary-600">
                    ⭐ {teacher.rating}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="font-semibold text-gray-900 mb-4">最近动态</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'course' ? 'bg-primary-100 text-primary-600' :
                    activity.type === 'submission' ? 'bg-accent-100 text-accent-600' :
                    activity.type === 'report' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {activity.type === 'course' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                    {activity.type === 'submission' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {activity.type === 'report' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    {activity.type === 'alert' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-gray-600">{activity.action}</span>
                      {activity.target && (
                        <span className="font-medium text-primary-600"> {activity.target}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Class Progress Table */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">各班级学习进度对比</h3>
              <p className="text-xs text-gray-400 mt-0.5">展示 8 / 15 个班级</p>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              导出报告 →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">班级</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">学生数</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">任务完成率</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">平均得分</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">活跃率</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {classProgress.map((cls) => (
                  <tr key={cls.className} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{cls.className}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{cls.students}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${cls.completionRate}%` }} />
                        </div>
                        <span className="text-sm text-gray-700">{cls.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cls.avgScore >= 90 ? 'bg-primary-100 text-primary-600' :
                        cls.avgScore >= 80 ? 'bg-accent-100 text-accent-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {cls.avgScore}分
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">{cls.activeRate}%</td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
