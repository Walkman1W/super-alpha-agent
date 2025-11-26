import { describe, it, expect } from 'vitest'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

describe('工具函数测试', () => {
  describe('clsx', () => {
    it('应该正确合并类名', () => {
      const result = clsx('text-red-500', 'bg-blue-100')
      expect(result).toBe('text-red-500 bg-blue-100')
    })

    it('应该处理条件类名', () => {
      const result = clsx('base', true && 'conditional', false && 'hidden')
      expect(result).toBe('base conditional')
    })
  })

  describe('tailwind-merge', () => {
    it('应该正确合并 Tailwind 类名', () => {
      const result = twMerge('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    it('应该处理冲突的类名', () => {
      const result = twMerge('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })
  })
})