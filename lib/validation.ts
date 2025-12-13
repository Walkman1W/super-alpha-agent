import { z } from 'zod';

// 定义Agent数据的Zod schema
export const AgentSchema = z.object({
  category: z.string().min(1).max(50),
  short_description: z.string().min(20).max(50),
  detailed_description: z.string().min(100).max(200),
  key_features: z.array(z.string()).min(3).max(10),
  use_cases: z.array(z.string()).min(3).max(10),
  pros: z.array(z.string()).min(3).max(10),
  cons: z.array(z.string()).min(1).max(5),
  how_to_use: z.string().min(50).max(100),
  best_for: z.string().min(10).max(100),
  pricing: z.enum(['免费', '付费', 'Freemium', '未知']),
  keywords: z.array(z.string()).min(3).max(10),
  search_terms: z.array(z.string()).min(2).max(5),
});

// 定义RawAgentData的Zod schema
export const RawAgentDataSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  url: z.string().url().optional(),
  platform: z.string().min(1).max(50),
  author: z.string().optional(),
  category: z.string().optional(),
});

export type AgentData = z.infer<typeof AgentSchema>;
export type RawAgentData = z.infer<typeof RawAgentDataSchema>;

// 验证Agent数据
export function validateAgentData(data: any): AgentData | null {
  try {
    const result = AgentSchema.safeParse(data);
    if (result.success) {
      return result.data;
    } else {
      console.error('Agent data validation error:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Agent data validation error:', error);
    return null;
  }
}

// 验证RawAgentData
export function validateRawAgentData(data: any): RawAgentData | null {
  try {
    const result = RawAgentDataSchema.safeParse(data);
    if (result.success) {
      return result.data;
    } else {
      console.error('Raw agent data validation error:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Raw agent data validation error:', error);
    return null;
  }
}
