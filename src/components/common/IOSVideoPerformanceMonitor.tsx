import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Platform } from 'react-native';
import iosVideoPerformanceOptimizer from '../../utils/iosVideoPerformanceOptimizer';

interface IOSVideoPerformanceMonitorProps {
  visible?: boolean;
  onClose?: () => void;
}

const IOSVideoPerformanceMonitor: React.FC<IOSVideoPerformanceMonitorProps> = ({
  visible = false,
  onClose,
}) => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios' || !visible) return;

    const updatePerformanceData = () => {
      const data = iosVideoPerformanceOptimizer.getPerformanceSummary();
      setPerformanceData(data);
    };

    // Update immediately
    updatePerformanceData();

    // Update every 5 seconds
    const interval = setInterval(updatePerformanceData, 5000);

    return () => clearInterval(interval);
  }, [visible]);

  if (Platform.OS !== 'ios' || !visible || !performanceData) {
    return null;
  }

  const getPerformanceColor = (loadTime: number) => {
    if (loadTime < 500) return '#4ade80'; // Green for excellent
    if (loadTime < 1000) return '#fbbf24'; // Yellow for good
    return '#f87171'; // Red for poor
  };

  const getPerformanceStatus = (loadTime: number) => {
    if (loadTime < 500) return 'Excellent';
    if (loadTime < 1000) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.title}>iOS Video Performance</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {/* Performance Metrics */}
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Average Load Time:</Text>
            <Text style={[
              styles.metricValue,
              { color: getPerformanceColor(performanceData.averageLoadTime) }
            ]}>
              {performanceData.averageLoadTime}ms
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Status:</Text>
            <Text style={[
              styles.metricValue,
              { color: getPerformanceColor(performanceData.averageLoadTime) }
            ]}>
              {getPerformanceStatus(performanceData.averageLoadTime)}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Videos Loaded:</Text>
            <Text style={styles.metricValue}>{performanceData.totalVideos}</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Device Type:</Text>
            <Text style={styles.metricValue}>
              {performanceData.isLowEndDevice ? 'Low-End' : 'High-End'}
            </Text>
          </View>

          {/* Recommendations */}
          {performanceData.recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {performanceData.recommendations.map((rec: string, index: number) => (
                <Text key={index} style={styles.recommendation}>
                  • {rec}
                </Text>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                iosVideoPerformanceOptimizer.clearMetrics();
                setPerformanceData(iosVideoPerformanceOptimizer.getPerformanceSummary());
              }}
            >
              <Text style={styles.actionButtonText}>Clear Metrics</Text>
            </TouchableOpacity>

            {onClose && (
              <TouchableOpacity
                style={[styles.actionButton, styles.closeButton]}
                onPress={onClose}
              >
                <Text style={styles.actionButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: 8,
    minWidth: 250,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  expandIcon: {
    color: '#ffffff',
    fontSize: 12,
  },
  content: {
    marginTop: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#cccccc',
    fontSize: 12,
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendationsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  recommendationsTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendation: {
    color: '#cccccc',
    fontSize: 11,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
  },
  closeButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default IOSVideoPerformanceMonitor; 