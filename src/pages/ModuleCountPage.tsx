import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useModuleCount } from '../hooks/useModuleCount'
import Header from '../components/Header/Header'
import FormField from '../components/FormField/FormField'
import Button from '../components/Button/Button'

export default function ModuleCountPage() {
  const navigate = useNavigate()
  const { value, count, isValid, setValue } = useModuleCount()

  useEffect(() => {
    document.title = 'Get started – Aristotle'
  }, [])

  const handleNext = () => {
    if (count !== null) {
      void navigate({ to: '/modules', search: { count } })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-10">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Plan your study time
            </h1>
            <p className="text-base leading-relaxed text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6">
              <FormField
                id="module-count"
                label="How many modules are you taking this year?"
                type="number"
                value={value}
                onChange={setValue}
                min={1}
                step={1}
                placeholder="e.g. 6"
              />
              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={!isValid}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
