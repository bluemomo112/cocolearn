'use client'

import { useState } from 'react'
import Link from 'next/link'
import type {
  Workshop,
  WorkshopInstructor,
  WorkshopMaterial,
  WorkshopPhoto,
  WorkshopVideo,
  WorkshopParticipant,
  WorkshopLinkedCourse,
  WorkshopLinkedResource,
} from '@/data/mockWorkshopData'
import { calculateWorkshopStatus } from '@/data/mockWorkshopData'
import MaterialListEditor from './MaterialListEditor'
import InstructorListEditor from './InstructorListEditor'
import PhotoListEditor from './PhotoListEditor'
import VideoListEditor from './VideoListEditor'
import ParticipantListEditor from './ParticipantListEditor'

interface WorkshopFormProps {
  mode: 'create' | 'edit'
  initialData?: Workshop
  onSave: (data: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void
}

export default function WorkshopForm({ mode, initialData, onSave }: WorkshopFormProps) {
  // 基础信息
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '')
  const [agenda, setAgenda] = useState(initialData?.agenda || '')
  const [startDate, setStartDate] = useState(initialData?.startDate || '')
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [tagsInput, setTagsInput] = useState(initialData?.tags.join('、') || '')
  const [isCancelled, setIsCancelled] = useState(initialData?.isCancelled ?? false)

  // 各内容板块
  const [instructors, setInstructors] = useState<WorkshopInstructor[]>(initialData?.instructors || [])
  const [materials, setMaterials] = useState<WorkshopMaterial[]>(initialData?.materials || [])
  const [photos, setPhotos] = useState<WorkshopPhoto[]>(initialData?.photos || [])
  const [videos, setVideos] = useState<WorkshopVideo[]>(initialData?.videos || [])
  const [participants, setParticipants] = useState<WorkshopParticipant[]>(initialData?.participants || [])
  const [linkedCourses, setLinkedCourses] = useState<WorkshopLinkedCourse[]>(initialData?.linkedCourses || [])
  const [linkedResources, setLinkedResources] = useState<WorkshopLinkedResource[]>(initialData?.linkedResources || [])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverImage(URL.createObjectURL(file))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = '请输入标题'
    else if (title.length > 40) newErrors.title = '标题不超过 40 字'
    if (!description.trim()) newErrors.description = '请输入简介'
    else if (description.length > 200) newErrors.description = '简介不超过 200 字'
    if (instructors.length === 0) newErrors.instructors = '至少添加 1 位讲师'
    if (!startDate) newErrors.startDate = '请选择开始日期'
    if (!endDate) newErrors.endDate = '请选择结束日期'
    if (startDate && endDate && startDate > endDate) newErrors.endDate = '结束日期不能早于开始日期'
    if (!location.trim()) newErrors.location = '请输入活动地点'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      // 滚动到第一个错误
      const firstError = document.querySelector('[data-error="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const tags = tagsInput.split(/[、,\s]+/).map(t => t.trim()).filter(Boolean)
    onSave({
      title: title.trim(),
      description: description.trim(),
      coverImage,
      agenda: agenda.trim() || undefined,
      instructors,
      startDate,
      endDate,
      location: location.trim(),
      tags,
      linkedCourses: linkedCourses.length ? linkedCourses : undefined,
      linkedResources: linkedResources.length ? linkedResources : undefined,
      materials: materials.length ? materials : undefined,
      photos: photos.length ? photos : undefined,
      videos: videos.length ? videos : undefined,
      participants: participants.length ? participants : undefined,
      isCancelled,
    })
  }

  const previewStatus = startDate && endDate
    ? calculateWorkshopStatus({ startDate, endDate, isCancelled })
    : null

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* 顶部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link href="/admin/workshops" className="hover:text-gray-700">工作坊管理</Link>
              <span>/</span>
              <span>{mode === 'create' ? '新建工作坊' : '编辑工作坊'}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? '新建工作坊' : '编辑工作坊'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">除标记 <span className="text-red-500">*</span> 的必填项外，其他内容按需填写。教师端会自动隐藏空内容板块。</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/workshops"
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </Link>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              {mode === 'create' ? '创建工作坊' : '保存修改'}
            </button>
          </div>
        </div>

        {/* 主体：单栏布局（表单信息本身复杂，不用双栏） */}
        <div className="space-y-5">
          {/* 基础信息 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-1 h-5 bg-primary-500 rounded" />
              <h2 className="text-base font-semibold text-gray-900">基础信息</h2>
              <span className="text-xs text-red-500 ml-1">必填</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                工作坊标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={40}
                placeholder="如：跨学科教学设计工作坊"
                data-error={!!errors.title}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between mt-1">
                {errors.title ? <p className="text-sm text-red-500">{errors.title}</p> : <span />}
                <span className="text-xs text-gray-400">{title.length}/40</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活动简介 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="用一两句话说明活动核心目标"
                data-error={!!errors.description}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? <p className="text-sm text-red-500">{errors.description}</p> : <span />}
                <span className="text-xs text-gray-400">{description.length}/200</span>
              </div>
            </div>

            {/* 封面 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">封面图</label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">未上传</span>
                  )}
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  <span className="px-3 py-1.5 text-sm text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                    {coverImage ? '更换封面' : '上传封面'}
                  </span>
                </label>
              </div>
            </div>

            {/* 时间 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  开始日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-error={!!errors.startDate}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  结束日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-error={!!errors.endDate}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* 状态预览 */}
            {previewStatus && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                根据当前日期，此工作坊状态为：<span className="font-medium text-gray-700">
                  {previewStatus === 'upcoming' ? '未开始' :
                   previewStatus === 'ongoing' ? '进行中' :
                   previewStatus === 'completed' ? '已结束' : '已取消'}
                </span>
              </div>
            )}

            {/* 地点 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活动地点 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="如：广州市天河区华南师范大学 3 号楼报告厅"
                data-error={!!errors.location}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">主题标签</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="用顿号、逗号或空格分隔，如：跨学科、教学设计、C-POTE"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* 讲师团队 - 必填 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
              <div className="w-1 h-5 bg-primary-500 rounded" />
              <h2 className="text-base font-semibold text-gray-900">讲师团队</h2>
              <span className="text-xs text-red-500 ml-1">必填</span>
              <span className="text-xs text-gray-400 ml-auto">支持添加多位讲师</span>
            </div>
            <div data-error={!!errors.instructors}>
              <InstructorListEditor instructors={instructors} onChange={setInstructors} />
              {errors.instructors && <p className="text-sm text-red-500 mt-2">{errors.instructors}</p>}
            </div>
          </div>

          {/* 活动规划 - 选填 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
              <div className="w-1 h-5 bg-gray-300 rounded" />
              <h2 className="text-base font-semibold text-gray-900">活动规划</h2>
              <span className="text-xs text-gray-400 ml-1">选填</span>
              <span className="text-xs text-gray-400 ml-auto">日程、大纲等长文本；不填则不显示</span>
            </div>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              rows={8}
              placeholder="例：&#10;Day 1（上午）：开场 + 理论&#10;Day 1（下午）：小组研讨&#10;Day 2：分组产出与汇报"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors font-mono text-sm resize-y"
            />
            <p className="text-xs text-gray-400 mt-2">支持换行；教师端按原文展示。</p>
          </div>

          {/* 培训资料 - 选填 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
              <div className="w-1 h-5 bg-gray-300 rounded" />
              <h2 className="text-base font-semibold text-gray-900">培训资料</h2>
              <span className="text-xs text-gray-400 ml-1">选填</span>
              <span className="text-xs text-gray-400 ml-auto">讲义、模板、参考文档等</span>
            </div>
            <MaterialListEditor materials={materials} onChange={setMaterials} />
          </div>

          {/* 活动相册 - 选填 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
              <div className="w-1 h-5 bg-gray-300 rounded" />
              <h2 className="text-base font-semibold text-gray-900">活动相册</h2>
              <span className="text-xs text-gray-400 ml-1">选填</span>
              <span className="text-xs text-gray-400 ml-auto">合照、花絮等图片</span>
            </div>
            <PhotoListEditor photos={photos} onChange={setPhotos} />
          </div>

          {/* 活动视频 - 选填 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
              <div className="w-1 h-5 bg-gray-300 rounded" />
              <h2 className="text-base font-semibold text-gray-900">活动视频</h2>
              <span className="text-xs text-gray-400 ml-1">选填</span>
              <span className="text-xs text-gray-400 ml-auto">现场录像、回放视频</span>
            </div>
            <VideoListEditor videos={videos} onChange={setVideos} />
          </div>

          {/* 参会老师及成果 - 选填 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
              <div className="w-1 h-5 bg-gray-300 rounded" />
              <h2 className="text-base font-semibold text-gray-900">参会老师及成果</h2>
              <span className="text-xs text-gray-400 ml-1">选填</span>
              <span className="text-xs text-gray-400 ml-auto">按老师分组展示其工作坊产出</span>
            </div>
            <ParticipantListEditor participants={participants} onChange={setParticipants} />
          </div>

          {/* 关联课程 & 学习资源 - 选填 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-1 h-5 bg-gray-300 rounded" />
              <h2 className="text-base font-semibold text-gray-900">关联内容</h2>
              <span className="text-xs text-gray-400 ml-1">选填</span>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">关联课程</div>
              <p className="text-xs text-gray-400 mb-3">通过课程 ID 关联（暂用手动录入，后续接入课程库）</p>
              <SimpleLinkedListEditor
                items={linkedCourses}
                onChange={setLinkedCourses}
                fields={[
                  { key: 'id', label: '课程 ID', required: true, placeholder: 'course_001' },
                  { key: 'title', label: '课程名', required: true, placeholder: '如：物理·浮力探究单元' },
                  { key: 'subject', label: '学科', placeholder: '物理' },
                  { key: 'grade', label: '年级', placeholder: '八年级' },
                  { key: 'description', label: '描述', placeholder: '一句话说明' },
                ]}
                emptyText="暂无关联课程"
              />
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">关联学习资源</div>
              <p className="text-xs text-gray-400 mb-3">从学习资源库勾选（暂用手动录入 ID）</p>
              <SimpleLinkedListEditor
                items={linkedResources}
                onChange={setLinkedResources}
                fields={[
                  { key: 'id', label: '资源 ID', required: true, placeholder: 'res_001' },
                  { key: 'title', label: '资源标题', required: true, placeholder: '如：C-POTE 模型详解' },
                  { key: 'section', label: '所属板块', required: true, placeholder: 'master-class / interactive-tool / learning-resource' },
                  { key: 'description', label: '描述', placeholder: '一句话说明' },
                ]}
                emptyText="暂无关联资源"
              />
            </div>
          </div>

          {/* 状态控制 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
              <div className="w-1 h-5 bg-gray-300 rounded" />
              <h2 className="text-base font-semibold text-gray-900">状态控制</h2>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isCancelled}
                onChange={(e) => setIsCancelled(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">标记为已取消</div>
                <div className="text-sm text-gray-500 mt-1">
                  取消后教师端详情页会显示&ldquo;已取消&rdquo;，资料仍可访问
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ 简单的对象列表编辑器（用于关联课程、关联资源） ============
type LinkedField = { key: string; label: string; required?: boolean; placeholder?: string }

function SimpleLinkedListEditor<T extends { id: string }>({
  items,
  onChange,
  fields,
  emptyText,
}: {
  items: T[]
  onChange: (items: T[]) => void
  fields: LinkedField[]
  emptyText: string
}) {
  const [draft, setDraft] = useState<Record<string, string>>({})

  const handleAdd = () => {
    for (const f of fields) {
      if (f.required && !(draft[f.key] || '').trim()) {
        alert(`请填写「${f.label}」`)
        return
      }
    }
    onChange([...items, { ...draft } as unknown as T])
    setDraft({})
  }

  const handleRemove = (id: string) => {
    onChange(items.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={`${it.id}-${i}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="flex-1 min-w-0">
                {fields.map(f => (
                  <span key={f.key} className="mr-3">
                    <span className="text-gray-400">{f.label}：</span>
                    <span className="text-gray-700">{(it as unknown as Record<string, string>)[f.key] || '—'}</span>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(it.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      {items.length === 0 && (
        <p className="text-sm text-gray-400 py-2">{emptyText}</p>
      )}
      <div className="grid grid-cols-2 gap-2 p-3 border border-dashed border-gray-300 rounded-lg">
        {fields.map(f => (
          <input
            key={f.key}
            value={draft[f.key] || ''}
            onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            placeholder={`${f.label}${f.placeholder ? '（' + f.placeholder + '）' : ''}${f.required ? ' *' : ''}`}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
          />
        ))}
        <div className="col-span-2 flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors"
          >
            + 添加
          </button>
        </div>
      </div>
    </div>
  )
}
