import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseChart, CHART_COLORS } from './BaseChart';
import { CalendarTimeEntry } from '../../types/calendar';

interface ActivityBreakdownChartProps {
  timeEntries: CalendarTimeEntry[];
  title?: string;
  subtitle?: string;
  height?: number;
  containerStyle?: any;
}

// Category colors mapping
const CATEGORY_COLORS: Record<string, string> = {
  'deep-work': CHART_COLORS.primary,
  'social': CHART_COLORS.secondary,
  'side-work': '#1e3a8a',      // Dark blue
  'self-care': '#60a5fa',      // Light blue
  'interview': '#f59e0b',
  'travel': '#06b6d4',
  'reading-emails': '#10b981',
  'break': '#84cc16',
  'exercise': '#60a5fa',       // Now maps to self-care
  'learning': '#f97316',
  'creative': '#60a5fa',       // Now maps to self-care
  'networking': '#1e3a8a',     // Now maps to side-work
  'hobbies': '#60a5fa',        // Now maps to self-care
  'other': '#87ceeb',          // Light sky blue
};

export const ActivityBreakdownChart: React.FC<ActivityBreakdownChartProps> = ({
  timeEntries,
  title = "Time Allocation by Category",
  subtitle,
  height = 320,
  containerStyle,
}) => {
  const processedData = useMemo(() => {
    if (!timeEntries || timeEntries.length === 0) {
      return { chartData: [], totalTime: 0, topCategory: null };
    }

    // Group by category and sum durations
    const categoryTotals: Record<string, number> = {};
    
    timeEntries.forEach(entry => {
      const category = entry.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + entry.duration;
    });

    // Calculate total time
    const totalTime = Object.values(categoryTotals).reduce((sum, duration) => sum + duration, 0);

    // Convert to chart data with percentages
    const chartData = Object.entries(categoryTotals)
      .map(([category, duration]) => ({
        x: category,
        y: duration,
        percentage: Math.round((duration / totalTime) * 100),
        hours: Math.round(duration / 60 * 10) / 10, // Convert to hours with 1 decimal
      }))
      .sort((a, b) => b.y - a.y) // Sort by duration descending
      .slice(0, 8); // Show top 8 categories

    // Find top category
    const topCategory = chartData[0];

    return { chartData, totalTime, topCategory };
  }, [timeEntries]);

  const { chartData, totalTime, topCategory } = processedData;

  // Generate subtitle with insights
  const autoSubtitle = useMemo(() => {
    if (subtitle) return subtitle;
    if (chartData.length === 0) return "Start tracking activities to see your time breakdown";
    
    const totalHours = Math.round(totalTime / 60 * 10) / 10;
    const topCategoryName = topCategory?.x || 'Unknown';
    const topCategoryPercent = topCategory?.percentage || 0;
    
    return `${totalHours}h total • ${topCategoryName} leads at ${topCategoryPercent}%`;
  }, [subtitle, chartData.length, totalTime, topCategory]);



  if (chartData.length === 0) {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{autoSubtitle}</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>📊</Text>
          <Text style={styles.emptyStateText}>
            Track some activities to see your time breakdown
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{autoSubtitle}</Text>
      </View>
      
      <View style={styles.chartWrapper}>
        <View style={styles.barChart}>
          {chartData.map((item, index) => (
            <View key={item.x} style={styles.barRow}>
              <View style={styles.barLabelContainer}>
                <Text style={styles.barLabel}>{item.x}</Text>
                <Text style={styles.barValue}>{item.percentage}%</Text>
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      width: `${item.percentage}%`,
                      backgroundColor: CATEGORY_COLORS[item.x] || CHART_COLORS.neutral
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.summaryContainer}>
        {chartData.slice(0, 3).map((item, index) => (
          <View key={item.x} style={styles.summaryItem}>
            <View 
              style={[
                styles.colorIndicator, 
                { backgroundColor: CATEGORY_COLORS[item.x] || CHART_COLORS.neutral }
              ]} 
            />
            <Text style={styles.summaryLabel}>{item.x}</Text>
            <Text style={styles.summaryValue}>{item.hours}h</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: CHART_COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CHART_COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: CHART_COLORS.textSecondary,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  barChart: {
    width: '100%',
    maxWidth: 320,
    marginVertical: 20,
  },
  barRow: {
    marginBottom: 16,
  },
  barLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 14,
    color: CHART_COLORS.text,
    fontWeight: '500',
  },
  barValue: {
    fontSize: 12,
    color: CHART_COLORS.textSecondary,
    fontWeight: '600',
  },
  barContainer: {
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
    minWidth: 8,
  },
  summaryContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
    color: CHART_COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: CHART_COLORS.text,
  },
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