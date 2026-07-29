'use client'

import { useState } from 'react'
import { courses } from '@/data/mockData'
import type { TeacherSubmission, SubmissionType } from '@/data/mockWorkshopData'
import { CloseIcon } from './detailHelpers'

type SubmitPayload = Omit<
  TeacherSubmission,
  'id' | 'submittedAt' | 'teacherId' | 'teacherName' | 'teacherSchool' | 'teacherSubject'
>

interface SubmitWorkModalProps {
  onSubmit: (submission: SubmitPayload) => void
  onClose: () => void
}

const TYPE_OPTIONS: { value: SubmissionType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'course',
    label: '我的课程',
    description: '从我创建的课程中选一门作为作品',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    value: 'file',
    label: '文件',
    description: '上传 PDF、Word、PPT 等文档',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    value: 'image',
    label: '图片',
    description: '课堂照片、学生作品拍照等',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: 'text',
    label: '心得',
    description: '培训感悟、教学反思（支持 Markdown）',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
]

export default function SubmitWorkModal({ onSubmit, onClose }: SubmitWorkModalProps) {
  const [type, setType] = useState<SubmissionType>('text')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  // type=course
  const [selectedCourseId, setSelectedCourseId] = useState('')

  // type=file
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState<number | undefined>()
  const [fileFormat, setFileFormat] = useState('')

  // type=image
  const [imageUrl, setImageUrl] = useState('')

  // type=text
  const [content, setContent] = useState('')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileUrl(URL.createObjectURL(f))
    setFileName(f.name)
    setFileSize(f.size)
    const ext = f.name.split('.').pop()?.toLowerCase() || ''
    setFileFormat(ext)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImageUrl(URL.createObjectURL(f))
  }

  const handleSubmit = () => {
    if (!title.trim()) { setError('请填写作品标题'); return }
    if (type === 'course' && !selectedCourseId) { setError('请选一门课程'); return }
    if (type === 'file' && !fileUrl) { setError('请上传文件'); return }
    if (type === 'image' && !imageUrl) { setError('请上传图片'); return }
    if (type === 'text' && !content.trim()) { setError('请填写心得内容'); return }

    const payload: SubmitPayload = {
      type,
      title: title.trim(),
      description: description.trim() || undefined,
    }

    if (type === 'course') {
      const course = courses.find(c => c.id === selectedCourseId)
      if (course) {
        payload.courseId = course.id
        payload.courseCover = course.cover
        payload.courseSubject = course.subjects[0]
        payload.courseGrade = course.grade
      }
    } else if (type === 'file') {
      payload.fileUrl = fileUrl
      payload.fileName = fileName
      payload.fileSize = fileSize
      payload.fileFormat = fileFormat
    } else if (type === 'image') {
      payload.imageUrl = imageUrl
    } else if (type === 'text') {
      payload.content = content
    }

    onSubmit(payload)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900">提交我的作品</h3>
            <p className="text-xs text-gray-500 mt-0.5">分享你在本次工作坊后的实践、感悟或产出</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
          )}

          {/* 作品类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">作品类型</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setType(opt.value); setError('') }}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                    type === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`flex-shrink-0 ${type === opt.value ? 'text-primary-600' : 'text-gray-400'}`}>
                    {opt.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-medium ${type === opt.value ? 'text-primary-900' : 'text-gray-900'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 通用：标题/描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              作品标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError('') }}
              placeholder="给你的作品起个名字"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">简介（选填）</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="一两句话说明这个作品"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>

          {/* 按类型的具体内容 */}
          {type === 'course' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                从我的课程中选择 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              >
                <option value="">— 请选择 —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}（{c.subjects.join('/')} · {c.grade}）
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1.5">
                只显示你有权限的课程；点击预览后可跳转到课程详情页
              </p>
            </div>
          )}

          {type === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                上传文件 <span className="text-red-500">*</span>
              </label>
              {fileUrl ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{fileName}</div>
                    <div className="text-xs text-gray-500">{fileFormat.toUpperCase()} · {fileSize && (fileSize / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFileUrl(''); setFileName(''); setFileSize(undefined); setFileFormat('') }}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    移除
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input type="file" onChange={handleFile} className="hidden" />
                  <div className="border-2 border-dashed border-gray-200 rounded-lg py-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors">
                    <div className="text-sm text-gray-600">点击上传文件</div>
                    <div className="text-xs text-gray-400 mt-1">PDF / Word / PPT / ZIP 等</div>
                  </div>
                </label>
              )}
            </div>
          )}

          {type === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                上传图片 <span className="text-red-500">*</span>
              </label>
              {imageUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="preview" className="w-full max-h-80 object-contain bg-gray-50 rounded-lg border border-gray-100" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  <div className="border-2 border-dashed border-gray-200 rounded-lg py-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors">
                    <div className="text-sm text-gray-600">点击上传图片</div>
                    <div className="text-xs text-gray-400 mt-1">JPG / PNG / GIF / WebP</div>
                  </div>
                </label>
              )}
            </div>
          )}

          {type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                心得正文 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder={`# 我的收获

在这次工作坊中，我最大的收获是……

## 三个关键点
1. ...
2. ...
3. ...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 font-mono text-sm resize-y"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                支持 Markdown 语法：**加粗** *斜体* # 标题 - 列表
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            提交作品
          </button>
        </div>
      </div>
    </div>
  )
}
