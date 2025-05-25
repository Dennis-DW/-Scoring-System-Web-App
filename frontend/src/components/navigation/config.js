// components/navigation/config.js
import { ROUTES } from '../../constants/routes';
import { DashboardIcon, JudgeIcon, AdminIcon, SettingsIcon, ProfileIcon, LogoutIcon } from '../icons';

export const mainNavItems = [
  {
    title: 'Dashboard',
    path: ROUTES.SCOREBOARD.path,
    icon: DashboardIcon,
    protection: ROUTES.SCOREBOARD.protection,
    isActive: (path) => path === ROUTES.SCOREBOARD.path
  },
  {
    title: 'Judge Portal',
    path: ROUTES.JUDGE_PORTAL.path,
    icon: JudgeIcon,
    protection: ROUTES.JUDGE_PORTAL.protection,
    isActive: (path) => path.startsWith(ROUTES.JUDGE_PORTAL.path)
  },
  {
    title: 'Admin Panel',
    path: ROUTES.ADMIN_PANEL.path,
    icon: AdminIcon,
    protection: ROUTES.ADMIN_PANEL.protection,
    isActive: (path) => path.startsWith(ROUTES.ADMIN_PANEL.path)
  }
];

export const subNavItems = [
  {
    title: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    protection: 'auth',
    isActive: (path) => path === '/settings'
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: ProfileIcon,
    protection: 'auth',
    isActive: (path) => path === '/profile'
  },
  {
    title: 'Logout',
    path: '/logout',
    icon: LogoutIcon,
    protection: 'auth',
    onClick: (navigate, logout) => {
      logout();
      navigate('/login');
    }
  }
];