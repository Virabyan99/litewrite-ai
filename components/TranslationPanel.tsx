// app/components/TranslationPanel.tsx
"use client";
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface TranslationPanelProps {
  sourceText: string;
  onSourceChange: (text: string) => void;
  translatedText: string;
  onTranslate: () => void;
  loading: boolean;
}

const TranslationPanel: React.FC<TranslationPanelProps> = ({
  sourceText,
  onSourceChange,
  translatedText,
  onTranslate,
  loading,
}) => {
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const translatedRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sourceRef.current && translatedRef.current) {
        translatedRef.current.scrollTop = sourceRef.current.scrollTop;
      }
    };
    sourceRef.current?.addEventListener("scroll", handleScroll);
    return () => sourceRef.current?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex gap-4">
      <motion.div
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h2 className="text-lg font-semibold mb-2">Original Text</h2>
        <textarea
          ref={sourceRef}
          className="w-full h-64 p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border rounded-md"
          value={sourceText}
          onChange={(e) => onSourceChange(e.target.value)}
          placeholder="Type or edit your original text here..."
        />
        <button
          onClick={onTranslate}
          disabled={loading}
          className="mt-2 p-2 bg-green-500 text-white rounded-md"
        >
          {loading ? "Translating..." : "Translate"}
        </button>
      </motion.div>
      <motion.div
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h2 className="text-lg font-semibold mb-2">Translated Text</h2>
        <textarea
          ref={translatedRef}
          className="w-full h-64 p-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white border rounded-md"
          value={translatedText}
          readOnly
          placeholder="Translation will appear here..."
        />
      </motion.div>
    </div>
  );
};

export default TranslationPanel;