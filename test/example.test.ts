import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

describe('基础数学运算', () => {
  it('应该正确计算加法', () => {
    expect(2 + 2).toBe(4)
  })

  it('应该正确计算乘法', () => {
    expect(3 * 4).toBe(12)
  })
})

describe('fast-check 属性测试', () => {
  it('加法交换律应该成立', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a
      })
    )
  })

  it('乘法分配律应该成立', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 1000 }), fc.integer({ min: -1000, max: 1000 }), fc.integer({ min: -1000, max: 1000 }), (a, b, c) => {
        return a * (b + c) === a * b + a * c
      })
    )
  })
})