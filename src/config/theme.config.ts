/**
 * 统一主题配置文件
 * 修改此文件中的颜色值和布局值即可全局切换
 *
 * 使用方式：
 * 1. 修改 currentTheme 指向的主题预设
 * 2. 或者直接修改预设中的颜色值/布局值
 *
 * ⚠️ 重要：修改布局配置后，需要同步更新 globals.css 中的 CSS 变量：
 *    - --max-width-container (对应 layout.maxWidth.container)
 *    - --max-width-navbar (对应 layout.maxWidth.navbar)
 *    - --max-width-content (对应 layout.maxWidth.content)
 */

// 主题类型定义
export interface ThemeColors {
  // 主色
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;  // 主色
    600: string;  // hover
    700: string;  // active
    800: string;
    900: string;
  };
  // 辅色 (用于渐变搭配)
  accent: {
    400: string;
    500: string;
    600: string;
  };
  // 活力色 (用于强调、装饰)
  fresh: {
    400: string;
    500: string;
    600: string;
  };
  // 背景色
  background: {
    default: string;      // 默认背景
    gradient: string;     // 渐变背景 (护眼)
    card: string;         // 卡片背景
  };
  // 阴影色 (用于发光效果)
  glow: {
    primary: string;
    accent: string;
  };
}

export interface ThemeLayout {
  maxWidth: {
    container: string;   // 主容器最大宽度
    navbar: string;      // 导航栏最大宽度
    content: string;     // 内容区最大宽度
  };
  padding: {
    container: string;   // 容器内边距 (响应式)
  };
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  layout: ThemeLayout;
}

// ============================================
// 主题预设
// ============================================

/**
 * 绿色主题 - 护眼清新风格
 * 参考: personalized-learning 项目
 */
export const greenTheme: Theme = {
  name: 'green',
  colors: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#10b981',  // 翡翠绿 - 主色
      600: '#059669',  // hover
      700: '#047857',  // active
      800: '#065f46',
      900: '#064e3b',
    },
    accent: {
      400: '#2dd4bf',
      500: '#14b8a6',  // 青绿色
      600: '#0d9488',
    },
    fresh: {
      400: '#a3e635',
      500: '#84cc16',  // 黄绿色 - 活力
      600: '#65a30d',
    },
    background: {
      default: '#ffffff',
      gradient: 'linear-gradient(180deg, #f0fdf6 0%, #fafafa 100%)',
      card: 'rgba(255, 255, 255, 0.8)',
    },
    glow: {
      primary: 'rgba(16, 185, 129, 0.35)',
      accent: 'rgba(20, 184, 166, 0.35)',
    },
  },
  layout: {
    maxWidth: {
      container: '1024px',  // 主容器宽度 (对应 max-w-5xl)
      navbar: '1024px',     // 导航栏宽度
      content: '896px',     // 内容区宽度 (对应 max-w-4xl)
    },
    padding: {
      container: 'px-4 sm:px-6 lg:px-8',
    },
  },
};

/**
 * 蓝色主题 - 商务专业风格
 * 原有配色
 */
export const blueTheme: Theme = {
  name: 'blue',
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // 蓝色 - 主色
      600: '#2563eb',  // hover
      700: '#1d4ed8',  // active
      800: '#1e40af',
      900: '#1e3a8a',
    },
    accent: {
      400: '#38bdf8',
      500: '#0ea5e9',  // 天蓝色
      600: '#0284c7',
    },
    fresh: {
      400: '#a78bfa',
      500: '#8b5cf6',  // 紫色 - 活力
      600: '#7c3aed',
    },
    background: {
      default: '#ffffff',
      gradient: 'linear-gradient(180deg, #f0f9ff 0%, #fafafa 100%)',
      card: 'rgba(255, 255, 255, 0.8)',
    },
    glow: {
      primary: 'rgba(59, 130, 246, 0.35)',
      accent: 'rgba(14, 165, 233, 0.35)',
    },
  },
  layout: {
    maxWidth: {
      container: '1024px',  // 主容器宽度 (对应 max-w-5xl)
      navbar: '1024px',     // 导航栏宽度
      content: '896px',     // 内容区宽度 (对应 max-w-4xl)
    },
    padding: {
      container: 'px-4 sm:px-6 lg:px-8',
    },
  },
};

/**
 * 紫色主题 - 创意优雅风格
 */
export const purpleTheme: Theme = {
  name: 'purple',
  colors: {
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',  // 紫色 - 主色
      600: '#9333ea',  // hover
      700: '#7e22ce',  // active
      800: '#6b21a8',
      900: '#581c87',
    },
    accent: {
      400: '#f472b6',
      500: '#ec4899',  // 粉色
      600: '#db2777',
    },
    fresh: {
      400: '#60a5fa',
      500: '#3b82f6',  // 蓝色 - 活力
      600: '#2563eb',
    },
    background: {
      default: '#ffffff',
      gradient: 'linear-gradient(180deg, #faf5ff 0%, #fafafa 100%)',
      card: 'rgba(255, 255, 255, 0.8)',
    },
    glow: {
      primary: 'rgba(168, 85, 247, 0.35)',
      accent: 'rgba(236, 723, 0.35)',
    },
  },
  layout: {
    maxWidth: {
      container: '1024px',  // 主容器宽度 (对应 max-w-5xl)
      navbar: '1024px',     // 导航栏宽度
      content: '896px',     // 内容区宽度 (对应 max-w-4xl)
    },
    padding: {
      container: 'px-4 sm:px-6 lg:px-8',
    },
  },
};

// ============================================
// 当前使用的主题 - 修改这里切换主题
// ============================================
export const currentTheme: Theme = blueTheme;

// ============================================
// 导出 CSS 变量生成函数
// ============================================
export function generateCSSVariables(theme: Theme): string {
  const { colors } = theme;
  return `
  /* 主色 - Primary */
  --primary-50: ${colors.primary[50]};
  --primary-100: ${colors.primary[100]};
  --primary-200: ${colors.primary[200]};
  --primary-300: ${colors.primary[300]};
  --primary-400: ${colors.primary[400]};
  --primary-500: ${colors.primary[500]};
  --primary-600: ${colors.primary[600]};
  --primary-700: ${colors.primary[700]};
  --primary-800: ${colors.primary[800]};
  --primary-900: ${colors.primary[900]};

  /* 辅色 - Accent */
  --accent-400: ${colors.accent[400]};
  --accent-500: ${colors.accent[500]};
  --accent-600: ${colors.accent[600]};

  /* 活力色 - Fresh */
  --fresh-400: ${colors.fresh[400]};
  --fresh-500: ${colors.fresh[500]};
  --fresh-600: ${colors.fresh[600]};

  /* 背景色 */
  --bg-default: ${colors.background.default};
  --bg-gradient: ${colors.background.gradient};
  --bg-card: ${colors.background.card};

  /* 发光色 */
  --glow-primary: ${colors.glow.primary};
  --glow-accent: ${colors.glow.accent};

  /* TDesign 品牌色覆盖 */
  --td-brand-color: ${colors.primary[500]};
  --td-brand-color-hover: ${colors.primary[600]};
  --td-brand-color-active: ${colors.primary[700]};
  --td-brand-color-light: ${colors.primary[50]};
  `;
}

// 导出布局配置
export const layout = currentTheme.layout;
export const colors = currentTheme.colors;
