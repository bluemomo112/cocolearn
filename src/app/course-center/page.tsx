'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import * as d3 from 'd3'
import {
  courses,
  knowledgeNodes,
  knowledgeLinks,
  subjects,
  grades,
  sources,
  platformStats,
  type Course,
  type KnowledgeNode,
  type KnowledgeLink
} from '@/data/mockData'

// 学科颜色映射
const subjectColors: Record<string, string> = {
  '数学': '#3b82f6',
  '物理': '#8b5cf6',
  '化学': '#f59e0b',
  '生物': '#10b981',
  '地理': '#06b6d4',
  '历史': '#ef4444',
  '美术': '#ec4899',
  '音乐': '#6366f1'
}

export default function CourseCenter() {
  const [viewMode, setViewMode] = useState<'course' | 'visualization'>('course')
  const [selectedSubject, setSelectedSubject] = useState('全部')
  const [selectedGrade, setSelectedGrade] = useState('全部')
  const [selectedSource, setSelectedSource] = useState('全部')
  const [searchText, setSearchText] = useState('')
  const [strengthThreshold, setStrengthThreshold] = useState(0.5)
  const [showLabels, setShowLabels] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [highlightClusters, setHighlightClusters] = useState(false)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)

  // 过滤课程
  const filteredCourses = courses.filter(course => {
    const matchSubject = selectedSubject === '全部' || course.subjects.includes(selectedSubject)
    const matchGrade = selectedGrade === '全部' || course.grade === selectedGrade
    const matchSource = selectedSource === '全部' ||
      (selectedSource === '官方' && course.source === 'official') ||
      (selectedSource === '组织' && course.source === 'organization')
    const matchSearch = searchText === '' ||
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.knowledgeTags.some(tag => tag.includes(searchText))
    return matchSubject && matchGrade && matchSource && matchSearch
  })

  // D3 可视化
  const renderVisualization = useCallback(() => {
    if (!svgRef.current || viewMode !== 'visualization') return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // 过滤节点和边
    const filteredNodes = selectedSubject === '全部'
      ? knowledgeNodes
      : knowledgeNodes.filter(n => n.subject === selectedSubject)

    const nodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredLinks = knowledgeLinks.filter(
      l => l.strength >= strengthThreshold &&
           nodeIds.has(l.source as string) &&
           nodeIds.has(l.target as string)
    )

    // 创建力导向图
    const simulation = d3.forceSimulation(filteredNodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(filteredLinks)
        .id((d: d3.SimulationNodeDatum) => (d as KnowledgeNode).id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))

    // 添加缩放
    const g = svg.append('g')
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    svg.call(zoom)

    // 绘制连线
    const links = g.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('stroke', d => d.type === 'prerequisite' ? '#10b981' : '#94a3b8')
      .attr('stroke-width', d => d.strength * 3)
      .attr('stroke-opacity', showConnections ? 0.6 : 0)
      .attr('stroke-dasharray', d => d.type === 'related' ? '5,5' : 'none')

    // 绘制节点
    const nodes = g.append('g')
      .selectAll<SVGGElement, KnowledgeNode>('g')
      .data(filteredNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (_event, d) => {
        setSelectedNode(d)
      })

    // 添加拖拽行为
    const dragBehavior = d3.drag<SVGGElement, KnowledgeNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    nodes.call(dragBehavior)

    // 节点圆圈
    nodes.append('circle')
      .attr('r', d => 20 + d.relatedCourses.length * 5)
      .attr('fill', d => subjectColors[d.subject] || '#6b7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', highlightClusters ? 0.8 : 1)

    // 节点标签
    if (showLabels) {
      nodes.append('text')
        .text(d => d.name)
        .attr('text-anchor', 'middle')
        .attr('dy', 35)
        .attr('fill', '#374151')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
    }

    // 更新位置
    simulation.on('tick', () => {
      links
        .attr('x1', d => (d.source as unknown as KnowledgeNode).x || 0)
        .attr('y1', d => (d.source as unknown as KnowledgeNode).y || 0)
        .attr('x2', d => (d.target as unknown as KnowledgeNode).x || 0)
        .attr('y2', d => (d.target as unknown as KnowledgeNode).y || 0)

      nodes.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`)
    })

    return () => {
      simulation.stop()
    }
  }, [viewMode, selectedSubject, strengthThreshold, showLabels, showConnections, highlightClusters])

  useEffect(() => {
    renderVisualization()
  }, [renderVisualization])

  // 根据选中节点过滤课程
  const relatedCourses = selectedNode
    ? courses.filter(c => selectedNode.relatedCourses.includes(c.id))
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Hero 区域 */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            <span className="gradient-text">跨学科课程中心</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            发现和探索优质跨学科课程资源，开启创新教学之旅
          </p>
        </div>

        {/* 平台统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {[
            { label: '单一课程', value: platformStats.singleCourses, icon: '📚' },
            { label: '系列课程', value: platformStats.seriesCourses, icon: '📖' },
            { label: '参与教师', value: platformStats.teachers, icon: '👩‍🏫' },
            { label: '参与学校', value: platformStats.schools, icon: '🏫' }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 视图切换 */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 inline-flex">
            <button
              onClick={() => setViewMode('course')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                viewMode === 'course'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-emerald-600'
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
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                viewMode === 'visualization'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-emerald-600'
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
        </div>

        {/* 筛选栏 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 animate-fade-in">
          <div className="flex flex-wrap items-center gap-4">
            {/* 搜索框 */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索课程或知识点..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* 学科筛选 */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-200"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject === '全部' ? '全部学科' : subject}</option>
              ))}
            </select>

            {/* 年级筛选 */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-200"
            >
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade === '全部' ? '全部年级' : grade}</option>
              ))}
            </select>

            {/* 来源筛选 */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-200"
            >
              {sources.map(source => (
                <option key={source} value={source}>{source === '全部' ? '全部来源' : source}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 课程视图 */}
        {viewMode === 'course' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {filteredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} delay={index * 0.05} />
            ))}
            {filteredCourses.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">暂无匹配的课程</p>
                <p className="text-gray-400 text-sm mt-2">尝试调整筛选条件</p>
              </div>
            )}
          </div>
        )}

        {/* 可视化视图 */}
        {viewMode === 'visualization' && (
          <div className="flex gap-6 animate-fade-in">
            {/* 可视化控制面板 */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-6">
                <h3 className="font-semibold text-gray-900 mb-4">可视化控制</h3>

                {/* 关联强度滑块 */}
                <div className="mb-5">
                  <label className="text-sm text-gray-600 mb-2 block">
                    关联强度阈值: {strengthThreshold.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={strengthThreshold}
                    onChange={(e) => setStrengthThreshold(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                {/* 显示选项 */}
                <div className="space-y-3 mb-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLabels}
                      onChange={(e) => setShowLabels(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-500"
                    />
                    <span className="text-sm text-gray-600">显示标签</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showConnections}
                      onChange={(e) => setShowConnections(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-500"
                    />
                    <span className="text-sm text-gray-600">显示连接</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={highlightClusters}
                      onChange={(e) => setHighlightClusters(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-500"
                    />
                    <span className="text-sm text-gray-600">聚类高亮</span>
                  </label>
                </div>

                {/* 图例 */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">学科图例</h4>
                  <div className="space-y-2">
                    {Object.entries(subjectColors).map(([subject, color]) => (
                      <div key={subject} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-gray-600">{subject}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 连接类型图例 */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">连接类型</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-emerald-500" />
                      <span className="text-xs text-gray-600">前置关系</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-gray-400" style={{ background: 'repeating-linear-gradient(90deg, #94a3b8, #94a3b8 4px, transparent 4px, transparent 8px)' }} />
                      <span className="text-xs text-gray-600">相关性</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 可视化画布 */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
                <svg ref={svgRef} className="w-full h-full" />
              </div>

              {/* 选中节点的相关课程 */}
              {selectedNode && (
                <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-scale-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      与「{selectedNode.name}」相关的课程
                    </h3>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {relatedCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {relatedCourses.map(course => (
                        <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                            {course.title.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{course.title}</h4>
                            <div className="flex gap-1 mt-1">
                              {course.subjects.map(s => (
                                <span key={s} className="px-2 py-0.5 bg-white text-xs text-gray-600 rounded-full">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors">
                            去授课
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">暂无相关课程</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 课程卡片组件
function CourseCard({ course, delay }: { course: Course; delay: number }) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* 封面 */}
      <div className="h-40 relative overflow-hidden">
        <Image
          src={course.cover}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          {course.subjects.map(subject => (
            <span
              key={subject}
              className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium rounded-full"
            >
              {subject}
            </span>
          ))}
        </div>
        {course.supportSelfStudy && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            支持自学
          </div>
        )}
      </div>

      {/* 内容 */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            course.source === 'official'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {course.sourceName}
          </span>
          <span className="text-xs text-gray-400">{course.grade}</span>
        </div>

        <h3 className="font-semibold text-gray-900 text-lg mb-3 group-hover:text-emerald-600 transition-colors">
          {course.title}
        </h3>

        {/* 知识点标签 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {course.knowledgeTags.slice(0, 3).map(tag => (
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

        {/* 底部信息 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {course.studentCount} 学生
          </div>
          <button className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md">
            去授课
          </button>
        </div>
      </div>
    </div>
  )
}
