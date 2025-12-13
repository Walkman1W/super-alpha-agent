import { validateAgentData, AgentSchema } from './lib/validation';

// 模拟AI分析结果
const mockResult = {
  category: '开发工具',
  short_description: '专业代码审查助手，帮助你发现代码中的错误和性能问题',
  detailed_description: '这是一个专业的代码审查助手，能够帮助你发现代码中的错误、性能问题和安全漏洞。支持多种编程语言。',
  key_features: ['代码错误检测', '性能分析', '安全漏洞扫描'],
  use_cases: ['代码审查', '性能优化', '安全审计'],
  pros: ['支持多种编程语言', '检测准确率高', '使用简单'],
  cons: ['需要联网使用', '部分功能需要付费'],
  how_to_use: '上传代码文件，点击分析按钮，等待分析结果。',
  best_for: '开发人员和团队',
  pricing: '免费',
  keywords: ['代码审查', '性能分析', '安全审计'],
  search_terms: ['代码审查助手', '性能分析工具']
};

console.log('Testing validateAgentData with mockResult:', mockResult);

// 使用validateAgentData函数验证数据
const validatedData = validateAgentData(mockResult);
console.log('validatedData:', validatedData);

// 手动验证原始数据
const result = AgentSchema.safeParse(mockResult);
console.log('Manual validation result:', result.success);
if (!result.success) {
  console.error('Manual validation error:', result.error.format());
}

if (validatedData) {
  console.log('Data validation passed!');
} else {
  console.error('Data validation failed!');
}
