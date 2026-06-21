import { useWizardContext } from '../context/WizardContext'
import { buildStudyPlan } from '../services/planService'
import type { StudyPlan } from '../types/plan'

export function useStudyPlan(): StudyPlan {
  const wizard = useWizardContext()
  return buildStudyPlan(wizard)
}
