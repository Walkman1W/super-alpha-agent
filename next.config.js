/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['chatgpt.com', 'poe.com', 'openai.com'],
  },
  // Server Actions 现在默认启用，不需要配置
}

module.exports = nextConfig
