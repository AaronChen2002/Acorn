import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { VictoryChart, VictoryTheme } from 'victory';

const { width: screenWidth } = Dimensions.get('window');

interface BaseChartProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
  containerStyle?: any;
}

// Acorn-themed color palette for charts
export const CHART_COLORS = {
  primary: '#FF7043',      // Warm orange
  secondary: '#FFB74D',    // Golden yellow
  tertiary: '#FF8A65',     // Sunrise orange
  background: '#1a1a1a',   // Dark background
  text: '#ffffff',         // White text
  textSecondary: '#cccccc', // Light gray text
  gridLine: '#333333',     // Grid lines
  positive: '#4CAF50',     // Green for positive trends
  negative: '#f44336',     // Red for negative trends
  neutral: '#9E9E9E',      // Gray for neutral
};

// Chart theme based on Acorn's design system
export const ACORN_CHART_THEME = {
  ...VictoryTheme.material,
  palette: [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.tertiary,
    CHART_COLORS.positive,
    '#E1BEE7',    // Light purple
    '#81C784',    // Light green
    '#FFD54F',    // Light yellow
    '#FF8A80',    // Light red
  ],
  chart: {
    background: {
      fill: CHART_COLORS.background,
    },
    colorScale: [
      CHART_COLORS.primary,
      CHART_COLORS.secondary,
      CHART_COLORS.tertiary,
      CHART_COLORS.positive,
      '#E1BEE7',
      '#81C784',
      '#FFD54F',
      '#FF8A80',
    ],
  },
  axis: {
    style: {
      axis: {
        stroke: CHART_COLORS.gridLine,
        strokeWidth: 1,
      },
      grid: {
        stroke: CHART_COLORS.gridLine,
        strokeWidth: 0.5,
        strokeDasharray: '3,3',
      },
      ticks: {
        stroke: CHART_COLORS.gridLine,
        strokeWidth: 1,
      },
      tickLabels: {
        fill: CHART_COLORS.textSecondary,
        fontSize: 10,
        fontFamily: 'System',
      },
    },
  },
  scatter: {
    style: {
      data: {
        stroke: CHART_COLORS.primary,
        strokeWidth: 2,
        fill: CHART_COLORS.primary,
      },
    },
  },
  line: {
    style: {
      data: {
        stroke: CHART_COLORS.primary,
        strokeWidth: 2,
      },
    },
  },
};

export const BaseChart: React.FC<BaseChartProps> = ({
  title,
  subtitle,
  children,
  height = 250,
  containerStyle,
}) => {
  const chartWidth = screenWidth - 40; // Account for padding

  return (
    <View style={[styles.container, containerStyle]}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.chartContainer}>
        <VictoryChart
          theme={ACORN_CHART_THEME}
          width={chartWidth}
          height={height}
          padding={{ left: 50, right: 20, top: 20, bottom: 50 }}
        >
          {children}
        </VictoryChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: CHART_COLORS.background,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: CHART_COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: CHART_COLORS.textSecondary,
  },
  chartContainer: {
    alignItems: 'center',
  },
}); 