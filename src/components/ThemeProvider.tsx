'use client'

import { useEffect } from 'react'
import { greenTheme, blueTheme, purpleTheme, type Theme } from '@/config/theme.config'

const themes: Record<string, Theme> = {
  green: greenTheme,
  blue: blueTheme,
  purple: purpleTheme,
}

// 应用主题的函数
function applyTheme(theme: Theme) {
  const { colors } = theme
  const root = document.documentElement

  // 主色
  root.style.setProperty('--primary-50', colors.primary[50])
  root.style.setProperty('--primary-100', colors.primary[100])
  root.style.setProperty('--primary-200', colors.primary[200])
  root.style.setProperty('--primary-300', colors.primary[300])
  root.style.setProperty('--primary-400', colors.primary[400])
  root.style.setProperty('--primary-500', colors.primary[500])
  root.style.setProperty('--primary-600', colors.primary[600])
  root.style.setProperty('--primary-700', colors.primary[700])
  root.style.setProperty('--primary-800', colors.primary[800])
  root.style.setProperty('--primary-900', colors.primary[900])

  // 辅色
  root.style.setProperty('--accent-400', colors.accent[400])
  root.style.setProperty('--accent-500', colors.accent[500])
  root.style.setProperty('--accent-600', colors.accent[600])

  // 活力色
  root.style.setProperty('--fresh-400', colors.fresh[400])
  root.style.setProperty('--fresh-500', colors.fresh[500])
  root.style.setProperty('--fresh-600', colors.fresh[600])

  // 背景色
  root.style.setProperty('--bg-default', colors.background.default)
  root.style.setProperty('--bg-gradient', colors.background.gradient)
  root.style.setProperty('--bg-card', colors.background.card)

  // 发光色
  root.style.setProperty('--glow-primary', colors.glow.primary)
  root.style.setProperty('--glow-accent', colors.glow.accent)

  // TDesign 品牌色
  root.style.setProperty('--td-brand-color', colors.primary[500])
  root.style.setProperty('--td-brand-color-hover', colors.primary[600])
  root.style.setProperty('--td-brand-color-active', colors.primary[700])
  root.style.setProperty('--td-brand-color-light', colors.primary[50])
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 从 localStorage 读取主题
    const savedTheme = localStorage.getItem('theme') || 'blue'
    const theme = themes[savedTheme] || blueTheme

    // 应用主题
    applyTheme(theme)
  }, [])

  return <>{children}</>
}

// 导出应用主题的函数，供 ThemeSwitcher 使用
export { applyTheme, themes }
