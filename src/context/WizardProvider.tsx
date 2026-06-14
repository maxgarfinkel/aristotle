import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import type { ModuleFormEntry, AssessmentFormEntry } from '../types/module'
import { WizardContext, defaultWizardState } from './WizardContext'
import type { WizardState } from './WizardContext'

interface WizardProviderProps {
  children: ReactNode
  initialState?: Partial<WizardState>
}

export default function WizardProvider({ children, initialState }: WizardProviderProps) {
  const [state, setState] = useState<WizardState>(() => ({
    ...defaultWizardState,
    ...initialState,
  }))

  const setCountInput = useCallback((value: string) => {
    setState((prev) => ({ ...prev, countInput: value }))
  }, [])

  // Accepts a plain array or a functional updater (for reconciliation in hooks).
  // Also keeps assessmentEntries length aligned with the resulting module array.
  // Returns prev unchanged when moduleEntries haven't changed so React bails out.
  const setModuleEntries = useCallback(
    (entriesOrUpdater: ModuleFormEntry[] | ((prev: ModuleFormEntry[]) => ModuleFormEntry[])) => {
      setState((prev) => {
        const newEntries =
          typeof entriesOrUpdater === 'function'
            ? entriesOrUpdater(prev.moduleEntries)
            : entriesOrUpdater
        if (newEntries === prev.moduleEntries) return prev
        return {
          ...prev,
          moduleEntries: newEntries,
          assessmentEntries: newEntries.map((_, i) => prev.assessmentEntries[i] ?? []),
        }
      })
    },
    [],
  )

  // Returns prev unchanged when assessmentEntries haven't changed so React bails out.
  const setAssessmentEntries = useCallback(
    (
      entriesOrUpdater:
        | AssessmentFormEntry[][]
        | ((prev: AssessmentFormEntry[][]) => AssessmentFormEntry[][]),
    ) => {
      setState((prev) => {
        const next =
          typeof entriesOrUpdater === 'function'
            ? entriesOrUpdater(prev.assessmentEntries)
            : entriesOrUpdater
        if (next === prev.assessmentEntries) return prev
        return { ...prev, assessmentEntries: next }
      })
    },
    [],
  )

  const toggleScheduleDay = useCallback((dayIndex: number) => {
    setState((prev) => ({
      ...prev,
      schedule: prev.schedule.map((day, i) =>
        i === dayIndex ? { ...day, enabled: !day.enabled } : day,
      ),
    }))
  }, [])

  const updateScheduleDay = useCallback(
    (dayIndex: number, field: 'hoursInput' | 'minutesInput', value: string) => {
      setState((prev) => ({
        ...prev,
        schedule: prev.schedule.map((day, i) =>
          i === dayIndex ? { ...day, [field]: value } : day,
        ),
      }))
    },
    [],
  )

  return (
    <WizardContext.Provider
      value={{
        ...state,
        setCountInput,
        setModuleEntries,
        setAssessmentEntries,
        toggleScheduleDay,
        updateScheduleDay,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}
