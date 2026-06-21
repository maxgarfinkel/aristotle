import { act, render, screen } from '@testing-library/react'
import { createRouter, createMemoryHistory, RouterProvider, createRootRoute } from '@tanstack/react-router'
import LinkButton from './LinkButton'

async function renderWithRouter(ui: React.ReactNode) {
  const rootRoute = createRootRoute({ component: () => <>{ui}</> })
  const history = createMemoryHistory({ initialEntries: ['/'] })
  const router = createRouter({ routeTree: rootRoute, history })
  await router.load()
  await act(async () => {
    render(<RouterProvider router={router} />)
  })
}

describe('LinkButton', () => {
  it('renders its children', async () => {
    await renderWithRouter(<LinkButton to="/">Back</LinkButton>)
    expect(screen.getByRole('link', { name: 'Back' })).toBeInTheDocument()
  })

  it('renders an anchor element', async () => {
    await renderWithRouter(<LinkButton to="/">Go</LinkButton>)
    expect(screen.getByRole('link')).toBeInTheDocument()
  })
})
