# 主题配置说明文档

## 概述

项目已配置了统一的主题颜色管理系统，目前主色调为**蓝色**。所有颜色都通过配置文件和 CSS 变量管理，方便未来快速切换主题。

## 主题配置文件位置

### 1. TypeScript 配置文件
**位置**: `src/config/theme.ts`

这是主题配置的核心文件，包含所有颜色定义和工具函数。

```typescript
import { colors, getThemeColor, themeConfig } from '@/config/theme';

// 使用预定义的颜色
const primaryColor = colors.primary;        // #3b82f6
const hoverColor = colors.primaryHover;     // #2563eb

// 使用工具函数获取特定色阶
const color300 = getThemeColor('primary', 300);  // #93c5fd
const accentColor = getThemeColor('accent', 500); // #0ea5e9
```

### 2. CSS 变量
**位置**: `src/app/globals.css`

CSS 变量可以在样式文件中直接使用：

```css
/* 使用 CSS 变量 */
.my-button {
  background-color: var(--primary-500);
  border-color: var(--primary-600);
}

.my-card {
  background: var(--td-brand-color-light);
}
```

## 当前主题颜色

### 主色 (Primary - Blue)
- `--primary-50`: #eff6ff (最浅)
- `--primary-100`: #dbeafe
- `--primary-200`: #bfdbfe
- `--primary-300`: #93c5fd
- `--primary-400`: #60a5fa
- `--primary-500`: #3b82f6 (主色)
- `--primary-600`: #2563eb
- `--primary-700`: #1d4ed8 (最深)

### 辅助色 (Accent - Sky)
- `--accent-500`: #0ea5e9
- `--accent-600`: #0284c7

## 如何切换主题

### 方法一：修改配置文件（推荐）

1. 打开 `src/config/theme.ts`
2. 修改 `themeConfig` 对象中的颜色值
3. 运行颜色批量替换脚本（见方法二）

例如，切换回绿色主题：

```typescript
export const themeConfig = {
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',  // 主色
    600: '#059669',
    700: '#047857',
    // ...
  },
  accent: {
    500: '#14b8a6',
    600: '#0d9488',
  },
  // ...
}
```

### 方法二：批量替换颜色

项目提供了批量替换脚本 `scripts/update-colors.sh`，可以快速替换整个项目的颜色。

**使用步骤**：

1. 修改 `scripts/update-colors.sh` 中的替换规则
2. 运行脚本：
   ```bash
   bash scripts/update-colors.sh
   ```

### 方法三：手动修改 CSS 变量

1. 打开 `src/app/globals.css`
2. 在 `:root` 选择器中修改颜色变量
3. 同时更新 `@theme inline` 中的对应颜色

```css
:root {
  /* 修改为你想要的颜色 */
  --primary-500: #10b981;  /* 绿色 */
  --accent-500: #14b8a6;   /* 青色 */

  --td-brand-color: #10b981;
  /* ... */
}
```

## Tailwind CSS 类名使用

项目使用 Tailwind CSS，颜色类名已统一更新为蓝色系：

### 背景色
- `bg-blue-50` 到 `bg-blue-900`
- `bg-sky-500`, `bg-sky-600`

### 文字色
- `text-blue-50` 到 `text-blue-900`
- `text-sky-500`, `text-sky-600`

### 边框色
- `border-blue-50` 到 `border-blue-900`

### 渐变
- `from-blue-500 to-sky-600`
- `from-blue-100 to-sky-100`

## 常用颜色场景

### 按钮
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white">
  点击按钮
</button>
```

### 卡片高亮
```tsx
<div className="border-blue-300 bg-blue-50 text-blue-600">
  高亮卡片
</div>
```

### 图标
```tsx
<svg className="text-blue-600" />
```

### 渐变背景
```tsx
<div className="bg-gradient-to-br from-blue-500 to-sky-600">
  渐变内容
</div>
```

## TDesign 组件主题

TDesign 组件的品牌色已通过 CSS 变量全局覆盖：

```css
--td-brand-color: #3b82f6;
--td-brand-color-hover: #2563eb;
--td-brand-color-active: #1d4ed8;
--td-brand-color-light: #eff6ff;
```

所有 TDesign 组件会自动使用这些颜色。

## 最佳实践

1. **优先使用 CSS 变量**：在自定义样式中使用 `var(--primary-500)` 而不是硬编码颜色值
2. **使用配置文件**：在 TypeScript/JavaScript 中需要颜色时，从 `@/config/theme` 导入
3. **保持一致性**：使用 Tailwind 类名时，统一使用 blue/sky 系列
4. **避免硬编码**：不要在代码中直接写 `#3b82f6` 等十六进制颜色值

## 文件清单

- ✅ `src/config/theme.ts` - 主题配置文件
- ✅ `src/app/globals.css` - CSS 变量定义
- ✅ `scripts/update-colors.sh` - 批量替换脚本
- ✅ `THEME_CONFIG.md` - 本说明文档

## 快速切换示例

### 切换到紫色主题

1. 修改 `src/config/theme.ts`:
```typescript
primary: {
  500: '#a855f7',  // purple-500
  600: '#9333ea',  // purple-600
  700: '#7e22ce',  // purple-700
  // ...
}
```

2. 修改 `scripts/update-colors.sh`:
```bash
sed -i '' 's/blue-500/purple-500/g' "$file"
sed -i '' 's/blue-600/purple-600/g' "$file"
# ...
```

3. 运行脚本：
```bash
bash scripts/update-colors.sh
```

---

**最后更新**: 2025-12-24
