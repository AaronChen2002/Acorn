import React from 'react';
import { VictoryPie } from 'victory';
import { BaseChart, CHART_COLORS } from './BaseChart';

interface DataPoint {
  x: string;
  y: number;
  label?: string;
}

interface PieChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  showLabels?: boolean;
  containerStyle?: any;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  subtitle,
  height = 250,
  showLabels = true,
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
      <VictoryPie
        data={data}
        innerRadius={50}
        padAngle={2}
        labelRadius={({ innerRadius }) => innerRadius as number + 30}
        style={{
          labels: {
            fontSize: 12,
            fill: CHART_COLORS.text,
            fontFamily: 'System',
          },
        }}
        animate={{
          duration: 1000,
          onLoad: { duration: 500 },
        }}
        labelComponent={
          showLabels ? undefined : <></>
        }
      />
    </BaseChart>
  );
}; 