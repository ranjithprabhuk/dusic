import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useUIStore } from './store/useUIStore';
import { useEffect, useState } from 'react';
import Logo from './components/Logo';

function App() {
  const theme = useUIStore((s) => s.theme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center text-center">
          <Logo size={56} className="mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight">Dusic</h1>
          <p className="mt-1 text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
