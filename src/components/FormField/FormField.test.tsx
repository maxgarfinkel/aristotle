import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormField from './FormField'

describe('FormField', () => {
  it('renders a labelled input', () => {
    render(<FormField id="test" label="Test label" value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Test label')).toBeInTheDocument()
  })

  it('calls onChange when the user types', async () => {
    const onChange = vi.fn()
    render(<FormField id="test" label="Test" value="" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Test'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  it('renders hint text when provided', () => {
    render(<FormField id="test" label="Test" value="" onChange={() => {}} hint="Helpful hint" />)
    expect(screen.getByText('Helpful hint')).toBeInTheDocument()
  })

  it('associates the hint with the input via aria-describedby', () => {
    render(<FormField id="test" label="Test" value="" onChange={() => {}} hint="Helpful hint" />)
    expect(screen.getByLabelText('Test')).toHaveAttribute('aria-describedby', 'test-hint')
  })

  it('does not set aria-describedby when no hint is provided', () => {
    render(<FormField id="test" label="Test" value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Test')).not.toHaveAttribute('aria-describedby')
  })

  it('renders a date input when type is date', () => {
    render(<FormField id="test" label="Date" type="date" value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Date')).toHaveAttribute('type', 'date')
  })

  it('disables the input when disabled is true', () => {
    render(<FormField id="test" label="Test" value="" onChange={() => {}} disabled />)
    expect(screen.getByLabelText('Test')).toBeDisabled()
  })

  it('applies the max attribute when provided', () => {
    render(<FormField id="test" label="Test" type="number" value="" onChange={() => {}} max={100} />)
    expect(screen.getByLabelText('Test')).toHaveAttribute('max', '100')
  })
})
