import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface WebViewScreenProps {
  navigation: {
    goBack: () => void;
  };
  route: {
    params: {
      title: string;
      url: string;
    };
  };
}

const WebViewScreen: React.FC<WebViewScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { title, url } = route.params;

  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#E9743A" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri: url }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => <LoadingIndicator />}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});

export default WebViewScreen; 