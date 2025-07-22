// Logging utility with emojis for better visibility
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SUCCESS = 'success',
}

interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFileLogging: boolean;
  enablePerformanceLogging: boolean;
}

class Logger {
  private config: LogConfig = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableFileLogging: false,
    enablePerformanceLogging: true,
  };

  private emojis = {
    [LogLevel.DEBUG]: '🔍',
    [LogLevel.INFO]: 'ℹ️',
    [LogLevel.WARN]: '⚠️',
    [LogLevel.ERROR]: '❌',
    [LogLevel.SUCCESS]: '✅',
  };

  private contextEmojis = {
    AUTH: '🔐',
    API: '🌐',
    NAVIGATION: '🧭',
    COMPONENT: '🧩',
    HOOK: '🎣',
    STORE: '📦',
    PERFORMANCE: '⚡',
    VIDEO: '🎥',
    REELS: '🎬',
    UPLOAD: '📤',
    CACHE: '💾',
    NETWORK: '📡',
    VALIDATION: '✅',
    THEME: '🎨',
    STORAGE: '💿',
    ERROR: '💥',
    SUCCESS: '🎉',
    LOADING: '⏳',
    USER: '👤',
    CONTENT: '📄',
    SEARCH: '🔍',
    PROFILE: '👤',
    DISCOVER: '🔍',
    REWARDS: '🏆',
    PAYMENT: '💳',
    NOTIFICATION: '🔔',
    ANALYTICS: '📊',
    SECURITY: '🛡️',
  };

  setConfig(config: Partial<LogConfig>) {
    this.config = { ...this.config, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(
    level: LogLevel,
    context: string,
    message: string,
    data?: any
  ): string {
    const emoji = this.emojis[level];
    const contextEmoji = this.contextEmojis[context as keyof typeof this.contextEmojis] || '📝';
    const timestamp = new Date().toISOString();
    
    let formattedMessage = `${emoji} [${timestamp}] ${contextEmoji} [${context}] ${message}`;
    
    if (data !== undefined) {
      formattedMessage += ` | Data: ${JSON.stringify(data, null, 2)}`;
    }
    
    return formattedMessage;
  }

  private log(level: LogLevel, context: string, message: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, context, message, data);

    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.SUCCESS:
          console.log(formattedMessage);
          break;
      }
    }

    // TODO: Implement file logging if needed
    if (this.config.enableFileLogging) {
      // File logging implementation
    }
  }

  debug(context: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, context, message, data);
  }

  info(context: string, message: string, data?: any) {
    this.log(LogLevel.INFO, context, message, data);
  }

  warn(context: string, message: string, data?: any) {
    this.log(LogLevel.WARN, context, message, data);
  }

  error(context: string, message: string, error?: any) {
    this.log(LogLevel.ERROR, context, message, error);
  }

  success(context: string, message: string, data?: any) {
    this.log(LogLevel.SUCCESS, context, message, data);
  }

  // Performance logging
  time(context: string, label: string) {
    if (this.config.enablePerformanceLogging) {
      console.time(`${this.contextEmojis.PERFORMANCE} [${context}] ${label}`);
    }
  }

  timeEnd(context: string, label: string) {
    if (this.config.enablePerformanceLogging) {
      console.timeEnd(`${this.contextEmojis.PERFORMANCE} [${context}] ${label}`);
    }
  }

  // API logging
  apiRequest(method: string, url: string, data?: any) {
    this.info('API', `${method} ${url}`, data);
  }

  apiResponse(method: string, url: string, status: number, data?: any) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.SUCCESS;
    this.log(level, 'API', `${method} ${url} - ${status}`, data);
  }

  apiError(method: string, url: string, error: any) {
    this.error('API', `${method} ${url} failed`, error);
  }

  // Component logging
  componentMount(componentName: string, props?: any) {
    this.info('COMPONENT', `${componentName} mounted`, props);
  }

  componentUnmount(componentName: string) {
    this.info('COMPONENT', `${componentName} unmounted`);
  }

  componentRender(componentName: string, props?: any) {
    this.debug('COMPONENT', `${componentName} rendered`, props);
  }

  // Hook logging
  hookCall(hookName: string, params?: any) {
    this.debug('HOOK', `${hookName} called`, params);
  }

  hookStateChange(hookName: string, stateName: string, value: any) {
    this.debug('HOOK', `${hookName} state changed: ${stateName}`, value);
  }

  // Navigation logging
  navigationNavigate(routeName: string, params?: any) {
    this.info('NAVIGATION', `Navigating to ${routeName}`, params);
  }

  navigationGoBack(routeName?: string) {
    this.info('NAVIGATION', `Going back${routeName ? ` from ${routeName}` : ''}`);
  }

  // Store logging
  storeAction(storeName: string, action: string, data?: any) {
    this.debug('STORE', `${storeName}: ${action}`, data);
  }

  storeStateChange(storeName: string, state: any) {
    this.debug('STORE', `${storeName} state updated`, state);
  }

  // Error logging with stack trace
  errorWithStack(context: string, message: string, error: Error) {
    this.error(context, message, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  }

  // User action logging
  userAction(action: string, data?: any) {
    this.info('USER', `User action: ${action}`, data);
  }

  // Security logging
  securityEvent(event: string, data?: any) {
    this.warn('SECURITY', event, data);
  }

  // Cache logging
  cacheHit(key: string) {
    this.debug('CACHE', `Cache hit: ${key}`);
  }

  cacheMiss(key: string) {
    this.debug('CACHE', `Cache miss: ${key}`);
  }

  cacheSet(key: string, data?: any) {
    this.debug('CACHE', `Cache set: ${key}`, data);
  }

  cacheClear(key?: string) {
    this.info('CACHE', key ? `Cache cleared: ${key}` : 'Cache cleared all');
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (context: string, message: string, data?: any) => logger.debug(context, message, data),
  info: (context: string, message: string, data?: any) => logger.info(context, message, data),
  warn: (context: string, message: string, data?: any) => logger.warn(context, message, data),
  error: (context: string, message: string, error?: any) => logger.error(context, message, error),
  success: (context: string, message: string, data?: any) => logger.success(context, message, data),
  time: (context: string, label: string) => logger.time(context, label),
  timeEnd: (context: string, label: string) => logger.timeEnd(context, label),
  apiRequest: (method: string, url: string, data?: any) => logger.apiRequest(method, url, data),
  apiResponse: (method: string, url: string, status: number, data?: any) => logger.apiResponse(method, url, status, data),
  apiError: (method: string, url: string, error: any) => logger.apiError(method, url, error),
  componentMount: (componentName: string, props?: any) => logger.componentMount(componentName, props),
  componentUnmount: (componentName: string) => logger.componentUnmount(componentName),
  componentRender: (componentName: string, props?: any) => logger.componentRender(componentName, props),
  hookCall: (hookName: string, params?: any) => logger.hookCall(hookName, params),
  hookStateChange: (hookName: string, stateName: string, value: any) => logger.hookStateChange(hookName, stateName, value),
  navigationNavigate: (routeName: string, params?: any) => logger.navigationNavigate(routeName, params),
  navigationGoBack: (routeName?: string) => logger.navigationGoBack(routeName),
  storeAction: (storeName: string, action: string, data?: any) => logger.storeAction(storeName, action, data),
  storeStateChange: (storeName: string, state: any) => logger.storeStateChange(storeName, state),
  errorWithStack: (context: string, message: string, error: Error) => logger.errorWithStack(context, message, error),
  userAction: (action: string, data?: any) => logger.userAction(action, data),
  securityEvent: (event: string, data?: any) => logger.securityEvent(event, data),
  cacheHit: (key: string) => logger.cacheHit(key),
  cacheMiss: (key: string) => logger.cacheMiss(key),
  cacheSet: (key: string, data?: any) => logger.cacheSet(key, data),
  cacheClear: (key?: string) => logger.cacheClear(key),
};

export default logger; 