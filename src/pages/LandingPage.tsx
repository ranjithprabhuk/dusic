import { Link } from 'react-router-dom';
import ThemeToggle from '../components/layout/ThemeToggle';
import Logo from '../components/Logo';

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
      </svg>
    ),
    title: 'Multi-Track Composer',
    desc: 'Layer instruments across unlimited tracks. Trim, cut, merge, and arrange with precision.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: 'Learn Any Instrument',
    desc: '128 structured lessons across 8 instruments. From beginner scales to expert performances.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    title: 'Export Anywhere',
    desc: 'Download your creations as WAV, MP3, or save as project files to continue later.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: 'AI Music Generation',
    desc: 'Connect OpenAI, Claude, or Gemini to generate melodies and patterns with AI.',
  },
];

const instruments = [
  { name: 'Piano', img: '/dusic/images/instruments/piano.svg' },
  { name: 'Guitar', img: '/dusic/images/instruments/guitar.svg' },
  { name: 'Synthesizer', img: '/dusic/images/instruments/synthesizer.svg' },
  { name: 'Tabla', img: '/dusic/images/instruments/tabla.svg' },
  { name: 'Dholak', img: '/dusic/images/instruments/dholak.svg' },
  { name: 'Bass', img: '/dusic/images/instruments/bass.svg' },
  { name: 'Flute', img: '/dusic/images/instruments/flute.svg' },
  { name: 'Organ', img: '/dusic/images/instruments/organ.svg' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-lg font-bold text-gray-900 dark:text-white">Dusic</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
        <Logo size={72} className="mb-6 drop-shadow-lg" />

        <h1 className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">
          Your Digital Music Studio
        </h1>

        <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
          Compose, mix, and produce music right in your browser.
          Play instruments with your keyboard, record multi-track compositions, and export your creations.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/workspace"
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] sm:px-10 sm:py-4 sm:text-lg"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
            </svg>
            Start Creating
          </Link>
          <Link
            to="/tutorial"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.98] sm:px-10 sm:py-4 sm:text-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
            Learn & Practice
          </Link>
        </div>
      </section>

      {/* Instruments strip */}
      <section className="relative mx-auto max-w-3xl px-6 pb-16">
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          {instruments.map((inst) => (
            <div key={inst.name} className="flex flex-col items-center gap-1.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md transition-transform hover:scale-110 sm:h-16 sm:w-16 dark:bg-gray-900">
                <img src={inst.img} alt={inst.name} className="h-9 w-9 sm:h-10 sm:w-10" />
              </div>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-500 sm:text-xs">{inst.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Everything you need
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-200 px-6 py-8 dark:border-gray-800">
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Crafted with
            <span className="mx-1 inline-block animate-pulse text-red-500">&#9829;</span>
            by{' '}
            <a
              href="https://ranjithprabhuk.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
            >
              Ranjithprabhu
            </a>
          </p>
          <p className="text-[10px] text-gray-300 dark:text-gray-700">
            Browser-based music studio. No installation required.
          </p>
        </div>
      </footer>
    </div>
  );
}
