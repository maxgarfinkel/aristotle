import { renderHook, act } from '@testing-library/react'
import { createElement } from 'react'
import WizardProvider from '../context/WizardProvider'
import { useModuleDetails } from './useModuleDetails'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(WizardProvider, null, children)

describe('useModuleDetails', () => {
  it('initialises with the correct number of empty entries', () => {
    const { result } = renderHook(() => useModuleDetails(3), { wrapper })
    expect(result.current.entries).toHaveLength(3)
    expect(result.current.entries[0]).toEqual({ name: '', catsInput: '', assessmentsInput: '' })
  })

  it('is invalid when all fields are empty', () => {
    const { result } = renderHook(() => useModuleDetails(2), { wrapper })
    expect(result.current.isValid).toBe(false)
  })

  it('updateName updates the correct entry', () => {
    const { result } = renderHook(() => useModuleDetails(2), { wrapper })
    act(() => result.current.updateName(0, 'Mathematics'))
    expect(result.current.entries[0]).toEqual({ name: 'Mathematics', catsInput: '', assessmentsInput: '' })
    expect(result.current.entries[1]).toEqual({ name: '', catsInput: '', assessmentsInput: '' })
  })

  it('updateCats updates the correct entry', () => {
    const { result } = renderHook(() => useModuleDetails(2), { wrapper })
    act(() => result.current.updateCats(1, '30'))
    expect(result.current.entries[1]).toEqual({ name: '', catsInput: '30', assessmentsInput: '' })
  })

  it('updateAssessments updates the correct entry', () => {
    const { result } = renderHook(() => useModuleDetails(2), { wrapper })
    act(() => result.current.updateAssessments(0, '4'))
    expect(result.current.entries[0]).toEqual({ name: '', catsInput: '', assessmentsInput: '4' })
  })

  it('is valid when all entries have a name, positive integer CATS, and positive integer assessments', () => {
    const { result } = renderHook(() => useModuleDetails(2), { wrapper })
    act(() => {
      result.current.updateName(0, 'Maths')
      result.current.updateCats(0, '30')
      result.current.updateAssessments(0, '3')
      result.current.updateName(1, 'Physics')
      result.current.updateCats(1, '15')
      result.current.updateAssessments(1, '2')
    })
    expect(result.current.isValid).toBe(true)
  })

  it('is invalid when any name is blank', () => {
    const { result } = renderHook(() => useModuleDetails(2), { wrapper })
    act(() => {
      result.current.updateName(0, 'Maths')
      result.current.updateCats(0, '30')
      result.current.updateAssessments(0, '3')
      result.current.updateCats(1, '15')
      result.current.updateAssessments(1, '2')
    })
    expect(result.current.isValid).toBe(false)
  })

  it('is invalid when any CATS value is 0', () => {
    const { result } = renderHook(() => useModuleDetails(1), { wrapper })
    act(() => {
      result.current.updateName(0, 'Maths')
      result.current.updateCats(0, '0')
      result.current.updateAssessments(0, '3')
    })
    expect(result.current.isValid).toBe(false)
  })

  it('is invalid when any CATS value is a decimal', () => {
    const { result } = renderHook(() => useModuleDetails(1), { wrapper })
    act(() => {
      result.current.updateName(0, 'Maths')
      result.current.updateCats(0, '15.5')
      result.current.updateAssessments(0, '3')
    })
    expect(result.current.isValid).toBe(false)
  })

  it('is invalid when any assessments value is 0', () => {
    const { result } = renderHook(() => useModuleDetails(1), { wrapper })
    act(() => {
      result.current.updateName(0, 'Maths')
      result.current.updateCats(0, '30')
      result.current.updateAssessments(0, '0')
    })
    expect(result.current.isValid).toBe(false)
  })

  it('is invalid when any assessments value is a decimal', () => {
    const { result } = renderHook(() => useModuleDetails(1), { wrapper })
    act(() => {
      result.current.updateName(0, 'Maths')
      result.current.updateCats(0, '30')
      result.current.updateAssessments(0, '1.5')
    })
    expect(result.current.isValid).toBe(false)
  })
})
