import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAppStore } from '../stores/appStore';
import { Insight } from '../types';
import { getCurrentWeekPeriod } from '../utils/insightCache';

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

const InsightsScreen: React.FC = () => {
  const { getCachedInsights } = useAppStore();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasEnoughData, setHasEnoughData] = useState(true);
  const [weekPeriod, setWeekPeriod] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        
        // Get current week period
        const currentWeek = getCurrentWeekPeriod();
        setWeekPeriod(currentWeek);
        
        // Get cached insights (will generate new ones if needed)
        const weeklyInsights = await getCachedInsights('week');
        
        if (weeklyInsights.length === 0) {
          // No insights generated likely means not enough data
          setHasEnoughData(false);
        } else {
          setInsights(weeklyInsights);
          setHasEnoughData(true);
        }
      } catch (error) {
        console.error('Error loading insights:', error);
        setHasEnoughData(false);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [getCachedInsights]);

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
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Analyzing your patterns...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasEnoughData) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Weekly Insights</Text>
          <Text style={styles.dateRange}>December 16-22, 2024</Text>
          
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
        <Text style={styles.title}>Weekly Insights</Text>
        <Text style={styles.dateRange}>{formatDateRange(weekPeriod)}</Text>
        
        {insights.length > 0 ? (
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
        ) : (
          <View style={styles.noInsightsContainer}>
            <Text style={styles.noInsightsIcon}>🔍</Text>
            <Text style={styles.noInsightsTitle}>No New Insights</Text>
            <Text style={styles.noInsightsText}>
              Continue using the app and we'll surface patterns and insights as they emerge.
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
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  insightsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  noInsightsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noInsightsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noInsightsTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  noInsightsText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default InsightsScreen; 