'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RichContentProps {
  content: string;
  className?: string;
}

// 预处理自定义嵌入语法：::video[url] 和 ::iframe[url]
function preprocessContent(content: string): string {
  // ::video[url] → 特殊标记
  let processed = content.replace(
    /::video\[([^\]]+)\]/g,
    '\n<video-embed src="$1"></video-embed>\n'
  );
  // ::iframe[url] → 特殊标记
  processed = processed.replace(
    /::iframe\[([^\]]+)\]/g,
    '\n<iframe-embed src="$1"></iframe-embed>\n'
  );
  return processed;
}

export default function RichContent({ content, className = '' }: RichContentProps) {
  const processed = preprocessContent(content);

  return (
    <div className={`rich-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || ''}
              className="rounded-xl max-w-full h-auto my-2"
              loading="lazy"
              {...props}
            />
          ),
          p: ({ children, ...props }) => {
            // 检查是否包含自定义嵌入标记
            const childStr = String(children);

            // 处理 video-embed
            const videoMatch = childStr.match(/<video-embed src="([^"]+)"><\/video-embed>/);
            if (videoMatch) {
              return (
                <div className="my-4 rounded-xl overflow-hidden bg-black">
                  <video
                    src={videoMatch[1]}
                    controls
                    className="w-full max-h-[400px]"
                    preload="metadata"
                  >
                    您的浏览器不支持视频播放
                  </video>
                </div>
              );
            }

            // 处理 iframe-embed
            const iframeMatch = childStr.match(/<iframe-embed src="([^"]+)"><\/iframe-embed>/);
            if (iframeMatch) {
              return (
                <div className="my-4 rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    src={iframeMatch[1]}
                    className="w-full h-[400px]"
                    sandbox="allow-scripts allow-same-origin"
                    loading="lazy"
                    title="嵌入内容"
                  />
                </div>
              );
            }

            return <p {...props}>{children}</p>;
          },
          strong: ({ children, ...props }) => (
            <strong className="font-semibold" {...props}>{children}</strong>
          ),
          code: ({ children, ...props }) => (
            <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono" {...props}>{children}</code>
          ),
        }}
      >{processed}</ReactMarkdown>
    </div>
  );
}
