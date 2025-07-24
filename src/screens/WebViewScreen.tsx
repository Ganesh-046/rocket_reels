import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Hooks and context
import { useTheme } from '../hooks/useTheme';
import useThemedStyles from '../hooks/useThemedStyles';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      title?: string;
      url?: string;
    };
  };
}

const WebViewScreen: React.FC<NavigationProps> = ({ route, navigation }) => {
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const insets = useSafeAreaInsets();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const renderHeader = () => (
    <View style={style.header}>
      <TouchableOpacity
        style={style.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
      </TouchableOpacity>
      <Text style={style.headerTitle}>
        {route?.params?.title || 'WebView'}
      </Text>
      <View style={style.headerSpacer} />
    </View>
  );

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setError('Failed to load content. Please check your internet connection.');
    setLoading(false);
  };

  const handleHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView HTTP error: ', nativeEvent);
    setError('Content not available. Please try again later.');
    setLoading(false);
  };

  const renderErrorState = () => (
    <View style={style.errorContainer}>
      <Icon name="error" size={80} color="rgba(255, 255, 255, 0.5)" />
      <Text style={style.errorTitle}>Unable to load content</Text>
      <Text style={style.errorMessage}>{error}</Text>
      <TouchableOpacity
        style={style.retryButton}
        onPress={() => {
          setError(null);
          setLoading(true);
        }}
      >
        <Text style={style.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={style.loadingContainer}>
      <Icon name="hourglass-empty" size={48} color="rgba(255, 255, 255, 0.6)" />
      <Text style={style.loadingText}>Loading content...</Text>
    </View>
  );

  return (
    <LinearGradient 
      start={{ x: 0, y: 0 }} 
      end={{ x: 1, y: 1 }} 
      colors={['#ed9b72', '#7d2537']}
      style={[style.container, { paddingTop: insets.top }]}
    >
      {renderHeader()}
      
      <View style={style.webViewContainer}>
        {error ? (
          renderErrorState()
        ) : (
          <WebView
            source={{ uri: route.params?.url || 'https://rocketreels.com' }}
            startInLoadingState={true}
            javaScriptEnabled={true}
            originWhitelist={['*']}
            scalesPageToFit={true}
            style={style.webView}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            onHttpError={handleHttpError}
            renderLoading={() => renderLoadingState()}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.TRANSPARENT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.03,
  },
  backButton: {
    width: isLargeDevice ? width * 0.08 : width * 0.12,
    height: isLargeDevice ? width * 0.08 : width * 0.12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: isLargeDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  headerSpacer: {
    width: isLargeDevice ? width * 0.08 : width * 0.12,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.04,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: isLargeDevice ? 16 : 18,
    color: '#666666',
    marginTop: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: isLargeDevice ? width * 0.04 : width * 0.06,
  },
  errorTitle: {
    fontSize: isLargeDevice ? 20 : 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: isLargeDevice ? width * 0.02 : width * 0.03,
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  errorMessage: {
    fontSize: isLargeDevice ? 14 : 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: isLargeDevice ? 20 : 24,
    marginBottom: isLargeDevice ? width * 0.03 : width * 0.04,
  },
  retryButton: {
    backgroundColor: '#E9743A',
    paddingHorizontal: isLargeDevice ? width * 0.03 : width * 0.04,
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.02,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: isLargeDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default WebViewScreen; 