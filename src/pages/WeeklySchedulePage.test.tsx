import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '../test-utils'
import type { ModuleSummary } from '../types/module'

const modules: ModuleSummary[] = [{ name: 'Maths', cats: 30, assessmentCount: 1 }]

describe('WeeklySchedulePage', () => {
  it('redirects to / when no modules in state', async () => {
    await renderRoute('/schedule')
    expect(screen.getByLabelText(/how many modules/i)).toBeInTheDocument()
  })

  it('renders all 7 day names', async () => {
    await renderRoute('/schedule', { modules })
    for (const day of [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]) {
      expect(screen.getByText(day)).toBeInTheDocument()
    }
  })

  it('all days are enabled by default', async () => {
    await renderRoute('/schedule', { modules })
    const switches = screen.getAllByRole('switch')
    expect(switches).toHaveLength(7)
    for (const sw of switches) {
      expect(sw).toHaveAttribute('aria-checked', 'true')
    }
  })

  it('Next button starts disabled', async () => {
    await renderRoute('/schedule', { modules })
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('renders a Back link', async () => {
    await renderRoute('/schedule', { modules })
    expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument()
  })

  it('clicking a toggle disables a day', async () => {
    const user = userEvent.setup()
    await renderRoute('/schedule', { modules })

    const switches = screen.getAllByRole('switch')
    await user.click(switches[0]!)

    expect(switches[0]).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByLabelText('Monday hours')).toBeDisabled()
    expect(screen.getByLabelText('Monday minutes')).toBeDisabled()
  })

  it('Next button enables when all enabled days are valid', async () => {
    const user = userEvent.setup()
    await renderRoute('/schedule', { modules })

    const switches = screen.getAllByRole('switch')
    for (let i = 1; i < 7; i++) {
      await user.click(switches[i]!)
    }

    await user.type(screen.getByLabelText('Monday hours'), '2')

    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  it('navigates back to assessment details on Back click', async () => {
    await renderRoute('/schedule', { modules })
    await userEvent.click(screen.getByRole('link', { name: /back/i }))
    expect(
      await screen.findByRole('heading', { name: /assessment details/i }),
    ).toBeInTheDocument()
  })

  it('navigates to the results page on Next click when valid', async () => {
    const user = userEvent.setup()
    await renderRoute('/schedule', { modules })

    const switches = screen.getAllByRole('switch')
    for (let i = 1; i < 7; i++) {
      await user.click(switches[i]!)
    }
    await user.type(screen.getByLabelText('Monday hours'), '2')

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(
      await screen.findByRole('heading', { name: /study schedule/i }),
    ).toBeInTheDocument()
  })
})
