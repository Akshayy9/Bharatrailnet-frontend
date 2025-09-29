import React, { useState, useRef, useEffect } from 'react';
import useTheme from '../hooks/useTheme';

// SVG Icons for the theme switcher
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 transition-all">
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path><path d="M12 20v2"></path>
    <path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path>
    <path d="M2 12h2"></path><path d="M20 12h2"></path>
    <path d="m4.93 19.07 1.41-1.41"></path><path d="m17.66 6.34 1.41-1.41"></path>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 transition-all">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);

const SystemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
        <path d="M12 18h.01"></path>
    </svg>
);


const Header = ({ user, currentTime, connectionStatus }) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60 md:px-6">
      <div className="flex h-16 items-center justify-between">
        {/* Left Side: Dashboard Title and Time */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            Section Control Dashboard - {user?.section || 'GZB'}
          </h2>
          {/* Add a check here to make sure currentTime is not null or undefined */}
          {currentTime && (
            <p className="text-sm text-[var(--muted-foreground)]">
              {currentTime.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour12: false
              })}
            </p>
          )}
        </div>

        {/* Right Side: Status, Bell Icon, and Theme Switcher */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${
              connectionStatus === 'Connected' ? 'bg-green-500' :
              connectionStatus === 'Connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-[var(--muted-foreground)]">
              {connectionStatus}
            </span>
          </div>
          <button className="p-2 rounded-full hover:bg-[var(--muted)]">
            {/* Make sure you have font-awesome included in your project for this icon to work */}
            <i className="fas fa-bell text-[var(--foreground)]"></i>
          </button>

          {/* Theme Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-transparent transition-colors hover:bg-[var(--muted)]"
            >
              <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-md border border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)] shadow-lg">
                <ul className="py-1">
                  <li
                    className={`flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-[var(--accent)] ${theme === 'light' ? 'bg-[var(--accent)]' : ''}`}
                    onClick={() => { setTheme('light'); setIsOpen(false); }}
                  >
                    <SunIcon />
                    <span className="ml-2">Light</span>
                  </li>
                  <li
                    className={`flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-[var(--accent)] ${theme === 'dark' ? 'bg-[var(--accent)]' : ''}`}
                    onClick={() => { setTheme('dark'); setIsOpen(false); }}
                  >
                    <MoonIcon />
                    <span className="ml-2">Dark</span>
                  </li>
                  <li
                    className={`flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-[var(--accent)] ${theme === 'system' ? 'bg-[var(--accent)]' : ''}`}
                    onClick={() => { setTheme('system'); setIsOpen(false); }}
                  >
                    <SystemIcon />
                    <span className="ml-2">System</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


