import { addDays, tomorrow } from './dateUtils'

describe('addDays', () => {
  it('adds one day to a mid-month date', () => {
    expect(addDays('2026-06-15', 1)).toBe('2026-06-16')
  })

  it('rolls over to the next month', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
  })

  it('rolls over to the next year', () => {
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01')
  })

  it('handles leap day', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
  })

  it('adds multiple days', () => {
    expect(addDays('2026-06-01', 7)).toBe('2026-06-08')
  })
})

describe('tomorrow', () => {
  const FIXED_DATE = '2025-06-15T12:00:00.000Z'
  const EXPECTED_TOMORROW = '2025-06-16'

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(FIXED_DATE))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the next calendar day as an ISO string', () => {
    expect(tomorrow()).toBe(EXPECTED_TOMORROW)
  })
})
