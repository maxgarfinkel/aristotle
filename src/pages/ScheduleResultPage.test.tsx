import { screen } from '@testing-library/react'
import { vi, type Mock } from 'vitest'
import { renderRoute } from '../test-utils'
import type { ModuleSummary } from '../types/module'

vi.mock('../services/scheduler', () => ({
  generateSchedule: vi.fn(),
}))

import { generateSchedule } from '../services/scheduler'

const modules: ModuleSummary[] = [{ name: 'Maths', cats: 30, assessmentCount: 1 }]

const mockSessions = [
  { date: '2025-01-06', moduleName: 'Maths', assessmentName: 'Exam', hours: 2 },
  { date: '2025-01-07', moduleName: 'Maths', assessmentName: 'Exam', hours: 1.5 },
]

beforeEach(() => {
  ;(generateSchedule as Mock).mockReturnValue({ sessions: mockSessions, warnings: [] })
})

describe('ScheduleResultPage', () => {
  it('redirects to / when no modules are in route state', async () => {
    await renderRoute('/results')
    expect(screen.getByLabelText(/how many modules/i)).toBeInTheDocument()
  })

  it('renders the study schedule heading', async () => {
    await renderRoute('/results', { modules })
    expect(screen.getByRole('heading', { name: /study schedule/i })).toBeInTheDocument()
  })

  it('renders a table with the expected column headers', async () => {
    await renderRoute('/results', { modules })
    expect(screen.getByRole('columnheader', { name: /date/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /module/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /assessment/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /study time/i })).toBeInTheDocument()
  })

  it('renders a row for each session', async () => {
    await renderRoute('/results', { modules })
    const rows = screen.getAllByRole('row')
    // 1 header row + 2 session rows
    expect(rows).toHaveLength(3)
  })

  it('displays module and assessment names from sessions', async () => {
    await renderRoute('/results', { modules })
    expect(screen.getAllByText('Maths').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Exam').length).toBeGreaterThan(0)
  })

  it('does not render the warnings section when there are no warnings', async () => {
    await renderRoute('/results', { modules })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders the warnings alert when warnings are present', async () => {
    ;(generateSchedule as Mock).mockReturnValue({
      sessions: mockSessions,
      warnings: [
        {
          moduleName: 'Maths',
          assessmentName: 'Exam',
          message: '3.0 hours could not be scheduled before the deadline.',
        },
      ],
    })
    await renderRoute('/results', { modules })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/schedule warnings/i)).toBeInTheDocument()
    expect(
      screen.getByText(/3\.0 hours could not be scheduled before the deadline/i),
    ).toBeInTheDocument()
  })

  it('renders empty state when no sessions are generated', async () => {
    ;(generateSchedule as Mock).mockReturnValue({ sessions: [], warnings: [] })
    await renderRoute('/results', { modules })
    expect(screen.getByText(/no study sessions could be generated/i)).toBeInTheDocument()
  })

  it('formats study time as hours and minutes', async () => {
    await renderRoute('/results', { modules })
    // First session: 2h → "2h", second: 1.5h → "1h 30m"
    expect(screen.getByText('2h')).toBeInTheDocument()
    expect(screen.getByText('1h 30m')).toBeInTheDocument()
  })
})
