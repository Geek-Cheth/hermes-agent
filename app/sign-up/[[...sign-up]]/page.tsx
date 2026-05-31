import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { clerkDarkAppearance } from '@/lib/clerk-appearance';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <header className="bg-white border-b border-black/[0.06] h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
              <path d="M3 10.5L7 3.5L11 10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-black">StartupForge</span>
        </Link>
      </header>
      <main className="flex items-center justify-center p-8 pt-16">
        <SignUp appearance={clerkDarkAppearance} forceRedirectUrl="/dashboard" />
      </main>
    </div>
  );
}
