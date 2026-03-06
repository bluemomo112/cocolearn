'use client';

import { useRef, useEffect } from 'react';
import { LearningMode } from '@/types/self-study';
import { Task } from '@/types/shared-context';
import { ChatMessage } from '../shared/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { getIconComponent } from '../shared/utils';
import {
  Send, Bot, Sparkles, Brain, Mic, X
} from 'lucide-react';

interface ChatSectionProps {
  messages: ChatMessage[];
  learningMode: LearningMode;
  isAIGenerating?: boolean;
  inputMessage: string;
  isRecording: boolean;
  recordingTime: number;
  studioTools: Array<{ id: string; label: string; icon: string; description: string }>;
  quickActions: Array<{ id: string; label: string }>;
  onSendMessage: () => void;
  onInputChange: (value: string) => void;
  onQuickReply: (reply: string) => void;
  onStudioToolClick: (toolId: string) => void;
  onToggleRecording: () => void;
  onTaskClick?: (task: Task) => void;
}

export function ChatSection({
  messages,
  learningMode,
  isAIGenerating,
  inputMessage,
  isRecording,
  recordingTime,
  studioTools,
  quickActions,
  onSendMessage,
  onInputChange,
  onQuickReply,
  onStudioToolClick,
  onToggleRecording,
  onTaskClick,
}: ChatSectionProps) {
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatRecTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
      {/* 工作室工具栏 */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-primary-600" />
          <span className="text-xs font-bold text-gray-700">{t('工作室工具')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {studioTools.map((tool) => {
            const IconComponent = getIconComponent(tool.icon);
            return (
              <button
                key={tool.id}
                onClick={() => onStudioToolClick(tool.id)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all flex items-center gap-1.5"
                title={tool.description}
              >
                <IconComponent size={14} />
                {tool.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Bot size={32} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {learningMode === 'ai_guided' ? t('AI 学习助手') : t('自由探索模式')}
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              {learningMode === 'ai_guided'
                ? t('我会根据你的学习目标，为你规划学习路径并提供个性化指导')
                : t('使用工作室工具创建学习任务，或直接向我提问')}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-primary-600" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                
                {/* 嵌入的任务卡片 */}
                {msg.embeddedTask && onTaskClick && (
                  <div
                    className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
                    onClick={() => onTaskClick(msg.embeddedTask!)}
                  >
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {msg.embeddedTask.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {msg.embeddedTask.questions?.length || 0} {t('题')}
                    </p>
                  </div>
                )}

                {/* 快捷回复 */}
                {msg.suggestions?.quickReplies && msg.suggestions.quickReplies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.suggestions.quickReplies.map((reply) => (
                      <button
                        key={reply.id}
                        onClick={() => onQuickReply(reply.label)}
                        className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        {reply.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">我</span>
                </div>
              )}
            </div>
          ))
        )}
        
        {/* AI 生成中指示器 */}
        {isAIGenerating && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-primary-600 animate-pulse" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-primary-600 animate-pulse" />
                <span className="text-sm text-gray-600">{t('正在思考...')}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 快捷操作 */}
      {quickActions.length > 0 && (
        <div className="px-4 py-2 bg-white border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onQuickReply(action.label)}
                className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs rounded-lg hover:bg-gray-100 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder={t('输入消息...')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={onToggleRecording}
            className={`p-3 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isRecording ? t('停止录音') : t('语音输入')}
          >
            {isRecording ? <X size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={onSendMessage}
            disabled={!inputMessage.trim() && !isRecording}
            className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={t('发送')}
          >
            <Send size={20} />
          </button>
        </div>
        {isRecording && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span>{t('录音中')} {formatRecTime(recordingTime)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
