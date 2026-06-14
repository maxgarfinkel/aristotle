import { renderHook, act } from '@testing-library/react'
import { createElement } from 'react'
import WizardProvider from '../context/WizardProvider'
import { useWeeklySchedule, DAYS_OF_WEEK } from './useWeeklySchedule'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(WizardProvider, null, children)

describe('useWeeklySchedule', () => {
  it('initialises with 7 entries, all enabled', () => {
    const { result } = renderHook(() => useWeeklySchedule(), { wrapper })
    expect(result.current.schedule).toHaveLength(7)
    expect(result.current.schedule.every((d) => d.enabled)).toBe(true)
  })

  it('is invalid when fields are empty', () => {
    const { result } = renderHook(() => useWeeklySchedule(), { wrapper })
    expect(result.current.isValid).toBe(false)
  })

  it('toggleDay flips enabled', () => {
    const { result } = renderHook(() => useWeeklySchedule(), { wrapper })
    act(() => {
      result.current.toggleDay(0)
    })
    expect(result.current.schedule[0]!.enabled).toBe(false)
    act(() => {
      result.current.toggleDay(0)
    })
    expect(result.current.schedule[0]!.enabled).toBe(true)
  })

  it('updateDay updates correct field without affecting others', () => {
    const { result } = renderHook(() => useWeeklySchedule(), { wrapper })
    act(() => {
      result.current.updateDay(2, 'hoursInput', '3')
    })
    expect(result.current.schedule[2]!.hoursInput).toBe('3')
    expect(result.current.schedule[2]!.minutesInput).toBe('')
    expect(result.current.schedule[0]!.hoursInput).toBe('')
  })

  it('is valid when all enabled days have valid hours+minutes and at least one is enabled', () => {
    const { result } = renderHook(() => useWeeklySchedule(), { wrapper })
    act(() => {
      for (let i = 1; i < 7; i++) {
        result.current.toggleDay(i)
      }
      result.current.updateDay(0, 'hoursInput', '2')
      result.current.updateDay(0, 'minutesInput', '30')
    })
    expect(result.current.isValid).toBe(true)
  })

  it('is valid when some days are disabled and remaining days are valid', () => {
    const { result } = renderHook(() => useWeeklySchedule(), { wrapper })
    act(() => {
      for (let i = 1; i < 7; i++) {
        result.current.toggleDay(i)
      }
      result.current.updateDay(0, 'hoursInput', '1')
    })
    expect(result.current.isValid).toBe(true)
  })

  it('is invalid when no days are enabled', () => {
    const { result } = renderHook(() => useWeeklySchedule(), { wrapper })
    act(() => {
      DAYS_OF_WEEK.forEach((_, i) => {
        result.current.toggleDay(i)
      })
    })
    expect(result.current.isValid).toBe(false)
  })

  it('is invalid when an enabled day has minutes > 59', () => {
    const { result } = renderHook(() => useWeeklySchedule(), { wrapper })
    act(() => {
      for (let i = 1; i < 7; i++) {
        result.current.toggleDay(i)
      }
      result.current.updateDay(0, 'hoursInput', '1')
      result.current.updateDay(0, 'minutesInput', '60')
    })
    expect(result.current.isValid).toBe(false)
  })

  it('is invalid when an enabled day has 0 hours and 0 minutes', () => {
    const { result } = renderHook(() => useWeeklySchedule(), { wrapper })
    act(() => {
      for (let i = 1; i < 7; i++) {
        result.current.toggleDay(i)
      }
      result.current.updateDay(0, 'hoursInput', '0')
      result.current.updateDay(0, 'minutesInput', '0')
    })
    expect(result.current.isValid).toBe(false)
  })

  it('is invalid when an enabled day has negative hours', () => {
    const { result } = renderHook(() => useWeeklySchedule(), { wrapper })
    act(() => {
      for (let i = 1; i < 7; i++) {
        result.current.toggleDay(i)
      }
      result.current.updateDay(0, 'hoursInput', '-1')
      result.current.updateDay(0, 'minutesInput', '30')
    })
    expect(result.current.isValid).toBe(false)
  })
})
