'use client'

import { useState, useEffect } from 'react'
import { applyTheme, themes } from './ThemeProvider'

export type ThemeName = 'green' | 'blue' | 'purple'

interface ThemeOption {
  name: ThemeName
  label: string
  color: string
  description: string
}

const themeOptions: ThemeOption[] = [
  {
    name: 'green',
    label: '绿色',
    color: '#10b981',
    description: '护眼清新',
  },
  {
    name: 'blue',
    label: '蓝色',
    color: '#3b82f6',
    description: '商务专业',
  },
  {
    name: 'purple',
    label: '紫色',
    color: '#a855f7',
    description: '创意优雅',
  },
]

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('blue')
  const [showMenu, setShowMenu] = useState(false)

  // 从 localStorage 读取主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeName
    if (savedTheme && ['green', 'blue', 'purple'].includes(savedTheme)) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  const handleThemeChange = (themeName: ThemeName) => {
    setCurrentTheme(themeName)
    setShowMenu(false)

    // 保存到 localStorage
    localStorage.setItem('theme', themeName)

    // 应用主题
    const theme = themes[themeName]
    if (theme) {
      applyTheme(theme)
    }
  }

  const currentThemeOption = themeOptions.find(t => t.name === currentTheme) || themeOptions[1]

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
        title="切换主题"
      >
        <div
          className="w-5 h-5 rounded-full border-2 border-white shadow-md"
          style={{ backgroundColor: currentThemeOption.color }}
        />
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500">选择主题</p>
            </div>
            <div className="py-1">
              {themeOptions.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm w-full text-left transition-colors ${
                    currentTheme === theme.name
                      ? 'bg-gray-50 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: theme.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{theme.label}</div>
                    <div className="text-xs text-gray-500">{theme.description}</div>
                  </div>
                  {currentTheme === theme.name && (
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
