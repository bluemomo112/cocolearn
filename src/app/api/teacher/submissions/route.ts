import { NextRequest, NextResponse } from 'next/server';

// 临时存储 - 生产环境应使用数据库
// 这里我们需要访问 chat route 中的 sessionContexts
// 在实际应用中，应该使用共享的数据库或状态管理

/**
 * 获取学生的任务提交历史
 * GET /api/teacher/submissions?sessionId=xxx&taskId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const taskId = searchParams.get('taskId');

    if (!sessionId || !taskId) {
      return NextResponse.json(
        { error: 'Missing sessionId or taskId' },
        { status: 400 }
      );
    }

    // 注意：这里需要访问 chat route 中的 sessionContexts
    // 在实际应用中，应该使用数据库查询
    // 这里我们返回一个示例响应

    // TODO: 从数据库或共享状态中获取提交历史
    // const context = sessionContexts.get(sessionId);
    // const submissions = context?.tasks.submissions.get(taskId) || [];

    // 示例响应
    return NextResponse.json({
      success: true,
      sessionId,
      taskId,
      submissions: [
        // 这里应该返回实际的提交记录
        // 格式参考 TaskSubmission 接口
      ],
      message: 'API endpoint created. Need to implement database integration.'
    });

  } catch (error) {
    console.error('获取提交历史失败:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 获取所有学生的任务完成情况统计
 * GET /api/teacher/submissions/stats?courseId=xxx&taskId=xxx
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, taskId } = body;

    if (!courseId || !taskId) {
      return NextResponse.json(
        { error: 'Missing courseId or taskId' },
        { status: 400 }
      );
    }

    // TODO: 从数据库查询所有学生的提交统计

    return NextResponse.json({
      success: true,
      courseId,
      taskId,
      stats: {
        totalStudents: 0,
        completedStudents: 0,
        averageAttempts: 0,
        averageScore: 0,
        studentDetails: [
          // 每个学生的详细信息
          // {
          //   studentId: string,
          //   studentName: string,
          //   attempts: number,
          //   lastScore: number,
          //   isCompleted: boolean,
          //   submissions: TaskSubmission[]
          // }
        ]
      },
      message: 'API endpoint created. Need to implement database integration.'
    });

  } catch (error) {
    console.error('获取统计信息失败:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
