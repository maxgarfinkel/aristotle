import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'
import { useScheduleResult } from '../hooks/useScheduleResult'
import Header from '../components/Header/Header'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

function formatHours(h: number): string {
  const totalMinutes = Math.round(h * 60)
  const hrs = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (hrs === 0) return `${mins}m`
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

export default function ScheduleResultPage() {
  const location = useLocation()
  const modules = location.state.modules ?? []
  const { sessions, warnings } = useScheduleResult(modules)

  useEffect(() => {
    document.title = 'Study schedule – Aristotle'
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">Study schedule</h1>
            <p className="text-base leading-relaxed text-gray-600">
              Your personalised day-by-day study plan, ordered chronologically.
            </p>
          </div>

          {warnings.length > 0 && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4"
            >
              <h2 className="mb-2 text-sm font-semibold text-amber-800">Schedule warnings</h2>
              <ul className="space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-700">
                    <span className="font-medium">
                      {w.moduleName} – {w.assessmentName}:
                    </span>{' '}
                    {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
              <p className="text-base text-gray-500">No study sessions could be generated.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 font-semibold text-gray-500">Date</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Module</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Assessment</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-500">Study time</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {formatDate(session.date)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{session.moduleName}</td>
                      <td className="px-4 py-3 text-gray-700">{session.assessmentName}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                        {formatHours(session.hours)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
