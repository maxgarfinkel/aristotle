import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import type { ModuleSummary } from './types/module'
import ModuleCountPage from './pages/ModuleCountPage'
import ModuleDetailsPage from './pages/ModuleDetailsPage'
import AssessmentDetailsPage from './pages/AssessmentDetailsPage'
import WeeklySchedulePage from './pages/WeeklySchedulePage'
import ScheduleResultPage from './pages/ScheduleResultPage'

const rootRoute = createRootRoute({
  component: Outlet,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ModuleCountPage,
})

const modulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/modules',
  validateSearch: (search: Record<string, unknown>): { count: number } => ({
    count: Number(search['count']) || 0,
  }),
  beforeLoad: ({ search }) => {
    if (search.count < 1) {
      throw redirect({ to: '/' })
    }
  },
  component: ModuleDetailsPage,
})

const assessmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assessments',
  beforeLoad: ({ location }) => {
    if (!location.state.modules?.length) {
      throw redirect({ to: '/' })
    }
  },
  component: AssessmentDetailsPage,
})

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedule',
  beforeLoad: ({ location }) => {
    if (!location.state.modules?.length) {
      throw redirect({ to: '/' })
    }
  },
  component: WeeklySchedulePage,
})

const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result',
  component: ScheduleResultPage,
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  modulesRoute,
  assessmentsRoute,
  scheduleRoute,
  resultRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

declare module '@tanstack/history' {
  interface HistoryState {
    modules?: ModuleSummary[]
  }
}
