import { useWizardContext } from '../context/WizardContext'

interface UseModuleCountResult {
  value: string
  count: number | null
  isValid: boolean
  setValue: (value: string) => void
}

export function useModuleCount(): UseModuleCountResult {
  const { numberOfModules, setNumberOfModules } = useWizardContext()
  const num = Number(numberOfModules)
  const isValid = numberOfModules.trim() !== '' && Number.isInteger(num) && num >= 1
  const count = isValid ? num : null
  return { value: numberOfModules, count, isValid, setValue: setNumberOfModules }
}
