'use client'

import Link from 'next/link'
import type {
  WorkshopInstructor,
  WorkshopLinkedCourse,
  WorkshopLinkedResource,
  WorkshopMaterial,
  WorkshopPhoto,
  WorkshopVideo,
  WorkshopParticipant,
  WorkshopParticipantOutcome,
} from '@/data/mockWorkshopData'
import { AvatarBubble, SectionBlock, formatFileSize } from './detailHelpers'
import { OUTCOME_TYPE_META } from './PreviewModals'

// ============ 讲师团队 ============
export function InstructorsSection({ instructors }: { instructors: WorkshopInstructor[] }) {
  return (
    <SectionBlock title="讲师团队" subtitle={`共 ${instructors.length} 位讲师`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {instructors.map((ins) => (
          <div key={ins.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <AvatarBubble name={ins.name} avatar={ins.avatar} size={56} />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900">{ins.name}</div>
              {ins.title && <div className="text-sm text-primary-600 mt-0.5">{ins.title}</div>}
              {ins.bio && <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">{ins.bio}</p>}
            </div>
          </div>
        ))}
      </div>
    </SectionBlock>
  )
}

// ============ 活动规划 ============
export function AgendaSection({ agenda }: { agenda: string }) {
  return (
    <SectionBlock title="活动规划" subtitle="日程与安排">
      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
        {agenda}
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

// ============ 关联学习资源 ============
const RESOURCE_SECTION_LABELS = {
  'master-class': '名师课堂',
  'interactive-tool': '互动工具',
  'learning-resource': '学习资源',
}

export function LinkedResourcesSection({ resources }: { resources: WorkshopLinkedResource[] }) {
  return (
    <SectionBlock title="关联学习资源" subtitle="从学习资源库精选的配套材料">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {resources.map((r) => (
          <Link
            key={r.id}
            href={`/resource-hub?resource=${r.id}`}
            className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div className="aspect-video bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="p-3">
              <div className="text-xs text-primary-600 mb-1">{RESOURCE_SECTION_LABELS[r.section]}</div>
              <div className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
                {r.title}
              </div>
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

// ============ 参会老师及成果 ============
export function ParticipantsSection({
  participants,
  onPreviewOutcome,
}: {
  participants: WorkshopParticipant[]
  onPreviewOutcome: (o: WorkshopParticipantOutcome) => void
}) {
  return (
    <SectionBlock
      title="参会老师与成果"
      subtitle={`共 ${participants.length} 位老师，${participants.reduce((sum, p) => sum + p.outcomes.length, 0)} 份成果`}
    >
      <div className="space-y-6">
        {participants.map((p) => (
          <div key={p.id} className="border-l-2 border-primary-200 pl-4">
            {/* 老师信息 */}
            <div className="flex items-start gap-3 mb-3">
              <AvatarBubble name={p.name} avatar={p.avatar} size={44} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {[p.school, p.subject].filter(Boolean).join(' · ') || '—'}
                </div>
                {p.bio && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{p.bio}</p>}
              </div>
            </div>

            {/* 成果列表 */}
            {p.outcomes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-14">
                {p.outcomes.map((o) => {
                  const meta = OUTCOME_TYPE_META[o.type]
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => onPreviewOutcome(o)}
                      className="group flex items-start gap-2.5 p-3 bg-gray-50 hover:bg-white rounded-lg border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-primary-600 flex-shrink-0 border border-gray-100">
                        {meta.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                          {o.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{meta.label}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="ml-14 text-xs text-gray-400 italic">暂无成果</div>
            )}
          </div>
        ))}
      </div>
    </SectionBlock>
  )
}
