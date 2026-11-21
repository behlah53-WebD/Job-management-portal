import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth';
import { getEmployerDashboardData } from '@/lib/dashboardService';
import EmployerOverviewClient from './EmployerOverviewClient';

export const dynamic = 'force-dynamic';

export default async function EmployerOverviewPage() {
  const session = await getServerAuthSession();
  if (!session || !session.user) {
    redirect('/login?callbackUrl=/dashboard/employer');
  }
  if (session.user.role !== 'employer' && session.user.role !== 'admin') {
    redirect('/dashboard/seeker');
  }

  const data = await getEmployerDashboardData(session.user.id);

  return <EmployerOverviewClient initialData={data} />;
}
