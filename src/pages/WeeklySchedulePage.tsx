import { Fragment, useEffect } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useWeeklySchedule, DAYS_OF_WEEK } from '../hooks/useWeeklySchedule'
import PageLayout from '../components/PageLayout/PageLayout'
import Button from '../components/Button/Button'
import LinkButton from '../components/LinkButton/LinkButton'

export default function WeeklySchedulePage() {
  const location = useLocation()
  const modules = location.state.modules ?? []
  const { schedule, isValid, toggleDay, updateDay } = useWeeklySchedule()
  const navigate = useNavigate()

  const handleNext = () => {
    void navigate({ to: '/result' })
  }

  useEffect(() => {
    document.title = 'Weekly schedule – Aristotle'
  }, [])

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">Weekly schedule</h1>
        <p className="text-base leading-relaxed text-gray-600">
          Enter how much time you can study on each day. Toggle off days you won't study.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-[1fr_3.5rem_6rem_6rem] gap-x-4">
          <div className="pb-2 text-sm font-medium text-gray-500">Day</div>
          <div className="pb-2" />
          <div className="pb-2 text-sm font-medium text-gray-500">Hours</div>
          <div className="pb-2 text-sm font-medium text-gray-500">Minutes</div>

          {DAYS_OF_WEEK.map((day, index) => {
            const entry = schedule[index]!
            return (
              <Fragment key={day}>
                <div className="flex items-center py-2 text-sm font-medium text-gray-900">
                  {day}
                </div>
                <div className="flex items-center py-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={entry.enabled}
                    onClick={() => toggleDay(index)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                      entry.enabled ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        entry.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="py-2">
                  <input
                    type="number"
                    aria-label={`${day} hours`}
                    value={entry.hoursInput}
                    onChange={(e) => updateDay(index, 'hoursInput', e.target.value)}
                    disabled={!entry.enabled}
                    min={0}
                    step={1}
                    placeholder="0"
                    className={`block w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      !entry.enabled ? 'cursor-not-allowed opacity-40' : ''
                    }`}
                  />
                </div>
                <div className="py-2">
                  <input
                    type="number"
                    aria-label={`${day} minutes`}
                    value={entry.minutesInput}
                    onChange={(e) => updateDay(index, 'minutesInput', e.target.value)}
                    disabled={!entry.enabled}
                    min={0}
                    max={59}
                    step={1}
                    placeholder="0"
                    className={`block w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      !entry.enabled ? 'cursor-not-allowed opacity-40' : ''
                    }`}
                  />
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <LinkButton to="/assessments" state={{ modules }}>Back</LinkButton>
        <Button disabled={!isValid} onClick={handleNext}>Next</Button>
      </div>
    </PageLayout>
  )
}
