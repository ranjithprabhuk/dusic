import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Logo from '../Logo';

const links = [
  { to: '/', label: 'Home' },
  { to: '/workspace', label: 'Workspace' },
  { to: '/tutorial', label: 'Tutorial' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-1">
        <div className="mr-3 flex items-center gap-2">
          <Logo size={28} />
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            Dusic
          </span>
        </div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <ThemeToggle />
    </nav>
  );
}
