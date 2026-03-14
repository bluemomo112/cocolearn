import { chatWithGLM } from '../glm-client';
import { buildTutorContext, buildAssessorContext, buildMetacognitionContext } from './context-builder';
import { buildTutorPrompt, buildAssessorPrompt, buildMetacognitionPrompt } from './prompt-builder';
import {
  SharedContext,
  Message,
  CompetencyUpdate,
  TaskAssessment,
  MetacognitionResult
} from '@cross/self-learn';

export interface AgentResponse {
  message: string;
  competencyUpdates?: CompetencyUpdate[];
  taskAssessment?: TaskAssessment;
  shouldTriggerMetacognition?: boolean;
}

/**
 * Agent协调器
 */
export class AgentCoordinator {
  private sharedContext: SharedContext;

  constructor(context: SharedContext) {
    this.sharedContext = context;
  }

  /**
   * 处理用户消息 - 调用标准助教
   */
  async handleUserMessage(userMessage: string): Promise<AgentResponse> {
    // 构建上下文
    const tutorContext = buildTutorContext(this.sharedContext);
    const systemPrompt = buildTutorPrompt(tutorContext);

    // 调用GLM
    const response = await chatWithGLM(
      systemPrompt,
      this.sharedContext.conversation.messages,
      { temperature: 0.7, stream: false }
    );

    // 确保response不是stream类型
    if ('choices' in response) {
      const aiMessage = response.choices[0]?.message?.content || '';

      // 解析能力标记
      const competencyUpdates = this.parseCompetencyMarkers(aiMessage);

      return {
        message: aiMessage,
        competencyUpdates,
        shouldTriggerMetacognition: true
      };
    }

    throw new Error('Unexpected response type from GLM');
  }

  /**
   * 处理任务提交 - 调用任务评估器
   */
  async handleTaskSubmission(taskId: string, answer: string): Promise<AgentResponse> {
    // 构建评估上下文
    const assessorContext = buildAssessorContext(this.sharedContext, taskId, answer);
    const systemPrompt = buildAssessorPrompt(assessorContext);

    // 调用GLM进行评估
    const response = await chatWithGLM(
      systemPrompt,
      [], // 评估不需要对话历史
      { temperature: 0.3, stream: false } // 评估需要更稳定的输出
    );

    // 确保response不是stream类型
    if ('choices' in response) {
      const aiMessage = response.choices[0]?.message?.content || '';

      // 解析评估结果
      const assessment = this.parseAssessmentResult(aiMessage);

      // 从评估中提取能力更新
      const competencyUpdates = this.extractCompetencyFromAssessment(assessment);

      return {
        message: this.formatAssessmentFeedback(assessment),
        taskAssessment: assessment,
        competencyUpdates,
        shouldTriggerMetacognition: true
      };
    }

    throw new Error('Unexpected response type from GLM');
  }

  /**
   * 运行元认知分析（异步，不阻塞）
   */
  async runMetacognitionAnalysis(
    triggerEvent: 'chat' | 'task_complete',
    eventData: any
  ): Promise<MetacognitionResult | null> {
    try {
      // 构建元认知上下文
      const metacogContext = buildMetacognitionContext(
        this.sharedContext,
        triggerEvent,
        eventData
      );
      const systemPrompt = buildMetacognitionPrompt(metacogContext);

      // 调用GLM
      const response = await chatWithGLM(
        systemPrompt,
        [],
        { temperature: 0.5, stream: false }
      );

      // 确保response不是stream类型
      if ('choices' in response) {
        const aiMessage = response.choices[0]?.message?.content || '';

        // 解析元认知结果
        return this.parseMetacognitionResult(aiMessage);
      }

      return null;
    } catch (error) {
      console.error('元认知分析失败:', error);
      return null;
    }
  }

  /**
   * 解析能力标记
   * 格式: <!-- COMPETENCY: {type}|{description}|{rating} -->
   */
  private parseCompetencyMarkers(aiResponse: string): CompetencyUpdate[] {
    const regex = /<!-- COMPETENCY: (\w+)\|(.+?)\|(\d) -->/g;
    const updates: CompetencyUpdate[] = [];

    let match;
    while ((match = regex.exec(aiResponse)) !== null) {
      const type = match[1] as 'critical_thinking' | 'information_synthesis' | 'metacognition';
      const evidence = match[2];
      const rating = parseInt(match[3]);

      if (['critical_thinking', 'information_synthesis', 'metacognition'].includes(type)) {
        updates.push({
          type,
          evidence,
          rating,
          source: 'chat'
        });
      }
    }

    return updates;
  }

  /**
   * 解析评估结果
   */
  private parseAssessmentResult(aiResponse: string): TaskAssessment {
    try {
      // 提取JSON部分
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        return parsed as TaskAssessment;
      }

      // 如果没有找到JSON，返回默认评估
      return {
        score: 60,
        level: 'pass',
        feedback: {
          summary: '评估解析失败，请重新提交',
          strengths: [],
          improvements: ['请确保答案完整']
        }
      };
    } catch (error) {
      console.error('解析评估结果失败:', error);
      return {
        score: 60,
        level: 'pass',
        feedback: {
          summary: '评估解析失败',
          strengths: [],
          improvements: []
        }
      };
    }
  }

  /**
   * 从评估中提取能力更新
   */
  private extractCompetencyFromAssessment(assessment: TaskAssessment): CompetencyUpdate[] {
    const updates: CompetencyUpdate[] = [];

    if (assessment.competencyAssessment) {
      Object.entries(assessment.competencyAssessment).forEach(([type, data]) => {
        if (data) {
          updates.push({
            type: type as 'critical_thinking' | 'information_synthesis' | 'metacognition',
            rating: data.rating,
            evidence: data.comment,
            source: 'task'
          });
        }
      });
    }

    return updates;
  }

  /**
   * 格式化评估反馈
   */
  private formatAssessmentFeedback(assessment: TaskAssessment): string {
    let feedback = `## 任务评估结果\n\n`;
    feedback += `**得分**: ${assessment.score}/100 (${this.getLevelText(assessment.level)})\n\n`;
    feedback += `**总体评价**: ${assessment.feedback.summary}\n\n`;

    if (assessment.feedback.strengths.length > 0) {
      feedback += `**亮点**:\n`;
      assessment.feedback.strengths.forEach(s => {
        feedback += `- ${s}\n`;
      });
      feedback += `\n`;
    }

    if (assessment.feedback.improvements.length > 0) {
      feedback += `**改进建议**:\n`;
      assessment.feedback.improvements.forEach(i => {
        feedback += `- ${i}\n`;
      });
    }

    return feedback;
  }

  /**
   * 获取等级文本
   */
  private getLevelText(level: string): string {
    const levelMap: Record<string, string> = {
      excellent: '优秀',
      good: '良好',
      pass: '及格',
      fail: '不及格'
    };
    return levelMap[level] || level;
  }

  /**
   * 解析元认知结果
   */
  private parseMetacognitionResult(aiResponse: string): MetacognitionResult | null {
    try {
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        return parsed as MetacognitionResult;
      }
      return null;
    } catch (error) {
      console.error('解析元认知结果失败:', error);
      return null;
    }
  }
}
