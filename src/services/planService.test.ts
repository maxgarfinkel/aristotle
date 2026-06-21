import { describe, it, expect } from 'vitest'
import { buildStudyPlan } from './planService'
import type { ScheduleWizard } from '../types/wizard'
import type { WeeklySchedule } from '../types/schedule'

// Sep 7 2026 = Monday (verified)
// Mon–Fri: indices 0–4 in the schedule array

/** Monday–Friday, 2 h per day */
const MF2H: WeeklySchedule = Array.from({ length: 7 }, (_, i) => ({
  enabled: i < 5,
  hoursInput: '2',
  minutesInput: '0',
}))

/** Monday only, 3 h */
const MON3H: WeeklySchedule = Array.from({ length: 7 }, (_, i) => ({
  enabled: i === 0,
  hoursInput: '3',
  minutesInput: '0',
}))

function wizard(overrides: Partial<ScheduleWizard> = {}): ScheduleWizard {
  return {
    numberOfModules: '1',
    modules: [],
    weeklySchedule: MF2H,
    ...overrides,
  }
}

describe('buildStudyPlan', () => {
  it('returns an empty plan when there are no modules', () => {
    const plan = buildStudyPlan(wizard())
    expect(plan.dayEntries).toHaveLength(0)
    expect(plan.summaries).toHaveLength(0)
  })

  it('returns an empty plan when modules have no assessments', () => {
    const plan = buildStudyPlan(
      wizard({
        modules: [{ name: 'Maths', catsInput: '20', assessmentsInput: '0', assessments: [] }],
      }),
    )
    expect(plan.dayEntries).toHaveLength(0)
    expect(plan.summaries).toHaveLength(0)
  })

  describe('single assessment', () => {
    // 20 CATS, 100%, Mon–Fri 2 h, Sep 7–11 (5 study days × 120 min = 600 min total)
    const plan = buildStudyPlan(
      wizard({
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
      }),
    )

    it('produces one summary entry', () => {
      expect(plan.summaries).toHaveLength(1)
    })

    it('allocates all available minutes to the single assessment', () => {
      expect(plan.summaries[0]!.totalMinutes).toBe(600)
    })

    it('schedules exactly 5 day entries', () => {
      expect(plan.dayEntries).toHaveLength(5)
    })

    it('assigns 120 min to each day', () => {
      for (const entry of plan.dayEntries) {
        expect(entry.minutesSpent).toBe(120)
      }
    })

    it('finishes on the last available day', () => {
      expect(plan.summaries[0]!.finishDate).toBe('2026-09-11')
    })

    it('labels every entry with the correct module and assessment', () => {
      for (const entry of plan.dayEntries) {
        expect(entry.moduleName).toBe('Algorithms')
        expect(entry.assessmentName).toBe('Coursework')
      }
    })
  })

  describe('two assessments with different deadlines', () => {
    // Coursework 60% (deadline Wed), Essay 40% (deadline Fri)
    // Total cats: 20, total minutes: 600
    // Coursework: 360 min → Mon–Wed
    // Essay: 240 min → Thu–Fri
    const plan = buildStudyPlan(
      wizard({
        modules: [
          {
            name: 'Algorithms',
            catsInput: '20',
            assessmentsInput: '2',
            assessments: [
              {
                name: 'Coursework',
                percentageInput: '60',
                startDate: '2026-09-07',
                deadline: '2026-09-09',
              },
              {
                name: 'Essay',
                percentageInput: '40',
                startDate: '2026-09-07',
                deadline: '2026-09-11',
              },
            ],
          },
        ],
      }),
    )

    it('schedules the earlier-deadline assessment first', () => {
      expect(plan.summaries[0]!.assessmentName).toBe('Coursework')
      expect(plan.summaries[1]!.assessmentName).toBe('Essay')
    })

    it('Coursework finishes on Wednesday', () => {
      expect(plan.summaries[0]!.finishDate).toBe('2026-09-09')
    })

    it('Essay finishes on Friday', () => {
      expect(plan.summaries[1]!.finishDate).toBe('2026-09-11')
    })

    it('produces 5 day entries in total', () => {
      expect(plan.dayEntries).toHaveLength(5)
    })

    it('all Coursework entries precede all Essay entries', () => {
      const cwDates = plan.dayEntries.filter((e) => e.assessmentName === 'Coursework').map((e) => e.date)
      const essayDates = plan.dayEntries.filter((e) => e.assessmentName === 'Essay').map((e) => e.date)
      const lastCw = cwDates[cwDates.length - 1]!
      const firstEssay = essayDates[0]!
      expect(lastCw < firstEssay).toBe(true)
    })
  })

  describe('two assessments with the same deadline — sorted by size', () => {
    // Essay 40% (240 min, smaller) should be scheduled before Coursework 60% (360 min)
    const plan = buildStudyPlan(
      wizard({
        modules: [
          {
            name: 'Algorithms',
            catsInput: '20',
            assessmentsInput: '2',
            assessments: [
              {
                name: 'Coursework',
                percentageInput: '60',
                startDate: '2026-09-07',
                deadline: '2026-09-11',
              },
              {
                name: 'Essay',
                percentageInput: '40',
                startDate: '2026-09-07',
                deadline: '2026-09-11',
              },
            ],
          },
        ],
      }),
    )

    it('schedules the smaller assessment first', () => {
      expect(plan.summaries[0]!.assessmentName).toBe('Essay')
      expect(plan.summaries[1]!.assessmentName).toBe('Coursework')
    })

    it('Essay (240 min) finishes before Coursework (360 min)', () => {
      expect(plan.summaries[0]!.finishDate < plan.summaries[1]!.finishDate).toBe(true)
    })
  })

  describe('assessment start date constraint', () => {
    // Only one assessment, starts on Wednesday
    // planStartDate = Wed Sep 9, planEndDate = Sep 11
    // Available: Wed + Thu + Fri = 360 min
    const plan = buildStudyPlan(
      wizard({
        modules: [
          {
            name: 'Algorithms',
            catsInput: '20',
            assessmentsInput: '1',
            assessments: [
              {
                name: 'Coursework',
                percentageInput: '100',
                startDate: '2026-09-09',
                deadline: '2026-09-11',
              },
            ],
          },
        ],
      }),
    )

    it('first entry is on or after the assessment start date', () => {
      expect(plan.dayEntries[0]!.date >= '2026-09-09').toBe(true)
    })

    it('no entries appear before the start date', () => {
      for (const entry of plan.dayEntries) {
        expect(entry.date >= '2026-09-09').toBe(true)
      }
    })

    it('allocates 360 minutes (Wed–Fri only)', () => {
      expect(plan.summaries[0]!.totalMinutes).toBe(360)
    })
  })

  describe('second assessment blocked by start date', () => {
    // A finishes Tue, B cannot start until Thu
    // Each module is 20 cats, 50% each
    // totalCats = 20, totalMinutes from Sep 7 to Sep 11 = 600
    // A: 300 min, B: 300 min
    // A: Mon(120)+Tue(120)+Wed(60) → finishes Wed with 60 min remaining in the day
    // B.startDate = Sep 10 (Thu): scheduler advances past Wed's remaining time to Thu
    // B: Thu(120)+Fri(120)+Mon14(60) → finishes Mon Sep 14
    const plan = buildStudyPlan(
      wizard({
        modules: [
          {
            name: 'Mod A',
            catsInput: '20',
            assessmentsInput: '1',
            assessments: [
              {
                name: 'Task A',
                percentageInput: '50',
                startDate: '2026-09-07',
                deadline: '2026-09-09',
              },
            ],
          },
          {
            name: 'Mod B',
            catsInput: '20',
            assessmentsInput: '1',
            assessments: [
              {
                name: 'Task B',
                percentageInput: '50',
                startDate: '2026-09-10',
                deadline: '2026-09-11',
              },
            ],
          },
        ],
      }),
    )

    it('no Task B entry appears before its start date', () => {
      const bEntries = plan.dayEntries.filter((e) => e.assessmentName === 'Task B')
      for (const entry of bEntries) {
        expect(entry.date >= '2026-09-10').toBe(true)
      }
    })
  })

  describe('mid-day handoff', () => {
    // Monday-only schedule, 3 h per day
    // Two assessments: same start/deadline
    // Module: 30 cats. A=20cats (120 min), B=10cats (60 min).
    // Sorted by size: B (60 min) first, then A (120 min)
    // Day 1 (Sep 7 Mon, 180 min): B uses 60 min → 120 remaining → A uses 120 min
    // Both finish on Sep 7
    const plan = buildStudyPlan(
      wizard({
        weeklySchedule: MON3H,
        modules: [
          {
            name: 'Mod A',
            catsInput: '20',
            assessmentsInput: '1',
            assessments: [
              {
                name: 'Task A',
                percentageInput: '100',
                startDate: '2026-09-07',
                deadline: '2026-09-14',
              },
            ],
          },
          {
            name: 'Mod B',
            catsInput: '10',
            assessmentsInput: '1',
            assessments: [
              {
                name: 'Task B',
                percentageInput: '100',
                startDate: '2026-09-07',
                deadline: '2026-09-14',
              },
            ],
          },
        ],
      }),
    )

    it('both assessments share the first study day', () => {
      const sep7Entries = plan.dayEntries.filter((e) => e.date === '2026-09-07')
      expect(sep7Entries).toHaveLength(2)
    })

    it('Task B (smaller) is scheduled before Task A on the same day', () => {
      const sep7 = plan.dayEntries.filter((e) => e.date === '2026-09-07')
      expect(sep7[0]!.assessmentName).toBe('Task B')
      expect(sep7[1]!.assessmentName).toBe('Task A')
    })

    it('combined minutes on that day equal the full day capacity', () => {
      const sep7Total = plan.dayEntries
        .filter((e) => e.date === '2026-09-07')
        .reduce((sum, e) => sum + e.minutesSpent, 0)
      expect(sep7Total).toBe(180)
    })
  })

  describe('CATs weighting across multiple modules', () => {
    // Mod X: 30 cats, assessment 100% → 30 cats
    // Mod Y: 10 cats, assessment 100% → 10 cats
    // Total: 40 cats
    // planStartDate = Sep 7, planEndDate = Sep 14 (Mon–Fri 2h)
    // Study days: Sep 7,8,9,10,11 (Fri) then Sep 14 (Mon) = 6 days × 120 = 720 min
    // Big Task: 720 * 30/40 = 540 min
    // Small Task: 720 * 10/40 = 180 min
    const plan = buildStudyPlan(
      wizard({
        modules: [
          {
            name: 'Mod X',
            catsInput: '30',
            assessmentsInput: '1',
            assessments: [
              {
                name: 'Big Task',
                percentageInput: '100',
                startDate: '2026-09-07',
                deadline: '2026-09-11',
              },
            ],
          },
          {
            name: 'Mod Y',
            catsInput: '10',
            assessmentsInput: '1',
            assessments: [
              {
                name: 'Small Task',
                percentageInput: '100',
                startDate: '2026-09-07',
                deadline: '2026-09-14',
              },
            ],
          },
        ],
      }),
    )

    it('allocates proportionally more minutes to the higher-CATS module', () => {
      const bigSummary = plan.summaries.find((s) => s.assessmentName === 'Big Task')!
      const smallSummary = plan.summaries.find((s) => s.assessmentName === 'Small Task')!
      expect(bigSummary.totalMinutes).toBe(540)
      expect(smallSummary.totalMinutes).toBe(180)
    })
  })
})
