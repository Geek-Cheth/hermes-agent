'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export function Navbar() {
  return (
    <header className="border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-[#fafafa]">
          StartupForge
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/history"
            className="text-sm text-[#71717a] hover:text-[#fafafa] transition-colors"
          >
            History
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </nav>
      </div>
    </header>
  );
}
