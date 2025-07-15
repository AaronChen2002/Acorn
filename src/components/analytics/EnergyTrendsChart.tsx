import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryLine, VictoryArea, VictoryAxis, VictoryScatter } from 'victory';
import { BaseChart, CHART_COLORS } from './BaseChart';
import { MorningCheckInData } from '../../types';

interface EnergyTrendsChartProps {
  checkInsData: MorningCheckInData[];
  title?: string;
  subtitle?: string;
  height?: number;
  containerStyle?: any;
  showAverage?: boolean;
}

export const EnergyTrendsChart: React.FC<EnergyTrendsChartProps> = ({
  checkInsData,
  title = "Energy Level Trends",
  subtitle,
  height = 280,
  containerStyle,
  showAverage = true,
}) => {
  const processedData = useMemo(() => {
    if (checkInsData.length === 0) return { chartData: [], average: 0, trend: 'stable' };

    // Sort by date and prepare chart data
    const sortedData = [...checkInsData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days

    const chartData = sortedData.map((checkIn, index) => {
      const date = new Date(checkIn.date);
      const dayLabel = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      return {
        x: dayLabel,
        y: checkIn.energyLevel,
        date: checkIn.date,
        index,
      };
    });

    // Calculate average energy
    const average = sortedData.reduce((sum, checkIn) => sum + checkIn.energyLevel, 0) / sortedData.length;

    // Determine trend (simple linear regression)
    let trend = 'stable';
    if (sortedData.length >= 3) {
      const firstThird = sortedData.slice(0, Math.floor(sortedData.length / 3));
      const lastThird = sortedData.slice(-Math.floor(sortedData.length / 3));
      
      const firstAvg = firstThird.reduce((sum, c) => sum + c.energyLevel, 0) / firstThird.length;
      const lastAvg = lastThird.reduce((sum, c) => sum + c.energyLevel, 0) / lastThird.length;
      
      if (lastAvg > firstAvg + 0.3) trend = 'improving';
      else if (lastAvg < firstAvg - 0.3) trend = 'declining';
    }

    return { chartData, average, trend };
  }, [checkInsData]);

  const { chartData, average, trend } = processedData;

  // Generate subtitle with insights
  const autoSubtitle = useMemo(() => {
    if (subtitle) return subtitle;
    if (chartData.length === 0) return "Start tracking to see your energy patterns";
    
    const trendEmoji = trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️';
    const avgRounded = Math.round(average * 10) / 10;
    
    return `${trendEmoji} ${avgRounded}/5 average • ${trend === 'improving' ? 'Trending up' : trend === 'declining' ? 'Trending down' : 'Steady pattern'}`;
  }, [subtitle, chartData.length, average, trend]);

  if (chartData.length === 0) {
    return (
      <BaseChart
        title={title}
        subtitle={autoSubtitle}
        height={height}
        containerStyle={containerStyle}
      >
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>⚡</Text>
          <Text style={styles.emptyStateText}>
            Complete a few morning check-ins to see your energy trends
          </Text>
        </View>
      </BaseChart>
    );
  }

  // Calculate average line data
  const averageLineData = chartData.map(point => ({ 
    x: point.x, 
    y: average 
  }));

  // Color based on trend
  const lineColor = trend === 'improving' ? CHART_COLORS.positive : 
                   trend === 'declining' ? CHART_COLORS.negative : 
                   CHART_COLORS.primary;

  return (
    <BaseChart
      title={title}
      subtitle={autoSubtitle}
      height={height}
      containerStyle={containerStyle}
    >
      {/* Background area */}
      <VictoryArea
        data={chartData}
        style={{
          data: {
            fill: lineColor,
            fillOpacity: 0.15,
            stroke: 'none',
          },
        }}
        animate={{
          duration: 1000,
          onLoad: { duration: 500 },
        }}
      />

      {/* Average line */}
      {showAverage && (
        <VictoryLine
          data={averageLineData}
          style={{
            data: {
              stroke: CHART_COLORS.textSecondary,
              strokeWidth: 1,
              strokeDasharray: '4,4',
            },
          }}
        />
      )}

      {/* Main energy line */}
      <VictoryLine
        data={chartData}
        style={{
          data: {
            stroke: lineColor,
            strokeWidth: 3,
          },
        }}
        animate={{
          duration: 1000,
          onLoad: { duration: 500 },
        }}
      />

      {/* Data points */}
      <VictoryScatter
        data={chartData}
        size={4}
        style={{
          data: {
            fill: lineColor,
            stroke: CHART_COLORS.background,
            strokeWidth: 2,
          },
        }}
        animate={{
          duration: 1000,
          onLoad: { duration: 500 },
        }}
      />

      {/* Y-axis */}
      <VictoryAxis
        dependentAxis
        domain={[1, 5]}
        tickCount={5}
        tickFormat={(t) => `${t}`}
        style={{
          tickLabels: {
            fill: CHART_COLORS.textSecondary,
            fontSize: 10,
          },
          grid: {
            stroke: CHART_COLORS.gridLine,
            strokeWidth: 0.5,
            strokeDasharray: '2,2',
          },
        }}
      />

      {/* X-axis */}
      <VictoryAxis
        style={{
          tickLabels: {
            fill: CHART_COLORS.textSecondary,
            fontSize: 9,
            angle: chartData.length > 7 ? -45 : 0,
          },
          grid: {
            stroke: 'transparent',
          },
        }}
      />
    </BaseChart>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: CHART_COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 200,
  },
}); 