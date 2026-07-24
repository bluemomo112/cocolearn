// 学习资源 Hub Mock 数据
// 板块顺序（前端展示）：名师课堂 → 互动工具 → 学习资源
export type ResourceSection = 'master-class' | 'interactive-tool' | 'learning-resource';
// 资源来源：本地文件 / 网页链接 / 嵌入代码 / H5 应用
export type ResourceSource = 'file' | 'link' | 'embed' | 'h5';
export type ResourceOpenMode = 'redirect' | 'iframe';
export type ResourceStatus = 'draft' | 'published';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  coverImage: string;
  section: ResourceSection;
  source: ResourceSource;
  // source=upload 时
  fileUrl?: string;
  fileName?: string;
  fileSize?: number; // bytes
  fileFormat?: string; // pdf, mp4, docx, etc.
  // source=link 时
  externalUrl?: string;
  // source=embed 时
  embedCode?: string;
  // source=h5 时（预留，暂时复用 externalUrl）
  openMode: ResourceOpenMode;
  downloadable: boolean;
  status: ResourceStatus;
  sortWeight: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Mock 资源数据（三个板块各 12 条）
export const mockResources: Resource[] = [
  // ========== 名师课堂（master-class）==========
  {
    id: 'mc-001',
    title: '张三教授：PBL 项目式学习的理论与实践',
    description: '深入解析 PBL 的核心要素与实施路径',
    coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop',
    section: 'master-class',
    source: 'link',
    externalUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    openMode: 'iframe',
    downloadable: false,
    status: 'published',
    sortWeight: 1000,
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'mc-002',
    title: '李四老师：跨学科课程设计实战工作坊',
    description: '从零到一，手把手带你设计跨学科单元',
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
    section: 'master-class',
    source: 'link',
    externalUrl: 'https://player.vimeo.com/video/76979871',
    openMode: 'iframe',
    downloadable: false,
    status: 'published',
    sortWeight: 900,
    createdAt: '2026-07-18T14:30:00Z',
    updatedAt: '2026-07-18T14:30:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'mc-003',
    title: '王五特级教师：核心素养导向的教学设计',
    description: '如何将核心素养落实到日常教学中',
    coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop',
    section: 'master-class',
    source: 'file',
    fileUrl: '/mock-files/teaching-design.mp4',
    fileName: '核心素养教学设计.mp4',
    fileSize: 125000000, // 125MB
    fileFormat: 'mp4',
    openMode: 'iframe',
    downloadable: true,
    status: 'published',
    sortWeight: 800,
    createdAt: '2026-07-15T09:20:00Z',
    updatedAt: '2026-07-15T09:20:00Z',
    createdBy: 'admin-002'
  },
  {
    id: 'mc-004',
    title: '赵六博士：STEM 教育的国际视野',
    description: '全球 STEM 教育趋势与本土化实践',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop',
    section: 'master-class',
    source: 'link',
    externalUrl: 'https://www.youtube.com/embed/example-stem',
    openMode: 'iframe',
    downloadable: false,
    status: 'published',
    sortWeight: 700,
    createdAt: '2026-07-12T16:00:00Z',
    updatedAt: '2026-07-12T16:00:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'mc-005',
    title: '孙七名师：项目式学习中的评价设计',
    description: '过程性评价与终结性评价的融合策略',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
    section: 'master-class',
    source: 'file',
    fileUrl: '/mock-files/assessment-design.mp4',
    fileName: 'PBL评价设计.mp4',
    fileSize: 98000000,
    fileFormat: 'mp4',
    openMode: 'iframe',
    downloadable: true,
    status: 'published',
    sortWeight: 600,
    createdAt: '2026-07-10T11:30:00Z',
    updatedAt: '2026-07-10T11:30:00Z',
    createdBy: 'admin-002'
  },
  {
    id: 'mc-006',
    title: '周八教授：跨学科大概念的提取与应用',
    description: '如何找到学科间的深层连接',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&h=400&fit=crop',
    section: 'master-class',
    source: 'link',
    externalUrl: 'https://www.youtube.com/embed/example-concept',
    openMode: 'iframe',
    downloadable: false,
    status: 'published',
    sortWeight: 500,
    createdAt: '2026-07-08T13:00:00Z',
    updatedAt: '2026-07-08T13:00:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'mc-007',
    title: '吴九老师：AI 赋能的个性化教学',
    description: '如何用 AI 工具实现因材施教',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
    section: 'master-class',
    source: 'link',
    externalUrl: 'https://player.vimeo.com/video/example-ai',
    openMode: 'iframe',
    downloadable: false,
    status: 'published',
    sortWeight: 400,
    createdAt: '2026-07-05T15:45:00Z',
    updatedAt: '2026-07-05T15:45:00Z',
    createdBy: 'admin-003'
  },
  {
    id: 'mc-008',
    title: '郑十名师：课堂互动技术的创新应用',
    description: '让每个学生都参与进来的秘诀',
    coverImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop',
    section: 'master-class',
    source: 'file',
    fileUrl: '/mock-files/interactive-class.mp4',
    fileName: '课堂互动技术.mp4',
    fileSize: 156000000,
    fileFormat: 'mp4',
    openMode: 'iframe',
    downloadable: true,
    status: 'published',
    sortWeight: 300,
    createdAt: '2026-07-03T10:15:00Z',
    updatedAt: '2026-07-03T10:15:00Z',
    createdBy: 'admin-002'
  },
  {
    id: 'mc-009',
    title: '钱十一教授：基于问题的学习设计',
    description: 'PBL 中驱动性问题的设计方法论',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop',
    section: 'master-class',
    source: 'link',
    externalUrl: 'https://www.youtube.com/embed/example-pbl',
    openMode: 'iframe',
    downloadable: false,
    status: 'published',
    sortWeight: 200,
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-01T09:00:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'mc-010',
    title: '陈十二老师：学生作品展示与反思',
    description: '优秀项目案例分析与启发',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
    section: 'master-class',
    source: 'file',
    fileUrl: '/mock-files/student-showcase.mp4',
    fileName: '学生作品展示.mp4',
    fileSize: 87000000,
    fileFormat: 'mp4',
    openMode: 'iframe',
    downloadable: true,
    status: 'published',
    sortWeight: 100,
    createdAt: '2026-06-28T14:20:00Z',
    updatedAt: '2026-06-28T14:20:00Z',
    createdBy: 'admin-003'
  },

  // ========== 学习资源（learning-resource）==========
  {
    id: 'lr-001',
    title: 'PBL 课程设计完整指南（PDF）',
    description: '从理论到实践的全流程手册',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop',
    section: 'learning-resource',
    source: 'file',
    fileUrl: '/mock-files/pbl-guide.pdf',
    fileName: 'PBL课程设计指南.pdf',
    fileSize: 5200000, // 5.2MB
    fileFormat: 'pdf',
    openMode: 'iframe',
    downloadable: true,
    status: 'published',
    sortWeight: 1000,
    createdAt: '2026-07-19T10:00:00Z',
    updatedAt: '2026-07-19T10:00:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'lr-002',
    title: '跨学科主题单元模板包',
    description: '含教学设计、评价量规、学生手册等',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    section: 'learning-resource',
    source: 'file',
    fileUrl: '/mock-files/theme-unit-template.zip',
    fileName: '跨学科单元模板包.zip',
    fileSize: 12500000, // 12.5MB
    fileFormat: 'zip',
    openMode: 'redirect',
    downloadable: true,
    status: 'published',
    sortWeight: 900,
    createdAt: '2026-07-17T14:30:00Z',
    updatedAt: '2026-07-17T14:30:00Z',
    createdBy: 'admin-002'
  },
  {
    id: 'lr-003',
    title: '核心素养框架对照表',
    description: '各学科核心素养与跨学科能力映射',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
    section: 'learning-resource',
    source: 'file',
    fileUrl: '/mock-files/competency-framework.xlsx',
    fileName: '核心素养框架.xlsx',
    fileSize: 850000,
    fileFormat: 'xlsx',
    openMode: 'redirect',
    downloadable: true,
    status: 'published',
    sortWeight: 800,
    createdAt: '2026-07-15T09:20:00Z',
    updatedAt: '2026-07-15T09:20:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'lr-004',
    title: '项目式学习评价量规库',
    description: '过程性评价与终结性评价模板',
    coverImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop',
    section: 'learning-resource',
    source: 'file',
    fileUrl: '/mock-files/rubric-library.pdf',
    fileName: '评价量规库.pdf',
    fileSize: 3800000,
    fileFormat: 'pdf',
    openMode: 'iframe',
    downloadable: true,
    status: 'published',
    sortWeight: 700,
    createdAt: '2026-07-13T11:00:00Z',
    updatedAt: '2026-07-13T11:00:00Z',
    createdBy: 'admin-002'
  },
  {
    id: 'lr-005',
    title: '经典 PBL 案例集（30 个）',
    description: '涵盖语文、数学、科学、艺术等学科',
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop',
    section: 'learning-resource',
    source: 'file',
    fileUrl: '/mock-files/pbl-cases.pdf',
    fileName: 'PBL案例集.pdf',
    fileSize: 8900000,
    fileFormat: 'pdf',
    openMode: 'iframe',
    downloadable: true,
    status: 'published',
    sortWeight: 600,
    createdAt: '2026-07-11T15:45:00Z',
    updatedAt: '2026-07-11T15:45:00Z',
    createdBy: 'admin-003'
  },
  {
    id: 'lr-006',
    title: '学生自主学习手册',
    description: '培养学生自主探究能力的指导材料',
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
    section: 'learning-resource',
    source: 'file',
    fileUrl: '/mock-files/self-learning-guide.pdf',
    fileName: '自主学习手册.pdf',
    fileSize: 2100000,
    fileFormat: 'pdf',
    openMode: 'iframe',
    downloadable: true,
    status: 'published',
    sortWeight: 500,
    createdAt: '2026-07-09T10:30:00Z',
    updatedAt: '2026-07-09T10:30:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'lr-007',
    title: '跨学科大概念知识图谱',
    description: '可视化展示学科间的连接关系',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
    section: 'learning-resource',
    source: 'link',
    externalUrl: 'https://miro.com/app/board/example-concept-map/',
    openMode: 'redirect',
    downloadable: false,
    status: 'published',
    sortWeight: 400,
    createdAt: '2026-07-07T13:15:00Z',
    updatedAt: '2026-07-07T13:15:00Z',
    createdBy: 'admin-002'
  },
  {
    id: 'lr-008',
    title: '教学资源推荐清单',
    description: '精选图书、网站、工具等资源',
    coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop',
    section: 'learning-resource',
    source: 'file',
    fileUrl: '/mock-files/resource-list.docx',
    fileName: '教学资源推荐.docx',
    fileSize: 450000,
    fileFormat: 'docx',
    openMode: 'redirect',
    downloadable: true,
    status: 'published',
    sortWeight: 300,
    createdAt: '2026-07-05T09:00:00Z',
    updatedAt: '2026-07-05T09:00:00Z',
    createdBy: 'admin-003'
  },
  {
    id: 'lr-009',
    title: 'STEM 项目工具包',
    description: '含实验器材清单、安全指引、预算模板',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop',
    section: 'learning-resource',
    source: 'file',
    fileUrl: '/mock-files/stem-toolkit.zip',
    fileName: 'STEM工具包.zip',
    fileSize: 18700000,
    fileFormat: 'zip',
    openMode: 'redirect',
    downloadable: true,
    status: 'published',
    sortWeight: 200,
    createdAt: '2026-07-03T14:20:00Z',
    updatedAt: '2026-07-03T14:20:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'lr-010',
    title: '课堂管理技巧速查表',
    description: '常见问题的应对策略与话术',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
    section: 'learning-resource',
    source: 'file',
    fileUrl: '/mock-files/classroom-management.pdf',
    fileName: '课堂管理速查表.pdf',
    fileSize: 1200000,
    fileFormat: 'pdf',
    openMode: 'iframe',
    downloadable: true,
    status: 'published',
    sortWeight: 100,
    createdAt: '2026-07-01T11:30:00Z',
    updatedAt: '2026-07-01T11:30:00Z',
    createdBy: 'admin-002'
  },

  // ========== 互动工具（interactive-tool）==========
  {
    id: 'it-001',
    title: 'AI 课程设计助手',
    description: '智能生成教学目标、活动方案与评价标准',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
    section: 'interactive-tool',
    source: 'link',
    externalUrl: 'https://example.com/ai-course-designer',
    openMode: 'redirect',
    downloadable: false,
    status: 'published',
    sortWeight: 1000,
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'it-002',
    title: '在线白板协作工具',
    description: '支持多人实时协作的思维导图与草图绘制',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
    section: 'interactive-tool',
    source: 'link',
    externalUrl: 'https://miro.com/app/board/example/',
    openMode: 'iframe',
    downloadable: false,
    status: 'published',
    sortWeight: 900,
    createdAt: '2026-07-18T14:30:00Z',
    updatedAt: '2026-07-18T14:30:00Z',
    createdBy: 'admin-002'
  },
  {
    id: 'it-003',
    title: '项目任务拆解工作流',
    description: '一步步引导拆解复杂项目为可执行任务',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
    section: 'interactive-tool',
    source: 'link',
    externalUrl: 'https://example.com/task-breakdown',
    openMode: 'redirect',
    downloadable: false,
    status: 'published',
    sortWeight: 800,
    createdAt: '2026-07-16T09:20:00Z',
    updatedAt: '2026-07-16T09:20:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'it-004',
    title: '学生分组智能助手',
    description: '根据学生特点自动生成异质分组方案',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
    section: 'interactive-tool',
    source: 'link',
    externalUrl: 'https://example.com/grouping-tool',
    openMode: 'iframe',
    downloadable: false,
    status: 'published',
    sortWeight: 700,
    createdAt: '2026-07-14T11:00:00Z',
    updatedAt: '2026-07-14T11:00:00Z',
    createdBy: 'admin-003'
  },
  {
    id: 'it-005',
    title: '互动问卷生成器',
    description: '快速创建课前调研、课堂投票、课后反馈',
    coverImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop',
    section: 'interactive-tool',
    source: 'link',
    externalUrl: 'https://forms.example.com',
    openMode: 'redirect',
    downloadable: false,
    status: 'published',
    sortWeight: 600,
    createdAt: '2026-07-12T15:45:00Z',
    updatedAt: '2026-07-12T15:45:00Z',
    createdBy: 'admin-002'
  },
  {
    id: 'it-006',
    title: '3D 虚拟实验室',
    description: '物理、化学、生物实验的在线仿真平台',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop',
    section: 'interactive-tool',
    source: 'link',
    externalUrl: 'https://example.com/virtual-lab',
    openMode: 'iframe',
    downloadable: false,
    status: 'published',
    sortWeight: 500,
    createdAt: '2026-07-10T10:30:00Z',
    updatedAt: '2026-07-10T10:30:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'it-007',
    title: '概念图自动生成工具',
    description: '输入主题，AI 自动生成知识结构图',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
    section: 'interactive-tool',
    source: 'link',
    externalUrl: 'https://example.com/concept-map-generator',
    openMode: 'redirect',
    downloadable: false,
    status: 'published',
    sortWeight: 400,
    createdAt: '2026-07-08T13:15:00Z',
    updatedAt: '2026-07-08T13:15:00Z',
    createdBy: 'admin-002'
  },
  {
    id: 'it-008',
    title: '课堂互动投票器',
    description: '实时统计学生答题情况，支持多种题型',
    coverImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop',
    section: 'interactive-tool',
    source: 'link',
    externalUrl: 'https://example.com/live-poll',
    openMode: 'iframe',
    downloadable: false,
    status: 'published',
    sortWeight: 300,
    createdAt: '2026-07-06T09:00:00Z',
    updatedAt: '2026-07-06T09:00:00Z',
    createdBy: 'admin-003'
  },
  {
    id: 'it-009',
    title: '学生作品展示平台',
    description: '在线发布与分享项目成果，支持评论互动',
    coverImage: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop',
    section: 'interactive-tool',
    source: 'link',
    externalUrl: 'https://example.com/showcase',
    openMode: 'redirect',
    downloadable: false,
    status: 'published',
    sortWeight: 200,
    createdAt: '2026-07-04T14:20:00Z',
    updatedAt: '2026-07-04T14:20:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'it-010',
    title: '教学视频剪辑助手',
    description: '快速剪辑、添加字幕与特效，无需专业技能',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
    section: 'interactive-tool',
    source: 'link',
    externalUrl: 'https://example.com/video-editor',
    openMode: 'redirect',
    downloadable: false,
    status: 'published',
    sortWeight: 100,
    createdAt: '2026-07-02T11:30:00Z',
    updatedAt: '2026-07-02T11:30:00Z',
    createdBy: 'admin-002'
  }
];

// 辅助函数：按板块和状态筛选
export function getResourcesBySection(section: ResourceSection, status?: ResourceStatus): Resource[] {
  return mockResources
    .filter(r => r.section === section && (status ? r.status === status : true))
    .sort((a, b) => b.sortWeight - a.sortWeight);
}

// 辅助函数：按 ID 获取单个资源
export function getResourceById(id: string): Resource | undefined {
  return mockResources.find(r => r.id === id);
}

// 辅助函数：搜索（匹配标题或描述）
export function searchResources(query: string, status?: ResourceStatus): Resource[] {
  const lowerQuery = query.toLowerCase();
  return mockResources
    .filter(r => 
      (status ? r.status === status : true) &&
      (r.title.toLowerCase().includes(lowerQuery) || r.description?.toLowerCase().includes(lowerQuery))
    )
    .sort((a, b) => b.sortWeight - a.sortWeight);
}

// 辅助函数：按排序模式获取
export function getResourcesSorted(sortMode: 'recommended' | 'newest', status?: ResourceStatus): Resource[] {
  const filtered = mockResources.filter(r => status ? r.status === status : true);
  if (sortMode === 'newest') {
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return filtered.sort((a, b) => b.sortWeight - a.sortWeight);
}
