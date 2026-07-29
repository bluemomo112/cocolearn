'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import type {
  WorkshopMaterial,
  WorkshopPhoto,
  WorkshopVideo,
  TeacherSubmission,
} from '@/data/mockWorkshopData'
import { CloseIcon, DownloadIcon } from './detailHelpers'

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
          <video src={video.fileUrl} controls autoPlay className="w-full h-full">
            <track kind="captions" />
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/60">
            视频源不可用
          </div>
        )}
      </div>
    </div>
  )
}

// ============ 教师提交作品预览 ============
export function SubmissionPreview({ submission, onClose }: { submission: TeacherSubmission; onClose: () => void }) {
  const s = submission
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
            <h3 className="font-semibold text-gray-900 truncate">{s.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              提交人：{s.teacherName}
              {s.teacherSchool && ` · ${s.teacherSchool}`}
              {s.teacherSubject && ` · ${s.teacherSubject}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors ml-2">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {s.description && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{s.description}</p>
          )}

          {/* 课程类：跳转卡片 */}
          {s.type === 'course' && s.courseId && (
            <Link
              href={`/course-center/preview/${s.courseId}`}
              className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all group"
            >
              <div className="w-20 h-20 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-primary-600 mb-1">课程作品</div>
                <div className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                  {s.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  {s.courseSubject && <span>{s.courseSubject}</span>}
                  {s.courseGrade && <span>· {s.courseGrade}</span>}
                </div>
                <div className="text-xs text-primary-600 mt-2">点击进入课程 →</div>
              </div>
            </Link>
          )}

          {/* 文件类 */}
          {s.type === 'file' && s.fileUrl && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium mb-1">{s.fileName || s.title}</p>
              {s.fileFormat && <p className="text-xs text-gray-500">{s.fileFormat.toUpperCase()}</p>}
              <a
                href={s.fileUrl}
                download={s.fileName || s.title}
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                <DownloadIcon /> 下载文件
              </a>
            </div>
          )}

          {/* 图片类 */}
          {s.type === 'image' && s.imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={s.imageUrl} alt={s.title} className="w-full rounded-lg" />
          )}

          {/* 心得类：Markdown 渲染 */}
          {s.type === 'text' && s.content && (
            <div className="prose prose-sm max-w-none text-gray-700 prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-li:my-1">
              <ReactMarkdown>{s.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

