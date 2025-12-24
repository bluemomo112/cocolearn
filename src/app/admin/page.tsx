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
  { label: '总教师数', value: '342', change: '+12', changeType: 'up', icon: '👨‍🏫', color: 'blue' },
  { label: '总学生数', value: '8,562', change: '+256', changeType: 'up', icon: '👨‍🎓', color: 'teal' },
  { label: '课程总数', value: '156', change: '+8', changeType: 'up', icon: '📚', color: 'blue' },
  { label: '本周活跃度', value: '94.2%', change: '+2.3%', changeType: 'up', icon: '📊', color: 'amber' },
]

const userTrendData = [
  { month: '1月', teachers: 280, students: 6500 },
  { month: '2月', teachers: 295, students: 6800 },
  { month: '3月', teachers: 310, students: 7200 },
  { month: '4月', teachers: 318, students: 7600 },
  { month: '5月', teachers: 325, students: 7900 },
  { month: '6月', teachers: 332, students: 8100 },
  { month: '7月', teachers: 335, students: 8200 },
  { month: '8月', teachers: 338, students: 8350 },
  { month: '9月', teachers: 340, students: 8450 },
  { month: '10月', teachers: 341, students: 8500 },
  { month: '11月', teachers: 342, students: 8550 },
  { month: '12月', teachers: 342, students: 8562 },
]

const courseDistribution = [
  { name: '数学', value: 28, color: '#10b981' },
  { name: '物理', value: 24, color: '#3b82f6' },
  { name: '化学', value: 18, color: '#f59e0b' },
  { name: '生物', value: 16, color: '#22c55e' },
  { name: '地理', value: 14, color: '#06b6d4' },
  { name: '历史', value: 12, color: '#8b5cf6' },
  { name: '其他', value: 44, color: '#6b7280' },
]

const weeklyActivity = [
  { day: '周一', lessons: 45, interactions: 1250 },
  { day: '周二', lessons: 52, interactions: 1380 },
  { day: '周三', lessons: 48, interactions: 1290 },
  { day: '周四', lessons: 55, interactions: 1420 },
  { day: '周五', lessons: 42, interactions: 1180 },
  { day: '周六', lessons: 18, interactions: 520 },
  { day: '周日', lessons: 12, interactions: 380 },
]

const topTeachers = [
  { id: '1', name: '张明华', school: '北京四中', courses: 8, students: 245, rating: 4.9, avatar: '张' },
  { id: '2', name: '李文静', school: '上海中学', courses: 6, students: 198, rating: 4.8, avatar: '李' },
  { id: '3', name: '王建国', school: '深圳中学', courses: 7, students: 212, rating: 4.8, avatar: '王' },
  { id: '4', name: '刘晓燕', school: '杭州二中', courses: 5, students: 156, rating: 4.7, avatar: '刘' },
  { id: '5', name: '陈志强', school: '成都七中', courses: 6, students: 178, rating: 4.7, avatar: '陈' },
]

const recentActivities = [
  { id: '1', type: 'course', action: '创建了新课程', user: '张明华', target: '《气候变化与生态系统》', time: '5分钟前' },
  { id: '2', type: 'teacher', action: '完成了教师认证', user: '新教师 王丽', target: '', time: '15分钟前' },
  { id: '3', type: 'report', action: '生成了月度报告', user: '系统', target: '11月教学报告', time: '30分钟前' },
  { id: '4', type: 'course', action: '发布了课程', user: '李文静', target: '《数学与音乐》', time: '1小时前' },
  { id: '5', type: 'alert', action: '触发了异常提醒', user: '系统', target: '服务器负载过高', time: '2小时前' },
]

const schoolRanking = [
  { school: '北京四中', teachers: 28, students: 856, courses: 42, score: 96 },
  { school: '上海中学', teachers: 24, students: 742, courses: 38, score: 94 },
  { school: '深圳中学', teachers: 22, students: 698, courses: 35, score: 92 },
  { school: '杭州二中', teachers: 20, students: 612, courses: 32, score: 90 },
  { school: '成都七中', teachers: 18, students: 545, courses: 28, score: 88 },
]

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="h-full px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">数据仪表盘</h1>
            <p className="text-sm text-gray-500">欢迎回来，管理员</p>
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
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-200/10 rounded-full blur-3xl" />
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
                  stat.changeType === 'up' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
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
              <h3 className="font-semibold text-gray-900">用户增长趋势</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  教师
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  学生
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userTrendData}>
                <defs>
                  <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                  dataKey="students"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStudents)"
                />
                <Area
                  type="monotone"
                  dataKey="teachers"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTeachers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Course Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-semibold text-gray-900 mb-6">课程学科分布</h3>
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
            <h3 className="font-semibold text-gray-900 mb-6">本周活动统计</h3>
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
                <Bar dataKey="lessons" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Teachers */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">优秀教师榜</h3>
              <Link href="/admin/teachers" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                查看全部 →
              </Link>
            </div>
            <div className="space-y-3">
              {topTeachers.map((teacher, index) => (
                <div key={teacher.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-600' :
                    index === 1 ? 'bg-gray-200 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white text-sm font-medium">
                    {teacher.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{teacher.name}</p>
                    <p className="text-xs text-gray-500 truncate">{teacher.school}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-amber-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {teacher.rating}
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
                    activity.type === 'course' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'teacher' ? 'bg-sky-100 text-sky-600' :
                    activity.type === 'report' ? 'bg-blue-100 text-blue-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {activity.type === 'course' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                    {activity.type === 'teacher' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                    {activity.type === 'report' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                        <span className="font-medium text-blue-600"> {activity.target}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* School Ranking Table */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">学校排名</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              查看详细报告 →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">排名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">学校名称</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">教师数</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">学生数</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">课程数</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">综合评分</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {schoolRanking.map((school, index) => (
                  <tr key={school.school} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-600' :
                        index === 1 ? 'bg-gray-200 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">{school.school}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{school.teachers}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{school.students}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{school.courses}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        school.score >= 95 ? 'bg-blue-100 text-blue-600' :
                        school.score >= 90 ? 'bg-sky-100 text-sky-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {school.score}分
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
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
