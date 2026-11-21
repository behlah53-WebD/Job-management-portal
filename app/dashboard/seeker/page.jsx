import React from 'react';
import { getServerAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSeekerDashboardData } from '@/lib/dashboardService';
import SeekerOverviewClient from './SeekerOverviewClient';

export const dynamic = 'force-dynamic';

export default async function SeekerOverviewPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect('/login');
  }

  const dashboardData = await getSeekerDashboardData(session.user.id);

  return <SeekerOverviewClient initialData={dashboardData} />;
}
