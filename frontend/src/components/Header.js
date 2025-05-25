// components/Header.js
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Brand from './Brand';
import { MenuIcon } from './icons';

const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 rounded-sm border border-slate-200 bg-white px-2 py-1.5 leading-6 font-semibold text-slate-800 shadow-xs hover:border-slate-300 hover:bg-slate-100"
      >
        <svg
          className="hi-solid hi-user-circle inline-block size-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
        <span className="hidden md:inline">{user.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          <a
            href="#"
            onClick={() => navigate('/profile')}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile
          </a>
          <a
            href="#"
            onClick={() => navigate('/settings')}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
          </a>
          <a
            href="#"
            onClick={onLogout}
            className="block px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
          >
            Logout
          </a>
        </div>
      )}
    </div>
  );
};

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="fixed start-0 end-0 top-0 z-30 flex h-20 flex-none items-center bg-white shadow-xs lg:hidden">
      <div className="container mx-auto flex justify-between px-4 lg:px-8 xl:max-w-7xl">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-slate-200 bg-white px-2 py-1.5 leading-6 font-semibold text-slate-800 shadow-xs hover:border-slate-300 hover:bg-slate-100"
            aria-label="Toggle Sidebar"
          >
            <MenuIcon />
          </button>
        </div>

        {/* Middle Section */}
        <div className="flex items-center gap-2">
          <Brand />
          {isSearchOpen && (
            <div className="relative mx-4">
              <input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg border border-slate-200 px-4 py-2 pl-10 focus:border-blue-500 focus:outline-none"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          {user ? (
            <UserMenu user={user} onLogout={logout} />
          ) : (
            <a
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;