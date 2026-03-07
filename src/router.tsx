import { createHashRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';
import TutorialPage from './pages/TutorialPage';
import SettingsPage from './pages/SettingsPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <Layout />,
    children: [
      { path: '/workspace', element: <WorkspacePage /> },
      { path: '/tutorial', element: <TutorialPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
]);
