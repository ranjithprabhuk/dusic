interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="logo-wave" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" fill="url(#logo-bg)" />
      <path d="M140 256 Q140 190 170 150" stroke="url(#logo-wave)" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.35" />
      <path d="M110 256 Q110 165 155 110" stroke="url(#logo-wave)" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.2" />
      <path d="M140 256 Q140 322 170 362" stroke="url(#logo-wave)" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.35" />
      <path d="M110 256 Q110 347 155 402" stroke="url(#logo-wave)" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.2" />
      <path d="M240 130 L240 340 Q240 390 290 390 Q340 390 340 340 Q340 290 290 290 Q265 290 240 305 L240 130 Z" fill="white" />
      <path d="M240 130 L400 105 L400 280 Q400 330 350 330 Q300 330 300 280 Q300 230 350 230 Q375 230 400 245 L400 105" fill="white" />
      <rect x="240" y="105" width="160" height="25" rx="4" fill="white" />
    </svg>
  );
}
