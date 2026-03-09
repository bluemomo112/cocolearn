'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LearningMode } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePersistedState } from '../../../utils/storage';
import { Note, VoiceRecording } from '../shared/types';
import {
  Plus, Sparkles, Activity, Brain, Pencil, Edit, X, Eye,
  ImageIcon, Mic, Trash2, Play, FolderPlus, Link
} from 'lucide-react';

interface EnhancedNotesPanelProps {
  learningMode?: LearningMode;
  isAIGenerating?: boolean;
  getThemeClass: (type: 'bg' | 'bgHover' | 'text' | 'border' | 'icon') => string;
  configId?: string;
  onAddToResource?: (note: Note) => void;
}

export function EnhancedNotesPanel({ learningMode, isAIGenerating, getThemeClass, configId, onAddToResource }: EnhancedNotesPanelProps) {
  const { t } = useLanguage();
  const [notes, setNotes] = usePersistedState<Note[]>(`self-study:wb:${configId ?? 'default'}:notes`, []);
  const [activeNoteId, setActiveNoteId] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [addedNoteIds, setAddedNoteIds] = useState<Set<string>>(new Set());

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: `${t('笔记')} ${notes.length + 1}`,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      images: [],
      voiceRecordings: [],
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setShowNoteEditor(true);
  };

  // AI-assisted note generation (for guided mode)
  const generateAINote = () => {
    setIsGeneratingNote(true);
    setGenerationProgress(0);

    // Simulate AI generation process
    const steps = [
      { progress: 20, delay: 500 },
      { progress: 50, delay: 800 },
      { progress: 80, delay: 600 },
      { progress: 100, delay: 400 },
    ];

    let currentStep = 0;
    const runStep = () => {
      if (currentStep < steps.length) {
        setTimeout(() => {
          setGenerationProgress(steps[currentStep].progress);
          currentStep++;
          runStep();
        }, steps[currentStep].delay);
      } else {
        // Generation complete
        setTimeout(() => {
          const aiNote: Note = {
            id: Date.now().toString(),
            title: `📚 ${t('AI生成：关键公式与推导笔记')}`,
            content: `# ${t('关键公式与推导')}\\n\\n## ${t('核心公式')}\\n\\n### ${t('公式1：基本定义')}\\n$$E = mc^2$$\\n\\n### ${t('公式2：推导过程')}\\n1. ${t('从基本假设出发...')}\\n2. ${t('应用数学变换...')}\\n3. ${t('得到最终结果...')}\\n\\n## ${t('重点理解')}\\n- ${t('公式的物理意义')}\\n- ${t('适用条件和范围')}\\n- ${t('常见错误分析')}\\n\\n## ${t('练习建议')}\\n${t('尝试用自己的话解释这个公式的含义。')}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            images: [],
            voiceRecordings: [],
          };
          setNotes([aiNote, ...notes]);
          setActiveNoteId(aiNote.id);
          setIsGeneratingNote(false);
          setShowNoteEditor(true);
        }, 300);
      }
    };
    runStep();
  };

  const deleteNote = (noteId: string) => {
    if (notes.length === 1) {
      alert(t('至少需要保留一个笔记'));
      return;
    }
    const newNotes = notes.filter((n) => n.id !== noteId);
    setNotes(newNotes);
    if (activeNoteId === noteId) {
      setActiveNoteId(newNotes[0].id);
    }
  };

  const updateNote = (updates: Partial<Note>) => {
    setNotes(
      notes.map((n) =>
        n.id === activeNoteId ? { ...n, ...updates, updatedAt: new Date() } : n
      )
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          if (newImages.length === files.length) {
            updateNote({ images: [...activeNote.images, ...newImages] });
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      const newRecording: VoiceRecording = {
        id: Date.now().toString(),
        url: '',
        duration: recordingTime,
        timestamp: new Date(),
      };
      updateNote({
        voiceRecordings: [...activeNote.voiceRecordings, newRecording],
      });
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
    }
  };

  const formatRecTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddToResource = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addedNoteIds.has(note.id) || !onAddToResource) return;
    onAddToResource(note);
    setAddedNoteIds((prev) => new Set(prev).add(note.id));
  };

  // Note list view
  if (!showNoteEditor) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 space-y-2">
          <button
            onClick={createNote}
            className={`w-full px-4 py-3 ${getThemeClass('bg')} ${getThemeClass('bgHover')} text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
          >
            <Plus size={18} />
            {t('添加笔记')}
          </button>
          {learningMode === 'ai_guided' && (
            <button
              onClick={generateAINote}
              disabled={isGeneratingNote}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isGeneratingNote ? (
                <>
                  <Activity size={18} className="animate-spin" />
                  <span>{t('正在从知识库提取...')} {generationProgress}%</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {t('AI 生成笔记')}
                </>
              )}
            </button>
          )}
        </div>
        {/* Generation progress indicator - 仅显示笔记生成进度 */}
        {isGeneratingNote && (
          <div className="px-4 py-2 bg-primary-50 border-b border-primary-100">
            <div className="flex items-center gap-2 text-xs text-primary-700 mb-2">
              <Brain size={14} className="animate-pulse" />
              <span>{t('AI 正在分析当前学习内容并生成笔记...')}</span>
            </div>
            <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300 animate-pulse"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Pencil size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-2">{t('还没有笔记')}</p>
              <p className="text-xs text-gray-400">{t('点击上方按钮创建第一个笔记')}</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setActiveNoteId(note.id);
                  setShowNoteEditor(true);
                }}
                className={`p-3 bg-white border border-gray-200 rounded-lg hover:${getThemeClass('border')} hover:shadow-md cursor-pointer transition-all`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate mb-1">
                      {note.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {note.content.slice(0, 50) || t('空笔记')}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(note.updatedAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                    {addedNoteIds.has(note.id) && (
                      <span className="flex items-center gap-0.5 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <Link size={10} />
                        {t('已添加')}
                      </span>
                    )}
                    {onAddToResource && (
                      <button
                        onClick={(e) => handleAddToResource(note, e)}
                        disabled={addedNoteIds.has(note.id)}
                        className={`p-1 rounded transition-colors ${
                          addedNoteIds.has(note.id)
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                        title={addedNoteIds.has(note.id) ? t('已添加到资源') : t('添加到资源')}
                      >
                        <FolderPlus size={14} />
                      </button>
                    )}
                    <Edit size={14} className="text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Note editor view
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNoteEditor(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('返回列表')}
          >
            <X size={16} className="text-gray-600" />
          </button>
          <div className="h-4 w-px bg-gray-300" />
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isPreviewMode ? 'bg-gray-100 text-gray-700' : 'bg-primary-600 text-white'
            }`}
          >
            {isPreviewMode ? <Eye size={14} className="inline mr-1" /> : <Edit size={14} className="inline mr-1" />}
            {isPreviewMode ? t('预览') : t('编辑')}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ImageIcon size={16} className="text-gray-600" />
            </div>
          </label>
          <button
            onClick={toggleRecording}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isRecording ? 'animate-pulse' : ''}`}
            title={isRecording ? t('停止录音') : t('开始录音')}
          >
            <Mic size={16} className={isRecording ? 'text-red-600' : 'text-gray-600'} />
          </button>
          {isRecording && (
            <span className="text-xs font-mono text-red-600">{formatRecTime(recordingTime)}</span>
          )}
          {onAddToResource && (
            <button
              onClick={(e) => handleAddToResource(activeNote, e)}
              disabled={addedNoteIds.has(activeNoteId)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                addedNoteIds.has(activeNoteId)
                  ? 'text-emerald-600 bg-emerald-50 cursor-not-allowed'
                  : 'hover:bg-primary-50 text-gray-600 hover:text-primary-600'
              }`}
              title={addedNoteIds.has(activeNoteId) ? t('已添加到资源') : t('添加到资源')}
            >
              {addedNoteIds.has(activeNoteId) ? <Link size={16} /> : <FolderPlus size={16} />}
              {addedNoteIds.has(activeNoteId) && (
                <span className="text-xs">{t('已添加')}</span>
              )}
            </button>
          )}
          <div className="h-4 w-px bg-gray-300" />
          <button
            onClick={() => deleteNote(activeNoteId)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title={t('删除笔记')}
          >
            <Trash2 size={16} className="text-gray-600 hover:text-red-600" />
          </button>
        </div>
      </div>

      {/* Editor / Preview area */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => updateNote({ title: e.target.value })}
          className="w-full text-lg font-bold text-gray-800 border-none outline-none mb-3 bg-transparent"
          placeholder={t('笔记标题')}
        />
        {isPreviewMode ? (
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeNote.content}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={activeNote.content}
            onChange={(e) => updateNote({ content: e.target.value })}
            className="w-full h-full min-h-[300px] bg-transparent border-none outline-none resize-none text-sm text-gray-700 leading-relaxed font-mono"
            placeholder={`# ${t('开始记录你的学习笔记...')}\\n\\n${t('支持Markdown格式')}`}
          />
        )}

        {/* Image grid */}
        {activeNote.images.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-bold text-gray-600 mb-2">{t('图片')} ({activeNote.images.length})</div>
            <div className="grid grid-cols-3 gap-2">
              {activeNote.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt={`uploaded-${idx}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                  <button
                    onClick={() => {
                      const newImages = activeNote.images.filter((_, i) => i !== idx);
                      updateNote({ images: newImages });
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice recordings list */}
        {activeNote.voiceRecordings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-bold text-gray-600 mb-2">{t('语音笔记')} ({activeNote.voiceRecordings.length})</div>
            <div className="space-y-2">
              {activeNote.voiceRecordings.map((recording) => (
                <div key={recording.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <button className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <Play size={12} />
                  </button>
                  <div className="flex-1">
                    <div className="text-xs text-gray-700">{t('语音笔记')} {new Date(recording.timestamp).toLocaleString('zh-CN')}</div>
                    <div className="text-xs text-gray-500">{t('时长')}: {formatRecTime(recording.duration)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
