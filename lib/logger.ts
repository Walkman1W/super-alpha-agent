/**
 * 日志系统
 * 提供统一的日志记录功能，支持不同级别的日志
 * 生产环境可以集成第三方监控服务（如Sentry）
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogMetadata {
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  context: string
  message: string
  metadata?: LogMetadata
  timestamp: string
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * 格式化日志条目
   */
  private formatLogEntry(entry: LogEntry): string {
    const { level, context, message, metadata, timestamp } = entry
    
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${context}: ${message}`
    
    if (metadata && Object.keys(metadata).length > 0) {
      formatted += `\n  Metadata: ${JSON.stringify(metadata, null, 2)}`
    }
    
    return formatted
  }

  /**
   * 发送日志到监控服务（生产环境）
   */
  private sendToMonitoring(entry: LogEntry): void {
    if (!this.isProduction) return

    // 这里可以集成第三方监控服务
    // 例如: Sentry, LogRocket, Datadog等
    
    // 示例: Sentry集成
    // if (entry.level === 'error' && entry.error) {
    //   Sentry.captureException(entry.error, {
    //     contexts: {
    //       custom: {
    //         context: entry.context,
    //         metadata: entry.metadata
    //       }
    //     }
    //   })
    // }
  }

  /**
   * 记录调试信息
   */
  debug(context: string, message: string, metadata?: LogMetadata): void {
    if (!this.isDevelopment) return

    const entry: LogEntry = {
      level: 'debug',
      context,
      message,
      metadata,
      timestamp: new Date().toISOString()
    }

    console.debug(this.formatLogEntry(entry))
  }

  /**
   * 记录一般信息
   */
  info(context: string, message: string, metadata?: LogMetadata): void {
    const entry: LogEntry = {
      level: 'info',
      context,
      message,
      metadata,
      timestamp: new Date().toISOString()
    }

    console.log(this.formatLogEntry(entry))
    this.sendToMonitoring(entry)
  }

  /**
   * 记录警告信息
   */
  warn(context: string, message: string, metadata?: LogMetadata): void {
    const entry: LogEntry = {
      level: 'warn',
      context,
      message,
      metadata,
      timestamp: new Date().toISOString()
    }

    console.warn(this.formatLogEntry(entry))
    this.sendToMonitoring(entry)
  }

  /**
   * 记录错误信息
   */
  error(context: string, error: Error | string, metadata?: LogMetadata): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    
    const entry: LogEntry = {
      level: 'error',
      context,
      message: errorObj.message,
      metadata: {
        ...metadata,
        stack: errorObj.stack
      },
      timestamp: new Date().toISOString(),
      error: errorObj
    }

    console.error(this.formatLogEntry(entry))
    
    if (errorObj.stack) {
      console.error('Stack trace:', errorObj.stack)
    }
    
    this.sendToMonitoring(entry)
  }

  /**
   * 记录API请求
   */
  apiRequest(
    method: string,
    url: string,
    metadata?: LogMetadata
  ): void {
    this.info('API', `${method} ${url}`, metadata)
  }

  /**
   * 记录API响应
   */
  apiResponse(
    method: string,
    url: string,
    status: number,
    duration: number,
    metadata?: LogMetadata
  ): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
    
    const message = `${method} ${url} - ${status} (${duration}ms)`
    
    if (level === 'error') {
      this.error('API', message, metadata)
    } else if (level === 'warn') {
      this.warn('API', message, metadata)
    } else {
      this.info('API', message, metadata)
    }
  }

  /**
   * 记录数据库操作
   */
  database(
    operation: string,
    table: string,
    metadata?: LogMetadata
  ): void {
    this.debug('Database', `${operation} on ${table}`, metadata)
  }

  /**
   * 记录数据库错误
   */
  databaseError(
    operation: string,
    table: string,
    error: Error,
    metadata?: LogMetadata
  ): void {
    this.error('Database', error, {
      operation,
      table,
      ...metadata
    })
  }

  /**
   * 记录爬虫操作
   */
  crawler(
    action: string,
    url: string,
    metadata?: LogMetadata
  ): void {
    this.info('Crawler', `${action}: ${url}`, metadata)
  }

  /**
   * 记录爬虫错误
   */
  crawlerError(
    action: string,
    url: string,
    error: Error,
    metadata?: LogMetadata
  ): void {
    this.error('Crawler', error, {
      action,
      url,
      ...metadata
    })
  }

  /**
   * 记录AI分析操作
   */
  ai(
    action: string,
    model: string,
    metadata?: LogMetadata
  ): void {
    this.info('AI', `${action} with ${model}`, metadata)
  }

  /**
   * 记录AI错误
   */
  aiError(
    action: string,
    model: string,
    error: Error,
    metadata?: LogMetadata
  ): void {
    this.error('AI', error, {
      action,
      model,
      ...metadata
    })
  }

  /**
   * 记录性能指标
   */
  performance(
    metric: string,
    value: number,
    unit: string = 'ms',
    metadata?: LogMetadata
  ): void {
    this.info('Performance', `${metric}: ${value}${unit}`, metadata)
  }

  /**
   * 记录用户操作
   */
  userAction(
    action: string,
    userId?: string,
    metadata?: LogMetadata
  ): void {
    this.info('User', action, {
      userId,
      ...metadata
    })
  }
}

// 导出单例实例
export const logger = new Logger()

// 导出便捷函数
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  apiRequest: logger.apiRequest.bind(logger),
  apiResponse: logger.apiResponse.bind(logger),
  database: logger.database.bind(logger),
  databaseError: logger.databaseError.bind(logger),
  crawler: logger.crawler.bind(logger),
  crawlerError: logger.crawlerError.bind(logger),
  ai: logger.ai.bind(logger),
  aiError: logger.aiError.bind(logger),
  performance: logger.performance.bind(logger),
  userAction: logger.userAction.bind(logger)
}
