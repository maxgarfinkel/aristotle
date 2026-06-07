import { useState } from 'react'
import type { WeeklySchedule } from '../types/schedule'

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
  const [schedule, setSchedule] = useState<WeeklySchedule>(() =>
    DAYS_OF_WEEK.map(() => ({
      enabled: true,
      hoursInput: '',
      minutesInput: '',
    })),
  )

  const isValid =
    schedule.some((day) => day.enabled) &&
    schedule
      .filter((day) => day.enabled)
      .every((day) => {
        const hours = Number(day.hoursInput)
        const minutes = Number(day.minutesInput)
        return (
          Number.isInteger(hours) &&
          hours >= 0 &&
          Number.isInteger(minutes) &&
          minutes >= 0 &&
          minutes <= 59 &&
          (hours > 0 || minutes > 0)
        )
      })

  const toggleDay = (dayIndex: number) => {
    setSchedule((prev) =>
      prev.map((day, i) => (i === dayIndex ? { ...day, enabled: !day.enabled } : day)),
    )
  }

  const updateDay = (dayIndex: number, field: 'hoursInput' | 'minutesInput', value: string) => {
    setSchedule((prev) =>
      prev.map((day, i) => (i === dayIndex ? { ...day, [field]: value } : day)),
    )
  }

  return { schedule, isValid, toggleDay, updateDay }
}
