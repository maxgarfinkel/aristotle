import { renderHook } from '@testing-library/react'
import { createElement } from 'react'
import WizardProvider from '../context/WizardProvider'
import { useStudyPlan } from './useStudyPlan'
import type { ScheduleWizard } from '../types/wizard'

function createWrapper(initialState: Partial<ScheduleWizard>) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(WizardProvider, { initialState, children })
}

const validState: ScheduleWizard = {
  numberOfModules: '1',
  modules: [
    {
      name: 'Algorithms',
      catsInput: '20',
      assessmentsInput: '1',
      assessments: [
        {
          name: 'Coursework',
          percentageInput: '100',
          startDate: '2026-09-07',
          deadline: '2026-09-11',
        },
      ],
    },
  ],
  // Monday–Friday, 2 h each
  weeklySchedule: Array.from({ length: 7 }, (_, i) => ({
    enabled: i < 5,
    hoursInput: '2',
    minutesInput: '0',
  })),
}

describe('useStudyPlan', () => {
  it('returns an empty plan when the wizard has no modules', () => {
    const { result } = renderHook(() => useStudyPlan(), {
      wrapper: createWrapper({}),
    })
    expect(result.current.dayEntries).toHaveLength(0)
    expect(result.current.summaries).toHaveLength(0)
  })

  it('returns a non-empty plan when the wizard has valid data', () => {
    const { result } = renderHook(() => useStudyPlan(), {
      wrapper: createWrapper(validState),
    })
    expect(result.current.dayEntries.length).toBeGreaterThan(0)
    expect(result.current.summaries).toHaveLength(1)
  })

  it('passes the full wizard state to the scheduling engine', () => {
    const { result } = renderHook(() => useStudyPlan(), {
      wrapper: createWrapper(validState),
    })
    // 5 study days × 120 min = 600 min → 5 entries
    expect(result.current.dayEntries).toHaveLength(5)
    expect(result.current.summaries[0]!.assessmentName).toBe('Coursework')
    expect(result.current.summaries[0]!.totalMinutes).toBe(600)
  })
})
