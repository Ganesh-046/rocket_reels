# 🚀 Rocket Reels - Comprehensive Logging System

## 📋 Overview

This document outlines the comprehensive logging system implemented throughout the Rocket Reels application. The system uses emojis for better visibility and includes different log levels, contexts, and specialized logging functions.

## 🎯 Log Levels

The logging system supports 5 different levels:

- 🔍 **DEBUG**: Detailed information for debugging
- ℹ️ **INFO**: General information about app flow
- ⚠️ **WARN**: Warning messages for potential issues
- ❌ **ERROR**: Error messages for failed operations
- ✅ **SUCCESS**: Success messages for completed operations

## 🏷️ Context Categories

Each log message includes a context category with its own emoji:

| Context | Emoji | Description |
|---------|-------|-------------|
| AUTH | 🔐 | Authentication operations |
| API | 🌐 | API requests and responses |
| NAVIGATION | 🧭 | Navigation events |
| COMPONENT | 🧩 | Component lifecycle |
| HOOK | 🎣 | Hook calls and state changes |
| STORE | 📦 | State management |
| PERFORMANCE | ⚡ | Performance metrics |
| VIDEO | 🎥 | Video operations |
| REELS | 🎬 | Reels-specific operations |
| UPLOAD | 📤 | File upload operations |
| CACHE | 💾 | Caching operations |
| NETWORK | 📡 | Network operations |
| VALIDATION | ✅ | Form validation |
| THEME | 🎨 | Theme changes |
| STORAGE | 💿 | Local storage operations |
| ERROR | 💥 | Error handling |
| SUCCESS | 🎉 | Success events |
| LOADING | ⏳ | Loading states |
| USER | 👤 | User actions |
| CONTENT | 📄 | Content operations |
| SEARCH | 🔍 | Search operations |
| PROFILE | 👤 | Profile operations |
| DISCOVER | 🔍 | Discovery operations |
| REWARDS | 🏆 | Rewards system |
| PAYMENT | 💳 | Payment operations |
| NOTIFICATION | 🔔 | Push notifications |
| ANALYTICS | 📊 | Analytics events |
| SECURITY | 🛡️ | Security events |

## 🛠️ Usage Examples

### Basic Logging

```typescript
import { log } from '@/utils/logger';

// Basic logging
log.info('AUTH', 'User login attempt', { email: 'user@example.com' });
log.success('AUTH', 'Login successful', { userId: '123' });
log.error('API', 'API request failed', { error: 'Network timeout' });
log.warn('PERFORMANCE', 'Slow component render', { component: 'VideoPlayer' });
log.debug('HOOK', 'useForm state changed', { field: 'email', value: 'test@example.com' });
```

### Specialized Logging Functions

```typescript
// API Logging
log.apiRequest('POST', '/auth/login', { email: 'user@example.com' });
log.apiResponse('POST', '/auth/login', 200, { token: 'abc123' });
log.apiError('POST', '/auth/login', { message: 'Invalid credentials' });

// Component Logging
log.componentMount('LoginScreen', { props: { initialEmail: 'test@example.com' } });
log.componentUnmount('LoginScreen');
log.componentRender('Button', { variant: 'primary', size: 'large' });

// Hook Logging
log.hookCall('useApi', { endpoint: '/content/list' });
log.hookStateChange('useForm', 'email', 'new@example.com');

// Navigation Logging
log.navigationNavigate('HomeScreen', { tab: 'discover' });
log.navigationGoBack('DetailScreen');

// Store Logging
log.storeAction('AuthStore', 'login', { userId: '123' });
log.storeStateChange('AuthStore', { user: { id: '123' }, isAuthenticated: true });

// Performance Logging
log.time('API', 'Content fetch');
// ... API call
log.timeEnd('API', 'Content fetch');

// Cache Logging
log.cacheHit('user_profile_123');
log.cacheMiss('user_profile_123');
log.cacheSet('user_profile_123', { name: 'John' });
log.cacheClear('user_profile_123');

// User Action Logging
log.userAction('Button Press', { buttonId: 'login', screen: 'LoginScreen' });
log.userAction('Form Submit', { formName: 'login', fields: ['email', 'password'] });

// Security Logging
log.securityEvent('Token expired', { userId: '123' });
log.securityEvent('Unauthorized access attempt', { route: '/profile' });

// Error Logging with Stack Trace
try {
  // Some operation
} catch (error) {
  log.errorWithStack('API', 'Failed to fetch content', error);
}
```

## 📱 Component Integration

### UI Components

All UI components include logging for user interactions:

```typescript
// Button component logs user presses
<Button 
  title="Login" 
  onPress={() => {
    // Button press is automatically logged
    handleLogin();
  }}
/>

// Input component logs focus, blur, and changes
<Input 
  label="Email"
  onChangeText={(text) => {
    // Input change is automatically logged
    setEmail(text);
  }}
/>
```

### Hooks

Custom hooks include comprehensive logging:

```typescript
// useForm hook logs validation and state changes
const { values, errors, handleChange, validate } = useForm(initialValues, validationRules);

// useApi hook logs requests, responses, and errors
const { data, loading, execute } = useApi(apiFunction);

// useLocalStorage hook logs storage operations
const [userData, setUserData] = useLocalStorage('user_data', null);
```

## 🔧 Configuration

The logger can be configured for different environments:

```typescript
import { logger } from '@/utils/logger';

// Configure logging for production
logger.setConfig({
  level: LogLevel.WARN, // Only show warnings and errors
  enableConsole: true,
  enableFileLogging: false,
  enablePerformanceLogging: false,
});

// Configure logging for development
logger.setConfig({
  level: LogLevel.DEBUG, // Show all logs
  enableConsole: true,
  enableFileLogging: false,
  enablePerformanceLogging: true,
});
```

## 📊 Log Output Format

Log messages follow this format:

```
[EMOJI] [TIMESTAMP] [CONTEXT_EMOJI] [CONTEXT] [MESSAGE] | Data: {JSON_DATA}
```

Example outputs:

```
✅ [2024-01-15T10:30:45.123Z] 🔐 [AUTH] Login successful | Data: {"userId": "123"}
❌ [2024-01-15T10:30:46.456Z] 🌐 [API] POST /auth/login failed | Data: {"error": "Network timeout"}
⚠️ [2024-01-15T10:30:47.789Z] 🧭 [NAVIGATION] Unauthorized access attempt | Data: {"name": "ProfileScreen"}
🔍 [2024-01-15T10:30:48.012Z] 🎣 [HOOK] useForm state changed: email | Data: "new@example.com"
```

## 🎯 Key Logging Points

### 1. App Lifecycle
- App startup and initialization
- App version and build information
- Configuration loading

### 2. Authentication
- Login/logout attempts
- Token management
- Authentication state changes
- Security events

### 3. API Operations
- All API requests and responses
- Network errors and timeouts
- Authentication failures
- Rate limiting events

### 4. Navigation
- Screen navigation events
- Protected route access attempts
- Navigation errors
- Deep link handling

### 5. User Interactions
- Button presses
- Form submissions
- Input changes
- Gesture interactions

### 6. Performance
- Component render times
- API response times
- Memory usage
- Frame drops

### 7. Content Operations
- Video loading and playback
- Content caching
- Search operations
- Content recommendations

### 8. Error Handling
- JavaScript errors
- Network errors
- Validation errors
- Component errors

## 🔍 Debugging with Logs

### Finding User Issues
```typescript
// Search for user-specific logs
log.info('USER', 'User action: Button Press', { userId: '123', action: 'login' });
```

### Performance Analysis
```typescript
// Monitor API performance
log.time('API', 'Content fetch');
const content = await fetchContent();
log.timeEnd('API', 'Content fetch');
```

### Error Tracking
```typescript
// Track errors with context
try {
  await riskyOperation();
} catch (error) {
  log.errorWithStack('API', 'Risky operation failed', error);
}
```

## 📈 Benefits

1. **Visibility**: Emojis make logs easy to scan and identify
2. **Context**: Each log includes relevant context and data
3. **Performance**: Configurable logging levels for different environments
4. **Debugging**: Comprehensive logging for troubleshooting
5. **Analytics**: User behavior tracking through action logs
6. **Security**: Security event monitoring
7. **Monitoring**: Performance and error tracking

## 🚀 Best Practices

1. **Use Appropriate Levels**: Use DEBUG for development, WARN/ERROR for production
2. **Include Context**: Always include relevant data with logs
3. **Avoid Sensitive Data**: Never log passwords, tokens, or personal information
4. **Performance**: Use performance logging for slow operations
5. **Consistency**: Use consistent context names across the app
6. **Error Handling**: Always log errors with stack traces when possible

This logging system provides comprehensive visibility into the application's behavior, making debugging and monitoring much easier for developers and support teams. 