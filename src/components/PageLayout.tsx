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
    <div className="h-screen flex flex-col bg-gray-50">
      <TopNavbar user={user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
