'use client';

import { useState, useEffect } from 'react';
import { SpaceSummary, SpaceConfig, createDefaultSpaceConfig } from '@/types/self-study';
import { Resource } from '@/types/shared-context';
import Onboarding from './components/Onboarding';
import SpaceManager from './components/SpaceManager';
import SelfStudyWorkbench from './components/SelfStudyWorkbench';
import CreationMethodModal from './components/CreationMethodModal';
import FileUploadModal from './components/FileUploadModal';
import ResourceLibraryModal from './components/ResourceLibraryModal';
import AIGenerateFormModal from './components/AIGenerateFormModal';

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

type ViewState = 'manager' | 'onboarding' | 'workbench';

export default function SelfStudyPage() {
  const [viewState, setViewState] = useState<ViewState>('manager');
  const [spaces, setSpaces] = useState<SpaceSummary[]>(mockSpaces);
  const [currentSpace, setCurrentSpace] = useState<SpaceConfig | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showCreationMethodModal, setShowCreationMethodModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showResourceLibraryModal, setShowResourceLibraryModal] = useState(false);
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

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

    // 从第一个文件名生成空间标题
    const firstFileName = files[0]?.name || '未命名空间';
    const title = firstFileName.replace(/\.[^/.]+$/, ''); // 移除文件扩展名

    // 更新空间标题
    if (currentSpace) {
      const updatedSpace = { ...currentSpace, title };
      setCurrentSpace(updatedSpace);

      // 更新spaces列表中的标题
      setSpaces(prev =>
        prev.map(s => s.id === currentSpace.id ? { ...s, title, resourceCount: files.length } : s)
      );

      // 创建mock Resource对象（演示用）
      const mockResources: Resource[] = files.map((file, index) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        let type: 'document' | 'presentation' | 'video' = 'document';
        let fileType: 'docx' | 'pptx' | 'mp4' = 'docx';

        if (['ppt', 'pptx'].includes(ext)) {
          type = 'presentation';
          fileType = 'pptx';
        } else if (['mp4', 'avi', 'mov'].includes(ext)) {
          type = 'video';
          fileType = 'mp4';
        }

        return {
          id: `resource_${Date.now()}_${index}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type,
          fileType,
          path: `/mock/path/${file.name}`,
          description: `上传的文件：${file.name}`,
          duration: '10分钟',
        };
      });

      // 添加到空间resources
      setCurrentSpace({
        ...updatedSpace,
        resources: [...updatedSpace.resources, ...mockResources],
      });
    }
    setShowFileUploadModal(false);
  };

  // 处理资源库选择
  const handleResourceSelect = (resources: Resource[]) => {
    // 将选中的资源添加到当前空间
    if (currentSpace && resources.length > 0) {
      // 从第一个资源标题生成空间标题
      const title = resources[0]?.title || '未命名空间';

      const updatedSpace = { ...currentSpace, title };
      setCurrentSpace({
        ...updatedSpace,
        resources: [...updatedSpace.resources, ...resources],
      });

      // 更新spaces列表中的标题和资源数量
      setSpaces(prev =>
        prev.map(s => s.id === currentSpace.id ? { ...s, title, resourceCount: resources.length } : s)
      );
    }
    setShowResourceLibraryModal(false);
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

  // 取消引导流程
  const handleCancelOnboarding = () => {
    if (spaces.length > 0) {
      setViewState('manager');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          isAIGenerating={isAIGenerating}
          onCreateNewSpace={handleCreateSpace}
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
      <ResourceLibraryModal
        isOpen={showResourceLibraryModal}
        onClose={() => setShowResourceLibraryModal(false)}
        onSelect={handleResourceSelect}
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
