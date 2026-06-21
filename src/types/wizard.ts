import type { WizardModule } from './module'
import type { WeeklySchedule } from './schedule'

export interface ScheduleWizard {
  numberOfModules: string
  modules: WizardModule[]
  weeklySchedule: WeeklySchedule
}
