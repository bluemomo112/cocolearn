'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import WorkshopForm from '../../_components/WorkshopForm'
import { mockWorkshops, calculateWorkshopStatus, type Workshop } from '@/data/mockWorkshopData'

export default function EditWorkshopPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [workshop] = useState<Workshop | null>(() =>
    mockWorkshops.find(w => w.id === id) || null
  )

  const handleSave = (data: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!workshop) return

    const idx = mockWorkshops.findIndex(w => w.id === id)
    if (idx !== -1) {
      const status = calculateWorkshopStatus({
        startDate: data.startDate,
        endDate: data.endDate,
        isCancelled: data.isCancelled,
      })
      mockWorkshops[idx] = {
        ...mockWorkshops[idx],
        ...data,
        status,
        updatedAt: new Date().toISOString(),
      }
    }

    alert('工作坊已更新')
    router.push('/admin/workshops')
  }

  if (!workshop) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">未找到该工作坊</h2>
        <Link
          href="/admin/workshops"
          className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
        >
          返回列表
        </Link>
      </div>
    )
  }

  return <WorkshopForm mode="edit" initialData={workshop} onSave={handleSave} />
}
