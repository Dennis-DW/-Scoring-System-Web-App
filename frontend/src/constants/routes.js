// src/constants/routes.js
export const ROUTE_PROTECTION = {
  PUBLIC: 'public',
  AUTH: 'auth',
  ADMIN: 'admin',
  JUDGE: 'judge'
};

export const ROUTES = {
  // Public routes
  SCOREBOARD: {
    path: '/',
    protection: ROUTE_PROTECTION.PUBLIC,
    title: 'Scoreboard'
  },
  LOGIN: {
    path: '/login',
    protection: ROUTE_PROTECTION.PUBLIC,
    title: 'Login'
  },

  // Admin routes
  ADMIN_PANEL: {
    path: '/admin',
    protection: ROUTE_PROTECTION.ADMIN,
    title: 'Admin Panel'
  },
  JUDGES: {
    path: '/admin/judges',
    protection: ROUTE_PROTECTION.ADMIN,
    title: 'Manage Judges'
  },
  CONTESTANTS: {
    path: '/admin/contestants',
    protection: ROUTE_PROTECTION.ADMIN,
    title: 'Manage Contestants'
  },

  // Judge routes
  JUDGE_PORTAL: {
    path: '/judge',
    protection: ROUTE_PROTECTION.JUDGE,
    title: 'Judge Portal'
  },
  SCORES: {
    path: '/judge/scores',
    protection: ROUTE_PROTECTION.JUDGE,
    title: 'Scoring'
  },

  // Auth required routes
  PROFILE: {
    path: '/profile',
    protection: ROUTE_PROTECTION.AUTH,
    title: 'Profile'
  },
  SETTINGS: {
    path: '/settings',
    protection: ROUTE_PROTECTION.AUTH,
    title: 'Settings'
  }
};

export const hasRouteAccess = (route, userRole) => {
  if (route.protection === ROUTE_PROTECTION.PUBLIC) return true;
  if (route.protection === ROUTE_PROTECTION.AUTH) return !!userRole;
  if (route.protection === ROUTE_PROTECTION.ADMIN) return userRole === 'admin';
  if (route.protection === ROUTE_PROTECTION.JUDGE) return ['admin', 'judge'].includes(userRole);
  return false;
};

export default ROUTES;