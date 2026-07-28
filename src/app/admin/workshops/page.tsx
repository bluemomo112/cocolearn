'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { mockWorkshops, WORKSHOP_STATUS_META, type Workshop, type WorkshopStatus } from '@/data/mockWorkshopData'

// ============ Icons ============
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

// 格式化日期区间
function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const startStr = `${(s.getMonth() + 1).toString().padStart(2, '0')}.${s.getDate().toString().padStart(2, '0')}`
  const endStr = `${(e.getMonth() + 1).toString().padStart(2, '0')}.${e.getDate().toString().padStart(2, '0')}`
  return `${s.getFullYear()} ${startStr} – ${endStr}`
}

export default function AdminWorkshopsPage() {
  const [localWorkshops, setLocalWorkshops] = useState<Workshop[]>([...mockWorkshops])
  const [statusFilter, setStatusFilter] = useState<'all' | WorkshopStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    let result = localWorkshops
    if (statusFilter !== 'all') {
      result = result.filter(w => w.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(w =>
        w.title.toLowerCase().includes(q) ||
        w.instructors.some(ins => ins.name.toLowerCase().includes(q)) ||
        w.description.toLowerCase().includes(q)
      )
    }
    // 排序：进行中 > 未开始 > 已结束 > 已取消，同状态按开始时间倒序
    const order: Record<WorkshopStatus, number> = { ongoing: 0, upcoming: 1, completed: 2, cancelled: 3 }
    return [...result].sort((a, b) => {
      const diff = order[a.status] - order[b.status]
      if (diff !== 0) return diff
      return b.startDate.localeCompare(a.startDate)
    })
  }, [localWorkshops, statusFilter, searchQuery])

  const stats = useMemo(() => ({
    all: localWorkshops.length,
    upcoming: localWorkshops.filter(w => w.status === 'upcoming').length,
    ongoing: localWorkshops.filter(w => w.status === 'ongoing').length,
    completed: localWorkshops.filter(w => w.status === 'completed').length,
    cancelled: localWorkshops.filter(w => w.status === 'cancelled').length,
  }), [localWorkshops])

  const handleCancel = (id: string) => {
    if (confirm('取消后教师端会显示"已取消"标签，此操作不可撤销。确定要取消该工作坊吗？')) {
      setLocalWorkshops(prev => prev.map(w =>
        w.id === id ? { ...w, status: 'cancelled', isCancelled: true, updatedAt: new Date().toISOString() } : w
      ))
    }
  }

  const handleRestore = (id: string) => {
    // 恢复取消状态（重新按时间计算）
    setLocalWorkshops(prev => prev.map(w => {
      if (w.id !== id) return w
      const today = new Date().toISOString().split('T')[0]
      const newStatus: WorkshopStatus = today < w.startDate ? 'upcoming' : today > w.endDate ? 'completed' : 'ongoing'
      return { ...w, status: newStatus, isCancelled: false, updatedAt: new Date().toISOString() }
    }))
  }

  const handleDelete = (id: string) => {
    if (confirm('删除后不可恢复，工作坊及其资料关联将全部清除。确定要删除吗？')) {
      setLocalWorkshops(prev => prev.filter(w => w.id !== id))
    }
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 页面头 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link href="/admin" className="hover:text-gray-700">管理中心</Link>
              <span>/</span>
              <span>工作坊管理</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">工作坊管理</h1>
            <p className="text-sm text-gray-500 mt-1">管理线下培训活动，配置活动信息与资料</p>
          </div>
          <Link
            href="/admin/workshops/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <PlusIcon /> 新建工作坊
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {([
            { key: 'all', label: '全部', count: stats.all, color: 'text-gray-700' },
            { key: 'ongoing', label: '进行中', count: stats.ongoing, color: 'text-primary-600' },
            { key: 'upcoming', label: '未开始', count: stats.upcoming, color: 'text-gray-600' },
            { key: 'completed', label: '已结束', count: stats.completed, color: 'text-blue-600' },
            { key: 'cancelled', label: '已取消', count: stats.cancelled, color: 'text-red-600' },
          ] as const).map(stat => (
            <button
              key={stat.key}
              onClick={() => setStatusFilter(stat.key)}
              className={`bg-white rounded-xl border p-4 text-left transition-all ${
                statusFilter === stat.key
                  ? 'border-primary-500 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* 搜索 */}
        <div className="mb-4">
          <div className="relative max-w-md">
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

        {/* 表格 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题 / 讲师</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">地点</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">资料数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(workshop => {
                  const statusMeta = WORKSHOP_STATUS_META[workshop.status]
                  return (
                    <tr key={workshop.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 line-clamp-1">{workshop.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <span>讲师：{workshop.instructors.map(i => i.name).join('、')}</span>
                          {workshop.tags.length > 0 && (
                            <>
                              <span>·</span>
                              <span className="line-clamp-1">{workshop.tags.slice(0, 2).join(' / ')}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDateRange(workshop.startDate, workshop.endDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px]">
                        <div className="line-clamp-1">{workshop.location}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {workshop.materials?.length ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusMeta.bgColor} ${statusMeta.color}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/workshop/${workshop.id}`}
                            target="_blank"
                            className="text-xs text-gray-600 hover:text-primary-600 transition-colors"
                          >
                            预览
                          </Link>
                          <Link
                            href={`/admin/workshops/${workshop.id}/edit`}
                            className="text-xs text-primary-600 hover:text-primary-700 transition-colors font-medium"
                          >
                            编辑
                          </Link>
                          {workshop.status === 'cancelled' ? (
                            <button
                              onClick={() => handleRestore(workshop.id)}
                              className="text-xs text-green-600 hover:text-green-700 transition-colors font-medium"
                            >
                              恢复
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCancel(workshop.id)}
                              className="text-xs text-amber-600 hover:text-amber-700 transition-colors font-medium"
                            >
                              取消
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(workshop.id)}
                            className="text-xs text-red-600 hover:text-red-700 transition-colors font-medium"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm mb-3">
                {searchQuery ? '没有找到匹配的工作坊' : '暂无工作坊'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link
                  href="/admin/workshops/new"
                  className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <PlusIcon /> 新建第一个工作坊
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
