import { render } from '@testing-library/react'
import ScheduleTimeline from './ScheduleTimeline'
import type { TimelineAssessment } from './ScheduleTimeline'

const single: TimelineAssessment[] = [
  {
    moduleName: 'Algorithms',
    assessmentName: 'Coursework',
    startDate: '2026-09-07',
    deadline: '2026-09-11',
  },
]

const two: TimelineAssessment[] = [
  {
    moduleName: 'Algorithms',
    assessmentName: 'Coursework',
    startDate: '2026-09-07',
    deadline: '2026-09-09',
  },
  {
    moduleName: 'Databases',
    assessmentName: 'Essay',
    startDate: '2026-09-14',
    deadline: '2026-09-18',
  },
]

describe('ScheduleTimeline', () => {
  it('renders nothing when there are no assessments', () => {
    const { container } = render(<ScheduleTimeline assessments={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders one segment per assessment', () => {
    const { container } = render(<ScheduleTimeline assessments={two} />)
    expect(container.querySelectorAll('[title]')).toHaveLength(2)
  })

  it('segment title includes module and assessment name', () => {
    const { container } = render(<ScheduleTimeline assessments={single} />)
    expect(container.querySelector('[title]')?.getAttribute('title')).toBe(
      'Algorithms – Coursework',
    )
  })

  it('a single assessment spans the full width starting at left 0', () => {
    const { container } = render(<ScheduleTimeline assessments={single} />)
    const segment = container.querySelector('[title]') as HTMLElement
    expect(segment.style.left).toBe('0%')
    expect(segment.style.width).toBe('100%')
  })

  it('earlier assessment has a smaller left offset regardless of input order', () => {
    const { container } = render(<ScheduleTimeline assessments={[...two].reverse()} />)
    const alg = container.querySelector('[title="Algorithms – Coursework"]') as HTMLElement
    const db = container.querySelector('[title="Databases – Essay"]') as HTMLElement
    expect(parseFloat(alg.style.left)).toBeLessThan(parseFloat(db.style.left))
  })

  it('first chronological assessment starts at left: 0%', () => {
    const { container } = render(<ScheduleTimeline assessments={two} />)
    const first = container.querySelector('[title="Algorithms – Coursework"]') as HTMLElement
    expect(first.style.left).toBe('0%')
  })

  it('later assessment is offset from the left', () => {
    const { container } = render(<ScheduleTimeline assessments={two} />)
    const later = container.querySelector('[title="Databases – Essay"]') as HTMLElement
    expect(parseFloat(later.style.left)).toBeGreaterThan(0)
  })
})
