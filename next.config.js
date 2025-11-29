/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用压缩以减少传输大小
  compress: true,
  
  // 生产环境优化
  productionBrowserSourceMaps: false, // 禁用 source maps 以减少 bundle 大小
  
  // 启用 SWC 压缩（比 Terser 快 7 倍）
  swcMinify: true,
  
  // 优化输出
  output: 'standalone', // 优化 Docker 部署
  
  images: {
    // 允许的图片域名
    domains: ['chatgpt.com', 'poe.com', 'openai.com'],
    // 图片格式优化 - AVIF 优先（更小的文件大小）
    formats: ['image/avif', 'image/webp'],
    // 设备尺寸断点 - 减少断点数量以减少生成的图片变体
    deviceSizes: [640, 750, 1080, 1200, 1920],
    // 图片尺寸断点 - 减少断点数量
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // 最小化缓存时间（秒）
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 年 - 更长的缓存时间
    // SVG 安全配置
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // 图片加载器优化
    loader: 'default',
    // 禁用图片优化 API 的静态导入（减少构建时间）
    unoptimized: false,
  },
  
  // 安全响应头和性能优化配置（需求 15.3, 9.3）
  async headers() {
    return [
      {
        // 应用到所有路由
        source: '/:path*',
        headers: [
          // 安全头
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // 性能优化头
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          },
        ],
      },
      {
        // 静态资源的长期缓存
        source: '/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
      {
        // JavaScript 和 CSS 的缓存
        source: '/(.*)\\.(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
    ]
  },
  
  // 编译器优化
  compiler: {
    // 移除 console.log（仅生产环境）
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // 实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      'date-fns',
    ],
    // 启用并发特性
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Webpack 配置 - 激进的性能优化
  webpack: (config, { isServer, dev }) => {
    // 优化 bundle 大小
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        // 更激进的代码分割策略
        splitChunks: {
          chunks: 'all',
          minSize: 10000, // 降低最小 chunk 大小，更细粒度分割
          maxSize: 200000, // 降低最大 chunk 大小，强制分割大文件
          minChunks: 1,
          maxAsyncRequests: 50, // 增加异步请求数
          maxInitialRequests: 50, // 增加初始请求数
          cacheGroups: {
            // React 核心库单独打包
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react',
              priority: 30,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Supabase 单独打包
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              priority: 25,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Lucide icons 单独打包
            icons: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: 'icons',
              priority: 20,
              reuseExistingChunk: true,
            },
            // 其他第三方库
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            // 共享组件
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
        // 运行时代码单独打包
        runtimeChunk: {
          name: 'runtime',
        },
        // 最小化配置
        minimize: !dev,
        minimizer: config.optimization.minimizer,
      }
      
      // 保留默认的 minimizer 配置
    }
    
    // 忽略大字符串序列化警告
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules/,
        message: /Serializing big strings/,
      },
    ]
    
    // 性能优化：减少模块解析时间
    config.resolve = {
      ...config.resolve,
      // 减少模块解析的搜索路径
      modules: ['node_modules'],
      // 优先使用 ES 模块
      mainFields: ['module', 'main'],
      // 添加扩展名优先级
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    }
    
    // 缓存配置 - 加速重新构建
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      }
    }
    
    return config
  },
  
  // Server Actions 现在默认启用，不需要配置
}

module.exports = nextConfig
