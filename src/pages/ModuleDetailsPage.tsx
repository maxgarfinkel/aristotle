import { useEffect } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import type { ModuleSummary } from '../types/module'
import { useModuleDetails } from '../hooks/useModuleDetails'
import PageLayout from '../components/PageLayout/PageLayout'
import FormField from '../components/FormField/FormField'
import Button from '../components/Button/Button'
import LinkButton from '../components/LinkButton/LinkButton'

const routeApi = getRouteApi('/modules')

export default function ModuleDetailsPage() {
  const { count } = routeApi.useSearch()
  const { entries, isValid, updateName, updateCats, updateAssessments } = useModuleDetails(count)
  const navigate = useNavigate()

  const handleNext = () => {
    const modules: ModuleSummary[] = entries.map((e) => ({
      name: e.name,
      cats: Number(e.catsInput),
      assessmentCount: Number(e.assessmentsInput),
    }))
    void navigate({ to: '/assessments', state: { modules } })
  }

  useEffect(() => {
    document.title = 'Your modules – Aristotle'
  }, [])

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">Your modules</h1>
        <p className="text-base leading-relaxed text-gray-600">
          Enter the name, credit value, and number of assessments for each of your modules.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {entries.map((entry, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-4 text-sm font-semibold text-gray-500">
                Module {index + 1}
              </legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_6rem_8rem]">
                <FormField
                  id={`module-${index}-name`}
                  label="Module name"
                  value={entry.name}
                  onChange={(name) => updateName(index, name)}
                  placeholder="e.g. Mathematics"
                />
                <FormField
                  id={`module-${index}-cats`}
                  label="CATS"
                  type="number"
                  value={entry.catsInput}
                  onChange={(cats) => updateCats(index, cats)}
                  min={1}
                  step={1}
                  placeholder="e.g. 30"
                />
                <FormField
                  id={`module-${index}-assessments`}
                  label="Assessments"
                  type="number"
                  value={entry.assessmentsInput}
                  onChange={(assessments) => updateAssessments(index, assessments)}
                  min={1}
                  step={1}
                  placeholder="e.g. 3"
                />
              </div>
            </fieldset>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <LinkButton to="/">Back</LinkButton>
        <Button disabled={!isValid} onClick={handleNext}>Next</Button>
      </div>
    </PageLayout>
  )
}
