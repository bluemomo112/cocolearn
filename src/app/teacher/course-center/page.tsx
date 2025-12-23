'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import TeacherHeader from '@/components/TeacherHeader'
import * as d3 from 'd3'

// 课程类型定义
interface Course {
  id: string
  title: string
  cover: string
  subjects: string[]
  source: string
  sourceName: string
  knowledgeTags: string[]
  supportSelfStudy: boolean
  studentCount: number
  grade: string
}

// 模拟数据
const platformStats = {
  singleCourses: 156,
  seriesCourses: 28,
  teachers: 342,
  schools: 45,
}

const subjects = ['全部', '数学', '物理', '化学', '生物', '地理', '历史', '语文', '英语', '信息技术', '音乐', '美术']
const grades = ['全部', '小学', '初中', '高中']
const sources = ['全部', '官方', '学校']

const courses = [
  {
    id: '1',
    title: '水循环与气候变化探究',
    cover: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=400&h=300&fit=crop',
    subjects: ['地理', '物理'],
    source: 'official',
    sourceName: '平台官方',
    knowledgeTags: ['水循环', '气候系统', '全球变暖', '生态平衡'],
    supportSelfStudy: true,
    studentCount: 1250,
    grade: '高中',
  },
  {
    id: '2',
    title: '数学建模与环境保护',
    cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    subjects: ['数学', '生物'],
    source: 'school',
    sourceName: '北京四中',
    knowledgeTags: ['函数建模', '数据分析', '生态系统'],
    supportSelfStudy: true,
    studentCount: 856,
    grade: '高中',
  },
  {
    id: '3',
    title: '文艺复兴的科学革命',
    cover: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop',
    subjects: ['历史', '物理'],
    source: 'official',
    sourceName: '平台官方',
    knowledgeTags: ['文艺复兴', '科学发展', '天文学'],
    supportSelfStudy: false,
    studentCount: 643,
    grade: '初中',
  },
  {
    id: '4',
    title: '音乐中的数学之美',
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop',
    subjects: ['数学', '音乐'],
    source: 'school',
    sourceName: '上海中学',
    knowledgeTags: ['波形', '频率', '和声', '数学比例'],
    supportSelfStudy: true,
    studentCount: 428,
    grade: '初中',
  },
  {
    id: '5',
    title: '化学反应与艺术创作',
    cover: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop',
    subjects: ['化学', '美术'],
    source: 'official',
    sourceName: '平台官方',
    knowledgeTags: ['化学变化', '颜料', '材料科学'],
    supportSelfStudy: true,
    studentCount: 312,
    grade: '高中',
  },
  {
    id: '6',
    title: '编程思维与逻辑推理',
    cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop',
    subjects: ['信息技术', '数学'],
    source: 'school',
    sourceName: '深圳中学',
    knowledgeTags: ['算法', '逻辑思维', '问题解决'],
    supportSelfStudy: true,
    studentCount: 567,
    grade: '初中',
  },
]

// 知识图谱数据
const knowledgeNodes = [
  { id: 'math', name: '数学', subject: '数学', level: 1, x: 400, y: 300 },
  { id: 'physics', name: '物理', subject: '物理', level: 1, x: 600, y: 200 },
  { id: 'chemistry', name: '化学', subject: '化学', level: 1, x: 700, y: 400 },
  { id: 'biology', name: '生物', subject: '生物', level: 1, x: 500, y: 500 },
  { id: 'geography', name: '地理', subject: '地理', level: 1, x: 300, y: 400 },
  { id: 'history', name: '历史', subject: '历史', level: 1, x: 200, y: 250 },
  { id: 'function', name: '函数', subject: '数学', level: 2, x: 350, y: 200 },
  { id: 'wave', name: '波动', subject: '物理', level: 2, x: 550, y: 150 },
  { id: 'climate', name: '气候', subject: '地理', level: 2, x: 400, y: 450 },
  { id: 'ecology', name: '生态', subject: '生物', level: 2, x: 600, y: 500 },
]

const knowledgeLinks = [
  { source: 'math', target: 'physics', type: 'related', strength: 0.8 },
  { source: 'physics', target: 'chemistry', type: 'related', strength: 0.6 },
  { source: 'chemistry', target: 'biology', type: 'related', strength: 0.7 },
  { source: 'biology', target: 'geography', type: 'related', strength: 0.5 },
  { source: 'function', target: 'wave', type: 'prerequisite', strength: 0.9 },
  { source: 'climate', target: 'ecology', type: 'related', strength: 0.8 },
  { source: 'math', target: 'function', type: 'contains', strength: 1 },
  { source: 'physics', target: 'wave', type: 'contains', strength: 1 },
]

const subjectColors: Record<string, string> = {
  '数学': '#10b981',
  '物理': '#3b82f6',
  '化学': '#f59e0b',
  '生物': '#22c55e',
  '地理': '#06b6d4',
  '历史': '#8b5cf6',
  '语文': '#ec4899',
  '英语': '#f97316',
  '信息技术': '#6366f1',
  '音乐': '#14b8a6',
  '美术': '#f43f5e',
}

export default function TeacherCourseCenter() {
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
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <>
      <TeacherHeader title="课程中心" />

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 p-6">
        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{platformStats.singleCourses}</p>
            <p className="text-sm text-gray-500">单一课程</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{platformStats.seriesCourses}</p>
            <p className="text-sm text-gray-500">系列课程</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{platformStats.teachers}</p>
            <p className="text-sm text-gray-500">参与教师</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{platformStats.schools}</p>
            <p className="text-sm text-gray-500">参与学校</p>
          </div>
        </div>

        {/* View Toggle & Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('courses')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'visualization'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  可视化视图
                </span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject === '全部' ? '全部学科' : subject}</option>
                ))}
              </select>

              {/* Grade Filter */}
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade}>{grade === '全部' ? '全部年级' : grade}</option>
                ))}
              </select>

              {/* Source Filter */}
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {sources.map((source) => (
                  <option key={source} value={source}>{source === '全部' ? '全部来源' : source}</option>
                ))}
              </select>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索课程..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-48"
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

        {/* Content */}
        {viewMode === 'courses' ? (
          <CourseGridView courses={filteredCourses} />
        ) : (
          <VisualizationView
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
          />
        )}
      </main>
    </>
  )
}

// 课程网格视图
function CourseGridView({ courses }: { courses: Course[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      {courses.map((course, index) => (
        <div
          key={course.id}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* Cover Image */}
          <div className="relative h-44 overflow-hidden">
            <img
              src={course.cover}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              {course.subjects.map((subject) => (
                <span
                  key={subject}
                  className="px-2 py-1 text-xs font-medium rounded-lg"
                  style={{
                    backgroundColor: `${subjectColors[subject]}20`,
                    color: subjectColors[subject],
                  }}
                >
                  {subject}
                </span>
              ))}
            </div>

            {/* Source Badge */}
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                course.source === 'official'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}>
                {course.sourceName}
              </span>
            </div>

            {/* Self-study Badge */}
            {course.supportSelfStudy && (
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1">
                  <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  支持自学
                </span>
              </div>
            )}

            {/* Student Count */}
            <div className="absolute bottom-3 right-3">
              <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {course.studentCount}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>

            {/* Knowledge Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
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

            {/* Grade */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">{course.grade}</span>
            </div>

            {/* Action Button */}
            <button className="w-full px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors">
              去授课
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// 可视化视图
function VisualizationView({
  selectedSubject,
  onSelectSubject
}: {
  selectedSubject: string
  onSelectSubject: (subject: string) => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [linkStrength, setLinkStrength] = useState(0.5)
  const [showLabels, setShowLabels] = useState(true)
  const [showLinks, setShowLinks] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const drawGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = containerRef.current.clientWidth
    const height = 500

    svg.attr('width', width).attr('height', height)

    // Filter links by strength
    const filteredLinks = knowledgeLinks.filter(l => l.strength >= linkStrength)

    // Create simulation
    const simulation = d3.forceSimulation(knowledgeNodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(filteredLinks)
        .id((d: any) => d.id)
        .distance(100)
        .strength((d: any) => d.strength * 0.5))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))

    // Draw links
    if (showLinks) {
      const link = svg.append('g')
        .selectAll('line')
        .data(filteredLinks)
        .enter()
        .append('line')
        .attr('stroke', d => d.type === 'prerequisite' ? '#10b981' : '#e5e7eb')
        .attr('stroke-width', d => d.strength * 3)
        .attr('stroke-dasharray', d => d.type === 'prerequisite' ? '0' : '5,5')
        .attr('opacity', 0.6)

      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y)
      })
    }

    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(knowledgeNodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d.id)
        onSelectSubject(d.subject)
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

    // Node circles
    node.append('circle')
      .attr('r', d => d.level === 1 ? 35 : 25)
      .attr('fill', d => subjectColors[d.subject] || '#6b7280')
      .attr('opacity', d => {
        if (selectedSubject === '全部') return 0.9
        return d.subject === selectedSubject ? 0.9 : 0.3
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)

    // Node labels
    if (showLabels) {
      node.append('text')
        .text(d => d.name)
        .attr('text-anchor', 'middle')
        .attr('dy', 4)
        .attr('fill', '#fff')
        .attr('font-size', d => d.level === 1 ? 12 : 10)
        .attr('font-weight', 'bold')
    }

    simulation.on('tick', () => {
      if (showLinks) {
        svg.selectAll('line')
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y)
      }

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })
  }, [linkStrength, showLabels, showLinks, selectedSubject, onSelectSubject])

  useEffect(() => {
    drawGraph()

    const handleResize = () => drawGraph()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawGraph])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Control Panel */}
      <div className="lg:col-span-1 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">可视化控制</h3>

          {/* Subject Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">学科筛选</label>
            <select
              value={selectedSubject}
              onChange={(e) => onSelectSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject === '全部' ? '全部学科' : subject}</option>
              ))}
            </select>
          </div>

          {/* Link Strength Slider */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关联强度: {(linkStrength * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={linkStrength}
              onChange={(e) => setLinkStrength(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">显示标签</span>
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  showLabels ? 'bg-emerald-500' : 'bg-gray-300'
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
                  showLinks ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    showLinks ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">图例</h3>
          <div className="space-y-2">
            {Object.entries(subjectColors).slice(0, 6).map(([subject, color]) => (
              <div key={subject} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm text-gray-600">{subject}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-emerald-500" />
              <span className="text-xs text-gray-500">前置关系</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-300" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #d1d5db 0, #d1d5db 4px, transparent 4px, transparent 8px)' }} />
              <span className="text-xs text-gray-500">相关性</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="lg:col-span-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div
          ref={containerRef}
          className="bg-white rounded-2xl border border-gray-100 p-4 overflow-hidden"
        >
          <svg ref={svgRef} className="w-full" style={{ minHeight: 500 }} />
        </div>

        {/* Selected Node Courses */}
        {selectedNode && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 animate-fade-in">
            <h3 className="font-semibold text-gray-900 mb-4">
              相关课程 - {knowledgeNodes.find(n => n.id === selectedNode)?.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses
                .filter(c => c.subjects.includes(knowledgeNodes.find(n => n.id === selectedNode)?.subject || ''))
                .slice(0, 4)
                .map((course) => (
                  <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                    <img src={course.cover} alt={course.title} className="w-16 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{course.title}</h4>
                      <p className="text-xs text-gray-500">{course.studentCount} 学生</p>
                    </div>
                    <button className="px-3 py-1.5 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-lg hover:bg-emerald-200">
                      查看
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
