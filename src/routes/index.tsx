/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Loading } from '@/components/common/Loading';
import RootLayout from '@/components/layouts/RootLayout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useAuthStore } from '@/store/useAuthStore';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading fullScreen />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Suspense fallback={<Loading fullScreen />}>
              <Login />
            </Suspense>
          </PublicRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loading fullScreen />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<Loading fullScreen />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);
