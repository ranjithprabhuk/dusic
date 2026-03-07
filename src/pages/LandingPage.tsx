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

      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-7xl dark:text-white">
        Dusic
      </h1>

      <p className="mt-3 text-base font-light text-gray-500 sm:text-xl dark:text-gray-400">
        Your Digital Music Studio
      </p>

      <Link
        to="/workspace"
        className="mt-8 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95 sm:mt-10 sm:px-10 sm:py-4 sm:text-lg"
      >
        Unleash Your Sound
      </Link>

      <p className="mt-6 px-4 text-center text-sm text-gray-400 dark:text-gray-600">
        Compose, mix, and produce music right in your browser
      </p>
    </div>
  );
}
