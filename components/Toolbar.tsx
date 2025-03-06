"use client";
import React from 'react';
import { Sun, Moon, Search } from 'lucide-react';

interface ToolbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onSearchToggle?: () => void; // Optional prop for search toggle
}

const Toolbar: React.FC<ToolbarProps> = ({ darkMode, onToggleTheme, onSearchToggle }) => {
  return (
    <header className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Litewrite AI</h1>
      <div className="flex items-center gap-2">
        {onSearchToggle && (
          <button
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={onSearchToggle}
            aria-label="Toggle Search"
          >
            <Search size={24} className="text-gray-900 dark:text-white" />
          </button>
        )}
        <button
          className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
          onClick={onToggleTheme}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <Sun size={24} className="text-gray-900 dark:text-white" />
          ) : (
            <Moon size={24} className="text-gray-900 dark:text-white" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Toolbar;