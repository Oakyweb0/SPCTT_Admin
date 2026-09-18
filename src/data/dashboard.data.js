/**
 * SPCTT 2026 Admin Panel — Centralized Dashboard Data Service
 * 
 * NOTE FOR PHASE 2 INTEGRATION:
 * This file acts as the single source of truth for all dashboard metrics.
 * When connecting to a Node.js + Express + MySQL API backend in the next phase,
 * replace these mock data objects with `axios.get('/api/admin/dashboard')` calls.
 */

export const dashboardStats = [
  {
    id: 'members',
    title: 'Total Members',
    value: 125,
    icon: 'fa-solid fa-users',
    theme: 'members',
    trend: '+12% this month',
    trendType: 'positive',
    subtext: 'Verified medical professionals'
  },
  {
    id: 'events',
    title: 'Total Events',
    value: 8,
    icon: 'fa-solid fa-calendar-days',
    theme: 'events',
    trend: '2 Upcoming',
    trendType: 'positive',
    subtext: 'Conferences & Workshops'
  },
  {
    id: 'blogs',
    title: 'Total Blogs',
    value: 24,
    icon: 'fa-solid fa-newspaper',
    theme: 'blogs',
    trend: '+3 published recently',
    trendType: 'positive',
    subtext: 'Articles & Case Studies'
  },
  {
    id: 'enquiries',
    title: 'Contact Enquiries',
    value: 15,
    icon: 'fa-solid fa-envelope',
    theme: 'enquiries',
    trend: '4 unread messages',
    trendType: 'neutral',
    subtext: 'Awaiting review'
  }
];

export const recentActivities = [
  {
    id: 1,
    activity: 'New member registered',
    detail: 'Dr. A. Sharma (Cardio-Thoracic Fellow)',
    user: 'Admin',
    date: '10 Sep 2026',
    status: 'Success',
    badgeClass: 'status-success',
    icon: 'fa-solid fa-user-plus',
    iconBg: '#eef3fb',
    iconColor: '#1d376d'
  },
  {
    id: 2,
    activity: 'New blog published',
    detail: 'Advances in Pediatric Pulmonary Critical Care',
    user: 'Admin',
    date: '09 Sep 2026',
    status: 'Published',
    badgeClass: 'status-published',
    icon: 'fa-solid fa-newspaper',
    iconBg: '#eff6ff',
    iconColor: '#2563eb'
  },
  {
    id: 3,
    activity: 'New enquiry received',
    detail: 'Abstract submission query regarding oral slot',
    user: 'Admin',
    date: '09 Sep 2026',
    status: 'New',
    badgeClass: 'status-new',
    icon: 'fa-solid fa-envelope-open-text',
    iconBg: '#fffbeb',
    iconColor: '#d97706'
  },
  {
    id: 4,
    activity: 'Event updated',
    detail: 'SPCTT Annual Conference 2026 Scientific Program schedule',
    user: 'Admin',
    date: '08 Sep 2026',
    status: 'Updated',
    badgeClass: 'status-updated',
    icon: 'fa-solid fa-calendar-check',
    iconBg: '#f3e8ff',
    iconColor: '#7e22ce'
  }
];

export const quickActionsList = [
  {
    id: 'add-member',
    title: 'Add Member',
    description: 'Register a new SPCTT delegate or doctor',
    icon: 'fa-solid fa-user-plus',
    variant: 'action-member',
    target: '/admin/members'
  },
  {
    id: 'add-event',
    title: 'Add Event',
    description: 'Schedule a new medical symposium or workshop',
    icon: 'fa-solid fa-calendar-plus',
    variant: 'action-event',
    target: '/admin/events'
  },
  {
    id: 'add-blog',
    title: 'Add Blog',
    description: 'Create & publish a new clinical article',
    icon: 'fa-solid fa-pen-to-square',
    variant: 'action-blog',
    target: '/admin/blogs'
  },
  {
    id: 'view-enquiries',
    title: 'View Enquiries',
    description: 'Review pending inquiries and messages',
    icon: 'fa-solid fa-inbox',
    variant: 'action-enquiry',
    target: '/admin/enquiries'
  }
];

export const conferenceInfo = {
  name: 'SPCTT 2026',
  fullTitle: 'Society of Pulmonary and Critical Care Tribals Annual Conference',
  status: 'System Operational',
  version: 'v1.0.0 (Phase 1 Direct Access)',
  websiteUrl: 'https://2026.spctt.org/'
};

/**
 * Future API service wrapper
 */
export const getDashboardSummary = async () => {
  // Simulating API call for future async integration
  return {
    stats: dashboardStats,
    activities: recentActivities,
    quickActions: quickActionsList,
    conference: conferenceInfo
  };
};
