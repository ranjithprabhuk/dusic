import { Link } from 'react-router-dom';
import ThemeToggle from '../components/layout/ThemeToggle';
import Logo from '../components/Logo';

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Logo size={80} className="mb-4 drop-shadow-lg" />

      <h1 className="text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        Dusic
      </h1>

      <p className="mt-3 text-xl font-light text-gray-500 dark:text-gray-400">
        Your Digital Music Studio
      </p>

      <Link
        to="/workspace"
        className="mt-10 rounded-xl bg-indigo-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95"
      >
        Unleash Your Sound
      </Link>

      <p className="mt-6 text-sm text-gray-400 dark:text-gray-600">
        Compose, mix, and produce music right in your browser
      </p>
    </div>
  );
}
