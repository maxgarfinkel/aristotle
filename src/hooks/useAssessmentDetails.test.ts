import { renderHook, act } from '@testing-library/react'
import { useAssessmentDetails } from './useAssessmentDetails'
import type { ModuleSummary } from '../types/module'

const FIXED_DATE = '2025-06-15T12:00:00.000Z'
const TOMORROW = '2025-06-16'

const singleModule: ModuleSummary[] = [{ name: 'Maths', cats: 30, assessmentCount: 2 }]
const twoModules: ModuleSummary[] = [
  { name: 'Maths', cats: 30, assessmentCount: 2 },
  { name: 'Physics', cats: 15, assessmentCount: 1 },
]

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(FIXED_DATE))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useAssessmentDetails', () => {
  it('initialises with the correct number of modules and assessments', () => {
    const { result } = renderHook(() => useAssessmentDetails(twoModules))
    expect(result.current.moduleEntries).toHaveLength(2)
    expect(result.current.moduleEntries[0]).toHaveLength(2)
    expect(result.current.moduleEntries[1]).toHaveLength(1)
  })

  it('defaults start date to tomorrow', () => {
    const { result } = renderHook(() => useAssessmentDetails(singleModule))
    expect(result.current.moduleEntries[0]?.[0]?.startDate).toBe(TOMORROW)
  })

  it('defaults deadline to an empty string', () => {
    const { result } = renderHook(() => useAssessmentDetails(singleModule))
    expect(result.current.moduleEntries[0]?.[0]?.deadline).toBe('')
  })

  it('is invalid when fields are empty', () => {
    const { result } = renderHook(() => useAssessmentDetails(singleModule))
    expect(result.current.isValid).toBe(false)
  })

  it('updateField updates the correct assessment field', () => {
    const { result } = renderHook(() => useAssessmentDetails(singleModule))
    act(() => result.current.updateField(0, 1, 'name', 'Exam'))
    expect(result.current.moduleEntries[0]?.[1]?.name).toBe('Exam')
    expect(result.current.moduleEntries[0]?.[0]?.name).toBe('')
  })

  it('is valid when all fields are filled and percentages sum to 100', () => {
    const { result } = renderHook(() => useAssessmentDetails(singleModule))
    act(() => {
      result.current.updateField(0, 0, 'name', 'Coursework')
      result.current.updateField(0, 0, 'percentageInput', '60')
      result.current.updateField(0, 0, 'deadline', '2025-08-01')
      result.current.updateField(0, 1, 'name', 'Exam')
      result.current.updateField(0, 1, 'percentageInput', '40')
      result.current.updateField(0, 1, 'deadline', '2025-09-01')
    })
    expect(result.current.isValid).toBe(true)
  })

  it('is invalid when percentages do not sum to 100', () => {
    const { result } = renderHook(() => useAssessmentDetails(singleModule))
    act(() => {
      result.current.updateField(0, 0, 'name', 'Coursework')
      result.current.updateField(0, 0, 'percentageInput', '50')
      result.current.updateField(0, 0, 'deadline', '2025-08-01')
      result.current.updateField(0, 1, 'name', 'Exam')
      result.current.updateField(0, 1, 'percentageInput', '40')
      result.current.updateField(0, 1, 'deadline', '2025-09-01')
    })
    expect(result.current.isValid).toBe(false)
  })

  it('is invalid when deadline is not after start date', () => {
    const { result } = renderHook(() => useAssessmentDetails(singleModule))
    act(() => {
      result.current.updateField(0, 0, 'name', 'Coursework')
      result.current.updateField(0, 0, 'percentageInput', '60')
      result.current.updateField(0, 0, 'deadline', TOMORROW) // same as start date
      result.current.updateField(0, 1, 'name', 'Exam')
      result.current.updateField(0, 1, 'percentageInput', '40')
      result.current.updateField(0, 1, 'deadline', '2025-09-01')
    })
    expect(result.current.isValid).toBe(false)
  })

  it('is invalid when any percentage exceeds 100', () => {
    const { result } = renderHook(() => useAssessmentDetails(singleModule))
    act(() => {
      result.current.updateField(0, 0, 'name', 'Coursework')
      result.current.updateField(0, 0, 'percentageInput', '110')
      result.current.updateField(0, 0, 'deadline', '2025-08-01')
      result.current.updateField(0, 1, 'name', 'Exam')
      result.current.updateField(0, 1, 'percentageInput', '40')
      result.current.updateField(0, 1, 'deadline', '2025-09-01')
    })
    expect(result.current.isValid).toBe(false)
  })

  it('validates each module independently', () => {
    const { result } = renderHook(() => useAssessmentDetails(twoModules))
    act(() => {
      // Fill module 0 completely
      result.current.updateField(0, 0, 'name', 'Coursework')
      result.current.updateField(0, 0, 'percentageInput', '60')
      result.current.updateField(0, 0, 'deadline', '2025-08-01')
      result.current.updateField(0, 1, 'name', 'Exam')
      result.current.updateField(0, 1, 'percentageInput', '40')
      result.current.updateField(0, 1, 'deadline', '2025-09-01')
      // Leave module 1 empty
    })
    expect(result.current.isValid).toBe(false)
  })
})
