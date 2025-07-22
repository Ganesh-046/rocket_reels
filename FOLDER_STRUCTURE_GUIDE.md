# Rocket Reels - Optimized Folder Structure Guide

## 🏗️ Project Architecture Overview

This document outlines the new, scalable folder structure for the Rocket Reels application. The structure follows React Native best practices with a feature-based organization, reusable components, and optimized performance.

## 📁 Root Structure

```
src/
├── app/                    # App-level providers and configuration
├── components/             # Reusable UI components
├── features/               # Feature-based modules
├── hooks/                  # Custom React hooks
├── utils/                  # Utility functions and helpers
├── services/               # API services and external integrations
├── store/                  # State management (Zustand stores)
├── navigation/             # Navigation configuration
├── theme/                  # Design system and theming
├── types/                  # TypeScript type definitions
├── config/                 # App configuration
├── lib/                    # Third-party library configurations
├── i18n/                   # Internationalization
└── context/                # React Context providers
```

## 🧩 Components Structure

### UI Components (`src/components/ui/`)
Reusable, atomic UI components with consistent styling and behavior.

```
ui/
├── Button/
│   ├── Button.tsx         # Button component with variants
│   └── index.ts           # Export file
├── Input/
│   ├── Input.tsx          # Input component with validation
│   └── index.ts
├── Card/
│   ├── Card.tsx           # Card component with variants
│   └── index.ts
├── Modal/
│   ├── Modal.tsx          # Modal component with backdrop
│   └── index.ts
└── index.ts               # Main UI components export
```

**Usage Example:**
```tsx
import { Button, Input, Card, Modal } from '@/components/ui';

<Button variant="primary" size="large" onPress={handlePress}>
  Click Me
</Button>
```

### Layout Components (`src/components/layout/`)
Layout and structural components for consistent page layouts.

```
layout/
├── SafeArea.tsx           # Safe area wrapper
├── Container.tsx          # Content container with spacing
└── index.ts
```

### Feedback Components (`src/components/feedback/`)
Components for user feedback and loading states.

```
feedback/
├── LoadingSpinner.tsx     # Loading indicator
├── EmptyState.tsx         # Empty state display
└── index.ts
```

## 🎣 Hooks Structure (`src/hooks/`)

Custom React hooks for reusable logic and state management.

```
hooks/
├── useForm.ts             # Form state management and validation
├── useApi.ts              # API request management
├── useLocalStorage.ts     # Local storage management
├── useDebounce.ts         # Debounce utilities
├── useAuth.ts             # Authentication logic
├── useContent.ts          # Content management
├── useEpisodes.ts         # Episode management
├── usePerformanceOptimization.ts  # Performance optimization
├── useInstagramPerformance.ts     # Instagram-style optimization
├── useVideoTransition.ts  # Video transition effects
├── useScrollWorklets.ts   # Scroll performance
├── useTheme.ts            # Theme management
├── useThemedStyles.ts     # Themed styling
├── useUserInteractions.ts # User interaction tracking
├── useAdvancedPerformance.ts      # Advanced performance
├── useApiLogger.ts        # API logging
├── useHomeScreenOptimization.ts   # Home screen optimization
├── useRewards.ts          # Rewards system
└── index.ts               # All hooks export
```

**Usage Example:**
```tsx
import { useForm, useApi, useLocalStorage } from '@/hooks';

const { values, errors, handleChange, validate } = useForm(initialValues, validationRules);
const { data, loading, execute } = useApi(apiFunction);
const [userData, setUserData] = useLocalStorage('user_data', null);
```

## 🛠️ Utils Structure (`src/utils/`)

Utility functions organized by functionality.

```
utils/
├── validation.ts          # Form and data validation
├── formatting.ts          # Data formatting utilities
├── constants.ts           # App-wide constants
├── apiLogger.ts           # API logging utilities
├── colorExtractor.ts      # Color extraction from images
├── dimensions.ts          # Screen dimension utilities
├── dummyData.ts           # Mock data for development
├── enhancedVideoCache.ts  # Video caching system
├── GetAsyncData.ts        # Async data utilities
├── hardwareAcceleratedScroll.ts  # Scroll optimization
├── imageUtils.ts          # Image processing utilities
├── instagramOptimizedVideoCache.ts  # Instagram-style video cache
├── instagramPerformanceOptimizer.ts # Performance optimization
├── instagramScrollOptimizer.ts      # Scroll optimization
├── instagramStyleVideoPreloader.ts  # Video preloading
├── performanceMonitor.ts  # Performance monitoring
├── prefetch.ts            # Data prefetching
├── videoQueue.ts          # Video queue management
├── advancedVideoOptimizer.ts        # Advanced video optimization
└── index.ts               # All utilities export
```

**Usage Example:**
```tsx
import { 
  isValidEmail, 
  formatDate, 
  formatNumber, 
  API_ENDPOINTS,
  ERROR_MESSAGES 
} from '@/utils';

const isValid = isValidEmail('user@example.com');
const formattedDate = formatDate(new Date(), 'relative');
const formattedNumber = formatNumber(1234567, { compact: true });
```

## 🎯 Features Structure (`src/features/`)

Feature-based modules with their own components, screens, services, and stores.

```
features/
├── auth/                  # Authentication feature
│   ├── components/        # Auth-specific components
│   ├── screens/           # Auth screens
│   ├── services/          # Auth API services
│   └── store/             # Auth state management
├── reels/                 # Reels feature
│   ├── components/        # Reel-specific components
│   ├── screens/           # Reel screens
│   ├── services/          # Reel API services
│   └── store/             # Reel state management
├── discover/              # Discovery feature
│   ├── components/        # Discovery components
│   ├── screens/           # Discovery screens
│   ├── services/          # Discovery API services
│   └── store/             # Discovery state management
├── profile/               # Profile feature
│   ├── components/        # Profile components
│   ├── screens/           # Profile screens
│   ├── services/          # Profile API services
│   └── store/             # Profile state management
└── upload/                # Upload feature
    ├── components/        # Upload components
    ├── screens/           # Upload screens
    ├── services/          # Upload API services
    └── store/             # Upload state management
```

## 🎨 Theme System (`src/theme/`)

Centralized design system with consistent colors, spacing, and typography.

```
theme/
├── index.ts               # Theme configuration
└── provider.tsx           # Theme provider component
```

**Theme Structure:**
```typescript
export const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    background: '#000000',
    textPrimary: '#ffffff',
    // ... more colors
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
  },
  borderRadius: {
    sm: 4, md: 8, lg: 12, xl: 16, full: 9999
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: 'bold' },
    body: { fontSize: 16, fontWeight: 'normal' },
    // ... more typography
  }
};
```

## 🔧 Configuration (`src/config/`)

App configuration and environment variables.

```
config/
├── api.ts                 # API configuration
├── colors.ts              # Color configuration
├── endpoints.ts           # API endpoints
└── env.ts                 # Environment variables
```

## 📱 Navigation (`src/navigation/`)

Navigation configuration and types.

```
navigation/
├── BottomTabNavigator.tsx # Bottom tab navigation
├── CustomTabBar.tsx       # Custom tab bar component
├── NavigationService.ts   # Navigation service
├── navigationTypes.ts     # Navigation type definitions
├── RootNavigator.tsx      # Root navigation
└── StackNavigator.tsx     # Stack navigation
```

## 🗄️ Services (`src/services/`)

API services and external integrations.

```
services/
├── api.service.ts         # Base API service
├── auth.service.ts        # Authentication service
├── content.service.ts     # Content service
├── rewards.service.ts     # Rewards service
├── user-interactions.service.ts  # User interactions
└── index.ts               # Services export
```

## 📊 Store (`src/store/`)

State management using Zustand.

```
store/
├── auth.store.ts          # Authentication state
├── videoQualityStore.ts   # Video quality preferences
└── videoStore.ts          # Video state management
```

## 🌐 Internationalization (`src/i18n/`)

Multi-language support.

```
i18n/
├── en.json               # English translations
└── hi.json               # Hindi translations
```

## 🔌 Context (`src/context/`)

React Context providers.

```
context/
└── ThemeContext.tsx       # Theme context provider
```

## 📋 Best Practices

### 1. Component Organization
- **Atomic Design**: Components follow atomic design principles
- **Single Responsibility**: Each component has a single, clear purpose
- **Props Interface**: All components have well-defined TypeScript interfaces
- **Default Props**: Sensible defaults for all optional props

### 2. Hook Organization
- **Custom Logic**: Encapsulate reusable logic in custom hooks
- **Performance**: Optimized hooks for performance-critical operations
- **Error Handling**: Built-in error handling and loading states
- **TypeScript**: Fully typed with proper interfaces

### 3. Utility Organization
- **Pure Functions**: All utilities are pure functions
- **Tree Shaking**: Utilities are individually importable
- **Performance**: Optimized for performance
- **Testing**: Easy to test and mock

### 4. Feature Organization
- **Self-Contained**: Each feature is self-contained
- **Scalable**: Easy to add new features
- **Maintainable**: Clear separation of concerns
- **Reusable**: Components can be shared between features

### 5. Performance Optimizations
- **Lazy Loading**: Components and screens are lazy-loaded
- **Memoization**: Proper use of React.memo and useMemo
- **Code Splitting**: Features are code-split for better performance
- **Bundle Optimization**: Optimized bundle size

## 🚀 Getting Started

### 1. Import Components
```tsx
import { Button, Input, Card, Modal } from '@/components/ui';
import { SafeArea, Container } from '@/components/layout';
import { LoadingSpinner, EmptyState } from '@/components/feedback';
```

### 2. Use Hooks
```tsx
import { useForm, useApi, useLocalStorage } from '@/hooks';
```

### 3. Import Utils
```tsx
import { isValidEmail, formatDate, API_ENDPOINTS } from '@/utils';
```

### 4. Use Theme
```tsx
import { theme } from '@/theme';
const { colors, spacing, typography } = theme;
```

## 📈 Benefits of This Structure

1. **Scalability**: Easy to add new features and components
2. **Maintainability**: Clear organization and separation of concerns
3. **Reusability**: Components and utilities are highly reusable
4. **Performance**: Optimized for performance with proper code splitting
5. **Type Safety**: Full TypeScript support with proper interfaces
6. **Testing**: Easy to test individual components and utilities
7. **Developer Experience**: Clear imports and intuitive organization
8. **Team Collaboration**: Consistent patterns across the codebase

## 🔄 Migration Guide

To migrate existing code to this new structure:

1. **Move Components**: Move existing components to appropriate UI/layout/feedback folders
2. **Update Imports**: Update all import statements to use new paths
3. **Add Types**: Add proper TypeScript interfaces for all components
4. **Optimize Performance**: Apply performance optimizations using new hooks
5. **Update Theme**: Use the centralized theme system
6. **Add Validation**: Use the validation utilities for forms
7. **Implement Error Handling**: Use the error handling patterns

This structure provides a solid foundation for a scalable, maintainable, and high-performance React Native application. 