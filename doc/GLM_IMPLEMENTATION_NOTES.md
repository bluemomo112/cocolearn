# 跨学科学习平台 - AI Agent系统实现说明

## 项目概述

本项目是一个基于Next.js 16的跨学科学习平台，集成了智谱AI的GLM-4模型，通过多Agent协作实现智能化的学习辅导、任务评估和元认知监控。

## 已完成的工作

### 1. 核心架构搭建

#### 1.1 类型定义系统 (`src/types/shared-context.ts`)
- 定义了完整的共享上下文类型系统
- 包含会话、对话、资源、任务、能力画像、行为数据等核心数据结构
- 为三个Agent（助教、评估器、元认知监控）定义了专用上下文类型

#### 1.2 资源文件提取 (`src/lib/resource-parser.ts`)
- 实现了docx和pptx文件的文本提取功能
- 使用`mammoth`库处理Word文档
- 使用`pptx-parser`库处理PowerPoint文档
- 提取的文本内容存储在Map中供AI使用

#### 1.3 GLM API客户端 (`src/lib/glm-client.ts`)
- 封装了智谱AI的GLM-4 API调用
- 支持流式和非流式响应
- 兼容OpenAI SDK接口
- 配置了temperature、max_tokens等参数

### 2. Agent系统实现

#### 2.1 Agent协调器 (`src/lib/agents/agent-coordinator.ts`)
核心功能：
- `handleUserMessage()`: 处理学生对话，调用助教Agent
- `handleTaskSubmission()`: 处理任务提交，调用评估Agent
- `runMetacognitionAnalysis()`: 异步运行元认知分析
- `parseCompetencyMarkers()`: 解析AI回复中的能力标记
- `parseAssessmentResult()`: 解析任务评估结果

关键修复：
- 添加了`stream: false`参数确保返回ChatCompletion类型
- 使用`if ('choices' in response)`类型守卫处理响应

#### 2.2 上下文构建器 (`src/lib/agents/context-builder.ts`)
为每个Agent构建专用上下文：
- `buildTutorContext()`: 助教上下文（包含资源内容、任务状态、对话历史）
- `buildAssessorContext()`: 评估器上下文（包含任务详情、学生答案、相关资源）
- `buildMetacognitionContext()`: 元认知上下文（包含行为数据、能力画像）

#### 2.3 Prompt构建器 (`src/lib/agents/prompt-builder.ts`)
为每个Agent生成专业的System Prompt：
- `buildTutorPrompt()`: 助教prompt，包含资源内容摘要、任务状态、引导策略
- `buildAssessorPrompt()`: 评估prompt，包含评分标准、能力维度
- `buildMetacognitionPrompt()`: 元认知prompt，包含监控指标、识别信号

### 3. API路由实现 (`src/app/api/chat/route.ts`)

#### 3.1 会话管理
- 使用Map存储会话上下文（生产环境建议使用Redis或数据库）
- 自动初始化新会话，提取资源内容
- 维护对话历史、任务状态、能力画像

#### 3.2 请求处理
- `action: 'chat'`: 处理普通对话
- `action: 'submit_task'`: 处理任务提交
- 异步触发元认知分析（不阻塞响应）
- 实时更新能力画像

### 4. 前端集成 (`src/app/student/workbench/page.tsx`)

#### 4.1 API对接
- 替换mock数据为真实API调用
- 添加sessionId管理
- 实现loading状态和错误处理

#### 4.2 能力追踪
- 添加`competencyProfile`状态
- 实时更新能力雷达图
- 在对话和任务提交后更新能力数据

#### 4.3 任务提交
- 修改`TaskExpandedCard`收集学生答案
- 支持测验选项和作业文本提交
- 显示提交状态和评估反馈

## 技术栈

- **框架**: Next.js 16 (App Router + Turbopack)
- **语言**: TypeScript
- **AI模型**: 智谱AI GLM-4
- **状态管理**: Zustand + Immer
- **UI组件**: Lucide React Icons
- **文件处理**: mammoth, pptx-parser
- **API**: OpenAI SDK (兼容智谱AI)

## 核心数据流

### 对话流程
```
用户输入
  → POST /api/chat (action: 'chat')
  → AgentCoordinator.handleUserMessage()
  → buildTutorContext() 构建上下文
  → buildTutorPrompt() 生成prompt（包含资源内容）
  → chatWithGLM() 调用GLM API
  → 解析能力标记
  → 更新能力画像
  → 返回AI回复 + 能力更新
  → 前端更新UI和雷达图
```

### 任务提交流程
```
学生提交答案
  → POST /api/chat (action: 'submit_task')
  → AgentCoordinator.handleTaskSubmission()
  → buildAssessorContext() 构建评估上下文
  → buildAssessorPrompt() 生成评估prompt
  → chatWithGLM() 调用GLM API
  → 解析评估结果（JSON格式）
  → 提取能力评估
  → 更新能力画像
  → 返回评估反馈 + 能力更新
  → 前端显示评估结果
```

### 资源内容提供流程
```
会话初始化
  → extractAllResources() 提取所有资源文本
  → 存储在 SharedContext.resources.contents (Map)
  → buildTutorContext() 时包含资源内容
  → formatResourceSummaries() 格式化为Markdown
  → 嵌入到 System Prompt
  → GLM可以基于资源内容回答问题
```

## 已解决的问题

### 1. 依赖缺失
**问题**: zustand和immer未安装
**解决**: `npm install zustand immer`

### 2. TypeScript类型错误
**问题**: GLM API响应类型模糊（Stream | ChatCompletion）
**解决**:
- 所有调用添加`stream: false`参数
- 使用`if ('choices' in response)`类型守卫
- 更新三个方法：handleUserMessage, handleTaskSubmission, runMetacognitionAnalysis

### 3. 前端mock数据
**问题**: 前端使用mock数据，未连接真实API
**解决**:
- 实现fetch调用/api/chat
- 添加sessionId和loading状态
- 实现能力画像实时更新

## 如何继续开发

### 1. 短期优化（1-2周）

#### 1.1 会话持久化
**当前问题**: 会话存储在内存Map中，服务重启后丢失
**建议方案**:
```typescript
// 使用Redis存储会话
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// 保存会话
await redis.set(`session:${sessionId}`, JSON.stringify(context), {
  ex: 3600 * 24 // 24小时过期
});

// 读取会话
const contextStr = await redis.get(`session:${sessionId}`);
const context = contextStr ? JSON.parse(contextStr) : null;
```

**相关文件**: `src/app/api/chat/route.ts:8`

#### 1.2 资源内容缓存
**当前问题**: 每次会话初始化都重新提取资源内容
**建议方案**:
```typescript
// 使用文件系统缓存或Redis
import fs from 'fs/promises';
import path from 'path';

async function getCachedResourceContent(resourceId: string): Promise<string | null> {
  const cacheDir = path.join(process.cwd(), '.cache', 'resources');
  const cachePath = path.join(cacheDir, `${resourceId}.txt`);

  try {
    return await fs.readFile(cachePath, 'utf-8');
  } catch {
    return null;
  }
}

async function setCachedResourceContent(resourceId: string, content: string) {
  const cacheDir = path.join(process.cwd(), '.cache', 'resources');
  await fs.mkdir(cacheDir, { recursive: true });
  const cachePath = path.join(cacheDir, `${resourceId}.txt`);
  await fs.writeFile(cachePath, content, 'utf-8');
}
```

**相关文件**: `src/lib/resource-parser.ts`

#### 1.3 错误处理增强
**当前问题**: API错误处理较简单，缺少重试机制
**建议方案**:
```typescript
// 添加重试逻辑
async function chatWithGLMWithRetry(
  systemPrompt: string,
  messages: Message[],
  options: any,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await chatWithGLM(systemPrompt, messages, options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

**相关文件**: `src/lib/glm-client.ts`

### 2. 中期功能（2-4周）

#### 2.1 实时元认知反馈
**当前状态**: 元认知分析是异步的，结果只打印到console
**建议实现**: 使用WebSocket或Server-Sent Events推送到前端

```typescript
// 使用SSE推送元认知结果
// src/app/api/metacognition/route.ts
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');

  const stream = new ReadableStream({
    async start(controller) {
      // 监听元认知更新
      const interval = setInterval(() => {
        const result = getMetacognitionResult(sessionId);
        if (result) {
          controller.enqueue(`data: ${JSON.stringify(result)}\n\n`);
        }
      }, 1000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**前端接收**:
```typescript
// src/app/student/workbench/page.tsx
useEffect(() => {
  const eventSource = new EventSource(`/api/metacognition?sessionId=${sessionId}`);

  eventSource.onmessage = (event) => {
    const result = JSON.parse(event.data);
    // 更新右侧栏的AI观察
    setMetacognitionObservations(prev => [...prev, result]);
  };

  return () => eventSource.close();
}, [sessionId]);
```

#### 2.2 能力画像可视化增强
**当前状态**: 只有简单的雷达图
**建议添加**:
- 能力趋势图（折线图显示历史变化）
- 能力详情面板（展开查看具体证据）
- 跨课程对比（如果有多门课程数据）

**相关文件**: `src/app/student/components/CompetencyRadarChart.tsx`

#### 2.3 任务评估详情
**当前状态**: 评估反馈只显示文本
**建议添加**:
- 评分细节展示（各维度得分）
- 优秀答案示例对比
- 改进建议的具体指导

**相关文件**: `src/app/student/workbench/page.tsx:223-244`

### 3. 长期规划（1-3个月）

#### 3.1 数据库设计
**建议使用**: PostgreSQL + Prisma ORM

**核心表结构**:
```prisma
// schema.prisma
model Student {
  id        String   @id @default(cuid())
  name      String
  sessions  Session[]
  competencyProfiles CompetencyProfile[]
}

model Session {
  id          String   @id @default(cuid())
  studentId   String
  courseId    String
  startTime   DateTime
  endTime     DateTime?
  messages    Message[]
  student     Student  @relation(fields: [studentId], references: [id])
}

model Message {
  id          String   @id @default(cuid())
  sessionId   String
  role        String
  content     String   @db.Text
  timestamp   DateTime
  agentType   String?
  session     Session  @relation(fields: [sessionId], references: [id])
}

model CompetencyProfile {
  id                      String   @id @default(cuid())
  studentId               String
  courseId                String
  criticalThinking        Float
  informationSynthesis    Float
  metacognition           Float
  lastUpdated             DateTime
  student                 Student  @relation(fields: [studentId], references: [id])
}

model TaskSubmission {
  id          String   @id @default(cuid())
  sessionId   String
  taskId      String
  answer      String   @db.Text
  score       Int?
  assessment  Json?
  submittedAt DateTime
}
```

**迁移步骤**:
1. 安装Prisma: `npm install prisma @prisma/client`
2. 初始化: `npx prisma init`
3. 定义schema
4. 生成迁移: `npx prisma migrate dev`
5. 更新API路由使用Prisma Client

#### 3.2 多课程支持
**当前状态**: 硬编码单一课程
**建议实现**:
- 课程管理系统（创建、编辑、发布课程）
- 课程模板（不同学科的prompt模板）
- 学生选课和进度追踪

#### 3.3 教师端功能
**建议功能**:
- 课程配置界面（上传资源、设计任务、设置评分标准）
- 学生学习数据看板（能力画像、学习时长、任务完成率）
- AI助教行为调优（调整prompt、温度参数等）

#### 3.4 性能优化
**建议方向**:
- 资源内容分块加载（避免一次性加载所有内容到prompt）
- 使用向量数据库（如Pinecone）存储资源内容，按需检索相关片段
- 实现prompt缓存（相同上下文复用）
- 添加CDN加速静态资源

### 4. 测试建议

#### 4.1 单元测试
```typescript
// __tests__/lib/agents/agent-coordinator.test.ts
import { AgentCoordinator } from '@/lib/agents/agent-coordinator';

describe('AgentCoordinator', () => {
  it('should parse competency markers correctly', () => {
    const coordinator = new AgentCoordinator(mockContext);
    const response = '回答内容<!-- COMPETENCY: critical_thinking|学生提出了质疑|3 -->';
    const updates = coordinator['parseCompetencyMarkers'](response);

    expect(updates).toHaveLength(1);
    expect(updates[0].type).toBe('critical_thinking');
    expect(updates[0].rating).toBe(3);
  });
});
```

#### 4.2 集成测试
```typescript
// __tests__/api/chat.test.ts
import { POST } from '@/app/api/chat/route';

describe('Chat API', () => {
  it('should handle chat action', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test_session',
        action: 'chat',
        message: '什么是植物工厂？'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.message).toBeDefined();
  });
});
```

#### 4.3 E2E测试
使用Playwright测试完整用户流程：
```typescript
// e2e/student-workbench.spec.ts
import { test, expect } from '@playwright/test';

test('student can chat with AI tutor', async ({ page }) => {
  await page.goto('/student/workbench');

  await page.fill('input[placeholder*="输入"]', '什么是植物工厂？');
  await page.click('button:has-text("发送")');

  await expect(page.locator('.message.assistant')).toBeVisible();
});
```

## 环境变量配置

创建`.env.local`文件：
```env
# 智谱AI API配置
ZHIPU_API_KEY=your_api_key_here

# 数据库配置（未来使用）
DATABASE_URL=postgresql://user:password@localhost:5432/learning_platform

# Redis配置（未来使用）
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_redis_token
```

## 运行和部署

### 开发环境
```bash
npm install
npm run dev
```

### 生产构建
```bash
npm run build
npm start
```

### 部署到Vercel
```bash
vercel --prod
```

## 关键文件索引

| 文件路径 | 功能说明 |
|---------|---------|
| `src/types/shared-context.ts` | 核心类型定义 |
| `src/lib/glm-client.ts` | GLM API客户端 |
| `src/lib/resource-parser.ts` | 资源文件提取 |
| `src/lib/agents/agent-coordinator.ts` | Agent协调器 |
| `src/lib/agents/context-builder.ts` | 上下文构建 |
| `src/lib/agents/prompt-builder.ts` | Prompt生成 |
| `src/app/api/chat/route.ts` | Chat API路由 |
| `src/app/student/workbench/page.tsx` | 学生工作台 |
| `src/data/mockCompetencyData.ts` | Mock数据（可参考） |

## 注意事项

1. **API密钥安全**: 确保`.env.local`不提交到Git
2. **会话清理**: 当前会话永久存储在内存，需要实现定期清理
3. **资源大小限制**: 大文件可能导致prompt超长，需要实现智能截断
4. **并发控制**: 高并发时Map操作可能有竞态条件，建议使用Redis
5. **错误监控**: 建议集成Sentry等错误追踪服务

## 联系和支持

如有问题，请查看：
- 代码注释（关键函数都有详细注释）
- TypeScript类型定义（提供了完整的类型信息）
- 本文档的"如何继续开发"部分

---

**最后更新**: 2026-01-09
**版本**: v1.0.0
**作者**: Claude (Anthropic)
