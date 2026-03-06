'use client';

import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SpaceConfig, LearningMode, LearningPathNode } from '@/types/self-study';
import { Resource, Task } from '@/types/shared-context';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChatMessage } from '../shared/types';
import { getIconComponent } from '../shared/utils';
import TaskExpandedCard from '../../task/TaskExpandedCard';
import { QuickResultData } from '../../task/taskTypes';
import {
  Send, Bot, Brain, Sparkles, MessageSquare, Mic, X, Check,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Activity,
  Pencil, BookOpen, Target, Lightbulb, MessageCircle, Clock,
  ListChecks, CheckCircle2, Circle, Eye, Play, Zap, FileText,
  AlertCircle, RotateCcw, Pause, GitBranch
} from 'lucide-react';

interface ChatPanelProps {
  config: SpaceConfig;
  messages: ChatMessage[];
  inputMessage: string;
  isRecordingVoice: boolean;
  isLoading: boolean;
  expandedTask: Task | null;
  completedTasks: Set<string>;
  taskDisplayMode: string;
  taskStatus: string;
  quickResult: QuickResultData | null;
  learningPath: LearningPathNode[];
  flashingButtonId: string | null;
  generatingButtonId: string | null;
  isReflectionDismissed: boolean;
  getThemeClass: (type: 'bg' | 'bgHover' | 'text' | 'border' | 'icon') => string;
  onSendMessage: () => void;
  onInputChange: (value: string) => void;
  onQuickReply: (reply: string) => void;
  onChatAction: (actionId: string, studioToolId: string) => void;
  onModeChange: (mode: LearningMode) => void;
  onToggleVoiceInput: () => void;
  onTaskClick: (task: Task) => void;
  onCloseTask: () => void;
  onToggleTaskCompletion: (taskId: string) => void;
  onToggleTaskDisplayMode: () => void;
  onUpdateTaskState: (taskId: string, stateUpdate: any) => void;
  onSetReflectionDismissed: (dismissed: boolean) => void;
  renderKnowledgeCheckpoint?: (message: ChatMessage) => React.ReactNode;
  renderTopicTransition?: (message: ChatMessage) => React.ReactNode;
  renderModeTransition?: (message: ChatMessage) => React.ReactNode;
}

export function ChatPanel(props: ChatPanelProps) {
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    config, messages, inputMessage, isRecordingVoice, isLoading,
    expandedTask, completedTasks, taskDisplayMode, taskStatus, quickResult,
    learningPath, flashingButtonId, generatingButtonId, isReflectionDismissed,
    getThemeClass,
    onSendMessage: handleSendMessage,
    onInputChange: setInputMessage,
    onQuickReply: handleQuickReply,
    onChatAction: handleChatAction,
    onModeChange: handleModeChange,
    onToggleVoiceInput: toggleVoiceInput,
    onTaskClick: handleTaskClick,
    onCloseTask: closeTask,
    onToggleTaskCompletion: toggleTaskCompletion,
    onToggleTaskDisplayMode: toggleTaskDisplayMode,
    onUpdateTaskState: updateTaskState,
    onSetReflectionDismissed: setIsReflectionDismissed,
    renderKnowledgeCheckpoint,
    renderTopicTransition,
    renderModeTransition,
  } = props;

  const masteredCount = learningPath.filter(n => n.status === 'mastered').length;
  const totalNodes = learningPath.length;
  const currentLearningNode = learningPath.find(n => n.status === 'learning');

  const ResourceReferenceTag = ({ resourceRef }: { resourceRef: NonNullable<ChatMessage['resourceRef']> }) => (
    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs text-gray-500 hover:bg-gray-150 transition-colors">
      <FileText size={11} className="text-gray-400" />
      <span>{t('来源')}：{resourceRef.resourceTitle}</span>
      {resourceRef.excerpt && (
        <span className="text-gray-400 ml-1">· {resourceRef.excerpt}</span>
      )}
    </div>
  );
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
        <div className="flex-1 flex flex-col bg-white">
          {/* 对话区头部 */}
          <div className="px-4 border-b border-gray-200">
            <div className="h-12 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <MessageSquare size={16} className={getThemeClass('icon')} />
                {t('AI 学习对话')}
              </h2>

              {/* 模式切换 - 紧凑版 */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => handleModeChange('self_directed')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    config.learningMode === 'self_directed'
                      ? `${getThemeClass('bg')} text-white shadow-sm`
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageCircle size={12} className="inline mr-1" />
                  {t('自由探索')}
                </button>
                <button
                  onClick={() => handleModeChange('ai_guided')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    config.learningMode === 'ai_guided'
                      ? `${getThemeClass('bg')} text-white shadow-sm`
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <GitBranch size={12} className="inline mr-1" />
                  {t('AI 自适应学习')}
                </button>
              </div>
            </div>

            {/* AI引导模式 - 学习路径进度点 */}
            {config.learningMode === 'ai_guided' && (
              <div className="pb-2 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {learningPath.map((node, idx) => (
                    <div key={node.id} className="flex items-center gap-1">
                      <div
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          node.status === 'mastered'
                            ? 'bg-emerald-500'
                            : node.status === 'learning'
                            ? 'bg-primary-500 ring-2 ring-primary-200'
                            : 'bg-gray-300'
                        }`}
                        title={node.title}
                      />
                      {idx < learningPath.length - 1 && (
                        <div className={`w-3 h-0.5 ${
                          node.status === 'mastered' ? 'bg-emerald-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  {masteredCount}/{totalNodes} {t('已掌握')}
                </span>
              </div>
            )}
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((message) => {
              // 特殊卡片类型渲染
              if (message.messageType === 'knowledge_checkpoint') {
                return renderKnowledgeCheckpoint ? <React.Fragment key={message.id}>{renderKnowledgeCheckpoint(message)}</React.Fragment> : null;
              }
              if (message.messageType === 'topic_transition') {
                return renderTopicTransition ? <React.Fragment key={message.id}>{renderTopicTransition(message)}</React.Fragment> : null;
              }
              if (message.messageType === 'mode_transition') {
                return renderModeTransition ? <React.Fragment key={message.id}>{renderModeTransition(message)}</React.Fragment> : null;
              }

              // 普通消息渲染
              return (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div className={`${message.role === 'user' ? 'max-w-[80%]' : 'flex flex-col gap-2 max-w-[80%]'}`}>
                  {/* 消息气泡 */}
                  <div
                    className={`rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-none'
                        : 'bg-white border border-gray-200 rounded-tl-none overflow-hidden'
                    }`}
                  >
                    {/* 消息内容 */}
                    <div className="p-4">
                      <div
                        className={`text-sm leading-relaxed whitespace-pre-line ${
                          message.role === 'user' ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                    </div>

                    {/* 功能按钮 - 内嵌在对话框底部 */}
                    {message.role === 'assistant' && message.suggestions?.actionButtons && message.suggestions.actionButtons.length > 0 && (
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.actionButtons.map((button) => {
                            const IconComponent = getIconComponent(button.iconName);
                            const buttonFullId = `${message.id}-${button.id}`;
                            const isGenerating = generatingButtonId === buttonFullId;
                            const isFlashing = flashingButtonId === buttonFullId;

                            return (
                              <button
                                key={button.id}
                                onClick={() => !isGenerating && handleChatAction(button.studioToolId, buttonFullId)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 group transition-all ${
                                  isGenerating
                                    ? 'bg-gray-50 border-gray-200 animate-pulse cursor-wait'
                                    : isFlashing
                                    ? 'bg-primary-100 border-primary-500 ring-2 ring-primary-400 shadow-lg scale-105'
                                    : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700 hover:text-primary-700 hover:shadow-sm cursor-pointer'
                                }`}
                              >
                                {IconComponent && <IconComponent size={16} className={`transition-colors ${
                                  isGenerating
                                    ? 'text-gray-500'
                                    : isFlashing
                                    ? 'text-primary-600 animate-pulse'
                                    : 'text-gray-500 group-hover:text-primary-600'
                                }`} />}
                                <span className={`font-medium ${isFlashing ? 'text-primary-700' : ''}`}>{button.label}</span>
                                {isGenerating ? (
                                  <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                                    <Activity size={10} className="animate-spin" />
                                    {t('生成中...')}
                                  </span>
                                ) : !isFlashing && (
                                  <ChevronRight size={14} className={`transition-colors text-gray-400 group-hover:text-primary-500 ml-auto`} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 资源引用标签 */}
                  {message.role === 'assistant' && message.resourceRef && (
                    <ResourceReferenceTag resourceRef={message.resourceRef} />
                  )}

                  {/* 嵌入的任务卡片 (作为智能体消息的一部分) */}
                  {message.role === 'assistant' && message.embeddedTask && (() => {
                    const isCurrentTask = expandedTask?.id === message.embeddedTask.id;
                    const shouldShowEmbedded = !isCurrentTask || taskDisplayMode === 'embedded';

                    if (!shouldShowEmbedded) {
                      // 当前任务正在全屏显示或结果回顾中
                      return (
                        <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                            <span>{taskDisplayMode === 'result_review' ? '正在查看结果回顾...' : '正在全屏做题中...'}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="mt-2">
                        <TaskExpandedCard
                          task={message.embeddedTask}
                          onClose={closeTask}
                          onComplete={toggleTaskCompletion}
                          isCompleted={completedTasks.has(message.embeddedTask.id)}
                          taskStatus={taskStatus}
                          quickResult={quickResult}
                          displayMode="embedded"
                          onToggleMode={toggleTaskDisplayMode}
                          taskState={message.taskState}
                          onStateUpdate={(stateUpdate) => updateTaskState(message.embeddedTask!.id, stateUpdate)}
                        />
                      </div>
                    );
                  })()}

                  {/* 推荐回复 - 在对话框外下方，长条形输入框样式 */}
                  {message.role === 'assistant' && message.suggestions?.quickReplies && message.suggestions.quickReplies.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                      {message.suggestions.quickReplies.map((reply) => (
                        <button
                          key={reply.id}
                          onClick={() => handleQuickReply(reply.label)}
                          className="px-4 py-3 text-sm text-left rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700 transition-all hover:shadow-sm flex items-start gap-2"
                        >
                          <Send size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{reply.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              );
            })}

            {/* 加载指示器 */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Activity size={14} className="animate-spin" />
                    <span className="text-sm">{t('思考中...')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 阶段性反思引导卡片 */}
            {messages.length >= 6 && !isReflectionDismissed && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm relative">
                <button
                  onClick={() => setIsReflectionDismissed(true)}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={14} className="text-gray-400" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <Lightbulb size={18} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">💭 {t('阶段性反思时间')}</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      {t('你已经学习了一段时间，让我们暂停一下，回顾总结学到的内容。')}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-gray-600">1</span>
                        </div>
                        <p className="text-xs text-gray-600">{t('今天学习的最重要的三个知识点是什么？')}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-gray-600">2</span>
                        </div>
                        <p className="text-xs text-gray-600">{t('你遇到了哪些困难？是如何解决的？')}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-gray-600">3</span>
                        </div>
                        <p className="text-xs text-gray-600">{t('这些知识可以在生活中的哪些地方应用？')}</p>
                      </div>
                    </div>
                    <button className="mt-3 w-full px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5">
                      <MessageCircle size={14} />
                      {t('开始反思')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 输入框 */}
          <div className="p-3 bg-white border-t border-gray-200">
            {/* AI引导模式 - 当前知识点提示 */}
            {config.learningMode === 'ai_guided' && currentLearningNode && (
              <div className="mb-2 flex items-center gap-1.5 px-2 py-1 bg-primary-50 border border-primary-100 rounded-md">
                <Target size={12} className="text-primary-500 flex-shrink-0" />
                <span className="text-xs text-primary-600">
                  {t('AI正在引导学习')}「{currentLearningNode.title}」
                </span>
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder={
                  config.learningMode === 'self_directed'
                    ? t('有什么问题？随时问我...')
                    : t('回答问题或提出疑问...')
                }
                disabled={isLoading}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-24 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              />
              {/* Mic button */}
              <button
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                  isRecordingVoice
                    ? 'bg-red-500 text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={isRecordingVoice ? t('停止录音') : t('语音输入')}
              >
                <Mic size={16} />
              </button>
              {/* Send button */}
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

    </>
  );
}
