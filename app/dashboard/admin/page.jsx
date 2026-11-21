import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth';
import { getAdminDashboardData } from '@/lib/dashboardService';
import AdminOverviewClient from './AdminOverviewClient';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const session = await getServerAuthSession();
  if (!session || !session.user) {
    redirect('/login?callbackUrl=/dashboard/admin');
  }
  if (session.user.role !== 'admin') {
    redirect('/dashboard/seeker');
  }

  const data = await getAdminDashboardData();

  return <AdminOverviewClient initialData={data} />;
}
