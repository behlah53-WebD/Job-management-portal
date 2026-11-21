import { getJobs, getCompanies } from '@/lib/dataService';

export default async function sitemap() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://verdant.jobs';

  const staticRoutes = [
    '',
    '/jobs',
    '/companies',
    '/about',
    '/pricing',
    '/privacy',
    '/terms',
    '/cookies',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/jobs' ? 'hourly' : 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    const [{ jobs }, companies] = await Promise.all([
      getJobs({ limit: 100, status: 'Active' }),
      getCompanies(100),
    ]);

    const jobRoutes = (jobs || []).map((j) => ({
      url: `${baseUrl}/jobs/${j._id}`,
      lastModified: new Date(j.createdAt || Date.now()),
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    const companyRoutes = (companies || []).map((c) => ({
      url: `${baseUrl}/companies/${c._id}`,
      lastModified: new Date(c.createdAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...jobRoutes, ...companyRoutes];
  } catch {
    return staticRoutes;
  }
}
