import { describe, it, expect } from 'vitest'
import { generateSchedule } from './scheduler'
import type { ModuleSummary } from '../types/module'
import type { WeeklySchedule } from '../types/schedule'

// Monday–Friday 2h/day; Saturday and Sunday disabled
const weekdaySchedule: WeeklySchedule = [
  { enabled: true, hoursInput: '2', minutesInput: '0' },   // Mon
  { enabled: true, hoursInput: '2', minutesInput: '0' },   // Tue
  { enabled: true, hoursInput: '2', minutesInput: '0' },   // Wed
  { enabled: true, hoursInput: '2', minutesInput: '0' },   // Thu
  { enabled: true, hoursInput: '2', minutesInput: '0' },   // Fri
  { enabled: false, hoursInput: '0', minutesInput: '0' },  // Sat
  { enabled: false, hoursInput: '0', minutesInput: '0' },  // Sun
]

// All 7 days enabled, 1h each
const dailySchedule: WeeklySchedule = Array.from({ length: 7 }, () => ({
  enabled: true,
  hoursInput: '1',
  minutesInput: '0',
}))

describe('generateSchedule', () => {
  it('returns empty sessions when modules array is empty', () => {
    const { sessions, warnings } = generateSchedule([], [], dailySchedule)
    expect(sessions).toEqual([])
    expect(warnings).toEqual([])
  })

  it('returns empty sessions when no assessments exist for any module', () => {
    const modules: ModuleSummary[] = [{ name: 'Maths', cats: 20, assessmentCount: 0 }]
    const { sessions, warnings } = generateSchedule(modules, [[]], dailySchedule)
    expect(sessions).toEqual([])
    expect(warnings).toEqual([])
  })

  it('produces sessions only on enabled days', () => {
    // 2025-01-06 is a Monday
    const modules: ModuleSummary[] = [{ name: 'Maths', cats: 20, assessmentCount: 1 }]
    const { sessions } = generateSchedule(
      modules,
      [[{ name: 'Exam', percentageInput: '100', startDate: '2025-01-06', deadline: '2025-01-17' }]],
      weekdaySchedule,
    )
    expect(sessions.length).toBeGreaterThan(0)
    for (const s of sessions) {
      const dow = new Date(s.date + 'T00:00:00Z').getUTCDay()
      expect(dow).not.toBe(0) // not Sunday
      expect(dow).not.toBe(6) // not Saturday
    }
  })

  it('does not schedule sessions before the assessment start date', () => {
    const modules: ModuleSummary[] = [{ name: 'Maths', cats: 20, assessmentCount: 1 }]
    const { sessions } = generateSchedule(
      modules,
      [[{ name: 'Essay', percentageInput: '100', startDate: '2025-01-15', deadline: '2025-01-31' }]],
      dailySchedule,
    )
    for (const s of sessions) {
      expect(s.date >= '2025-01-15').toBe(true)
    }
  })

  it('allocates hours proportionally by assessment weight', () => {
    // 1 module, 2 assessments (50% each), 1h/day, period Jan 1–10 = 10h total
    // Both assessments get 5h each
    const modules: ModuleSummary[] = [{ name: 'Maths', cats: 20, assessmentCount: 2 }]
    const { sessions, warnings } = generateSchedule(
      modules,
      [[
        { name: 'Essay', percentageInput: '50', startDate: '2025-01-01', deadline: '2025-01-05' },
        { name: 'Exam', percentageInput: '50', startDate: '2025-01-01', deadline: '2025-01-10' },
      ]],
      dailySchedule,
    )
    expect(warnings).toEqual([])
    const totalEssay = sessions
      .filter((s) => s.assessmentName === 'Essay')
      .reduce((sum, s) => sum + s.hours, 0)
    const totalExam = sessions
      .filter((s) => s.assessmentName === 'Exam')
      .reduce((sum, s) => sum + s.hours, 0)
    expect(totalEssay).toBeCloseTo(5, 5)
    expect(totalExam).toBeCloseTo(5, 5)
  })

  it('weights allocation by module CATS value across multiple modules', () => {
    // Module A: 30 cats; Module B: 10 cats; total = 40
    // A's assessment fraction = 1.0 * 30/40 = 0.75 → 6h from 8h total
    // B's assessment fraction = 1.0 * 10/40 = 0.25 → 2h from 8h total
    const modules: ModuleSummary[] = [
      { name: 'A', cats: 30, assessmentCount: 1 },
      { name: 'B', cats: 10, assessmentCount: 1 },
    ]
    const { sessions, warnings } = generateSchedule(
      modules,
      [
        [{ name: 'AssA', percentageInput: '100', startDate: '2025-01-01', deadline: '2025-01-08' }],
        [{ name: 'AssB', percentageInput: '100', startDate: '2025-01-01', deadline: '2025-01-08' }],
      ],
      dailySchedule,
    )
    expect(warnings).toEqual([])
    const hoursA = sessions
      .filter((s) => s.moduleName === 'A')
      .reduce((sum, s) => sum + s.hours, 0)
    const hoursB = sessions
      .filter((s) => s.moduleName === 'B')
      .reduce((sum, s) => sum + s.hours, 0)
    expect(hoursA).toBeCloseTo(6, 5)
    expect(hoursB).toBeCloseTo(2, 5)
  })

  it('sorts assessments by deadline ascending before scheduling', () => {
    // "Early" has an earlier deadline so it should appear first in sessions
    const modules: ModuleSummary[] = [{ name: 'Maths', cats: 20, assessmentCount: 2 }]
    const { sessions } = generateSchedule(
      modules,
      [[
        { name: 'Late', percentageInput: '50', startDate: '2025-01-01', deadline: '2025-01-10' },
        { name: 'Early', percentageInput: '50', startDate: '2025-01-01', deadline: '2025-01-06' },
      ]],
      dailySchedule,
    )
    const earlyIdx = sessions.findIndex((s) => s.assessmentName === 'Early')
    const lateIdx = sessions.findIndex((s) => s.assessmentName === 'Late')
    expect(earlyIdx).toBeLessThan(lateIdx)
  })

  it('schedules blocks contiguously without interleaving', () => {
    const modules: ModuleSummary[] = [{ name: 'Maths', cats: 20, assessmentCount: 2 }]
    const { sessions, warnings } = generateSchedule(
      modules,
      [[
        { name: 'A', percentageInput: '50', startDate: '2025-01-01', deadline: '2025-01-14' },
        { name: 'B', percentageInput: '50', startDate: '2025-01-01', deadline: '2025-01-14' },
      ]],
      dailySchedule,
    )
    expect(warnings).toEqual([])
    const aDates = sessions.filter((s) => s.assessmentName === 'A').map((s) => s.date)
    const bDates = sessions.filter((s) => s.assessmentName === 'B').map((s) => s.date)
    // No shared dates
    for (const date of aDates) {
      expect(bDates).not.toContain(date)
    }
    // A finishes before B starts
    const aLast = aDates[aDates.length - 1]!
    const bFirst = bDates[0]!
    expect(aLast < bFirst).toBe(true)
  })

  it('respects the assessment start date as the earliest block start', () => {
    // Assessment B has a later start date: no session before 2025-01-10
    const modules: ModuleSummary[] = [{ name: 'Maths', cats: 20, assessmentCount: 2 }]
    const { sessions } = generateSchedule(
      modules,
      [[
        { name: 'A', percentageInput: '50', startDate: '2025-01-01', deadline: '2025-01-05' },
        { name: 'B', percentageInput: '50', startDate: '2025-01-10', deadline: '2025-01-20' },
      ]],
      dailySchedule,
    )
    const bSessions = sessions.filter((s) => s.assessmentName === 'B')
    expect(bSessions.length).toBeGreaterThan(0)
    for (const s of bSessions) {
      expect(s.date >= '2025-01-10').toBe(true)
    }
  })

  it('issues a warning when the block overruns the deadline', () => {
    // Only Mondays are available (0.5h each); period Jan 6–8 has one Monday = 0.5h
    // Assessment needs all available hours = 0.5h; actually this would be fine.
    // So set up two assessments where the first eats all the time for the second:
    // Both share the same deadline and start; A sorts first (fewer hours) and takes all early days,
    // leaving B with no time before its deadline.
    // Simpler: 1 assessment needing more hours than are available in its window.
    // Module: 10 cats, 2 assessments (50%/50%) deadlines: A = Jan 2, B = Jan 10
    // Schedule: 2h/day; period Jan 1 – Jan 10 = 10 days = 20h total
    // A gets 10h, but A's deadline is Jan 2 → only 2 days → 4h available → warning
    const modules: ModuleSummary[] = [{ name: 'Maths', cats: 20, assessmentCount: 2 }]
    const { warnings } = generateSchedule(
      modules,
      [[
        { name: 'TightA', percentageInput: '50', startDate: '2025-01-01', deadline: '2025-01-02' },
        { name: 'WideB', percentageInput: '50', startDate: '2025-01-01', deadline: '2025-01-10' },
      ]],
      // 2h/day every day
      Array.from({ length: 7 }, () => ({ enabled: true, hoursInput: '2', minutesInput: '0' })),
    )
    expect(warnings).toHaveLength(1)
    expect(warnings[0]!.assessmentName).toBe('TightA')
  })

  it('produces a partial session on the last day of a block', () => {
    // 3 days at 0.5h/day = 1.5h total; 1 assessment gets all 1.5h
    // 2025-01-06 Mon, 2025-01-07 Tue, 2025-01-08 Wed
    const halfHourSchedule: WeeklySchedule = [
      { enabled: true, hoursInput: '0', minutesInput: '30' }, // Mon
      { enabled: true, hoursInput: '0', minutesInput: '30' }, // Tue
      { enabled: true, hoursInput: '0', minutesInput: '30' }, // Wed
      ...Array.from({ length: 4 }, () => ({
        enabled: false,
        hoursInput: '0',
        minutesInput: '0',
      })),
    ]
    const modules: ModuleSummary[] = [{ name: 'Maths', cats: 20, assessmentCount: 1 }]
    const { sessions, warnings } = generateSchedule(
      modules,
      [[{ name: 'Essay', percentageInput: '100', startDate: '2025-01-06', deadline: '2025-01-08' }]],
      halfHourSchedule,
    )
    expect(warnings).toEqual([])
    expect(sessions).toHaveLength(3)
    const total = sessions.reduce((sum, s) => sum + s.hours, 0)
    expect(total).toBeCloseTo(1.5, 5)
  })

  it('attaches the correct module and assessment names to each session', () => {
    const modules: ModuleSummary[] = [{ name: 'Physics', cats: 20, assessmentCount: 1 }]
    const { sessions } = generateSchedule(
      modules,
      [[{ name: 'Lab Report', percentageInput: '100', startDate: '2025-01-01', deadline: '2025-01-07' }]],
      dailySchedule,
    )
    for (const s of sessions) {
      expect(s.moduleName).toBe('Physics')
      expect(s.assessmentName).toBe('Lab Report')
    }
  })
})
