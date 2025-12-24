/**
 * 主题配置文件
 * 在这里统一管理所有颜色主题，方便未来切换
 */

export const themeConfig = {
  // 主色调 - 蓝色主题 (Blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // 主色
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // 辅助色 - 天蓝色 (Sky)
  accent: {
    500: '#0ea5e9',
    600: '#0284c7',
  },

  // TDesign 品牌色
  brand: {
    color: '#3b82f6',
    hover: '#2563eb',
    active: '#1d4ed8',
    light: '#eff6ff',
  },
} as const;

/**
 * 获取主题色的工具函数
 * 用法示例：
 * - getThemeColor('primary', 500) => '#3b82f6'
 * - getThemeColor('accent', 500) => '#0ea5e9'
 */
export function getThemeColor(type: 'primary' | 'accent', shade: keyof typeof themeConfig.primary | keyof typeof themeConfig.accent): string {
  if (type === 'accent') {
    return themeConfig.accent[shade as keyof typeof themeConfig.accent];
  }
  return themeConfig.primary[shade as keyof typeof themeConfig.primary];
}

/**
 * 导出常用的颜色值供直接使用
 */
export const colors = {
  primary: themeConfig.primary[500],
  primaryHover: themeConfig.primary[600],
  primaryActive: themeConfig.primary[700],
  primaryLight: themeConfig.primary[50],
  accent: themeConfig.accent[500],
  accentHover: themeConfig.accent[600],
};
