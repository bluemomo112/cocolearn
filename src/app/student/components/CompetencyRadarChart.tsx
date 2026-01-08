'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  CompetencyType,
  CompetencyRating,
  COMPETENCY_METADATA,
  getCompetencyStars
} from '@/data/mockCompetencyData';

/**
 * 能力雷达图数据项
 */
interface RadarDataItem {
  competency: string;  // 能力名称
  rating: number;      // 评分 (1-4)
  fullMark: number;    // 满分 (4)
  color: string;       // 颜色
}

/**
 * 能力雷达图组件的Props
 */
interface CompetencyRadarChartProps {
  /**
   * 能力数据：能力类型 -> 评分
   */
  competencies: Partial<Record<CompetencyType, CompetencyRating>>;

  /**
   * 图表尺寸
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * 是否显示图例
   */
  showLegend?: boolean;

  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * 能力雷达图组件
 *
 * 用于可视化展示学生的多维能力评估
 * 支持1-4星的评分系统
 */
export default function CompetencyRadarChart({
  competencies,
  size = 'medium',
  showLegend = true,
  className = ''
}: CompetencyRadarChartProps) {

  // 将能力数据转换为雷达图数据格式
  const radarData: RadarDataItem[] = Object.entries(competencies)
    .filter(([_, rating]) => rating !== undefined)
    .map(([type, rating]) => {
      const metadata = COMPETENCY_METADATA[type as CompetencyType];
      return {
        competency: metadata.name,
        rating: rating as number,
        fullMark: 4,
        color: metadata.color
      };
    });

  // 根据尺寸设置图表高度
  const heightMap = {
    small: 200,
    medium: 300,
    large: 400
  };
  const height = heightMap[size];

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as RadarDataItem;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-1">{data.competency}</p>
          <p className="text-sm text-gray-600">
            评分: <span className="font-medium text-primary-600">{getCompetencyStars(data.rating as CompetencyRating)}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.rating}/4 分
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${className}`}>
      {/* 雷达图 */}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="competency"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 4]}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="能力评分"
            dataKey="rating"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* 能力图例（可选） */}
      {showLegend && radarData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {radarData.map((item) => (
            <div
              key={item.competency}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {item.competency}
                </div>
                <div className="text-xs text-gray-600">
                  {getCompetencyStars(item.rating as CompetencyRating)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {radarData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-500 text-sm">
            暂无能力评估数据
          </p>
          <p className="text-gray-400 text-xs mt-1">
            完成课程后将生成能力雷达图
          </p>
        </div>
      )}
    </div>
  );
}
