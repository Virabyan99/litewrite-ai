// app/components/FileImportModal.tsx
"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDeviceId } from "@/app/utils/deviceId";

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileParsed: (parsedNotes: string[]) => void;
}

const FileImportModal: React.FC<FileImportModalProps> = ({ isOpen, onClose, onFileParsed }) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = async () => {
    if (!fileContent) return;
    setLoading(true);
    try {
      const deviceId = await getDeviceId(); // Retrieve the device ID
      const prompt = `You are given a text file content. Your task is to parse this content into a list of notes, where each note is a separate string. Return only the JSON array of strings, without any additional text, code blocks, or formatting.\n\nExample:\nIf the text is:\n- Note 1\n- Note 2\nThen, the JSON array should be:\n["Note 1", "Note 2"]\nIf the text has paragraphs, each paragraph should be considered a separate note.\n\nText:\n${fileContent}`;
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
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId, // Add the device ID to the headers
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (data.success && data.data?.candidates?.length > 0) {
        const aiResponseText = data.data.candidates[0].content.parts[0].text;
        console.log("AI Response Text:", aiResponseText); // Log for debugging
  
        // Clean the response to remove Markdown code blocks
        let cleanedResponse = aiResponseText;
        if (cleanedResponse.startsWith("```json\n")) {
          cleanedResponse = cleanedResponse.substring(8).trim(); // Remove "```json\n"
          const lastBacktickIndex = cleanedResponse.indexOf("```");
          if (lastBacktickIndex !== -1) {
            cleanedResponse = cleanedResponse.substring(0, lastBacktickIndex).trim();
          }
        } else if (cleanedResponse.startsWith("```")) {
          cleanedResponse = cleanedResponse.substring(3).trim(); // Remove "```" (handles ```python or others)
          const lastBacktickIndex = cleanedResponse.indexOf("```");
          if (lastBacktickIndex !== -1) {
            cleanedResponse = cleanedResponse.substring(0, lastBacktickIndex).trim();
          }
        }
  
        try {
          const parsedNotes = JSON.parse(cleanedResponse);
          if (Array.isArray(parsedNotes)) {
            onFileParsed(parsedNotes);
            onClose();
          } else {
            throw new Error("AI response is not an array");
          }
        } catch (error) {
          console.error("Error parsing AI response:", error);
          alert("Failed to parse file data.");
        }
      } else {
        alert("Failed to parse file data.");
      }
    } catch (error) {
      console.error("File parsing error:", error);
      alert("An error occurred while parsing the file.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Import Notes from File</h2>
            <div
              className={`mb-4 p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleOpenFilePicker}
            >
              <p className="text-center text-gray-600 dark:text-gray-300">
                {dragActive
                  ? "Drop file here..."
                  : "Drag and drop a file here, or click to select a file (.txt, .json)"}
              </p>
              {isLoading && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-blue-500 animate-pulse">Parsing...</span>
                </motion.div>
              )}
            </div>
            <input
              type="file"
              accept=".txt,.json"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {fileContent ? "File selected" : "No file chosen"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleFileUpload}
                disabled={isLoading || !fileContent}
                className="p-3 w-full bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Parsing..." : "Upload and Parse"}
              </button>
              <button
                onClick={onClose}
                className="p-3 w-full bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FileImportModal;