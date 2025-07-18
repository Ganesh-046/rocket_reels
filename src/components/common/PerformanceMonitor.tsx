import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { videoQueue } from '../../utils/videoQueue';

interface PerformanceMonitorProps {
  isVisible?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ isVisible = false }) => {
  const [metrics, setMetrics] = useState<any>({});
  const [queueStats, setQueueStats] = useState<any>({});

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = async () => {
      try {
        const performanceMetrics = await performanceMonitor.getPerformanceMetrics();
        const queueStatistics = videoQueue.getStats();
        
        setMetrics(performanceMetrics);
        setQueueStats(queueStatistics);
      } catch (error) {
        console.warn('Failed to update performance metrics:', error);
      }
    };

    // Update metrics immediately
    updateMetrics();

    // Update metrics every 2 seconds
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Monitor</Text>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Load Time:</Text>
          <Text style={styles.metricValue}>{metrics.videoLoadTime?.toFixed(0) || 0}ms</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Cache Hit:</Text>
          <Text style={styles.metricValue}>{metrics.cacheHitRate?.toFixed(1) || 0}%</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Memory:</Text>
          <Text style={styles.metricValue}>{metrics.memoryUsage || 0}MB</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>FPS:</Text>
          <Text style={styles.metricValue}>{metrics.frameRate || 60}</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Queue:</Text>
          <Text style={styles.metricValue}>{queueStats.total || 0} total</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Visible:</Text>
          <Text style={styles.metricValue}>{queueStats.visible || 0} videos</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    zIndex: 1000,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metricsContainer: {
    gap: 4,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#cccccc',
    fontSize: 12,
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PerformanceMonitor; 