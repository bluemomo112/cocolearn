'use client'

import { useRef } from 'react'
import type { WorkshopPhoto } from '@/data/mockWorkshopData'

interface PhotoListEditorProps {
  photos: WorkshopPhoto[]
  onChange: (list: WorkshopPhoto[]) => void
}

export default function PhotoListEditor({ photos, onChange }: PhotoListEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const newPhotos: WorkshopPhoto[] = files.map((file) => ({
      id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      url: URL.createObjectURL(file),
    }))
    onChange([...photos, ...newPhotos])
    e.target.value = ''
  }

  const handleCaption = (i: number, caption: string) => {
    onChange(photos.map((p, idx) => (idx === i ? { ...p, caption } : p)))
  }

  const handleRemove = (i: number) => {
    if (confirm('确定要移除这张照片吗？')) {
      onChange(photos.filter((_, idx) => idx !== i))
    }
  }

  const handleMove = (i: number, dir: 'left' | 'right') => {
    const newIdx = dir === 'left' ? i - 1 : i + 1
    if (newIdx < 0 || newIdx >= photos.length) return
    const list = [...photos]
    const [item] = list.splice(i, 1)
    list.splice(newIdx, 0, item)
    onChange(list)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">合影、花絮照片，教师端以画廊展示</p>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + 上传照片
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="py-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-500">还没有照片</p>
          <p className="text-xs text-gray-400 mt-1">支持批量上传</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((p, i) => (
            <div key={p.id} className="group relative bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption || ''} className="w-full aspect-[4/3] object-cover" />
              <div className="p-2">
                <input
                  type="text"
                  value={p.caption || ''}
                  onChange={(e) => handleCaption(i, e.target.value)}
                  placeholder="添加说明（选填）"
                  className="w-full text-xs px-2 py-1 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => handleMove(i, 'left')} disabled={i === 0}
                  className="w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button type="button" onClick={() => handleMove(i, 'right')} disabled={i === photos.length - 1}
                  className="w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </button>
                <button type="button" onClick={() => handleRemove(i)}
                  className="w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
