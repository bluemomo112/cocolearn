'use client'

import { useState } from 'react'
import type { WorkshopInstructor } from '@/data/mockWorkshopData'

interface InstructorListEditorProps {
  instructors: WorkshopInstructor[]
  onChange: (list: WorkshopInstructor[]) => void
}

export default function InstructorListEditor({ instructors, onChange }: InstructorListEditorProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleSave = (data: WorkshopInstructor) => {
    if (editingIndex !== null) {
      onChange(instructors.map((ins, i) => (i === editingIndex ? data : ins)))
      setEditingIndex(null)
    } else {
      onChange([...instructors, data])
    }
    setShowModal(false)
  }

  const handleRemove = (i: number) => {
    if (confirm('确定要移除这位讲师吗？')) {
      onChange(instructors.filter((_, idx) => idx !== i))
    }
  }

  const handleMove = (i: number, dir: 'up' | 'down') => {
    const newIdx = dir === 'up' ? i - 1 : i + 1
    if (newIdx < 0 || newIdx >= instructors.length) return
    const list = [...instructors]
    const [item] = list.splice(i, 1)
    list.splice(newIdx, 0, item)
    onChange(list)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">支持多位讲师，可上下调整顺序（第一位为主讲）</p>
        <button
          type="button"
          onClick={() => { setEditingIndex(null); setShowModal(true) }}
          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + 添加讲师
        </button>
      </div>

      {instructors.length === 0 ? (
        <div className="py-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-500">还没有讲师</p>
          <p className="text-xs text-red-500 mt-1">至少需要 1 位讲师</p>
        </div>
      ) : (
        <div className="space-y-2">
          {instructors.map((ins, i) => (
            <div key={ins.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium flex-shrink-0">
                {ins.name.trim().charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{ins.name}</div>
                {ins.title && <div className="text-xs text-primary-600 mt-0.5">{ins.title}</div>}
                {ins.bio && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{ins.bio}</div>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button" onClick={() => handleMove(i, 'up')} disabled={i === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>
                </button>
                <button type="button" onClick={() => handleMove(i, 'down')} disabled={i === instructors.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </button>
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
        <InstructorFormModal
          initialData={editingIndex !== null ? instructors[editingIndex] : undefined}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingIndex(null) }}
        />
      )}
    </div>
  )
}

function InstructorFormModal({
  initialData,
  onSave,
  onClose,
}: {
  initialData?: WorkshopInstructor
  onSave: (data: WorkshopInstructor) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initialData?.name || '')
  const [title, setTitle] = useState(initialData?.title || '')
  const [avatar, setAvatar] = useState(initialData?.avatar || '')
  const [bio, setBio] = useState(initialData?.bio || '')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('请输入讲师姓名')
      return
    }
    onSave({
      id: initialData?.id || `ins_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      title: title.trim() || undefined,
      avatar: avatar.trim() || undefined,
      bio: bio.trim() || undefined,
    })
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatar(URL.createObjectURL(file))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {initialData ? '编辑讲师信息' : '添加讲师'}
        </h3>

        <div className="space-y-4">
          {/* 头像 */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-gray-400 font-medium">{name.trim().charAt(0) || '师'}</span>
              )}
            </div>
            <label className="cursor-pointer px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg border border-primary-300 transition-colors">
              上传头像
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input value={name} onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="如：张教授"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">头衔</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="如：华南师范大学教育信息技术学院教授"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">简介</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="讲师背景、研究方向、成就等（选填）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            取消
          </button>
          <button type="button" onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            {initialData ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </div>
  )
}
