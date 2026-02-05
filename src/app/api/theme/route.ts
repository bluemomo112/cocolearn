import { NextRequest, NextResponse } from 'next/server'

// Demo 模式：主题切换仅返回成功，实际主题由前端 localStorage 管理
export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json()

    // 验证主题名称
    if (!['green', 'blue', 'purple'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme name' },
        { status: 400 }
      )
    }

    // Demo 模式下，直接返回成功
    // 实际主题切换由前端 localStorage 处理
    return NextResponse.json({ success: true, theme })
  } catch (error) {
    console.error('Failed to switch theme:', error)
    return NextResponse.json(
      { error: 'Failed to switch theme' },
      { status: 500 }
    )
  }
}
