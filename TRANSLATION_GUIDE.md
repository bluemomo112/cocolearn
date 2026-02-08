# 为组件添加简繁转换支持 - 快速指南

## 已完成的组件

✅ TopNavbar - 顶部导航栏
✅ LanguageSwitch - 语言切换器
✅ SpaceManager - 学习空间管理器

## 待处理的组件

- [ ] Onboarding.tsx
- [ ] SelfStudyWorkbench.tsx
- [ ] SettingsModal.tsx

## 添加步骤（3步）

### 1. 导入 useLanguage hook

```tsx
import { useLanguage } from '@/contexts/LanguageContext';
```

### 2. 在组件中使用 hook

```tsx
export default function MyComponent() {
  const { t } = useLanguage();
  // ... 其他代码
}
```

### 3. 包裹所有中文文本

**之前：**
```tsx
<h1>欢迎使用</h1>
<button>保存</button>
<p>这是一段描述文字</p>
```

**之后：**
```tsx
<h1>{t('欢迎使用')}</h1>
<button>{t('保存')}</button>
<p>{t('这是一段描述文字')}</p>
```

## 特殊情况处理

### 1. 动态文本拼接

**之前：**
```tsx
<span>{count} 个项目</span>
```

**之后：**
```tsx
<span>{count} {t('个项目')}</span>
```

### 2. 条件文本

**之前：**
```tsx
{isActive ? '已激活' : '未激活'}
```

**之后：**
```tsx
{isActive ? t('已激活') : t('未激活')}
```

### 3. 数组中的文本

**之前：**
```tsx
const options = ['选项1', '选项2', '选项3'];
```

**之后：**
```tsx
const options = [t('选项1'), t('选项2'), t('选项3')];
```

## 注意事项

1. **不要翻译**：
   - 变量名、函数名
   - 代码注释（可选）
   - 日志输出（可选）
   - API 端点、URL

2. **需要翻译**：
   - 所有用户可见的文本
   - 按钮标签
   - 标题和描述
   - 提示信息
   - 错误消息

## 测试

修改完成后：
1. 启动开发服务器：`npm run dev`
2. 打开浏览器访问页面
3. 点击顶部导航栏的语言切换按钮（🌐）
4. 检查所有文本是否正确转换

## 转换效果示例

| 简体中文 | 繁体中文 |
|---------|---------|
| 学习空间 | 學習空間 |
| 管理你的自主学习项目 | 管理你的自主學習項目 |
| 新建学习空间 | 新建學習空間 |
| 平均进度 | 平均進度 |
| 本周活跃 | 本週活躍 |
| 确认删除？ | 確認刪除？ |
| 删除后将无法恢复 | 刪除後將無法恢復 |

## 需要帮助？

如果遇到问题，可以参考已完成的组件：
- `src/components/TopNavbar.tsx`
- `src/components/LanguageSwitch.tsx`
- `src/app/teacher/self-study/components/SpaceManager.tsx`
