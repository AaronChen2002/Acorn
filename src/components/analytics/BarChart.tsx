import React from 'react';
import { VictoryBar } from 'victory';
import { BaseChart, CHART_COLORS } from './BaseChart';

interface DataPoint {
  x: string;
  y: number;
  label?: string;
}

interface BarChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  color?: string;
  containerStyle?: any;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  subtitle,
  height = 250,
  color = CHART_COLORS.primary,
  containerStyle,
}) => {
  if (data.length === 0) {
    return (
      <BaseChart
        title={title}
        subtitle="No data available"
        height={height}
        containerStyle={containerStyle}
      >
        <></>
      </BaseChart>
    );
  }

  return (
    <BaseChart
      title={title}
      subtitle={subtitle}
      height={height}
      containerStyle={containerStyle}
    >
      <VictoryBar
        data={data}
        style={{
          data: {
            fill: color,
            fillOpacity: 0.8,
          },
        }}
        animate={{
          duration: 1000,
          onLoad: { duration: 500 },
        }}
        cornerRadius={4}
      />
    </BaseChart>
  );
}; 