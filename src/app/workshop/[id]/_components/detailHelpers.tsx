'use client'

// 工作坊详情页共享的小组件与工具函数

export function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const sameDay = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth() && s.getDate() === e.getDate()
  const startStr = `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日`
  const endStr = `${e.getFullYear()}年${e.getMonth() + 1}月${e.getDate()}日`
  return sameDay ? startStr : `${startStr} — ${endStr}`
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AvatarBubble({ name, avatar, size = 40 }: { name: string; avatar?: string; size?: number }) {
  const colors = ['bg-primary-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500']
  const colorIdx = (name.charCodeAt(0) || 0) % colors.length
  return avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatar} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div
      className={`${colors[colorIdx]} text-white rounded-full flex items-center justify-center font-medium flex-shrink-0`}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.4) }}
    >
      {name.trim().charAt(0)}
    </div>
  )
}

export function SectionBlock({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

export function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}
