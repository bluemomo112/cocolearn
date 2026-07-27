'use client'

import { useState } from 'react'
import type { WorkshopMaterial, WorkshopMaterialSource } from '@/data/mockWorkshopData'

interface MaterialListEditorProps {
  materials: WorkshopMaterial[]
  onChange: (materials: WorkshopMaterial[]) => void
}

// 5 种资源来源
const SOURCE_OPTIONS: Array<{ value: WorkshopMaterialSource; label: string; desc: string }> = [
  { value: 'file', label: '本地文件', desc: '上传 PDF/视频/文档' },
  { value: 'link', label: '网页链接', desc: '贴入网页 URL' },
  { value: 'video', label: '外部视频', desc: '贴入 embed 代码' },
  { value: 'html', label: '网页文件', desc: '上传 .html/.zip 或贴 URL' },
  { value: 'ai', label: 'AI 应用', desc: '站内/第三方 AI 工具' },
]

const IFRAME_FRIENDLY_FORMATS = ['pdf', 'mp4', 'md', 'webm', 'ogg', 'jpg', 'jpeg', 'png', 'gif']

export default function MaterialListEditor({ materials, onChange }: MaterialListEditorProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAdd = (material: WorkshopMaterial) => {
    onChange([...materials, material])
    setShowAddModal(false)
  }

  const handleUpdate = (index: number, material: WorkshopMaterial) => {
    onChange(materials.map((m, i) => (i === index ? material : m)))
    setEditingIndex(null)
  }

  const handleRemove = (index: number) => {
    if (confirm('确定要移除这份资料吗？')) {
      onChange(materials.filter((_, i) => i !== index))
    }
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= materials.length) return
    const newList = [...materials]
    const [item] = newList.splice(index, 1)
    newList.splice(newIndex, 0, item)
    onChange(newList)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">活动资料</h2>
          <p className="text-sm text-gray-500 mt-1">上传或链接本次工作坊的培训资料，教师端将在详情页查看</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加资料
        </button>
      </div>

      {materials.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-500">暂无资料</p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            + 添加第一份资料
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {materials.map((material, index) => (
            <div
              key={material.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white text-primary-600 flex items-center justify-center border border-gray-100">
                {getSourceIcon(material.source)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{material.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                  <span>{SOURCE_OPTIONS.find(o => o.value === material.source)?.label}</span>
                  {material.fileFormat && <span>· {material.fileFormat.toUpperCase()}</span>}
                  <span>· {material.openMode === 'iframe' ? '站内预览' : '新标签打开'}</span>
                  {material.downloadable && <span>· 可下载</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="上移"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === materials.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="下移"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingIndex(index)}
                  className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                  title="编辑"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="删除"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAddModal || editingIndex !== null) && (
        <MaterialFormModal
          initial={editingIndex !== null ? materials[editingIndex] : undefined}
          onSubmit={(m) => {
            if (editingIndex !== null) handleUpdate(editingIndex, m)
            else handleAdd(m)
          }}
          onCancel={() => {
            setShowAddModal(false)
            setEditingIndex(null)
          }}
        />
      )}
    </div>
  )
}

// ============ 添加/编辑资料的模态框 ============
function MaterialFormModal({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: WorkshopMaterial
  onSubmit: (material: WorkshopMaterial) => void
  onCancel: () => void
}) {
  const [source, setSource] = useState<WorkshopMaterialSource>(initial?.source || 'file')
  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl || '')
  const [fileName, setFileName] = useState(initial?.fileName || '')
  const [fileFormat, setFileFormat] = useState(initial?.fileFormat || '')
  const [fileSize, setFileSize] = useState(initial?.fileSize || 0)
  const [externalUrl, setExternalUrl] = useState(initial?.externalUrl || '')
  const [embedCode, setEmbedCode] = useState(initial?.embedCode || '')
  const [openMode, setOpenMode] = useState<'redirect' | 'iframe'>(initial?.openMode || 'redirect')
  const [downloadable, setDownloadable] = useState(initial?.downloadable ?? false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSourceChange = (newSource: WorkshopMaterialSource) => {
    setSource(newSource)
    // 智能默认值
    if (newSource === 'file') {
      setDownloadable(true)
      if (fileFormat && IFRAME_FRIENDLY_FORMATS.includes(fileFormat.toLowerCase())) {
        setOpenMode('iframe')
      }
    } else {
      setDownloadable(false)
      setOpenMode(newSource === 'video' || newSource === 'ai' ? 'iframe' : 'redirect')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const format = file.name.split('.').pop()?.toLowerCase() || ''
    setFileName(file.name)
    setFileFormat(format)
    setFileSize(file.size)
    setFileUrl(URL.createObjectURL(file))
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = '请输入标题'
    if (source === 'file' && !fileUrl) e.file = '请上传文件'
    if (source === 'html' && !fileUrl && !externalUrl.trim()) e.file = '请上传 HTML 文件或粘贴 URL'
    if ((source === 'link' || source === 'ai') && !externalUrl.trim()) e.externalUrl = '请输入 URL'
    if ((source === 'link' || source === 'ai') && externalUrl.trim() && !/^https?:\/\//.test(externalUrl)) {
      e.externalUrl = 'URL 必须以 http:// 或 https:// 开头'
    }
    if (source === 'video' && !embedCode.trim()) e.embedCode = '请粘贴视频 embed 代码'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const material: WorkshopMaterial = {
      id: initial?.id || `mat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      description: description.trim() || undefined,
      source,
      openMode,
      downloadable: source === 'file' ? downloadable : false,
      ...(source === 'file'
        ? { fileUrl, fileName, fileSize, fileFormat }
        : source === 'video'
        ? { embedCode: embedCode.trim() }
        : source === 'html' && fileUrl
        ? { fileUrl, fileName, fileSize, fileFormat }
        : { externalUrl: externalUrl.trim() }),
    }
    onSubmit(material)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{initial ? '编辑资料' : '添加资料'}</h3>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 资源来源 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              资源类型 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {SOURCE_OPTIONS.map(opt => {
                const selected = source === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSourceChange(opt.value)}
                    className={`flex flex-col items-center gap-1 p-2.5 border-2 rounded-xl text-center transition-all ${
                      selected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300 text-gray-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selected ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-600'
                    }`}>
                      {getSourceIcon(opt.value)}
                    </div>
                    <div className="text-xs font-medium leading-tight">{opt.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：C-POTE 模型详解"
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* 简介 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">简介 <span className="text-gray-400 text-xs">（选填）</span></label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="一句话描述这份资料"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
            />
          </div>

          {/* 内容输入区 */}
          {source === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上传文件 <span className="text-red-500">*</span>
              </label>
              {fileName ? (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate text-sm">{fileName}</div>
                    <div className="text-xs text-gray-500">{fileFormat.toUpperCase()} · {(fileSize / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <label className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded cursor-pointer transition-colors">
                    替换
                    <input type="file" onChange={handleFileUpload} className="sr-only" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 bg-gray-50 transition-colors">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-gray-700">点击上传文件</span>
                  <input type="file" onChange={handleFileUpload} className="sr-only" />
                </label>
              )}
              {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
            </div>
          )}

          {(source === 'link' || source === 'ai') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {source === 'ai' ? 'AI 应用地址' : '网页链接'} <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://..."
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                  errors.externalUrl ? 'border-red-500' : 'border-gray-300'
                }`}
              />
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
                rows={4}
                placeholder='<iframe src="https://..." width="100%" height="500"></iframe>'
                className={`w-full px-4 py-2.5 border rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors resize-none ${
                  errors.embedCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.embedCode && <p className="mt-1 text-sm text-red-500">{errors.embedCode}</p>}
            </div>
          )}

          {source === 'html' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">上传 HTML 文件</label>
                {fileName ? (
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-sm">{fileName}</div>
                    </div>
                    <label className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded cursor-pointer">
                      替换
                      <input type="file" accept=".html,.htm,.zip" onChange={handleFileUpload} className="sr-only" />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 bg-gray-50">
                    <span className="text-sm text-gray-600">点击上传 .html / .zip</span>
                    <input type="file" accept=".html,.htm,.zip" onChange={handleFileUpload} className="sr-only" />
                  </label>
                )}
              </div>
              <div className="text-xs text-center text-gray-400">或者</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">粘贴已部署的网页 URL</label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
                />
              </div>
              {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
            </div>
          )}

          {/* 打开方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">打开方式</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOpenMode('redirect')}
                className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                  openMode === 'redirect'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                跳转新标签页
              </button>
              <button
                type="button"
                onClick={() => setOpenMode('iframe')}
                className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                  openMode === 'iframe'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                站内 iframe 弹窗
              </button>
            </div>
          </div>

          {/* 下载开关（仅本地文件） */}
          {source === 'file' && (
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-700">支持下载</span>
              <input
                type="checkbox"
                checked={downloadable}
                onChange={(e) => setDownloadable(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
            </label>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
          >
            {initial ? '保存修改' : '添加资料'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ Icon helper ============
function getSourceIcon(source: WorkshopMaterialSource) {
  const iconClass = 'w-4 h-4'
  const iconMap: Record<WorkshopMaterialSource, React.ReactNode> = {
    file: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    link: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    video: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    html: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    ai: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  }
  return iconMap[source]
}
