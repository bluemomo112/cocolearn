'use client'

import { useState } from 'react'
import Image from 'next/image'

// 名师课堂数据
const masterClassrooms = [
  {
    id: '1',
    title: '《湿地生态系统》跨学科探究课',
    teacher: '张老师',
    school: '实验中学',
    subject: '生物+地理',
    grade: '初中',
    duration: 45,
    views: 12458,
    rating: 4.9,
    tags: ['跨学科融合', '项目式学习', '生态探究'],
    thumbnail: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=240&fit=crop',
    highlights: [
      { time: '08:30', type: 'interaction', title: '精彩师生问答' },
      { time: '15:20', type: 'technology', title: '数据可视化展示' },
      { time: '28:45', type: 'collaboration', title: '小组讨论高潮' }
    ]
  },
  {
    id: '2',
    title: '《丝绸之路的科学与文化》综合课',
    teacher: '李老师',
    school: '育才中学',
    subject: '历史+化学',
    grade: '高中',
    duration: 50,
    views: 8924,
    rating: 4.8,
    tags: ['文化融合', '化学原理', '跨学科思维'],
    thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=240&fit=crop',
    highlights: [
      { time: '05:15', type: 'emotion', title: '情境导入精彩' },
      { time: '18:30', type: 'reading', title: '史料分析指导' },
      { time: '32:10', type: 'thinking', title: '深度概念联结' }
    ]
  },
  {
    id: '3',
    title: '《音乐中的数学奥秘》融合课',
    teacher: '王老师',
    school: '艺术学校',
    subject: '数学+音乐',
    grade: '初中',
    duration: 40,
    views: 15632,
    rating: 4.9,
    tags: ['艺术融合', '数学思维', '动手实践'],
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=240&fit=crop',
    highlights: [
      { time: '12:45', type: 'experiment', title: '乐器实验演示' },
      { time: '25:30', type: 'discovery', title: '学生发现规律' },
      { time: '38:15', type: 'application', title: '创作应用拓展' }
    ]
  }
]

// 教学方法精选
const growthProblems = [
  {
    id: 'cpote',
    problem: 'C-POTE跨学科设计模型',
    description: '情境-问题-组织-任务-评价，系统性跨学科课程设计框架',
    solutions: [
      { type: 'video', title: 'C-POTE模型完整解析与应用', duration: '18分钟', views: 4156 },
      { type: 'template', title: 'C-POTE教案设计工作表（可下载）', downloads: 2580 },
      { type: 'guide', title: '大概念提取与学科联结操作手册', pages: 28 }
    ],
    caseStudies: [
      { title: '用C-POTE设计《水循环与生态平衡》跨学科课例分析', teacher: '张老师' },
      { title: '从C-POTE视角重构《文艺复兴》历史与艺术融合课', teacher: '李老师' }
    ]
  },
  {
    id: 'bloom',
    problem: '布鲁姆分类法与高阶提问',
    description: '基于六层认知目标，设计促进学生深度思考的提问序列',
    solutions: [
      { type: 'video', title: '高阶思维提问序列设计实践课', duration: '12分钟', views: 3240 },
      { type: 'template', title: '六认知层级提问句式参考卡（可下载）', downloads: 1890 },
      { type: 'guide', title: '跨学科课堂提问梯度设计指南', pages: 16 }
    ],
    caseStudies: [
      { title: '从"记忆"到"创造"：一堂地理课的提问升级实录', teacher: '王老师' },
      { title: '用追问引导学生主动建立跨学科概念联结', teacher: '赵老师' }
    ]
  },
  {
    id: 'formative',
    problem: '形成性评价实践策略',
    description: '嵌入课堂的即时评价方法，及时诊断学习状态并调整教学',
    solutions: [
      { type: 'video', title: '课堂形成性评价设计与实施', duration: '15分钟', views: 2890 },
      { type: 'rubric', title: '跨学科素养多维评价量表集（18份）', count: 18 },
      { type: 'checklist', title: '课堂学习证据收集自检清单（20项）', items: 20 }
    ],
    caseStudies: [
      { title: '项目式学习中如何实施全过程形成性评价', teacher: '陈老师' },
      { title: '"教学评一致性"在跨学科综合课的落地实践', teacher: '刘老师' }
    ]
  }
]

// 即用工具包数据
const toolkitItems = [
  { id: 'cpote-template', type: 'template', category: '教案模板', title: 'C-POTE跨学科教案设计模板', desc: '含情境、问题、组织、任务、评价五环节完整结构', format: 'Word', pages: 4, downloads: 2580 },
  { id: 'bigconcept-worksheet', type: 'template', category: '教案模板', title: '大概念提取工作表', desc: '帮助提炼核心概念并建立跨学科联结', format: 'Word', pages: 2, downloads: 1430 },
  { id: 'lesson-checklist', type: 'checklist', category: '自检清单', title: '跨学科教案设计自检表', desc: '20项核查点，确保教案符合跨学科设计要求', format: 'PDF', items: 20, downloads: 1890 },
  { id: 'evidence-checklist', type: 'checklist', category: '自检清单', title: '课堂学习证据收集清单', desc: '记录课堂中学生学习行为与学习成果的观察工具', format: 'PDF', items: 18, downloads: 1240 },
  { id: 'interdisciplinary-rubric', type: 'rubric', category: '评价量表', title: '跨学科素养多维评价量表集', desc: '18份量表覆盖知识迁移、问题解决、沟通协作等维度', format: 'PDF', count: 18, downloads: 3120 },
  { id: 'student-record', type: 'rubric', category: '评价量表', title: '学生表现评价记录表', desc: '项目式学习中记录学生全程表现的可编辑表格', format: 'Excel', pages: 1, downloads: 2050 },
  { id: 'interaction-rubric', type: 'rubric', category: '评价量表', title: '课堂互动质量自评量表', desc: '教师自评课堂提问与互动效果的18项指标', format: 'PDF', items: 18, downloads: 980 },
  { id: 'bloom-cards', type: 'guide', category: '参考手册', title: '布鲁姆六层提问句式参考卡', desc: '六认知层级提问句式示例，按学科场景分类整理', format: 'PDF', pages: 8, downloads: 4210 },
  { id: 'cpote-manual', type: 'guide', category: '参考手册', title: 'C-POTE实施操作手册', desc: '从课程设计到落地实施的完整步骤与常见问题', format: 'PDF', pages: 28, downloads: 1760 },
]

// 情境模拟数据
const simulationScenarios = [
  {
    id: 'concept_challenge',
    title: '概念联结困难',
    scenario: '学生问："老师，这两个学科的知识有什么关系？"',
    difficulty: 'medium',
    category: 'concept_integration',
    responses: [
      {
        type: 'analogy_method',
        title: '类比联结法',
        content: '"就像河流连接不同的城市一样，这两个概念都在描述..."',
        effectiveness: 85,
        usage_rate: 67
      },
      {
        type: 'visual_method',
        title: '可视化联结法',
        content: '"让我们画一张概念图，看看它们是如何连接的..."',
        effectiveness: 91,
        usage_rate: 52
      },
      {
        type: 'real_case',
        title: '真实案例法',
        content: '"在我们生活中，有一个很好的例子可以说明..."',
        effectiveness: 88,
        usage_rate: 78
      }
    ]
  },
  {
    id: 'group_collaboration',
    title: '小组协作失衡',
    scenario: '小组活动中，只有少数学生在参与',
    difficulty: 'hard',
    category: 'classroom_management',
    responses: [
      {
        type: 'role_assignment',
        title: '角色轮换法',
        content: '为每个学生分配明确的角色，并定期轮换...',
        effectiveness: 87,
        usage_rate: 71
      },
      {
        type: 'structured_task',
        title: '任务拆分法',
        content: '将任务拆分为必须合作才能完成的子任务...',
        effectiveness: 82,
        usage_rate: 65
      }
    ]
  },
  {
    id: 'depth_thinking',
    title: '思考深度不足',
    scenario: '学生的回答停留在表面，缺乏深度思考',
    difficulty: 'medium',
    category: 'instructional_strategy',
    responses: [
      {
        type: 'bloom_questioning',
        title: '布鲁姆提问法',
        content: '使用高阶思维问题引导，如"如果...会怎样？"',
        effectiveness: 91,
        usage_rate: 78
      },
      {
        type: 'socratic_method',
        title: '苏格拉底追问',
        content: '通过连续追问引导学生深入思考...',
        effectiveness: 88,
        usage_rate: 62
      }
    ]
  }
]

export default function ResourceHub() {
  const [selectedVideo, setSelectedVideo] = useState<typeof masterClassrooms[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProblem, setSelectedProblem] = useState('cpote')
  const [toolkitFilter, setToolkitFilter] = useState('全部')

  const filteredMasters = masterClassrooms.filter(item =>
    searchQuery === '' ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 right-20 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="gradient-text">教师专业发展资源库</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            数据驱动的教师成长引擎，提供个性化跨学科教学专业发展资源
          </p>
        </div>

        {/* 模块导航概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {[
            { icon: '⭐', title: '名师课堂', desc: '观摩优秀教学案例', count: masterClassrooms.length, unit: '精选课程', color: 'text-yellow-500' },
            { icon: '🚀', title: '教学方法', desc: '核心跨学科教学方法', count: growthProblems.length, unit: '核心方法', color: 'text-primary-500' },
            { icon: '🛠️', title: '即用工具包', desc: '直接下载，开箱即用', count: toolkitItems.length, unit: '实用工具', color: 'text-accent-500' },
            { icon: '🎯', title: '教学情境演练', desc: '真实课堂情境模拟', count: simulationScenarios.length, unit: '模拟场景', color: 'text-cyan-500' }
          ].map((item, index) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <div className={`text-3xl mb-3 ${item.color}`}>{item.icon}</div>
              <h3 className="text-base font-bold text-gray-800 mb-1 group-hover:text-primary-600 transition-colors">{item.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{item.desc}</p>
              <div className="text-2xl font-bold text-primary-600">{item.count}</div>
              <div className="text-xs text-gray-400">{item.unit}</div>
            </div>
          ))}
        </div>

        {/* 1. 名师课堂模块 */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center mb-6">
            <div className="text-3xl mr-3">⭐</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">名师课堂</h2>
              <p className="text-gray-600 text-sm mt-1">观摩优秀跨学科教学案例，学习教学精髓</p>
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索名师课堂..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500 transition-all duration-200"
                />
              </div>
              <select className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all">
                <option>全部学科</option>
                <option>数学</option>
                <option>物理</option>
                <option>化学</option>
                <option>生物</option>
                <option>地理</option>
                <option>历史</option>
              </select>
            </div>
          </div>

          {/* 名师课堂列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMasters.map((classroom, index) => (
              <div
                key={classroom.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up flex flex-col"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                {/* 视频缩略图 */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={classroom.thumbnail}
                    alt={classroom.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* 播放按钮 */}
                  <button
                    onClick={() => setSelectedVideo(classroom)}
                    className="absolute inset-0 flex items-center justify-center group/play"
                  >
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-white shadow-lg">
                      <svg className="w-6 h-6 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>

                  {/* 时长标记 */}
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-sm rounded-lg">
                    {classroom.duration}分钟
                  </div>

                  {/* 评分 */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 text-white text-sm px-2 py-1 rounded-lg">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{classroom.rating}</span>
                  </div>
                </div>

                {/* 课堂信息 */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {classroom.title}
                  </h3>

                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="font-medium">{classroom.teacher}</span>
                    <span className="text-gray-300">|</span>
                    <span>{classroom.school}</span>
                    <span className="text-gray-300">|</span>
                    <span>{classroom.subject}</span>
                  </div>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {classroom.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                        {tag}
                      </span>
                    ))}
                    {classroom.tags.length > 2 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        +{classroom.tags.length - 2}
                      </span>
                    )}
                  </div>

                  {/* 互动数据 */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{classroom.views.toLocaleString()}</span>
                      </div>
                    </div>

                    <button className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm">
                      观看学习
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 教师成长计划模块 */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center mb-6">
            <div className="text-3xl mr-3">🚀</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">教学方法精选</h2>
              <p className="text-gray-600 text-sm mt-1">聚焦跨学科教师核心教学方法，提供配套资源与课例参考</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* 问题选择器 */}
            <div className="lg:col-span-1 flex flex-col">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-5">选择教学方法</h3>
                <div className="space-y-3">
                  {growthProblems.map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => setSelectedProblem(problem.id)}
                      className={`w-full p-4 rounded-2xl text-left transition-all duration-300 ${
                        selectedProblem === problem.id
                          ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                      }`}
                    >
                      <div className="font-semibold mb-1">{problem.problem}</div>
                      <div className={`text-sm ${selectedProblem === problem.id ? 'text-primary-100' : 'text-gray-500'}`}>
                        {problem.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 解决方案展示 */}
            <div className="lg:col-span-2">
              {selectedProblem ? (
                (() => {
                  const problem = growthProblems.find(p => p.id === selectedProblem)
                  return problem ? (
                    <div className="space-y-6">
                      {/* 解决方案资源 */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h4 className="text-xl font-bold text-gray-800 mb-5">核心资源</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {problem.solutions.map((solution, index) => (
                            <div key={index} className="bg-gray-50 rounded-2xl p-5 hover:shadow-md hover:bg-white transition-all duration-300 cursor-pointer group">
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  solution.type === 'video' ? 'bg-red-100' :
                                  solution.type === 'template' ? 'bg-primary-100' :
                                  solution.type === 'guide' ? 'bg-primary-100' :
                                  'bg-accent-100'
                                }`}>
                                  {solution.type === 'video' && (
                                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  )}
                                  {solution.type === 'template' && (
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  )}
                                  {(solution.type === 'guide' || solution.type === 'strategy') && (
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                  )}
                                  {(solution.type === 'rubric' || solution.type === 'checklist') && (
                                    <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-bold text-gray-800 mb-1 group-hover:text-primary-600 transition-colors">{solution.title}</h5>
                                  <div className="text-sm text-gray-500">
                                    {'duration' in solution && <span>时长：{solution.duration}</span>}
                                    {'downloads' in solution && <span>下载：{solution.downloads}次</span>}
                                    {'views' in solution && <span>观看：{solution.views}次</span>}
                                    {'pages' in solution && <span>页数：{solution.pages}页</span>}
                                    {'count' in solution && <span>{solution.count}个</span>}
                                    {'items' in solution && <span>{solution.items}项</span>}
                                  </div>
                                </div>
                              </div>
                              <button className="mt-4 w-full py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-all duration-200">
                                立即获取
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 成功案例 */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h4 className="text-xl font-bold text-gray-800 mb-5">课例参考</h4>
                        <div className="space-y-3">
                          {problem.caseStudies.map((caseStudy, index) => (
                            <div key={index} className="bg-gray-50 rounded-2xl p-4 hover:shadow-md hover:bg-white transition-all duration-300 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-800">{caseStudy.title}</h5>
                                  <div className="text-sm text-gray-500">by {caseStudy.teacher}</div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null
                })()
              ) : (
                <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">选择一个问题开始</h3>
                  <p className="text-gray-500">从左侧选择您在跨学科教学中遇到的问题，我们将为您提供针对性的解决方案</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. 即用工具包模块 */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center mb-6">
            <div className="text-3xl mr-3">🛠️</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">即用工具包</h2>
              <p className="text-gray-600 text-sm mt-1">教案模板、评价量表、参考手册，直接下载，开箱即用</p>
            </div>
          </div>

          {/* 分类过滤 */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['全部', '教案模板', '自检清单', '评价量表', '参考手册'].map(cat => (
              <button
                key={cat}
                onClick={() => setToolkitFilter(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  toolkitFilter === cat
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolkitItems
              .filter(item => toolkitFilter === '全部' || item.category === toolkitFilter)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.type === 'template' ? 'bg-primary-100' :
                      item.type === 'checklist' ? 'bg-yellow-100' :
                      item.type === 'rubric' ? 'bg-accent-100' :
                      'bg-cyan-100'
                    }`}>
                      {item.type === 'template' && (
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {item.type === 'checklist' && (
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      )}
                      {item.type === 'rubric' && (
                        <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 6h4M10 18h4" />
                        </svg>
                      )}
                      {item.type === 'guide' && (
                        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.type === 'template' ? 'bg-primary-50 text-primary-600' :
                      item.type === 'checklist' ? 'bg-yellow-50 text-yellow-600' :
                      item.type === 'rubric' ? 'bg-accent-50 text-accent-600' :
                      'bg-cyan-50 text-cyan-600'
                    }`}>{item.category}</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-4">{item.desc}</p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className={`px-2 py-0.5 rounded font-medium ${
                        item.format === 'Word' ? 'bg-blue-50 text-blue-600' :
                        item.format === 'Excel' ? 'bg-green-50 text-green-600' :
                        'bg-red-50 text-red-600'
                      }`}>{item.format}</span>
                      <span>↓ {item.downloads.toLocaleString()}</span>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      下载
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </section>

        {/* 4. 教学情境演练模块 */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center mb-6">
            <div className="text-3xl mr-3">🎯</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">教学情境演练</h2>
              <p className="text-gray-600 text-sm mt-1">真实课堂情境模拟，提升跨学科教学中的即时应对能力</p>
            </div>
          </div>

          <div className="space-y-6">
            {simulationScenarios.map((scenario, index) => (
              <div
                key={scenario.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                {/* 场景标题 */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{scenario.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          scenario.difficulty === 'easy' ? 'bg-primary-100 text-primary-700' :
                          scenario.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {scenario.difficulty === 'easy' ? '简单' :
                           scenario.difficulty === 'medium' ? '中等' : '困难'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {scenario.category === 'concept_integration' ? '概念融合' :
                           scenario.category === 'classroom_management' ? '课堂管理' :
                           scenario.category === 'instructional_strategy' ? '教学策略' : '其他'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                  onClick={() => window.open("https://aichat.cocorobo.cn/#/?id=9e5a4eea-9a70-4c1a-ad7e-75f18fb9a563&type=agent")} 
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
                    开始训练
                  </button>
                </div>

                {/* 场景描述 */}
                <div className="bg-gray-50 rounded-2xl p-5 mb-5">
                  <h4 className="font-semibold text-gray-800 mb-2">模拟场景</h4>
                  <p className="text-gray-700 leading-relaxed">&ldquo;{scenario.scenario}&rdquo;</p>
                </div>

                {/* 应对策略 */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">AI推荐应对策略</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scenario.responses.map((response, responseIndex) => (
                      <div
                        key={responseIndex}
                        className="bg-gray-50 rounded-2xl p-5 hover:shadow-md hover:bg-white transition-all duration-300 cursor-pointer group"
                      >
                        <div className="mb-4">
                          <h5 className="font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                            {response.title}
                          </h5>
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">
                            {response.content}
                          </p>
                        </div>

                        {/* 效果指标 */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">有效性</span>
                              <span className="font-semibold text-primary-600">{response.effectiveness}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-primary-400 to-primary-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${response.effectiveness}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">使用率</span>
                              <span className="font-semibold text-accent-600">{response.usage_rate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-accent-400 to-accent-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${response.usage_rate}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <button className="w-full mt-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all duration-200">
                          练习此策略
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </section>
      </div>

      {/* 视频播放模态框 */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-black rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
            {/* 视频播放器头部 */}
            <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-bold line-clamp-1">{selectedVideo.title}</h3>
                <p className="text-gray-300 text-sm">{selectedVideo.teacher} · {selectedVideo.school}</p>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white p-2 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 视频播放区域 */}
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p>视频播放器组件</p>
                <p className="text-sm text-gray-400 mt-2">时长：{selectedVideo.duration}分钟</p>
              </div>
            </div>

            {/* 视频信息和亮点 */}
            <div className="bg-gray-900 px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-bold mb-3">课堂亮点</h4>
                  <div className="space-y-2">
                    {selectedVideo.highlights.map((highlight, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            highlight.type === 'interaction' ? 'bg-primary-600' :
                            highlight.type === 'technology' ? 'bg-accent-600' :
                            highlight.type === 'collaboration' ? 'bg-cyan-600' :
                            'bg-gray-600'
                          }`}>
                            {highlight.time.split(':')[0]}
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{highlight.title}</div>
                            <div className="text-gray-400 text-xs">{highlight.time}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-3">相关资源</h4>
                  <div className="space-y-2">
                    {['教案设计', 'PPT课件', '学习单', '教学反思'].map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                        <span className="text-white text-sm">{resource}</span>
                        <button className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                          下载
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
