'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import ResourceForm from '../../_components/ResourceForm'
import { mockResources, type Resource } from '@/data/mockResourceHubData'

export default function EditResourcePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [resource] = useState<Resource | null>(() => {
    return mockResources.find(r => r.id === id) || null
  })

  const handleSave = (data: Omit<Resource, 'id' | 'sortWeight' | 'createdAt' | 'updatedAt' | 'createdBy'>, publish: boolean) => {
    if (!resource) return

    // Mock: 更新数据
    const index = mockResources.findIndex(r => r.id === id)
    if (index !== -1) {
      mockResources[index] = {
        ...mockResources[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
    }

    alert(publish ? '资源已发布' : '草稿已保存')
    router.push('/admin/resources')
  }

  if (!resource) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">未找到该资源</h2>
        <p className="text-gray-500 mb-6">资源可能已被删除</p>
        <button
          onClick={() => router.push('/admin/resources')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          返回列表
        </button>
      </div>
    )
  }

  return (
    <ResourceForm
      mode="edit"
      initialData={resource}
      onSave={handleSave}
    />
  )
}
