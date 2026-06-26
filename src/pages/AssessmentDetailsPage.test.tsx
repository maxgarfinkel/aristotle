import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '../test-utils'
import type { ModuleSummary } from '../types/module'

const twoModules: ModuleSummary[] = [
  { name: 'Maths', cats: 30, assessmentCount: 2 },
  { name: 'Physics', cats: 15, assessmentCount: 1 },
]

const singleModule: ModuleSummary[] = [{ name: 'Maths', cats: 30, assessmentCount: 1 }]

describe('AssessmentDetailsPage', () => {
  it('redirects to home when no modules are in state', async () => {
    await renderRoute('/assessments')
    expect(screen.getByLabelText(/how many modules/i)).toBeInTheDocument()
  })

  it('renders a section heading for each module', async () => {
    await renderRoute('/assessments', { modules: twoModules })
    expect(screen.getByRole('heading', { name: 'Maths' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Physics' })).toBeInTheDocument()
  })

  it('renders the correct total number of name fields', async () => {
    await renderRoute('/assessments', { modules: twoModules })
    expect(screen.getAllByLabelText('Name')).toHaveLength(3)
  })

  it('renders start date and deadline fields for each assessment', async () => {
    await renderRoute('/assessments', { modules: twoModules })
    expect(screen.getAllByLabelText('Start date')).toHaveLength(3)
    expect(screen.getAllByLabelText('Deadline')).toHaveLength(3)
  })

  it('renders a Back link', async () => {
    await renderRoute('/assessments', { modules: twoModules })
    expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument()
  })

  it('has the Next button disabled when fields are empty', async () => {
    await renderRoute('/assessments', { modules: twoModules })
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('navigates back to module details on Back click', async () => {
    await renderRoute('/assessments', { modules: twoModules })
    await userEvent.click(screen.getByRole('link', { name: /back/i }))
    expect(await screen.findByRole('heading', { name: /your modules/i })).toBeInTheDocument()
  })

  it('does not crash when the start date is partially deleted', async () => {
    await renderRoute('/assessments', { modules: singleModule })
    const startField = screen.getAllByLabelText('Start date')[0]!
    // Simulate a partial date value that would result from clearing characters
    fireEvent.change(startField, { target: { value: '2026-09' } })
    // Page should still be mounted and interactive
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('navigates to weekly schedule page on Next click when valid', async () => {
    const user = userEvent.setup()
    await renderRoute('/assessments', { modules: singleModule })

    await user.type(screen.getByLabelText('Name'), 'Final Exam')
    await user.type(screen.getByLabelText('Weight (%)'), '100')
    fireEvent.change(screen.getByLabelText('Deadline'), { target: { value: '2027-12-31' } })

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).not.toBeDisabled()
    await user.click(nextButton)
    expect(await screen.findByRole('heading', { name: /weekly schedule/i })).toBeInTheDocument()
  })
})
