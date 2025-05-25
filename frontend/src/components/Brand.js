// components/Brand.js
import { Link } from 'react-router-dom';
import { LogoIcon } from './icons';

const Brand = ({ 
  to = "/",
  className = "",
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-2">
        <div className="size-4 bg-slate-200 rounded" />
        <div className="h-6 w-20 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 text-lg font-bold tracking-wide text-slate-800 transition 
        hover:opacity-75 active:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      aria-label="Brand"
    >
      <LogoIcon />
      <span>
        tail<span className="font-medium text-blue-600">app</span>
      </span>
    </Link>
  );
};

export default Brand;