'use client'

import { useState } from 'react'
import TeacherHeader from '@/components/TeacherHeader'

// 模拟数据
const sharedFolders = [
  {
    id: 's1',
    name: '高中物理教材资源',
    fileCount: 45,
    size: '2.3 GB',
    lastUpdate: '2024-12-20',
    type: 'shared',
    tags: ['物理', '高中', '教材'],
  },
  {
    id: 's2',
    name: '跨学科案例库',
    fileCount: 128,
    size: '5.6 GB',
    lastUpdate: '2024-12-18',
    type: 'shared',
    tags: ['跨学科', '案例'],
  },
  {
    id: 's3',
    name: '数学建模素材',
    fileCount: 67,
    size: '1.8 GB',
    lastUpdate: '2024-12-15',
    type: 'shared',
    tags: ['数学', '建模'],
  },
]

const personalFolders = [
  {
    id: 'p1',
    name: '我的课件集',
    fileCount: 23,
    size: '856 MB',
    lastUpdate: '2024-12-21',
    type: 'personal',
    tags: ['课件', 'PPT'],
  },
  {
    id: 'p2',
    name: '学生作业参考',
    fileCount: 156,
    size: '1.2 GB',
    lastUpdate: '2024-12-19',
    type: 'personal',
    tags: ['作业', '参考'],
  },
  {
    id: 'p3',
    name: '教学视频素材',
    fileCount: 34,
    size: '4.5 GB',
    lastUpdate: '2024-12-17',
    type: 'personal',
    tags: ['视频', '素材'],
  },
]

const recentFiles = [
  {
    id: 'f1',
    name: '水循环系统详解.pdf',
    folder: '高中物理教材资源',
    type: 'pdf',
    size: '12.5 MB',
    status: 'ready',
    uploadTime: '2024-12-21 10:30',
  },
  {
    id: 'f2',
    name: '数学建模案例分析.pptx',
    folder: '我的课件集',
    type: 'pptx',
    size: '8.3 MB',
    status: 'ready',
    uploadTime: '2024-12-21 09:15',
  },
  {
    id: 'f3',
    name: '物理实验视频.mp4',
    folder: '教学视频素材',
    type: 'video',
    size: '256 MB',
    status: 'processing',
    uploadTime: '2024-12-21 08:45',
  },
  {
    id: 'f4',
    name: '气候变化研究报告.docx',
    folder: '跨学科案例库',
    type: 'docx',
    size: '3.2 MB',
    status: 'ready',
    uploadTime: '2024-12-20 16:20',
  },
  {
    id: 'f5',
    name: '化学反应动画.mp4',
    folder: '教学视频素材',
    type: 'video',
    size: '128 MB',
    status: 'uploading',
    uploadTime: '2024-12-21 11:00',
    progress: 65,
  },
]

const fileTypeIcons: Record<string, { icon: string; color: string }> = {
  pdf: { icon: '📄', color: 'bg-red-100 text-red-600' },
  pptx: { icon: '📊', color: 'bg-orange-100 text-orange-600' },
  docx: { icon: '📝', color: 'bg-primary-100 text-primary-600' },
  video: { icon: '🎬', color: 'bg-accent-100 text-accent-600' },
  image: { icon: '🖼️', color: 'bg-pink-100 text-pink-600' },
  folder: { icon: '📁', color: 'bg-amber-100 text-amber-600' },
}

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState<'shared' | 'personal'>('personal')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const folders = activeTab === 'shared' ? sharedFolders : personalFolders

  return (
    <>
      <TeacherHeader title="知识库" />

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 p-6">
        {/* Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-fade-in">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'personal'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                个人知识库
              </span>
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'shared'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                共享知识库
              </span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {activeTab === 'personal' && (
              <>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  新建文件夹
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  上传资源
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info Banner for Shared */}
        {activeTab === 'shared' && (
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
            <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-primary-800 font-medium">共享知识库权限说明</p>
              <p className="text-sm text-primary-600 mt-1">您对共享知识库仅拥有引用权和只读权。如需修改元数据，系统将自动将资源副本存入您的个人库。</p>
            </div>
          </div>
        )}

        {/* Folders Grid */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {activeTab === 'personal' ? '我的文件夹' : '共享文件夹'}
          </h3>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {folders.map((folder, index) => (
              <div
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`bg-white rounded-2xl border ${
                  selectedFolder === folder.id ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-100'
                } p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
                    📁
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">{folder.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                      <span>{folder.fileCount} 个文件</span>
                      <span>·</span>
                      <span>{folder.size}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {folder.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">更新于 {folder.lastUpdate}</span>
                  <button className="text-sm text-primary-600 font-medium hover:text-primary-700">
                    打开
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近文件</h3>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">文件名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">所属文件夹</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">大小</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">上传时间</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {recentFiles.map((file) => (
                  <tr key={file.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${fileTypeIcons[file.type]?.color || 'bg-gray-100'}`}>
                          {fileTypeIcons[file.type]?.icon || '📄'}
                        </span>
                        <span className="font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{file.folder}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{file.size}</td>
                    <td className="py-4 px-4">
                      {file.status === 'ready' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
                          <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                          就绪
                        </span>
                      )}
                      {file.status === 'processing' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          解析中
                        </span>
                      )}
                      {file.status === 'uploading' && (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full transition-all"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{file.progress}%</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">{file.uploadTime}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">存储空间</h3>
            <button className="text-sm text-primary-600 font-medium hover:text-primary-700">升级空间</button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">已使用 8.5 GB / 20 GB</span>
                <span className="font-medium text-gray-900">42.5%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" style={{ width: '42.5%' }} />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
                <span className="text-gray-600">文档 3.2 GB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-accent-500 rounded-full"></span>
                <span className="text-gray-600">视频 4.5 GB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                <span className="text-gray-600">其他 0.8 GB</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">上传资源</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-primary-300 transition-colors cursor-pointer mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium mb-1">拖拽文件到此处，或点击上传</p>
              <p className="text-sm text-gray-500">支持 PDF、PPT、Word、视频、图片等格式</p>
            </div>

            {/* Folder Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择目标文件夹</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">选择文件夹...</option>
                {personalFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button className="flex-1 px-4 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors">
                开始上传
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
