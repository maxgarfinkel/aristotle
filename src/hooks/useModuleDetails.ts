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
  const { modules, setModules } = useWizardContext()

  // Reconcile context module count with the URL ?count param.
  // Uses the functional setState form so we read the latest state without
  // listing modules as a dep (which would re-run on every keystroke).
  // New modules are initialised with an empty assessments array, which
  // useAssessmentDetails will populate when the user reaches that step.
  useEffect(() => {
    setModules((current) => {
      if (current.length === count) return current
      return count > current.length
        ? [
            ...current,
            ...Array.from({ length: count - current.length }, () => ({
              name: '',
              catsInput: '',
              assessmentsInput: '',
              assessments: [],
            })),
          ]
        : current.slice(0, count)
    })
  }, [count, setModules])

  const isValid =
    modules.length > 0 &&
    modules.every((e) => {
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
    setModules((prev) => prev.map((e, i) => (i === index ? { ...e, name } : e)))
  }

  const updateCats = (index: number, catsInput: string) => {
    setModules((prev) => prev.map((e, i) => (i === index ? { ...e, catsInput } : e)))
  }

  const updateAssessments = (index: number, assessmentsInput: string) => {
    setModules((prev) => prev.map((e, i) => (i === index ? { ...e, assessmentsInput } : e)))
  }

  // Strip assessments from each module before returning — this hook's public
  // interface exposes ModuleFormEntry[], not the richer WizardModule type.
  return {
    entries: modules.map(({ name, catsInput, assessmentsInput }) => ({ name, catsInput, assessmentsInput })),
    isValid,
    updateName,
    updateCats,
    updateAssessments,
  }
}
