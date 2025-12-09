/**
 * I/O 模态提取器
 * 从文本内容中提取输入/输出模态类型
 * Requirements: 2.8, 3.8
 */

import { IOModality, IOResult, IO_MODALITY_KEYWORDS } from '@/lib/types/scanner'

// ============================================
// 输入模态关键词 (更具体的输入上下文)
// ============================================

const INPUT_CONTEXT_KEYWORDS = [
  'input', 'accept', 'receive', 'take', 'upload', 'send', 'submit',
  'provide', 'pass', 'request', 'query', 'prompt', 'enter'
] as const

// ============================================
// 输出模态关键词 (更具体的输出上下文)
// ============================================

const OUTPUT_CONTEXT_KEYWORDS = [
  'output', 'return', 'generate', 'produce', 'create', 'respond',
  'response', 'result', 'download', 'export', 'emit', 'yield'
] as const

// ============================================
// 辅助函数
// ============================================

/**
 * 检查内容是否包含特定模态的关键词
 */
function hasModalityKeywords(content: string, modality: IOModality): boolean {
  if (modality === 'Unknown') return false
  
  const keywords = IO_MODALITY_KEYWORDS[modality]
  const lowerContent = content.toLowerCase()
  
  return keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()))
}

/**
 * 检查内容是否在输入上下文中提及模态
 */
function hasInputContext(content: string, modality: IOModality): boolean {
  if (modality === 'Unknown') return false
  
  const keywords = IO_MODALITY_KEYWORDS[modality]
  const lowerContent = content.toLowerCase()
  
  // 检查是否有输入上下文关键词与模态关键词的组合
  for (const inputKeyword of INPUT_CONTEXT_KEYWORDS) {
    for (const modalityKeyword of keywords) {
      // 检查两个关键词是否在相近位置 (50 字符内)
      const inputIndex = lowerContent.indexOf(inputKeyword)
      const modalityIndex = lowerContent.indexOf(modalityKeyword.toLowerCase())
      
      if (inputIndex !== -1 && modalityIndex !== -1) {
        if (Math.abs(inputIndex - modalityIndex) < 50) {
          return true
        }
      }
    }
  }
  
  return false
}

/**
 * 检查内容是否在输出上下文中提及模态
 */
function hasOutputContext(content: string, modality: IOModality): boolean {
  if (modality === 'Unknown') return false
  
  const keywords = IO_MODALITY_KEYWORDS[modality]
  const lowerContent = content.toLowerCase()
  
  // 检查是否有输出上下文关键词与模态关键词的组合
  for (const outputKeyword of OUTPUT_CONTEXT_KEYWORDS) {
    for (const modalityKeyword of keywords) {
      // 检查两个关键词是否在相近位置 (50 字符内)
      const outputIndex = lowerContent.indexOf(outputKeyword)
      const modalityIndex = lowerContent.indexOf(modalityKeyword.toLowerCase())
      
      if (outputIndex !== -1 && modalityIndex !== -1) {
        if (Math.abs(outputIndex - modalityIndex) < 50) {
          return true
        }
      }
    }
  }
  
  return false
}

// ============================================
// 主要导出函数
// ============================================

/**
 * 从内容中提取输入模态
 * Requirements: 2.8, 3.8
 * 
 * @param content 要分析的文本内容
 * @returns 检测到的输入模态数组
 */
export function extractInputModalities(content: string): IOModality[] {
  if (!content || typeof content !== 'string') {
    return ['Unknown']
  }
  
  const modalities: IOModality[] = []
  const allModalities: IOModality[] = ['Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video']
  
  for (const modality of allModalities) {
    // 优先检查是否有明确的输入上下文
    if (hasInputContext(content, modality)) {
      modalities.push(modality)
    }
  }
  
  // 如果没有找到明确的输入上下文，回退到简单的关键词匹配
  if (modalities.length === 0) {
    for (const modality of allModalities) {
      if (hasModalityKeywords(content, modality)) {
        modalities.push(modality)
      }
    }
  }
  
  // 如果仍然没有找到，返回 Unknown
  return modalities.length > 0 ? modalities : ['Unknown']
}

/**
 * 从内容中提取输出模态
 * Requirements: 2.8, 3.8
 * 
 * @param content 要分析的文本内容
 * @returns 检测到的输出模态数组
 */
export function extractOutputModalities(content: string): IOModality[] {
  if (!content || typeof content !== 'string') {
    return ['Unknown']
  }
  
  const modalities: IOModality[] = []
  const allModalities: IOModality[] = ['Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video']
  
  for (const modality of allModalities) {
    // 优先检查是否有明确的输出上下文
    if (hasOutputContext(content, modality)) {
      modalities.push(modality)
    }
  }
  
  // 如果没有找到明确的输出上下文，回退到简单的关键词匹配
  if (modalities.length === 0) {
    for (const modality of allModalities) {
      if (hasModalityKeywords(content, modality)) {
        modalities.push(modality)
      }
    }
  }
  
  // 如果仍然没有找到，返回 Unknown
  return modalities.length > 0 ? modalities : ['Unknown']
}

/**
 * 从内容中提取 I/O 模态
 * Requirements: 2.8, 3.8
 * 
 * @param content 要分析的文本内容 (README, 描述, 页面内容等)
 * @returns I/O 提取结果，包含输入和输出模态数组
 */
export function extractIOModalities(content: string): IOResult {
  return {
    inputs: extractInputModalities(content),
    outputs: extractOutputModalities(content)
  }
}

/**
 * 检测特定模态是否存在于内容中
 * 
 * @param content 要分析的文本内容
 * @param modality 要检测的模态类型
 * @returns 是否检测到该模态
 */
export function hasModality(content: string, modality: IOModality): boolean {
  return hasModalityKeywords(content, modality)
}

/**
 * 获取所有检测到的模态 (不区分输入/输出)
 * 
 * @param content 要分析的文本内容
 * @returns 检测到的所有模态数组
 */
export function extractAllModalities(content: string): IOModality[] {
  if (!content || typeof content !== 'string') {
    return ['Unknown']
  }
  
  const modalities: IOModality[] = []
  const allModalities: IOModality[] = ['Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video']
  
  for (const modality of allModalities) {
    if (hasModalityKeywords(content, modality)) {
      modalities.push(modality)
    }
  }
  
  return modalities.length > 0 ? modalities : ['Unknown']
}

// 导出类型
export type { IOModality, IOResult }
