'use client'

import { useState } from 'react'
import type { WorkshopVideo } from '@/data/mockWorkshopData'

interface VideoListEditorProps {
  videos: WorkshopVideo[]
  onChange: (list: WorkshopVideo[]) => void
}

export default function VideoListEditor({ videos, onChange }: VideoListEditorProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleSave = (data: WorkshopVideo) => {
    if (editingIndex !== null) {
      onChange(videos.map((v, i) => (i === editingIndex ? data : v)))
      setEditingIndex(null)
    } else {
      onChange([...videos, data])
    }
    setShowModal(false)
  }

  const handleRemove = (i: number) => {
    if (confirm('确定要移除这个视频吗？')) {
      onChange(videos.filter((_, idx) => idx !== i))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">现场录像、活动回放，教师端点击后弹窗播放</p>
        <button
          type="button"
          onClick={() => { setEditingIndex(null); setShowModal(true) }}
          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + 添加视频
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="py-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-500">还没有视频</p>
        </div>
      ) : (
        <div className="space-y-2">
          {videos.map((v, i) => (
            <div key={v.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-16 h-10 rounded bg-black flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{v.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {v.fileUrl ? '本地文件' : v.embedCode ? '外部 Embed' : '未配置'}
                  {v.duration && ` · ${v.duration}`}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => { setEditingIndex(i); setShowModal(true) }}
                  className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button type="button" onClick={() => handleRemove(i)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <VideoFormModal
          initialData={editingIndex !== null ? videos[editingIndex] : undefined}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingIndex(null) }}
        />
      )}
    </div>
  )
}

function VideoFormModal({
  initialData,
  onSave,
  onClose,
}: {
  initialData?: WorkshopVideo
  onSave: (data: WorkshopVideo) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [sourceType, setSourceType] = useState<'file' | 'embed'>(
    initialData?.embedCode ? 'embed' : 'file'
  )
  const [fileUrl, setFileUrl] = useState(initialData?.fileUrl || '')
  const [embedCode, setEmbedCode] = useState(initialData?.embedCode || '')
  const [duration, setDuration] = useState(initialData?.duration || '')
  const [error, setError] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileUrl(URL.createObjectURL(file))
  }

  const handleSubmit = () => {
    if (!title.trim()) { setError('请输入视频标题'); return }
    if (sourceType === 'file' && !fileUrl.trim()) { setError('请上传视频文件'); return }
    if (sourceType === 'embed' && !embedCode.trim()) { setError('请填入 embed 代码'); return }
    onSave({
      id: initialData?.id || `vid_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      fileUrl: sourceType === 'file' ? fileUrl : undefined,
      embedCode: sourceType === 'embed' ? embedCode : undefined,
      duration: duration.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{initialData ? '编辑视频' : '添加视频'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              视频标题 <span className="text-red-500">*</span>
            </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="如：Day 1 开场演讲录像"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">来源方式</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSourceType('file')}
                className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors ${sourceType === 'file' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                本地上传
              </button>
              <button type="button" onClick={() => setSourceType('embed')}
                className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors ${sourceType === 'embed' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                外部 Embed
              </button>
            </div>
          </div>

          {sourceType === 'file' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                视频文件 <span className="text-red-500">*</span>
              </label>
              {fileUrl ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  <span className="flex-1 text-sm text-gray-700 truncate">已选择视频</span>
                  <button type="button" onClick={() => setFileUrl('')} className="text-xs text-red-500 hover:text-red-600">移除</button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                  <div className="border-2 border-dashed border-gray-200 rounded-lg py-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors">
                    <div className="text-sm text-gray-600">点击上传视频文件</div>
                    <div className="text-xs text-gray-400 mt-1">支持 MP4/WebM 等格式</div>
                  </div>
                </label>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Embed 代码 <span className="text-red-500">*</span>
              </label>
              <textarea value={embedCode} onChange={(e) => setEmbedCode(e.target.value)}
                rows={4}
                placeholder='粘贴完整 iframe 代码，如 <iframe src="..." />'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 font-mono text-xs resize-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">时长（选填）</label>
            <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
              placeholder="如：12:30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">取消</button>
          <button type="button" onClick={handleSubmit} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            {initialData ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </div>
  )
}
