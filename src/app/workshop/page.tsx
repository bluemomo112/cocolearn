'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 工作坊数据
const workshops = [
  {
    id: 'ws_001',
    title: '跨学科教学设计工作坊',
    description: '通过系统化的学习，掌握跨学科课程设计的核心方法，运用C-POTE模型创建优质教案',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
    progress: 60,
    participants: 128,
    startTime: '2025-01-15',
    endTime: '2025-02-15',
    status: 'ongoing',
    tags: ['跨学科', '教学设计', 'C-POTE'],
    instructor: {
      name: '张教授',
      avatar: '张'
    }
  },
  {
    id: 'ws_002',
    title: '课堂提问技巧工作坊',
    description: '学习布鲁姆认知目标层级，设计促进深度思考的提问策略，提升课堂互动质量',
    coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop',
    progress: 100,
    participants: 95,
    startTime: '2024-12-01',
    endTime: '2024-12-31',
    status: 'completed',
    tags: ['提问技巧', '课堂互动', '布鲁姆'],
    instructor: {
      name: '李老师',
      avatar: '李'
    }
  },
  {
    id: 'ws_003',
    title: 'AI辅助教学实践工作坊',
    description: '探索人工智能与学科教学的深度融合，打造智慧课堂，提升教学效率和学习体验',
    coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=400&fit=crop',
    progress: 0,
    participants: 0,
    startTime: '2025-02-01',
    endTime: '2025-03-01',
    status: 'upcoming',
    tags: ['AI教学', '智慧课堂', '教育科技'],
    instructor: {
      name: '王博士',
      avatar: '王'
    }
  },
  {
    id: 'ws_004',
    title: '形成性评价策略工作坊',
    description: '掌握多样化的形成性评价方法，及时了解学生学习进展，调整教学策略',
    coverImage: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&h=400&fit=crop',
    progress: 35,
    participants: 76,
    startTime: '2025-01-01',
    endTime: '2025-01-31',
    status: 'ongoing',
    tags: ['形成性评价', '学习评估', '教学反馈'],
    instructor: {
      name: '陈老师',
      avatar: '陈'
    }
  },
  {
    id: 'ws_005',
    title: '项目式学习设计工作坊',
    description: '掌握PBL(Project-Based Learning)的设计方法，培养学生的综合能力和创新思维',
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop',
    progress: 100,
    participants: 112,
    startTime: '2024-11-01',
    endTime: '2024-11-30',
    status: 'completed',
    tags: ['PBL', '项目式学习', '创新思维'],
    instructor: {
      name: '刘教授',
      avatar: '刘'
    }
  },
]

export default function WorkshopPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'ongoing' | 'completed' | 'upcoming'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredWorkshops = workshops.filter(workshop => {
    const matchesFilter = activeFilter === 'all' || workshop.status === activeFilter
    const matchesSearch = searchQuery === '' ||
      workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: workshops.length,
    ongoing: workshops.filter(w => w.status === 'ongoing').length,
    completed: workshops.filter(w => w.status === 'completed').length,
    upcoming: workshops.filter(w => w.status === 'upcoming').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="gradient-text">教师工作坊</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            系统化的教师专业发展学习项目，提升跨学科教学能力
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">全部工作坊</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-bold text-accent-600 mb-1">{stats.ongoing}</div>
            <div className="text-sm text-gray-600">进行中</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-bold text-primary-600 mb-1">{stats.completed}</div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-bold text-gray-500 mb-1">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">即将开始</div>
          </div>
        </div>

        {/* 筛选和搜索栏 */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { key: 'all', label: '全部' },
              { key: 'ongoing', label: '进行中' },
              { key: 'completed', label: '已完成' },
              { key: 'upcoming', label: '即将开始' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  activeFilter === filter.key
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="w-full md:w-80">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索工作坊..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* 工作坊列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map((workshop, index) => (
            <Link
              key={workshop.id}
              href={`/workshop/${workshop.id}`}
              className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 block animate-fade-in-up border border-gray-100"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* 状态标签 */}
              <div className="absolute top-4 left-4 z-10">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                  workshop.status === 'ongoing'
                    ? 'bg-accent-500 text-white'
                    : workshop.status === 'completed'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {workshop.status === 'ongoing' ? '进行中' : workshop.status === 'completed' ? '已完成' : '即将开始'}
                </span>
              </div>

              {/* 封面图片 */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={workshop.coverImage}
                  alt={workshop.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* 讲师信息 */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-sm font-medium">
                    {workshop.instructor.avatar}
                  </div>
                  <span className="text-white text-sm font-medium">{workshop.instructor.name}</span>
                </div>
              </div>

              {/* 内容 */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                  {workshop.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {workshop.description}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {workshop.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 进度条 */}
                {workshop.status !== 'upcoming' && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">学习进度</span>
                      <span className="text-xs font-semibold text-primary-600">{workshop.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                        style={{ width: `${workshop.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 底部信息 */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{workshop.participants} 人参与</span>
                  </div>
                  <span>
                    {workshop.status === 'upcoming' ? `${workshop.startTime} 开始` : `截止 ${workshop.endTime}`}
                  </span>
                </div>

                {/* 操作按钮 */}
                <button
                  className={`w-full mt-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    workshop.status === 'upcoming'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg shadow-primary-500/30'
                  }`}
                  disabled={workshop.status === 'upcoming'}
                >
                  {workshop.status === 'ongoing' && '继续学习'}
                  {workshop.status === 'completed' && '查看详情'}
                  {workshop.status === 'upcoming' && '即将开始'}
                  {workshop.status !== 'upcoming' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>

              {/* 光效 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            </Link>
          ))}
        </div>

        {/* 空状态 */}
        {filteredWorkshops.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
            <div className="w-24 h-24 mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">未找到匹配的工作坊</h3>
            <p className="text-gray-500 mb-6">试试调整筛选条件或搜索关键词</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveFilter('all') }}
              className="px-6 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-all duration-200"
            >
              清除筛选
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
