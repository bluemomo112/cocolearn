'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  heroTools,
  abilityPacks,
  cases,
  resourceTypes,
  resourceSubjects,
  type Resource
} from '@/data/mockData'

export default function ResourceHub() {
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('全部')
  const [searchText, setSearchText] = useState('')
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())

  const carouselRef = useRef<HTMLDivElement>(null)

  // 过滤案例
  const filteredCases = cases.filter(item => {
    const matchSubject = selectedSubject === '全部' || item.subjects?.includes(selectedSubject)
    const matchSearch = searchText === '' ||
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.tags.some(tag => tag.includes(searchText))
    const matchType = selectedType === 'all' || selectedType === 'case'
    return matchSubject && matchSearch && matchType
  })

  // 切换收藏
  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // 轮播控制
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // 判断是否显示各区域
  const showHeroTools = selectedType === 'all' || selectedType === 'tool'
  const showAbilityPacks = selectedType === 'all' || selectedType === 'ability-pack'
  const showCases = selectedType === 'all' || selectedType === 'case'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 right-20 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Hero 区域 */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            <span className="gradient-text">教师资源中心</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            发现创作工具、学习资源包与精选案例，助力你的跨学科教学之旅
          </p>
        </div>

        {/* 区域一：筛选栏 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap items-center gap-4">
            {/* 搜索框 */}
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索工具、资源包或案例..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* 一级筛选 - 类型 */}
            <div className="flex gap-2">
              {resourceTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedType === type.value
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* 二级筛选 - 学科 */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-200"
            >
              {resourceSubjects.map(subject => (
                <option key={subject} value={subject}>{subject === '全部' ? '全部学科' : subject}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 区域二：核心创作工具 (Hero Cards) */}
        {showHeroTools && (
          <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {heroTools.map((tool, index) => (
                <HeroToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* 区域三：能力资源包 (Carousel) */}
        {showAbilityPacks && (
          <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-900">精选能力提升包</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            >
              {abilityPacks.map((pack) => (
                <AbilityPackCard
                  key={pack.id}
                  pack={pack}
                  isBookmarked={bookmarkedIds.has(pack.id)}
                  onToggleBookmark={() => toggleBookmark(pack.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 区域四：案例与素材库 (Grid) */}
        {showCases && (
          <section className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">跨学科案例库</h2>

            {filteredCases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCases.map((caseItem, index) => (
                  <CaseCard
                    key={caseItem.id}
                    caseItem={caseItem}
                    delay={index * 0.05}
                    isBookmarked={bookmarkedIds.has(caseItem.id)}
                    onToggleBookmark={() => toggleBookmark(caseItem.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg">暂无匹配的案例</p>
                <p className="text-gray-400 text-sm mt-2">尝试调整筛选条件</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

// 核心工具 Hero 卡片
function HeroToolCard({ tool, index }: { tool: Resource; index: number }) {
  const gradients = [
    'from-emerald-500 via-emerald-400 to-teal-400',
    'from-teal-500 via-teal-400 to-cyan-400'
  ]

  const icons = [
    // 教案工坊图标
    <svg key="cpote" className="w-16 h-16 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11V8m0 0l-2 2m2-2l2 2" />
    </svg>,
    // AI训练场图标
    <svg key="ai" className="w-16 h-16 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      <circle cx="12" cy="9" r="3" strokeWidth={1.5} />
    </svg>
  ]

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradients[index]} p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-3">{tool.title}</h3>
          <p className="text-white/80 text-base mb-6 leading-relaxed">{tool.description}</p>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tool.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* CTA 按钮 */}
          <button className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md group-hover:shadow-lg">
            {index === 0 ? '开始创作' : '开始练习'}
            <svg className="inline-block w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* 图标 */}
        <div className="ml-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
          {icons[index]}
        </div>
      </div>
    </div>
  )
}

// 能力资源包卡片
function AbilityPackCard({
  pack,
  isBookmarked,
  onToggleBookmark
}: {
  pack: Resource
  isBookmarked: boolean
  onToggleBookmark: () => void
}) {
  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      {/* 封面 */}
      <div className="h-36 relative overflow-hidden">
        <Image
          src={pack.cover}
          alt={pack.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="288px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleBookmark()
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isBookmarked
                ? 'bg-yellow-400 text-white'
                : 'bg-white/90 text-gray-400 hover:text-yellow-500'
            }`}
          >
            <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-3xl font-bold drop-shadow-lg">{pack.title.charAt(0)}</div>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
          {pack.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pack.description}</p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {pack.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* 学习人数 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {pack.learnerCount?.toLocaleString()} 人学习
          </div>
          <button className="text-emerald-600 text-sm font-medium hover:text-emerald-700">
            开始学习 →
          </button>
        </div>
      </div>
    </div>
  )
}

// 案例卡片
function CaseCard({
  caseItem,
  delay,
  isBookmarked,
  onToggleBookmark
}: {
  caseItem: Resource
  delay: number
  isBookmarked: boolean
  onToggleBookmark: () => void
}) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* 封面 */}
      <div className="h-44 relative overflow-hidden">
        <Image
          src={caseItem.cover}
          alt={caseItem.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* 学科标签 */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          {caseItem.subjects?.map(subject => (
            <span
              key={subject}
              className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full"
            >
              {subject}
            </span>
          ))}
        </div>

        {/* 收藏按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleBookmark()
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isBookmarked
              ? 'bg-yellow-400 text-white'
              : 'bg-white/90 text-gray-400 hover:text-yellow-500'
          }`}
        >
          <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* 内容 */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors">
          {caseItem.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{caseItem.description}</p>

        {/* 核心概念 */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1.5">核心大概念</div>
          <div className="flex flex-wrap gap-1.5">
            {caseItem.concepts?.map(concept => (
              <span key={concept} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {concept}
              </span>
            ))}
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {caseItem.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full border border-emerald-100">
              {tag}
            </span>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button className="flex-1 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm">
            以此创建教案
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 transition-all duration-200">
            查看详情
          </button>
        </div>
      </div>
    </div>
  )
}
