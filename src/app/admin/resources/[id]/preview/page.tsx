'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { mockResources, type Resource, type ResourceSection } from '@/data/mockResourceHubData'

const SECTION_META: Record<ResourceSection, { title: string; badgeClass: string }> = {
  'master-class': { title: '名师课堂', badgeClass: 'bg-primary-50 text-primary-700 border-primary-200' },
  'interactive-tool': { title: '互动工具', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  'learning-resource': { title: '学习资源', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
}

const SOURCE_LABEL: Record<Resource['source'], string> = {
  file: '本地文件',
  link: '网页链接',
  video: '外部视频',
  html: '网页文件',
  ai: 'AI 应用',
}

// ============ Icons ============
const CoverIcon = () => (
  <svg className="w-14 h-14 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const ExternalIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function PreviewResourcePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [showIframe, setShowIframe] = useState(false)
  const [testLog, setTestLog] = useState<Array<{ type: 'info' | 'success' | 'warn'; message: string; time: string }>>([])

  useEffect(() => {
    const found = mockResources.find(r => r.id === id)
    setResource(found || null)
    setLoading(false)
  }, [id])

  const log = (type: 'info' | 'success' | 'warn', message: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    setTestLog(prev => [{ type, message, time }, ...prev.slice(0, 9)])
  }

  if (loading) {
    return <div className="p-8 text-gray-500">加载中...</div>
  }

  if (!resource) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">未找到该资源</h2>
        <button
          onClick={() => router.push('/admin/resources')}
          className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          返回列表
        </button>
      </div>
    )
  }

  const sectionInfo = SECTION_META[resource.section]

  const handleCardClick = () => {
    if (resource.openMode === 'iframe') {
      log('info', '触发：站内 iframe 弹窗打开')
      setShowIframe(true)
    } else {
      const url = resource.source === 'file' ? resource.fileUrl! : resource.externalUrl!
      log('success', `触发：新标签页打开 → ${url}`)
      window.open(url, '_blank')
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!resource.downloadable) return
    const url = resource.source === 'file' ? resource.fileUrl! : resource.externalUrl!
    log('success', `触发：下载 → ${resource.fileName || resource.title}`)
    const link = document.createElement('a')
    link.href = url
    link.download = resource.fileName || resource.title
    link.click()
  }

  const testOpenInNewTab = () => {
    if (resource.source === 'video') {
      log('warn', '嵌入代码资源无独立 URL，无法在新标签打开')
      return
    }
    const url = resource.source === 'file' ? resource.fileUrl! : resource.externalUrl!
    log('success', `新标签页测试 → ${url}`)
    window.open(url, '_blank')
  }

  const testIframe = () => {
    log('info', 'iframe 弹窗测试')
    setShowIframe(true)
  }

  const testDownload = () => {
    if (!resource.downloadable) {
      log('warn', '该资源未开启下载')
      return
    }
    if (resource.source === 'video') {
      log('warn', '嵌入代码资源不支持下载')
      return
    }
    const url = resource.source === 'file' ? resource.fileUrl! : resource.externalUrl!
    log('success', `下载测试 → ${resource.fileName || resource.title}`)
    const link = document.createElement('a')
    link.href = url
    link.download = resource.fileName || resource.title
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 预览模式条 */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <EyeIcon />
            <span className="font-medium">预览模式</span>
            <span className="text-amber-700">— 教师端展示效果 + 交互测试</span>
            {resource.status === 'draft' && (
              <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-xs">
                草稿（未发布）
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/resources/${id}/edit`}
              className="px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
            >
              返回编辑
            </Link>
            <Link
              href="/admin/resources"
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              返回列表
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6">
        {/* 左侧：卡片实际渲染 */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">卡片展示效果</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* 实际资源卡片 */}
            <div
              onClick={handleCardClick}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="relative aspect-video bg-gradient-to-br from-primary-50 to-gray-50 flex items-center justify-center">
                <CoverIcon />
                {resource.downloadable && (
                  <button
                    onClick={handleDownload}
                    className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center bg-white/95 rounded-full shadow-sm hover:bg-white hover:text-primary-600 text-gray-700 transition-colors z-10"
                    title="下载"
                  >
                    <DownloadIcon />
                  </button>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${sectionInfo.badgeClass}`}>
                    {sectionInfo.title}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-700 transition-colors">
                  {resource.title}
                </h3>
                {resource.description && (
                  <p className="text-sm text-gray-500 line-clamp-1">{resource.description}</p>
                )}
              </div>
            </div>

            {/* 占位卡片 */}
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 aspect-[3/4] flex items-center justify-center">
                <span className="text-xs text-gray-300">其他资源</span>
              </div>
            ))}
          </div>

          {/* 资源信息 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">资源信息</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-gray-500 mb-0.5">板块</dt>
                <dd className="text-gray-900">{sectionInfo.title}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-0.5">状态</dt>
                <dd className={resource.status === 'published' ? 'text-primary-600' : 'text-gray-600'}>
                  {resource.status === 'published' ? '已发布' : '草稿'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-0.5">来源类型</dt>
                <dd className="text-gray-900">{SOURCE_LABEL[resource.source]}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-0.5">打开方式</dt>
                <dd className="text-gray-900">
                  {resource.openMode === 'iframe' ? '站内 iframe 弹窗' : '新标签页跳转'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-0.5">下载</dt>
                <dd className="text-gray-900">{resource.downloadable ? '开启' : '关闭'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-0.5">最后更新</dt>
                <dd className="text-gray-900">{new Date(resource.updatedAt).toLocaleString('zh-CN')}</dd>
              </div>
              {resource.source === 'file' && resource.fileName && (
                <div className="col-span-2">
                  <dt className="text-gray-500 mb-0.5">文件</dt>
                  <dd className="text-gray-900 truncate">{resource.fileName}</dd>
                </div>
              )}
              {(resource.source === 'link' || resource.source === 'html') && resource.externalUrl && (
                <div className="col-span-2">
                  <dt className="text-gray-500 mb-0.5">链接</dt>
                  <dd className="text-primary-600 truncate">{resource.externalUrl}</dd>
                </div>
              )}
              {resource.source === 'video' && resource.embedCode && (
                <div className="col-span-2">
                  <dt className="text-gray-500 mb-0.5">嵌入代码（预览）</dt>
                  <dd>
                    <code className="block text-xs text-gray-700 bg-gray-50 p-2 rounded-lg font-mono truncate">
                      {resource.embedCode.slice(0, 200)}{resource.embedCode.length > 200 ? '...' : ''}
                    </code>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* 右侧：交互测试面板 */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-4">
            <h3 className="text-base font-semibold text-gray-900 mb-1">交互测试</h3>
            <p className="text-xs text-gray-500 mb-4">在这里测试各种打开方式，验证配置是否符合预期</p>

            <div className="space-y-2.5">
              <button
                onClick={testOpenInNewTab}
                disabled={resource.source === 'video'}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-primary-400 hover:bg-primary-50/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-colors"
              >
                <ExternalIcon />
                <span>在新标签页打开</span>
              </button>
              <button
                onClick={testIframe}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-primary-400 hover:bg-primary-50/40 transition-colors"
              >
                <EyeIcon />
                <span>站内 iframe 弹窗</span>
              </button>
              <button
                onClick={testDownload}
                disabled={!resource.downloadable || resource.source === 'video'}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-primary-400 hover:bg-primary-50/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-colors"
              >
                <DownloadIcon />
                <span>下载资源</span>
                {!resource.downloadable && (
                  <span className="ml-auto text-xs text-gray-400">未开启</span>
                )}
              </button>
            </div>

            {/* 测试日志 */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">测试日志</span>
                {testLog.length > 0 && (
                  <button
                    onClick={() => setTestLog([])}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    清空
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {testLog.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">点击上方按钮开始测试</p>
                ) : (
                  testLog.map((entry, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-gray-400 shrink-0 font-mono">{entry.time}</span>
                      <span className={
                        entry.type === 'success' ? 'text-primary-600' :
                        entry.type === 'warn' ? 'text-amber-600' :
                        'text-gray-700'
                      }>
                        {entry.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* iframe 弹窗 */}
      {showIframe && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowIframe(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowIframe(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{resource.title}</h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">iframe 弹窗预览</p>
              </div>
              <button
                onClick={() => setShowIframe(false)}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="关闭 (ESC)"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 bg-gray-50">
              {resource.source === 'video' ? (
                <div
                  className="w-full h-full overflow-auto"
                  dangerouslySetInnerHTML={{ __html: resource.embedCode || '' }}
                />
              ) : (
                <iframe
                  src={resource.source === 'file' ? resource.fileUrl! : resource.externalUrl!}
                  className="w-full h-full border-0"
                  title={resource.title}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
