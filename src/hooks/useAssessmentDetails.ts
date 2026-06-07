import { useState } from 'react'
import type { ModuleSummary, AssessmentFormEntry } from '../types/module'

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
  const [moduleEntries, setModuleEntries] = useState<AssessmentFormEntry[][]>(() =>
    modules.map((m) =>
      Array.from({ length: m.assessmentCount }, () => ({
        name: '',
        percentageInput: '',
        startDate: tomorrow(),
        deadline: '',
      })),
    ),
  )

  const isValid = moduleEntries.every((assessments) => {
    if (assessments.length === 0) return false
    const allFieldsValid = assessments.every((a) => {
      const pct = Number(a.percentageInput)
      return (
        a.name.trim() !== '' &&
        pct > 0 &&
        pct <= 100 &&
        a.deadline !== '' &&
        a.deadline > a.startDate
      )
    })
    const sum = assessments.reduce((s, a) => s + Number(a.percentageInput), 0)
    return allFieldsValid && Math.abs(sum - 100) < 0.01
  })

  const updateField = (
    moduleIndex: number,
    assessmentIndex: number,
    field: keyof AssessmentFormEntry,
    value: string,
  ) => {
    setModuleEntries((prev) =>
      prev.map((assessments, mi) =>
        mi === moduleIndex
          ? assessments.map((a, ai) => (ai === assessmentIndex ? { ...a, [field]: value } : a))
          : assessments,
      ),
    )
  }

  return { moduleEntries, isValid, updateField }
}
