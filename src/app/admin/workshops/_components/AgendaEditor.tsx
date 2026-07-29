'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface AgendaEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function AgendaEditor({ value, onChange }: AgendaEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              mode === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            编辑
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              mode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            预览
          </button>
        </div>
        <div className="text-xs text-gray-400">
          支持 Markdown 语法：**加粗** *斜体* # 标题 - 列表
        </div>
      </div>

      {/* 编辑/预览区 */}
      {mode === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          placeholder={`# Day 1（8月15日）：理论奠基

## 上午
- 09:00–10:30 开场：跨学科教育的时代背景
- 10:45–12:00 C-POTE 模型五要素详解

## 下午
- 14:00–17:00 分组研讨：从课标到大概念

**注意事项**：请自带笔记本电脑。`}
          className="w-full px-4 py-3 text-sm font-mono focus:outline-none resize-y border-0"
        />
      ) : (
        <div className="px-4 py-3 min-h-[300px] max-h-[600px] overflow-y-auto prose prose-sm max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-li:my-1">
          {value.trim() ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic text-sm">还没有内容，切换到&ldquo;编辑&rdquo;模式开始输入</p>
          )}
        </div>
      )}
    </div>
  )
}
