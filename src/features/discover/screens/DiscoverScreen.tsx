import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UltraShortsScreen from './UltraShortsScreen';

interface DiscoverScreenProps {
  navigation: any;
}

const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'shorts'>('discover');

  const categories = [
    { id: '1', name: 'Action', color: '#ef4444', count: 150 },
    { id: '2', name: 'Comedy', color: '#eab308', count: 89 },
    { id: '3', name: 'Romance', color: '#ec4899', count: 234 },
    { id: '4', name: 'Thriller', color: '#a855f7', count: 67 },
    { id: '5', name: 'Drama', color: '#3b82f6', count: 123 },
    { id: '6', name: 'Horror', color: '#374151', count: 45 },
  ];

  const trendingReels = [
    { id: '1', title: 'Epic Car Chase', views: '2.1M' },
    { id: '2', title: 'Funny Cat Video', views: '1.8M' },
    { id: '3', title: 'Dance Battle', views: '1.5M' },
    { id: '4', title: 'Cooking Masterclass', views: '1.2M' },
  ];

  const renderDiscoverContent = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Discover</Text>
        
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: category.color }]}
              >
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count} reels</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          {trendingReels.map((reel) => (
            <TouchableOpacity
              key={reel.id}
              style={styles.trendingCard}
            >
              <Text style={styles.trendingTitle}>{reel.title}</Text>
              <Text style={styles.trendingViews}>{reel.views} views</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shorts' && styles.activeTab]}
          onPress={() => setActiveTab('shorts')}
        >
          <Text style={[styles.tabText, activeTab === 'shorts' && styles.activeTabText]}>
            Shorts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'discover' ? renderDiscoverContent() : <UltraShortsScreen navigation={navigation} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryName: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  categoryCount: {
    color: '#ffffff',
    opacity: 0.8,
  },
  trendingCard: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  trendingTitle: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 18,
  },
  trendingViews: {
    color: '#9ca3af',
  },
});

export default DiscoverScreen;
