# 快速主题切换参考

## 🎨 当前主题：蓝色 (Blue)

### 一分钟快速切换主题

#### 步骤 1：修改主题配置
编辑 `src/config/theme.ts`，替换颜色值：

```typescript
export const themeConfig = {
  primary: {
    // 将这些十六进制颜色值替换为你想要的颜色
    500: '#你的主色',
    600: '#你的深色',
    700: '#你的最深色',
    // ...
  },
}
```

#### 步骤 2：更新 CSS 变量
编辑 `src/app/globals.css` 的 `:root` 部分：

```css
:root {
  --primary-500: #你的主色;
  --primary-600: #你的深色;
  --td-brand-color: #你的主色;
  /* ... */
}
```

#### 步骤 3：批量替换 Tailwind 类名
编辑 `scripts/update-colors.sh`，修改替换规则后运行：

```bash
bash scripts/update-colors.sh
```

---

## 🎯 预设主题配置

### 绿色主题（原主题）
```typescript
primary: {
  50: '#ecfdf5',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
}
accent: {
  500: '#14b8a6',
}
```
Tailwind 类名：`emerald-*` + `teal-*`

### 蓝色主题（当前）
```typescript
primary: {
  50: '#eff6ff',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
}
accent: {
  500: '#0ea5e9',
}
```
Tailwind 类名：`blue-*` + `sky-*`

### 紫色主题
```typescript
primary: {
  50: '#faf5ff',
  500: '#a855f7',
  600: '#9333ea',
  700: '#7e22ce',
}
accent: {
  500: '#d946ef',
}
```
Tailwind 类名：`purple-*` + `fuchsia-*`

### 红色主题
```typescript
primary: {
  50: '#fef2f2',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
}
accent: {
  500: '#f97316',
}
```
Tailwind 类名：`red-*` + `orange-*`

---

## 📝 常用替换命令

如果要手动批量替换（macOS/Linux）：

```bash
# 蓝色 -> 紫色
find src -type f -name "*.tsx" -exec sed -i '' 's/blue-/purple-/g' {} +
find src -type f -name "*.tsx" -exec sed -i '' 's/sky-/fuchsia-/g' {} +

# 蓝色 -> 绿色
find src -type f -name "*.tsx" -exec sed -i '' 's/blue-/emerald-/g' {} +
find src -type f -name "*.tsx" -exec sed -i '' 's/sky-/teal-/g' {} +

# 蓝色 -> 红色
find src -type f -name "*.tsx" -exec sed -i '' 's/blue-/red-/g' {} +
find src -type f -name "*.tsx" -exec sed -i '' 's/sky-/orange-/g' {} +
```

---

## 🔍 验证主题是否生效

```bash
# 检查蓝色主题使用数量
grep -r "blue-" src --include="*.tsx" | wc -l

# 检查是否还有旧的绿色主题
grep -r "emerald-" src --include="*.tsx"

# 查看 CSS 变量
cat src/app/globals.css | grep "primary-500"
```

---

## ⚡ 重要文件清单

- **主题配置**: `src/config/theme.ts`
- **CSS 变量**: `src/app/globals.css`
- **批量替换脚本**: `scripts/update-colors.sh`
- **完整文档**: `THEME_CONFIG.md`
- **本参考卡**: `QUICK_THEME_REFERENCE.md`

---

**提示**: 保留功能性颜色（如学科分类的 `green-100`、状态指示的 `red-500` 等），只替换主题相关的颜色。
