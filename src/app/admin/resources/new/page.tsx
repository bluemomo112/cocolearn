'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ResourceForm from '../_components/ResourceForm'
import { mockResources, type Resource, type ResourceSection } from '@/data/mockResourceHubData'

function NewResourceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultSection = (searchParams.get('section') as ResourceSection) || 'master-class'

  const handleSave = (data: Omit<Resource, 'id' | 'sortWeight' | 'createdAt' | 'updatedAt' | 'createdBy'>, publish: boolean) => {
    // Mock: 加入数据集
    const now = new Date().toISOString()
    const maxWeight = Math.max(...mockResources.filter(r => r.section === data.section).map(r => r.sortWeight), 0)
    const newResource: Resource = {
      ...data,
      id: `${data.section}-${Date.now()}`,
      sortWeight: maxWeight + 10,
      createdAt: now,
      updatedAt: now,
      createdBy: 'admin-current'
    }
    mockResources.push(newResource)

    alert(publish ? '资源已发布' : '草稿已保存')
    router.push('/admin/resources')
  }

  return (
    <ResourceForm
      mode="create"
      defaultSection={defaultSection}
      onSave={handleSave}
    />
  )
}

export default function NewResourcePage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">加载中...</div>}>
      <NewResourceContent />
    </Suspense>
  )
}
