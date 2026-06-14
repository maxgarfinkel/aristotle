import { renderHook, act } from '@testing-library/react'
import { createElement } from 'react'
import WizardProvider from '../context/WizardProvider'
import { useModuleCount } from './useModuleCount'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(WizardProvider, null, children)

describe('useModuleCount', () => {
  it('starts with an empty value and invalid state', () => {
    const { result } = renderHook(() => useModuleCount(), { wrapper })
    expect(result.current.value).toBe('')
    expect(result.current.isValid).toBe(false)
    expect(result.current.count).toBeNull()
  })

  it('is invalid for zero', () => {
    const { result } = renderHook(() => useModuleCount(), { wrapper })
    act(() => result.current.setValue('0'))
    expect(result.current.isValid).toBe(false)
    expect(result.current.count).toBeNull()
  })

  it('is invalid for negative numbers', () => {
    const { result } = renderHook(() => useModuleCount(), { wrapper })
    act(() => result.current.setValue('-1'))
    expect(result.current.isValid).toBe(false)
  })

  it('is invalid for a decimal', () => {
    const { result } = renderHook(() => useModuleCount(), { wrapper })
    act(() => result.current.setValue('1.5'))
    expect(result.current.isValid).toBe(false)
  })

  it('is invalid for non-numeric input', () => {
    const { result } = renderHook(() => useModuleCount(), { wrapper })
    act(() => result.current.setValue('abc'))
    expect(result.current.isValid).toBe(false)
  })

  it('is valid for 1 and returns count of 1', () => {
    const { result } = renderHook(() => useModuleCount(), { wrapper })
    act(() => result.current.setValue('1'))
    expect(result.current.isValid).toBe(true)
    expect(result.current.count).toBe(1)
  })

  it('is valid for a positive integer and returns the correct count', () => {
    const { result } = renderHook(() => useModuleCount(), { wrapper })
    act(() => result.current.setValue('6'))
    expect(result.current.isValid).toBe(true)
    expect(result.current.count).toBe(6)
  })
})
