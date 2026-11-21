import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardRedirectPage() {
  const session = await getServerAuthSession();
  if (!session || !session.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const role = session.user.role;
  if (role === 'admin') {
    redirect('/dashboard/admin');
  } else if (role === 'employer') {
    redirect('/dashboard/employer');
  } else {
    redirect('/dashboard/seeker');
  }
}
