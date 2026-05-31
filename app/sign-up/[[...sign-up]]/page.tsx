import { SignUp } from '@clerk/nextjs';
import { Logo } from '@/components/Logo';
import { clerkDarkAppearance } from '@/lib/clerk-appearance';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#0a0a0a] border-b border-white/[0.06] h-16 flex items-center px-6">
        <Logo withWordmark href="/" />
      </header>
      <main className="flex items-center justify-center p-8 pt-16">
        <SignUp appearance={clerkDarkAppearance} forceRedirectUrl="/dashboard" />
      </main>
    </div>
  );
}
