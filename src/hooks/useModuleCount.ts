import { useWizardContext } from '../context/WizardContext'
import { moduleCountSchema } from '../services/schemas'

interface UseModuleCountResult {
  value: string
  count: number | null
  isValid: boolean
  setValue: (value: string) => void
}

export function useModuleCount(): UseModuleCountResult {
  const { numberOfModules, setNumberOfModules } = useWizardContext()
  const isValid = moduleCountSchema.safeParse(numberOfModules).success
  const count = isValid ? Number(numberOfModules) : null
  return { value: numberOfModules, count, isValid, setValue: setNumberOfModules }
}
