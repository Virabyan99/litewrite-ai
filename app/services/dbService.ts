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

// Only open the database if window is defined (i.e. on the client)
const dbPromise =
  typeof window !== 'undefined'
    ? openDB<NotesDB>('litewrite-db', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('notes')) {
            db.createObjectStore('notes', { keyPath: 'id' });
          }
        },
      })
    : null;

export async function getAllNotes(): Promise<Note[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAll('notes');
}

export async function replaceAllNotes(notes: Note[]): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    await store.clear();
    for (const note of notes) {
      await store.put(note);
    }
    await tx.done;
  }

export async function saveNote(note: Note): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put('notes', note);
}

export async function deleteNote(id: string): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('notes', id);
}

/* -------------------------------------------
   Font preference functions
------------------------------------------- */
export async function saveFontPreference(fontFamily: string): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  // Store the font preference as a special "note" with a known ID
  await db.put('notes', {
    id: 'font-preference',
    content: fontFamily,
    createdAt: Date.now(),
  });
}

export async function getFontPreference(): Promise<string | null> {
  if (!dbPromise) return null;
  const db = await dbPromise;
  const record = await db.get('notes', 'font-preference');
  return record?.content ?? null;
}
