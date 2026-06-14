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
  const { assessmentEntries, setAssessmentEntries } = useWizardContext()

  // Reconcile context assessment rows with the current module structure.
  // Uses the functional setState form so we read the latest stored entries
  // without listing assessmentEntries as a dep (which would re-run on every
  // field edit). Returns the same row reference when length is unchanged so
  // that the provider's identity check avoids a state update.
  useEffect(() => {
    setAssessmentEntries((current) => {
      const reconciled = modules.map((m, i) => {
        const row = current[i] ?? []
        if (row.length === m.assessmentCount) return row
        if (m.assessmentCount < row.length) return row.slice(0, m.assessmentCount)
        return [
          ...row,
          ...Array.from({ length: m.assessmentCount - row.length }, () => ({
            name: '',
            percentageInput: '',
            startDate: tomorrow(),
            deadline: '',
          })),
        ]
      })
      const unchanged =
        reconciled.length === current.length && reconciled.every((row, i) => row === current[i])
      return unchanged ? current : reconciled
    })
  }, [modules, setAssessmentEntries])

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
    setAssessmentEntries((prev) =>
      prev.map((assessments, mi) =>
        mi === moduleIndex
          ? assessments.map((a, ai) => (ai === assessmentIndex ? { ...a, [field]: value } : a))
          : assessments,
      ),
    )
  }

  return { moduleEntries: assessmentEntries, isValid, updateField }
}
