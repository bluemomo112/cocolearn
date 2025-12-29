'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import * as d3 from 'd3'

// ==================== 类型定义 ====================
interface Course {
  id: string
  title: string
  cover: string
  subjects: string[]
  source: 'official' | 'organization'
  concepts: string[] // 跨学科大概念
  studentCount: number
  rating: number
}

interface KnowledgeNode {
  id: string
  name: string
  subject: string
  level: 1 | 2 | 3 // 1=学科大概念, 2=关键概念, 3=知识内容
  category: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface KnowledgeLink {
  source: string
  target: string
  type: 'contains' | 'related' | 'prerequisite'
  strength: number
}

// ==================== 数据 ====================
const platformStats = {
  singleCourses: 186,
  seriesCourses: 34,
  teachers: 428,
  schools: 67,
}

const subjects = ['全部', '语文', '数学', '物理', '化学', '生物', '地理', '历史', '道德与法治', '信息科技']
const sources = ['全部', '官方', '组织']

// 跨学科课程数据
const courses: Course[] = [
  {
    id: '1',
    title: '湿地生态系统的科学探究',
    cover: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=400&h=300&fit=crop',
    subjects: ['生物', '地理'],
    source: 'official',
    concepts: ['系统与平衡', '生态系统', '水循环', '生物多样性'],
    studentCount: 1240,
    rating: 4.8,
  },
  {
    id: '2',
    title: '古诗词中的天文地理',
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    subjects: ['语文', '地理'],
    source: 'organization',
    concepts: ['诗词鉴赏', '天文现象', '地理特征', '文化传承'],
    studentCount: 890,
    rating: 4.9,
  },
  {
    id: '3',
    title: '数据可视化与统计分析',
    cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    subjects: ['数学', '信息科技'],
    source: 'official',
    concepts: ['统计推断', '数据表示', '算法思维', '可视化设计'],
    studentCount: 2100,
    rating: 4.7,
  },
  {
    id: '4',
    title: '文艺复兴的科学革命',
    cover: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop',
    subjects: ['历史', '物理'],
    source: 'organization',
    concepts: ['科学发展', '文化变革', '天文学', '力学基础'],
    studentCount: 643,
    rating: 4.6,
  },
  {
    id: '5',
    title: '音乐中的数学之美',
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop',
    subjects: ['数学', '音乐'],
    source: 'official',
    concepts: ['波形与频率', '比例关系', '和声原理', '数学建模'],
    studentCount: 756,
    rating: 4.8,
  },
  {
    id: '6',
    title: '化学反应与艺术创作',
    cover: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop',
    subjects: ['化学', '美术'],
    source: 'organization',
    concepts: ['化学变化', '颜料科学', '材料特性', '色彩理论'],
    studentCount: 512,
    rating: 4.5,
  },
  {
    id: '7',
    title: '编程思维与逻辑推理',
    cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop',
    subjects: ['信息科技', '数学'],
    source: 'official',
    concepts: ['算法设计', '逻辑思维', '问题分解', '抽象建模'],
    studentCount: 1890,
    rating: 4.9,
  },
  {
    id: '8',
    title: '生态文明与可持续发展',
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    subjects: ['生物', '道德与法治'],
    source: 'official',
    concepts: ['生态平衡', '责任意识', '可持续发展', '环境伦理'],
    studentCount: 1023,
    rating: 4.7,
  },
  {
    id: '9',
    title: '历史事件中的地理因素',
    cover: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop',
    subjects: ['历史', '地理'],
    source: 'organization',
    concepts: ['地缘政治', '气候影响', '资源分布', '文明交流'],
    studentCount: 678,
    rating: 4.6,
  },
  {
    id: '10',
    title: 'AI与信息素养教育',
    cover: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    subjects: ['信息科技', '道德与法治'],
    source: 'official',
    concepts: ['人工智能', '信息安全', '网络伦理', '数字公民'],
    studentCount: 1456,
    rating: 4.8,
  },
  {
    id: '11',
    title: '化学元素与宇宙起源',
    cover: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
    subjects: ['化学', '物理'],
    source: 'organization',
    concepts: ['元素周期律', '恒星演化', '核反应', '宇宙结构'],
    studentCount: 534,
    rating: 4.7,
  },
  {
    id: '12',
    title: '水循环与气候变化',
    cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    subjects: ['地理', '物理'],
    source: 'official',
    concepts: ['水循环', '能量转换', '气候系统', '全球变暖'],
    studentCount: 1678,
    rating: 4.8,
  },
]

// 基于学科大概念的知识图谱节点
const knowledgeNodes: KnowledgeNode[] = [
  // ========== 学科大概念 (Level 1) - 各学科核心节点 ==========
  { id: 'chinese', name: '语文', subject: '语文', level: 1, category: '语言文字' },
  { id: 'math', name: '数学', subject: '数学', level: 1, category: '数理逻辑' },
  { id: 'physics', name: '物理', subject: '物理', level: 1, category: '自然科学' },
  { id: 'chemistry', name: '化学', subject: '化学', level: 1, category: '自然科学' },
  { id: 'biology', name: '生物', subject: '生物', level: 1, category: '自然科学' },
  { id: 'geography', name: '地理', subject: '地理', level: 1, category: '人文社科' },
  { id: 'history', name: '历史', subject: '历史', level: 1, category: '人文社科' },
  { id: 'politics', name: '道德与法治', subject: '道德与法治', level: 1, category: '人文社科' },
  { id: 'it', name: '信息科技', subject: '信息科技', level: 1, category: '技术应用' },

  // ========== 语文关键概念 (Level 2) ==========
  { id: 'literature', name: '文学阅读与创意表达', subject: '语文', level: 2, category: '语言文字' },
  { id: 'thinking', name: '思辨性阅读与表达', subject: '语文', level: 2, category: '语言文字' },
  { id: 'crossread', name: '跨学科学习', subject: '语文', level: 2, category: '语言文字' },
  { id: 'practicalread', name: '实用性阅读与交流', subject: '语文', level: 2, category: '语言文字' },
  { id: 'accumulation', name: '语言文字积累与梳理', subject: '语文', level: 2, category: '语言文字' },
  { id: 'bookreading', name: '整本书阅读', subject: '语文', level: 2, category: '语言文字' },

  // 语文知识内容 (Level 3)
  { id: 'ch_hanculture', name: '汉字文化内涵', subject: '语文', level: 3, category: '语言文字' },
  { id: 'ch_litappreciate', name: '文学鉴赏能力', subject: '语文', level: 3, category: '语言文字' },
  { id: 'ch_creativewrite', name: '创意写作实践', subject: '语文', level: 3, category: '语言文字' },
  { id: 'ch_criticalread', name: '批判性阅读', subject: '语文', level: 3, category: '语言文字' },
  { id: 'ch_infoget', name: '信息获取与整合', subject: '语文', level: 3, category: '语言文字' },
  { id: 'ch_readingplan', name: '深度阅读策略', subject: '语文', level: 3, category: '语言文字' },
  { id: 'ch_multidiscipline', name: '多学科资源整合', subject: '语文', level: 3, category: '语言文字' },

  // ========== 数学关键概念 (Level 2) ==========
  { id: 'dataanalysis', name: '数据分析与应用', subject: '数学', level: 2, category: '数理逻辑' },
  { id: 'function', name: '函数与建模', subject: '数学', level: 2, category: '数理逻辑' },
  { id: 'geometry', name: '空间与几何', subject: '数学', level: 2, category: '数理逻辑' },
  { id: 'algebra', name: '数与代数', subject: '数学', level: 2, category: '数理逻辑' },
  { id: 'statistics', name: '统计与概率', subject: '数学', level: 2, category: '数理逻辑' },
  { id: 'mathmodel', name: '数学建模与问题解决', subject: '数学', level: 2, category: '数理逻辑' },

  // 数学知识内容 (Level 3)
  { id: 'ma_numtheory', name: '数系扩展与运算', subject: '数学', level: 3, category: '数理逻辑' },
  { id: 'ma_equation', name: '方程与不等式', subject: '数学', level: 3, category: '数理逻辑' },
  { id: 'ma_function', name: '函数概念与性质', subject: '数学', level: 3, category: '数理逻辑' },
  { id: 'ma_geometry', name: '图形性质与度量', subject: '数学', level: 3, category: '数理逻辑' },
  { id: 'ma_coordinate', name: '坐标系与解析几何', subject: '数学', level: 3, category: '数理逻辑' },
  { id: 'ma_datacollect', name: '数据收集与整理', subject: '数学', level: 3, category: '数理逻辑' },
  { id: 'ma_probability', name: '概率计算与应用', subject: '数学', level: 3, category: '数理逻辑' },

  // ========== 物理关键概念 (Level 2) ==========
  { id: 'motion', name: '运动与相互作用', subject: '物理', level: 2, category: '自然科学' },
  { id: 'energy', name: '能量守恒与可持续发展', subject: '物理', level: 2, category: '自然科学' },
  { id: 'wave', name: '声和光', subject: '物理', level: 2, category: '自然科学' },
  { id: 'matterphysics', name: '物质', subject: '物理', level: 2, category: '自然科学' },
  { id: 'electromagnetic', name: '电和磁', subject: '物理', level: 2, category: '自然科学' },
  { id: 'phyexperiment', name: '实验探究方法论', subject: '物理', level: 2, category: '自然科学' },

  // 物理知识内容 (Level 3)
  { id: 'ph_mechanical', name: '机械运动和力', subject: '物理', level: 3, category: '自然科学' },
  { id: 'ph_sound', name: '声音产生与传播', subject: '物理', level: 3, category: '自然科学' },
  { id: 'ph_light', name: '光的反射与折射', subject: '物理', level: 3, category: '自然科学' },
  { id: 'ph_electric', name: '静电现象与电流', subject: '物理', level: 3, category: '自然科学' },
  { id: 'ph_magnetic', name: '磁场与电磁感应', subject: '物理', level: 3, category: '自然科学' },
  { id: 'ph_energytrans', name: '能量形式与转化', subject: '物理', level: 3, category: '自然科学' },
  { id: 'ph_material', name: '物质的属性', subject: '物理', level: 3, category: '自然科学' },
  { id: 'ph_structure', name: '物质的结构与尺度', subject: '物理', level: 3, category: '自然科学' },

  // ========== 化学关键概念 (Level 2) - 义务教育 ==========
  { id: 'chem_experiment', name: '化学科学探究与实验', subject: '化学', level: 2, category: '自然科学' },
  { id: 'chem_property', name: '物质的性质与应用', subject: '化学', level: 2, category: '自然科学' },
  { id: 'chem_composition', name: '物质的组成与结构', subject: '化学', level: 2, category: '自然科学' },
  { id: 'chem_change', name: '物质的化学变化', subject: '化学', level: 2, category: '自然科学' },
  { id: 'chem_society', name: '化学与社会的跨学科实践', subject: '化学', level: 2, category: '自然科学' },

  // 化学关键概念 (Level 2) - 高中
  { id: 'matter', name: '物质的组成、结构与性质关系', subject: '化学', level: 2, category: '自然科学' },
  { id: 'reaction', name: '化学反应规律与调控', subject: '化学', level: 2, category: '自然科学' },
  { id: 'sustainable', name: '化学与可持续发展', subject: '化学', level: 2, category: '自然科学' },

  // 化学知识内容 (Level 3)
  { id: 'ch_matterclass', name: '物质分类', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_atomstruct', name: '原子结构与元素性质', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_chembond', name: '化学键与分子作用力', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_organic', name: '有机化合物结构与官能团', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_reactnature', name: '化学变化本质与能量', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_ionicreact', name: '离子反应规律', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_chambalance', name: '化学平衡与反应限度', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_reactrate', name: '化学反应速率与影响因素', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_solution', name: '水溶液离子平衡', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_experiment', name: '化学实验基础技能', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_inquiry', name: '科学探究流程与方法', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_resources', name: '自然资源开发利用', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_pollution', name: '环境污染与防治', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_green', name: '绿色化学与资源循环', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_material', name: '化学与材料应用', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_health', name: '化学与人体健康', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_periodic', name: '物质结构与周期律', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_organicbase', name: '有机化学基础', subject: '化学', level: 3, category: '自然科学' },
  { id: 'ch_energyconv', name: '化学反应与能量转化', subject: '化学', level: 3, category: '自然科学' },

  // ========== 生物关键概念 (Level 2) ==========
  { id: 'life', name: '生物体的结构层次', subject: '生物', level: 2, category: '自然科学' },
  { id: 'diversity', name: '生物的多样性', subject: '生物', level: 2, category: '自然科学' },
  { id: 'ecology', name: '生物与环境', subject: '生物', level: 2, category: '自然科学' },
  { id: 'plantlife', name: '植物的生活', subject: '生物', level: 2, category: '自然科学' },
  { id: 'humanhealth', name: '人体生理与健康', subject: '生物', level: 2, category: '自然科学' },
  { id: 'genetics', name: '遗传与进化', subject: '生物', level: 2, category: '自然科学' },
  { id: 'bio_practice', name: '跨学科实践', subject: '生物', level: 2, category: '自然科学' },

  // 生物知识内容 (Level 3)
  { id: 'bio_cell', name: '细胞基本结构', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_tissue', name: '生物体组织结构', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_classify', name: '生物分类系统', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_microbe', name: '微生物世界', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_protection', name: '生物资源保护', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_ecosystem', name: '生态系统基础', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_ecosafety', name: '生态安全维护', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_growth', name: '植物生长发育', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_physiology', name: '植物生理功能', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_system', name: '人体系统功能', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_healthcare', name: '健康维护', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_dna', name: '遗传信息传递', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_evolution', name: '生物进化证据', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_model', name: '模型制作类', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_cultivation', name: '栽培饲养类', subject: '生物', level: 3, category: '自然科学' },
  { id: 'bio_fermentation', name: '发酵技术类', subject: '生物', level: 3, category: '自然科学' },

  // ========== 地理关键概念 (Level 2) ==========
  { id: 'universe', name: '地球的宇宙环境', subject: '地理', level: 2, category: '人文社科' },
  { id: 'earthmotion', name: '地球的运动', subject: '地理', level: 2, category: '人文社科' },
  { id: 'earthsys', name: '地球表层系统', subject: '地理', level: 2, category: '人文社科' },
  { id: 'region', name: '区域认知方法', subject: '地理', level: 2, category: '人文社科' },
  { id: 'geotools', name: '地理工具与实践能力', subject: '地理', level: 2, category: '人文社科' },
  { id: 'geo_practice', name: '跨学科主题学习', subject: '地理', level: 2, category: '人文社科' },

  // 地理知识内容 (Level 3)
  { id: 'geo_earthpos', name: '地球在宇宙中', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_space', name: '太空探索', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_rotation', name: '地球自转', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_revolution', name: '地球公转', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_landsea', name: '陆地和海洋', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_weather', name: '天气与气候', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_residents', name: '居民与文化', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_develop', name: '发展与合作', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_world', name: '认识世界', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_china', name: '认识中国', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_hometown', name: '认识家乡', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_tools', name: '地理工具应用', subject: '地理', level: 3, category: '人文社科' },
  { id: 'geo_practice', name: '地理实践方法', subject: '地理', level: 3, category: '人文社科' },

  // ========== 历史关键概念 (Level 2) ==========
  { id: 'historical', name: '唯物史观指导下的历史认知', subject: '历史', level: 2, category: '人文社科' },
  { id: 'chinahistory', name: '中国历史演进脉络', subject: '历史', level: 2, category: '人文社科' },
  { id: 'worldhistory', name: '世界文明互动与发展', subject: '历史', level: 2, category: '人文社科' },
  { id: 'historythink', name: '时空观念构建', subject: '历史', level: 2, category: '人文社科' },
  { id: 'history_practice', name: '跨学科主题融合实践', subject: '历史', level: 2, category: '人文社科' },

  // 历史知识内容 (Level 3)
  { id: 'hi_historical', name: '历史本质与规律', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_method', name: '历史研究方法论', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_period', name: '时序与分期', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_space', name: '空间与地域', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_ancient', name: '古代统一多民族国家形成', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_modern', name: '近代民族独立斗争', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_contemporary', name: '现代社会主义探索', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_civilization', name: '古代多元文明格局', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_capitalism', name: '近代资本主义扩张', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_globalization', name: '现代全球化与挑战', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_tech', name: '历史与科技交融', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_culture', name: '历史与文化艺术', subject: '历史', level: 3, category: '人文社科' },
  { id: 'hi_society', name: '历史与社会探究', subject: '历史', level: 3, category: '人文社科' },

  // ========== 道德与法治关键概念 (Level 2) ==========
  { id: 'identity', name: '政治认同', subject: '道德与法治', level: 2, category: '人文社科' },
  { id: 'morality', name: '道德修养', subject: '道德与法治', level: 2, category: '人文社科' },
  { id: 'law', name: '法治观念', subject: '道德与法治', level: 2, category: '人文社科' },
  { id: 'personality', name: '健全人格', subject: '道德与法治', level: 2, category: '人文社科' },
  { id: 'responsibility', name: '责任意识', subject: '道德与法治', level: 2, category: '人文社科' },

  // 道德与法治知识内容 (Level 3)
  { id: 'po_nation', name: '国家认同', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_party', name: '政党认同', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_culture', name: '文化认同', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_personal', name: '个人品德', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_family', name: '家庭美德', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_social', name: '社会公德', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_constitution', name: '宪法法律至上', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_rights', name: '权利义务统一', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_legal', name: '依法行为', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_self', name: '自我认知与管理', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_interpersonal', name: '人际交往能力', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_country', name: '家国责任', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_socialres', name: '社会责任', subject: '道德与法治', level: 3, category: '人文社科' },
  { id: 'po_global', name: '全球视野', subject: '道德与法治', level: 3, category: '人文社科' },

  // ========== 信息科技关键概念 (Level 2) ==========
  { id: 'data', name: '数据', subject: '信息科技', level: 2, category: '技术应用' },
  { id: 'algorithm', name: '算法', subject: '信息科技', level: 2, category: '技术应用' },
  { id: 'network', name: '网络', subject: '信息科技', level: 2, category: '技术应用' },
  { id: 'info_process', name: '信息处理', subject: '信息科技', level: 2, category: '技术应用' },
  { id: 'infosecurity', name: '信息安全', subject: '信息科技', level: 2, category: '技术应用' },
  { id: 'ai', name: '人工智能', subject: '信息科技', level: 2, category: '技术应用' },
  { id: 'it_practice', name: '跨学科实践', subject: '信息科技', level: 2, category: '技术应用' },

  // 信息科技知识内容 (Level 3)
  { id: 'it_dataencode', name: '数据表示与编码', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_datasecurity', name: '数据安全与管理', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_dataanalysis', name: '数据分析与应用', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_algorithmdesc', name: '算法描述与结构', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_efficiency', name: '算法效率与验证', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_internet', name: '互联网基础与应用', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_iot', name: '物联网原理与实践', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_infoget', name: '信息获取与表达', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_collaboration', name: '信息协作与创新', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_personalprotect', name: '个人信息保护', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_networksecurity', name: '网络安全防护', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_aibase', name: 'AI基础与特征', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_aiapply', name: 'AI应用与伦理', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_device', name: '数字设备体验', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_dataexplore', name: '数据探秘', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_systemsim', name: '系统模拟', subject: '信息科技', level: 3, category: '技术应用' },
  { id: 'it_interconnect', name: '互联设计', subject: '信息科技', level: 3, category: '技术应用' },
]

// 知识图谱连接关系
const knowledgeLinks: KnowledgeLink[] = [
  // ==================== 学科内部结构 (contains) ====================

  // 语文
  { source: 'chinese', target: 'literature', type: 'contains', strength: 1 },
  { source: 'chinese', target: 'thinking', type: 'contains', strength: 1 },
  { source: 'chinese', target: 'crossread', type: 'contains', strength: 1 },
  { source: 'chinese', target: 'practicalread', type: 'contains', strength: 1 },
  { source: 'chinese', target: 'accumulation', type: 'contains', strength: 1 },
  { source: 'chinese', target: 'bookreading', type: 'contains', strength: 1 },
  { source: 'literature', target: 'ch_litappreciate', type: 'contains', strength: 1 },
  { source: 'literature', target: 'ch_creativewrite', type: 'contains', strength: 1 },
  { source: 'thinking', target: 'ch_criticalread', type: 'contains', strength: 1 },
  { source: 'practicalread', target: 'ch_infoget', type: 'contains', strength: 1 },
  { source: 'bookreading', target: 'ch_readingplan', type: 'contains', strength: 1 },
  { source: 'crossread', target: 'ch_multidiscipline', type: 'contains', strength: 1 },
  { source: 'accumulation', target: 'ch_hanculture', type: 'contains', strength: 1 },

  // 数学
  { source: 'math', target: 'dataanalysis', type: 'contains', strength: 1 },
  { source: 'math', target: 'function', type: 'contains', strength: 1 },
  { source: 'math', target: 'geometry', type: 'contains', strength: 1 },
  { source: 'math', target: 'algebra', type: 'contains', strength: 1 },
  { source: 'math', target: 'statistics', type: 'contains', strength: 1 },
  { source: 'math', target: 'mathmodel', type: 'contains', strength: 1 },
  { source: 'algebra', target: 'ma_numtheory', type: 'contains', strength: 1 },
  { source: 'algebra', target: 'ma_equation', type: 'contains', strength: 1 },
  { source: 'function', target: 'ma_function', type: 'contains', strength: 1 },
  { source: 'geometry', target: 'ma_geometry', type: 'contains', strength: 1 },
  { source: 'geometry', target: 'ma_coordinate', type: 'contains', strength: 1 },
  { source: 'dataanalysis', target: 'ma_datacollect', type: 'contains', strength: 1 },
  { source: 'statistics', target: 'ma_probability', type: 'contains', strength: 1 },

  // 物理
  { source: 'physics', target: 'motion', type: 'contains', strength: 1 },
  { source: 'physics', target: 'energy', type: 'contains', strength: 1 },
  { source: 'physics', target: 'wave', type: 'contains', strength: 1 },
  { source: 'physics', target: 'matterphysics', type: 'contains', strength: 1 },
  { source: 'physics', target: 'electromagnetic', type: 'contains', strength: 1 },
  { source: 'physics', target: 'phyexperiment', type: 'contains', strength: 1 },
  { source: 'motion', target: 'ph_mechanical', type: 'contains', strength: 1 },
  { source: 'wave', target: 'ph_sound', type: 'contains', strength: 1 },
  { source: 'wave', target: 'ph_light', type: 'contains', strength: 1 },
  { source: 'electromagnetic', target: 'ph_electric', type: 'contains', strength: 1 },
  { source: 'electromagnetic', target: 'ph_magnetic', type: 'contains', strength: 1 },
  { source: 'energy', target: 'ph_energytrans', type: 'contains', strength: 1 },
  { source: 'matterphysics', target: 'ph_material', type: 'contains', strength: 1 },
  { source: 'matterphysics', target: 'ph_structure', type: 'contains', strength: 1 },

  // 化学
  { source: 'chemistry', target: 'chem_experiment', type: 'contains', strength: 1 },
  { source: 'chemistry', target: 'chem_property', type: 'contains', strength: 1 },
  { source: 'chemistry', target: 'chem_composition', type: 'contains', strength: 1 },
  { source: 'chemistry', target: 'chem_change', type: 'contains', strength: 1 },
  { source: 'chemistry', target: 'chem_society', type: 'contains', strength: 1 },
  { source: 'chemistry', target: 'matter', type: 'contains', strength: 1 },
  { source: 'chemistry', target: 'reaction', type: 'contains', strength: 1 },
  { source: 'chemistry', target: 'sustainable', type: 'contains', strength: 1 },
  { source: 'matter', target: 'ch_matterclass', type: 'contains', strength: 1 },
  { source: 'matter', target: 'ch_atomstruct', type: 'contains', strength: 1 },
  { source: 'matter', target: 'ch_chembond', type: 'contains', strength: 1 },
  { source: 'matter', target: 'ch_organic', type: 'contains', strength: 1 },
  { source: 'matter', target: 'ch_periodic', type: 'contains', strength: 1 },
  { source: 'reaction', target: 'ch_reactnature', type: 'contains', strength: 1 },
  { source: 'reaction', target: 'ch_ionicreact', type: 'contains', strength: 1 },
  { source: 'reaction', target: 'ch_chambalance', type: 'contains', strength: 1 },
  { source: 'reaction', target: 'ch_reactrate', type: 'contains', strength: 1 },
  { source: 'reaction', target: 'ch_solution', type: 'contains', strength: 1 },
  { source: 'reaction', target: 'ch_energyconv', type: 'contains', strength: 1 },
  { source: 'chem_experiment', target: 'ch_experiment', type: 'contains', strength: 1 },
  { source: 'chem_experiment', target: 'ch_inquiry', type: 'contains', strength: 1 },
  { source: 'sustainable', target: 'ch_resources', type: 'contains', strength: 1 },
  { source: 'sustainable', target: 'ch_pollution', type: 'contains', strength: 1 },
  { source: 'sustainable', target: 'ch_green', type: 'contains', strength: 1 },
  { source: 'sustainable', target: 'ch_material', type: 'contains', strength: 1 },
  { source: 'sustainable', target: 'ch_health', type: 'contains', strength: 1 },
  { source: 'matter', target: 'ch_organicbase', type: 'contains', strength: 1 },

  // 生物
  { source: 'biology', target: 'life', type: 'contains', strength: 1 },
  { source: 'biology', target: 'diversity', type: 'contains', strength: 1 },
  { source: 'biology', target: 'ecology', type: 'contains', strength: 1 },
  { source: 'biology', target: 'plantlife', type: 'contains', strength: 1 },
  { source: 'biology', target: 'humanhealth', type: 'contains', strength: 1 },
  { source: 'biology', target: 'genetics', type: 'contains', strength: 1 },
  { source: 'biology', target: 'bio_practice', type: 'contains', strength: 1 },
  { source: 'life', target: 'bio_cell', type: 'contains', strength: 1 },
  { source: 'life', target: 'bio_tissue', type: 'contains', strength: 1 },
  { source: 'diversity', target: 'bio_classify', type: 'contains', strength: 1 },
  { source: 'diversity', target: 'bio_microbe', type: 'contains', strength: 1 },
  { source: 'diversity', target: 'bio_protection', type: 'contains', strength: 1 },
  { source: 'ecology', target: 'bio_ecosystem', type: 'contains', strength: 1 },
  { source: 'ecology', target: 'bio_ecosafety', type: 'contains', strength: 1 },
  { source: 'plantlife', target: 'bio_growth', type: 'contains', strength: 1 },
  { source: 'plantlife', target: 'bio_physiology', type: 'contains', strength: 1 },
  { source: 'humanhealth', target: 'bio_system', type: 'contains', strength: 1 },
  { source: 'humanhealth', target: 'bio_healthcare', type: 'contains', strength: 1 },
  { source: 'genetics', target: 'bio_dna', type: 'contains', strength: 1 },
  { source: 'genetics', target: 'bio_evolution', type: 'contains', strength: 1 },
  { source: 'bio_practice', target: 'bio_model', type: 'contains', strength: 1 },
  { source: 'bio_practice', target: 'bio_cultivation', type: 'contains', strength: 1 },
  { source: 'bio_practice', target: 'bio_fermentation', type: 'contains', strength: 1 },

  // 地理
  { source: 'geography', target: 'universe', type: 'contains', strength: 1 },
  { source: 'geography', target: 'earthmotion', type: 'contains', strength: 1 },
  { source: 'geography', target: 'earthsys', type: 'contains', strength: 1 },
  { source: 'geography', target: 'region', type: 'contains', strength: 1 },
  { source: 'geography', target: 'geotools', type: 'contains', strength: 1 },
  { source: 'geography', target: 'geo_practice', type: 'contains', strength: 1 },
  { source: 'universe', target: 'geo_earthpos', type: 'contains', strength: 1 },
  { source: 'universe', target: 'geo_space', type: 'contains', strength: 1 },
  { source: 'earthmotion', target: 'geo_rotation', type: 'contains', strength: 1 },
  { source: 'earthmotion', target: 'geo_revolution', type: 'contains', strength: 1 },
  { source: 'earthsys', target: 'geo_landsea', type: 'contains', strength: 1 },
  { source: 'earthsys', target: 'geo_weather', type: 'contains', strength: 1 },
  { source: 'earthsys', target: 'geo_residents', type: 'contains', strength: 1 },
  { source: 'earthsys', target: 'geo_develop', type: 'contains', strength: 1 },
  { source: 'region', target: 'geo_world', type: 'contains', strength: 1 },
  { source: 'region', target: 'geo_china', type: 'contains', strength: 1 },
  { source: 'region', target: 'geo_hometown', type: 'contains', strength: 1 },
  { source: 'geotools', target: 'geo_tools', type: 'contains', strength: 1 },
  { source: 'geotools', target: 'geo_practice', type: 'contains', strength: 1 },
  { source: 'geo_practice', target: 'geo_practice', type: 'contains', strength: 1 },

  // 历史
  { source: 'history', target: 'historical', type: 'contains', strength: 1 },
  { source: 'history', target: 'chinahistory', type: 'contains', strength: 1 },
  { source: 'history', target: 'worldhistory', type: 'contains', strength: 1 },
  { source: 'history', target: 'historythink', type: 'contains', strength: 1 },
  { source: 'history', target: 'history_practice', type: 'contains', strength: 1 },
  { source: 'historical', target: 'hi_historical', type: 'contains', strength: 1 },
  { source: 'historical', target: 'hi_method', type: 'contains', strength: 1 },
  { source: 'historythink', target: 'hi_period', type: 'contains', strength: 1 },
  { source: 'historythink', target: 'hi_space', type: 'contains', strength: 1 },
  { source: 'chinahistory', target: 'hi_ancient', type: 'contains', strength: 1 },
  { source: 'chinahistory', target: 'hi_modern', type: 'contains', strength: 1 },
  { source: 'chinahistory', target: 'hi_contemporary', type: 'contains', strength: 1 },
  { source: 'worldhistory', target: 'hi_civilization', type: 'contains', strength: 1 },
  { source: 'worldhistory', target: 'hi_capitalism', type: 'contains', strength: 1 },
  { source: 'worldhistory', target: 'hi_globalization', type: 'contains', strength: 1 },
  { source: 'history_practice', target: 'hi_tech', type: 'contains', strength: 1 },
  { source: 'history_practice', target: 'hi_culture', type: 'contains', strength: 1 },
  { source: 'history_practice', target: 'hi_society', type: 'contains', strength: 1 },

  // 道德与法治
  { source: 'politics', target: 'identity', type: 'contains', strength: 1 },
  { source: 'politics', target: 'morality', type: 'contains', strength: 1 },
  { source: 'politics', target: 'law', type: 'contains', strength: 1 },
  { source: 'politics', target: 'personality', type: 'contains', strength: 1 },
  { source: 'politics', target: 'responsibility', type: 'contains', strength: 1 },
  { source: 'identity', target: 'po_nation', type: 'contains', strength: 1 },
  { source: 'identity', target: 'po_party', type: 'contains', strength: 1 },
  { source: 'identity', target: 'po_culture', type: 'contains', strength: 1 },
  { source: 'morality', target: 'po_personal', type: 'contains', strength: 1 },
  { source: 'morality', target: 'po_family', type: 'contains', strength: 1 },
  { source: 'morality', target: 'po_social', type: 'contains', strength: 1 },
  { source: 'law', target: 'po_constitution', type: 'contains', strength: 1 },
  { source: 'law', target: 'po_rights', type: 'contains', strength: 1 },
  { source: 'law', target: 'po_legal', type: 'contains', strength: 1 },
  { source: 'personality', target: 'po_self', type: 'contains', strength: 1 },
  { source: 'personality', target: 'po_interpersonal', type: 'contains', strength: 1 },
  { source: 'responsibility', target: 'po_country', type: 'contains', strength: 1 },
  { source: 'responsibility', target: 'po_socialres', type: 'contains', strength: 1 },
  { source: 'responsibility', target: 'po_global', type: 'contains', strength: 1 },

  // 信息科技
  { source: 'it', target: 'data', type: 'contains', strength: 1 },
  { source: 'it', target: 'algorithm', type: 'contains', strength: 1 },
  { source: 'it', target: 'network', type: 'contains', strength: 1 },
  { source: 'it', target: 'info_process', type: 'contains', strength: 1 },
  { source: 'it', target: 'infosecurity', type: 'contains', strength: 1 },
  { source: 'it', target: 'ai', type: 'contains', strength: 1 },
  { source: 'it', target: 'it_practice', type: 'contains', strength: 1 },
  { source: 'data', target: 'it_dataencode', type: 'contains', strength: 1 },
  { source: 'data', target: 'it_datasecurity', type: 'contains', strength: 1 },
  { source: 'data', target: 'it_dataanalysis', type: 'contains', strength: 1 },
  { source: 'algorithm', target: 'it_algorithmdesc', type: 'contains', strength: 1 },
  { source: 'algorithm', target: 'it_efficiency', type: 'contains', strength: 1 },
  { source: 'network', target: 'it_internet', type: 'contains', strength: 1 },
  { source: 'network', target: 'it_iot', type: 'contains', strength: 1 },
  { source: 'info_process', target: 'it_infoget', type: 'contains', strength: 1 },
  { source: 'info_process', target: 'it_collaboration', type: 'contains', strength: 1 },
  { source: 'infosecurity', target: 'it_personalprotect', type: 'contains', strength: 1 },
  { source: 'infosecurity', target: 'it_networksecurity', type: 'contains', strength: 1 },
  { source: 'ai', target: 'it_aibase', type: 'contains', strength: 1 },
  { source: 'ai', target: 'it_aiapply', type: 'contains', strength: 1 },
  { source: 'it_practice', target: 'it_device', type: 'contains', strength: 1 },
  { source: 'it_practice', target: 'it_dataexplore', type: 'contains', strength: 1 },
  { source: 'it_practice', target: 'it_systemsim', type: 'contains', strength: 1 },
  { source: 'it_practice', target: 'it_interconnect', type: 'contains', strength: 1 },

  // ==================== 跨学科关联 (related) ====================

  // 科学学科间关联
  { source: 'motion', target: 'ma_function', type: 'related', strength: 0.9 },
  { source: 'ph_energytrans', target: 'ch_energyconv', type: 'related', strength: 0.95 },
  { source: 'ph_structure', target: 'ch_atomstruct', type: 'related', strength: 0.9 },
  { source: 'ph_electric', target: 'ch_ionicreact', type: 'related', strength: 0.85 },
  { source: 'bio_ecosystem', target: 'geo_landsea', type: 'related', strength: 0.85 },
  { source: 'bio_ecosystem', target: 'geo_weather', type: 'related', strength: 0.8 },
  { source: 'bio_physiology', target: 'ph_mechanical', type: 'related', strength: 0.75 },
  { source: 'ch_material', target: 'ph_material', type: 'related', strength: 0.8 },
  { source: 'ch_green', target: 'bio_ecosafety', type: 'related', strength: 0.85 },
  { source: 'ch_health', target: 'bio_system', type: 'related', strength: 0.9 },
  { source: 'genetics', target: 'ch_organic', type: 'related', strength: 0.85 },
  { source: 'ch_periodic', target: 'ph_structure', type: 'related', strength: 0.9 },

  // 数学与其他学科关联
  { source: 'dataanalysis', target: 'it_dataanalysis', type: 'related', strength: 0.95 },
  { source: 'ma_probability', target: 'statistics', type: 'related', strength: 1 },
  { source: 'ma_geometry', target: 'ph_light', type: 'related', strength: 0.75 },
  { source: 'ma_coordinate', target: 'geo_tools', type: 'related', strength: 0.8 },
  { source: 'ma_datacollect', target: 'bio_ecosystem', type: 'related', strength: 0.7 },
  { source: 'ma_equation', target: 'ch_reactrate', type: 'related', strength: 0.8 },
  { source: 'mathmodel', target: 'phyexperiment', type: 'related', strength: 0.75 },
  { source: 'ma_probability', target: 'hi_historical', type: 'related', strength: 0.5 },

  // 语文与其他学科关联
  { source: 'literature', target: 'hi_culture', type: 'related', strength: 0.8 },
  { source: 'literature', target: 'po_culture', type: 'related', strength: 0.75 },
  { source: 'ch_hanculture', target: 'hi_ancient', type: 'related', strength: 0.7 },
  { source: 'crossread', target: 'it_practice', type: 'related', strength: 0.65 },
  { source: 'practicalread', target: 'it_infoget', type: 'related', strength: 0.6 },
  { source: 'thinking', target: 'it_algorithmdesc', type: 'related', strength: 0.7 },
  { source: 'ch_multidiscipline', target: 'bio_practice', type: 'related', strength: 0.6 },

  // 英语/外语与其他学科（通过课程关联）
  { source: 'literature', target: 'worldhistory', type: 'related', strength: 0.55 },

  // 历史与其他学科关联
  { source: 'chinahistory', target: 'geo_china', type: 'related', strength: 0.85 },
  { source: 'worldhistory', target: 'geo_world', type: 'related', strength: 0.8 },
  { source: 'hi_space', target: 'geo_hometown', type: 'related', strength: 0.7 },
  { source: 'hi_civilization', target: 'geo_earthpos', type: 'related', strength: 0.6 },
  { source: 'hi_tech', target: 'ph_structure', type: 'related', strength: 0.65 },
  { source: 'hi_globalization', target: 'geo_develop', type: 'related', strength: 0.75 },

  // 地理与其他学科关联
  { source: 'geo_space', target: 'ph_structure', type: 'related', strength: 0.7 },
  { source: 'geo_weather', target: 'ph_energytrans', type: 'related', strength: 0.75 },
  { source: 'geo_rotation', target: 'ph_mechanical', type: 'related', strength: 0.7 },
  { source: 'geo_landsea', target: 'bio_ecosystem', type: 'related', strength: 0.85 },
  { source: 'geo_weather', target: 'ch_pollution', type: 'related', strength: 0.8 },
  { source: 'geo_practice', target: 'phyexperiment', type: 'related', strength: 0.65 },

  // 道德与法治与其他学科关联
  { source: 'po_country', target: 'hi_ancient', type: 'related', strength: 0.7 },
  { source: 'po_culture', target: 'ch_hanculture', type: 'related', strength: 0.75 },
  { source: 'po_social', target: 'literature', type: 'related', strength: 0.6 },
  { source: 'po_constitution', target: 'hi_method', type: 'related', strength: 0.5 },
  { source: 'po_global', target: 'worldhistory', type: 'related', strength: 0.7 },
  { source: 'po_global', target: 'geo_develop', type: 'related', strength: 0.75 },
  { source: 'po_socialres', target: 'bio_ecosafety', type: 'related', strength: 0.8 },
  { source: 'po_socialres', target: 'ch_green', type: 'related', strength: 0.75 },
  { source: 'po_socialres', target: 'ch_pollution', type: 'related', strength: 0.8 },

  // 信息科技与其他学科关联
  { source: 'it_dataanalysis', target: 'ma_datacollect', type: 'related', strength: 0.9 },
  { source: 'it_aiapply', target: 'po_constitution', type: 'related', strength: 0.6 },
  { source: 'it_networksecurity', target: 'po_legal', type: 'related', strength: 0.7 },
  { source: 'it_iot', target: 'ph_electric', type: 'related', strength: 0.75 },
  { source: 'it_iot', target: 'geo_practice', type: 'related', strength: 0.7 },
  { source: 'it_aibase', target: 'ma_probability', type: 'related', strength: 0.8 },
  { source: 'it_infoget', target: 'practicalread', type: 'related', strength: 0.65 },
  { source: 'it_systemsim', target: 'ch_experiment', type: 'related', strength: 0.6 },
  { source: 'it_systemsim', target: 'phyexperiment', type: 'related', strength: 0.65 },

  // ==================== 前置关系 (prerequisite) ====================

  // 学科内部前置关系
  { source: 'ma_numtheory', target: 'ma_equation', type: 'prerequisite', strength: 0.95 },
  { source: 'ma_geometry', target: 'ma_coordinate', type: 'prerequisite', strength: 0.9 },
  { source: 'ma_datacollect', target: 'ma_probability', type: 'prerequisite', strength: 0.85 },
  { source: 'ph_mechanical', target: 'ph_energytrans', type: 'prerequisite', strength: 0.9 },
  { source: 'ph_structure', target: 'ch_atomstruct', type: 'prerequisite', strength: 0.85 },
  { source: 'ch_matterclass', target: 'ch_reactnature', type: 'prerequisite', strength: 0.95 },
  { source: 'ch_atomstruct', target: 'ch_chembond', type: 'prerequisite', strength: 0.9 },
  { source: 'ch_chembond', target: 'ch_reactnature', type: 'prerequisite', strength: 0.85 },
  { source: 'ch_reactnature', target: 'ch_chambalance', type: 'prerequisite', strength: 0.9 },
  { source: 'ch_reactnature', target: 'ch_reactrate', type: 'prerequisite', strength: 0.85 },
  { source: 'bio_cell', target: 'bio_tissue', type: 'prerequisite', strength: 0.95 },
  { source: 'bio_tissue', target: 'bio_system', type: 'prerequisite', strength: 0.85 },
  { source: 'bio_ecosystem', target: 'bio_ecosafety', type: 'prerequisite', strength: 0.8 },
  { source: 'bio_dna', target: 'bio_evolution', type: 'prerequisite', strength: 0.9 },
  { source: 'geo_earthpos', target: 'geo_rotation', type: 'prerequisite', strength: 0.85 },
  { source: 'geo_rotation', target: 'geo_weather', type: 'prerequisite', strength: 0.75 },
  { source: 'it_dataencode', target: 'it_algorithmdesc', type: 'prerequisite', strength: 0.9 },
  { source: 'it_algorithmdesc', target: 'it_aibase', type: 'prerequisite', strength: 0.8 },
  { source: 'hi_method', target: 'chinahistory', type: 'prerequisite', strength: 0.85 },

  // 跨学科前置关系
  { source: 'ma_function', target: 'ph_mechanical', type: 'prerequisite', strength: 0.7 },
  { source: 'ch_atomstruct', target: 'ph_structure', type: 'prerequisite', strength: 0.75 },
  { source: 'bio_cell', target: 'ch_organic', type: 'prerequisite', strength: 0.7 },
  { source: 'ma_equation', target: 'ch_reactrate', type: 'prerequisite', strength: 0.75 },
  { source: 'geo_landsea', target: 'bio_ecosystem', type: 'prerequisite', strength: 0.65 },
]

// 学科颜色配置
const subjectColors: Record<string, string> = {
  '语文': '#ec4899',
  '数学': '#10b981',
  '物理': '#3b82f6',
  '化学': '#f59e0b',
  '生物': '#22c55e',
  '地理': '#06b6d4',
  '历史': '#8b5cf6',
  '道德与法治': '#f97316',
  '信息科技': '#6366f1',
  '音乐': '#14b8a6',
  '美术': '#f43f5e',
}

// ==================== 教学模式选择弹窗 ====================
function TeachingModeModal({
  isOpen,
  onClose,
  onSelect,
  courseTitle,
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (mode: 'teacher-centered' | 'student-centered') => void
  courseTitle?: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-scale-in">
        {/* 头部 */}
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center">选择授课模式</h2>
          {courseTitle && (
            <p className="text-gray-500 text-center mt-2 text-sm">课程：{courseTitle}</p>
          )}
          <p className="text-gray-500 text-center mt-1">请选择本次授课的教学模式</p>
        </div>

        {/* 选项 */}
        <div className="px-8 pb-8 space-y-4">
          {/* 讲授模式 */}
          <button
            onClick={() => onSelect('teacher-centered')}
            className="w-full p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                👨‍🏫
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">讲授模式</h3>
                <p className="text-sm text-gray-600">教师主导课堂，进行知识讲解与示范，适合新知识的系统性教学</p>
              </div>
            </div>
          </button>

          {/* 自学模式 */}
          <button
            onClick={() => onSelect('student-centered')}
            className="w-full p-6 rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                🎯
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">自学模式</h3>
                <p className="text-sm text-gray-600">学生自主探究学习，教师作为引导者与支持者，适合培养学生自主学习能力</p>
              </div>
            </div>
          </button>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ==================== 主组件 ====================
export default function CourseCenter() {
  const [viewMode, setViewMode] = useState<'courses' | 'visualization'>('courses')
  const [selectedSubject, setSelectedSubject] = useState('全部')
  const [selectedSource, setSelectedSource] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTeachingModal, setShowTeachingModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // 处理去授课按钮点击
  const handleTeachClick = (course: Course) => {
    setSelectedCourse(course)
    setShowTeachingModal(true)
  }

  // 处理教学模式选择
  const handleModeSelect = (mode: 'teacher-centered' | 'student-centered') => {
    setShowTeachingModal(false)
    if (mode === 'teacher-centered') {
      // 讲授模式 - 跳转到讲授页面
      window.location.href = '/LMS-Teacher-Teaching.html'
    } else {
      // 自学模式 - 跳转到使用视角
      window.location.href = '/LMS-Teacher-NoteConfig.html?view=use'
    }
  }

  const filteredCourses = courses.filter((course) => {
    if (selectedSubject !== '全部' && !course.subjects.includes(selectedSubject)) return false
    if (selectedSource !== '全部') {
      if (selectedSource === '官方' && course.source !== 'official') return false
      if (selectedSource === '组织' && course.source !== 'organization') return false
    }
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !course.concepts.some(concept => concept.includes(searchQuery))) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Hero 区域 */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              跨学科课程中心
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            探索学科交叉融合的无限可能，发现优质跨学科课程资源
          </p>
        </div>

        {/* 平台统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl">
                📚
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{platformStats.singleCourses}</div>
                <div className="text-sm text-gray-500">单一课程</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl">
                📖
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{platformStats.seriesCourses}</div>
                <div className="text-sm text-gray-500">系列课程</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl">
                👨‍🏫
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{platformStats.teachers}</div>
                <div className="text-sm text-gray-500">参与教师</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl">
                🏫
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{platformStats.schools}</div>
                <div className="text-sm text-gray-500">参与学校</div>
              </div>
            </div>
          </div>
        </div>

        {/* 视图切换和筛选栏 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 视图切换 */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('courses')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'courses'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  课程视图
                </span>
              </button>
              <button
                onClick={() => setViewMode('visualization')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'visualization'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  知识图谱
                </span>
              </button>
            </div>

            {/* 筛选器 */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject === '全部' ? '全部学科' : subject}</option>
                ))}
              </select>

              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {sources.map((source) => (
                  <option key={source} value={source}>{source === '全部' ? '全部来源' : source}</option>
                ))}
              </select>

              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索课程或知识点..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-56 transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        {viewMode === 'courses' ? (
          <CourseGridView courses={filteredCourses} onTeach={handleTeachClick} />
        ) : (
          <KnowledgeGraphView
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            courses={courses}
            onTeach={handleTeachClick}
          />
        )}
      </div>

      {/* 教学模式选择弹窗 */}
      <TeachingModeModal
        isOpen={showTeachingModal}
        onClose={() => setShowTeachingModal(false)}
        onSelect={handleModeSelect}
        courseTitle={selectedCourse?.title}
      />
    </div>
  )
}

// ==================== 课程网格视图 ====================
function CourseGridView({ courses, onTeach }: { courses: Course[]; onTeach: (course: Course) => void }) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
        <div className="w-24 h-24 mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">未找到匹配的课程</h3>
        <p className="text-gray-500">试试调整筛选条件或搜索关键词</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      {courses.map((course, index) => (
        <div
          key={course.id}
          className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up"
          style={{ animationDelay: `${0.2 + index * 0.05}s` }}
        >
          {/* 封面 */}
          <div className="relative h-44 overflow-hidden">
            <Image
              src={course.cover}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {/* 来源标签 - 右上角 */}
            <div className="absolute top-3 right-3">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                course.source === 'official'
                  ? 'bg-blue-500 text-white'
                  : 'bg-purple-500 text-white'
              }`}>
                {course.source === 'official' ? '官方' : '组织'}
              </span>
            </div>
          </div>

          {/* 内容 */}
          <div className="p-5">
            {/* 课程标题 */}
            <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>

            {/* 学科标签 */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {course.subjects.map((subject) => (
                <span
                  key={subject}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg"
                  style={{
                    backgroundColor: `${subjectColors[subject]}15`,
                    color: subjectColors[subject],
                  }}
                >
                  {subject}
                </span>
              ))}
            </div>

            {/* 跨学科概念 */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {course.concepts.map((concept) => (
                <span key={concept} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {concept}
                </span>
              ))}
            </div>

            {/* 底部信息：学习人数、评分、授课按钮 */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4">
                {/* 学习人数 */}
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {course.studentCount}人学习
                </span>
                {/* 评分 */}
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {course.rating}
                </span>
              </div>
              <button
                onClick={() => onTeach(course)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                去授课
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ==================== 知识图谱视图 ====================
function KnowledgeGraphView({
  selectedSubject,
  onSelectSubject,
  courses,
  onTeach,
}: {
  selectedSubject: string
  onSelectSubject: (subject: string) => void
  courses: Course[]
  onTeach: (course: Course) => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map())
  const simulationRef = useRef<d3.Simulation<any, undefined> | null>(null)
  const isInitializedRef = useRef(false)
  const [linkStrength, setLinkStrength] = useState(0.5)
  const [showLabels, setShowLabels] = useState(true)
  const [showLinks, setShowLinks] = useState(true)
  const [highlightClusters, setHighlightClusters] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // 更新节点选中状态的函数（不触发重绘）
  const updateNodeSelection = useCallback((nodeId: string | null) => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)

    // 更新节点的描边样式
    svg.selectAll('.nodes circle')
      .attr('stroke', (d: any) => nodeId === d.id ? '#fff' : 'transparent')
      .attr('stroke-width', (d: any) => nodeId === d.id ? 4 : 0)

    setSelectedNode(nodeId)
  }, [])

  // 更新节点透明度（基于学科筛选）
  const updateNodeOpacity = useCallback(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)

    svg.selectAll('.nodes circle')
      .attr('opacity', (d: any) => {
        if (selectedSubject === '全部') return d.level === 1 ? 0.95 : 0.8
        return d.subject === selectedSubject ? (d.level === 1 ? 0.95 : 0.85) : 0.25
      })
  }, [selectedSubject])

  // 首次初始化图谱
  const initializeGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    const width = containerRef.current.clientWidth
    const height = 550

    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    // 添加缩放功能
    const g = svg.append('g').attr('class', 'main')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // 筛选连接
    const filteredLinks = knowledgeLinks.filter(l => l.strength >= linkStrength)

    // 深拷贝节点数据
    const savedPositions = nodePositionsRef.current
    const nodes = knowledgeNodes.map(n => {
      const pos = savedPositions.get(n.id)
      return {
        ...n,
        x: pos?.x ?? undefined,
        y: pos?.y ?? undefined,
      }
    })
    const links = filteredLinks.map(l => ({ ...l }))

    // 创建力导向图模拟
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance((d: any) => d.type === 'contains' ? 80 : 150)
        .strength((d: any) => d.type === 'contains' ? 0.8 : d.strength * 0.3))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.level === 1 ? 50 : 35))
      .alphaDecay(0.02)

    simulationRef.current = simulation

    // 保存节点位置
    simulation.on('tick', () => {
      nodes.forEach((n: any) => {
        if (n.x !== undefined && n.y !== undefined) {
          nodePositionsRef.current.set(n.id, { x: n.x, y: n.y })
        }
      })
    })

    // 绘制连接线
    if (showLinks) {
      g.append('g').attr('class', 'links')

      const link = g.select('.links')
        .selectAll<SVGLineElement, any>('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', (d: any) => {
          if (d.type === 'prerequisite') return '#10b981'
          if (d.type === 'contains') return '#d1d5db'
          return '#93c5fd'
        })
        .attr('stroke-width', (d: any) => d.type === 'contains' ? 1.5 : d.strength * 3)
        .attr('stroke-dasharray', (d: any) => d.type === 'related' ? '5,5' : '0')
        .attr('opacity', (d: any) => d.type === 'contains' ? 0.4 : 0.6)

      simulation.on('tick.links', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y)
      })
    }

    // 绘制节点
    g.append('g').attr('class', 'nodes')

    const node = g.select('.nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', (_event, d: any) => {
        updateNodeSelection(d.id)
        if (d.level === 1) {
          onSelectSubject(d.name)
        }
      })
      .call(d3.drag<any, any>()
        .on('start', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }))

    // 添加圆形
    node.append('circle')
      .attr('r', (d: any) => d.level === 1 ? 40 : d.level === 2 ? 28 : 20)
      .attr('fill', (d: any) => subjectColors[d.subject] || '#6b7280')
      .attr('opacity', (d: any) => {
        if (selectedSubject === '全部') return d.level === 1 ? 0.95 : 0.8
        return d.subject === selectedSubject ? (d.level === 1 ? 0.95 : 0.85) : 0.25
      })
      .attr('stroke', (d: any) => selectedNode === d.id ? '#fff' : 'transparent')
      .attr('stroke-width', (d: any) => selectedNode === d.id ? 4 : 0)
      .style('filter', (d: any) => d.level === 1 ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none')

    // 添加标签
    if (showLabels) {
      node.append('text')
        .text((d: any) => d.name.length > 6 ? d.name.slice(0, 6) + '...' : d.name)
        .attr('text-anchor', 'middle')
        .attr('dy', (d: any) => d.level === 1 ? 4 : 3)
        .attr('fill', '#fff')
        .attr('font-size', (d: any) => d.level === 1 ? 13 : d.level === 2 ? 10 : 9)
        .attr('font-weight', (d: any) => d.level === 1 ? 'bold' : 'medium')
        .style('pointer-events', 'none')
    }

    // 更新位置
    simulation.on('tick.nodes', () => {
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    isInitializedRef.current = true

  }, [linkStrength, showLabels, showLinks, selectedSubject, onSelectSubject, updateNodeSelection, selectedNode])

  // 初始化绘制
  useEffect(() => {
    initializeGraph()

    const handleResize = () => {
      nodePositionsRef.current.clear()
      isInitializedRef.current = false
      initializeGraph()
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      simulationRef.current?.stop()
    }
  }, [initializeGraph])

  // 单独处理学科筛选变化（只更新透明度，不重新布局）
  useEffect(() => {
    if (isInitializedRef.current) {
      updateNodeOpacity()
    }
  }, [selectedSubject, updateNodeOpacity])

  // 获取选中节点相关的课程
  const relatedCourses = selectedNode
    ? courses.filter(c => {
        const node = knowledgeNodes.find(n => n.id === selectedNode)
        if (!node) return false
        return c.subjects.includes(node.subject)
      }).slice(0, 4)
    : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* 控制面板 */}
      <div className="lg:col-span-1 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            可视化控制
          </h3>

          {/* 学科筛选 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">学科筛选</label>
            <select
              value={selectedSubject}
              onChange={(e) => onSelectSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject === '全部' ? '全部学科' : subject}</option>
              ))}
            </select>
          </div>

          {/* 关联强度滑块 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关联强度阈值: <span className="text-blue-600">{(linkStrength * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={linkStrength}
              onChange={(e) => setLinkStrength(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* 开关选项 */}
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">显示标签</span>
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  showLabels ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    showLabels ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">显示连接</span>
              <button
                onClick={() => setShowLinks(!showLinks)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  showLinks ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    showLinks ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">聚类高亮</span>
              <button
                onClick={() => setHighlightClusters(!highlightClusters)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  highlightClusters ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    highlightClusters ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* 图例 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            图例
          </h3>

          {/* 学科颜色 */}
          <div className="space-y-2 mb-4">
            {Object.entries(subjectColors).slice(0, 6).map(([subject, color]) => (
              <div key={subject} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm text-gray-600">{subject}</span>
              </div>
            ))}
          </div>

          {/* 节点大小说明 */}
          <div className="pt-4 border-t border-gray-100 space-y-2 mb-4">
            <p className="text-xs text-gray-500 font-medium mb-2">节点层级</p>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-400" />
              <span className="text-xs text-gray-500">学科大概念</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400" />
              <span className="text-xs text-gray-500">关键概念</span>
            </div>
          </div>

          {/* 连接线说明 */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <p className="text-xs text-gray-500 font-medium mb-2">连接类型</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500" />
              <span className="text-xs text-gray-500">前置关系</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-300" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #93c5fd 0, #93c5fd 4px, transparent 4px, transparent 8px)' }} />
              <span className="text-xs text-gray-500">跨学科关联</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-300" />
              <span className="text-xs text-gray-500">包含关系</span>
            </div>
          </div>
        </div>
      </div>

      {/* 知识图谱 */}
      <div className="lg:col-span-3 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div
          ref={containerRef}
          className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 overflow-hidden shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">跨学科概念知识图谱</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>拖拽节点可调整位置</span>
              <span>•</span>
              <span>滚轮缩放</span>
              <span>•</span>
              <span>点击节点查看相关课程</span>
            </div>
          </div>
          <svg ref={svgRef} className="w-full" style={{ minHeight: 550 }} />
        </div>

        {/* 选中节点的相关课程 */}
        {selectedNode && relatedCourses.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-sm animate-fade-in">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              相关课程 - {knowledgeNodes.find(n => n.id === selectedNode)?.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <Image
                    src={course.cover}
                    alt={course.title}
                    width={80}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{course.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{course.subjects.join('/')}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{course.studentCount}人学习</span>
                      <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {course.rating}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onTeach(course)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                  >
                    去授课
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
