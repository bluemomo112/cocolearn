'use client'

import { useRouter } from 'next/navigation'
import WorkshopForm from '../_components/WorkshopForm'
import { mockWorkshops, calculateWorkshopStatus, type Workshop } from '@/data/mockWorkshopData'

export default function NewWorkshopPage() {
  const router = useRouter()

  const handleSave = (data: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const now = new Date().toISOString()
    const status = calculateWorkshopStatus({
      startDate: data.startDate,
      endDate: data.endDate,
      isCancelled: data.isCancelled,
    })

    const newWorkshop: Workshop = {
      ...data,
      id: `ws_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      status,
      createdAt: now,
      updatedAt: now,
    }

    // Mock: 直接推入数据数组（页面刷新后会重置，符合原型定位）
    mockWorkshops.push(newWorkshop)

    alert('工作坊已创建')
    router.push('/admin/workshops')
  }

  return <WorkshopForm mode="create" onSave={handleSave} />
}
