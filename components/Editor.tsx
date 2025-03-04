"use client";
// components/Editor.tsx
import React, { useEffect, useState } from 'react';
import { getAllNotes, saveNote, deleteNote } from '../app/services/dbService';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash, Plus } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: number;
}

const Editor: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  // Load notes from IndexedDB
  const loadNotes = async () => {
    const allNotes = await getAllNotes();
    setNotes(allNotes);
  };

  // Save or update the current note
  const handleSave = async () => {
    if (currentNote) {
      await saveNote(currentNote);
      loadNotes();
    }
  };

  // Delete a note
  const handleDelete = async (id: string) => {
    await deleteNote(id);
    loadNotes();
    setCurrentNote(null);
  };

  return (
    <section className="flex flex-col gap-6">
      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
          onClick={() =>
            setCurrentNote({ id: String(Date.now()), content: '', createdAt: Date.now() })
          }
        >
          <Plus size={20} />
          New Note
        </button>
        {currentNote && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
            onClick={handleSave}
          >
            Save Note
          </button>
        )}
      </div>

      {/* Editor */}
      <div className="editor-container p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
        {currentNote ? (
          <textarea
            className="w-full min-h-[200px] p-2 bg-transparent text-gray-800 dark:text-white rounded-lg focus:outline-none resize-none"
            value={currentNote.content}
            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            placeholder="Edit your note..."
          />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Select or create a note to start editing...
          </p>
        )}
      </div>

      {/* Note List */}
      <div className="note-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p
                className="text-gray-800 dark:text-white cursor-pointer"
                onClick={() => setCurrentNote(note)}
              >
                {note.content.slice(0, 20) || 'Untitled Note'}
              </p>
              <button
                className="text-red-500 ml-2 hover:text-red-600"
                onClick={() => handleDelete(note.id)}
              >
                <Trash size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Editor;
