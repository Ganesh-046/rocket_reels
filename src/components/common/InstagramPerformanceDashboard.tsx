import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { instagramPerformanceOptimizer } from '../../utils/instagramPerformanceOptimizer';
import { instagramVideoCache } from '../../utils/instagramOptimizedVideoCache';

const { width: screenWidth } = Dimensions.get('window');

interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  networkLatency: number;
  videoLoadTime: number;
  errorRate: number;
  cacheHitRate: number;
  scrollSmoothness: number;
}

interface InstagramPerformanceDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

const InstagramPerformanceDashboard: React.FC<InstagramPerformanceDashboardProps> = ({
  isVisible,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    frameRate: 0,
    memoryUsage: 0,
    networkLatency: 0,
    videoLoadTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    scrollSmoothness: 0,
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const fadeAnim = new Animated.Value(0);

  // Update metrics every second
  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const currentMetrics = instagramPerformanceOptimizer.getPerformanceMetrics();
      setMetrics(currentMetrics);
      
      const currentRecommendations = instagramPerformanceOptimizer.getOptimizationRecommendations();
      setRecommendations(currentRecommendations);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Animate visibility
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, fadeAnim]);

  const getPerformanceColor = (value: number, threshold: number): string => {
    if (value >= threshold * 0.8) return '#4CAF50'; // Green
    if (value >= threshold * 0.6) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getPerformanceStatus = (value: number, threshold: number): string => {
    if (value >= threshold * 0.8) return 'Excellent';
    if (value >= threshold * 0.6) return 'Good';
    return 'Poor';
  };

  const formatMemoryUsage = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatLatency = (ms: number): string => {
    return `${ms.toFixed(0)}ms`;
  };

  const formatLoadTime = (ms: number): string => {
    return `${ms.toFixed(0)}ms`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const renderMetricCard = (
    title: string,
    value: number,
    unit: string,
    threshold: number,
    description: string
  ) => {
    const color = getPerformanceColor(value, threshold);
    const status = getPerformanceStatus(value, threshold);

    return (
      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricTitle}>{title}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: color }]} />
        </View>
        <View style={styles.metricValue}>
          <Text style={[styles.metricValueText, { color }]}>
            {value.toFixed(1)} {unit}
          </Text>
          <Text style={styles.metricStatus}>{status}</Text>
        </View>
        <Text style={styles.metricDescription}>{description}</Text>
      </View>
    );
  };

  const renderRecommendation = (recommendation: string, index: number) => (
    <View key={index} style={styles.recommendationItem}>
      <Text style={styles.recommendationText}>• {recommendation}</Text>
    </View>
  );

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Instagram Performance</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Performance Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Frame Rate',
              metrics.frameRate,
              'fps',
              60,
              'Target: 60fps for smooth scrolling'
            )}
            {renderMetricCard(
              'Memory Usage',
              metrics.memoryUsage / (1024 * 1024),
              'MB',
              150,
              'Target: <150MB for optimal performance'
            )}
            {renderMetricCard(
              'Network Latency',
              metrics.networkLatency,
              'ms',
              100,
              'Target: <100ms for fast loading'
            )}
            {renderMetricCard(
              'Video Load Time',
              metrics.videoLoadTime,
              'ms',
              500,
              'Target: <500ms for instant playback'
            )}
          </View>
        </View>

        {/* Cache Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cache Performance</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Cache Hit Rate',
              metrics.cacheHitRate * 100,
              '%',
              70,
              'Target: >70% for efficient caching'
            )}
            {renderMetricCard(
              'Scroll Smoothness',
              metrics.scrollSmoothness * 100,
              '%',
              90,
              'Target: >90% for smooth experience'
            )}
            {renderMetricCard(
              'Error Rate',
              metrics.errorRate * 100,
              '%',
              5,
              'Target: <5% for reliable playback'
            )}
          </View>
        </View>

        {/* Optimization Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Optimization Recommendations</Text>
            <View style={styles.recommendationsContainer}>
              {recommendations.map(renderRecommendation)}
            </View>
          </View>
        )}

        {/* Performance Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={async () => {
                await instagramVideoCache.clearCache();
              }}
            >
              <Text style={styles.actionButtonText}>Clear Cache</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Trigger performance optimization
                console.log('Manual optimization triggered');
              }}
            >
              <Text style={styles.actionButtonText}>Optimize Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: screenWidth * 0.85,
    maxWidth: 350,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricValueText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricStatus: {
    fontSize: 12,
    color: '#cccccc',
    textTransform: 'uppercase',
  },
  metricDescription: {
    fontSize: 12,
    color: '#999999',
  },
  recommendationsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default InstagramPerformanceDashboard; 