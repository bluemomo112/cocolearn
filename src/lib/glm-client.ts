import OpenAI from 'openai';
import { Message } from '@/types/shared-context';

// 创建GLM客户端
const client = new OpenAI({
  apiKey: process.env.GLM_API_KEY,
  baseURL: process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/'
});

export interface ChatOptions {
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

/**
 * 调用GLM-4.7进行对话
 */
export async function chatWithGLM(
  systemPrompt: string,
  messages: Message[],
  options: ChatOptions = {}
) {
  const {
    stream = false,
    temperature = 0.7,
    maxTokens = 4096
  } = options;

  // 转换消息格式
  const formattedMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))
  ];

  // GLM API 要求至少有一条用户消息，如果没有则添加默认消息
  if (messages.length === 0) {
    formattedMessages.push({
      role: 'user' as const,
      content: '请根据上述系统提示进行分析。'
    });
  }

  try {
    const response = await client.chat.completions.create({
      model: 'glm-4.7',
      messages: formattedMessages,
      stream,
      temperature,
      max_tokens: maxTokens
    });

    return response;
  } catch (error) {
    console.error('GLM API调用失败:', error);
    throw error;
  }
}

/**
 * 流式调用GLM-4.7
 */
export async function* streamChatWithGLM(
  systemPrompt: string,
  messages: Message[],
  options: ChatOptions = {}
) {
  const {
    temperature = 0.7,
    maxTokens = 4096
  } = options;

  const formattedMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))
  ];

  // GLM API 要求至少有一条用户消息，如果没有则添加默认消息
  if (messages.length === 0) {
    formattedMessages.push({
      role: 'user' as const,
      content: '请根据上述系统提示进行分析。'
    });
  }

  try {
    const stream = await client.chat.completions.create({
      model: 'glm-4.7',
      messages: formattedMessages,
      stream: true,
      temperature,
      max_tokens: maxTokens
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('GLM流式API调用失败:', error);
    throw error;
  }
}
