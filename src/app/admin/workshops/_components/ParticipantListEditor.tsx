'use client'

import { useState } from 'react'
import type { WorkshopParticipant, WorkshopParticipantOutcome } from '@/data/mockWorkshopData'

interface ParticipantListEditorProps {
  participants: WorkshopParticipant[]
  onChange: (list: WorkshopParticipant[]) => void
}

export default function ParticipantListEditor({ participants, onChange }: ParticipantListEditorProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleSave = (data: WorkshopParticipant) => {
    if (editingIndex !== null) {
      onChange(participants.map((p, i) => (i === editingIndex ? data : p)))
      setEditingIndex(null)
    } else {
      onChange([...participants, data])
    }
    setShowModal(false)
  }

  const handleRemove = (i: number) => {
    if (confirm('确定要移除这位老师及其成果吗？')) {
      onChange(participants.filter((_, idx) => idx !== i))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">参会老师及其作品展示（教师端按老师分组展示）</p>
        <button
          type="button"
          onClick={() => { setEditingIndex(null); setShowModal(true) }}
          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + 添加老师
        </button>
      </div>

      {participants.length === 0 ? (
        <div className="py-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-500">暂无参会老师记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((p, i) => (
            <div key={p.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium flex-shrink-0">
                  {p.name.trim().charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {[p.school, p.subject].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => { setEditingIndex(i); setShowModal(true) }}
                    className="p-1.5 text-primary-600 hover:bg-primary-100 rounded transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button type="button" onClick={() => handleRemove(i)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg>
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {p.outcomes.length} 份成果
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ParticipantFormModal
          initialData={editingIndex !== null ? participants[editingIndex] : undefined}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingIndex(null) }}
        />
      )}
    </div>
  )
}

function ParticipantFormModal({
  initialData,
  onSave,
  onClose,
}: {
  initialData?: WorkshopParticipant
  onSave: (data: WorkshopParticipant) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initialData?.name || '')
  const [school, setSchool] = useState(initialData?.school || '')
  const [subject, setSubject] = useState(initialData?.subject || '')
  const [bio, setBio] = useState(initialData?.bio || '')
  const [outcomes, setOutcomes] = useState<WorkshopParticipantOutcome[]>(initialData?.outcomes || [])
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) { setError('请输入老师姓名'); return }
    onSave({
      id: initialData?.id || `par_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      school: school.trim() || undefined,
      subject: subject.trim() || undefined,
      bio: bio.trim() || undefined,
      outcomes,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-semibold text-gray-900">{initialData ? '编辑老师信息与成果' : '添加参会老师'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && <div className="px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

          {/* 老师基本信息 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">基本信息</h4>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input value={name} onChange={(e) => { setName(e.target.value); setError('') }}
                placeholder="如：陈小蓝"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">学校</label>
                <input value={school} onChange={(e) => setSchool(e.target.value)}
                  placeholder="如：深圳中学"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">学科</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="如：语文"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">简介</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="教学年限、研究方向等"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 resize-none"
              />
            </div>
          </div>

          {/* 成果列表 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">工作坊成果</h4>
              <button
                type="button"
                onClick={() => {
                  const newOutcome: WorkshopParticipantOutcome = {
                    id: `out_${Date.now()}`,
                    type: 'text',
                    title: '新成果',
                  }
                  setOutcomes([...outcomes, newOutcome])
                }}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                + 添加成果
              </button>
            </div>

            {outcomes.length === 0 ? (
              <div className="py-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500">暂无成果</p>
              </div>
            ) : (
              <div className="space-y-2">
                {outcomes.map((o, i) => (
                  <OutcomeEditor
                    key={o.id}
                    outcome={o}
                    onChange={(updated) => setOutcomes(outcomes.map((x, idx) => (idx === i ? updated : x)))}
                    onRemove={() => setOutcomes(outcomes.filter((_, idx) => idx !== i))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">取消</button>
          <button type="button" onClick={handleSubmit} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            {initialData ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </div>
  )
}

// 单个成果编辑器
function OutcomeEditor({
  outcome,
  onChange,
  onRemove,
}: {
  outcome: WorkshopParticipantOutcome
  onChange: (o: WorkshopParticipantOutcome) => void
  onRemove: () => void
}) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange({
      ...outcome,
      fileUrl: URL.createObjectURL(file),
      fileName: file.name,
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <select
          value={outcome.type}
          onChange={(e) => onChange({ ...outcome, type: e.target.value as WorkshopParticipantOutcome['type'] })}
          className="text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="text">心得文本</option>
          <option value="file">文件</option>
          <option value="image">图片</option>
          <option value="link">链接</option>
        </select>
        <button type="button" onClick={onRemove} className="text-xs text-red-500 hover:text-red-600">移除</button>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={outcome.title}
          onChange={(e) => onChange({ ...outcome, title: e.target.value })}
          placeholder="成果标题"
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <input
          type="text"
          value={outcome.description || ''}
          onChange={(e) => onChange({ ...outcome, description: e.target.value })}
          placeholder="简短描述（选填）"
          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
        />

        {outcome.type === 'text' && (
          <textarea
            value={outcome.content || ''}
            onChange={(e) => onChange({ ...outcome, content: e.target.value })}
            rows={3}
            placeholder="心得正文..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
          />
        )}

        {(outcome.type === 'file' || outcome.type === 'image') && (
          <div>
            {outcome.fileUrl ? (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                <span className="flex-1 truncate">{outcome.fileName || '已上传'}</span>
                <button type="button" onClick={() => onChange({ ...outcome, fileUrl: undefined, fileName: undefined })}
                  className="text-red-500 hover:text-red-600">移除</button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <input type="file" accept={outcome.type === 'image' ? 'image/*' : '*'} onChange={handleFileUpload} className="hidden" />
                <div className="border border-dashed border-gray-200 rounded py-2 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors text-xs text-gray-500">
                  点击上传{outcome.type === 'image' ? '图片' : '文件'}
                </div>
              </label>
            )}
          </div>
        )}

        {outcome.type === 'link' && (
          <input
            type="url"
            value={outcome.externalUrl || ''}
            onChange={(e) => onChange({ ...outcome, externalUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        )}
      </div>
    </div>
  )
}
