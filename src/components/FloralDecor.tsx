export function FloralDecor({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none select-none opacity-40 ${className}`}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
    >
      <circle cx="60" cy="60" r="8" fill="#f4c4c8" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="60"
          cy="36"
          rx="10"
          ry="18"
          fill="#ffc4d0"
          transform={`rotate(${deg} 60 60)`}
        />
      ))}
      <path
        d="M60 68v28M52 82h16"
        stroke="#8b7355"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}