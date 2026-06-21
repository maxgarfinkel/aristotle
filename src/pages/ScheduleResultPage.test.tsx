import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '../test-utils'
import type { ScheduleWizard } from '../types/wizard'

// Sep 7 2026 = Monday
const validWizardState: ScheduleWizard = {
  numberOfModules: '1',
  modules: [
    {
      name: 'Algorithms',
      catsInput: '20',
      assessmentsInput: '1',
      assessments: [
        {
          name: 'Coursework',
          percentageInput: '100',
          startDate: '2026-09-07',
          deadline: '2026-09-11',
        },
      ],
    },
  ],
  // Monday–Friday, 2 h each; 5 × 120 = 600 min total
  weeklySchedule: Array.from({ length: 7 }, (_, i) => ({
    enabled: i < 5,
    hoursInput: '2',
    minutesInput: '0',
  })),
}

describe('ScheduleResultPage', () => {
  it('redirects to / when the wizard has no modules', async () => {
    await renderRoute('/result')
    expect(screen.getByLabelText(/how many modules/i)).toBeInTheDocument()
  })

  it('renders the page heading', async () => {
    await renderRoute('/result', {}, validWizardState)
    expect(screen.getByRole('heading', { name: /your study plan/i })).toBeInTheDocument()
  })

  it('renders the assessment summary section', async () => {
    await renderRoute('/result', {}, validWizardState)
    expect(screen.getByRole('heading', { name: /assessment summary/i })).toBeInTheDocument()
  })

  it('shows the assessment name in the summary', async () => {
    await renderRoute('/result', {}, validWizardState)
    expect(screen.getByRole('cell', { name: /coursework/i })).toBeInTheDocument()
  })

  it('shows the module name in the summary', async () => {
    await renderRoute('/result', {}, validWizardState)
    expect(screen.getByRole('cell', { name: /algorithms/i })).toBeInTheDocument()
  })

  it('shows the total time (600 min = 10 h) in the summary', async () => {
    await renderRoute('/result', {}, validWizardState)
    expect(screen.getByRole('cell', { name: '10h' })).toBeInTheDocument()
  })

  it('renders the day-by-day section', async () => {
    await renderRoute('/result', {}, validWizardState)
    expect(screen.getByRole('heading', { name: /day by day/i })).toBeInTheDocument()
  })

  it('shows assessment entries in the day-by-day plan', async () => {
    await renderRoute('/result', {}, validWizardState)
    // 5 study days × 120 min each — each entry shows "2h" for 120 minutes
    const timeLabels = screen.getAllByText('2h')
    expect(timeLabels.length).toBe(5)
  })

  it('renders a Back link that leads to the schedule page', async () => {
    await renderRoute('/result', {}, validWizardState)
    await userEvent.click(screen.getByRole('link', { name: /back/i }))
    expect(
      await screen.findByRole('heading', { name: /weekly schedule/i }),
    ).toBeInTheDocument()
  })

  describe('two-module plan', () => {
    const twoModuleState: ScheduleWizard = {
      numberOfModules: '2',
      modules: [
        {
          name: 'Algorithms',
          catsInput: '20',
          assessmentsInput: '1',
          assessments: [
            {
              name: 'Coursework',
              percentageInput: '100',
              startDate: '2026-09-07',
              deadline: '2026-09-09',
            },
          ],
        },
        {
          name: 'Databases',
          catsInput: '20',
          assessmentsInput: '1',
          assessments: [
            {
              name: 'Essay',
              percentageInput: '100',
              startDate: '2026-09-07',
              deadline: '2026-09-11',
            },
          ],
        },
      ],
      weeklySchedule: Array.from({ length: 7 }, (_, i) => ({
        enabled: i < 5,
        hoursInput: '2',
        minutesInput: '0',
      })),
    }

    it('shows both assessments in the summary table', async () => {
      await renderRoute('/result', {}, twoModuleState)
      expect(screen.getByRole('cell', { name: /coursework/i })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: /essay/i })).toBeInTheDocument()
    })

    it('shows both module names in the summary table', async () => {
      await renderRoute('/result', {}, twoModuleState)
      expect(screen.getByRole('cell', { name: /algorithms/i })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: /databases/i })).toBeInTheDocument()
    })
  })
})
