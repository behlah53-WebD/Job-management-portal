/**
 * Formatting and helper utilities for Verdant
 */

export function formatSalary(min, max, currency = 'INR', type = 'yearly') {
  if (!min && !max) return 'Competitive';

  const formatNum = (num) => {
    if (currency === 'INR') {
      if (type === 'yearly') {
        const lpa = num / 100000;
        return lpa % 1 === 0 ? `${lpa}` : `${lpa.toFixed(1)}`;
      } else {
        if (num >= 1000) {
          const k = num / 1000;
          return `${k % 1 === 0 ? k : k.toFixed(1)}k`;
        }
        return `${num}`;
      }
    }
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return `${num}`;
  };

  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';

  if (currency === 'INR' && type === 'yearly') {
    if (min && max) {
      return `${symbol}${formatNum(min)} - ${formatNum(max)} LPA`;
    }
    return `${symbol}${formatNum(min || max)} LPA`;
  }

  if (type === 'monthly') {
    if (min && max) {
      return `${symbol}${formatNum(min)} - ${formatNum(max)}/mo`;
    }
    return `${symbol}${formatNum(min || max)}/mo`;
  }

  if (type === 'stipend') {
    if (min && max) {
      return `${symbol}${formatNum(min)} - ${formatNum(max)} stipend`;
    }
    return `${symbol}${formatNum(min || max)} stipend`;
  }

  if (min && max) {
    return `${symbol}${formatNum(min)} - ${symbol}${formatNum(max)} / yr`;
  }
  return `${symbol}${formatNum(min || max)} / yr`;
}

export function timeAgo(date) {
  if (!date) return '';
  const isVisual = process.env.VISUAL_TEST === 'true' || process.env.NEXT_PUBLIC_VISUAL_TEST === 'true';
  const now = isVisual ? new Date('2026-11-21T00:00:00.000Z') : new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}

export function isNewJob(createdAt) {
  if (!createdAt) return false;
  const isVisual = process.env.VISUAL_TEST === 'true' || process.env.NEXT_PUBLIC_VISUAL_TEST === 'true';
  const now = isVisual ? new Date('2026-11-21T00:00:00.000Z') : new Date();
  const daysDiff = (now - new Date(createdAt)) / (1000 * 60 * 60 * 24);
  return daysDiff <= 3;
}

export function calculateMatchScore(seekerSkills = [], jobSkills = []) {
  if (!jobSkills || jobSkills.length === 0) return 75; // Baseline
  if (!seekerSkills || seekerSkills.length === 0) return 40;

  const normalizedSeeker = seekerSkills.map((s) => s.toLowerCase().trim());
  let matches = 0;

  for (const skill of jobSkills) {
    const sLower = skill.toLowerCase().trim();
    if (normalizedSeeker.includes(sLower) || normalizedSeeker.some(sk => sk.includes(sLower) || sLower.includes(sk))) {
      matches++;
    }
  }

  const score = Math.round((matches / jobSkills.length) * 100);
  // Keep score within realistic engaging range 45% - 98%
  return Math.min(Math.max(score, 45), 98);
}

export function calculateJobMatch(job, seekerSkills = []) {
  return calculateMatchScore(seekerSkills, job?.skills || []);
}

export function calculateProfileStrength(profile, user) {
  let score = 20; // Basic account created
  if (user?.name) score += 5;
  if (user?.avatar) score += 10;
  if (user?.location) score += 5;
  if (profile?.headline) score += 15;
  if (profile?.about) score += 15;
  if (profile?.skills && profile.skills.length >= 3) score += 15;
  if (profile?.experience && profile.experience.length > 0) score += 10;
  if (profile?.education && profile.education.length > 0) score += 5;
  if (profile?.resumeUrl) score += 15;

  return Math.min(score, 100);
}

export function getGreeting(name) {
  const hour = process.env.VISUAL_TEST === 'true' ? 10 : new Date().getHours();
  let timeStr = 'Good morning';
  if (hour >= 12 && hour < 17) timeStr = 'Good afternoon';
  else if (hour >= 17) timeStr = 'Good evening';

  return `${timeStr}${name ? `, ${name}` : ''} 🌿`;
}

export function getInitials(name = '') {
  if (!name) return 'V';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
