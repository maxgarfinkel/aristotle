import { useState } from 'react'

interface UseModuleCountResult {
  value: string
  count: number | null
  isValid: boolean
  setValue: (value: string) => void
}

export function useModuleCount(): UseModuleCountResult {
  const [value, setValue] = useState('')
  const num = Number(value)
  const isValid = value.trim() !== '' && Number.isInteger(num) && num >= 1
  const count = isValid ? num : null
  return { value, count, isValid, setValue }
}
