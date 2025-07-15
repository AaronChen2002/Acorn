import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAppStore } from '../stores/appStore';
import { Insight } from '../types';
import { getCurrentWeekPeriod } from '../utils/insightCache';
import { 
  EnergyTrendsChart, 
  TimeRangePicker, 
  ActivityBreakdownChart,
  CHART_COLORS 
} from '../components/analytics';
import { 
  generateSampleMorningCheckIns, 
  generateSampleCalendarEntries,
  generateSampleInsights 
} from '../utils/sampleDataGenerator';

interface InsightCardProps {
  title: string;
  content: string;
  icon: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ title, content, icon }) => (
  <View style={styles.insightCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardIcon}>{icon}</Text>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
    </View>
    <Text style={styles.cardContent}>{content}</Text>
  </View>
);

type TimeRange = 'week' | 'month' | 'quarter';

const InsightsScreen: React.FC = () => {
  const { getCachedInsights, testMode } = useAppStore();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasEnoughData, setHasEnoughData] = useState(true);
  const [weekPeriod, setWeekPeriod] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('week');
  
  // Sample data for development (when in test mode or no real data)
  const [sampleCheckIns] = useState(() => generateSampleMorningCheckIns(14));
  const [sampleCalendarEntries] = useState(() => generateSampleCalendarEntries(14));
  const [sampleInsights] = useState(() => generateSampleInsights());



  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        
        // Get current week period
        const currentWeek = getCurrentWeekPeriod();
        setWeekPeriod(currentWeek);
        
        if (testMode || !hasEnoughData) {
          // Use sample insights in test mode or when no data
          const mockInsights = sampleInsights.map((insight, index) => ({
            id: `sample-insight-${index}`,
            content: insight.content,
            type: insight.type,
            icon: insight.icon,
            timePeriod: 'week' as const,
            periodStart: currentWeek.start,
            periodEnd: currentWeek.end,
            dataHash: 'sample-hash',
            dataVersion: 1,
            generatedAt: new Date(),
            createdAt: new Date(),
          }));
          
          setInsights(mockInsights);
          setHasEnoughData(true);
        } else {
        // Get cached insights (will generate new ones if needed)
        const weeklyInsights = await getCachedInsights('week');
        
        if (weeklyInsights.length === 0) {
          // No insights generated likely means not enough data
          setHasEnoughData(false);
        } else {
          setInsights(weeklyInsights);
          setHasEnoughData(true);
          }
        }
      } catch (error) {
        console.error('Error loading insights:', error);
        setHasEnoughData(false);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [getCachedInsights, testMode]);

  // Format date range for display
  const formatDateRange = (period: { start: Date; end: Date } | null) => {
    if (!period) return '';
    
    const startStr = period.start.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
    const endStr = period.end.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    return `${startStr} - ${endStr}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CHART_COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing your patterns...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasEnoughData && !testMode) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Weekly Insights</Text>
          <Text style={styles.dateRange}>{formatDateRange(weekPeriod)}</Text>
          
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataIcon}>📊</Text>
            <Text style={styles.noDataTitle}>Not Enough Data</Text>
            <Text style={styles.noDataText}>
              We need at least 3 days of morning check-ins and 5 tracked activities to generate meaningful insights.
            </Text>
            <Text style={styles.noDataSubtext}>
              Keep using the app and check back in a few days!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <Text style={styles.dateRange}>{formatDateRange(weekPeriod)}</Text>
        
        {/* Time Range Picker */}
        <TimeRangePicker
          selectedRange={selectedTimeRange}
          onRangeSelect={setSelectedTimeRange}
        />

        {/* Energy Trends Chart */}
        <EnergyTrendsChart
          checkInsData={testMode ? sampleCheckIns : []}
          height={300}
        />

        {/* Activity Breakdown Chart */}
        <ActivityBreakdownChart
          timeEntries={testMode ? sampleCalendarEntries : []}
          height={360}
        />

        {/* Coming Soon Preview */}
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonTitle}>🚧 Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            • Mood correlation analysis{'\n'}
            • Interactive drill-down features{'\n'}
            • Export and sharing capabilities{'\n'}
            • Daily/weekly pattern comparisons
          </Text>
        </View>
        
        {/* Text-based insights section */}
        {insights.length > 0 && (
          <>
            <Text style={styles.insightsHeader}>
              {insights.length} insight{insights.length > 1 ? 's' : ''} discovered
            </Text>
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                title="" // No predefined titles, let the content speak
                icon={insight.icon}
                content={insight.content}
              />
            ))}
          </>
        )}

        {testMode && (
          <View style={styles.testModeNotice}>
            <Text style={styles.testModeText}>
              🧪 Test Mode: Using sample data for development
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  insightsHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 24,
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cardContent: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noDataIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  noInsightsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noInsightsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noInsightsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  noInsightsText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  comingSoonContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CHART_COLORS.secondary,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  testModeNotice: {
    backgroundColor: 'rgba(255, 180, 77, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: CHART_COLORS.secondary,
  },
  testModeText: {
    fontSize: 14,
    color: CHART_COLORS.secondary,
    textAlign: 'center',
  },
});

export default InsightsScreen; 