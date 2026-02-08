# 简繁语言切换功能说明

## 功能概述

项目已集成简体中文和繁体中文的自动切换功能，使用 `opencc-js` 库实现实时转换。

## 使用方法

### 1. 在组件中使用翻译

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

export default function MyComponent() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('欢迎使用')}</h1>
      <p>{t('这是一个示例文本')}</p>
      <button onClick={() => setLanguage(language === 'zh-CN' ? 'zh-TW' : 'zh-CN')}>
        切换语言
      </button>
    </div>
  );
}
```

### 2. 语言切换器

顶部导航栏已经集成了语言切换按钮（🌐 图标），点击即可在简体和繁体之间切换。

## 工作原理

1. **自动转换**：所有通过 `t()` 函数包裹的文本都会自动转换
   - 简体模式：显示原文
   - 繁体模式：自动转换为繁体

2. **持久化**：语言偏好会保存在浏览器的 localStorage 中，下次访问时自动恢复

3. **实时切换**：切换语言后，页面会立即更新，无需刷新

## 示例转换

| 简体中文 | 繁体中文 |
|---------|---------|
| 课程管理 | 課程管理 |
| 教师中心 | 教師中心 |
| 资源库 | 資源庫 |
| 设置 | 設置 |
| 保存 | 儲存 |

## 已支持的组件

- ✅ TopNavbar（顶部导航栏）
- ✅ LanguageSwitch（语言切换器）

## 扩展到其他组件

要在其他组件中启用语言切换，只需：

1. 导入 `useLanguage` hook
2. 使用 `t()` 函数包裹所有文本

```tsx
const { t } = useLanguage();

// 之前
<button>保存</button>

// 之后
<button>{t('保存')}</button>
```

## 技术栈

- **opencc-js**: 开源中文转换库
- **React Context**: 全局状态管理
- **localStorage**: 语言偏好持久化

## 注意事项

1. 所有需要翻译的文本都必须通过 `t()` 函数包裹
2. 转换是基于字符映射的，大部分情况下准确率很高
3. 如果遇到专业术语转换不准确，可以后续添加自定义词典
