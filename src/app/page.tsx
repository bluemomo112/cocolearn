'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-slow" />
            跨学科AI学习平台
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            让跨学科教学
            <br />
            <span className="gradient-text">更简单、更高效</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            整合权威教材与AI辅助工具，赋能教师轻松创建高质量跨学科课程，
            为学生提供个性化的学习体验
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/teacher"
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl"
            >
              进入教师中心
            </Link>
            <Link
              href="/admin"
              className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
            >
              管理者看板
            </Link>
          </div>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link href="/teacher" className="group">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                教师工作台
              </h3>
              <p className="text-gray-500 text-sm">
                教学管理、课程创建、学情分析一站式解决
              </p>
            </div>
          </Link>

          <Link href="/teacher/course-center" className="group">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                课程中心
              </h3>
              <p className="text-gray-500 text-sm">
                探索跨学科课程资源，知识图谱可视化
              </p>
            </div>
          </Link>

          <Link href="/teacher/knowledge" className="group">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                知识库
              </h3>
              <p className="text-gray-500 text-sm">
                管理教学资源，智能切片与语义检索
              </p>
            </div>
          </Link>

          <Link href="/admin" className="group">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                管理看板
              </h3>
              <p className="text-gray-500 text-sm">
                全局数据监控、教师与课程管理
              </p>
            </div>
          </Link>
        </div>

        {/* 特色功能 */}
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">平台特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: '跨学科融合',
                desc: '打破学科边界，培养学生综合素养'
              },
              {
                icon: '🤖',
                title: 'AI 智能辅助',
                desc: '智能助教全程陪伴，个性化学习体验'
              },
              {
                icon: '📊',
                title: '数据驱动',
                desc: '可视化追踪教学效果，科学评估成长'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
