import { useEffect } from 'react'
import type { ModuleSummary, AssessmentFormEntry } from '../types/module'
import { useWizardContext } from '../context/WizardContext'

interface UseAssessmentDetailsResult {
  moduleEntries: AssessmentFormEntry[][]
  isValid: boolean
  updateField: (
    moduleIndex: number,
    assessmentIndex: number,
    field: keyof AssessmentFormEntry,
    value: string,
  ) => void
}

function tomorrow(): string {
  const now = new Date()
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  return next.toISOString().substring(0, 10)
}

export function useAssessmentDetails(modules: ModuleSummary[]): UseAssessmentDetailsResult {
  // Renamed to avoid shadowing the `modules` parameter above.
  const { modules: wizardModules, setModules } = useWizardContext()

  // Reconcile each module's assessments array with the count from ModuleSummary.
  // Uses the functional setState form so we read the latest stored entries
  // without listing wizardModules as a dep (which would re-run on every edit).
  // Returns the same module reference when its assessments are already correct,
  // so the provider's identity check avoids unnecessary re-renders.
  useEffect(() => {
    setModules((current) => {
      const reconciled = modules.map((m, i) => {
        const wizardModule = current[i] ?? {
          name: '',
          catsInput: '',
          assessmentsInput: '',
          assessments: [],
        }
        const row = wizardModule.assessments
        if (row.length === m.assessmentCount) return wizardModule
        const newAssessments =
          m.assessmentCount < row.length
            ? row.slice(0, m.assessmentCount)
            : [
                ...row,
                ...Array.from({ length: m.assessmentCount - row.length }, () => ({
                  name: '',
                  percentageInput: '',
                  startDate: tomorrow(),
                  deadline: '',
                })),
              ]
        return { ...wizardModule, assessments: newAssessments }
      })
      const unchanged =
        reconciled.length === current.length && reconciled.every((m, i) => m === current[i])
      return unchanged ? current : reconciled
    })
  }, [modules, setModules])

  const assessmentEntries = wizardModules.map((m) => m.assessments)

  const isValid =
    assessmentEntries.length > 0 &&
    assessmentEntries.every((assessments) => {
      if (assessments.length === 0) return false
      return assessments.every((a) => {
        const pct = Number(a.percentageInput)
        return (
          a.name.trim() !== '' &&
          pct > 0 &&
          pct <= 100 &&
          a.deadline !== '' &&
          a.deadline > a.startDate
        )
      })
    })

  const updateField = (
    moduleIndex: number,
    assessmentIndex: number,
    field: keyof AssessmentFormEntry,
    value: string,
  ) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === moduleIndex
          ? {
              ...m,
              assessments: m.assessments.map((a, ai) =>
                ai === assessmentIndex ? { ...a, [field]: value } : a,
              ),
            }
          : m,
      ),
    )
  }

  return { moduleEntries: assessmentEntries, isValid, updateField }
}
