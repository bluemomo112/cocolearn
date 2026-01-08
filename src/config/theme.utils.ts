/**
 * 主题工具函数
 * 提供在 React 组件中使用主题的便捷方法
 */

import { currentTheme, colors, layout } from './theme.config';

/**
 * 获取主题色的 Tailwind 类名
 * 用于替换硬编码的颜色类名
 */
export const themeClasses = {
  // 背景色
  bg: {
    primary: {
      50: 'bg-primary-50',
      100: 'bg-primary-100',
      200: 'bg-primary-200',
      500: 'bg-primary-500',
      600: 'bg-primary-600',
      700: 'bg-primary-700',
    },
    accent: {
      500: 'bg-accent-500',
      600: 'bg-accent-600',
    },
    fresh: {
      500: 'bg-fresh-500',
      600: 'bg-fresh-600',
    },
  },
  // 文字色
  text: {
    primary: {
      500: 'text-primary-500',
      600: 'text-primary-600',
      700: 'text-primary-700',
    },
    accent: {
      500: 'text-accent-500',
      600: 'text-accent-600',
    },
    fresh: {
      500: 'text-fresh-500',
      600: 'text-fresh-600',
    },
  },
  // 边框色
  border: {
    primary: {
      200: 'border-primary-200',
      300: 'border-primary-300',
      500: 'border-primary-500',
    },
    accent: {
      500: 'border-accent-500',
    },
  },
  // 渐变
  gradient: {
    primary: 'gradient-primary',
    fresh: 'gradient-fresh',
    text: 'gradient-text',
    textFresh: 'gradient-text-fresh',
  },
  // 悬停
  hover: {
    bgPrimary50: 'hover:bg-primary-50',
    bgPrimary100: 'hover:bg-primary-100',
    textPrimary600: 'hover:text-primary-600',
    textPrimary700: 'hover:text-primary-700',
  },
} as const;

/**
 * 颜色映射：将 blue-* 类名转换为 primary-* 类名
 * 用于快速迁移旧代码
 */
export function migrateColorClass(className: string): string {
  return className
    .replace(/\bblue-50\b/g, 'primary-50')
    .replace(/\bblue-100\b/g, 'primary-100')
    .replace(/\bblue-200\b/g, 'primary-200')
    .replace(/\bblue-300\b/g, 'primary-300')
    .replace(/\bblue-400\b/g, 'primary-400')
    .replace(/\bblue-500\b/g, 'primary-500')
    .replace(/\bblue-600\b/g, 'primary-600')
    .replace(/\bblue-700\b/g, 'primary-700')
    .replace(/\bblue-800\b/g, 'primary-800')
    .replace(/\bblue-900\b/g, 'primary-900')
    .replace(/\bsky-500\b/g, 'accent-500')
    .replace(/\bsky-600\b/g, 'accent-600');
}

/**
 * 获取布局配置
 */
export const layoutConfig = {
  maxWidth: {
    container: `max-w-[${layout.maxWidth.container}]`,
    navbar: `max-w-[${layout.maxWidth.navbar}]`,
    content: `max-w-[${layout.maxWidth.content}]`,
  },
  containerClass: 'main-container',
};

/**
 * 常用组合类名
 */
export const themeStyles = {
  // 主按钮
  buttonPrimary: 'btn-primary px-4 py-2 rounded-lg font-medium',
  // 次按钮
  buttonSecondary: 'btn-secondary px-4 py-2 rounded-lg font-medium',
  // 卡片
  card: 'card p-6',
  // 玻璃卡片
  glassCard: 'glass-card p-6 rounded-2xl',
  // 导航激活项
  navActive: 'bg-primary-50 text-primary-600',
  // 导航悬停
  navHover: 'hover:bg-primary-50 hover:text-primary-600',
  // 徽章
  badgePrimary: 'badge-primary px-2 py-1 rounded-full text-xs',
  badgeAccent: 'badge-accent px-2 py-1 rounded-full text-xs',
  badgeFresh: 'badge-fresh px-2 py-1 rounded-full text-xs',
};

// 导出当前主题名称
export const themeName = currentTheme.name;

// 导出颜色值（用于需要直接使用颜色值的场景，如 style 属性）
export { colors, layout };
