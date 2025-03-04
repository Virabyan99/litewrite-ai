"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash, Plus } from "lucide-react";
import {
  getAllNotes,
  saveNote,
  deleteNote,
  saveFontPreference,
  getFontPreference,
} from "../app/services/dbService"; // Adjusted import path assuming app structure
import FontSelector from "./FontSelector";

interface Note {
  id: string;
  content: string;
  createdAt: number;
}

const Editor: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  // Font selection state
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Arial");

  // AI response state
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    loadNotes();
    loadFontPreference();
  }, []);

  // Load notes from IndexedDB
  const loadNotes = async () => {
    const allNotes = await getAllNotes();
    setNotes(allNotes);
  };

  // Load saved font preference
  const loadFontPreference = async () => {
    const savedFont = await getFontPreference();
    if (savedFont) {
      setSelectedFont(savedFont);
      injectFontLink(savedFont);
    }
  };

  // Inject <link> to load the Google Font
  const injectFontLink = (fontFamily: string) => {
    const linkId = "dynamic-font-link";
    let linkEl = document.getElementById(linkId) as HTMLLinkElement | null;

    if (linkEl) {
      linkEl.remove();
    }

    linkEl = document.createElement("link");
    linkEl.id = linkId;
    linkEl.rel = "stylesheet";
    linkEl.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
      / /g,
      "+"
    )}:wght@400;700&display=swap`;
    document.head.appendChild(linkEl);
  };

  // Handle user font selection
  const handleFontSelect = (fontFamily: string) => {
    setSelectedFont(fontFamily);
    injectFontLink(fontFamily);
    saveFontPreference(fontFamily);
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

  // Handle AI request for suggestions
  const handleAiRequest = async () => {
    if (!currentNote) {
      setAiResponse("Please select or create a note first.");
      return;
    }

    try {
      const requestBody = {
        "contents": [
          {
            "role": "user",
            "parts": [
              {
                "text": currentNote.content || ""
              }
            ]
          }
        ]
      }
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success && data.data?.candidates?.length > 0) {
        const text = data.data.candidates[0].content.parts[0].text;
        setAiResponse(text);
      } else {
        setAiResponse("Failed to get a response from AI: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("AI Request Error:", error);
      setAiResponse("An error occurred while communicating with Gemini AI.");
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors"
          onClick={() =>
            setCurrentNote({ id: String(Date.now()), content: "", createdAt: Date.now() })
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
        <button
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors"
          onClick={() => setIsFontModalOpen(true)}
        >
          Change Font
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition-colors"
          onClick={handleAiRequest}
        >
          Get AI Suggestion
        </button>
      </div>

      <div className="editor-container p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
        {currentNote ? (
          <textarea
            className="w-full min-h-[200px] p-2 bg-transparent text-gray-800 dark:text-white rounded-lg focus:outline-none resize-none"
            value={currentNote.content}
            onChange={(e) =>
              setCurrentNote({ ...currentNote, content: e.target.value })
            }
            placeholder="Edit your note..."
            style={{ fontFamily: selectedFont }}
          />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Select or create a note to start editing...
          </p>
        )}
      </div>

      {aiResponse && (
        <div className="mt-4 p-4 bg-gray-200 dark:bg-gray-700 rounded-md">
          <p className="text-gray-800 dark:text-white">{aiResponse}</p>
        </div>
      )}

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
                style={{ fontFamily: selectedFont }}
              >
                {note.content.slice(0, 20) || "Untitled Note"}
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

      <FontSelector
        open={isFontModalOpen}
        onOpenChange={(val) => setIsFontModalOpen(val)}
        onFontSelect={handleFontSelect}
      />
    </section>
  );
};

export default Editor;