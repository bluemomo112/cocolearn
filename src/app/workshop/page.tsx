'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { mockWorkshops, WORKSHOP_STATUS_META, type WorkshopStatus } from '@/data/mockWorkshopData'

// ============ Icons ============
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const InstructorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

// 格式化日期区间
function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const startStr = `${s.getFullYear()}.${(s.getMonth() + 1).toString().padStart(2, '0')}.${s.getDate().toString().padStart(2, '0')}`
  const endStr = `${e.getFullYear()}.${(e.getMonth() + 1).toString().padStart(2, '0')}.${e.getDate().toString().padStart(2, '0')}`
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth() && s.getDate() === e.getDate()) {
    return startStr
  }
  return `${startStr} – ${endStr}`
}

export default function WorkshopPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | WorkshopStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredWorkshops = useMemo(() => {
    return mockWorkshops.filter(workshop => {
      const matchesFilter = activeFilter === 'all' || workshop.status === activeFilter
      const matchesSearch = searchQuery === '' ||
        workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workshop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workshop.instructors.some(ins => ins.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesFilter && matchesSearch
    }).sort((a, b) => {
      // 未开始 > 进行中 > 已结束 > 已取消
      const order: Record<WorkshopStatus, number> = { ongoing: 0, upcoming: 1, completed: 2, cancelled: 3 }
      const diff = order[a.status] - order[b.status]
      if (diff !== 0) return diff
      // 同状态按开始时间倒序
      return b.startDate.localeCompare(a.startDate)
    })
  }, [activeFilter, searchQuery])

  const stats = useMemo(() => ({
    all: mockWorkshops.length,
    upcoming: mockWorkshops.filter(w => w.status === 'upcoming').length,
    ongoing: mockWorkshops.filter(w => w.status === 'ongoing').length,
    completed: mockWorkshops.filter(w => w.status === 'completed').length,
  }), [])

  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50/30 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">教师工作坊</h1>
          <p className="text-gray-500">线下培训活动的线上入口，浏览资料与活动信息</p>
        </div>

        {/* 筛选 + 搜索 */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {([
              { key: 'all', label: '全部', count: stats.all },
              { key: 'ongoing', label: '进行中', count: stats.ongoing },
              { key: 'upcoming', label: '未开始', count: stats.upcoming },
              { key: 'completed', label: '已结束', count: stats.completed },
            ] as const).map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {filter.label}
                <span className={`ml-1.5 text-xs ${activeFilter === filter.key ? 'text-primary-100' : 'text-gray-400'}`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索标题、讲师或简介"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 工作坊列表 */}
        {filteredWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorkshops.map(workshop => {
              const statusMeta = WORKSHOP_STATUS_META[workshop.status]
              return (
                <Link
                  key={workshop.id}
                  href={`/workshop/${workshop.id}`}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  {/* 封面区（渐变占位或图片） */}
                  <div className="relative h-40 bg-gradient-to-br from-primary-50 to-gray-100 overflow-hidden">
                    {/* 状态标签 */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusMeta.bgColor} ${statusMeta.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          workshop.status === 'ongoing' ? 'bg-primary-500 animate-pulse' :
                          workshop.status === 'upcoming' ? 'bg-gray-400' :
                          workshop.status === 'cancelled' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* 讲师浮层：显示第一位 + 更多提示 */}
                    {workshop.instructors.length > 0 && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-white shadow flex items-center justify-center text-primary-600 font-medium text-sm">
                          {workshop.instructors[0].name.slice(0, 1)}
                        </div>
                        <span className="text-white text-xs font-medium drop-shadow-md bg-black/30 px-2 py-0.5 rounded">
                          {workshop.instructors[0].name}
                          {workshop.instructors.length > 1 && ` 等 ${workshop.instructors.length} 位`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 内容区 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {workshop.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed min-h-[2rem]">
                      {workshop.description}
                    </p>

                    {/* 时间/地点信息 */}
                    <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon />
                        <span>{formatDateRange(workshop.startDate, workshop.endDate)}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <div className="mt-0.5"><LocationIcon /></div>
                        <span className="line-clamp-1 flex-1">{workshop.location}</span>
                      </div>
                    </div>

                    {/* 标签 */}
                    {workshop.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {workshop.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[10px] rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 底部信息 */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                      <span className="text-gray-500">
                        {(workshop.materials?.length ?? 0)} 份资料
                      </span>
                      <span className="text-primary-600 font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                        查看详情 <ChevronRightIcon />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-3">
              <SearchIcon />
            </div>
            <p className="text-gray-500 mb-3">
              {searchQuery ? '没有找到匹配的工作坊' : '暂无工作坊'}
            </p>
            {(searchQuery || activeFilter !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setActiveFilter('all') }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                清除筛选
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
