import { z } from 'zod'

/** A non-empty string of digits that represents a positive integer ≥ 1. */
const positiveIntegerStr = z.string().refine((v) => {
  const n = Number(v)
  return v.trim() !== '' && Number.isInteger(n) && n >= 1
})

export const moduleCountSchema = z.string().refine((v) => {
  const n = Number(v)
  return v.trim() !== '' && Number.isInteger(n) && n >= 1
})

export const moduleFormEntrySchema = z.object({
  name: z.string().trim().min(1),
  catsInput: positiveIntegerStr,
  assessmentsInput: positiveIntegerStr,
})

export const assessmentFormEntrySchema = z
  .object({
    name: z.string().trim().min(1),
    percentageInput: z.string().refine((v) => {
      const n = Number(v)
      return n > 0 && n <= 100
    }),
    startDate: z.string().min(1),
    deadline: z.string().min(1),
  })
  .refine((d) => d.deadline > d.startDate)

const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  hoursInput: z.string(),
  minutesInput: z.string(),
})

export const weeklyScheduleSchema = z
  .array(dayScheduleSchema)
  .refine((days) => days.some((d) => d.enabled))
  .refine((days) =>
    days
      .filter((d) => d.enabled)
      .every((d) => {
        const h = Number(d.hoursInput)
        const m = Number(d.minutesInput)
        return (
          Number.isInteger(h) &&
          h >= 0 &&
          Number.isInteger(m) &&
          m >= 0 &&
          m <= 59 &&
          (h > 0 || m > 0)
        )
      }),
  )
