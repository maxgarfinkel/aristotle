import { renderHook } from '@testing-library/react'
import { useScheduleResult } from './useScheduleResult'
import WizardProvider from '../context/WizardProvider'
import type { ModuleSummary } from '../types/module'

describe('useScheduleResult', () => {
  it('returns empty sessions when modules array is empty', () => {
    const { result } = renderHook(() => useScheduleResult([]), {
      wrapper: WizardProvider,
    })
    expect(result.current.sessions).toEqual([])
    expect(result.current.warnings).toEqual([])
  })

  it('returns empty sessions when context has no assessment entries', () => {
    const modules: ModuleSummary[] = [{ name: 'Maths', cats: 30, assessmentCount: 1 }]
    const { result } = renderHook(() => useScheduleResult(modules), {
      wrapper: WizardProvider,
    })
    expect(result.current.sessions).toEqual([])
    expect(result.current.warnings).toEqual([])
  })

  it('returns a ScheduleResult with sessions and warnings keys', () => {
    const { result } = renderHook(() => useScheduleResult([]), {
      wrapper: WizardProvider,
    })
    expect(result.current).toHaveProperty('sessions')
    expect(result.current).toHaveProperty('warnings')
  })
})
