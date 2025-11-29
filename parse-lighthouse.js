const fs = require('fs');

// 读取 HTML 文件
const html = fs.readFileSync('./lighthouse-homepage.html', 'utf8');

// 提取 JSON 数据 - 使用更宽松的匹配
const jsonStart = html.indexOf('window.__LIGHTHOUSE_JSON__ = ');
const jsonEnd = html.indexOf('</script>', jsonStart);
const jsonStr = html.substring(jsonStart + 'window.__LIGHTHOUSE_JSON__ = '.length, jsonEnd).trim();

try {
  const data = JSON.parse(jsonStr);
  
  // 提取分数
  const categories = data.categories || {};
  
  console.log('=== Lighthouse 审计结果 ===\n');
  
  if (categories.performance) {
    console.log(`性能 (Performance): ${Math.round(categories.performance.score * 100)}/100`);
  }
  
  if (categories.accessibility) {
    console.log(`可访问性 (Accessibility): ${Math.round(categories.accessibility.score * 100)}/100`);
  }
  
  if (categories.seo) {
    console.log(`SEO: ${Math.round(categories.seo.score * 100)}/100`);
  }
  
  if (categories['best-practices']) {
    console.log(`最佳实践 (Best Practices): ${Math.round(categories['best-practices'].score * 100)}/100`);
  }
  
  console.log('\n=== 关键指标 ===\n');
  
  const audits = data.audits || {};
  
  if (audits['first-contentful-paint']) {
    console.log(`首次内容绘制 (FCP): ${audits['first-contentful-paint'].displayValue}`);
  }
  
  if (audits['largest-contentful-paint']) {
    console.log(`最大内容绘制 (LCP): ${audits['largest-contentful-paint'].displayValue}`);
  }
  
  if (audits['speed-index']) {
    console.log(`速度指数 (Speed Index): ${audits['speed-index'].displayValue}`);
  }
  
  if (audits['total-blocking-time']) {
    console.log(`总阻塞时间 (TBT): ${audits['total-blocking-time'].displayValue}`);
  }
  
  if (audits['cumulative-layout-shift']) {
    console.log(`累积布局偏移 (CLS): ${audits['cumulative-layout-shift'].displayValue}`);
  }
} catch (error) {
  console.log('解析错误:', error.message);
}
