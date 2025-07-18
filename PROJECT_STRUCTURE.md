# Rocket Reels - OTT Platform for Short Videos

## Project Structure

```
rocket_reels/
├── android/                          # Native Android project
├── ios/                              # Native iOS project
├── assets/                           # Static assets (fonts, splash, etc.)
│   ├── fonts/                        # Custom fonts
│   ├── images/                       # Images and icons
│   └── splash/                       # Splash screen assets
│
├── src/                              # Source code lives here
│
│   ├── app/                          # App setup: context, providers, and root wrappers
│   │   ├── AuthProvider.tsx          # Auth context using Zustand/MMKV
│   │   ├── ToastProvider.tsx         # Global toast/snackbar
│   │   └── QueryClientProvider.tsx   # React Query setup
│
│   ├── features/                     # Feature-based modular structure
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── SignupScreen.tsx
│   │   │   ├── services/
│   │   │   │   └── authApi.ts        # Login, signup, getUserProfile, etc.
│   │   │   ├── store/                # Zustand store for auth state
│   │   │   │   └── authStore.ts
│   │   │   └── components/           # Auth-specific UI
│   │   │       └── SocialLogin.tsx
│   │   │
│   │   ├── reels/
│   │   │   ├── screens/
│   │   │   │   ├── ReelsFeedScreen.tsx
│   │   │   │   ├── ReelPlayerScreen.tsx
│   │   │   │   └── ReelDetailsModal.tsx
│   │   │   ├── services/
│   │   │   │   └── reelApi.ts
│   │   │   ├── components/
│   │   │   │   ├── ReelCard.tsx
│   │   │   │   ├── VideoPlayer.tsx
│   │   │   │   └── ReelActions.tsx
│   │   │   └── store/
│   │   │       └── reelStore.ts
│   │   │
│   │   ├── upload/
│   │   │   ├── screens/
│   │   │   │   ├── UploadScreen.tsx
│   │   │   │   ├── CaptionScreen.tsx
│   │   │   │   └── PreviewScreen.tsx
│   │   │   ├── components/
│   │   │   │   └── UploadProgress.tsx
│   │   │   ├── services/
│   │   │   │   └── uploadApi.ts
│   │   │   └── store/
│   │   │       └── uploadStore.ts
│   │   │
│   │   ├── discover/
│   │   │   ├── screens/
│   │   │   │   └── DiscoverScreen.tsx
│   │   │   ├── services/
│   │   │   │   └── discoverApi.ts
│   │   │   └── components/
│   │   │       └── CategoryCard.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── screens/
│   │   │   │   ├── ProfileScreen.tsx
│   │   │   │   └── EditProfileScreen.tsx
│   │   │   ├── components/
│   │   │   │   └── Stats.tsx
│   │   │   ├── services/
│   │   │   │   └── profileApi.ts
│   │   │   └── store/
│   │   │       └── profileStore.ts
│
│   ├── navigation/                   # React Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── StackNavigator.tsx
│   │   ├── BottomTabNavigator.tsx
│   │   └── navigationTypes.ts
│
│   ├── components/                   # Truly global, reusable UI components
│   │   ├── Button.tsx
│   │   ├── Avatar.tsx
│   │   ├── ModalWrapper.tsx
│   │   └── Skeleton.tsx
│
│   ├── utils/                        # Utility functions
│   │   ├── formatters.ts
│   │   ├── logger.ts
│   │   ├── prefetch.ts               # Prefetch using react-native-fs
│   │   └── validators.ts
│
│   ├── lib/                          # Third-party libs (e.g., Firebase, MMKV)
│   │   ├── firebase.ts
│   │   ├── mmkv.ts                   # MMKV storage wrapper
│   │   └── pushNotifications.ts
│
│   ├── config/                       # Constants & environment config
│   │   ├── env.ts
│   │   ├── endpoints.ts
│   │   └── colors.ts
│
│   ├── i18n/                         # Internationalization
│   │   ├── en.json
│   │   └── hi.json
│
│   ├── types/                        # Global TypeScript types
│   │   ├── user.d.ts
│   │   ├── reel.d.ts
│   │   ├── auth.d.ts
│   │   └── nativewind.d.ts
│
│   └── index.ts                      # Entry point to re-export app modules
│
├── .env                              # Environment variables
├── tailwind.config.js                # Tailwind CSS configuration
├── babel.config.js                   # Babel configuration with NativeWind
├── metro.config.js                   # Metro bundler configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies and scripts
```

## Key Technologies

- **React Native 0.80.1** - Cross-platform mobile development
- **NativeWind** - Tailwind CSS for React Native
- **TypeScript** - Type safety and better developer experience
- **React Navigation** - Navigation between screens
- **Zustand** - State management
- **React Query (@tanstack/react-query)** - Server state management
- **MMKV** - Fast key-value storage
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Touch handling

## Performance Optimizations

1. **NativeWind** - Compiles Tailwind classes to native styles for better performance
2. **MMKV Storage** - Fast key-value storage for caching
3. **React Query** - Intelligent caching and background updates
4. **React Native Reanimated** - Native animations for smooth performance
5. **Video Prefetching** - Preload videos for seamless playback
6. **Lazy Loading** - Load components and data on demand

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. For iOS, install pods:
   ```bash
   cd ios && pod install && cd ..
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on device/simulator:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## Environment Setup

Create a `.env` file in the root directory with your configuration:

```env
API_BASE_URL=https://api.rocketreels.com
NODE_ENV=development
DEBUG=true
```

## Development Guidelines

1. **Feature-based Structure**: Each feature has its own folder with screens, components, services, and store
2. **TypeScript**: All files should be typed for better development experience
3. **NativeWind**: Use Tailwind classes for styling instead of StyleSheet
4. **Performance**: Focus on smooth video playback and fast navigation
5. **Testing**: Write tests for critical functionality 