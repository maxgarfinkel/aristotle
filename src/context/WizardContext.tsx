import { createContext, useContext } from 'react'
import type { ModuleFormEntry, AssessmentFormEntry } from '../types/module'
import type { WeeklySchedule } from '../types/schedule'

export interface WizardState {
  countInput: string
  moduleEntries: ModuleFormEntry[]
  assessmentEntries: AssessmentFormEntry[][]
  schedule: WeeklySchedule
}

export interface WizardContextValue extends WizardState {
  setCountInput: (value: string) => void
  setModuleEntries: (
    entries: ModuleFormEntry[] | ((prev: ModuleFormEntry[]) => ModuleFormEntry[]),
  ) => void
  setAssessmentEntries: (
    entries:
      | AssessmentFormEntry[][]
      | ((prev: AssessmentFormEntry[][]) => AssessmentFormEntry[][]),
  ) => void
  toggleScheduleDay: (dayIndex: number) => void
  updateScheduleDay: (dayIndex: number, field: 'hoursInput' | 'minutesInput', value: string) => void
}

export const WizardContext = createContext<WizardContextValue | null>(null)

export const defaultWizardState: WizardState = {
  countInput: '',
  moduleEntries: [],
  assessmentEntries: [],
  // 7 days (Mon–Sun), all enabled, no hours/minutes entered yet
  schedule: Array.from({ length: 7 }, () => ({ enabled: true, hoursInput: '', minutesInput: '' })),
}

export function useWizardContext(): WizardContextValue {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizardContext must be used within WizardProvider')
  return ctx
}
