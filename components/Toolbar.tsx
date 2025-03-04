"use client";
// components/Toolbar.tsx
import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const Toolbar: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  return (
    <header className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Litewrite AI</h1>
      <button
        className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
        onClick={toggleTheme}
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? (
          <Sun size={24} className="text-gray-900 dark:text-white" />
        ) : (
          <Moon size={24} className="text-gray-900 dark:text-white" />
        )}
      </button>
    </header>
  );
};

export default Toolbar;
