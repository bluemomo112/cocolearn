'use client'

import TopNavbar from './TopNavbar'

interface PageLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    role: string
    avatar?: string
  }
}

export default function PageLayout({ children, user }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar user={user} />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  )
}
