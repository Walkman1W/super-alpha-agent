import { describe, it, expect } from 'vitest';
import { validateAgentData, AgentSchema } from '../lib/validation';

describe('AI分析执行', () => {
  // 测试数据验证
  it('应该验证有效的Agent数据', () => {
    // 模拟AI分析结果
    const mockResult = {
      category: '开发工具',
      short_description: '专业代码审查助手，帮助你发现代码中的错误和性能问题，提升开发效率，保障代码质量与安全性，为你的软件开发工作保驾护航',
      detailed_description: '这是一个功能强大的专业代码审查助手，能够全方位帮助你发现代码中的各类语法错误、隐藏的性能瓶颈以及高危安全漏洞。完美支持多种主流编程语言，包括JavaScript、TypeScript、Python、Java、C++等，覆盖全主流开发场景，针对发现的问题提供专业详细的修复建议与全面优化方案。',
      key_features: ['代码错误检测', '性能分析', '安全漏洞扫描', '多语言支持', '一键修复建议'],
      use_cases: ['代码审查', '性能优化', '安全审计', '团队代码规范检查'],
      pros: ['支持多种编程语言', '检测准确率高', '使用简单', '分析速度快'],
      cons: ['需要联网使用', '部分高级功能需要付费', '大文件分析耗时较长'],
      how_to_use: '上传代码文件，点击分析按钮，等待系统完成深度扫描分析，获取详细的分析结果报告。然后根据分析结果中的修复建议逐步修改代码，全面提高代码质量与安全水平。',
      best_for: '开发人员和软件开发团队，特别是那些需要严格把控代码质量、提升团队开发效率以及保障项目安全性的技术团队。',
      pricing: '免费',
      keywords: ['代码审查', '性能分析', '安全审计', '代码质量', '开发效率'],
      search_terms: ['代码审查助手', '性能分析工具', '代码安全检测', '代码质量提升']
    };

    // 添加validateAgentData函数内部执行日志
    console.log('Starting validation with mockResult:', mockResult);
    // 使用validateAgentData函数验证数据
    const validatedData = validateAgentData(mockResult);
    console.log('validatedData:', validatedData);
    // 打印验证错误信息
    if (!validatedData) {
      console.error('validateAgentData returned null, starting detailed validation check');
      const result = AgentSchema.safeParse(mockResult);
      if (!result.success) {
        console.error('Validation error details:', JSON.stringify(result.error.format(), null, 2));
      } else {
        console.error('AgentSchema validation passed but validateAgentData returned null, check validateAgentData implementation');
      }
    }
    // 添加额外调试，提前手动验证原始数据
    const manualCheck = AgentSchema.safeParse(mockResult);
    console.log('Manual validation result:', manualCheck.success);
    if(!manualCheck.success) {
      console.error('Manual validation error:', JSON.stringify(manualCheck.error.format(), null, 2));
    }
    expect(validatedData).not.toBeNull();
    expect(validatedData).toEqual(mockResult);
  });

  // 测试无效数据验证
  it('应该拒绝无效的Agent数据', () => {
    // 无效的Agent数据
    const invalidData = {
      category: '', // 分类为空
      short_description: '太短', // 描述太短
      detailed_description: '短', // 详细描述太短
      key_features: ['少'], // 功能太少
      use_cases: ['少'], // 场景太少
      pros: ['少'], // 优点太少
      cons: [], // 缺点为空
      how_to_use: '短', // 使用方法太短
      best_for: '短', // 最适合的用户类型太短
      pricing: 'invalid', // 定价无效
      keywords: ['少'], // 关键词太少
      search_terms: ['少'] // 搜索词太少
    };

    // 使用Zod验证schema
    const validatedData = validateAgentData(invalidData);
    expect(validatedData).toBeNull();
  });
});
