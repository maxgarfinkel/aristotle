import { render } from '@testing-library/react'
import { createRouter, createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './router'
import WizardProvider from './context/WizardProvider'

export async function renderRoute(path: string = '/', state: Record<string, unknown> = {}) {
  const parts = path.split('?')
  const pathname = parts[0] ?? '/'
  const rawSearch = parts[1]
  const search = rawSearch ? `?${rawSearch}` : ''
  const href = `${pathname}${search}`

  const history = createMemoryHistory({ initialEntries: [href] })
  if (Object.keys(state).length > 0) {
    history.replace(href, state)
  }

  const router = createRouter({ routeTree, history })
  await router.load()
  return render(
    <WizardProvider>
      <RouterProvider router={router} />
    </WizardProvider>,
  )
}
