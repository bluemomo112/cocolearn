/**
 * AI 功能配置
 */

/**
 * 检查 AI 功能是否在客户端启用
 * 通过环境变量 NEXT_PUBLIC_ENABLE_AI 控制
 */
export function isAIEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_AI === 'true';
}

/**
 * 检查服务端 AI 功能是否可用
 * 需要配置 GLM_API_KEY
 */
export function isServerAIAvailable(): boolean {
  return !!process.env.GLM_API_KEY;
}
