'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import type {
  WorkshopInstructor,
  WorkshopLinkedCourse,
  WorkshopMaterial,
  WorkshopPhoto,
  WorkshopVideo,
  TeacherSubmission,
} from '@/data/mockWorkshopData'
import { AvatarBubble, SectionBlock, formatFileSize } from './detailHelpers'

// ============ 讲师团队 ============
// flex-wrap 自适应；单个讲师是完整卡片，多个自然换行
export function InstructorsSection({ instructors }: { instructors: WorkshopInstructor[] }) {
  return (
    <SectionBlock
      title={instructors.length === 1 ? '主讲人' : '讲师团队'}
      subtitle={instructors.length > 1 ? `共 ${instructors.length} 位` : undefined}
    >
      <div className="flex flex-wrap gap-3">
        {instructors.map((ins) => (
          <div
            key={ins.id}
            className="flex-1 min-w-[260px] flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
          >
            <AvatarBubble name={ins.name} avatar={ins.avatar} size={48} />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900">{ins.name}</div>
              {ins.title && <div className="text-xs text-primary-600 mt-0.5">{ins.title}</div>}
              {ins.bio && <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-3">{ins.bio}</p>}
            </div>
          </div>
        ))}
      </div>
    </SectionBlock>
  )
}

// ============ 活动规划（Markdown 渲染）============
export function AgendaSection({ agenda }: { agenda: string }) {
  return (
    <SectionBlock title="活动规划" subtitle="日程与安排">
      <div className="prose prose-sm max-w-none text-gray-700 prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-li:my-1">
        <ReactMarkdown>{agenda}</ReactMarkdown>
      </div>
    </SectionBlock>
  )
}

// ============ 关联课程 ============
export function LinkedCoursesSection({ courses }: { courses: WorkshopLinkedCourse[] }) {
  return (
    <SectionBlock title="关联课程" subtitle="本次工作坊涉及或作为示范的课程">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {courses.map((c) => (
          <Link
            key={c.id}
            href={`/course-center/preview/${c.id}`}
            className="group flex gap-3 p-4 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all"
          >
            <div className="w-14 h-14 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                {c.title}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                {c.subject && <span>{c.subject}</span>}
                {c.grade && <span>· {c.grade}</span>}
              </div>
              {c.description && (
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{c.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </SectionBlock>
  )
}

// ============ 培训资料 ============
const SOURCE_LABELS = { file: '本地文件', link: '网页链接', video: '视频', html: '网页文件', ai: 'AI 应用' } as const

export function MaterialsSection({
  materials,
  onPreview,
}: {
  materials: WorkshopMaterial[]
  onPreview: (m: WorkshopMaterial) => void
}) {
  return (
    <SectionBlock title="培训资料" subtitle="讲义、模板、参考文档等">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {materials.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onPreview(m)}
            className="group flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-white hover:shadow-sm transition-all text-left"
          >
            <div className="w-11 h-11 rounded-lg bg-white text-primary-600 flex items-center justify-center flex-shrink-0 border border-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 text-sm truncate group-hover:text-primary-600 transition-colors">
                {m.title}
              </div>
              {m.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>{SOURCE_LABELS[m.source]}</span>
                {m.fileFormat && <span>· {m.fileFormat.toUpperCase()}</span>}
                {m.fileSize && <span>· {formatFileSize(m.fileSize)}</span>}
                {m.downloadable && <span className="text-primary-600">· 可下载</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </SectionBlock>
  )
}

// ============ 活动相册 ============
export function PhotosSection({
  photos,
  onPreview,
}: {
  photos: WorkshopPhoto[]
  onPreview: (p: WorkshopPhoto) => void
}) {
  return (
    <SectionBlock title="活动相册" subtitle={`${photos.length} 张照片，点击查看大图`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPreview(p)}
            className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow bg-gray-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.caption || ''}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {p.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs text-white line-clamp-2">{p.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </SectionBlock>
  )
}

// ============ 活动视频 ============
export function VideosSection({
  videos,
  onPreview,
}: {
  videos: WorkshopVideo[]
  onPreview: (v: WorkshopVideo) => void
}) {
  return (
    <SectionBlock title="活动视频" subtitle="现场录像、精彩片段回放">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onPreview(v)}
            className="group relative aspect-video rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow bg-gray-900"
          >
            {v.coverImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={v.coverImage} alt={v.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
                <svg className="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <div className="text-sm font-medium text-white line-clamp-2 text-left">{v.title}</div>
              {v.duration && <div className="text-xs text-white/70 mt-1">{v.duration}</div>}
            </div>
          </button>
        ))}
      </div>
    </SectionBlock>
  )
}

// ============ 教师作品区（教师本人提交）============
const SUBMISSION_TYPE_META: Record<TeacherSubmission['type'], { label: string; color: string }> = {
  course: { label: '课程', color: 'text-primary-600 bg-primary-50' },
  file:   { label: '文件', color: 'text-blue-600 bg-blue-50' },
  image:  { label: '图片', color: 'text-pink-600 bg-pink-50' },
  text:   { label: '心得', color: 'text-amber-600 bg-amber-50' },
}

function formatSubmittedAt(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function SubmissionsSection({
  submissions,
  onPreview,
  currentTeacherId,
  onOpenSubmit,
}: {
  submissions: TeacherSubmission[]
  onPreview: (s: TeacherSubmission) => void
  currentTeacherId: string
  onOpenSubmit: () => void
}) {
  // 按老师聚合
  const grouped = submissions.reduce<Record<string, TeacherSubmission[]>>((acc, s) => {
    (acc[s.teacherId] = acc[s.teacherId] || []).push(s)
    return acc
  }, {})
  const teacherIds = Object.keys(grouped)

  return (
    <SectionBlock
      title="参会老师作品"
      subtitle={`${teacherIds.length} 位老师，共 ${submissions.length} 份作品`}
    >
      {/* 提交入口 */}
      <div className="flex items-center justify-between mb-4 p-3 bg-primary-50 border border-primary-100 rounded-xl">
        <div className="flex items-center gap-2 text-sm text-primary-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>参加了这次工作坊？分享你的作品或心得</span>
        </div>
        <button
          type="button"
          onClick={onOpenSubmit}
          className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
        >
          提交我的作品
        </button>
      </div>

      {teacherIds.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          还没有老师提交作品，快来抢占第一位吧
        </div>
      ) : (
        <div className="space-y-5">
          {teacherIds.map((teacherId) => {
            const items = grouped[teacherId]
            const first = items[0]
            const isMe = teacherId === currentTeacherId
            return (
              <div key={teacherId} className="border-l-2 border-primary-200 pl-4">
                {/* 老师身份行 */}
                <div className="flex items-center gap-3 mb-3">
                  <AvatarBubble name={first.teacherName} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {first.teacherName}
                      {isMe && <span className="text-xs px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded">我</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {[first.teacherSchool, first.teacherSubject].filter(Boolean).join(' · ') || '—'}
                      {' · '}
                      {items.length} 份作品
                    </div>
                  </div>
                </div>

                {/* 作品卡片 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-11">
                  {items.map((s) => {
                    const meta = SUBMISSION_TYPE_META[s.type]
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onPreview(s)}
                        className="group flex items-start gap-2.5 p-3 bg-gray-50 hover:bg-white rounded-lg border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all text-left"
                      >
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 mt-0.5 ${meta.color}`}>
                          {meta.label}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {s.title}
                          </div>
                          {s.description && (
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {s.description}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 mt-1">
                            {formatSubmittedAt(s.submittedAt)}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SectionBlock>
  )
}
