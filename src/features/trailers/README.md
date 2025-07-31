# 🎬 Trailer Feature

A completely independent and portable trailer feature for React Native applications.

## 📋 Overview

This trailer feature provides a complete solution for displaying and playing trailer videos in a React Native app. It's designed to be completely independent and can be easily moved to other projects.

## 🏗️ Architecture

```
src/features/trailers/
├── components/          # UI Components
│   └── TrailerVideoPlayer.tsx
├── hooks/              # Custom Hooks
│   └── useTrailers.ts
├── screens/            # Screen Components
│   └── TrailerScreen.tsx
├── services/           # API Services
│   └── trailerService.ts
├── types/              # TypeScript Types
│   └── index.ts
├── utils/              # Utility Functions
│   └── trailerUtils.ts
├── index.ts            # Main Export File
└── README.md           # This File
```

## 🚀 Features

- **HD Video Playback**: Support for multiple video qualities (1080p, 720p, 480p, 360p)
- **Quality Selection**: Automatic quality selection based on device capabilities
- **Analytics Tracking**: Built-in analytics for video views and interactions
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Performance Optimization**: Efficient video loading and caching
- **Error Handling**: Comprehensive error handling and retry mechanisms
- **Pull-to-Refresh**: Refresh trailer list with pull gesture
- **Auto-Play**: Automatic video playback with focus management
- **Gesture Controls**: Touch controls for play/pause and navigation

## 📦 Installation

### Dependencies

Add these dependencies to your project:

```bash
npm install react-native-video react-native-linear-gradient @tanstack/react-query
```

### Import the Feature

```typescript
import { TrailerScreen, useTrailerList } from './features/trailers';
```

## 🎯 Usage

### 1. Basic Usage

```typescript
import React from 'react';
import { TrailerScreen } from './features/trailers';

const App = () => {
  return <TrailerScreen navigation={navigation} />;
};
```

### 2. Using Hooks

```typescript
import React from 'react';
import { useTrailerList, useTrailerProcessor } from './features/trailers';

const MyComponent = () => {
  const { data, isLoading, error } = useTrailerList({ adult: true, page: 1 });
  const { processTrailerData } = useTrailerProcessor();
  
  const processedData = processTrailerData(data);
  
  return (
    // Your component JSX
  );
};
```

### 3. Custom Service Configuration

```typescript
import { TrailerService } from './features/trailers';

const customService = new TrailerService({
  baseURL: 'https://your-api.com',
  timeout: 30000,
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
```

### 4. Navigation Integration

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TrailerScreen } from './features/trailers';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Trailers" component={TrailerScreen} />
      {/* Other screens */}
    </Tab.Navigator>
  );
};
```

## 🔧 Configuration

### Service Configuration

```typescript
import { initializeTrailerFeature } from './features/trailers';

initializeTrailerFeature({
  baseURL: 'https://api.yourapp.com',
  timeout: 30000,
  enableAnalytics: true,
  cacheEnabled: true,
});
```

### Quality Configuration

```typescript
import { getDefaultTrailerConfig } from './features/trailers';

const config = getDefaultTrailerConfig();
config.qualityPreference = 'hd'; // 'hd' | 'sd' | 'auto'
config.autoPlay = true;
config.loopVideos = false;
```

## 📊 Analytics

The feature includes built-in analytics tracking:

```typescript
import { trackTrailerView, trackTrailerInteraction } from './features/trailers';

// Track video view
trackTrailerView('trailer-id', 120, '720p');

// Track interaction
trackTrailerInteraction('trailer-id', 'like');
trackTrailerInteraction('trailer-id', 'share');
trackTrailerInteraction('trailer-id', 'watch_now');
```

## 🎨 Customization

### Custom Video Player

```typescript
import { TrailerVideoPlayer } from './features/trailers';

const CustomVideoPlayer = ({ episode, isPlaying }) => {
  return (
    <TrailerVideoPlayer
      episode={episode}
      isPlaying={isPlaying}
      onWatchNow={(item) => console.log('Watch now:', item)}
      onLike={(trailerId) => console.log('Like:', trailerId)}
      onShare={(item) => console.log('Share:', item)}
    />
  );
};
```

### Custom Styling

```typescript
import { getTrailerLayout } from './features/trailers';

const layout = getTrailerLayout();
// Returns responsive layout configuration
// { columns: 2, itemHeight: 300, spacing: 15, padding: 20 }
```

## 🔍 API Reference

### Hooks

- `useTrailerList(params)` - Fetch trailer list
- `useTrailerSearch(query, params)` - Search trailers
- `useTrailersByGenre(genre, params)` - Get trailers by genre
- `useTrailerDetails(trailerId)` - Get trailer details
- `useTrackTrailerView()` - Track video views
- `useTrackTrailerInteraction()` - Track interactions
- `useTrailerProcessor()` - Process trailer data
- `useTrailerQuality(trailer)` - Get quality options
- `useBestTrailerQuality(trailer)` - Get best quality URL
- `useTrailerPlayerState()` - Manage player state
- `useTrailerListState()` - Manage list state

### Services

- `TrailerService` - Main service class
- `TrailerApiInterceptor` - API interceptor
- `trailerService` - Default service instance

### Components

- `TrailerVideoPlayer` - Video player component
- `TrailerScreen` - Main trailer screen

### Utils

- `getTrailerDimensions()` - Get device dimensions
- `getTrailerLayout()` - Get responsive layout
- `getTrailerQualityOptions(trailer)` - Get quality options
- `getBestTrailerQuality(trailer)` - Get best quality
- `processTrailerData(data)` - Process trailer data
- `filterTrailersByGenre(trailers, genre)` - Filter by genre
- `searchTrailers(trailers, query)` - Search trailers
- `trackTrailerView(id, duration, quality)` - Track view
- `trackTrailerInteraction(id, action)` - Track interaction

## 🎯 Types

### Core Types

```typescript
interface TrailerEpisode {
  _id: string;
  title: string;
  description: string;
  video_urls: TrailerVideoUrls;
  video_url: string;
  thumbnail?: string;
  backdropImage?: string;
  likes: number;
  author: string;
  duration: number;
  views: string;
  genres: TrailerGenre[];
  releasingDate?: string;
  targetAudience?: TrailerTargetAudience;
  trailerUrl: TrailerUrl;
  contentId?: string;
}

interface TrailerVideoUrls {
  master?: string;
  '1080p'?: string;
  '720p'?: string;
  '480p'?: string;
  '360p'?: string;
}
```

## 🚀 Performance

### Optimization Features

- **Lazy Loading**: Videos load only when needed
- **Quality Selection**: Automatic quality based on device
- **Caching**: Built-in caching for API responses
- **Memory Management**: Proper cleanup of video resources
- **Debouncing**: Optimized scroll and interaction handling

### Best Practices

1. **Use FlatList**: For large lists of trailers
2. **Implement Pagination**: Load trailers in chunks
3. **Handle Errors**: Always provide error states
4. **Optimize Images**: Use appropriate image sizes
5. **Monitor Performance**: Track video loading times

## 🔧 Troubleshooting

### Common Issues

1. **Video not playing**: Check video URL and format
2. **Quality issues**: Verify available qualities
3. **Performance**: Monitor memory usage
4. **Network errors**: Implement retry logic

### Debug Mode

```typescript
import { TRAILER_FEATURE_CONFIG } from './features/trailers';

console.log('Trailer Feature Config:', TRAILER_FEATURE_CONFIG);
```

## 📱 Platform Support

- ✅ iOS
- ✅ Android
- ✅ Web (with limitations)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This feature is part of the Rocket Reels project and follows the same license terms.

## 🆘 Support

For support and questions:

1. Check the documentation
2. Review the examples
3. Open an issue on GitHub
4. Contact the development team

---

**🎬 Trailer Feature v1.0.0** - Completely independent and portable 