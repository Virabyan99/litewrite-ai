// app/components/AIAssistant.tsx
"use client";
import React, { useState } from "react";
import { getAllNotes, replaceAllNotes } from "../app/services/dbService";

interface Note {
  id: string;
  content: string;
  createdAt: number;
}

interface AIAssistantProps {
  onReloadNotes: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onReloadNotes }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateNotes = async () => {
    setLoading(true);
    try {
      // Fetch all existing notes
      const allNotes = await getAllNotes();
      const existingNotesText = allNotes.map((note) => note.content).join("\n");
      const fullPrompt = `Given the current notes:\n${existingNotesText}\nGenerate a new set of notes about ${prompt}. Return only the JSON array of strings, where each string is the content of a note. Do not include any additional text, code blocks, or formatting.`;

      // Send request to Gemini API
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: fullPrompt,
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
        const aiResponseText = data.data.candidates[0].content.parts[0].text;
        console.log("AI Response Text:", aiResponseText); // Log for debugging

        // Clean the response to remove any code block formatting
        let cleanedResponse = aiResponseText;
        if (cleanedResponse.startsWith("```json\n")) {
          cleanedResponse = cleanedResponse.substring(8).trim(); // Remove "```json\n"
          const lastBacktickIndex = cleanedResponse.indexOf("```");
          if (lastBacktickIndex !== -1) {
            cleanedResponse = cleanedResponse.substring(0, lastBacktickIndex).trim();
          }
        }

        try {
          const notesContent = JSON.parse(cleanedResponse);
          if (!Array.isArray(notesContent)) {
            throw new Error("AI response is not an array");
          }

          // Create new Note objects from AI response
          const generatedNotes: Note[] = notesContent.map(
            (content: string, index: number) => ({
              id: String(Date.now() + index),
              content,
              createdAt: Date.now(),
            })
          );

          // Replace all notes and refresh UI
          await replaceAllNotes(generatedNotes);
          onReloadNotes();
          setPrompt(""); // Clear the prompt after success
        } catch (error) {
          console.error("Error parsing AI response:", error);
          alert("Failed to parse AI response. Please try again.");
        }
      } else {
        console.error("AI request failed:", data.message || "Unknown error");
        alert("Failed to get a valid response from AI.");
      }
    } catch (error) {
      console.error("Error generating notes with AI:", error);
      alert("An error occurred while generating notes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-panel p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
        AI Assistant
      </h2>
      <textarea
        className="w-full p-2 mb-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border rounded-md focus:outline-none"
        placeholder="Enter a prompt for the AI (e.g., 'Create notes about project planning')..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
      />
      <button
        onClick={handleGenerateNotes}
        disabled={loading}
        className={`w-full p-2 text-white rounded-md ${
          loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "Generating..." : "Generate Notes"}
      </button>
    </div>
  );
};

export default AIAssistant;