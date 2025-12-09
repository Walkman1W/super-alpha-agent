/**
 * I/O 提取器属性测试
 * 使用 fast-check 进行属性测试
 * 
 * **功能: agent-scanner-mvp, 属性 9: I/O 模态提取**
 * **验证: 需求 2.8, 3.8**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  extractIOModalities,
  extractInputModalities,
  extractOutputModalities,
  extractAllModalities,
  hasModality
} from './io-extractor'
import { IOModality, IO_MODALITY_KEYWORDS } from '@/lib/types/scanner'

// ============================================
// 测试辅助函数
// ============================================

/**
 * 生成包含特定模态关键词的内容
 */
function generateContentWithModality(modality: IOModality): fc.Arbitrary<string> {
  if (modality === 'Unknown') {
    // 生成不包含任何模态关键词的内容
    return fc.string().filter(s => {
      const lower = s.toLowerCase()
      const allKeywords = Object.values(IO_MODALITY_KEYWORDS).flat()
      return !allKeywords.some(k => lower.includes(k.toLowerCase()))
    })
  }
  
  const keywords = IO_MODALITY_KEYWORDS[modality]
  return fc.constantFrom(...keywords).map(keyword => {
    return `This tool can process ${keyword} data.`
  })
}

/**
 * 生成包含输入上下文的内容
 */
function generateInputContextContent(modality: IOModality): fc.Arbitrary<string> {
  if (modality === 'Unknown') {
    return fc.constant('No specific modality mentioned.')
  }
  
  const keywords = IO_MODALITY_KEYWORDS[modality]
  const inputContexts = ['input', 'accept', 'receive', 'upload', 'send']
  
  return fc.tuple(
    fc.constantFrom(...inputContexts),
    fc.constantFrom(...keywords)
  ).map(([context, keyword]) => {
    return `This API can ${context} ${keyword} data for processing.`
  })
}

/**
 * 生成包含输出上下文的内容
 */
function generateOutputContextContent(modality: IOModality): fc.Arbitrary<string> {
  if (modality === 'Unknown') {
    return fc.constant('No specific modality mentioned.')
  }
  
  const keywords = IO_MODALITY_KEYWORDS[modality]
  const outputContexts = ['output', 'return', 'generate', 'produce', 'create']
  
  return fc.tuple(
    fc.constantFrom(...outputContexts),
    fc.constantFrom(...keywords)
  ).map(([context, keyword]) => {
    return `This API will ${context} ${keyword} data as result.`
  })
}

// ============================================
// 属性测试
// ============================================

describe('I/O 提取器属性测试', () => {
  /**
   * **功能: agent-scanner-mvp, 属性 9: I/O 模态提取**
   * 对于任意文本内容，I/O 提取器应基于关键词模式正确识别输入和输出模态，
   * 如果没有模式匹配则返回至少包含 'Unknown' 的非空结果。
   * **验证: 需求 2.8, 3.8**
   */
  describe('属性 9: I/O 模态提取', () => {
    it('对于任意字符串，extractIOModalities 应返回非空的 inputs 和 outputs 数组', () => {
      fc.assert(
        fc.property(fc.string(), (content) => {
          const result = extractIOModalities(content)
          
          // 结果应该有 inputs 和 outputs 属性
          expect(result).toHaveProperty('inputs')
          expect(result).toHaveProperty('outputs')
          
          // 两个数组都应该非空
          expect(result.inputs.length).toBeGreaterThan(0)
          expect(result.outputs.length).toBeGreaterThan(0)
          
          // 所有元素应该是有效的 IOModality
          const validModalities: IOModality[] = ['Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video', 'Unknown']
          result.inputs.forEach(m => expect(validModalities).toContain(m))
          result.outputs.forEach(m => expect(validModalities).toContain(m))
        }),
        { numRuns: 100 }
      )
    })

    it('对于空字符串或无效输入，应返回包含 Unknown 的结果', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\n\t', null, undefined),
          (content) => {
            const result = extractIOModalities(content as string)
            
            // 应该返回 Unknown
            expect(result.inputs).toContain('Unknown')
            expect(result.outputs).toContain('Unknown')
          }
        ),
        { numRuns: 10 }
      )
    })

    it('包含 Text 关键词的内容应检测到 Text 模态', () => {
      fc.assert(
        fc.property(generateContentWithModality('Text'), (content) => {
          const result = extractAllModalities(content)
          expect(result).toContain('Text')
        }),
        { numRuns: 100 }
      )
    })

    it('包含 Image 关键词的内容应检测到 Image 模态', () => {
      fc.assert(
        fc.property(generateContentWithModality('Image'), (content) => {
          const result = extractAllModalities(content)
          expect(result).toContain('Image')
        }),
        { numRuns: 100 }
      )
    })

    it('包含 Audio 关键词的内容应检测到 Audio 模态', () => {
      fc.assert(
        fc.property(generateContentWithModality('Audio'), (content) => {
          const result = extractAllModalities(content)
          expect(result).toContain('Audio')
        }),
        { numRuns: 100 }
      )
    })

    it('包含 JSON 关键词的内容应检测到 JSON 模态', () => {
      fc.assert(
        fc.property(generateContentWithModality('JSON'), (content) => {
          const result = extractAllModalities(content)
          expect(result).toContain('JSON')
        }),
        { numRuns: 100 }
      )
    })

    it('包含 Code 关键词的内容应检测到 Code 模态', () => {
      fc.assert(
        fc.property(generateContentWithModality('Code'), (content) => {
          const result = extractAllModalities(content)
          expect(result).toContain('Code')
        }),
        { numRuns: 100 }
      )
    })

    it('包含 File 关键词的内容应检测到 File 模态', () => {
      fc.assert(
        fc.property(generateContentWithModality('File'), (content) => {
          const result = extractAllModalities(content)
          expect(result).toContain('File')
        }),
        { numRuns: 100 }
      )
    })

    it('包含 Video 关键词的内容应检测到 Video 模态', () => {
      fc.assert(
        fc.property(generateContentWithModality('Video'), (content) => {
          const result = extractAllModalities(content)
          expect(result).toContain('Video')
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('输入上下文检测', () => {
    it('包含输入上下文的 Image 内容应在 inputs 中检测到 Image', () => {
      fc.assert(
        fc.property(generateInputContextContent('Image'), (content) => {
          const result = extractInputModalities(content)
          expect(result).toContain('Image')
        }),
        { numRuns: 100 }
      )
    })

    it('包含输入上下文的 Text 内容应在 inputs 中检测到 Text', () => {
      fc.assert(
        fc.property(generateInputContextContent('Text'), (content) => {
          const result = extractInputModalities(content)
          expect(result).toContain('Text')
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('输出上下文检测', () => {
    it('包含输出上下文的 JSON 内容应在 outputs 中检测到 JSON', () => {
      fc.assert(
        fc.property(generateOutputContextContent('JSON'), (content) => {
          const result = extractOutputModalities(content)
          expect(result).toContain('JSON')
        }),
        { numRuns: 100 }
      )
    })

    it('包含输出上下文的 Code 内容应在 outputs 中检测到 Code', () => {
      fc.assert(
        fc.property(generateOutputContextContent('Code'), (content) => {
          const result = extractOutputModalities(content)
          expect(result).toContain('Code')
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('hasModality 函数', () => {
    it('对于包含特定模态关键词的内容，hasModality 应返回 true', () => {
      const modalities: IOModality[] = ['Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video']
      
      fc.assert(
        fc.property(
          fc.constantFrom(...modalities),
          (modality) => {
            return fc.assert(
              fc.property(generateContentWithModality(modality), (content) => {
                expect(hasModality(content, modality)).toBe(true)
              }),
              { numRuns: 10 }
            )
          }
        ),
        { numRuns: 7 }
      )
    })

    it('对于 Unknown 模态，hasModality 应始终返回 false', () => {
      fc.assert(
        fc.property(fc.string(), (content) => {
          expect(hasModality(content, 'Unknown')).toBe(false)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('多模态检测', () => {
    it('包含多个模态关键词的内容应检测到所有相关模态', () => {
      const multiModalContent = fc.constant(
        'This API accepts text input and image files, then generates JSON output with code snippets.'
      )
      
      fc.assert(
        fc.property(multiModalContent, (content) => {
          const result = extractAllModalities(content)
          
          expect(result).toContain('Text')
          expect(result).toContain('Image')
          expect(result).toContain('JSON')
          expect(result).toContain('Code')
          expect(result).toContain('File')
        }),
        { numRuns: 10 }
      )
    })
  })

  describe('结果一致性', () => {
    it('对于相同输入，extractIOModalities 应返回一致的结果', () => {
      fc.assert(
        fc.property(fc.string(), (content) => {
          const result1 = extractIOModalities(content)
          const result2 = extractIOModalities(content)
          
          expect(result1.inputs).toEqual(result2.inputs)
          expect(result1.outputs).toEqual(result2.outputs)
        }),
        { numRuns: 100 }
      )
    })
  })
})
