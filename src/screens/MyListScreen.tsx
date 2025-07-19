import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

// Dummy watchlist data
const dummyWatchlist = [
  {
    id: '1',
    title: 'Avengers: Endgame',
    type: 'Movie',
    addedAt: '2023-12-10',
    image: 'https://via.placeholder.com/150x200/ed9b72/ffffff?text=AE',
  },
  {
    id: '2',
    title: 'Breaking Bad',
    type: 'TV Show',
    addedAt: '2023-12-08',
    image: 'https://via.placeholder.com/150x200/7d2537/ffffff?text=BB',
  },
  {
    id: '3',
    title: 'Spider-Man: No Way Home',
    type: 'Movie',
    addedAt: '2023-12-05',
    image: 'https://via.placeholder.com/150x200/ed9b72/ffffff?text=SM',
  },
  {
    id: '4',
    title: 'The Crown',
    type: 'TV Show',
    addedAt: '2023-12-03',
    image: 'https://via.placeholder.com/150x200/7d2537/ffffff?text=TC',
  },
];

const MyListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [watchlist, setWatchlist] = useState(dummyWatchlist);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'Remove from Watchlist',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setWatchlist(prev => prev.filter(item => item.id !== id));
            setSelectedItems(prev => prev.filter(item => item !== id));
          },
        },
      ]
    );
  };

  const handleRemoveSelected = () => {
    Alert.alert(
      'Remove Selected',
      `Remove ${selectedItems.length} item(s) from watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setWatchlist(prev => prev.filter(item => !selectedItems.includes(item.id)));
            setSelectedItems([]);
            setIsEditMode(false);
          },
        },
      ]
    );
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const renderWatchlistItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.watchlistCard}
      onPress={() => {
        if (isEditMode) {
          toggleSelection(item.id);
        } else {
          navigation.navigate('Detail', { movieId: item.id });
        }
      }}
      onLongPress={() => {
        setIsEditMode(true);
        setSelectedItems([item.id]);
      }}
    >
      {isEditMode && (
        <TouchableOpacity
          style={[
            styles.checkbox,
            selectedItems.includes(item.id) && styles.checkboxSelected
          ]}
          onPress={() => toggleSelection(item.id)}
        >
          {selectedItems.includes(item.id) && (
            <Icon name="check" size={16} color="#ffffff" />
          )}
        </TouchableOpacity>
      )}
      
      <Image source={{ uri: item.image }} style={styles.watchlistImage} />
      <View style={styles.watchlistInfo}>
        <Text style={styles.watchlistTitle}>{item.title}</Text>
        <View style={styles.watchlistMeta}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <Text style={styles.addedDate}>{item.addedAt}</Text>
        </View>
      </View>

      {!isEditMode && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Icon name="close" size={20} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="favorite-border" size={64} color="rgba(255, 255, 255, 0.3)" />
      <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
      <Text style={styles.emptySubtitle}>
        Add movies and TV shows to watch later
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.browseButtonText}>Browse Content</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Watchlist</Text>
        {watchlist.length > 0 && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setIsEditMode(!isEditMode);
              setSelectedItems([]);
            }}
          >
            <Text style={styles.editButtonText}>
              {isEditMode ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Edit Mode Actions */}
      {isEditMode && selectedItems.length > 0 && (
        <View style={styles.editActions}>
          <Text style={styles.selectedCount}>
            {selectedItems.length} selected
          </Text>
          <TouchableOpacity
            style={styles.removeSelectedButton}
            onPress={handleRemoveSelected}
          >
            <Icon name="delete" size={20} color="#ffffff" />
            <Text style={styles.removeSelectedText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Watchlist */}
      <FlatList
        data={watchlist}
        renderItem={renderWatchlistItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.watchlistContainer}
        ListEmptyComponent={renderEmptyState}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedCount: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  removeSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  removeSelectedText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  watchlistContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  watchlistCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#ed9b72',
    borderColor: '#ed9b72',
  },
  watchlistImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  watchlistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  addedDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  browseButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default MyListScreen; 