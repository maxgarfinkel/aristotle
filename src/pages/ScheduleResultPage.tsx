import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useWizardContext } from '../context/WizardContext'
import { useStudyPlan } from '../hooks/useStudyPlan'
import type { ModuleSummary } from '../types/module'
import PageLayout from '../components/PageLayout/PageLayout'
import LinkButton from '../components/LinkButton/LinkButton'
import ScheduleTimeline from '../components/ScheduleTimeline/ScheduleTimeline'
import type { TimelineAssessment } from '../components/ScheduleTimeline/ScheduleTimeline'

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatISODate(isoDate: string, weekday: 'long' | 'short'): string {
  const [y, mo, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y!, mo! - 1, d!)).toLocaleDateString('en-GB', {
    weekday,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default function ScheduleResultPage() {
  const navigate = useNavigate()
  const { modules } = useWizardContext()
  const plan = useStudyPlan()

  useEffect(() => {
    document.title = 'Study plan – Aristotle'
  }, [])

  useEffect(() => {
    if (modules.length === 0) {
      void navigate({ to: '/' })
    }
  }, [modules, navigate])

  if (modules.length === 0) return null

  const timelineAssessments: TimelineAssessment[] = modules.flatMap((m) =>
    m.assessments.map((a) => ({
      moduleName: m.name,
      assessmentName: a.name,
      startDate: a.startDate,
      deadline: a.deadline,
    })),
  )

  const moduleSummaries: ModuleSummary[] = modules.map((m) => ({
    name: m.name,
    cats: parseInt(m.catsInput, 10),
    assessmentCount: m.assessments.length,
  }))

  // Group day entries by date, preserving insertion order
  const dayMap = new Map<string, typeof plan.dayEntries>()
  for (const entry of plan.dayEntries) {
    const existing = dayMap.get(entry.date) ?? []
    existing.push(entry)
    dayMap.set(entry.date, existing)
  }

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">Your study plan</h1>
        <p className="text-base leading-relaxed text-gray-600">
          A personalised schedule based on your modules, assessments, and weekly availability.
        </p>
      </div>

      <div className="mb-6">
        <ScheduleTimeline assessments={timelineAssessments} />
      </div>

      <section className="mb-8" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="mb-4 text-xl font-semibold text-gray-900">
          Assessment summary
        </h2>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Assessment</th>
                <th className="px-4 py-3 font-medium text-gray-500">Module</th>
                <th className="px-4 py-3 font-medium text-gray-500">Finish by</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Time</th>
              </tr>
            </thead>
            <tbody>
              {plan.summaries.map((s, i) => (
                <tr
                  key={`${s.moduleName}-${s.assessmentName}`}
                  className={i < plan.summaries.length - 1 ? 'border-b border-gray-50' : ''}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{s.assessmentName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.moduleName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatISODate(s.finishDate, 'short')}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {formatMinutes(s.totalMinutes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="dayplan-heading">
        <h2 id="dayplan-heading" className="mb-4 text-xl font-semibold text-gray-900">
          Day by day
        </h2>
        <div className="flex flex-col gap-3">
          {Array.from(dayMap.entries()).map(([date, entries]) => (
            <div
              key={date}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <p className="mb-2 text-sm font-semibold text-gray-500">
                {formatISODate(date, 'long')}
              </p>
              <ul className="flex flex-col gap-1">
                {entries.map((entry, i) => (
                  <li
                    key={`${entry.assessmentName}-${i}`}
                    className="flex items-center justify-between text-sm text-gray-900"
                  >
                    <span>
                      <span className="font-medium">{entry.moduleName}</span>
                      {' — '}
                      {entry.assessmentName}
                    </span>
                    <span className="ml-4 shrink-0 text-gray-500">
                      {formatMinutes(entry.minutesSpent)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <LinkButton to="/schedule" state={{ modules: moduleSummaries }}>Back</LinkButton>
      </div>
    </PageLayout>
  )
}
