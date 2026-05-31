import Link from 'next/link';

type LogoProps = {
  withWordmark?: boolean;
  href?: string;
  className?: string;
  markSize?: number;
};

function LogoMark({ size }: { size: number }) {
  const iconSize = Math.round(size * 0.5);

  return (
    <div
      className="rounded-full bg-[#fafafa] flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 14 14" fill="none" style={{ width: iconSize, height: iconSize }}>
        <path
          d="M3 10.5L7 3.5L11 10.5"
          stroke="#0a0a0a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function Logo({ withWordmark = false, href, className = '', markSize = 28 }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2 text-[#fafafa] ${className}`}>
      <LogoMark size={markSize} />
      {withWordmark && (
        <span className="text-sm font-semibold tracking-tight">StartupForge</span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
