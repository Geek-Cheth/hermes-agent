import { SignIn } from '@clerk/nextjs';
import { clerkDarkAppearance } from '@/lib/clerk-appearance';

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <SignIn appearance={clerkDarkAppearance} />
    </main>
  );
}
