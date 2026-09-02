import { Navigate } from 'react-router'
import { CategoriesRoute, HomePage, RequireAuth, SessionGate, SignUpRoute, TransactionsRoute } from './pages.tsx'

export const appRoutes = [
  {
    element: <SessionGate />,
    children: [
      { element: <HomePage />, index: true },
      { element: <SignUpRoute />, path: 'cadastro' },
      {
        element: <RequireAuth />,
        children: [
          { element: <TransactionsRoute />, path: 'transacoes' },
          { element: <CategoriesRoute />, path: 'categorias' },
        ],
      },
      { element: <Navigate replace to="/" />, path: '*' },
    ],
  },
]
