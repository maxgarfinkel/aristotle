import type { ScheduleWizard } from '../types/wizard'
import type { WeeklySchedule } from '../types/schedule'
import type { DayPlanEntry, AssessmentSummary, StudyPlan } from '../types/plan'

function nextDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const next = new Date(Date.UTC(y!, m! - 1, d! + 1))
  return next.toISOString().substring(0, 10)
}

function getDayMinutes(date: string, schedule: WeeklySchedule): number {
  const [y, m, d] = date.split('-').map(Number)
  const jsDay = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay()
  // Convert JS day (0=Sunday) to schedule index (0=Monday, 6=Sunday)
  const scheduleIndex = (jsDay + 6) % 7
  const day = schedule[scheduleIndex]
  if (!day?.enabled) return 0
  const hours = parseInt(day.hoursInput, 10) || 0
  const minutes = parseInt(day.minutesInput, 10) || 0
  return hours * 60 + minutes
}

function computeTotalAvailableMinutes(
  startDate: string,
  endDate: string,
  schedule: WeeklySchedule,
): number {
  let total = 0
  let date = startDate
  while (date <= endDate) {
    total += getDayMinutes(date, schedule)
    date = nextDate(date)
  }
  return total
}

export function buildStudyPlan(wizard: ScheduleWizard): StudyPlan {
  const { modules, weeklySchedule } = wizard

  // Convert form model to domain assessments with computed CATs
  const rawAssessments = modules.flatMap((module) => {
    const moduleCats = parseInt(module.catsInput, 10)
    return module.assessments.map((a) => ({
      moduleName: module.name,
      name: a.name,
      cats: moduleCats * (parseFloat(a.percentageInput) / 100),
      startDate: a.startDate,
      deadline: a.deadline,
    }))
  })

  if (rawAssessments.length === 0) return { dayEntries: [], summaries: [] }

  const totalCats = rawAssessments.reduce((sum, a) => sum + a.cats, 0)
  if (totalCats === 0) return { dayEntries: [], summaries: [] }

  const planStartDate = rawAssessments.reduce(
    (min, a) => (a.startDate < min ? a.startDate : min),
    rawAssessments[0]!.startDate,
  )
  const planEndDate = rawAssessments.reduce(
    (max, a) => (a.deadline > max ? a.deadline : max),
    rawAssessments[0]!.deadline,
  )

  const totalMinutes = computeTotalAvailableMinutes(planStartDate, planEndDate, weeklySchedule)

  // Allocate minutes proportionally by CATs
  const assessments = rawAssessments.map((a) => ({
    ...a,
    minutesAllocated: Math.round((totalMinutes / totalCats) * a.cats),
  }))

  // Sort: earliest deadline first; break ties by smallest allocation first
  const sorted = [...assessments].sort((a, b) => {
    if (a.deadline !== b.deadline) return a.deadline < b.deadline ? -1 : 1
    return a.minutesAllocated - b.minutesAllocated
  })

  const dayEntries: DayPlanEntry[] = []
  const summaries: AssessmentSummary[] = []

  let currentDate = planStartDate
  let minutesUsedToday = 0

  for (const assessment of sorted) {
    // Don't start before the assessment's own start date
    while (currentDate < assessment.startDate) {
      currentDate = nextDate(currentDate)
      minutesUsedToday = 0
    }

    let remaining = assessment.minutesAllocated
    let finishDate = currentDate

    while (remaining > 0) {
      const dayCapacity = getDayMinutes(currentDate, weeklySchedule)
      const dayAvailable = Math.max(0, dayCapacity - minutesUsedToday)

      if (dayAvailable > 0) {
        const spent = Math.min(remaining, dayAvailable)
        dayEntries.push({
          date: currentDate,
          moduleName: assessment.moduleName,
          assessmentName: assessment.name,
          minutesSpent: spent,
        })
        remaining -= spent
        finishDate = currentDate
        minutesUsedToday += spent

        if (minutesUsedToday >= dayCapacity) {
          currentDate = nextDate(currentDate)
          minutesUsedToday = 0
        }
        // else: time remains on this day; next assessment may start here
      } else {
        currentDate = nextDate(currentDate)
        minutesUsedToday = 0
      }
    }

    summaries.push({
      moduleName: assessment.moduleName,
      assessmentName: assessment.name,
      finishDate,
      totalMinutes: assessment.minutesAllocated,
    })
  }

  return { dayEntries, summaries }
}
