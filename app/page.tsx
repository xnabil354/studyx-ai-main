"use client";

import { useState, useEffect } from 'react';
import StudyxAi_Question from '../components/StudyxAi_Question';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // useEffect(() => {
  //   const handleContextMenu = (e: any) => e.preventDefault();
  //   const handleKeyDown = (e: any) => {
  //     if (
  //       e.key === 'F12' ||
  //       (e.ctrlKey && e.shiftKey && e.key === 'I') ||
  //       (e.ctrlKey && e.shiftKey && e.key === 'J') ||
  //       (e.ctrlKey && e.key === 'U')
  //     ) {
  //       e.preventDefault();
  //     }
  //   };

  //   document.addEventListener('contextmenu', handleContextMenu);
  //   document.addEventListener('keydown', handleKeyDown);

  //   return () => {
  //     document.removeEventListener('contextmenu', handleContextMenu);
  //     document.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, []);

  // useEffect(() => {
  //   const noop = () => {};
  //   console.log = noop;
  //   console.warn = noop;
  //   console.error = noop;
  // }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <main className="w-full max-w-2xl p-4">
        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              id="dark-mode-toggle"
              checked={isDarkMode}
              onChange={toggleDarkMode}
            />
            <label
              htmlFor="dark-mode-toggle"
              className="block w-12 h-6 bg-gray-300 rounded-full cursor-pointer"
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${isDarkMode ? 'translate-x-6 bg-yellow-500' : 'bg-blue-500'}`}>
                <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'text-yellow-500' : 'text-blue-500'}`}>
                  {isDarkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m6.364 2.364l-1.061 1.061m4.682 4.682H20.5M17.5 18.5l-1.061-1.061M12 20.5V22m-3.5-3.5l1.061 1.061M4.5 12.5H3m2.364-6.364l1.061 1.061M12 3a9 9 0 100 18 9 9 0 000-18z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 15.75l3.5-3.5m0 0l-3.5-3.5m3.5 3.5H6" />
                    </svg>
                  )}
                </div>
              </div>
            </label>
          </div>
        </div>
        <StudyxAi_Question isDarkMode={isDarkMode} />
      </main>
    </div>
  );
}
