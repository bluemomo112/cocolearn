'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { mockResources, type Resource, type ResourceSection, type ResourceStatus } from '@/data/mockResourceHubData'

export default function AdminResourcesPage() {
  const [localResources, setLocalResources] = useState<Resource[]>([...mockResources])
  const [activeTab, setActiveTab] = useState<ResourceSection>('master-class')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ResourceStatus>('all')
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const sectionConfig: Record<ResourceSection, { label: string; icon: React.ReactNode }> = {
    'master-class': {
      label: '名师课堂',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    'interactive-tool': {
      label: '互动工具',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    'learning-resource': {
      label: '学习资源',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  }

  // 当前板块的资源
  const filteredResources = useMemo(() => {
    let result = localResources.filter(r => r.section === activeTab)

    // 状态筛选
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter)
    }

    // 搜索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      )
    }

    // 排序
    return result.sort((a, b) => b.sortWeight - a.sortWeight || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [activeTab, statusFilter, searchQuery])

  const hasFilters = searchQuery.trim() || statusFilter !== 'all'

  const handleDelete = (id: string) => {
    if (confirm('资源和上传的文件都会被清除，无法恢复。确定要删除吗？')) {
      setLocalResources(prev => prev.filter(r => r.id !== id))
    }
  }

  const handlePublish = (id: string) => {
    setLocalResources(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'published' as ResourceStatus, updatedAt: new Date().toISOString() } : r
    ))
  }

  const handleUnpublish = (id: string) => {
    if (confirm('下线后教师端立即不再展示，确定要下线吗？')) {
      setLocalResources(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'draft' as ResourceStatus, updatedAt: new Date().toISOString() } : r
      ))
    }
  }

  const handleDuplicate = (id: string) => {
    const original = localResources.find(r => r.id === id)
    if (original) {
      const duplicate: Resource = {
        ...original,
        id: `${original.id}-copy-${Date.now()}`,
        title: `${original.title}（副本）`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setLocalResources(prev => [...prev, duplicate])
    }
  }

  const handleDragStart = (id: string) => {
    if (hasFilters) return
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId || hasFilters) return
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId || hasFilters) return

    const draggedIndex = filteredResources.findIndex(r => r.id === draggedId)
    const targetIndex = filteredResources.findIndex(r => r.id === targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return

    // 重新计算 sortWeight
    const reordered = [...filteredResources]
    const [removed] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, removed)

    // 更新 sortWeight（从高到低）
    setLocalResources(prev => 
      prev.map(r => {
        const newIndex = reordered.findIndex(rr => rr.id === r.id)
        return newIndex >= 0 ? { ...r, sortWeight: 1000 - newIndex * 10 } : r
      })
    )

    setDraggedId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">学习资源管理</h1>
            <Link
              href="/resource-hub"
              target="_blank"
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              预览前端
            </Link>
          </div>
        </div>
      </div>

      {/* 板块 Tab */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {(Object.keys(sectionConfig) as ResourceSection[]).map(section => (
              <button
                key={section}
                onClick={() => setActiveTab(section)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === section
                    ? 'text-primary-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {sectionConfig[section].icon}
                  {sectionConfig[section].label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* 搜索 */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索标题或描述..."
                className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              {/* 状态筛选 */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | ResourceStatus)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部状态</option>
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>

              {hasFilters && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 underline"
                >
                  清除筛选
                </button>
              )}
            </div>

            <Link
              href={`/admin/resources/new?section=${activeTab}`}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <span className="text-lg">+</span> 新建资源
            </Link>
          </div>
        </div>
      </div>

      {/* 列表 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {hasFilters && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            ⚠️ 当前列表被筛选，拖拽排序已禁用。清除筛选后可拖拽调整顺序。
          </div>
        )}

        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-500 mx-auto mb-4 flex items-center justify-center [&_svg]:w-8 [&_svg]:h-8">
              {sectionConfig[activeTab].icon}
            </div>
            <p className="text-gray-600">
              {hasFilters ? '没有匹配的资源' : '暂无资源，点击右上角新建第一条'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-4 py-3"></th>
                  <th className="w-20 px-4 py-3 text-left text-sm font-medium text-gray-700">封面</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">标题</th>
                  <th className="w-24 px-4 py-3 text-left text-sm font-medium text-gray-700">状态</th>
                  <th className="w-32 px-4 py-3 text-left text-sm font-medium text-gray-700">更新时间</th>
                  <th className="w-32 px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource, index) => (
                  <tr
                    key={resource.id}
                    draggable={!hasFilters}
                    onDragStart={() => handleDragStart(resource.id)}
                    onDragOver={(e) => handleDragOver(e, resource.id)}
                    onDrop={(e) => handleDrop(e, resource.id)}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      !hasFilters ? 'cursor-move' : ''
                    } ${draggedId === resource.id ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      {!hasFilters && (
                        <div className="text-gray-400 text-xl">⋮⋮</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-16 h-10 bg-gradient-to-br from-primary-50 to-gray-100 rounded flex items-center justify-center">
                        <span className="text-sm opacity-40">📄</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{resource.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded border bg-primary-50 text-primary-700 border-primary-200">
                          {sectionConfig[resource.section].icon}
                          {sectionConfig[resource.section].label}
                        </span>
                        {resource.description && (
                          <span className="text-xs text-gray-500 truncate max-w-xs">{resource.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        resource.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {resource.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(resource.updatedAt).toLocaleDateString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!hasFilters && index > 0 && (
                          <button
                            onClick={() => {
                              const reordered = [...filteredResources]
                              const [item] = reordered.splice(index, 1)
                              reordered.unshift(item)
                              setLocalResources(prev => {
                                const updated = prev.map(r => {
                                  const newIndex = reordered.findIndex(rr => rr.id === r.id)
                                  return newIndex >= 0 ? { ...r, sortWeight: 1000 - newIndex } : r
                                })
                                return updated
                              })
                            }}
                            className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                            title="置顶"
                          >
                            置顶
                          </button>
                        )}
                        <Link
                          href={`/admin/resources/${resource.id}/edit`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          编辑
                        </Link>
                        <Link
                          href={`/admin/resources/${resource.id}/preview`}
                          className="text-sm text-gray-600 hover:text-gray-700"
                        >
                          预览
                        </Link>
                        {resource.status === 'draft' ? (
                          <button
                            onClick={() => handlePublish(resource.id)}
                            className="text-sm text-green-600 hover:text-green-700"
                          >
                            发布
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpublish(resource.id)}
                            className="text-sm text-orange-600 hover:text-orange-700"
                          >
                            下线
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicate(resource.id)}
                          className="text-sm text-gray-600 hover:text-gray-700"
                        >
                          复制
                        </button>
                        <button
                          onClick={() => handleDelete(resource.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
