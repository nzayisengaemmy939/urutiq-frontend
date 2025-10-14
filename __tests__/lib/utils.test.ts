import { cn } from '@/lib/utils'

describe('Utils Functions', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
    })

    it('handles undefined and null values', () => {
      expect(cn('base', undefined, null)).toBe('base')
    })

    it('handles empty strings', () => {
      expect(cn('base', '')).toBe('base')
    })

    it('handles complex combinations', () => {
      expect(cn('base', 'class1', true && 'conditional', false && 'hidden')).toBe('base class1 conditional')
    })
  })
})
