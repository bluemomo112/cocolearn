# Cross-New 项目部署指南

## 环境变量配置

### 本地开发环境

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# GLM API 配置（智谱 AI）
GLM_API_KEY=your_actual_api_key_here
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/

# 启用 AI 功能
NEXT_PUBLIC_ENABLE_AI=true
```

### Vercel 生产环境（静态部署，不含 AI 功能）

在 Vercel 部署时，**不需要配置任何环境变量**。

如果未来需要启用 AI 功能，在 Vercel 项目设置中添加：
- `GLM_API_KEY`: 你的智谱 AI API 密钥
- `NEXT_PUBLIC_ENABLE_AI`: 设置为 `true`

## 部署到 Vercel

### 方法 1: 通过 GitHub 连接（推荐）

1. 将代码推送到 GitHub
2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "Add New Project"
4. 选择你的 GitHub 仓库
5. 保持默认配置，点击 "Deploy"

### 方法 2: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

## 功能说明

### AI 功能控制

- **客户端检查**: 通过 `NEXT_PUBLIC_ENABLE_AI` 环境变量控制
- **服务端检查**: 通过 `GLM_API_KEY` 是否配置来判断

当 AI 功能未启用时：
- 客观题测验仍可正常完成，只是不会显示 AI 详细分析
- 所有静态页面和基础功能正常工作

### 项目结构

```
cross-new/
├── src/
│   ├── app/              # Next.js 应用路由
│   ├── lib/              # 工具函数和配置
│   │   ├── ai-config.ts  # AI 功能配置
│   │   └── glm-client.ts # GLM API 客户端
│   └── types/            # TypeScript 类型定义
├── .env                  # 本地环境变量（不提交到 Git）
├── .env.example          # 环境变量示例
└── README.md             # 项目说明
```

## 注意事项

1. **安全性**:
   - `.env` 文件已在 `.gitignore` 中，不会被提交到 Git
   - 不要在代码中硬编码 API 密钥

2. **环境隔离**:
   - 本地开发可以启用所有功能
   - Vercel 生产环境可以选择性启用功能

3. **维护性**:
   - 本地和线上使用同一套代码
   - 通过环境变量控制功能开关
   - 不需要维护两个版本
