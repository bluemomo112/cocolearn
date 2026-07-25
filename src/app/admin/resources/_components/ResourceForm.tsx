'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Resource, ResourceSection, ResourceSource, ResourceOpenMode } from '@/data/mockResourceHubData'

interface ResourceFormProps {
  mode: 'create' | 'edit'
  initialData?: Resource
  defaultSection?: ResourceSection
  onSave: (data: Omit<Resource, 'id' | 'sortWeight' | 'createdAt' | 'updatedAt' | 'createdBy'>, publish: boolean) => void
  onPreview?: () => void
}

const sectionLabels: Record<ResourceSection, string> = {
  'master-class': '名师课堂',
  'interactive-tool': '互动工具',
  'learning-resource': '学习资源'
}

// 可站内预览的格式
const IFRAME_FRIENDLY_FORMATS = ['pdf', 'mp4', 'md', 'webm', 'ogg', 'jpg', 'jpeg', 'png', 'gif']

export default function ResourceForm({ mode, initialData, defaultSection, onSave }: Omit<ResourceFormProps, 'onPreview'>) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '')
  const [section, setSection] = useState<ResourceSection>(initialData?.section || defaultSection || 'master-class')
  const [source, setSource] = useState<ResourceSource>(initialData?.source || 'file')
  const [fileName, setFileName] = useState(initialData?.fileName || '')
  const [fileFormat, setFileFormat] = useState(initialData?.fileFormat || '')
  const [fileSize, setFileSize] = useState(initialData?.fileSize || 0)
  const [fileUrl, setFileUrl] = useState(initialData?.fileUrl || '')
  const [externalUrl, setExternalUrl] = useState(initialData?.externalUrl || '')
  const [embedCode, setEmbedCode] = useState(initialData?.embedCode || '')
  const [openMode, setOpenMode] = useState<ResourceOpenMode>(initialData?.openMode || 'redirect')
  const [downloadable, setDownloadable] = useState(initialData?.downloadable ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // source 是不是被锁定（编辑模式）
  const isSourceLocked = mode === 'edit'

  // 处理 source 变化时设置默认值
  const handleSourceChange = (newSource: ResourceSource) => {
    setSource(newSource)
    
    // 仅创建模式下设置默认值
    if (mode === 'create') {
      if (newSource === 'link') {
        setOpenMode('redirect')
      } else if (newSource === 'file' && fileFormat) {
        if (IFRAME_FRIENDLY_FORMATS.includes(fileFormat.toLowerCase())) {
          setOpenMode('iframe')
        } else {
          setOpenMode('redirect')
        }
      }
      
      // 设置下载开关默认值
      if (newSource === 'file') {
        setDownloadable(true)
      } else {
        setDownloadable(false)
      }
    }
  }

  // 处理文件上传（mock，实际不真传）
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const format = file.name.split('.').pop()?.toLowerCase() || ''
    setFileName(file.name)
    setFileFormat(format)
    setFileSize(file.size)
    setFileUrl(URL.createObjectURL(file))
  }

  // 处理封面上传（mock）
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverImage(URL.createObjectURL(file))
  }

  // iframe 格式警告
  const iframeWarning = source === 'file' && openMode === 'iframe' && fileFormat && !IFRAME_FRIENDLY_FORMATS.includes(fileFormat.toLowerCase())

  // 校验
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = '请输入标题'
    else if (title.length > 30) newErrors.title = '标题不超过 30 字'

    if (description && description.length > 80) newErrors.description = '简介不超过 80 字'

    if (!coverImage) newErrors.coverImage = '请上传封面图'

    if (source === 'file' && !fileUrl) newErrors.file = '请上传文件'
    if (source === 'html' && !fileUrl && !externalUrl.trim()) {
      newErrors.file = '请上传 HTML 文件或粘贴网页 URL'
    }
    if (source === 'link' || source === 'ai') {
      if (!externalUrl.trim()) newErrors.externalUrl = source === 'ai' ? '请填写 AI 应用地址' : '请贴入网页 URL'
      else if (!/^https?:\/\//.test(externalUrl)) newErrors.externalUrl = 'URL 必须以 http:// 或 https:// 开头'
    }
    if (source === 'video' && !embedCode.trim()) newErrors.embedCode = '请粘贴视频 embed 代码'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = (publish: boolean) => {
    if (!validate()) return

    const data: Omit<Resource, 'id' | 'sortWeight' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      coverImage,
      section,
      source,
      ...(source === 'file'
        ? { fileUrl, fileName, fileSize, fileFormat }
        : source === 'video'
        ? { embedCode: embedCode.trim() }
        : source === 'html' && fileUrl
        ? { fileUrl, fileName, fileSize, fileFormat }
        : { externalUrl: externalUrl.trim() }),
      openMode,
      downloadable,
      status: publish ? 'published' : (initialData?.status || 'draft')
    }

    onSave(data, publish)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/resources" className="hover:text-gray-700">学习资源管理</Link>
            <span>/</span>
            <span>{mode === 'create' ? '新建资源' : '编辑资源'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? '新建资源' : '编辑资源'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/resources"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            取消
          </Link>
          <button
            onClick={() => handleSave(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            存为草稿
          </button>
          <button
            onClick={() => handleSave(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {mode === 'create' ? '发布' : '保存并发布'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 左侧表单 */}
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* 板块归属 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              板块归属 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {(Object.keys(sectionLabels) as ResourceSection[]).map(s => (
                <label
                  key={s}
                  className={`flex-1 flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    section === s
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="section"
                    value={s}
                    checked={section === s}
                    onChange={(e) => setSection(e.target.value as ResourceSection)}
                    className="sr-only"
                  />
                  {sectionLabels[s]}
                </label>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标题 <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-gray-500">{title.length}/30</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={30}
              placeholder="请输入资源标题"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* 简介 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              简介
              <span className="ml-2 text-xs text-gray-500">{description.length}/80</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={80}
              rows={2}
              placeholder="用一句话描述这个资源"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>

          {/* 封面图 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封面图 <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-gray-500">建议 16:9 比例</span>
            </label>
            {coverImage ? (
              <div className="relative">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                  <div className="w-full h-full bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                </div>
                <label className="absolute top-2 right-2 px-3 py-1 bg-black/60 text-white text-sm rounded-lg cursor-pointer hover:bg-black/80">
                  更换
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-sm text-gray-600">点击上传封面图</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" />
              </label>
            )}
            {errors.coverImage && <p className="mt-1 text-sm text-red-500">{errors.coverImage}</p>}
          </div>

          {/* 添加资源 —— 4 种上传方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              添加资源 <span className="text-red-500">*</span>
              {isSourceLocked && <span className="ml-2 text-xs text-gray-500">（创建后不可切换）</span>}
            </label>
            <div className="grid grid-cols-5 gap-3">
              {[
                {
                  value: 'file' as ResourceSource,
                  label: '本地文件',
                  desc: '上传 PDF/视频/文档',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  ),
                },
                {
                  value: 'link' as ResourceSource,
                  label: '网页链接',
                  desc: '贴入网页 URL',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  ),
                },
                {
                  value: 'video' as ResourceSource,
                  label: '外部视频',
                  desc: '贴入视频 embed 代码',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  value: 'html' as ResourceSource,
                  label: '网页文件',
                  desc: '上传 .html 或贴 URL',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  ),
                },
                {
                  value: 'ai' as ResourceSource,
                  label: 'AI 应用',
                  desc: '站内/第三方 AI 工具',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                },
              ].map((opt) => {
                const selected = source === opt.value
                const disabled = isSourceLocked && !selected
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => !disabled && handleSourceChange(opt.value)}
                    disabled={disabled}
                    className={`flex flex-col items-start gap-2 p-4 border-2 rounded-xl text-left transition-all ${
                      selected
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                        : disabled
                        ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/40 text-gray-700'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                      selected ? 'bg-primary-500 text-white' : disabled ? 'bg-gray-100 text-gray-300' : 'bg-primary-50 text-primary-600'
                    }`}>
                      {opt.icon}
                    </div>
                    <div className="text-sm font-semibold">{opt.label}</div>
                    <div className={`text-xs ${selected ? 'text-primary-600' : disabled ? 'text-gray-300' : 'text-gray-500'}`}>
                      {opt.desc}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 动态输入区（按来源类型显示） */}
          {source === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上传文件 <span className="text-red-500">*</span>
              </label>
              {fileName ? (
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 text-primary-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{fileName}</div>
                    <div className="text-sm text-gray-500">
                      {fileFormat.toUpperCase()} · {(fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <label className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg cursor-pointer transition-colors">
                    替换
                    <input type="file" onChange={handleFileUpload} className="sr-only" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full py-10 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 bg-gray-50 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 group-hover:border-primary-300">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">点击上传文件</span>
                  <span className="text-xs text-gray-400 mt-1">支持 PDF、视频、Word、Excel、图片等任意格式</span>
                  <input type="file" onChange={handleFileUpload} className="sr-only" />
                </label>
              )}
              {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
            </div>
          )}

          {source === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                网页链接 <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://example.com/resource"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                  errors.externalUrl ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="mt-1.5 text-xs text-gray-500">
                贴入完整链接，例如：https://www.example.com/course/123
              </p>
              {errors.externalUrl && <p className="mt-1 text-sm text-red-500">{errors.externalUrl}</p>}
            </div>
          )}

          {source === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                视频 embed 代码 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
                placeholder='<iframe src="https://www.youtube.com/embed/xxx" width="100%" height="500"></iframe>'
                rows={6}
                className={`w-full px-4 py-2.5 border rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                  errors.embedCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="mt-1.5 text-xs text-gray-500">
                从 YouTube、Bilibili、腾讯视频等平台复制嵌入代码（通常为 iframe 标签）
              </p>
              {errors.embedCode && <p className="mt-1 text-sm text-red-500">{errors.embedCode}</p>}
            </div>
          )}

          {source === 'html' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  方式一：上传 HTML 文件或压缩包
                </label>
                {fileName ? (
                  <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 text-primary-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{fileName}</div>
                      <div className="text-sm text-gray-500">
                        {fileFormat.toUpperCase()} · {(fileSize / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <label className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg cursor-pointer transition-colors">
                      替换
                      <input type="file" accept=".html,.htm,.zip" onChange={handleFileUpload} className="sr-only" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 bg-gray-50 transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 group-hover:border-primary-300">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">点击上传 HTML 文件</span>
                    <span className="text-xs text-gray-400 mt-1">支持 .html、.htm、.zip</span>
                    <input type="file" accept=".html,.htm,.zip" onChange={handleFileUpload} className="sr-only" />
                  </label>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">或者</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  方式二：粘贴已部署的网页 URL
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com/game.html"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                    errors.externalUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
            </div>
          )}

          {source === 'ai' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI 应用地址 <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://ai.example.com/chat 或 /ai-tools/translator"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                  errors.externalUrl ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="mt-1.5 text-xs text-gray-500">
                可填入站内路径（如 /ai-tools/xxx）或第三方 AI 应用 URL
              </p>
              {errors.externalUrl && <p className="mt-1 text-sm text-red-500">{errors.externalUrl}</p>}
            </div>
          )}

          {/* 打开方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              打开方式 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors ${
                openMode === 'redirect'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="openMode"
                  value="redirect"
                  checked={openMode === 'redirect'}
                  onChange={(e) => setOpenMode(e.target.value as ResourceOpenMode)}
                  className="sr-only"
                />
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                跳转新标签页
              </label>
              <label className={`flex-1 flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors ${
                openMode === 'iframe'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="openMode"
                  value="iframe"
                  checked={openMode === 'iframe'}
                  onChange={(e) => setOpenMode(e.target.value as ResourceOpenMode)}
                  className="sr-only"
                />
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 10h16" />
                </svg>
                站内弹窗打开
              </label>
            </div>
            {iframeWarning && (
              <p className="mt-2 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded p-2">
                该格式（{fileFormat}）通常无法站内内嵌预览，建议选&ldquo;跳转新标签页&rdquo;
              </p>
            )}
          </div>

          {/* 下载开关（仅本地文件类型可见） */}
          {source === 'file' && (
            <div>
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-medium text-gray-900">支持下载</div>
                  <div className="text-sm text-gray-500 mt-1">
                    开启后，卡片上会显示独立的下载入口
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={downloadable}
                  onChange={(e) => setDownloadable(e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500/50"
                />
              </label>
            </div>
          )}
        </div>

        {/* 右侧实时预览 */}
        <div className="col-span-1">
          <div className="sticky top-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                教师端展示预览
              </div>
              {/* 卡片预览 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="relative aspect-video bg-gray-100">
                  {coverImage ? (
                    <div className="w-full h-full bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  {downloadable && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
                      <span className="text-sm">⬇</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-gray-900 truncate">
                    {title || '资源标题'}
                  </div>
                  {description && (
                    <div className="text-sm text-gray-500 truncate mt-1">
                      {description}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <div>板块：{sectionLabels[section]}</div>
                <div>打开方式：{openMode === 'iframe' ? '站内弹窗' : '跳转新标签页'}</div>
                <div>下载：{downloadable ? '开启' : '关闭'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
