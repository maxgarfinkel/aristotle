import { useEffect } from 'react'
import type { ModuleFormEntry } from '../types/module'
import { useWizardContext } from '../context/WizardContext'

interface UseModuleDetailsResult {
  entries: ModuleFormEntry[]
  isValid: boolean
  updateName: (index: number, name: string) => void
  updateCats: (index: number, catsInput: string) => void
  updateAssessments: (index: number, assessmentsInput: string) => void
}

export function useModuleDetails(count: number): UseModuleDetailsResult {
  const { moduleEntries, setModuleEntries } = useWizardContext()

  // Reconcile context entry count with the URL ?count param.
  // Uses the functional setState form so we read the latest state without
  // listing moduleEntries as a dep (which would re-run on every keystroke).
  useEffect(() => {
    setModuleEntries((current) => {
      if (current.length === count) return current
      return count > current.length
        ? [
            ...current,
            ...Array.from({ length: count - current.length }, () => ({
              name: '',
              catsInput: '',
              assessmentsInput: '',
            })),
          ]
        : current.slice(0, count)
    })
  }, [count, setModuleEntries])

  const isValid =
    moduleEntries.length > 0 &&
    moduleEntries.every((e) => {
      const cats = Number(e.catsInput)
      const assessments = Number(e.assessmentsInput)
      return (
        e.name.trim() !== '' &&
        Number.isInteger(cats) &&
        cats >= 1 &&
        Number.isInteger(assessments) &&
        assessments >= 1
      )
    })

  const updateName = (index: number, name: string) => {
    setModuleEntries((prev) => prev.map((e, i) => (i === index ? { ...e, name } : e)))
  }

  const updateCats = (index: number, catsInput: string) => {
    setModuleEntries((prev) => prev.map((e, i) => (i === index ? { ...e, catsInput } : e)))
  }

  const updateAssessments = (index: number, assessmentsInput: string) => {
    setModuleEntries((prev) => prev.map((e, i) => (i === index ? { ...e, assessmentsInput } : e)))
  }

  return { entries: moduleEntries, isValid, updateName, updateCats, updateAssessments }
}
