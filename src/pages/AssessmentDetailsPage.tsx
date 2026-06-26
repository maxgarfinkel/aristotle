import { useEffect } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useAssessmentDetails } from '../hooks/useAssessmentDetails'
import PageLayout from '../components/PageLayout/PageLayout'
import FormField from '../components/FormField/FormField'
import Button from '../components/Button/Button'
import { LINK_BUTTON_CLASS } from '../components/LinkButton/LinkButton'

/**
 * Returns the day after `isoDate` as a YYYY-MM-DD string, or `undefined`
 * when `isoDate` is not a complete YYYY-MM-DD value (e.g. mid-edit).
 */
function dayAfter(isoDate: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return undefined
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, d! + 1)).toISOString().substring(0, 10)
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
    <PageLayout>
      <div className="mb-8">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
          Assessment details
        </h1>
        <p className="text-base leading-relaxed text-gray-600">
          Enter the details for each assessment.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {modules.map((module, moduleIndex) => {
          const assessments = moduleEntries[moduleIndex] ?? []

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
                        max={100}
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
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Link to="/modules" search={{ count: modules.length }} className={LINK_BUTTON_CLASS}>Back</Link>
        <Button disabled={!isValid} onClick={handleNext}>Next</Button>
      </div>
    </PageLayout>
  )
}
