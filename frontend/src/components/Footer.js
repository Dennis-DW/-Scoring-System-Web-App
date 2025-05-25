// components/Footer.js
import { useState } from 'react';
import { Link } from 'react-router-dom';
import HeartIcon from './icons/HeartIcon';

const SocialLink = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-slate-400 hover:text-slate-600 transition-colors"
    aria-label={label}
  >
    <Icon className="h-5 w-5" />
  </a>
);

const Footer = () => {
  const [email, setEmail] = useState('');
  const year = new Date().getFullYear();
  const version = process.env.REACT_APP_VERSION || '1.0.0';

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribe:', email);
    setEmail('');
  };

  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:px-8 xl:max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 text-lg">Scoring System</h3>
            <p className="text-sm text-slate-500">
              A modern platform for fair and transparent judging.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="font-semibold text-slate-800 text-lg mb-3">Stay Updated</h3>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex flex-col gap-4 items-center sm:items-start lg:flex-row lg:justify-between lg:items-center">
            {/* Copyright */}
            <div className="text-sm text-center lg:text-left text-slate-500">
              © {year} <span className="font-semibold">Scoring System</span>
              <span className="mx-2 hidden sm:inline">·</span>
              <span className="text-slate-400 block sm:inline">v{version}</span>
            </div>

            {/* Credits */}
            <div className="inline-flex items-center justify-center text-sm text-slate-500">
              <span>Crafted with</span>
              <HeartIcon className="mx-1 text-red-500 h-4 w-4" />
              <span>
                by{' '}
                <a
                  className="font-medium text-blue-600 transition hover:text-blue-700"
                  href="https://pixelcave.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Dennis Wambua
                </a>
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-6 sm:gap-4">
              <SocialLink
                href="https://github.com"
                icon={({ className }) => (
                  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                )}
                label="GitHub"
              />
              <SocialLink
                href="https://twitter.com"
                icon={({ className }) => (
                  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                )}
                label="Twitter"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;