// 课程中心模拟数据
export interface Course {
  id: string;
  title: string;
  cover: string;
  subjects: string[];
  source: 'official' | 'organization';
  sourceName: string;
  knowledgeTags: string[];
  supportSelfStudy: boolean;
  studentCount: number;
  grade: string;
}

export interface KnowledgeNode {
  id: string;
  name: string;
  subject: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  relatedCourses: string[];
}

export interface KnowledgeLink {
  source: string;
  target: string;
  type: 'prerequisite' | 'related';
  strength: number;
}

export const courses: Course[] = [
  {
    id: '1',
    title: '湿地生态系统与可持续发展',
    cover: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=400&fit=crop',
    subjects: ['生物', '地理'],
    source: 'official',
    sourceName: '官方课程库',
    knowledgeTags: ['生态平衡', '水循环', '生物多样性', '环境保护'],
    supportSelfStudy: true,
    studentCount: 1256,
    grade: '初中'
  },
  {
    id: '2',
    title: '古代丝绸之路的科学与贸易',
    cover: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=400&fit=crop',
    subjects: ['历史', '地理', '化学'],
    source: 'official',
    sourceName: '官方课程库',
    knowledgeTags: ['丝绸制造', '古代贸易', '文化交流', '化学染料'],
    supportSelfStudy: true,
    studentCount: 892,
    grade: '高中'
  },
  {
    id: '3',
    title: '音乐中的数学奥秘',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop',
    subjects: ['数学', '音乐'],
    source: 'organization',
    sourceName: '北京实验中学',
    knowledgeTags: ['频率比例', '黄金分割', '和声学', '节拍规律'],
    supportSelfStudy: false,
    studentCount: 567,
    grade: '初中'
  },
  {
    id: '4',
    title: '城市规划与几何学',
    cover: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=400&fit=crop',
    subjects: ['数学', '地理', '美术'],
    source: 'official',
    sourceName: '官方课程库',
    knowledgeTags: ['几何图形', '空间规划', '比例尺', '城市设计'],
    supportSelfStudy: true,
    studentCount: 743,
    grade: '高中'
  },
  {
    id: '5',
    title: '植物的光合作用与气候变化',
    cover: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop',
    subjects: ['生物', '化学', '地理'],
    source: 'organization',
    sourceName: '上海绿洲学校',
    knowledgeTags: ['光合作用', '碳循环', '温室效应', '生态修复'],
    supportSelfStudy: true,
    studentCount: 1089,
    grade: '初中'
  },
  {
    id: '6',
    title: '古建筑中的力学原理',
    cover: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=600&h=400&fit=crop',
    subjects: ['物理', '历史', '美术'],
    source: 'official',
    sourceName: '官方课程库',
    knowledgeTags: ['结构力学', '榫卯结构', '建筑美学', '文化遗产'],
    supportSelfStudy: false,
    studentCount: 678,
    grade: '高中'
  }
];

export const knowledgeNodes: KnowledgeNode[] = [
  { id: 'n1', name: '生态平衡', subject: '生物', relatedCourses: ['1', '5'] },
  { id: 'n2', name: '水循环', subject: '地理', relatedCourses: ['1'] },
  { id: 'n3', name: '光合作用', subject: '生物', relatedCourses: ['5'] },
  { id: 'n4', name: '碳循环', subject: '化学', relatedCourses: ['5'] },
  { id: 'n5', name: '几何图形', subject: '数学', relatedCourses: ['4'] },
  { id: 'n6', name: '比例关系', subject: '数学', relatedCourses: ['3', '4'] },
  { id: 'n7', name: '文化交流', subject: '历史', relatedCourses: ['2'] },
  { id: 'n8', name: '结构力学', subject: '物理', relatedCourses: ['6'] },
  { id: 'n9', name: '建筑美学', subject: '美术', relatedCourses: ['4', '6'] },
  { id: 'n10', name: '环境保护', subject: '地理', relatedCourses: ['1', '5'] }
];

export const knowledgeLinks: KnowledgeLink[] = [
  { source: 'n1', target: 'n3', type: 'related', strength: 0.8 },
  { source: 'n1', target: 'n10', type: 'related', strength: 0.9 },
  { source: 'n2', target: 'n1', type: 'prerequisite', strength: 0.7 },
  { source: 'n3', target: 'n4', type: 'related', strength: 0.85 },
  { source: 'n4', target: 'n10', type: 'related', strength: 0.6 },
  { source: 'n5', target: 'n6', type: 'prerequisite', strength: 0.9 },
  { source: 'n5', target: 'n9', type: 'related', strength: 0.5 },
  { source: 'n8', target: 'n9', type: 'related', strength: 0.7 }
];

export const subjects = ['全部', '数学', '物理', '化学', '生物', '地理', '历史', '美术', '音乐'];
export const grades = ['全部', '小学', '初中', '高中'];
export const sources = ['全部', '官方', '组织'];

export const platformStats = {
  singleCourses: 156,
  seriesCourses: 28,
  teachers: 342,
  schools: 67
};

// 资源中心模拟数据
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'tool' | 'ability-pack' | 'case';
  cover: string;
  tags: string[];
  learnerCount?: number;
  subjects?: string[];
  concepts?: string[];
}

export const heroTools: Resource[] = [
  {
    id: 't1',
    title: '教案工坊 (C-POTE)',
    description: '使用C-POTE六步设计法，系统化创建你的跨学科教案。',
    type: 'tool',
    cover: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop',
    tags: ['教案设计', '跨学科', '系统化']
  },
  {
    id: 't2',
    title: 'AI跨学科训练场',
    description: '在AI模拟情境中，练习你的跨学科概念引导与课堂互动。',
    type: 'tool',
    cover: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=500&fit=crop',
    tags: ['AI辅助', '情境模拟', '互动练习']
  }
];

export const abilityPacks: Resource[] = [
  {
    id: 'a1',
    title: '跨学科融合入门',
    description: '从零开始理解跨学科教学的核心理念与实践方法。',
    type: 'ability-pack',
    cover: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop',
    tags: ['入门', '理论基础'],
    learnerCount: 2341
  },
  {
    id: 'a2',
    title: 'C-POTE模型详解',
    description: '深入学习C-POTE六步教案设计模型的每个环节。',
    type: 'ability-pack',
    cover: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
    tags: ['进阶', '教案设计'],
    learnerCount: 1856
  },
  {
    id: 'a3',
    title: '高阶提问技巧',
    description: '掌握布鲁姆认知目标层级，设计促进深度思考的问题。',
    type: 'ability-pack',
    cover: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop',
    tags: ['进阶', '课堂互动'],
    learnerCount: 1432
  },
  {
    id: 'a4',
    title: '学生评价与反馈',
    description: '设计有效的形成性评价，提供建设性的学习反馈。',
    type: 'ability-pack',
    cover: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=300&fit=crop',
    tags: ['评价', '反馈'],
    learnerCount: 987
  }
];

export const cases: Resource[] = [
  {
    id: 'c1',
    title: '湿地保护项目',
    description: '结合生物、地理、语文的湿地生态探究项目式学习案例。',
    type: 'case',
    cover: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    subjects: ['生物', '地理', '语文'],
    concepts: ['生态系统', '可持续发展', '科学写作'],
    tags: ['项目式学习', '户外探究']
  },
  {
    id: 'c2',
    title: '非遗技艺的科学原理',
    description: '探索传统工艺背后的物理与化学知识。',
    type: 'case',
    cover: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=400&fit=crop',
    subjects: ['物理', '化学', '历史'],
    concepts: ['材料科学', '文化传承', '工艺技术'],
    tags: ['文化传承', '科学探究']
  },
  {
    id: 'c3',
    title: '校园气象站',
    description: '建立校园气象监测站，学习数据收集与分析。',
    type: 'case',
    cover: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&h=400&fit=crop',
    subjects: ['物理', '数学', '地理'],
    concepts: ['气象观测', '数据分析', '气候变化'],
    tags: ['数据驱动', '实践操作']
  },
  {
    id: 'c4',
    title: '社区口述历史',
    description: '采访社区长者，记录本地历史与文化变迁。',
    type: 'case',
    cover: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop',
    subjects: ['历史', '语文', '社会'],
    concepts: ['口述史', '社区研究', '叙事写作'],
    tags: ['社区参与', '人文关怀']
  },
  {
    id: 'c5',
    title: '食物里的化学',
    description: '探究日常食物中的化学反应与营养科学。',
    type: 'case',
    cover: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
    subjects: ['化学', '生物', '健康'],
    concepts: ['化学反应', '营养学', '食品安全'],
    tags: ['生活化学', '健康教育']
  },
  {
    id: 'c6',
    title: '音乐与物理',
    description: '通过乐器探究声波、振动与和声的科学原理。',
    type: 'case',
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&h=400&fit=crop',
    subjects: ['物理', '音乐', '数学'],
    concepts: ['声波', '振动', '数学比例'],
    tags: ['艺术融合', '动手实验']
  }
];

export const resourceTypes = [
  { value: 'all', label: '全部' },
  { value: 'tool', label: '核心工具' },
  { value: 'ability-pack', label: '能力资源包' },
  { value: 'case', label: '案例与素材' }
];

export const resourceSubjects = ['全部', '数学', '物理', '化学', '生物', '地理', '历史', '语文', '音乐', '美术'];
