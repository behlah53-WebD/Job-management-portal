import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth';
import AuthShell from '@/components/auth/AuthShell';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign in | Verdant',
  description: 'Sign in to your Verdant account to manage job applications and hiring pipelines.',
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LoginPage() {
  const session = await getServerAuthSession();

  // If already authenticated, redirect immediately to role-specific dashboard (no flash of login form)
  if (session?.user) {
    const role = session.user.role;
    if (role === 'admin') redirect('/dashboard/admin');
    if (role === 'employer') redirect('/dashboard/employer');
    redirect('/dashboard/seeker');
  }

  return (
    <AuthShell>
      <Suspense fallback={<div style={{ minHeight: '380px' }} />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
