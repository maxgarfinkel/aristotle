export interface TimelineAssessment {
  moduleName: string
  assessmentName: string
  startDate: string // YYYY-MM-DD
  deadline: string  // YYYY-MM-DD
}

interface ScheduleTimelineProps {
  assessments: TimelineAssessment[]
}

const SEGMENT_COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#3b82f6',
  '#8b5cf6',
  '#f97316',
  '#14b8a6',
  '#ec4899',
  '#84cc16',
]

const ONE_DAY_MS = 86_400_000

function isoToMs(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y!, m! - 1, d!)
}

export default function ScheduleTimeline({ assessments }: ScheduleTimelineProps) {
  if (assessments.length === 0) return null

  // Assign colours in chronological order (earlier start = lower colour index).
  const chronological = [...assessments].sort((a, b) => {
    const diff = isoToMs(a.startDate) - isoToMs(b.startDate)
    return diff !== 0 ? diff : isoToMs(a.deadline) - isoToMs(b.deadline)
  })

  const segments = chronological.map((a, i) => ({
    ...a,
    startMs: isoToMs(a.startDate),
    endMs: isoToMs(a.deadline),
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length]!,
  }))

  const globalStart = Math.min(...segments.map((s) => s.startMs))
  const globalEnd = Math.max(...segments.map((s) => s.endMs))
  const totalSpan = globalEnd - globalStart + ONE_DAY_MS

  // Paint largest segments first (behind), smallest last (in front), so no
  // segment can be completely hidden beneath a wider one.
  const paintOrder = [...segments].sort((a, b) => (b.endMs - b.startMs) - (a.endMs - a.startMs))

  return (
    <div className="relative h-8 overflow-hidden rounded-lg bg-gray-100" aria-hidden="true">
      {paintOrder.map((seg) => {
        const left = ((seg.startMs - globalStart) / totalSpan) * 100
        const width = ((seg.endMs - seg.startMs + ONE_DAY_MS) / totalSpan) * 100

        return (
          <div
            key={`${seg.moduleName}-${seg.assessmentName}`}
            title={`${seg.moduleName} – ${seg.assessmentName}`}
            className="absolute inset-y-0"
            style={{
              left: `${left}%`,
              width: `${width}%`,
              backgroundColor: seg.color,
            }}
          />
        )
      })}
    </div>
  )
}
