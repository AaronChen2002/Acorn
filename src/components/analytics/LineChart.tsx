import React from 'react';
import { VictoryLine, VictoryArea } from 'victory';
import { BaseChart, CHART_COLORS } from './BaseChart';

interface DataPoint {
  x: string | number;
  y: number;
  label?: string;
}

interface LineChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  showArea?: boolean;
  color?: string;
  containerStyle?: any;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  subtitle,
  height = 250,
  showArea = false,
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
      {showArea && (
        <VictoryArea
          data={data}
          style={{
            data: {
              fill: color,
              fillOpacity: 0.2,
              stroke: color,
              strokeWidth: 2,
            },
          }}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 },
          }}
        />
      )}
      <VictoryLine
        data={data}
        style={{
          data: {
            stroke: color,
            strokeWidth: 2,
          },
        }}
        animate={{
          duration: 1000,
          onLoad: { duration: 500 },
        }}
      />
    </BaseChart>
  );
}; 