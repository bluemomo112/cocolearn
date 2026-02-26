import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';
import { Resource } from '@/types/shared-context';

/**
 * 提取资源文件内容
 * 对于demo，使用简单的文本提取方式
 */
export async function extractResourceContent(resource: Resource): Promise<string> {
  // 如果是互动网页资源，返回URL
  if (resource.type === 'interactive' && resource.url) {
    return `[互动网页: ${resource.title}]\n访问链接: ${resource.url}\n${resource.description}`;
  }

  // 如果没有path（互动资源），返回空字符串
  if (!resource.path) {
    return '';
  }

  const filePath = path.join(process.cwd(), resource.path);

  try {
    switch (resource.fileType) {
      case 'docx':
        // 使用mammoth提取docx文本
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;

      case 'pptx':
        // 对于pptx，暂时返回占位符
        // 完整实现需要使用pptx解析库，但对于demo我们简化处理
        return `[PPT文档: ${resource.title}]\n这是一个演示文稿，包含关于${resource.description}的内容。`;

      case 'mp4':
        // 视频不提取内容
        return `[视频资源: ${resource.title}]\n${resource.description}`;

      default:
        return '';
    }
  } catch (error) {
    console.error(`提取资源内容失败: ${resource.title}`, error);
    return `[无法读取资源: ${resource.title}]`;
  }
}

/**
 * 构建资源摘要（截取前N个字符）
 */
export function buildResourceSummary(content: string, maxLength: number = 2000): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength) + '\n...(内容已截断)';
}

/**
 * 批量提取所有资源内容
 */
export async function extractAllResources(resources: Resource[]): Promise<Map<string, string>> {
  const contentMap = new Map<string, string>();

  for (const resource of resources) {
    try {
      const content = await extractResourceContent(resource);
      contentMap.set(resource.id, content);
    } catch (error) {
      console.error(`提取资源失败: ${resource.id}`, error);
      contentMap.set(resource.id, `[提取失败: ${resource.title}]`);
    }
  }

  return contentMap;
}
