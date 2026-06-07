/**
 * A single day's study availability.
 *
 * Extensibility note: when week-on-week variation is added, wrap
 * this in a WeeklySchedule and store WeeklySchedule[] per user.
 */
export interface DaySchedule {
  enabled: boolean
  hoursInput: string
  minutesInput: string
}

/**
 * One week's study availability (7 days, Monday–Sunday).
 * Currently a fixed single instance; will become WeeklySchedule[]
 * when per-week variation is supported.
 */
export type WeeklySchedule = DaySchedule[]
