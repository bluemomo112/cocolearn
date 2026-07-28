'use client'

import { useState, useMemo } from 'react'
import { mockResources, type Resource, type ResourceSection } from '@/data/mockResourceHubData'

// 板块图标（SVG，与项目其他页面风格一致）
const SectionIcons = {
  'master-class': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  'interactive-tool': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  'learning-resource': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
}

const CoverIcon = () => (
  <svg className="w-12 h-12 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const ChevronUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

// 板块顺序（用户要求：名师课堂 → 互动工具 → 学习资源）
const SECTION_ORDER: ResourceSection[] = ['master-class', 'interactive-tool', 'learning-resource']

const sectionConfig: Record<ResourceSection, { title: string; description: string }> = {
  'master-class': { title: '名师课堂', description: '精选名师授课视频与专题讲座' },
  'interactive-tool': { title: '互动工具', description: 'AI 助手、在线协作工具与教学应用' },
  'learning-resource': { title: '学习资源', description: '教学设计、案例、模板与参考资料' },
}

export default function ResourceHubPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<'recommended' | 'newest'>('recommended')
  const [expandedSections, setExpandedSections] = useState<Set<ResourceSection>>(new Set())
  const [iframeResource, setIframeResource] = useState<Resource | null>(null)

  const publishedResources = useMemo(
    () => mockResources.filter(r => r.status === 'published'),
    []
  )

  const filteredResources = useMemo(() => {
    let result = publishedResources

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      )
    }

    if (sortMode === 'newest') {
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else {
      result = [...result].sort((a, b) => b.sortWeight - a.sortWeight)
    }

    return result
  }, [publishedResources, searchQuery, sortMode])

  const resourcesBySection = useMemo(() => {
    return SECTION_ORDER.map(section => ({
      section,
      resources: filteredResources.filter(r => r.section === section)
    }))
  }, [filteredResources])

  const toggleSection = (section: ResourceSection) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const handleCardClick = (resource: Resource) => {
    if (resource.openMode === 'iframe') {
      setIframeResource(resource)
    } else {
      const url = resource.source === 'file' ? resource.fileUrl! : resource.externalUrl!
      window.open(url, '_blank')
    }
  }

  const handleDownload = (resource: Resource, e: React.MouseEvent) => {
    e.stopPropagation()
    const url = resource.source === 'file' ? resource.fileUrl! : resource.externalUrl!
    const link = document.createElement('a')
    link.href = url
    link.download = resource.fileName || resource.title
    link.click()
  }

  const hasSearchQuery = searchQuery.trim().length > 0

  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50/30 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">学习资源中心</h1>
          <p className="text-gray-500">聚合平台优质教学资源，助力跨学科教与学</p>
        </div>

        {/* 搜索 + 排序工具栏 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex items-center gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索资源标题或描述..."
              className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as 'recommended' | 'newest')}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 cursor-pointer"
          >
            <option value="recommended">推荐排序</option>
            <option value="newest">最新发布</option>
          </select>
        </div>

        {/* 搜索状态提示 */}
        {hasSearchQuery && (
          <div className="mb-6 text-sm text-gray-600">
            搜索 &quot;<span className="font-medium text-primary-600">{searchQuery}</span>&quot; 找到 {filteredResources.length} 条结果
            <button
              onClick={() => setSearchQuery('')}
              className="ml-3 text-primary-600 hover:text-primary-700 underline"
            >
              清除搜索
            </button>
          </div>
        )}

        {/* 板块列表 */}
        {resourcesBySection.map(({ section, resources }) => {
          const config = sectionConfig[section]
          const isExpanded = expandedSections.has(section) || hasSearchQuery
          const displayCount = isExpanded ? resources.length : 8
          const displayResources = resources.slice(0, displayCount)
          const hasMore = resources.length > 8 && !hasSearchQuery

          return (
            <section
              key={section}
              className="mb-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8"
            >
              {/* 板块标题栏 */}
              <div className="flex items-end justify-between mb-6 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    section === 'master-class' ? 'bg-primary-50 text-primary-600' :
                    section === 'interactive-tool' ? 'bg-amber-50 text-amber-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {SectionIcons[section]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{config.description}</p>
                  </div>
                </div>
                {hasMore && (
                  <button
                    onClick={() => toggleSection(section)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    {isExpanded ? (
                      <>收起 <ChevronUpIcon /></>
                    ) : (
                      <>查看更多 <ChevronRightIcon /></>
                    )}
                  </button>
                )}
              </div>

              {/* 空态 */}
              {resources.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-3">
                    {SectionIcons[section]}
                  </div>
                  <p className="text-gray-500">
                    {hasSearchQuery ? '该板块没有匹配的内容' : '内容筹备中'}
                  </p>
                </div>
              )}

              {/* 卡片网格 */}
              {resources.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayResources.map(resource => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      onClick={() => handleCardClick(resource)}
                      onDownload={(e) => handleDownload(resource, e)}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })}

        {/* 全局无结果 */}
        {filteredResources.length === 0 && hasSearchQuery && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <SearchIcon />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">没有找到相关内容</h3>
            <p className="text-gray-500 mb-6">试试其他关键词，或清除搜索浏览全部资源</p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              清除搜索
            </button>
          </div>
        )}
      </div>

      {/* iframe 弹窗 */}
      {iframeResource && (
        <IframeModal resource={iframeResource} onClose={() => setIframeResource(null)} />
      )}
    </div>
  )
}

// ===================================================================
// 资源卡片
// ===================================================================
function ResourceCard({
  resource,
  onClick,
  onDownload
}: {
  resource: Resource
  onClick: () => void
  onDownload: (e: React.MouseEvent) => void
}) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all cursor-pointer"
    >
      {/* 封面占位区 */}
      <div className="relative aspect-video bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center overflow-hidden">
        <CoverIcon />
        {resource.downloadable && (
          <button
            onClick={onDownload}
            className="absolute bottom-3 right-3 w-9 h-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center hover:bg-white shadow-md text-gray-700 hover:text-primary-600 transition-colors"
            title="下载"
          >
            <DownloadIcon />
          </button>
        )}
      </div>

      {/* 卡片内容：仅标题 + 简介 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-primary-600 transition-colors min-h-[3rem]">
          {resource.title}
        </h3>
        {resource.description && (
          <p className="text-sm text-gray-500 line-clamp-1">
            {resource.description}
          </p>
        )}
      </div>
    </div>
  )
}

// ===================================================================
// iframe 弹窗（编辑页风格：模拟浏览器窗口，简洁）
// ===================================================================
function IframeModal({
  resource,
  onClose
}: {
  resource: Resource
  onClose: () => void
}) {
  const url = resource.source === 'file' ? resource.fileUrl! :
              resource.source === 'video' ? '' :
              resource.externalUrl!
  const [loadError, setLoadError] = useState(false)

  const displayUrl =
    resource.source === 'file' && resource.fileUrl ? resource.fileUrl :
    resource.source === 'link' && resource.externalUrl ? resource.externalUrl :
    resource.source === 'video' && resource.embedCode ? '嵌入视频播放器' :
    resource.source === 'html' && (resource.fileUrl || resource.externalUrl) ? (resource.fileUrl || resource.externalUrl) :
    resource.source === 'ai' && resource.externalUrl ? resource.externalUrl :
    '未配置资源地址'

  const handleDownload = () => {
    if (!resource.downloadable) return
    const dlUrl = resource.source === 'file' ? resource.fileUrl! : resource.externalUrl!
    const link = document.createElement('a')
    link.href = dlUrl
    link.download = resource.fileName || resource.title
    link.click()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部：图标 + 标题 + 关闭 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{resource.title}</h3>
              {resource.description && (
                <p className="text-sm text-gray-500 truncate">{resource.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {resource.downloadable && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                title="下载资源"
              >
                <DownloadIcon />
                下载
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="关闭 (ESC)"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* 内容区：模拟浏览器窗口 */}
        <div className="flex-1 overflow-hidden bg-gray-100 flex flex-col">
          {/* 模拟浏览器地址栏 */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 flex-shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-gray-100 rounded px-3 py-1 text-sm text-gray-600 truncate">
              {displayUrl}
            </div>
          </div>

          {/* iframe 内容 */}
          <div className="flex-1 bg-white overflow-hidden">
            {!loadError ? (
              resource.source === 'video' ? (
                <div
                  className="w-full h-full overflow-auto"
                  dangerouslySetInnerHTML={{ __html: resource.embedCode || '' }}
                />
              ) : (
                <iframe
                  src={url}
                  className="w-full h-full border-0"
                  onError={() => setLoadError(true)}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  title={resource.title}
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">该内容无法内嵌显示</h3>
                  <p className="text-gray-500 mb-6">部分网站禁止在 iframe 中加载，你可以在新标签页打开。</p>
                  <button
                    onClick={() => window.open(url, '_blank')}
                    className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    在新标签页打开
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
