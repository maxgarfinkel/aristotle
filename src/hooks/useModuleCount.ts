import { useWizardContext } from '../context/WizardContext'

interface UseModuleCountResult {
  value: string
  count: number | null
  isValid: boolean
  setValue: (value: string) => void
}

export function useModuleCount(): UseModuleCountResult {
  const { countInput, setCountInput } = useWizardContext()
  const num = Number(countInput)
  const isValid = countInput.trim() !== '' && Number.isInteger(num) && num >= 1
  const count = isValid ? num : null
  return { value: countInput, count, isValid, setValue: setCountInput }
}
