import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import type { WizardModule } from '../types/module'
import type { ScheduleWizard } from '../types/wizard'
import { WizardContext, defaultScheduleWizard } from './WizardContext'

interface WizardProviderProps {
  children: ReactNode
  initialState?: Partial<ScheduleWizard>
}

export default function WizardProvider({ children, initialState }: WizardProviderProps) {
  const [state, setState] = useState<ScheduleWizard>(() => ({
    ...defaultScheduleWizard,
    ...initialState,
  }))

  const setNumberOfModules = useCallback((value: string) => {
    setState((prev) => ({ ...prev, numberOfModules: value }))
  }, [])

  // Accepts a plain array or a functional updater (for reconciliation in hooks).
  // Returns prev unchanged when modules haven't changed so React bails out.
  const setModules = useCallback(
    (modulesOrUpdater: WizardModule[] | ((prev: WizardModule[]) => WizardModule[])) => {
      setState((prev) => {
        const next =
          typeof modulesOrUpdater === 'function'
            ? modulesOrUpdater(prev.modules)
            : modulesOrUpdater
        if (next === prev.modules) return prev
        return { ...prev, modules: next }
      })
    },
    [],
  )

  const toggleScheduleDay = useCallback((dayIndex: number) => {
    setState((prev) => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((day, i) =>
        i === dayIndex ? { ...day, enabled: !day.enabled } : day,
      ),
    }))
  }, [])

  const updateScheduleDay = useCallback(
    (dayIndex: number, field: 'hoursInput' | 'minutesInput', value: string) => {
      setState((prev) => ({
        ...prev,
        weeklySchedule: prev.weeklySchedule.map((day, i) =>
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
        setNumberOfModules,
        setModules,
        toggleScheduleDay,
        updateScheduleDay,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}
