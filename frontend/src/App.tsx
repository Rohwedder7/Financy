import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppProviders } from './app/providers.tsx'
import { appRoutes } from './app/routes.tsx'

const router = createBrowserRouter(appRoutes)

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

export default App
