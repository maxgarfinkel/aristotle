import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { useAssessmentDetails } from '../hooks/useAssessmentDetails'
import Header from '../components/Header/Header'
import FormField from '../components/FormField/FormField'
import Button from '../components/Button/Button'

function dayAfter(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const next = new Date(Date.UTC(year!, month! - 1, day! + 1))
  return next.toISOString().substring(0, 10)
}

export default function AssessmentDetailsPage() {
  const location = useLocation()
  const modules = location.state.modules ?? []
  const { moduleEntries, isValid, updateField } = useAssessmentDetails(modules)
  const navigate = useNavigate()

  const handleNext = () => {
    void navigate({ to: '/schedule', state: { modules } })
  }

  useEffect(() => {
    document.title = 'Assessment details – Aristotle'
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Assessment details
            </h1>
            <p className="text-base leading-relaxed text-gray-600">
              Enter the details for each assessment. Percentages for each module must add up to 100%.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {modules.map((module, moduleIndex) => {
              const assessments = moduleEntries[moduleIndex] ?? []
              const total = assessments.reduce((s, a) => s + Number(a.percentageInput || 0), 0)
              const totalOk = Math.abs(total - 100) < 0.01

              return (
                <div
                  key={moduleIndex}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">{module.name}</h2>

                  <div className="flex flex-col gap-4">
                    {assessments.map((assessment, assessmentIndex) => (
                      <fieldset key={assessmentIndex} className="m-0 border-0 p-0">
                        <legend className="mb-3 text-sm font-semibold text-gray-500">
                          Assessment {assessmentIndex + 1}
                        </legend>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_6rem_9rem_9rem]">
                          <FormField
                            id={`mod-${moduleIndex}-assess-${assessmentIndex}-name`}
                            label="Name"
                            value={assessment.name}
                            onChange={(v) => updateField(moduleIndex, assessmentIndex, 'name', v)}
                            placeholder="e.g. Coursework"
                          />
                          <FormField
                            id={`mod-${moduleIndex}-assess-${assessmentIndex}-pct`}
                            label="Weight (%)"
                            type="number"
                            value={assessment.percentageInput}
                            onChange={(v) =>
                              updateField(moduleIndex, assessmentIndex, 'percentageInput', v)
                            }
                            min={1}
                            step={1}
                            placeholder="e.g. 60"
                          />
                          <FormField
                            id={`mod-${moduleIndex}-assess-${assessmentIndex}-start`}
                            label="Start date"
                            type="date"
                            value={assessment.startDate}
                            onChange={(v) =>
                              updateField(moduleIndex, assessmentIndex, 'startDate', v)
                            }
                          />
                          <FormField
                            id={`mod-${moduleIndex}-assess-${assessmentIndex}-deadline`}
                            label="Deadline"
                            type="date"
                            value={assessment.deadline}
                            onChange={(v) =>
                              updateField(moduleIndex, assessmentIndex, 'deadline', v)
                            }
                            min={dayAfter(assessment.startDate)}
                          />
                        </div>
                      </fieldset>
                    ))}
                  </div>

                  <p
                    className={`mt-4 text-sm font-medium ${totalOk ? 'text-green-600' : 'text-red-500'}`}
                  >
                    Total: {total}%
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link
              to="/modules"
              search={{ count: modules.length }}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Back
            </Link>
            <Button disabled={!isValid} onClick={handleNext}>Next</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
