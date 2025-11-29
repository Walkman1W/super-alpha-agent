const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./lighthouse-ultra-optimized.json', 'utf8'));

console.log('=== Lighthouse 审计结果 ===\n');

const categories = data.categories || {};

Object.keys(categories).forEach(key => {
  const category = categories[key];
  if (category.score !== null && category.score !== undefined) {
    const score = Math.round(category.score * 100);
    console.log(`${category.title}: ${score}/100`);
  }
});

console.log('\n=== 关键性能指标 ===\n');

const audits = data.audits || {};

const metrics = [
  { key: 'first-contentful-paint', name: '首次内容绘制 (FCP)' },
  { key: 'largest-contentful-paint', name: '最大内容绘制 (LCP)' },
  { key: 'speed-index', name: '速度指数 (Speed Index)' },
  { key: 'total-blocking-time', name: '总阻塞时间 (TBT)' },
  { key: 'cumulative-layout-shift', name: '累积布局偏移 (CLS)' },
  { key: 'interactive', name: '可交互时间 (TTI)' }
];

metrics.forEach(metric => {
  if (audits[metric.key] && audits[metric.key].displayValue) {
    console.log(`${metric.name}: ${audits[metric.key].displayValue}`);
  }
});
