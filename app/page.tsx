// pages/index.tsx
import React from 'react';
import Toolbar from '../components/Toolbar';
import Editor from '../components/Editor';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Toolbar />
      <main className="max-w-6xl mx-auto p-6 mt-6">
        <Editor />
      </main>
    </div>
  );
};

export default Home;
