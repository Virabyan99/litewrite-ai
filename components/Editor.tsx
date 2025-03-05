// app/components/Editor.tsx
"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash, Plus, SplitIcon, ArrowDown } from "lucide-react";
import {
  getAllNotes,
  saveNote,
  deleteNote,
  saveFontPreference,
  getFontPreference,
  replaceAllNotes,
} from "../app/services/dbService";
import FontSelector from "./FontSelector";
import AIAssistant from "./AIAssistant";
import TranslationPanel from "./TranslationPanel";
import FileImportModal from "./FileImportModal";

interface Note {
  id: string;
  content: string;
  createdAt: number;
}

const Editor: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isFontModalOpen, setFontModalOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [aiResponse, setAiResponse] = useState("");
  const [translationMode, setTranslationMode] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    loadNotes();
    loadFontPreference();
  }, []);

  useEffect(() => {
    if (translationMode && currentNote) {
      setSourceText(currentNote.content);
    }
  }, [currentNote, translationMode]);

  const loadNotes = async () => {
    const allNotes = await getAllNotes();
    setNotes(allNotes);
  };

  const loadFontPreference = async () => {
    const savedFont = await getFontPreference();
    if (savedFont) {
      setSelectedFont(savedFont);
      injectFontLink(savedFont);
    }
  };

  const injectFontLink = (fontFamily: string) => {
    const linkId = "dynamic-font-link";
    let linkEl = document.getElementById(linkId) as HTMLLinkElement | null;
    if (linkEl) linkEl.remove();
    linkEl = document.createElement("link");
    linkEl.id = linkId;
    linkEl.rel = "stylesheet";
    linkEl.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@400;700&display=swap`;
    document.head.appendChild(linkEl);
  };

  const handleFontSelect = (fontFamily: string) => {
    setSelectedFont(fontFamily);
    injectFontLink(fontFamily);
    saveFontPreference(fontFamily);
  };

  const handleSave = async () => {
    if (currentNote) {
      await saveNote(currentNote);
      loadNotes();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    loadNotes();
    setCurrentNote(null);
  };

  const handleSourceChange = (newText: string) => {
    setSourceText(newText);
    if (currentNote) {
      setCurrentNote({ ...currentNote, content: newText });
    }
  };

  const handleTranslate = async () => {
    if (!sourceText) return;
    setLoading(true);
    try {
      const prompt = `Translate the following English text to Spanish: ${sourceText}`;
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      };
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (data.success && data.data?.candidates?.length > 0) {
        const translation = data.data.candidates[0].content.parts[0].text;
        setTranslatedText(translation);
      }
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTranslation = () => {
    if (!currentNote && !translationMode) {
      alert("Please select a note to enter translation mode.");
    } else {
      setTranslationMode(!translationMode);
      if (translationMode) {
        if (currentNote) {
          const updatedNote = { ...currentNote, content: sourceText };
          setCurrentNote(updatedNote);
          saveNote(updatedNote);
          loadNotes();
        }
      } else {
        setSourceText(currentNote!.content);
        setTranslatedText("");
      }
    }
  };

  const handleAiRequest = async () => {
    if (!currentNote) {
      setAiResponse("Please select or create a note first.");
      return;
    }
    try {
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: currentNote.content || "",
              },
            ],
          },
        ],
      };
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleFileParsed = async (parsedNotes: string[]) => {
    await replaceAllNotes(parsedNotes.map((content, index) => ({
      id: String(Date.now() + index),
      content,
      createdAt: Date.now(),
    })));
    loadNotes();
  };

  const handleExport = (format: 'text' | 'json') => {
    const noteContents = notes.map(note => note.content);
    const data =
      format === 'json'
        ? JSON.stringify(noteContents, null, 2)
        : noteContents.join('\n\n');

    const blob = new Blob([data], {
      type: format === 'json' ? 'application/json' : 'text/plain',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `notes.${format === 'json' ? 'json' : 'txt'}`;
    link.click();
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notes Editor</h2>
        <button
          className="p-2 bg-blue-500 text-white rounded-md flex items-center gap-1"
          onClick={handleToggleTranslation}
        >
          {translationMode ? <SplitIcon size={20} /> : <ArrowDown size={20} />}
          {translationMode ? "Exit Translation Mode" : "Enter Translation Mode"}
        </button>
      </div>
      {translationMode ? (
        <TranslationPanel
          sourceText={sourceText}
          onSourceChange={handleSourceChange}
          translatedText={translatedText}
          onTranslate={handleTranslate}
          loading={loading}
        />
      ) : (
        <>
          <AIAssistant onReloadNotes={loadNotes} />
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
              onClick={() => setFontModalOpen(true)}
            >
              Change Font
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition-colors"
              onClick={handleAiRequest}
            >
              Get AI Suggestion
            </button>
            <button
              className="p-2 bg-green-500 text-white rounded-md"
              onClick={() => setImportModalOpen(true)}
            >
              Import Notes
            </button>
            <div className="flex gap-2">
              <button
                className="p-2 bg-blue-500 text-white rounded-md"
                onClick={() => handleExport('text')}
              >
                Export as Text
              </button>
              <button
                className="p-2 bg-blue-500 text-white rounded-md"
                onClick={() => handleExport('json')}
              >
                Export as JSON
              </button>
            </div>
          </div>
          <div className="editor-container p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
            {currentNote ? (
              <textarea
                className="w-full min-h-[200px] p-2 bg-transparent text-gray-800 dark:text-white rounded-lg focus:outline-none resize-none"
                value={currentNote.content}
                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
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
            onOpenChange={(val) => setFontModalOpen(val)}
            onFontSelect={handleFontSelect}
          />
          <FileImportModal
            isOpen={isImportModalOpen}
            onClose={() => setImportModalOpen(false)}
            onFileParsed={handleFileParsed}
          />
        </>
      )}
    </section>
  );
};

export default Editor;