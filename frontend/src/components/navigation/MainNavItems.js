// components/navigation/MainNavItems.js
import { DashboardIcon, JudgeIcon, AdminIcon } from '../icons';
import { ROUTES } from '../../constants/routes';

const mainNavItems = [
  {
    title: 'Dashboard',
    path: ROUTES.SCOREBOARD,
    icon: DashboardIcon,
    protection: 'public',
    isActive: (path) => path === ROUTES.SCOREBOARD
  },
  {
    title: 'Judge Portal',
    path: ROUTES.JUDGE_PORTAL,
    icon: JudgeIcon,
    protection: 'judge',
    isActive: (path) => path.startsWith(ROUTES.JUDGE_PORTAL)
  },
  {
    title: 'Admin Panel',
    path: ROUTES.ADMIN_PANEL,
    icon: AdminIcon,
    protection: 'admin',
    isActive: (path) => path.startsWith(ROUTES.ADMIN_PANEL)
  }
];

export const checkAccess = (item, userRole) => {
  if (item.protection === 'public') return true;
  if (item.protection === 'admin') return userRole === 'admin';
  if (item.protection === 'judge') return ['admin', 'judge'].includes(userRole);
  return false;
};

export default mainNavItems;