// components/FuzzySearch.tsx
import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'framer-motion';

interface Note {
  id: string;
  content: string;
  createdAt: number;
}

interface FuzzySearchProps {
  fuse: Fuse<Note> | null;
  onResults: (results: Note[]) => void;
}

const FuzzySearch: React.FC<FuzzySearchProps> = ({ fuse, onResults }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!fuse || !query) {
      onResults([]);
      return;
    }

    const fuseResults = fuse.search(query);
    const matchedNotes = fuseResults.map(result => result.item);
    onResults(matchedNotes);
  }, [query, fuse, onResults]);

  return (
    <div className="relative mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search notes..."
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      />
      <AnimatePresence>
        {query && (
          <motion.span
            className="absolute right-2 top-2 text-gray-500 dark:text-gray-300 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuery('')}
          >
            Clear
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FuzzySearch;