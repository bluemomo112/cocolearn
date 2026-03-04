'use client';

import { useState, useEffect } from 'react';
import { SpaceSummary, SpaceConfig, createDefaultSpaceConfig } from '@/types/self-study';
import { Resource } from '@/types/shared-context';
import { usePersistedState, clearSpaceStorage } from './utils/storage';
import Onboarding from './components/Onboarding';
import SpaceManager from './components/SpaceManager';
import SelfStudyWorkbench from './components/SelfStudyWorkbench';
import SpaceResults from './components/SpaceResults';
import CreationMethodModal from './components/CreationMethodModal';
import FileUploadModal from './components/FileUploadModal';
import UnifiedResourceLibraryModal from './components/UnifiedResourceLibraryModal';
import AIGenerateFormModal from './components/AIGenerateFormModal';
import type { ErrorQuestion, HistoricalTest, Note, InteractiveWebpage } from '@/data/mockKnowledgeBase';

// 模拟存储的学习空间数据
const mockSpaces: SpaceSummary[] = [
  {
    id: 'space_1',
    title: 'Python 数据分析入门',
    topic: 'Python数据分析',
    scenario: 'skill_learning',
    learningMode: 'ai_guided',
    progress: 45,
    resourceCount: 3,
    lastAccessedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
  },
  {
    id: 'space_2',
    title: '量子力学基础概念',
    topic: '量子力学',
    scenario: 'interest_exploration',
    learningMode: 'self_directed',
    progress: 20,
    resourceCount: 1,
    lastAccessedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14天前
  },
];

type ViewState = 'manager' | 'onboarding' | 'workbench' | 'results';

export default function SelfStudyPage() {
  const [viewState, setViewState] = usePersistedState<ViewState>('self-study:viewState', 'manager');
  const [spaces, setSpaces] = usePersistedState<SpaceSummary[]>('self-study:spaces', mockSpaces);
  const [currentSpace, setCurrentSpace] = usePersistedState<SpaceConfig | null>('self-study:currentSpace', null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showCreationMethodModal, setShowCreationMethodModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showResourceLibraryModal, setShowResourceLibraryModal] = useState(false);
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isImportingResources, setIsImportingResources] = useState(false);
  const [pendingExamFiles, setPendingExamFiles] = useState<File[] | null>(null);

  const EXAM_PATTERN = /(?:试卷|测验|测试|考试|期中|期末|月考|模拟|真题|quiz|exam|test|midterm|final|assessment)/i;

  // 检查是否首次访问
  useEffect(() => {
    // 实际应用中应该从 localStorage 或后端获取
    if (spaces.length === 0) {
      setIsFirstVisit(true);
      setViewState('onboarding');
    }
  }, [spaces.length]);

  // 创建新空间
  const handleCreateSpace = () => {
    setShowCreationMethodModal(true);
  };

  // 处理创建方式选择
  const handleCreationMethodSelect = (method: 'ai' | 'upload' | 'library' | 'blank') => {
    setShowCreationMethodModal(false);

    switch (method) {
      case 'ai':
        // 创建空白空间，进入workbench，然后显示AI生成表单
        const aiSpace = createBlankSpace('AI 生成中...');
        setCurrentSpace(aiSpace);
        setViewState('workbench');
        // 延迟显示弹窗，确保workbench已经渲染
        setTimeout(() => {
          setShowAIGenerateModal(true);
        }, 100);
        break;

      case 'upload':
        // 创建空白空间并显示上传模态框
        const uploadSpace = createBlankSpace();
        setCurrentSpace(uploadSpace);
        setViewState('workbench');
        setShowFileUploadModal(true);
        break;

      case 'library':
        // 创建空白空间并显示资源库模态框
        const librarySpace = createBlankSpace();
        setCurrentSpace(librarySpace);
        setViewState('workbench');
        setShowResourceLibraryModal(true);
        break;

      case 'blank':
        // 创建空白空间
        const blankSpace = createBlankSpace();
        setCurrentSpace(blankSpace);
        setViewState('workbench');
        break;
    }
  };

  // 创建空白空间
  const createBlankSpace = (title: string = '未命名空间'): SpaceConfig => {
    const newSpace = createDefaultSpaceConfig();
    const newSummary: SpaceSummary = {
      id: newSpace.id,
      title,
      topic: undefined,
      scenario: undefined,
      learningMode: 'self_directed',
      progress: 0,
      resourceCount: 0,
      lastAccessedAt: new Date(),
      createdAt: newSpace.createdAt,
    };
    setSpaces(prev => [newSummary, ...prev]);
    return newSpace;
  };

  // 处理文件上传
  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) {
      setShowFileUploadModal(false);
      return;
    }

    // 检测试卷文件
    const examFiles = files.filter(f => EXAM_PATTERN.test(f.name));
    const normalFiles = files.filter(f => !EXAM_PATTERN.test(f.name));

    if (examFiles.length > 0) {
      console.log('[ExamDetect] 新建空间时检测到试卷文件:', examFiles.map(f => f.name));
      setPendingExamFiles(examFiles);
    }

    // 非试卷文件正常处理
    if (normalFiles.length > 0 && currentSpace) {
      const title = normalFiles[0]?.name || '未命名空间';
      const spaceTitle = title.replace(/\.[^/.]+$/, '');
      const updatedSpace = { ...currentSpace, title: spaceTitle };
      setCurrentSpace(updatedSpace);
      setSpaces(prev =>
        prev.map(s => s.id === currentSpace.id ? { ...s, title: spaceTitle, resourceCount: normalFiles.length } : s)
      );
      const mockResources: Resource[] = normalFiles.map((file, index) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        let type: 'document' | 'presentation' | 'video' = 'document';
        let fileType: 'docx' | 'pptx' | 'mp4' = 'docx';
        if (['ppt', 'pptx'].includes(ext)) { type = 'presentation'; fileType = 'pptx'; }
        else if (['mp4', 'avi', 'mov'].includes(ext)) { type = 'video'; fileType = 'mp4'; }
        return {
          id: `resource_${Date.now()}_${index}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type, fileType,
          path: `/mock/path/${file.name}`,
          description: `上传的文件：${file.name}`,
          duration: '10分钟',
        };
      });
      setCurrentSpace({ ...updatedSpace, resources: [...updatedSpace.resources, ...mockResources] });
    } else if (examFiles.length > 0 && currentSpace) {
      // 仅有试卷文件时，用第一个文件名作为空间标题
      const spaceTitle = examFiles[0].name.replace(/\.[^/.]+$/, '');
      const updatedSpace = { ...currentSpace, title: spaceTitle };
      setCurrentSpace(updatedSpace);
      setSpaces(prev =>
        prev.map(s => s.id === currentSpace.id ? { ...s, title: spaceTitle } : s)
      );
    }

    setShowFileUploadModal(false);
  };

  // 处理资源库选择
  const handleResourceSelect = (resources: Resource[]) => {
    if (currentSpace && resources.length > 0) {
      setShowResourceLibraryModal(false);
      setIsImportingResources(true);

      // 模拟导入过程
      setTimeout(() => {
        // 检测试卷资源（通过标题匹配）
        const examResources = resources.filter(r => EXAM_PATTERN.test(r.title));
        const normalResources = resources.filter(r => !EXAM_PATTERN.test(r.title));

        if (examResources.length > 0) {
          console.log('[ExamDetect] 资源库中检测到试卷资源:', examResources.map(r => r.title));
          // 用资源标题创建合成 File 对象，供 ExamDetectedModal 使用
          const syntheticFiles = examResources.map(r => new File([], r.title));
          setPendingExamFiles(syntheticFiles);
        }

        // 非试卷资源正常添加
        const resourcesToAdd = normalResources.length > 0 ? normalResources : [];
        const title = resources[0]?.title || '未命名空间';
        const updatedSpace = { ...currentSpace, title };
        setCurrentSpace({
          ...updatedSpace,
          resources: [...updatedSpace.resources, ...resourcesToAdd],
        });
        setSpaces(prev =>
          prev.map(s => s.id === currentSpace.id ? { ...s, title, resourceCount: resources.length } : s)
        );

        setIsImportingResources(false);
      }, 800);
    } else {
      setShowResourceLibraryModal(false);
    }
  };

  // 处理错题导入
  const handleErrorQuestionsImport = (questions: ErrorQuestion[]) => {
    if (currentSpace) {
      setShowResourceLibraryModal(false);
      setIsImportingResources(true);

      setTimeout(() => {
        // 将错题转换为资源格式并添加
        const errorQuestionResources: Resource[] = questions.map(eq => ({
          id: `error-${eq.id}`,
          title: `错题：${eq.question.content.substring(0, 30)}...`,
          type: 'document',
          path: `error-questions/${eq.id}`,
          description: `来自《${eq.originalTaskTitle}》，错误日期：${eq.attemptDate}`,
          duration: '错题',
        }));

        setCurrentSpace({
          ...currentSpace,
          resources: [...currentSpace.resources, ...errorQuestionResources],
        });
        setSpaces(prev =>
          prev.map(s => s.id === currentSpace.id ? {
            ...s,
            resourceCount: currentSpace.resources.length + errorQuestionResources.length
          } : s)
        );
        setIsImportingResources(false);
      }, 800);
    } else {
      setShowResourceLibraryModal(false);
    }
  };

  // 处理历史测验导入
  const handleHistoricalTestImport = (testRecord: HistoricalTest) => {
    if (currentSpace) {
      setShowResourceLibraryModal(false);
      setIsImportingResources(true);

      setTimeout(() => {
        // 将历史测验转换为资源格式并添加
        const testResource: Resource = {
          id: `test-${testRecord.id}`,
          title: testRecord.title,
          type: 'document',
          path: `historical-tests/${testRecord.id}`,
          description: `${testRecord.subject || '测验'} - 得分：${testRecord.score}/${testRecord.totalScore}，正确率：${Math.round(testRecord.correctCount / testRecord.questionCount * 100)}%`,
          duration: testRecord.duration || '测验记录',
        };

        setCurrentSpace({
          ...currentSpace,
          resources: [...currentSpace.resources, testResource],
        });
        setSpaces(prev =>
          prev.map(s => s.id === currentSpace.id ? {
            ...s,
            resourceCount: currentSpace.resources.length + 1
          } : s)
        );
        setIsImportingResources(false);
      }, 800);
    } else {
      setShowResourceLibraryModal(false);
    }
  };

  // 处理笔记导入
  const handleNotesImport = (notes: Note[]) => {
    if (currentSpace) {
      setShowResourceLibraryModal(false);
      setIsImportingResources(true);

      setTimeout(() => {
        // 将笔记转换为资源格式并添加
        const noteResources: Resource[] = notes.map(note => ({
          id: `note-${note.id}`,
          title: note.title,
          type: 'document',
          path: `notes/${note.id}.md`,
          description: note.content.substring(0, 100) + '...',
          textContent: note.content,
          duration: '笔记',
        }));

        setCurrentSpace({
          ...currentSpace,
          resources: [...currentSpace.resources, ...noteResources],
        });
        setSpaces(prev =>
          prev.map(s => s.id === currentSpace.id ? {
            ...s,
            resourceCount: currentSpace.resources.length + noteResources.length
          } : s)
        );
        setIsImportingResources(false);
      }, 800);
    } else {
      setShowResourceLibraryModal(false);
    }
  };

  // 处理互动网页导入
  const handleWebpagesImport = (webpages: InteractiveWebpage[]) => {
    if (currentSpace) {
      setShowResourceLibraryModal(false);
      setIsImportingResources(true);

      setTimeout(() => {
        // 将互动网页转换为资源格式并添加
        const webpageResources: Resource[] = webpages.map(wp => ({
          id: wp.id,
          title: wp.title,
          type: 'interactive',
          path: wp.url,
          description: wp.description,
          duration: wp.duration,
        }));

        setCurrentSpace({
          ...currentSpace,
          resources: [...currentSpace.resources, ...webpageResources],
        });
        setSpaces(prev =>
          prev.map(s => s.id === currentSpace.id ? {
            ...s,
            resourceCount: currentSpace.resources.length + webpageResources.length
          } : s)
        );
        setIsImportingResources(false);
      }, 800);
    } else {
      setShowResourceLibraryModal(false);
    }
  };


  // 处理AI生成
  const handleAIGenerate = (data: {
    topic: string;
    question: string;
    learningStyle: string;
    level: string;
  }) => {
    setShowAIGenerateModal(false);

    if (currentSpace) {
      // 更新空间标题和学习模式
      const learningMode = data.learningStyle === 'guided' ? 'ai_guided' : 'self_directed';
      const updatedSpace: SpaceConfig = {
        ...currentSpace,
        title: data.topic,
        learningMode,
      };
      setCurrentSpace(updatedSpace);

      // 更新spaces列表
      setSpaces(prev =>
        prev.map(s => s.id === currentSpace.id ? {
          ...s,
          title: data.topic,
          learningMode,
          topic: data.topic,
        } : s)
      );

      // 开始AI生成过程
      setIsAIGenerating(true);

      // 模拟AI生成过程（实际应该调用后端API）
      setTimeout(() => {
        // 生成完成后，添加一些mock资源和任务
        const mockGeneratedResources: Resource[] = [
          {
            id: `ai_res_${Date.now()}_1`,
            title: `${data.topic} - 入门指南`,
            type: 'document',
            fileType: 'docx',
            path: '/mock/ai-generated-1',
            description: 'AI 自动生成的学习资料',
            duration: '15分钟',
          },
          {
            id: `ai_res_${Date.now()}_2`,
            title: `${data.topic} - 核心概念`,
            type: 'presentation',
            fileType: 'pptx',
            path: '/mock/ai-generated-2',
            description: 'AI 自动生成的知识点总结',
            duration: '20分钟',
          },
        ];

        setCurrentSpace(prev => prev ? {
          ...prev,
          resources: [...prev.resources, ...mockGeneratedResources],
        } : null);

        setSpaces(prev =>
          prev.map(s => s.id === currentSpace.id ? {
            ...s,
            resourceCount: mockGeneratedResources.length,
          } : s)
        );

        setIsAIGenerating(false);
      }, 5000); // 5秒模拟生成时间
    }
  };

  // 打开已有空间
  const handleOpenSpace = (spaceId: string) => {
    // 实际应用中应该从后端获取完整的 SpaceConfig
    const spaceSummary = spaces.find(s => s.id === spaceId);
    if (spaceSummary) {
      const fullConfig = createDefaultSpaceConfig({
        id: spaceSummary.id,
        title: spaceSummary.title,
        topic: spaceSummary.topic,
        scenario: spaceSummary.scenario,
        learningMode: spaceSummary.learningMode,
      });
      setCurrentSpace(fullConfig);
      setViewState('workbench');

      // 更新最后访问时间
      setSpaces(prev => prev.map(s =>
        s.id === spaceId ? { ...s, lastAccessedAt: new Date() } : s
      ));
    }
  };

  // 删除空间
  const handleDeleteSpace = (spaceId: string) => {
    setSpaces(prev => prev.filter(s => s.id !== spaceId));
    clearSpaceStorage(spaceId);
  };

  // 完成引导流程，创建新空间
  const handleOnboardingComplete = (config: SpaceConfig) => {
    // 添加到空间列表
    const newSummary: SpaceSummary = {
      id: config.id,
      title: config.title,
      topic: config.topic,
      scenario: config.scenario,
      learningMode: config.learningMode,
      progress: 0,
      resourceCount: config.resources.length,
      lastAccessedAt: new Date(),
      createdAt: config.createdAt,
    };
    setSpaces(prev => [newSummary, ...prev]);
    setCurrentSpace(config);
    setViewState('workbench');
  };

  // 返回空间管理器
  const handleBackToManager = () => {
    setCurrentSpace(null);
    setViewState('manager');
  };

  // 从结果页返回工作台
  const handleBackFromResults = () => {
    setViewState('workbench');
  };

  // 取消引导流程
  const handleCancelOnboarding = () => {
    if (spaces.length > 0) {
      setViewState('manager');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-hidden flex flex-col">
      {viewState === 'manager' && (
        <SpaceManager
          spaces={spaces}
          onCreateSpace={handleCreateSpace}
          onOpenSpace={handleOpenSpace}
          onDeleteSpace={handleDeleteSpace}
        />
      )}

      {viewState === 'onboarding' && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          onCancel={spaces.length > 0 ? handleCancelOnboarding : undefined}
        />
      )}

      {viewState === 'workbench' && currentSpace && (
        <SelfStudyWorkbench
          config={currentSpace}
          onBack={handleBackToManager}
          onUpdateConfig={(updated) => setCurrentSpace(updated)}
          isAIGenerating={isAIGenerating || isImportingResources}
          onCreateNewSpace={handleCreateSpace}
          onViewResults={() => setViewState('results')}
          pendingExamFiles={pendingExamFiles}
          onExamFilesHandled={() => setPendingExamFiles(null)}
        />
      )}

      {viewState === 'results' && currentSpace && (
        <SpaceResults
          spaceId={currentSpace.id}
          onBack={handleBackFromResults}
        />
      )}

      {/* 创建方式选择模态框 */}
      <CreationMethodModal
        isOpen={showCreationMethodModal}
        onClose={() => setShowCreationMethodModal(false)}
        onSelectMethod={handleCreationMethodSelect}
      />

      {/* 文件上传模态框 */}
      <FileUploadModal
        isOpen={showFileUploadModal}
        onClose={() => setShowFileUploadModal(false)}
        onUpload={handleFileUpload}
      />

      {/* 资源库选择模态框 */}
      <UnifiedResourceLibraryModal
        isOpen={showResourceLibraryModal}
        onClose={() => setShowResourceLibraryModal(false)}
        onImportResources={handleResourceSelect}
        onImportErrorQuestions={handleErrorQuestionsImport}
        onImportHistoricalTest={handleHistoricalTestImport}
        onImportNotes={handleNotesImport}
        onImportWebpages={handleWebpagesImport}
      />

      {/* AI生成表单模态框 */}
      <AIGenerateFormModal
        isOpen={showAIGenerateModal}
        onClose={() => setShowAIGenerateModal(false)}
        onGenerate={handleAIGenerate}
      />
    </div>
  );
}
