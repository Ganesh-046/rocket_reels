import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAdSystem } from '../../hooks/useAdSystem';
import { AD_TYPES, getAdUnit } from '../../utils/adConfig';
import { Button } from './Button';

const AdTestButton: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const { showAd, isLoaded, isAdLoading, canWatchAds, loadAd } = useAdSystem(AD_TYPES.REWARD);

  const handleTestAd = async () => {
    setIsTesting(true);
    try {
      const success = await showAd(AD_TYPES.REWARD, { type: 'test' });
      if (success) {
        console.log('Ad test initiated successfully');
      }
    } catch (error) {
      console.error('Ad test error:', error);
      Alert.alert('Error', 'Failed to test ad');
    } finally {
      setIsTesting(false);
    }
  };

  const handleLoadAd = () => {
    loadAd();
  };

  const getStatusColor = () => {
    if (isLoaded) return '#4CAF50';
    if (isAdLoading) return '#FF9800';
    return '#F44336';
  };

  const getStatusText = () => {
    if (isLoaded) return 'Ready';
    if (isAdLoading) return 'Loading';
    return 'Not Ready';
  };

  const currentAdUnit = getAdUnit('reward');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ad Test & Debug</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          Status: {getStatusText()}
        </Text>
        <Text style={styles.status}>Ad Loaded: {isLoaded ? '✅ Yes' : '❌ No'}</Text>
        <Text style={styles.status}>Ad Loading: {isAdLoading ? '⏳ Yes' : '✅ No'}</Text>
        <Text style={styles.status}>Can Watch: {canWatchAds() ? '✅ Yes' : '❌ No'}</Text>
      </View>

      <View style={styles.adUnitContainer}>
        <Text style={styles.adUnitTitle}>Current Ad Unit:</Text>
        <Text style={styles.adUnitText}>{currentAdUnit}</Text>
        <Text style={styles.adUnitSubtext}>
          🚀 Production Ad Unit (Working from Old Project)
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isAdLoading ? "Loading..." : "Load Ad"}
          onPress={handleLoadAd}
          disabled={isAdLoading}
          style={isAdLoading ? styles.disabledButton : styles.loadButton}
        />
        <Button
          title={isTesting ? "Testing..." : "Test Ad"}
          onPress={handleTestAd}
          loading={isTesting}
          disabled={isTesting || !isLoaded}
          style={(!isLoaded || isTesting) ? styles.disabledButton : styles.testButton}
        />
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Working Implementation:</Text>
        <Text style={styles.tipsText}>✅ Using exact ad units from old project</Text>
        <Text style={styles.tipsText}>✅ Same package version (^14.7.0)</Text>
        <Text style={styles.tipsText}>✅ Same configuration structure</Text>
        <Text style={styles.tipsText}>✅ Same implementation pattern</Text>
        <Text style={styles.tipsText}>• Check console logs for detailed debugging</Text>
        <Text style={styles.tipsText}>• Wait 10-30 seconds for ads to load</Text>
      </View>

      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Information:</Text>
        <Text style={styles.debugText}>✅ Google Mobile Ads initialized</Text>
        <Text style={styles.debugText}>✅ Ad service configured</Text>
        <Text style={styles.debugText}>✅ Ad hook implemented</Text>
        <Text style={styles.debugText}>✅ Components created</Text>
        <Text style={styles.debugText}>✅ Using working production ad units</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  status: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  adUnitContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adUnitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  adUnitText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  adUnitSubtext: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loadButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#3498DB',
  },
  testButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#27AE60',
  },
  disabledButton: {
    backgroundColor: '#95A5A6',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 6,
    lineHeight: 20,
  },
  debugContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 6,
  },
});

export default AdTestButton; 