'use client';

import { useState } from 'react';
import { FileText, Camera, Mic, Paperclip, X, Square } from 'lucide-react';

interface SubmissionToolbarProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function SubmissionToolbar({ value, onChange, disabled }: SubmissionToolbarProps) {
  const [activeMode, setActiveMode] = useState<'text' | 'file' | 'photo' | 'voice'>('text');
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="space-y-4">
      {/* 工具栏按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveMode('text')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeMode === 'text' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FileText size={16} />
          文字
        </button>
        <button
          onClick={() => setActiveMode('file')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeMode === 'file' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Paperclip size={16} />
          文件
        </button>
        <button
          onClick={() => setActiveMode('photo')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeMode === 'photo' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Camera size={16} />
          照片
        </button>
        <button
          onClick={() => setActiveMode('voice')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeMode === 'voice' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Mic size={16} />
          语音
        </button>
      </div>

      {/* 文字输入 */}
      {activeMode === 'text' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="请在这里输入你的答案..."
          disabled={disabled}
          className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none text-base disabled:bg-gray-50"
        />
      )}

      {/* 文件上传区域 */}
      {activeMode === 'file' && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
          <Paperclip size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">点击或拖拽文件到此处上传</p>
          <p className="text-xs text-gray-400 mt-1">支持 PDF、Word、图片等格式</p>
        </div>
      )}

      {/* 照片上传区域 */}
      {activeMode === 'photo' && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
          <Camera size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">点击拍照或上传图片</p>
          <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式</p>
        </div>
      )}

      {/* 语音录制区域 */}
      {activeMode === 'voice' && (
        <div className="border-2 border-gray-200 rounded-xl p-8 text-center">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
            }`}
          >
            {isRecording ? <Square size={28} /> : <Mic size={28} />}
          </button>
          <p className="text-sm text-gray-600 mt-4">
            {isRecording ? '录音中...点击停止' : '点击开始录音'}
          </p>
          {isRecording && (
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-400 rounded-full animate-pulse"
                  style={{
                    height: `${12 + Math.random() * 20}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
