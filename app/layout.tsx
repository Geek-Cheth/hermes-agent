import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'StartupForge',
  description: 'Describe your idea. The agent does the rest.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={{
        signIn: {
          start: {
            title: 'Welcome back',
            subtitle: 'Sign in to StartupForge to continue',
          },
        },
        signUp: {
          start: {
            title: 'Create your account',
            subtitle: 'Sign up for StartupForge',
          },
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="antialiased min-h-screen bg-[#0a0a0a] text-[#fafafa]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
