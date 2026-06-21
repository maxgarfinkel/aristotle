import type { ModuleSummary, AssessmentFormEntry } from '../types/module'
import type { WeeklySchedule, StudySession, ScheduleResult, ScheduleWarning } from '../types/schedule'

interface AssessmentItem {
  moduleName: string
  assessmentName: string
  startDate: string
  deadline: string
  moduleCats: number
  percentage: number
  allocatedHours: number
}

function nextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().substring(0, 10)
}

function dayOfWeekIndex(dateStr: string): number {
  // Returns 0 for Monday through 6 for Sunday, matching WeeklySchedule indices
  const d = new Date(dateStr + 'T00:00:00Z')
  return (d.getUTCDay() + 6) % 7
}

function hoursForDay(schedule: WeeklySchedule, dow: number): number {
  const entry = schedule[dow]
  if (!entry?.enabled) return 0
  const hours = Number(entry.hoursInput) || 0
  const minutes = Number(entry.minutesInput) || 0
  return hours + minutes / 60
}

export function generateSchedule(
  modules: ModuleSummary[],
  assessmentEntries: AssessmentFormEntry[][],
  schedule: WeeklySchedule,
): ScheduleResult {
  const totalCats = modules.reduce((sum, m) => sum + m.cats, 0)

  const items: AssessmentItem[] = []
  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i]!
    for (const entry of assessmentEntries[i] ?? []) {
      items.push({
        moduleName: mod.name,
        assessmentName: entry.name,
        startDate: entry.startDate,
        deadline: entry.deadline,
        moduleCats: mod.cats,
        percentage: Number(entry.percentageInput),
        allocatedHours: 0,
      })
    }
  }

  if (items.length === 0 || totalCats === 0) {
    return { sessions: [], warnings: [] }
  }

  const earliestStart = items.reduce(
    (min, a) => (a.startDate < min ? a.startDate : min),
    items[0]!.startDate,
  )
  const latestDeadline = items.reduce(
    (max, a) => (a.deadline > max ? a.deadline : max),
    items[0]!.deadline,
  )

  let totalAvailableHours = 0
  let d = earliestStart
  while (d <= latestDeadline) {
    totalAvailableHours += hoursForDay(schedule, dayOfWeekIndex(d))
    d = nextDay(d)
  }

  for (const item of items) {
    const fraction = (item.percentage / 100) * (item.moduleCats / totalCats)
    item.allocatedHours = fraction * totalAvailableHours
  }

  items.sort((a, b) => {
    if (a.deadline !== b.deadline) return a.deadline < b.deadline ? -1 : 1
    return a.allocatedHours - b.allocatedHours
  })

  const sessions: StudySession[] = []
  const warnings: ScheduleWarning[] = []
  let cursor = earliestStart

  for (const item of items) {
    let date = item.startDate > cursor ? item.startDate : cursor
    let remaining = item.allocatedHours

    while (remaining > 1e-9) {
      if (date > item.deadline) {
        warnings.push({
          moduleName: item.moduleName,
          assessmentName: item.assessmentName,
          message: `${remaining.toFixed(1)} hours could not be scheduled before the deadline.`,
        })
        break
      }

      const available = hoursForDay(schedule, dayOfWeekIndex(date))
      if (available > 0) {
        const sessionHours = Math.min(available, remaining)
        sessions.push({
          date,
          moduleName: item.moduleName,
          assessmentName: item.assessmentName,
          hours: sessionHours,
        })
        remaining -= sessionHours
      }

      date = nextDay(date)
    }

    cursor = date
  }

  return { sessions, warnings }
}
