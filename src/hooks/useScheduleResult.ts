import { useWizardContext } from '../context/WizardContext'
import { generateSchedule } from '../services/scheduler'
import type { ModuleSummary } from '../types/module'
import type { ScheduleResult } from '../types/schedule'

export function useScheduleResult(modules: ModuleSummary[]): ScheduleResult {
  const { assessmentEntries, schedule } = useWizardContext()
  return generateSchedule(modules, assessmentEntries, schedule)
}
