import { useState } from 'react'
import type { ModuleFormEntry } from '../types/module'

interface UseModuleDetailsResult {
  entries: ModuleFormEntry[]
  isValid: boolean
  updateName: (index: number, name: string) => void
  updateCats: (index: number, catsInput: string) => void
  updateAssessments: (index: number, assessmentsInput: string) => void
}

export function useModuleDetails(count: number): UseModuleDetailsResult {
  const [entries, setEntries] = useState<ModuleFormEntry[]>(() =>
    Array.from({ length: count }, () => ({ name: '', catsInput: '', assessmentsInput: '' })),
  )

  const isValid = entries.every((e) => {
    const cats = Number(e.catsInput)
    const assessments = Number(e.assessmentsInput)
    return (
      e.name.trim() !== '' &&
      Number.isInteger(cats) && cats >= 1 &&
      Number.isInteger(assessments) && assessments >= 1
    )
  })

  const updateName = (index: number, name: string) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, name } : e)))
  }

  const updateCats = (index: number, catsInput: string) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, catsInput } : e)))
  }

  const updateAssessments = (index: number, assessmentsInput: string) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, assessmentsInput } : e)))
  }

  return { entries, isValid, updateName, updateCats, updateAssessments }
}
