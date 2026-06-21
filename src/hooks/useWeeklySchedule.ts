import { useWizardContext } from '../context/WizardContext'
import type { WeeklySchedule } from '../types/schedule'
import { weeklyScheduleSchema } from '../services/schemas'

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

interface UseWeeklyScheduleResult {
  schedule: WeeklySchedule
  isValid: boolean
  toggleDay: (dayIndex: number) => void
  updateDay: (dayIndex: number, field: 'hoursInput' | 'minutesInput', value: string) => void
}

export function useWeeklySchedule(): UseWeeklyScheduleResult {
  const { weeklySchedule, toggleScheduleDay, updateScheduleDay } = useWizardContext()

  const isValid = weeklyScheduleSchema.safeParse(weeklySchedule).success

  return { schedule: weeklySchedule, isValid, toggleDay: toggleScheduleDay, updateDay: updateScheduleDay }
}
