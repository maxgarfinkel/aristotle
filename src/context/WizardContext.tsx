import { createContext, useContext } from 'react'
import type { WizardModule } from '../types/module'
import type { ScheduleWizard } from '../types/wizard'

export type { ScheduleWizard }

export interface WizardContextValue extends ScheduleWizard {
  setNumberOfModules: (value: string) => void
  setModules: (modules: WizardModule[] | ((prev: WizardModule[]) => WizardModule[])) => void
  toggleScheduleDay: (dayIndex: number) => void
  updateScheduleDay: (dayIndex: number, field: 'hoursInput' | 'minutesInput', value: string) => void
}

export const WizardContext = createContext<WizardContextValue | null>(null)

export const defaultScheduleWizard: ScheduleWizard = {
  numberOfModules: '',
  modules: [],
  // 7 days (Mon–Sun), all enabled, no hours/minutes entered yet
  weeklySchedule: Array.from({ length: 7 }, () => ({ enabled: true, hoursInput: '', minutesInput: '' })),
}

export function useWizardContext(): WizardContextValue {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizardContext must be used within WizardProvider')
  return ctx
}
