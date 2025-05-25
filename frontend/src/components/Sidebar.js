// components/Sidebar.js
import { useState, useContext } from 'react';
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
      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-semibold text-slate-600 transition duration-200 
        ${isActive
          ? 'bg-white shadow-xs shadow-slate-300/50'
          : 'hover:bg-white hover:shadow-xs hover:shadow-slate-300/50 active:bg-white/75 active:text-slate-800 active:shadow-slate-300/10'
        }`}
    >
      <Icon className={isActive ? 'text-blue-600' : 'text-slate-400'} />
      <span>{title}</span>
    </a>
  );
};

const Sidebar = ({ onCloseMobile }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCloseMobile = () => {
    setMobileSidebarOpen(false);
    onCloseMobile?.();
  };

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
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 lg:hidden transition-opacity duration-300 ${mobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={handleCloseMobile}
      />

      <nav
        id="page-sidebar"
        className={`fixed start-0 top-0 bottom-0 z-50 flex h-full w-80 flex-col overflow-auto bg-slate-100 
          transition-transform duration-500 ease-out lg:w-64 lg:translate-x-0 
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Main Sidebar Navigation"
      >
        {/* Sidebar Header */}
        <div className="flex h-20 w-full flex-none items-center justify-between px-8">
          <LogoIcon />

          <div className="lg:hidden">
            <button
              type="button"
              className="flex size-10 items-center justify-center text-slate-400 hover:text-slate-600 active:text-slate-400"
              onClick={handleCloseMobile}
              aria-label="Close Sidebar"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="w-full grow space-y-3 p-4">
          {filteredMainItems.map((item, index) => (
            <NavItem
              key={index}
              {...item}
              isActive={item.isActive ? item.isActive(location.pathname) : location.pathname === item.path}

            />
          ))}
        </div>

        {/* Sub Navigation */}
        <div className="w-full flex-none space-y-3 p-4 border-t border-slate-200">
          {filteredSubItems.map((item, index) => (
            <NavItem
              key={index}
              {...item}
              isActive={item.isActive ? item.isActive(location.pathname) : location.pathname === item.path}

              onClick={item.onClick ? () => item.onClick(navigate, logout) : undefined}
            />
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;