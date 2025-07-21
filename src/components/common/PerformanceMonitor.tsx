import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const { width: screenWidth } = Dimensions.get('window');

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  scrollPerformance: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showMetrics?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = __DEV__, 
  showMetrics = false 
}) => {
  const { theme: { colors } } = useTheme();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    scrollPerformance: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const animationFrameId = useRef<number>();

  // FPS monitoring
  const measureFPS = () => {
    frameCount.current++;
    const currentTime = Date.now();
    
    if (currentTime - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
      setMetrics(prev => ({ ...prev, fps }));
      frameCount.current = 0;
      lastTime.current = currentTime;
    }

    if (enabled) {
      animationFrameId.current = requestAnimationFrame(measureFPS);
    }
  };

  // Memory usage monitoring (approximate)
  const measureMemoryUsage = () => {
    if (enabled && 'performance' in global) {
      try {
        const memory = (performance as any).memory;
        if (memory) {
          const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
          setMetrics(prev => ({ ...prev, memoryUsage: usedMB }));
        }
      } catch (error) {
        // Memory API not available
      }
    }
  };

  // Render time monitoring
  const measureRenderTime = () => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = Math.round(endTime - startTime);
      setMetrics(prev => ({ ...prev, renderTime }));
    };
  };

  useEffect(() => {
    if (enabled) {
      measureFPS();
      const memoryInterval = setInterval(measureMemoryUsage, 2000);
      
      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        clearInterval(memoryInterval);
      };
    }
  }, [enabled]);

  // Performance warning thresholds
  const getPerformanceStatus = () => {
    if (metrics.fps < 30) return { status: 'poor', color: '#ff4444' };
    if (metrics.fps < 50) return { status: 'fair', color: '#ffaa00' };
    if (metrics.memoryUsage > 100) return { status: 'high_memory', color: '#ffaa00' };
    return { status: 'good', color: '#44ff44' };
  };

  const performanceStatus = getPerformanceStatus();

  if (!enabled || !showMetrics) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.PRIMARYBLACK }]}>
      <Text style={[styles.title, { color: colors.PRIMARYWHITE }]}>
        Performance Monitor
      </Text>
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.PRIMARYWHITE }]}>FPS</Text>
          <Text style={[styles.metricValue, { color: performanceStatus.color }]}>
            {metrics.fps}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.PRIMARYWHITE }]}>Memory</Text>
          <Text style={[styles.metricValue, { color: colors.PRIMARYWHITE }]}>
            {metrics.memoryUsage}MB
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.PRIMARYWHITE }]}>Render</Text>
          <Text style={[styles.metricValue, { color: colors.PRIMARYWHITE }]}>
            {metrics.renderTime}ms
          </Text>
        </View>
      </View>
      <Text style={[styles.status, { color: performanceStatus.color }]}>
        Status: {performanceStatus.status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    padding: 8,
    borderRadius: 8,
    minWidth: 120,
    zIndex: 9999,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default PerformanceMonitor; 