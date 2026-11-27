import { describe, expect, it } from 'vitest'
import { formatDate, statusOf, titleOf } from './format'

describe('format utilities', () => {
  it('uses a readable fallback when an API record has no title', () => {
    expect(titleOf({ _id: '1' }, 'Tanpa nama')).toBe('Tanpa nama')
  })

  it('prefers nested API data for title and status', () => {
    const record = { _id: '1', status: 'DRAFT', data: { title: 'Audit ruang', status: 'PROCESSING' } }
    expect(titleOf(record)).toBe('Audit ruang')
    expect(statusOf(record)).toBe('PROCESSING')
  })

  it('returns a dash for invalid dates', () => {
    expect(formatDate('invalid')).toBe('—')
  })
})
