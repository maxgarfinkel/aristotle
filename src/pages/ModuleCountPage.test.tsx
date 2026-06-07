import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '../test-utils'

describe('ModuleCountPage', () => {
  it('renders the intro heading', async () => {
    await renderRoute('/')
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders the module count input', async () => {
    await renderRoute('/')
    expect(screen.getByLabelText(/how many modules/i)).toBeInTheDocument()
  })

  it('has the Next button disabled initially', async () => {
    await renderRoute('/')
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('enables the Next button when a valid count is entered', async () => {
    await renderRoute('/')
    await userEvent.type(screen.getByLabelText(/how many modules/i), '3')
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  it('keeps the Next button disabled for zero', async () => {
    await renderRoute('/')
    await userEvent.type(screen.getByLabelText(/how many modules/i), '0')
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('navigates to the module details page on Next click', async () => {
    await renderRoute('/')
    await userEvent.type(screen.getByLabelText(/how many modules/i), '3')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /your modules/i })).toBeInTheDocument()
    })
  })
})
