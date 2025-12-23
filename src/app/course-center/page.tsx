'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as d3 from 'd3'

// ==================== 类型定义 ====================
interface Course {
  id: string
  title: string
  cover: string
  subjects: string[]
  source: 'official' | 'school'
  sourceName: string
  knowledgeTags: string[]
  supportSelfStudy: boolean
  studentCount: number
  grade: string
  concepts: string[] // 跨学科大概念
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
const grades = ['全部', '小学', '初中', '高中']
const sources = ['全部', '官方', '学校']

// 跨学科课程数据
const courses: Course[] = [
  {
    id: '1',
    title: '水循环与气候变化探究',
    cover: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=400&h=300&fit=crop',
    subjects: ['地理', '物理', '化学'],
    source: 'official',
    sourceName: '平台官方',
    knowledgeTags: ['水循环', '气候系统', '全球变暖', '生态平衡'],
    supportSelfStudy: true,
    studentCount: 1250,
    grade: '高中',
    concepts: ['地球表层系统', '物质的化学变化', '能量守恒与可持续发展'],
  },
  {
    id: '2',
    title: '数学建模与生态系统',
    cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    subjects: ['数学', '生物'],
    source: 'school',
    sourceName: '北京四中',
    knowledgeTags: ['函数建模', '数据分析', '生态系统', '种群动态'],
    supportSelfStudy: true,
    studentCount: 856,
    grade: '高中',
    concepts: ['生物与环境', '数据分析与应用'],
  },
  {
    id: '3',
    title: '文艺复兴的科学革命',
    cover: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop',
    subjects: ['历史', '物理'],
    source: 'official',
    sourceName: '平台官方',
    knowledgeTags: ['文艺复兴', '科学发展', '天文学', '力学'],
    supportSelfStudy: false,
    studentCount: 643,
    grade: '初中',
    concepts: ['世界文明互动与发展', '运动与相互作用'],
  },
  {
    id: '4',
    title: '音乐中的数学之美',
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop',
    subjects: ['数学', '音乐'],
    source: 'school',
    sourceName: '上海中学',
    knowledgeTags: ['波形', '频率', '和声', '数学比例', '黄金分割'],
    supportSelfStudy: true,
    studentCount: 428,
    grade: '初中',
    concepts: ['运动与相互作用', '文学阅读与创意表达'],
  },
  {
    id: '5',
    title: '化学反应与艺术创作',
    cover: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop',
    subjects: ['化学', '美术'],
    source: 'official',
    sourceName: '平台官方',
    knowledgeTags: ['化学变化', '颜料', '材料科学', '色彩原理'],
    supportSelfStudy: true,
    studentCount: 312,
    grade: '高中',
    concepts: ['物质的性质与应用', '文学阅读与创意表达'],
  },
  {
    id: '6',
    title: '编程思维与数学逻辑',
    cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop',
    subjects: ['信息科技', '数学'],
    source: 'school',
    sourceName: '深圳中学',
    knowledgeTags: ['算法', '逻辑思维', '函数', '递归'],
    supportSelfStudy: true,
    studentCount: 567,
    grade: '初中',
    concepts: ['算法', '数据分析与应用'],
  },
  {
    id: '7',
    title: '古诗词中的物理现象',
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    subjects: ['语文', '物理'],
    source: 'official',
    sourceName: '平台官方',
    knowledgeTags: ['古诗词', '光学', '声学', '力学现象'],
    supportSelfStudy: true,
    studentCount: 892,
    grade: '初中',
    concepts: ['文学阅读与创意表达', '运动与相互作用'],
  },
  {
    id: '8',
    title: '地理信息与大数据分析',
    cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    subjects: ['地理', '信息科技'],
    source: 'school',
    sourceName: '杭州学军中学',
    knowledgeTags: ['GIS', '数据可视化', '空间分析', '人口分布'],
    supportSelfStudy: true,
    studentCount: 345,
    grade: '高中',
    concepts: ['地理工具与实践能力', '数据分析与应用'],
  },
  {
    id: '9',
    title: '生态文明与可持续发展',
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    subjects: ['生物', '道德与法治', '地理'],
    source: 'official',
    sourceName: '平台官方',
    knowledgeTags: ['生态保护', '可持续发展', '环境伦理', '碳中和'],
    supportSelfStudy: true,
    studentCount: 723,
    grade: '初中',
    concepts: ['生物与环境', '责任意识', '化学与可持续发展'],
  },
  {
    id: '10',
    title: '历史事件中的地理因素',
    cover: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop',
    subjects: ['历史', '地理'],
    source: 'school',
    sourceName: '成都七中',
    knowledgeTags: ['地缘政治', '气候影响', '资源争夺', '文明交流'],
    supportSelfStudy: false,
    studentCount: 456,
    grade: '高中',
    concepts: ['中国历史演进脉络', '区域认知方法'],
  },
  {
    id: '11',
    title: 'AI与信息素养教育',
    cover: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    subjects: ['信息科技', '道德与法治'],
    source: 'official',
    sourceName: '平台官方',
    knowledgeTags: ['人工智能', '信息安全', '网络伦理', '数字公民'],
    supportSelfStudy: true,
    studentCount: 634,
    grade: '初中',
    concepts: ['人工智能', '法治观念', '信息安全'],
  },
  {
    id: '12',
    title: '化学元素与宇宙起源',
    cover: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
    subjects: ['化学', '物理'],
    source: 'school',
    sourceName: '南京外国语学校',
    knowledgeTags: ['元素周期表', '恒星演化', '核聚变', '宇宙大爆炸'],
    supportSelfStudy: true,
    studentCount: 289,
    grade: '高中',
    concepts: ['物质结构与周期律', '能量守恒与可持续发展'],
  },
]

// 基于学科大概念的知识图谱节点
const knowledgeNodes: KnowledgeNode[] = [
  // 学科大概念 (Level 1) - 各学科核心节点
  { id: 'chinese', name: '语文', subject: '语文', level: 1, category: '语言文字' },
  { id: 'math', name: '数学', subject: '数学', level: 1, category: '数理逻辑' },
  { id: 'physics', name: '物理', subject: '物理', level: 1, category: '自然科学' },
  { id: 'chemistry', name: '化学', subject: '化学', level: 1, category: '自然科学' },
  { id: 'biology', name: '生物', subject: '生物', level: 1, category: '自然科学' },
  { id: 'geography', name: '地理', subject: '地理', level: 1, category: '人文社科' },
  { id: 'history', name: '历史', subject: '历史', level: 1, category: '人文社科' },
  { id: 'politics', name: '道德与法治', subject: '道德与法治', level: 1, category: '人文社科' },
  { id: 'it', name: '信息科技', subject: '信息科技', level: 1, category: '技术应用' },

  // 关键概念 (Level 2) - 语文
  { id: 'literature', name: '文学阅读与创意表达', subject: '语文', level: 2, category: '语言文字' },
  { id: 'thinking', name: '思辨性阅读与表达', subject: '语文', level: 2, category: '语言文字' },
  { id: 'crossread', name: '跨学科学习', subject: '语文', level: 2, category: '语言文字' },

  // 关键概念 (Level 2) - 数学
  { id: 'dataanalysis', name: '数据分析与应用', subject: '数学', level: 2, category: '数理逻辑' },
  { id: 'function', name: '函数与建模', subject: '数学', level: 2, category: '数理逻辑' },
  { id: 'geometry', name: '空间与几何', subject: '数学', level: 2, category: '数理逻辑' },

  // 关键概念 (Level 2) - 物理
  { id: 'motion', name: '运动与相互作用', subject: '物理', level: 2, category: '自然科学' },
  { id: 'energy', name: '能量守恒与可持续发展', subject: '物理', level: 2, category: '自然科学' },
  { id: 'wave', name: '声和光', subject: '物理', level: 2, category: '自然科学' },

  // 关键概念 (Level 2) - 化学
  { id: 'matter', name: '物质的组成与结构', subject: '化学', level: 2, category: '自然科学' },
  { id: 'reaction', name: '化学反应规律', subject: '化学', level: 2, category: '自然科学' },
  { id: 'sustainable', name: '化学与可持续发展', subject: '化学', level: 2, category: '自然科学' },

  // 关键概念 (Level 2) - 生物
  { id: 'life', name: '生物体的结构层次', subject: '生物', level: 2, category: '自然科学' },
  { id: 'ecology', name: '生物与环境', subject: '生物', level: 2, category: '自然科学' },
  { id: 'genetics', name: '遗传与进化', subject: '生物', level: 2, category: '自然科学' },

  // 关键概念 (Level 2) - 地理
  { id: 'earth', name: '地球表层系统', subject: '地理', level: 2, category: '人文社科' },
  { id: 'region', name: '区域认知方法', subject: '地理', level: 2, category: '人文社科' },
  { id: 'geotools', name: '地理工具与实践能力', subject: '地理', level: 2, category: '人文社科' },

  // 关键概念 (Level 2) - 历史
  { id: 'chinahistory', name: '中国历史演进脉络', subject: '历史', level: 2, category: '人文社科' },
  { id: 'worldhistory', name: '世界文明互动与发展', subject: '历史', level: 2, category: '人文社科' },
  { id: 'historythink', name: '时空观念构建', subject: '历史', level: 2, category: '人文社科' },

  // 关键概念 (Level 2) - 道德与法治
  { id: 'morality', name: '道德修养', subject: '道德与法治', level: 2, category: '人文社科' },
  { id: 'law', name: '法治观念', subject: '道德与法治', level: 2, category: '人文社科' },
  { id: 'responsibility', name: '责任意识', subject: '道德与法治', level: 2, category: '人文社科' },

  // 关键概念 (Level 2) - 信息科技
  { id: 'data', name: '数据', subject: '信息科技', level: 2, category: '技术应用' },
  { id: 'algorithm', name: '算法', subject: '信息科技', level: 2, category: '技术应用' },
  { id: 'network', name: '网络', subject: '信息科技', level: 2, category: '技术应用' },
  { id: 'ai', name: '人工智能', subject: '信息科技', level: 2, category: '技术应用' },
  { id: 'infosecurity', name: '信息安全', subject: '信息科技', level: 2, category: '技术应用' },
]

// 知识图谱连接关系
const knowledgeLinks: KnowledgeLink[] = [
  // 学科内部结构 (contains)
  { source: 'chinese', target: 'literature', type: 'contains', strength: 1 },
  { source: 'chinese', target: 'thinking', type: 'contains', strength: 1 },
  { source: 'chinese', target: 'crossread', type: 'contains', strength: 1 },
  { source: 'math', target: 'dataanalysis', type: 'contains', strength: 1 },
  { source: 'math', target: 'function', type: 'contains', strength: 1 },
  { source: 'math', target: 'geometry', type: 'contains', strength: 1 },
  { source: 'physics', target: 'motion', type: 'contains', strength: 1 },
  { source: 'physics', target: 'energy', type: 'contains', strength: 1 },
  { source: 'physics', target: 'wave', type: 'contains', strength: 1 },
  { source: 'chemistry', target: 'matter', type: 'contains', strength: 1 },
  { source: 'chemistry', target: 'reaction', type: 'contains', strength: 1 },
  { source: 'chemistry', target: 'sustainable', type: 'contains', strength: 1 },
  { source: 'biology', target: 'life', type: 'contains', strength: 1 },
  { source: 'biology', target: 'ecology', type: 'contains', strength: 1 },
  { source: 'biology', target: 'genetics', type: 'contains', strength: 1 },
  { source: 'geography', target: 'earth', type: 'contains', strength: 1 },
  { source: 'geography', target: 'region', type: 'contains', strength: 1 },
  { source: 'geography', target: 'geotools', type: 'contains', strength: 1 },
  { source: 'history', target: 'chinahistory', type: 'contains', strength: 1 },
  { source: 'history', target: 'worldhistory', type: 'contains', strength: 1 },
  { source: 'history', target: 'historythink', type: 'contains', strength: 1 },
  { source: 'politics', target: 'morality', type: 'contains', strength: 1 },
  { source: 'politics', target: 'law', type: 'contains', strength: 1 },
  { source: 'politics', target: 'responsibility', type: 'contains', strength: 1 },
  { source: 'it', target: 'data', type: 'contains', strength: 1 },
  { source: 'it', target: 'algorithm', type: 'contains', strength: 1 },
  { source: 'it', target: 'network', type: 'contains', strength: 1 },
  { source: 'it', target: 'ai', type: 'contains', strength: 1 },
  { source: 'it', target: 'infosecurity', type: 'contains', strength: 1 },

  // 跨学科关联 (related) - 基于课程实际融合情况
  { source: 'dataanalysis', target: 'ecology', type: 'related', strength: 0.8 },
  { source: 'function', target: 'motion', type: 'related', strength: 0.9 },
  { source: 'energy', target: 'sustainable', type: 'related', strength: 0.85 },
  { source: 'earth', target: 'ecology', type: 'related', strength: 0.8 },
  { source: 'literature', target: 'wave', type: 'related', strength: 0.6 },
  { source: 'algorithm', target: 'dataanalysis', type: 'related', strength: 0.9 },
  { source: 'worldhistory', target: 'motion', type: 'related', strength: 0.5 },
  { source: 'region', target: 'chinahistory', type: 'related', strength: 0.7 },
  { source: 'ai', target: 'law', type: 'related', strength: 0.6 },
  { source: 'responsibility', target: 'ecology', type: 'related', strength: 0.7 },
  { source: 'matter', target: 'life', type: 'related', strength: 0.75 },
  { source: 'reaction', target: 'energy', type: 'related', strength: 0.8 },
  { source: 'geotools', target: 'data', type: 'related', strength: 0.85 },
  { source: 'thinking', target: 'algorithm', type: 'related', strength: 0.65 },
  { source: 'geometry', target: 'geotools', type: 'related', strength: 0.7 },

  // 前置关系 (prerequisite)
  { source: 'matter', target: 'reaction', type: 'prerequisite', strength: 0.95 },
  { source: 'motion', target: 'energy', type: 'prerequisite', strength: 0.9 },
  { source: 'data', target: 'algorithm', type: 'prerequisite', strength: 0.9 },
  { source: 'life', target: 'genetics', type: 'prerequisite', strength: 0.85 },
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

// ==================== 主组件 ====================
export default function CourseCenter() {
  const [viewMode, setViewMode] = useState<'courses' | 'visualization'>('courses')
  const [selectedSubject, setSelectedSubject] = useState('全部')
  const [selectedGrade, setSelectedGrade] = useState('全部')
  const [selectedSource, setSelectedSource] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCourses = courses.filter((course) => {
    if (selectedSubject !== '全部' && !course.subjects.includes(selectedSubject)) return false
    if (selectedGrade !== '全部' && course.grade !== selectedGrade) return false
    if (selectedSource !== '全部') {
      if (selectedSource === '官方' && course.source !== 'official') return false
      if (selectedSource === '学校' && course.source !== 'school') return false
    }
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !course.knowledgeTags.some(tag => tag.includes(searchQuery))) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Hero 区域 */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl">
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
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade}>{grade === '全部' ? '全部年级' : grade}</option>
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
          <CourseGridView courses={filteredCourses} />
        ) : (
          <KnowledgeGraphView
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            courses={courses}
          />
        )}
      </div>
    </div>
  )
}

// ==================== 课程网格视图 ====================
function CourseGridView({ courses }: { courses: Course[] }) {
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* 学科标签 */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {course.subjects.map((subject) => (
                <span
                  key={subject}
                  className="px-2 py-1 text-xs font-medium rounded-lg backdrop-blur-sm"
                  style={{
                    backgroundColor: `${subjectColors[subject]}20`,
                    color: subjectColors[subject],
                    border: `1px solid ${subjectColors[subject]}40`,
                  }}
                >
                  {subject}
                </span>
              ))}
            </div>

            {/* 来源标签 */}
            <div className="absolute top-3 right-3">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-lg backdrop-blur-sm ${
                course.source === 'official'
                  ? 'bg-blue-500/90 text-white'
                  : 'bg-purple-500/90 text-white'
              }`}>
                {course.sourceName}
              </span>
            </div>

            {/* 底部信息 */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              {course.supportSelfStudy && (
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1">
                  <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  支持自学
                </span>
              )}
              <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1 ml-auto">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {course.studentCount}
              </span>
            </div>
          </div>

          {/* 内容 */}
          <div className="p-5">
            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>

            {/* 知识点标签 */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {course.knowledgeTags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
              {course.knowledgeTags.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{course.knowledgeTags.length - 3}
                </span>
              )}
            </div>

            {/* 跨学科概念 */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1.5">跨学科大概念</div>
              <div className="flex flex-wrap gap-1">
                {course.concepts.slice(0, 2).map((concept) => (
                  <span key={concept} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-100">
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* 年级和操作 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {course.grade}
              </span>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
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
}: {
  selectedSubject: string
  onSelectSubject: (subject: string) => void
  courses: Course[]
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [linkStrength, setLinkStrength] = useState(0.5)
  const [showLabels, setShowLabels] = useState(true)
  const [showLinks, setShowLinks] = useState(true)
  const [highlightClusters, setHighlightClusters] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const drawGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = containerRef.current.clientWidth
    const height = 550

    svg.attr('width', width).attr('height', height)

    // 添加缩放功能
    const g = svg.append('g')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // 筛选连接
    const filteredLinks = knowledgeLinks.filter(l => l.strength >= linkStrength)

    // 深拷贝节点数据
    const nodes = knowledgeNodes.map(n => ({ ...n }))
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

    // 绘制连接线
    if (showLinks) {
      const link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', d => {
          if (d.type === 'prerequisite') return '#10b981'
          if (d.type === 'contains') return '#d1d5db'
          return '#93c5fd'
        })
        .attr('stroke-width', d => d.type === 'contains' ? 1.5 : d.strength * 3)
        .attr('stroke-dasharray', d => d.type === 'related' ? '5,5' : '0')
        .attr('opacity', d => d.type === 'contains' ? 0.4 : 0.6)

      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y)
      })
    }

    // 绘制节点
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d: any) => {
        setSelectedNode(d.id)
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

    // 节点圆形
    node.append('circle')
      .attr('r', d => d.level === 1 ? 40 : d.level === 2 ? 28 : 20)
      .attr('fill', d => subjectColors[d.subject] || '#6b7280')
      .attr('opacity', d => {
        if (selectedSubject === '全部') return d.level === 1 ? 0.95 : 0.8
        return d.subject === selectedSubject ? (d.level === 1 ? 0.95 : 0.85) : 0.25
      })
      .attr('stroke', d => selectedNode === d.id ? '#fff' : 'transparent')
      .attr('stroke-width', d => selectedNode === d.id ? 4 : 0)
      .style('filter', d => d.level === 1 ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none')

    // 节点标签
    if (showLabels) {
      node.append('text')
        .text(d => d.name.length > 6 ? d.name.slice(0, 6) + '...' : d.name)
        .attr('text-anchor', 'middle')
        .attr('dy', d => d.level === 1 ? 4 : 3)
        .attr('fill', '#fff')
        .attr('font-size', d => d.level === 1 ? 13 : d.level === 2 ? 10 : 9)
        .attr('font-weight', d => d.level === 1 ? 'bold' : 'medium')
        .style('pointer-events', 'none')
    }

    // 聚类高亮
    if (highlightClusters) {
      const categories = [...new Set(nodes.map(n => n.category))]
      const categoryColors: Record<string, string> = {
        '语言文字': '#ec489920',
        '数理逻辑': '#10b98120',
        '自然科学': '#3b82f620',
        '人文社科': '#8b5cf620',
        '技术应用': '#6366f120',
      }

      // 为每个类别创建凸包
      categories.forEach(category => {
        const categoryNodes = nodes.filter(n => n.category === category)
        if (categoryNodes.length < 3) return

        const hull = g.append('path')
          .attr('fill', categoryColors[category] || '#00000010')
          .attr('stroke', categoryColors[category]?.replace('20', '40') || '#00000020')
          .attr('stroke-width', 2)
          .style('pointer-events', 'none')

        simulation.on('tick.hull' + category, () => {
          const points = categoryNodes.map((n: any) => [n.x, n.y] as [number, number])
          const hullPoints = d3.polygonHull(points)
          if (hullPoints) {
            hull.attr('d', `M${hullPoints.join('L')}Z`)
          }
        })
      })
    }

    simulation.on('tick', () => {
      if (showLinks) {
        g.selectAll('.links line')
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y)
      }
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

  }, [linkStrength, showLabels, showLinks, highlightClusters, selectedSubject, selectedNode, onSelectSubject])

  useEffect(() => {
    drawGraph()

    const handleResize = () => drawGraph()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawGraph])

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
              <div className="w-8 h-0.5 bg-emerald-500" />
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
                      <span className="text-xs text-gray-500">{course.grade}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{course.studentCount} 学生</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
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
