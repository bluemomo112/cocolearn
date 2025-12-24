'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  badge?: number
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: '工作台',
    href: '/teacher',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'courses',
    label: '我的课程',
    href: '/teacher/courses',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    badge: 3,
  },
  {
    id: 'course-center',
    label: '课程中心',
    href: '/teacher/course-center',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: 'knowledge',
    label: '知识库',
    href: '/teacher/knowledge',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    id: 'insights',
    label: '教学洞察',
    href: '/teacher/insights',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export default function TeacherSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/teacher') {
      return pathname === '/teacher'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-100 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">跨学科平台</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* User Info */}
      <div className={`p-4 border-b border-gray-100 ${collapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-semibold">
              张
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white"></div>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">张老师</p>
              <p className="text-xs text-gray-500 truncate">高级教师 · 物理</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              isActive(item.href)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <span className={isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}>
              {item.icon}
            </span>
            {!collapsed && (
              <>
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        {!collapsed ? (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-semibold text-blue-700">AI 助手</span>
            </div>
            <p className="text-xs text-gray-600 mb-3">智能备课、教案生成、学情分析</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
              开始使用
            </button>
          </div>
        ) : (
          <button className="w-full p-2 bg-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  )
}
