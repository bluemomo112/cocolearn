'use client'

import Link from 'next/link'
import { BookOpen, Users, GraduationCap, Sparkles, Target, TrendingUp, Award, ChevronRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-slow" />
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

          {/* <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/course-center"
              className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 hover:scale-105 transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl"
            >
              进入课程中心
            </Link>
            <Link
              href="/admin"
              className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all duration-300"
            >
              管理者看板
            </Link>
          </div> */}
        </div>

        {/* 主功能入口 - 3个大卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* 课程中心 */}
          <Link href="/course-center" className="group">
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <BookOpen className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                课程中心
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                浏览精选跨学科课程，开启个性化学习之旅
              </p>
              <div className="flex items-center text-primary-600 font-medium group-hover:translate-x-2 transition-transform">
                立即探索
                <ChevronRight className="w-5 h-5 ml-1" />
              </div>
            </div>
          </Link>

          {/* 我的主页 */}
          <Link href="/teacher" className="group">
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Users className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-accent-600 transition-colors">
                我的主页
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                创建课程、管理教学、分析学情，一站式解决
              </p>
              <div className="flex items-center text-accent-600 font-medium group-hover:translate-x-2 transition-transform">
                进入工作台
                <ChevronRight className="w-5 h-5 ml-1" />
              </div>
            </div>
          </Link>

          {/* 自学模式 */}
          <Link href="/teacher/self-study" className="group">
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-fresh-500 to-fresh-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-fresh-600 transition-colors">
                自学模式
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AI 智能助教陪伴，打造专属学习空间
              </p>
              <div className="flex items-center text-fresh-600 font-medium group-hover:translate-x-2 transition-transform">
                开始自学
                <ChevronRight className="w-5 h-5 ml-1" />
              </div>
            </div>
          </Link>
        </div>

        {/* 平台特色 */}
        <div className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100 mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">平台特色</h2>
            <p className="text-gray-600">为跨学科教学提供全方位支持</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-primary-600" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">跨学科融合</h3>
              <p className="text-gray-600 leading-relaxed">
                打破学科边界，整合多学科知识体系，培养学生综合素养与创新思维
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-accent-600" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI 智能辅助</h3>
              <p className="text-gray-600 leading-relaxed">
                智能助教全程陪伴，提供个性化学习建议，实时答疑解惑
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-fresh-100 to-fresh-200 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-fresh-600" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">数据驱动</h3>
              <p className="text-gray-600 leading-relaxed">
                可视化追踪学习进度，科学评估教学效果，助力精准教学
              </p>
            </div>
          </div>

          {/* 数据统计 */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-100">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">1,200+</div>
              <div className="text-gray-600">精选课程</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-600 mb-2">500+</div>
              <div className="text-gray-600">活跃教师</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-fresh-600 mb-2">10,000+</div>
              <div className="text-gray-600">学习资源</div>
            </div>
          </div>
        </div>

        {/* 教师推荐 */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl p-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">课程推荐</h2>
              <p className="text-gray-600">优秀的跨学科教学实践</p>
            </div>
            <Award className="w-12 h-12 text-primary-600" strokeWidth={1.5} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                teacher: '张老师',
                subject: '数学 × 物理',
                course: '运动中的数学建模',
                students: 156,
                rating: 4.9
              },
              {
                teacher: '李老师',
                subject: '历史 × 地理',
                course: '丝绸之路的文明交融',
                students: 203,
                rating: 4.8
              },
              {
                teacher: '王老师',
                subject: '生物 × 化学',
                course: '生命的化学密码',
                students: 178,
                rating: 4.9
              },
              {
                teacher: '陈老师',
                subject: '语文 × 艺术',
                course: '诗词中的美学世界',
                students: 192,
                rating: 4.7
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-primary-600 font-medium mb-1">{item.subject}</div>
                    <h3 className="text-lg font-bold text-gray-900">{item.course}</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                    <span className="text-amber-600 text-sm font-semibold">{item.rating}</span>
                    <span className="text-amber-500">★</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{item.teacher}</span>
                  <span>{item.students} 名学生</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
