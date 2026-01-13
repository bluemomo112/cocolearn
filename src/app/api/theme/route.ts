import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

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

    // 读取 theme.config.ts 文件
    const configPath = join(process.cwd(), 'src/config/theme.config.ts')
    let content = readFileSync(configPath, 'utf-8')

    // 替换 currentTheme 的值
    const themeMap: Record<string, string> = {
      green: 'greenTheme',
      blue: 'blueTheme',
      purple: 'purpleTheme',
    }

    const newThemeValue = themeMap[theme]
    content = content.replace(
      /export const currentTheme: Theme = \w+Theme;/,
      `export const currentTheme: Theme = ${newThemeValue};`
    )

    // 写回文件
    writeFileSync(configPath, content, 'utf-8')

    return NextResponse.json({ success: true, theme })
  } catch (error) {
    console.error('Failed to switch theme:', error)
    return NextResponse.json(
      { error: 'Failed to switch theme' },
      { status: 500 }
    )
  }
}
