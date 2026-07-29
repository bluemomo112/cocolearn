'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  mockWorkshops,
  WORKSHOP_STATUS_META,
  type WorkshopMaterial,
  type WorkshopPhoto,
  type WorkshopVideo,
  type TeacherSubmission,
} from '@/data/mockWorkshopData'

import { formatDateRange } from './_components/detailHelpers'
import {
  MaterialPreview,
  PhotoPreview,
  VideoPreview,
  SubmissionPreview,
} from './_components/PreviewModals'
import {
  InstructorsSection,
  AgendaSection,
  LinkedCoursesSection,
  MaterialsSection,
  PhotosSection,
  VideosSection,
  SubmissionsSection,
} from './_components/DetailSections'
import SubmitWorkModal from './_components/SubmitWorkModal'

// 模拟当前登录教师（实际应从 auth 获取）
const CURRENT_TEACHER = {
  id: 't_current',
  name: '当前老师',
  school: '示例中学',
  subject: '语文',
}

export default function WorkshopDetailPage() {
  const params = useParams()
  const id = params.id as string
  const workshop = mockWorkshops.find((w) => w.id === id)

  const [previewMaterial, setPreviewMaterial] = useState<WorkshopMaterial | null>(null)
  const [previewPhoto, setPreviewPhoto] = useState<WorkshopPhoto | null>(null)
  const [previewVideo, setPreviewVideo] = useState<WorkshopVideo | null>(null)
  const [previewSubmission, setPreviewSubmission] = useState<TeacherSubmission | null>(null)
  const [showSubmit, setShowSubmit] = useState(false)
  // 本地内存维护教师提交（原型行为，刷新丢失）
  const [localSubmissions, setLocalSubmissions] = useState<TeacherSubmission[]>(workshop?.submissions || [])

  if (!workshop) {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">未找到该工作坊</h2>
          <Link
            href="/workshop"
            className="inline-block px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  const statusMeta = WORKSHOP_STATUS_META[workshop.status]

  const handleSubmit = (submission: Omit<TeacherSubmission, 'id' | 'submittedAt' | 'teacherId' | 'teacherName' | 'teacherSchool' | 'teacherSubject'>) => {
    const full: TeacherSubmission = {
      ...submission,
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      submittedAt: new Date().toISOString(),
      teacherId: CURRENT_TEACHER.id,
      teacherName: CURRENT_TEACHER.name,
      teacherSchool: CURRENT_TEACHER.school,
      teacherSubject: CURRENT_TEACHER.subject,
    }
    setLocalSubmissions([...localSubmissions, full])
    setShowSubmit(false)
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50/30 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 返回 */}
        <Link
          href="/workshop"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回工作坊列表
        </Link>

        {/* Hero：活动信息 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${statusMeta.bgColor} ${statusMeta.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}`} />
              {statusMeta.label}
            </span>
            {workshop.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{workshop.title}</h1>
          <p className="text-gray-600 leading-relaxed mb-5">{workshop.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDateRange(workshop.startDate, workshop.endDate)}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{workshop.location}</span>
            </div>
          </div>
        </section>

        {/* 各板块：无内容自动隐藏 */}
        {workshop.instructors.length > 0 && <InstructorsSection instructors={workshop.instructors} />}
        {workshop.agenda?.trim() && <AgendaSection agenda={workshop.agenda} />}
        {workshop.linkedCourses && workshop.linkedCourses.length > 0 && (
          <LinkedCoursesSection courses={workshop.linkedCourses} />
        )}
        {workshop.materials && workshop.materials.length > 0 && (
          <MaterialsSection materials={workshop.materials} onPreview={setPreviewMaterial} />
        )}
        {workshop.photos && workshop.photos.length > 0 && (
          <PhotosSection photos={workshop.photos} onPreview={setPreviewPhoto} />
        )}
        {workshop.videos && workshop.videos.length > 0 && (
          <VideosSection videos={workshop.videos} onPreview={setPreviewVideo} />
        )}

        {/* 教师作品区 —— 永远展示（因为要显示"提交我的作品"入口） */}
        <SubmissionsSection
          submissions={localSubmissions}
          onPreview={setPreviewSubmission}
          currentTeacherId={CURRENT_TEACHER.id}
          onOpenSubmit={() => setShowSubmit(true)}
        />
      </div>

      {/* 预览弹窗 */}
      {previewMaterial && (
        <MaterialPreview material={previewMaterial} onClose={() => setPreviewMaterial(null)} />
      )}
      {previewPhoto && (
        <PhotoPreview photo={previewPhoto} onClose={() => setPreviewPhoto(null)} />
      )}
      {previewVideo && (
        <VideoPreview video={previewVideo} onClose={() => setPreviewVideo(null)} />
      )}
      {previewSubmission && (
        <SubmissionPreview submission={previewSubmission} onClose={() => setPreviewSubmission(null)} />
      )}
      {showSubmit && (
        <SubmitWorkModal
          onSubmit={handleSubmit}
          onClose={() => setShowSubmit(false)}
        />
      )}
    </div>
  )
}
