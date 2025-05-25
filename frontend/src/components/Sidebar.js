// components/Sidebar.js
import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { mainNavItems, subNavItems } from './navigation/config';
import { LogoIcon } from './icons';

const NavItem = ({ icon: Icon, title, path, isActive, onClick }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(navigate);
    } else {
      navigate(path);
    }
  };

  return (
    <a
      href={path}
      onClick={handleClick}
      className={`
        flex items-center gap-3 rounded-lg px-4 py-2.5 
        font-medium text-slate-600 transition-all duration-200
        hover:bg-white/75 hover:shadow-sm hover:shadow-slate-300/50
        active:bg-white active:text-slate-800 active:shadow-sm
        ${isActive ? 'bg-white shadow-sm text-blue-600' : ''}
      `}
    >
      <Icon className={`size-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
      <span>{title}</span>
    </a>
  );
};

/**
 * Sidebar component that renders a navigation menu with main and footer navigation items.
 * It supports role-based filtering of navigation items and responsive behavior.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Determines if the sidebar is open or closed.
 * @param {Function} props.onClose - Callback function to handle closing the sidebar.
 *
 * @returns {JSX.Element} The rendered Sidebar component.
 *
 * @example
 * <Sidebar open={true} onClose={() => console.log('Sidebar closed')} />
 *
 * @description
 * - The Sidebar uses `useLocation` to determine the current route and highlight active navigation items.
 * - Navigation items are filtered based on the user's role (`admin`, `judge`, participant.) using `AuthContext`.
 * - The component includes a backdrop for mobile views and a close button for toggling visibility.
 * - Main navigation items are rendered in the main section, while footer navigation items are rendered at the bottom.
 */
const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const filteredMainItems = mainNavItems.filter(item => {
    if (item.protection === 'admin') return user?.role === 'admin';
    if (item.protection === 'judge') return ['admin', 'judge'].includes(user?.role);
    return true;
  });

  const filteredSubItems = subNavItems.filter(item => {
    if (item.protection === 'admin') return user?.role === 'admin';
    if (item.protection === 'judge') return ['admin', 'judge'].includes(user?.role);
    return true;
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden
          transition-opacity duration-300
          ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed start-0 top-0 z-50 h-full w-72 lg:w-64
          bg-slate-50/95 backdrop-blur-xl shadow-lg lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 lg:h-20">
          <LogoIcon className="h-8 w-auto" />
          
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          <div className="space-y-2">
            {filteredMainItems.map((item, index) => (
              <NavItem
                key={index}
                {...item}
                isActive={item.isActive ? 
                  item.isActive(location.pathname) : 
                  location.pathname === item.path
                }
              />
            ))}
          </div>
        </nav>

        {/* Footer Navigation */}
        <div className="flex-none border-t border-slate-200 px-4 py-6">
          <div className="space-y-2">
            {filteredSubItems.map((item, index) => (
              <NavItem
                key={index}
                {...item}
                isActive={item.isActive ? 
                  item.isActive(location.pathname) : 
                  location.pathname === item.path
                }
                onClick={item.onClick ? 
                  () => item.onClick(navigate, logout) : 
                  undefined
                }
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;