'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { mockWorkshops, WORKSHOP_STATUS_META, type WorkshopMaterial } from '@/data/mockWorkshopData'

// ============ Icons ============
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const InstructorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const CourseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// 资料图标（按 source 类型）
function MaterialIcon({ source }: { source: WorkshopMaterial['source'] }) {
  const iconMap = {
    file: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    link: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    video: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    html: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    ai: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  }
  return iconMap[source]
}

// 格式化日期区间
function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const startStr = `${s.getFullYear()} 年 ${s.getMonth() + 1} 月 ${s.getDate()} 日`
  const endStr = `${e.getFullYear()} 年 ${e.getMonth() + 1} 月 ${e.getDate()} 日`
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth() && s.getDate() === e.getDate()) {
    return startStr
  }
  return `${startStr} — ${endStr}`
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// iframe 预览弹窗
function MaterialPreviewModal({ material, onClose }: { material: WorkshopMaterial; onClose: () => void }) {
  const url = material.source === 'file' ? material.fileUrl! :
              material.source === 'video' ? '' :
              material.externalUrl || material.fileUrl!

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="font-semibold text-gray-900 truncate">{material.title}</h3>
            {material.description && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{material.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {material.downloadable && material.fileUrl && (
              <a
                href={material.fileUrl}
                download={material.fileName}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-primary-600 transition-colors"
                title="下载"
              >
                <DownloadIcon />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              title="关闭 (ESC)"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 bg-gray-50">
          {material.source === 'video' && material.embedCode ? (
            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: material.embedCode }} />
          ) : url ? (
            <iframe src={url} className="w-full h-full border-0" title={material.title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              无法预览此资料
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 资料卡片
function MaterialCard({ material }: { material: WorkshopMaterial }) {
  const [showPreview, setShowPreview] = useState(false)

  const handleClick = () => {
    if (material.openMode === 'iframe') {
      setShowPreview(true)
    } else {
      const url = material.source === 'file' ? material.fileUrl : (material.externalUrl || material.fileUrl)
      if (url && url !== '#') {
        window.open(url, '_blank')
      }
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (material.fileUrl && material.fileUrl !== '#') {
      const link = document.createElement('a')
      link.href = material.fileUrl
      link.download = material.fileName || material.title
      link.click()
    }
  }

  return (
    <>
      <div
        onClick={handleClick}
        className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all cursor-pointer"
      >
        {/* 图标 */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
          <MaterialIcon source={material.source} />
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-primary-600 transition-colors">
            {material.title}
          </h4>
          {material.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{material.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
            {material.fileFormat && <span className="uppercase">{material.fileFormat}</span>}
            {material.fileSize && <span>· {formatFileSize(material.fileSize)}</span>}
            {material.openMode === 'iframe' && <span>· 站内预览</span>}
            {material.openMode === 'redirect' && <span>· 新标签打开</span>}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {material.downloadable && (
            <button
              onClick={handleDownload}
              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
              title="下载"
            >
              <DownloadIcon />
            </button>
          )}
          <div className="p-1.5 text-gray-400 group-hover:text-primary-600 transition-colors">
            <ExternalIcon />
          </div>
        </div>
      </div>

      {showPreview && (
        <MaterialPreviewModal material={material} onClose={() => setShowPreview(false)} />
      )}
    </>
  )
}

export default function WorkshopDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const workshop = useMemo(() => mockWorkshops.find(w => w.id === id), [id])

  if (!workshop) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">未找到该工作坊</h2>
        <button
          onClick={() => router.push('/workshop')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          返回列表
        </button>
      </div>
    )
  }

  const statusMeta = WORKSHOP_STATUS_META[workshop.status]

  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50/30 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回 */}
        <Link
          href="/workshop"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeftIcon /> 返回工作坊列表
        </Link>

        {/* 活动信息卡片 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {/* 封面/头部 */}
          <div className="relative h-48 bg-gradient-to-br from-primary-100 via-primary-50 to-gray-100">
            <div className="absolute top-5 left-5 z-10">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusMeta.bgColor} ${statusMeta.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  workshop.status === 'ongoing' ? 'bg-primary-500 animate-pulse' :
                  workshop.status === 'upcoming' ? 'bg-gray-400' :
                  workshop.status === 'cancelled' ? 'bg-red-500' :
                  'bg-blue-500'
                }`} />
                {statusMeta.label}
              </span>
            </div>
            {/* 取消提示 */}
            {workshop.status === 'cancelled' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/95 px-5 py-2 rounded-lg text-red-600 font-medium text-sm shadow-md">
                  该工作坊已被取消
                </div>
              </div>
            )}
          </div>

          {/* 详细信息 */}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{workshop.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-6">{workshop.description}</p>

            {/* 元信息网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* 讲师 */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white text-primary-600 flex items-center justify-center">
                  <InstructorIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">讲师</div>
                  <div className="font-medium text-gray-900">{workshop.instructor.name}</div>
                  {workshop.instructor.title && (
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{workshop.instructor.title}</div>
                  )}
                </div>
              </div>

              {/* 时间 */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white text-primary-600 flex items-center justify-center">
                  <CalendarIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">活动时间</div>
                  <div className="font-medium text-gray-900 text-sm">{formatDateRange(workshop.startDate, workshop.endDate)}</div>
                </div>
              </div>

              {/* 地点 */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl sm:col-span-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white text-primary-600 flex items-center justify-center">
                  <LocationIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">活动地点</div>
                  <div className="font-medium text-gray-900 text-sm">{workshop.location}</div>
                </div>
              </div>
            </div>

            {/* 标签 */}
            {workshop.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {workshop.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 讲师简介 */}
            {workshop.instructor.bio && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">讲师简介</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{workshop.instructor.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* 关联课程（如有） */}
        {workshop.linkedCourseId && (
          <Link
            href={`/course-center/preview/${workshop.linkedCourseId}`}
            className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all mb-6"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <CourseIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-amber-600 font-medium mb-0.5">关联课程</div>
              <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                查看本次工作坊配套的示范课程
              </div>
              <div className="text-xs text-gray-500 mt-0.5">来自课程中心，跳转查看完整课程</div>
            </div>
            <div className="text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        {/* 资料区 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">活动资料</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {workshop.materials.length > 0
                    ? `共 ${workshop.materials.length} 份资料，点击查看或下载`
                    : '暂无资料'}
                </p>
              </div>
            </div>
          </div>

          {workshop.materials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workshop.materials.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">
                {workshop.status === 'upcoming' ? '活动尚未开始，资料将在活动前后陆续上传' : '活动暂无资料'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
