import { useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import Header from '../components/Header/Header'
import { useWizardContext } from '../context/WizardContext'
import { useStudyPlan } from '../hooks/useStudyPlan'
import type { ModuleSummary } from '../types/module'

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatDate(isoDate: string): string {
  const [y, mo, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y!, mo! - 1, d!)).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function formatShortDate(isoDate: string): string {
  const [y, mo, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y!, mo! - 1, d!)).toLocaleDateString('en-GB', {
    weekday: 'short',
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">Your study plan</h1>
            <p className="text-base leading-relaxed text-gray-600">
              A personalised schedule based on your modules, assessments, and weekly availability.
            </p>
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
                      <td className="px-4 py-3 text-gray-600">{formatShortDate(s.finishDate)}</td>
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
                  <p className="mb-2 text-sm font-semibold text-gray-500">{formatDate(date)}</p>
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
            <Link
              to="/schedule"
              state={{ modules: moduleSummaries }}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Back
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
