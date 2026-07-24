/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Loading } from '@/components/common/Loading';
import RootLayout from '@/components/layouts/RootLayout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useAuthStore } from '@/store/useAuthStore';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/features/auth/Login'));
const Register = lazy(() => import('@/features/auth/Register'));
const ForgotPassword = lazy(() => import('@/features/auth/ForgotPassword'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const Onboarding = lazy(() => import('@/features/onboarding/Onboarding'));
const Projects = lazy(() => import('@/features/projects/Projects'));
const ProjectDetail = lazy(() => import('@/features/projects/ProjectDetail'));
const BoqGenerator = lazy(() => import('@/features/boq/BoqGenerator'));
const CostEstimation = lazy(() => import('@/features/estimation/CostEstimation'));
const MaterialSchedules = lazy(() => import('@/features/materials/MaterialSchedules'));
const MeasurementSheets = lazy(() => import('@/features/materials/MeasurementSheets'));
const Reports = lazy(() => import('@/features/reports/Reports'));
const RateAnalysis = lazy(() => import('@/features/reports/RateAnalysis'));
const AiAssistant = lazy(() => import('@/features/ai-assistant/AiAssistant'));
const Templates = lazy(() => import('@/features/templates/Templates'));
const Collaboration = lazy(() => import('@/features/collaboration/Collaboration'));
const Settings = lazy(() => import('@/features/settings/Settings'));
const Subscription = lazy(() => import('@/features/subscriptions/Subscription'));
const Notifications = lazy(() => import('@/features/notifications/Notifications'));
const Admin = lazy(() => import('@/features/admin/Admin'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <LazyPage Component={Home} /> },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <LazyPage Component={Login} />
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <LazyPage Component={Register} />
          </PublicRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <PublicRoute>
            <LazyPage Component={ForgotPassword} />
          </PublicRoute>
        ),
      },
      {
        path: 'onboarding',
        element: (
          <ProtectedRoute>
            <LazyPage Component={Onboarding} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <LazyPage Component={Dashboard} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects',
        element: (
          <ProtectedRoute>
            <LazyPage Component={Projects} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/:id',
        element: (
          <ProtectedRoute>
            <LazyPage Component={ProjectDetail} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/boq',
        element: (
          <ProtectedRoute>
            <LazyPage Component={BoqGenerator} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/estimation',
        element: (
          <ProtectedRoute>
            <LazyPage Component={CostEstimation} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/materials',
        element: (
          <ProtectedRoute>
            <LazyPage Component={MaterialSchedules} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/measurements',
        element: (
          <ProtectedRoute>
            <LazyPage Component={MeasurementSheets} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/reports',
        element: (
          <ProtectedRoute>
            <LazyPage Component={Reports} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/rates',
        element: (
          <ProtectedRoute>
            <LazyPage Component={RateAnalysis} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'ai-assistant',
        element: (
          <ProtectedRoute>
            <LazyPage Component={AiAssistant} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'templates',
        element: (
          <ProtectedRoute>
            <LazyPage Component={Templates} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'collaboration',
        element: (
          <ProtectedRoute>
            <LazyPage Component={Collaboration} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <LazyPage Component={Settings} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'subscription',
        element: (
          <ProtectedRoute>
            <LazyPage Component={Subscription} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <LazyPage Component={Notifications} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <LazyPage Component={Admin} />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <LazyPage Component={NotFound} /> },
    ],
  },
]);
