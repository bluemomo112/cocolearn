'use client';

import { Task } from '@/types/shared-context';
import { LearningMode } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ChevronDown, ChevronUp, ListChecks, CheckCircle2, Circle,
  Settings as SettingsIcon, Play
} from 'lucide-react';

interface TaskSectionProps {
  tasks: Task[];
  learningMode: LearningMode;
  collapsedPanels: { resources: boolean; tasks: boolean };
  completedTasks: Set<string>;
  expandedTask: Task | null;
  onToggleTaskCollapse: () => void;
  onTaskClick: (task: Task) => void;
  onTaskSettingsClick: (task: Task, event: React.MouseEvent) => void;
}

export function TaskSection({
  tasks,
  learningMode,
  collapsedPanels,
  completedTasks,
  expandedTask,
  onToggleTaskCollapse,
  onTaskClick,
  onTaskSettingsClick,
}: TaskSectionProps) {
  const { t } = useLanguage();

  return (
    <div
      className="flex flex-col min-h-0 overflow-hidden border-t border-gray-200"
      style={{
        flex: collapsedPanels.tasks ? '0 0 auto' : '1 1 50%'
      }}
    >
      <div
        className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-3 cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0"
        onClick={onToggleTaskCollapse}
      >
        <div className="flex items-center gap-2">
          <ListChecks size={14} className="text-gray-600" />
          <span className="text-xs font-bold text-gray-700">{t('学习任务')}</span>
          <span className="text-xs text-gray-500">
            ({tasks.filter(t => completedTasks.has(t.id)).length}/{tasks.length})
          </span>
        </div>
        {collapsedPanels.tasks ? (
          <ChevronUp size={14} className="text-gray-500" />
        ) : (
          <ChevronDown size={14} className="text-gray-500" />
        )}
      </div>

      {!collapsedPanels.tasks && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <ListChecks size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-1">{t('还没有学习任务')}</p>
              <p className="text-xs text-gray-400">
                {learningMode === 'ai_guided' 
                  ? t('AI 会根据你的学习进度自动生成任务')
                  : t('在聊天中使用工作室工具创建任务')}
              </p>
            </div>
          ) : (
            tasks.map((task) => {
              const isCompleted = completedTasks.has(task.id);
              const isExpanded = expandedTask?.id === task.id;
              
              return (
                <div
                  key={task.id}
                  className={`group relative p-3 bg-white border rounded-lg cursor-pointer transition-all ${
                    isExpanded
                      ? 'border-primary-300 shadow-md'
                      : 'border-gray-200 hover:border-primary-200 hover:shadow-sm'
                  }`}
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-green-600" />
                      ) : (
                        <Circle size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium mb-1 ${
                        isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'
                      }`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <ListChecks size={12} />
                          {task.questions?.length || 0} {t('题')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => onTaskSettingsClick(task, e)}
                      className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all"
                      title={t('设置')}
                    >
                      <SettingsIcon size={14} className="text-gray-500" />
                    </button>
                  </div>
                  {!isCompleted && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <button className="w-full px-3 py-1.5 bg-primary-50 text-primary-600 text-xs font-medium rounded hover:bg-primary-100 transition-colors flex items-center justify-center gap-1">
                        <Play size={12} />
                        {t('开始练习')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
