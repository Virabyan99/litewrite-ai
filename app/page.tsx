"use client";
import React, { useState } from 'react';
import Toolbar from '../components/Toolbar';
import Editor from '../components/Editor';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  return (
    <>
      <Toolbar
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onSearchToggle={() => setShowSearch(!showSearch)}
      />
      <Editor />
    </>
  );
}