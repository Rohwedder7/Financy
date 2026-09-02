import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { MockedProvider, type MockedProviderProps } from '@apollo/client/testing/react'
import { appRoutes } from '../app/routes.tsx'
import { AuthProvider } from '../features/auth/auth-context.tsx'

export function renderApp(
  options: {
    initialPath?: string
    mocks?: MockedProviderProps['mocks']
  } = {},
) {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [options.initialPath ?? '/'],
  })

  return render(
    <MockedProvider mocks={options.mocks ?? []} showWarnings={false}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MockedProvider>,
  )
}
