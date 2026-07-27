// 工作坊 Mock 数据 + 类型定义
// 定位：线下培训活动的线上入口 + 资料存档 + 成果展示
// 不是在线课程！没有学习进度、报名人数等在线学习语义

// ============ 类型 ============

// 工作坊状态：未开始/进行中/已结束由时间自动计算；已取消由运营手动设置
export type WorkshopStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

// 资料类型（复用学习资源模型的 5 种来源）
export type WorkshopMaterialSource = 'file' | 'link' | 'video' | 'html' | 'ai';

export interface WorkshopInstructor {
  name: string;
  title?: string;      // 头衔（如"华南师范大学教授"）
  avatar?: string;     // 头像 URL，缺失时用姓名首字
  bio?: string;        // 简介
}

export interface WorkshopMaterial {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  source: WorkshopMaterialSource;
  // source=file 或 html 时
  fileUrl?: string;
  fileName?: string;
  fileFormat?: string;
  fileSize?: number;
  // source=link/html/ai 时
  externalUrl?: string;
  // source=video 时
  embedCode?: string;
  openMode: 'redirect' | 'iframe';
  downloadable: boolean;
  // 关联的学习资源 ID（可选）——如果是从学习资源库勾选来的，复用同一条数据
  linkedResourceId?: string;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;              // 简介
  coverImage: string;               // 封面图 URL
  instructor: WorkshopInstructor;   // 讲师
  // 时间地点
  startDate: string;                // ISO 日期，如 "2026-03-10"
  endDate: string;
  location: string;                 // 线下地址或说明文字
  // 分类
  tags: string[];                   // 主题标签
  // 关联
  linkedCourseId?: string;          // 关联到 LMS 里的课程（可选）
  // 资料
  materials: WorkshopMaterial[];
  // 状态
  status: WorkshopStatus;           // 自动计算或手动设为 cancelled
  isCancelled: boolean;             // 是否被手动取消（覆盖自动状态）
  // 元信息
  createdAt: string;
  updatedAt: string;
}

// ============ 状态计算工具 ============

export function calculateWorkshopStatus(workshop: Pick<Workshop, 'startDate' | 'endDate' | 'isCancelled'>): WorkshopStatus {
  if (workshop.isCancelled) return 'cancelled';
  const today = new Date().toISOString().split('T')[0];
  if (today < workshop.startDate) return 'upcoming';
  if (today > workshop.endDate) return 'completed';
  return 'ongoing';
}

// ============ 板块元数据 ============

export const WORKSHOP_STATUS_META: Record<WorkshopStatus, { label: string; color: string; bgColor: string }> = {
  upcoming: { label: '未开始', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  ongoing: { label: '进行中', color: 'text-primary-700', bgColor: 'bg-primary-100' },
  completed: { label: '已结束', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  cancelled: { label: '已取消', color: 'text-red-700', bgColor: 'bg-red-100' },
};

// ============ Mock 数据 ============

export const mockWorkshops: Workshop[] = [
  {
    id: 'ws_001',
    title: '跨学科教学设计工作坊',
    description: '深入学习 C-POTE 模型，掌握跨学科课程设计的核心方法，通过真实情境任务提炼大概念',
    coverImage: '',
    instructor: {
      name: '张教授',
      title: '华南师范大学教育信息技术学院教授',
      bio: '深耕跨学科教学研究 15 年，主持多项国家级课题',
    },
    startDate: '2026-08-15',
    endDate: '2026-08-17',
    location: '广州市天河区华南师范大学教育信息技术学院 3 号楼报告厅',
    tags: ['跨学科', '教学设计', 'C-POTE'],
    linkedCourseId: 'course_001',
    materials: [
      {
        id: 'mat_001_1',
        title: 'C-POTE 模型详解',
        description: '跨学科教学设计核心方法论',
        source: 'file',
        fileName: 'C-POTE模型详解.pdf',
        fileFormat: 'pdf',
        fileSize: 2400000,
        fileUrl: '#',
        openMode: 'iframe',
        downloadable: true,
      },
      {
        id: 'mat_001_2',
        title: '2026年跨学科教学案例集',
        description: '20+ 一线教师精选案例',
        source: 'file',
        fileName: '案例集.pdf',
        fileFormat: 'pdf',
        fileSize: 8600000,
        fileUrl: '#',
        openMode: 'iframe',
        downloadable: true,
      },
    ],
    status: 'upcoming',
    isCancelled: false,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
  },
  {
    id: 'ws_002',
    title: '课堂提问与深度学习工作坊',
    description: '基于布鲁姆认知目标层级，设计促进高阶思维的提问序列，培养学生元认知与批判性思维',
    coverImage: '',
    instructor: {
      name: '李老师',
      title: '深圳中学高级教师',
      bio: '国家级教学能手，深耕课堂提问艺术 10 年',
    },
    startDate: '2026-07-20',
    endDate: '2026-07-25',
    location: '深圳市福田区深圳中学阶梯教室',
    tags: ['提问技巧', '深度学习', '布鲁姆'],
    materials: [
      {
        id: 'mat_002_1',
        title: '布鲁姆认知目标分类实操手册',
        source: 'file',
        fileName: '布鲁姆手册.pdf',
        fileFormat: 'pdf',
        fileSize: 3200000,
        fileUrl: '#',
        openMode: 'iframe',
        downloadable: true,
      },
    ],
    status: 'ongoing',
    isCancelled: false,
    createdAt: '2026-06-15T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
  },
  {
    id: 'ws_003',
    title: 'AI 融合教学实践工作坊',
    description: '探索 AI 智能体与跨学科教学的深度融合，设计人机协同学习任务，提升课堂个性化支持能力',
    coverImage: '',
    instructor: {
      name: '王博士',
      title: '腾讯教育 AI 首席架构师',
    },
    startDate: '2026-09-01',
    endDate: '2026-09-03',
    location: '深圳市南山区腾讯滨海大厦 2 号楼创新空间',
    tags: ['AI融合教学', '智能体', '个性化学习'],
    materials: [],
    status: 'upcoming',
    isCancelled: false,
    createdAt: '2026-07-05T00:00:00.000Z',
    updatedAt: '2026-07-22T00:00:00.000Z',
  },
  {
    id: 'ws_004',
    title: '形成性评价与教学调整工作坊',
    description: '掌握嵌入式形成性评价策略，通过课堂证据即时诊断学习状态，实现"教学评一致性"',
    coverImage: '',
    instructor: {
      name: '陈老师',
      title: '广东省教育评估研究院研究员',
    },
    startDate: '2025-11-05',
    endDate: '2025-11-07',
    location: '广州市越秀区广东省教育评估研究院会议中心',
    tags: ['形成性评价', '教学评一致', '学习诊断'],
    materials: [
      {
        id: 'mat_004_1',
        title: '形成性评价工具包',
        source: 'file',
        fileName: '评价工具包.zip',
        fileFormat: 'zip',
        fileSize: 15000000,
        fileUrl: '#',
        openMode: 'redirect',
        downloadable: true,
      },
      {
        id: 'mat_004_2',
        title: '现场演示视频',
        source: 'link',
        externalUrl: 'https://example.com/video',
        openMode: 'iframe',
        downloadable: false,
      },
    ],
    status: 'completed',
    isCancelled: false,
    createdAt: '2025-10-01T00:00:00.000Z',
    updatedAt: '2025-11-08T00:00:00.000Z',
  },
  {
    id: 'ws_005',
    title: '项目式学习设计工作坊',
    description: '掌握 PBL 核心设计方法：从真实情境问题出发，设计驱动性问题与探究任务序列，培养学生综合素养',
    coverImage: '',
    instructor: {
      name: '刘教授',
      title: '北京师范大学教育学部教授',
    },
    startDate: '2025-09-10',
    endDate: '2025-09-13',
    location: '北京师范大学后主楼报告厅',
    tags: ['PBL', '驱动性问题', '综合素养'],
    materials: [
      {
        id: 'mat_005_1',
        title: 'PBL 设计模板',
        source: 'file',
        fileName: 'PBL模板.docx',
        fileFormat: 'docx',
        fileSize: 450000,
        fileUrl: '#',
        openMode: 'redirect',
        downloadable: true,
      },
    ],
    status: 'completed',
    isCancelled: false,
    createdAt: '2025-08-01T00:00:00.000Z',
    updatedAt: '2025-09-14T00:00:00.000Z',
  },
  {
    id: 'ws_006',
    title: 'STEAM 跨学科融合工作坊',
    description: '结合科学、技术、工程、艺术、数学，打破学科壁垒，设计真实世界导向的项目学习',
    coverImage: '',
    instructor: {
      name: '赵老师',
      title: '上海市 STEAM 教育示范校主任',
    },
    startDate: '2026-06-01',
    endDate: '2026-06-05',
    location: '上海市浦东新区（因故取消）',
    tags: ['STEAM', '跨学科', '项目学习'],
    materials: [],
    status: 'cancelled',
    isCancelled: true,
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-28T00:00:00.000Z',
  },
];
