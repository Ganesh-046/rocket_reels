# 🎬 For You Feature

This is a complete, modular feature bundle that includes both episodes and trailers functionality with shared components and utilities.

## 📁 Structure

```
for_you/
├── common/                    # Shared components and utilities
│   ├── api-interceptor.ts    # Shared API interceptor (95% similar code)
│   ├── SimpleInstagramVideoPlayer.js  # Shared video player component
│   └── index.ts              # Common exports
├── episodes/                  # Episodes feature (video episodes)
│   ├── components/
│   ├── screens/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── lib/
│   ├── config/
│   └── utils/
├── trailers/                  # Trailers feature (movie trailers)
│   ├── components/
│   ├── screens/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── lib/
│   ├── config/
│   └── utils/
└── index.ts                   # Main feature exports
```

## 🎯 Key Features

### ✅ **Shared Components**
- **API Interceptor**: Single, configurable API interceptor used by both features
- **Video Player**: Shared `SimpleInstagramVideoPlayer` component
- **Common Types**: Shared TypeScript interfaces and types

### ✅ **Episodes Feature**
- Complete episodes functionality
- Video episode playback
- Performance optimizations
- User interactions (likes, etc.)

### ✅ **Trailers Feature**
- Complete trailers functionality
- Movie trailer playback
- Trailer-specific optimizations
- Analytics and tracking

## 🚀 Usage

### Import the entire feature:
```typescript
import { episodes, trailers, SimpleInstagramVideoPlayer } from './features/for_you';
```

### Import specific components:
```typescript
import { EpisodePlayerScreen, TrailerScreen } from './features/for_you';
import { SimpleInstagramVideoPlayer } from './features/for_you/common';
```

### Import shared API interceptor:
```typescript
import { ApiInterceptor } from './features/for_you/common';
```

## 🔧 Code Duplication Analysis

### High Duplication (90%+):
- ✅ **API Interceptors** - Now shared via common/api-interceptor.ts
- ✅ **Activity Loaders** - Similar components with different names
- ✅ **Services** - Same service patterns

### Medium Duplication (70-85%):
- ✅ **Hooks** - Same React Query patterns
- ✅ **Stores** - Same state management logic

### Low Duplication (50-70%):
- ✅ **Types** - Similar structure, different content
- ✅ **Config** - Similar patterns, different values

## 🎯 Benefits

1. **Reduced Code Duplication**: Shared API interceptor eliminates 95% similar code
2. **Modular Design**: Each feature is independent but can share common components
3. **Easy Portability**: Can be moved to other projects easily
4. **Maintainable**: Single source of truth for shared components
5. **Developer Friendly**: Clear structure and documentation

## 🔄 Migration Notes

- **API Interceptor**: Now uses generic, configurable design
- **Video Player**: Shared between both features
- **Storage**: Each feature has its own storage implementation
- **Types**: Feature-specific types with shared interfaces

## 📦 Export Structure

```typescript
// Main exports
export { episodes, trailers, common } from './features/for_you';

// Direct component exports
export { SimpleInstagramVideoPlayer } from './features/for_you/common';
export { EpisodePlayerScreen, TrailerScreen } from './features/for_you';

// Feature-specific exports
export { episodeService, trailerService } from './features/for_you';
export { useVideoQualityStore, useTrailerVideoQualityStore } from './features/for_you';
``` 