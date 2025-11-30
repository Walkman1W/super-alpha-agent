import { z } from 'zod'
import { AIAnalysisResult } from './analyzer'

/**
 * AIAnalysisResult的Zod验证schema
 * @需求: 6.4
 */
export const AIAnalysisResultSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['开发工具', '内容创作', '数据分析', '设计', '营销', '客服', '教育', '研究', '生产力', '其他']),
  short_description: z.string().min(20).max(100),
  detailed_description: z.string().min(100).max(500),
  key_features: z.array(z.string().min(1)).min(1).max(10),
  use_cases: z.array(z.string().min(1)).min(1).max(10),
  pros: z.array(z.string().min(1)).min(1).max(10),
  cons: z.array(z.string().min(1)).min(1).max(5),
  how_to_use: z.string().min(50).max(200),
  best_for: z.string().min(10).max(100),
  pricing: z.enum(['免费', '付费', 'Freemium', '未知']),
  keywords: z.array(z.string().min(1)).min(1).max(20),
  search_terms: z.array(z.string().min(1)).min(1).max(10)
})

/**
 * 验证AI分析结果
 * @param data 要验证的AI分析结果
 * @returns 验证后的结果或错误信息
 */
export function validateAIAnalysisResult(data: unknown): AIAnalysisResult | null {
  try {
    const result = AIAnalysisResultSchema.parse(data)
    return result
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('AI分析结果验证错误:', error.issues)
    } else {
      console.error('验证过程中发生未知错误:', error)
    }
    return null
  }
}

/**
 * 验证信息提取完整性
 * @param data 要验证的AI分析结果
 * @returns 验证是否通过
 * @需求: 5.4
 */
export function validateInformationCompleteness(data: AIAnalysisResult): boolean {
  // 检查必需字段是否存在且有效
  if (!data.name || data.name.trim() === '') return false
  if (!data.category || !['开发工具', '内容创作', '数据分析', '设计', '营销', '客服', '教育', '研究', '生产力', '其他'].includes(data.category)) return false
  if (!data.short_description || data.short_description.trim() === '') return false
  if (!data.detailed_description || data.detailed_description.trim() === '') return false
  if (!data.key_features || data.key_features.length === 0) return false
  if (!data.use_cases || data.use_cases.length === 0) return false
  if (!data.pros || data.pros.length === 0) return false
  if (!data.cons || data.cons.length === 0) return false
  if (!data.how_to_use || data.how_to_use.trim() === '') return false
  if (!data.best_for || data.best_for.trim() === '') return false
  if (!data.pricing || !['免费', '付费', 'Freemium', '未知'].includes(data.pricing)) return false
  if (!data.keywords || data.keywords.length === 0) return false
  if (!data.search_terms || data.search_terms.length === 0) return false

  return true
}
