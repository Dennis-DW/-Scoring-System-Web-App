// components/navigation/SubNavItems.js
import { SettingsIcon, ProfileIcon, LogoutIcon } from '../icons';
import { ROUTES } from '../../config/routes';

const subNavItems = [
  {
    title: 'Settings',
    path: ROUTES.SETTINGS,
    icon: SettingsIcon,
    protection: 'auth',
    isActive: (path) => path === ROUTES.SETTINGS
  },
  {
    title: 'Profile',
    path: ROUTES.PROFILE,
    icon: ProfileIcon,
    protection: 'auth',
    isActive: (path) => path === ROUTES.PROFILE
  },
  {
    title: 'Logout',
    path: ROUTES.LOGOUT,
    icon: LogoutIcon,
    protection: 'auth',
    onClick: (navigate, logout) => {
      logout();
      navigate(ROUTES.LOGIN);
    }
  }
];

export const filterSubNavItems = (items, userRole) => {
  return items.filter(item => {
    if (item.protection === 'auth') return !!userRole;
    if (item.protection === 'admin') return userRole === 'admin';
    return true;
  });
};

export default subNavItems;