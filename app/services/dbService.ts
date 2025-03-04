// services/dbService.ts
import { openDB, DBSchema } from 'idb';

interface Note {
  id: string;
  content: string;
  createdAt: number;
}

interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
  };
}

// Check if running on the client before initializing IndexedDB
const dbPromise = typeof window !== 'undefined'
  ? openDB<NotesDB>('litewrite-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
      },
    })
  : null;

// Fetch all notes
export async function getAllNotes(): Promise<Note[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAll('notes');
}

// Add or update a note
export async function saveNote(note: Note): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put('notes', note);
}

// Delete a note
export async function deleteNote(id: string): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('notes', id);
}
