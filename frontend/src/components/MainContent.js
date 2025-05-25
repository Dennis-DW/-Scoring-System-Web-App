// components/MainContent.js
import { Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Overview from './Overview';
import Participants from './Participants';
import Scoreboard from './Scoreboard';
import LoadingSpinner from './LoadingSpinner';
import Footer from './Footer';

const PageTitle = ({ title, subtitle }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-semibold text-slate-800">{title}</h1>
    {subtitle && (
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    )}
  </div>
);



const LoginButton = () => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate('/login')}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      Login
    </button>
  );
};

const Breadcrumbs = () => {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  
  if (parts.length === 0) return null;
  
  return (
    <nav className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-slate-500">
        <li>
          <a href="/" className="hover:text-slate-700">Home</a>
        </li>
        {parts.map((part, index) => (
          <li key={index} className="flex items-center">
            <svg className="h-4 w-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="capitalize">{part.replace('-', ' ')}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

/**
 * MainContent Component
 * 
 * This component serves as the main content area of the application. It is structured
 * to provide a responsive layout with multiple sections, including a competition dashboard,
 * live scoreboard, and participants list. The component utilizes React Suspense for lazy
 * loading and displays a fallback spinner during loading.
 * 
 * @component
 * @returns {JSX.Element} The rendered MainContent component.
 * 
 * @example
 * // Usage in a parent component
 * import MainContent from './MainContent';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <MainContent />
 *     </div>
 *   );
 * }
 * 
 * @remarks
 * - The component includes a breadcrumb navigation and a login button at the top.
 * - Each section is wrapped with a `PageTitle` component for consistent headings.
 * - The `Suspense` component ensures that the content is loaded asynchronously.
 * - The layout is styled using Tailwind CSS classes for responsiveness and spacing.
 */
const MainContent = () => {

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex max-w-full flex-col pt-20 lg:pt-0">
        <div className="container mx-auto space-y-10 px-4 py-8 lg:space-y-16 lg:px-8 lg:py-12 xl:max-w-7xl">
          <div className="flex justify-between items-center">
            <Breadcrumbs />
            <LoginButton />
          </div>
          
          <Suspense fallback={<LoadingSpinner />}>
            <div className="space-y-10">
              <section>
                <PageTitle 
                  title="Competition Dashboard" 
                  subtitle="Welcome to the scoring system"
                />
                <Overview />
              </section>

              <section>
                <PageTitle 
                  title="Live Scoreboard" 
                  subtitle="Current standings and scores"
                />
                <Scoreboard />
              </section>

              <section>
                <PageTitle 
                  title="Participants" 
                  subtitle="View all participants"
                />
                <Participants />
              </section>
            </div>
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainContent;