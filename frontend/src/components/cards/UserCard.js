// components/UserCard.js
import { useState } from 'react';
import ArrowIcon from '../icons/ArrowIcon';

const UserCard = ({ 
  avatar, 
  name, 
  email, 
  projectName, 
  score,
  status = 'active',
  onView,
  loading = false 
}) => {
  const [imageError, setImageError] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="w-full grow p-5 text-center lg:p-6">
          <div className="mx-auto mb-4 size-16 rounded-full bg-slate-200"></div>
          <div className="h-4 w-3/4 mx-auto bg-slate-200 rounded"></div>
          <div className="mt-2 h-3 w-1/2 mx-auto bg-slate-200 rounded"></div>
        </div>
        <div className="border-t border-slate-100 p-4"></div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-300">
      <div className="relative w-full grow p-5 text-center lg:p-6">
        {status === 'active' && (
          <span className="absolute top-4 right-4 size-3 rounded-full bg-green-400 ring-2 ring-white"></span>
        )}
        
        <div className="relative inline-block">
          {!imageError ? (
            <img
              src={avatar}
              alt={`${name}'s Avatar`}
              className="mb-4 inline-block size-16 rounded-full transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="mb-4 inline-flex size-16 rounded-full bg-slate-200 items-center justify-center text-slate-600">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h4 className="font-semibold text-slate-900">{name}</h4>
        <p className="text-sm font-medium text-slate-500">{email}</p>
        
        {score !== undefined && (
          <div className="mt-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              score >= 75 ? 'bg-green-100 text-green-800' :
              score >= 50 ? 'bg-blue-100 text-blue-800' :
              'bg-slate-100 text-slate-800'
            }`}>
              Score: {score}
            </span>
          </div>
        )}
      </div>

      <div className="flex w-full items-center justify-between gap-2 border-t border-slate-100 px-5 py-4 text-sm font-medium lg:px-6">
        <span className="text-slate-600">
          {projectName && (
            <>
              Invited you to start
              <span className="font-semibold text-slate-900"> {projectName}</span>
            </>
          )}
        </span>

        <div className="flex items-center gap-2">
          {onView && (
            <button
              onClick={onView}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              View
              <ArrowIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;