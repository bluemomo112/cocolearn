'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 工作坊数据类型
interface Workshop {
  id: string
  title: string
  description: string
  coverImage?: string
  progress: number
  uncompletedTasks: number
  startTime: string
  endTime: string
  status: 'ongoing' | 'completed' | 'upcoming'
  isNew?: boolean
  deadlineSoon?: boolean
}

// 模拟数据
const mockWorkshops: Workshop[] = [
  {
    id: 'ws_001',
    title: '跨学科教学设计工作坊',
    description: '通过系统化的学习，掌握跨学科课程设计的核心方法，运用C-POTE模型创建优质教案',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
    progress: 60,
    uncompletedTasks: 3,
    startTime: '2025-01-15',
    endTime: '2025-12-05',
    status: 'ongoing',
    deadlineSoon: true
  },
  {
    id: 'ws_002',
    title: '课堂提问技巧工作坊',
    description: '学习布鲁姆认知目标层级，设计促进深度思考的提问策略，提升课堂互动质量',
    coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop',
    progress: 100,
    uncompletedTasks: 0,
    startTime: '2024-12-20',
    endTime: '2025-01-10',
    status: 'completed'
  },
  {
    id: 'ws_003',
    title: 'AI辅助教学实践工作坊',
    description: '探索人工智能与学科教学的深度融合，打造智慧课堂，提升教学效率和学习体验',
    coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=400&fit=crop',
    progress: 0,
    uncompletedTasks: 8,
    startTime: '2025-12-10',
    endTime: '2026-01-20',
    status: 'upcoming'
  },
  {
    id: 'ws_004',
    title: '形成性评价策略工作坊',
    description: '掌握多样化的形成性评价方法，及时了解学生学习进展，调整教学策略',
    coverImage: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&h=400&fit=crop',
    progress: 35,
    uncompletedTasks: 5,
    startTime: '2024-12-05',
    endTime: '2025-12-15',
    status: 'ongoing',
    isNew: true
  },
  {
    id: 'ws_005',
    title: '差异化教学实践工作坊',
    description: '学习如何根据学生不同的学习需求和特点，实施差异化教学，让每个学生都能获得成长',
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop',
    progress: 80,
    uncompletedTasks: 2,
    startTime: '2025-01-10',
    endTime: '2025-12-10',
    status: 'ongoing'
  },
  {
    id: 'ws_006',
    title: '项目式学习设计工作坊',
    description: '掌握PBL(Project-Based Learning)的设计方法，培养学生的综合能力和创新思维',
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop',
    progress: 100,
    uncompletedTasks: 0,
    startTime: '2024-11-15',
    endTime: '2024-12-30',
    status: 'completed'
  }
]

export default function CourseCenter() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'ongoing' | 'completed' | 'upcoming'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 加载数据
  useEffect(() => {
    setTimeout(() => {
      setWorkshops(mockWorkshops)
      setFilteredWorkshops(mockWorkshops)
      setLoading(false)
    }, 500)
  }, [])

  // 筛选逻辑
  useEffect(() => {
    let filtered = workshops

    if (activeFilter !== 'all') {
      filtered = filtered.filter(w => w.status === activeFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(w =>
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    filtered.sort((a, b) => {
      if (a.uncompletedTasks !== b.uncompletedTasks) {
        return b.uncompletedTasks - a.uncompletedTasks
      }
      if (a.endTime !== b.endTime) {
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
      }
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    })

    setFilteredWorkshops(filtered)
  }, [activeFilter, searchQuery, workshops])

  const formatTimeInfo = (workshop: Workshop) => {
    const now = new Date()
    const endDate = new Date(workshop.endTime)
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (workshop.status === 'completed') {
      return { icon: '✅', text: `完成于: ${workshop.endTime}`, color: 'text-emerald-600' }
    } else if (workshop.status === 'upcoming') {
      return { icon: '🕐', text: `开始于: ${workshop.startTime}`, color: 'text-gray-600' }
    } else {
      if (diffDays <= 3) {
        return { icon: '⏰', text: `截止: ${diffDays}天后`, color: 'text-red-600' }
      }
      return { icon: '⏰', text: `截止: ${workshop.endTime}`, color: 'text-gray-600' }
    }
  }

  const stats = {
    ongoing: workshops.filter(w => w.status === 'ongoing').length,
    completed: workshops.filter(w => w.status === 'completed').length,
    upcoming: workshops.filter(w => w.status === 'upcoming').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Hero 区域 */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="gradient-text">我的工作坊</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            继续您的专业发展之旅，提升跨学科教学能力
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-bold text-emerald-600 mb-1">{stats.ongoing}</div>
            <div className="text-sm text-gray-600">进行中</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-bold text-teal-600 mb-1">{stats.completed}</div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-bold text-gray-500 mb-1">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">即将开始</div>
          </div>
        </div>

        {/* 讨论社区入口 */}
        <Link
          href="/community"
          className="block mb-8 group relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-6 md:p-8 border-2 border-emerald-200/50 hover:border-emerald-300 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          {/* 背景装饰 */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  💬
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold gradient-text">
                    讨论社区
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mt-0.5">Community Center</p>
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                探索同伴的学习动态，分享你的实践经验，在互动中深化学习
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs md:text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <span>📝</span>
                  <span>作业分享</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>📅</span>
                  <span>打卡记录</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>❓</span>
                  <span>问答互助</span>
                </span>
              </div>
            </div>

            <div className="ml-4 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-white/80 backdrop-blur-sm rounded-full shadow-md group-hover:shadow-xl group-hover:bg-gradient-to-br group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-emerald-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* 光效动画 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        </Link>

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
                onClick={() => setActiveFilter(filter.key as 'all' | 'ongoing' | 'completed' | 'upcoming')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  activeFilter === filter.key
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
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
                placeholder="搜索工作坊名称或关键词..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* 工作坊列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-gray-500">加载中...</p>
            </div>
          </div>
        ) : filteredWorkshops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
            <div className="w-24 h-24 mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">未找到匹配的工作坊</h3>
            <p className="text-gray-500 mb-6">试试调整筛选条件或搜索关键词</p>
            {(searchQuery || activeFilter !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setActiveFilter('all') }}
                className="px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-all duration-200"
              >
                清除筛选
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop, index) => {
              const timeInfo = formatTimeInfo(workshop)
              return (
                <Link
                  key={workshop.id}
                  href={`/workshop/${workshop.id}`}
                  className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 block animate-fade-in-up border border-gray-100"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* 标签 */}
                  {(workshop.isNew || workshop.deadlineSoon) && (
                    <div className="absolute top-4 left-4 z-10">
                      {workshop.isNew && (
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          🔥 NEW
                        </div>
                      )}
                      {workshop.deadlineSoon && !workshop.isNew && (
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          ⚠️ 即将截止
                        </div>
                      )}
                    </div>
                  )}

                  {/* 封面 */}
                  <div className="relative h-40 overflow-hidden">
                    {workshop.coverImage ? (
                      <Image
                        src={workshop.coverImage}
                        alt={workshop.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <h3 className="absolute bottom-4 left-4 right-4 text-lg font-bold text-white line-clamp-2 leading-tight">
                      {workshop.title}
                    </h3>
                  </div>

                  {/* 内容 */}
                  <div className="p-5">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{workshop.description}</p>

                    {/* 进度条 */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">学习进度</span>
                        <span className="text-xs font-semibold text-emerald-600">{workshop.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${workshop.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 任务状态 */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        {workshop.uncompletedTasks > 0 ? (
                          <>
                            <span>📌 未完成任务:</span>
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white rounded-full text-xs font-bold">
                              {workshop.uncompletedTasks}
                            </span>
                            <span>个</span>
                          </>
                        ) : (
                          <span className="text-emerald-600 font-medium">✅ 已完成所有任务</span>
                        )}
                      </div>
                    </div>

                    {/* 时间信息 */}
                    <div className={`flex items-center gap-1.5 text-sm mb-4 ${timeInfo.color}`}>
                      <span>{timeInfo.icon}</span>
                      <span>{timeInfo.text}</span>
                    </div>

                    {/* 按钮 */}
                    <button
                      className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        workshop.status === 'upcoming'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg shadow-emerald-500/30'
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
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
