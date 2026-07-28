// 工作坊 Mock 数据 + 类型定义
// 定位：线下培训活动的线上入口 + 资料存档 + 成果展示
// 从最简陋（讲座信息 + 1-2 张合照）到最丰富（多讲师 + 规划 + 资料 + 相册 + 视频 + 参会者成果）均支持
// 所有可选内容板块在教师端"无内容时不展示"

// ============ 类型 ============

export type WorkshopStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

// 资料类型（复用学习资源的 5 种来源）
export type WorkshopMaterialSource = 'file' | 'link' | 'video' | 'html' | 'ai';

// ---- 讲师 ----
export interface WorkshopInstructor {
  id: string;              // 讲师 ID
  name: string;
  title?: string;          // 头衔（"华南师范大学教授"）
  avatar?: string;         // 头像 URL，缺失时用姓名首字
  bio?: string;            // 简介
}

// ---- 培训资料 ----
export interface WorkshopMaterial {
  id: string;
  title: string;
  description?: string;
  source: WorkshopMaterialSource;
  fileUrl?: string;
  fileName?: string;
  fileFormat?: string;
  fileSize?: number;
  externalUrl?: string;
  embedCode?: string;
  openMode: 'redirect' | 'iframe';
  downloadable: boolean;
  linkedResourceId?: string; // 复用学习资源库的 ID
}

// ---- 活动相册（合照/花絮图） ----
export interface WorkshopPhoto {
  id: string;
  url: string;             // 图片 URL
  caption?: string;        // 图片说明
}

// ---- 活动视频（现场录像/回放） ----
export interface WorkshopVideo {
  id: string;
  title: string;
  // 二选一：本地文件 或 外部 embed
  fileUrl?: string;        // 本地上传的视频文件
  embedCode?: string;      // 外部视频 embed 代码（B站/腾讯视频等）
  coverImage?: string;     // 视频封面
  duration?: string;       // 时长文本（"12:30"）
}

// ---- 参会老师及其成果 ----
export interface WorkshopParticipantOutcome {
  id: string;
  type: 'file' | 'link' | 'image' | 'text';  // 成果类型
  title: string;
  description?: string;
  // type=file/image
  fileUrl?: string;
  fileName?: string;
  // type=link
  externalUrl?: string;
  // type=text
  content?: string;
}

export interface WorkshopParticipant {
  id: string;
  name: string;
  school?: string;         // 所在学校
  subject?: string;        // 学科
  avatar?: string;
  bio?: string;            // 个人简介
  outcomes: WorkshopParticipantOutcome[];  // 该老师在本次工作坊的成果
}

// ---- 关联的学习资源（可选，从资源库勾选） ----
export interface WorkshopLinkedResource {
  id: string;              // Resource.id
  title: string;
  description?: string;
  section: 'master-class' | 'interactive-tool' | 'learning-resource';
  // 展示时按 ResourceCard 的模式，点击直接打开学习资源的预览弹窗
}

// ---- 关联的课程 ----
export interface WorkshopLinkedCourse {
  id: string;              // course.id
  title: string;           // 课程名
  description?: string;
  coverImage?: string;
  subject?: string;        // 学科
  grade?: string;          // 年级
}

// ---- 主体：工作坊 ----
export interface Workshop {
  id: string;
  title: string;
  description: string;              // 简介
  coverImage: string;               // 封面图 URL
  agenda?: string;                  // 活动规划/日程（长文本，Markdown-friendly，选填）
  instructors: WorkshopInstructor[]; // 讲师数组，至少 1 位
  // 时间地点
  startDate: string;                // ISO 日期
  endDate: string;
  location: string;                 // 线下地址
  // 分类
  tags: string[];
  // 可选内容板块（全部选填）
  linkedCourses?: WorkshopLinkedCourse[];   // 关联课程
  linkedResources?: WorkshopLinkedResource[]; // 关联学习资源（勾选自资源库）
  materials?: WorkshopMaterial[];    // 培训资料（本场专属）
  photos?: WorkshopPhoto[];          // 活动相册
  videos?: WorkshopVideo[];          // 活动视频
  participants?: WorkshopParticipant[]; // 参会老师及成果
  // 状态
  status: WorkshopStatus;
  isCancelled: boolean;
  // 元信息
  createdAt: string;
  updatedAt: string;
}

// ============ 状态计算 ============

export function calculateWorkshopStatus(workshop: Pick<Workshop, 'startDate' | 'endDate' | 'isCancelled'>): WorkshopStatus {
  if (workshop.isCancelled) return 'cancelled';
  const today = new Date().toISOString().split('T')[0];
  if (today < workshop.startDate) return 'upcoming';
  if (today > workshop.endDate) return 'completed';
  return 'ongoing';
}

export const WORKSHOP_STATUS_META: Record<WorkshopStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  upcoming:  { label: '未开始', color: 'text-gray-700',    bgColor: 'bg-gray-100',    dotColor: 'bg-gray-400' },
  ongoing:   { label: '进行中', color: 'text-primary-700', bgColor: 'bg-primary-100', dotColor: 'bg-primary-500' },
  completed: { label: '已结束', color: 'text-blue-700',    bgColor: 'bg-blue-100',    dotColor: 'bg-blue-500' },
  cancelled: { label: '已取消', color: 'text-red-700',     bgColor: 'bg-red-100',     dotColor: 'bg-red-500' },
};

// ============ Mock 数据（覆盖从简陋到丰富）============

export const mockWorkshops: Workshop[] = [
  // ---------- 最简陋：只有基础信息 ----------
  {
    id: 'ws_simple_01',
    title: '青年教师入职培训',
    description: '面向新入职教师的欢迎会，介绍学校文化与常用教学工具。',
    coverImage: '',
    instructors: [
      { id: 'ins_01', name: '刘校长', title: '校长' },
    ],
    startDate: '2026-09-15',
    endDate: '2026-09-15',
    location: '学校礼堂',
    tags: ['入职'],
    status: 'upcoming',
    isCancelled: false,
    createdAt: '2026-07-25T00:00:00.000Z',
    updatedAt: '2026-07-25T00:00:00.000Z',
  },

  // ---------- 中等丰富：有多讲师 + 规划 + 少量资料 ----------
  {
    id: 'ws_001',
    title: '跨学科教学设计工作坊',
    description: '深入学习 C-POTE 模型，掌握跨学科课程设计的核心方法，通过真实情境任务提炼大概念',
    coverImage: '',
    agenda: `**Day 1（8月15日）：理论奠基**
- 09:00–10:30 开场：跨学科教育的时代背景（张教授）
- 10:45–12:00 C-POTE 模型五要素详解（张教授）
- 14:00–17:00 分组研讨：从课标到大概念

**Day 2（8月16日）：设计实操**
- 09:00–12:00 真实情境任务设计工作坊（王教研）
- 14:00–17:00 小组产出：一份完整的跨学科单元设计

**Day 3（8月17日）：汇报交流**
- 09:00–12:00 分组汇报 + 专家点评
- 14:00–16:00 结业与后续跟踪安排`,
    instructors: [
      {
        id: 'ins_zhang',
        name: '张教授',
        title: '华南师范大学教育信息技术学院教授',
        bio: '深耕跨学科教学研究 15 年，主持国家级课题多项。',
      },
      {
        id: 'ins_wang',
        name: '王教研',
        title: '广州市教育研究院跨学科教研员',
        bio: '一线教研 12 年，主编《跨学科教学设计手册》。',
      },
    ],
    startDate: '2026-08-15',
    endDate: '2026-08-17',
    location: '广州市天河区华南师范大学教育信息技术学院 3 号楼报告厅',
    tags: ['跨学科', '教学设计', 'C-POTE'],
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
    ],
    status: 'upcoming',
    isCancelled: false,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
  },

  // ---------- 最丰富：全字段都有 ----------
  {
    id: 'ws_rich_01',
    title: '形成性评价与教学调整工作坊（2025 秋季专场）',
    description: '掌握嵌入式形成性评价策略，通过课堂证据即时诊断学习状态，实现"教学评一致性"',
    coverImage: '',
    agenda: `**Day 1（11月5日）：诊断先行**
- 09:00–12:00 形成性评价的核心逻辑（陈老师）
- 14:00–17:00 常用工具演示：出口票、KWL、思维可视化

**Day 2（11月6日）：设计工作坊**
- 09:00–12:00 你的课堂上有哪些"评价盲区"（李老师）
- 14:00–17:00 分组：为下学期一个单元设计评价方案

**Day 3（11月7日）：反馈闭环**
- 09:00–12:00 反馈的艺术：怎么让学生"听得进去"
- 14:00–16:00 结业展示与颁证`,
    instructors: [
      {
        id: 'ins_chen',
        name: '陈老师',
        title: '广东省教育评估研究院研究员',
        bio: '专注课堂评价 10 年，多项省级课题主持人。',
      },
      {
        id: 'ins_li',
        name: '李老师',
        title: '深圳中学高级教师',
        bio: '国家级教学能手，深耕课堂提问艺术。',
      },
    ],
    startDate: '2025-11-05',
    endDate: '2025-11-07',
    location: '广州市越秀区广东省教育评估研究院会议中心',
    tags: ['形成性评价', '教学评一致', '学习诊断'],
    linkedCourses: [
      {
        id: 'course_form_eval_demo',
        title: '五年级数学"分数的意义"单元（形成性评价示范）',
        description: '3 课时完整单元，含 5 个嵌入式评价工具',
        subject: '数学',
        grade: '五年级',
      },
    ],
    linkedResources: [
      {
        id: 'res_kwl_template',
        title: 'KWL 图表模板包',
        description: '10 种学科变体，可直接课堂使用',
        section: 'learning-resource',
      },
    ],
    materials: [
      {
        id: 'mat_004_1',
        title: '形成性评价工具包',
        description: '20+ 常用工具速查手册',
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
        title: '陈老师主题讲座视频（含字幕）',
        source: 'link',
        externalUrl: 'https://example.com/lecture',
        openMode: 'iframe',
        downloadable: false,
      },
    ],
    photos: [
      { id: 'ph_1', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop', caption: '开场合影' },
      { id: 'ph_2', url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop', caption: '分组讨论' },
      { id: 'ph_3', url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop', caption: '课堂演示' },
      { id: 'ph_4', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop', caption: '现场问答' },
    ],
    videos: [
      {
        id: 'vid_1',
        title: '陈老师主题演讲（完整版）',
        embedCode: '<iframe src="https://player.bilibili.com/player.html?bvid=BV1xx411c7mu&page=1" allowfullscreen style="width:100%;height:100%"></iframe>',
        duration: '58:12',
      },
    ],
    participants: [
      {
        id: 'p_001',
        name: '陈小蓝',
        school: '深圳中学',
        subject: '语文',
        bio: '10 年教龄，热衷课堂创新',
        outcomes: [
          {
            id: 'out_001_1',
            type: 'file',
            title: '古诗单元形成性评价方案',
            description: '包含 4 个嵌入式评价点',
            fileName: '古诗评价方案.pdf',
            fileUrl: '#',
          },
          {
            id: 'out_001_2',
            type: 'image',
            title: '学生思维可视化作品拼贴',
            fileUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
          },
        ],
      },
      {
        id: 'p_002',
        name: '林晓明',
        school: '广州执信中学',
        subject: '数学',
        outcomes: [
          {
            id: 'out_002_1',
            type: 'link',
            title: '在线互动课件（分数概念）',
            externalUrl: 'https://example.com/interactive',
          },
        ],
      },
      {
        id: 'p_003',
        name: '张思远',
        school: '广州市第二中学',
        subject: '物理',
        outcomes: [
          {
            id: 'out_003_1',
            type: 'text',
            title: '培训感悟：从"考"到"评"',
            content: '过去我总是想着怎么设计试题去"考"学生，这次工作坊让我真正理解了评价是为了改进教学……',
          },
        ],
      },
    ],
    status: 'completed',
    isCancelled: false,
    createdAt: '2025-10-01T00:00:00.000Z',
    updatedAt: '2025-11-08T00:00:00.000Z',
  },

  // ---------- 已取消示例 ----------
  {
    id: 'ws_cancelled_01',
    title: '2025 冬季 AI 教学论坛',
    description: '原计划围绕生成式 AI 在课堂的应用展开，因场地调整临时取消。',
    coverImage: '',
    instructors: [
      { id: 'ins_ai', name: '王博士', title: '腾讯教育 AI 首席架构师' },
    ],
    startDate: '2025-12-20',
    endDate: '2025-12-21',
    location: '深圳市南山区腾讯滨海大厦',
    tags: ['AI融合教学'],
    status: 'cancelled',
    isCancelled: true,
    createdAt: '2025-11-01T00:00:00.000Z',
    updatedAt: '2025-11-25T00:00:00.000Z',
  },
];
