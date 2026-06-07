import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '../test-utils'

describe('ModuleDetailsPage', () => {
  it('renders the correct number of module name fields', async () => {
    await renderRoute('/modules?count=3')
    expect(screen.getAllByRole('textbox')).toHaveLength(3)
  })

  it('renders the correct number of CATS fields', async () => {
    await renderRoute('/modules?count=3')
    expect(screen.getAllByLabelText('CATS')).toHaveLength(3)
  })

  it('renders the correct number of assessments fields', async () => {
    await renderRoute('/modules?count=3')
    expect(screen.getAllByLabelText('Assessments')).toHaveLength(3)
  })

  it('labels each module group with its number', async () => {
    await renderRoute('/modules?count=2')
    expect(screen.getByText('Module 1')).toBeInTheDocument()
    expect(screen.getByText('Module 2')).toBeInTheDocument()
  })

  it('redirects to home when count is 0', async () => {
    await renderRoute('/modules?count=0')
    expect(screen.getByLabelText(/how many modules/i)).toBeInTheDocument()
  })

  it('has the Next button disabled when fields are empty', async () => {
    await renderRoute('/modules?count=2')
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('renders a Back link', async () => {
    await renderRoute('/modules?count=1')
    expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument()
  })

  it('navigates back to the module count page on Back click', async () => {
    await renderRoute('/modules?count=1')
    await userEvent.click(screen.getByRole('link', { name: /back/i }))
    expect(await screen.findByLabelText(/how many modules/i)).toBeInTheDocument()
  })

  it('enables the Next button when all fields are valid', async () => {
    await renderRoute('/modules?count=1')
    await userEvent.type(screen.getByRole('textbox'), 'Mathematics')
    await userEvent.type(screen.getByLabelText('CATS'), '30')
    await userEvent.type(screen.getByLabelText('Assessments'), '3')
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  it('navigates to assessment details on Next click when valid', async () => {
    await renderRoute('/modules?count=1')
    await userEvent.type(screen.getByRole('textbox'), 'Mathematics')
    await userEvent.type(screen.getByLabelText('CATS'), '30')
    await userEvent.type(screen.getByLabelText('Assessments'), '2')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByRole('heading', { name: /assessment details/i })).toBeInTheDocument()
  })
})
