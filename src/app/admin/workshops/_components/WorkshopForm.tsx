'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Workshop, WorkshopMaterial } from '@/data/mockWorkshopData'
import { calculateWorkshopStatus } from '@/data/mockWorkshopData'
import MaterialListEditor from './MaterialListEditor'

interface WorkshopFormProps {
  mode: 'create' | 'edit'
  initialData?: Workshop
  onSave: (data: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt' | 'status'>, publish: boolean) => void
}

export default function WorkshopForm({ mode, initialData, onSave }: WorkshopFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '')
  const [instructorName, setInstructorName] = useState(initialData?.instructor.name || '')
  const [instructorTitle, setInstructorTitle] = useState(initialData?.instructor.title || '')
  const [instructorBio, setInstructorBio] = useState(initialData?.instructor.bio || '')
  const [startDate, setStartDate] = useState(initialData?.startDate || '')
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [tagsInput, setTagsInput] = useState(initialData?.tags.join('、') || '')
  const [linkedCourseId, setLinkedCourseId] = useState(initialData?.linkedCourseId || '')
  const [materials, setMaterials] = useState<WorkshopMaterial[]>(initialData?.materials || [])
  const [isCancelled, setIsCancelled] = useState(initialData?.isCancelled ?? false)
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
    if (!instructorName.trim()) newErrors.instructorName = '请输入讲师姓名'
    if (!startDate) newErrors.startDate = '请选择开始日期'
    if (!endDate) newErrors.endDate = '请选择结束日期'
    if (startDate && endDate && startDate > endDate) newErrors.endDate = '结束日期不能早于开始日期'
    if (!location.trim()) newErrors.location = '请输入活动地点'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    const tags = tagsInput.split(/[、,\s]+/).map(t => t.trim()).filter(Boolean)

    const data: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
      title: title.trim(),
      description: description.trim(),
      coverImage,
      instructor: {
        name: instructorName.trim(),
        title: instructorTitle.trim() || undefined,
        bio: instructorBio.trim() || undefined,
      },
      startDate,
      endDate,
      location: location.trim(),
      tags,
      linkedCourseId: linkedCourseId.trim() || undefined,
      materials,
      isCancelled,
    }

    onSave(data, true)
  }

  // 预览状态计算
  const previewStatus = startDate && endDate
    ? calculateWorkshopStatus({ startDate, endDate, isCancelled })
    : null

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
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

        <div className="grid grid-cols-3 gap-6">
          {/* 左侧表单 */}
          <div className="col-span-2 space-y-6">
            {/* 基础信息 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">基础信息</h2>

              {/* 标题 */}
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
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.title
                    ? <p className="text-sm text-red-500">{errors.title}</p>
                    : <span />}
                  <span className="text-xs text-gray-400">{title.length}/40</span>
                </div>
              </div>

              {/* 简介 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  简介 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="简要描述工作坊内容与学习目标..."
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.description
                    ? <p className="text-sm text-red-500">{errors.description}</p>
                    : <span />}
                  <span className="text-xs text-gray-400">{description.length}/200</span>
                </div>
              </div>

              {/* 封面图 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  封面图 <span className="text-gray-400 text-xs">（选填）</span>
                </label>
                {coverImage ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br from-primary-50 to-gray-100">
                    <img src={coverImage} alt="封面预览" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <label className="px-3 py-1.5 text-xs bg-white/95 text-gray-700 rounded-lg cursor-pointer hover:bg-white shadow-sm transition-colors">
                        更换
                        <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" />
                      </label>
                      <button
                        onClick={() => setCoverImage('')}
                        className="px-3 py-1.5 text-xs bg-white/95 text-red-600 rounded-lg hover:bg-white shadow-sm transition-colors"
                      >
                        移除
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 bg-gray-50 transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 group-hover:border-primary-300">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">点击上传封面图</span>
                    <span className="text-xs text-gray-400 mt-1">建议 16:9 比例</span>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" />
                  </label>
                )}
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主题标签 <span className="text-gray-400 text-xs">（选填，多个用顿号或逗号分隔）</span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="如：跨学科、教学设计、C-POTE"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* 讲师信息 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">讲师信息</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    讲师姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    placeholder="如：张教授"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                      errors.instructorName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.instructorName && <p className="mt-1 text-sm text-red-500">{errors.instructorName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    头衔 <span className="text-gray-400 text-xs">（选填）</span>
                  </label>
                  <input
                    type="text"
                    value={instructorTitle}
                    onChange={(e) => setInstructorTitle(e.target.value)}
                    placeholder="如：华南师范大学教育信息技术学院教授"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  讲师简介 <span className="text-gray-400 text-xs">（选填）</span>
                </label>
                <textarea
                  value={instructorBio}
                  onChange={(e) => setInstructorBio(e.target.value)}
                  rows={2}
                  placeholder="简要介绍讲师背景与专业方向..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* 时间地点 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">时间地点</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    开始日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    结束日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动地点 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="如：广州市天河区华南师范大学教育信息技术学院 3 号楼报告厅"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
              </div>
            </div>

            {/* 关联课程 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">关联课程</h2>
                <p className="text-sm text-gray-500 mt-1">可选。关联后教师端详情页会显示&ldquo;相关课程&rdquo;入口</p>
              </div>
              <input
                type="text"
                value={linkedCourseId}
                onChange={(e) => setLinkedCourseId(e.target.value)}
                placeholder="课程 ID，如 course_001（暂用文本输入，后续替换为下拉选择）"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* 资料管理 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <MaterialListEditor materials={materials} onChange={setMaterials} />
            </div>

            {/* 高级：取消状态 */}
            {mode === 'edit' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">状态控制</h2>
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">标记为已取消</div>
                    <div className="text-sm text-gray-500 mt-1">
                      取消后教师端详情页会显示&ldquo;已取消&rdquo;，资料仍可访问
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isCancelled}
                    onChange={(e) => setIsCancelled(e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500/50"
                  />
                </label>
              </div>
            )}
          </div>

          {/* 右侧：预览 */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-900">教师端展示预览</h3>
              </div>

              {/* 模拟卡片预览 */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="relative h-32 bg-gradient-to-br from-primary-50 to-gray-100">
                  {coverImage && (
                    <img src={coverImage} alt="" className="w-full h-full object-cover" />
                  )}
                  {previewStatus && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/95 text-gray-700 shadow-sm">
                        {previewStatus === 'ongoing' ? '进行中' :
                         previewStatus === 'upcoming' ? '未开始' :
                         previewStatus === 'completed' ? '已结束' : '已取消'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                    {title || '工作坊标题'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2rem]">
                    {description || '简介预览...'}
                  </p>
                  <div className="text-xs text-gray-400 mt-2 space-y-0.5">
                    <div>讲师：{instructorName || '未填写'}</div>
                    <div>时间：{startDate && endDate ? `${startDate} — ${endDate}` : '未设置'}</div>
                    <div className="line-clamp-1">地点：{location || '未填写'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <div>状态：<span className="font-medium text-gray-900">{previewStatus ? (
                  previewStatus === 'ongoing' ? '进行中' :
                  previewStatus === 'upcoming' ? '未开始' :
                  previewStatus === 'completed' ? '已结束' : '已取消'
                ) : '待设置时间'}</span></div>
                <div>资料数：<span className="font-medium text-gray-900">{materials.length} 份</span></div>
                <div>标签数：<span className="font-medium text-gray-900">{tagsInput.split(/[、,\s]+/).filter(Boolean).length} 个</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
