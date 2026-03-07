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
      </defs>
      <rect width="512" height="512" rx="96" fill="url(#logo-bg)" />

      {/* Note stem */}
      <rect x="278" y="100" width="14" height="260" rx="7" fill="white" />

      {/* Note head as "0" — hollow oval */}
      <ellipse cx="238" cy="360" rx="62" ry="48" fill="white" />
      <ellipse cx="238" cy="360" rx="34" ry="24" fill="url(#logo-bg)" />

      {/* Flag */}
      <path d="M292 100 Q360 110 340 170 Q330 200 292 190" fill="white" />

      {/* Binary digits along the stem */}
      <text fontFamily="monospace" fontWeight="bold" fill="white" opacity="0.25">
        <tspan x="304" y="145" fontSize="30">1</tspan>
        <tspan x="300" y="200" fontSize="24">0</tspan>
        <tspan x="308" y="248" fontSize="28">1</tspan>
        <tspan x="296" y="300" fontSize="22">1</tspan>
      </text>

      {/* Floating binary particles */}
      <text fontFamily="monospace" fontWeight="bold" fill="white" opacity="0.15" fontSize="32">
        <tspan x="80" y="140">1</tspan>
        <tspan x="120" y="200">0</tspan>
        <tspan x="60" y="290">1</tspan>
        <tspan x="110" y="370">0</tspan>
        <tspan x="75" y="430">1</tspan>
      </text>
      <text fontFamily="monospace" fontWeight="bold" fill="white" opacity="0.12" fontSize="28">
        <tspan x="380" y="300">0</tspan>
        <tspan x="410" y="370">1</tspan>
        <tspan x="370" y="430">0</tspan>
        <tspan x="420" y="180">1</tspan>
        <tspan x="400" y="240">0</tspan>
      </text>

      {/* "0" inside the note head */}
      <text
        x="238"
        y="372"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize="38"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        opacity="0.9"
      >
        0
      </text>
    </svg>
  );
}
