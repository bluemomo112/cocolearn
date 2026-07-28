'use client'

import type {
  WorkshopMaterial,
  WorkshopPhoto,
  WorkshopVideo,
  WorkshopParticipantOutcome,
} from '@/data/mockWorkshopData'
import { CloseIcon, DownloadIcon, formatFileSize } from './detailHelpers'

// ============ 资料预览（模拟浏览器窗口） ============
export function MaterialPreview({ material, onClose }: { material: WorkshopMaterial; onClose: () => void }) {
  const url =
    material.source === 'file' ? material.fileUrl! :
    material.source === 'video' ? '' :
    material.externalUrl || material.fileUrl!

  const displayUrl =
    material.source === 'file' && material.fileUrl ? material.fileUrl :
    material.source === 'video' && material.embedCode ? '嵌入视频播放器' :
    material.externalUrl || material.fileUrl || '未配置资源地址'

  const handleDownload = () => {
    if (!material.downloadable) return
    const dlUrl = material.fileUrl || material.externalUrl || ''
    const link = document.createElement('a')
    link.href = dlUrl
    link.download = material.fileName || material.title
    link.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{material.title}</h3>
              {material.description && (
                <p className="text-sm text-gray-500 truncate">{material.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {material.downloadable && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <DownloadIcon /> 下载
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* 模拟浏览器 */}
        <div className="flex-1 overflow-hidden bg-gray-100 flex flex-col">
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
          <div className="flex-1 bg-white overflow-hidden">
            {material.source === 'video' ? (
              <div
                className="w-full h-full overflow-auto"
                dangerouslySetInnerHTML={{ __html: material.embedCode || '' }}
              />
            ) : (
              <iframe
                src={url}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title={material.title}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ 图片预览（Lightbox） ============
export function PhotoPreview({ photo, onClose }: { photo: WorkshopPhoto; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
      >
        <CloseIcon />
      </button>
      <div className="max-w-6xl w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={photo.caption || ''} className="max-h-[85vh] max-w-full object-contain rounded-lg" />
        {photo.caption && <p className="text-white/80 mt-4 text-sm text-center">{photo.caption}</p>}
      </div>
    </div>
  )
}

// ============ 视频预览 ============
export function VideoPreview({ video, onClose }: { video: WorkshopVideo; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
      >
        <CloseIcon />
      </button>
      <div
        className="bg-black rounded-2xl w-full max-w-5xl aspect-video overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {video.embedCode ? (
          <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: video.embedCode }} />
        ) : video.fileUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={video.fileUrl} controls autoPlay className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/60">
            视频源不可用
          </div>
        )}
      </div>
    </div>
  )
}

// ============ 参会老师成果预览 ============
export function OutcomePreview({ outcome, onClose }: { outcome: WorkshopParticipantOutcome; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{outcome.title}</h3>
            {outcome.description && (
              <p className="text-sm text-gray-500 truncate mt-0.5">{outcome.description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors ml-2">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {outcome.type === 'text' && outcome.content && (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
              {outcome.content}
            </div>
          )}
          {outcome.type === 'image' && outcome.fileUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={outcome.fileUrl} alt={outcome.title} className="w-full rounded-lg" />
          )}
          {outcome.type === 'file' && outcome.fileUrl && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium mb-1">{outcome.fileName || outcome.title}</p>
              <a
                href={outcome.fileUrl}
                download={outcome.fileName || outcome.title}
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                <DownloadIcon /> 下载文件
              </a>
            </div>
          )}
          {outcome.type === 'link' && outcome.externalUrl && (
            <div className="text-center py-8">
              <p className="text-gray-700 mb-4 break-all">{outcome.externalUrl}</p>
              <a
                href={outcome.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                在新标签打开
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ Outcome 类型元信息 ============
export const OUTCOME_TYPE_META: Record<WorkshopParticipantOutcome['type'], { label: string; icon: React.ReactNode }> = {
  file: {
    label: '文件',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  image: {
    label: '图片',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  link: {
    label: '链接',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  text: {
    label: '心得',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
}


