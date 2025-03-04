// components/FontSelector.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'

interface FontItem {
  family: string
  category: string
}

interface FontSelectorProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  onFontSelect: (fontFamily: string) => void
}

const GOOGLE_FONTS_API =
  'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBXFUfbgjgXebLhWOT7aSR3meJI6oFLqCw'

export default function FontSelector({
  open,
  onOpenChange,
  onFontSelect,
}: FontSelectorProps) {
  const [fonts, setFonts] = useState<FontItem[]>([])

  useEffect(() => {
    if (open) {
      fetchFonts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const fetchFonts = async () => {
    try {
      const response = await fetch(GOOGLE_FONTS_API);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.items && Array.isArray(data.items)) {
        // Load the first 50 fonts to keep it snappy
        setFonts(data.items.slice(0, 50));
      } else {
        console.error("Invalid API response: 'items' is missing.", data);
        setFonts([]); // or handle accordingly
      }
    } catch (error) {
      console.error("Failed to load fonts", error);
    }
  };
  

  const handleFontClick = (font: FontItem) => {
    onFontSelect(font.family)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent forceMount>
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              key="font-selector"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-md max-w-lg w-full shadow-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                  Select a Google Font
                </DialogTitle>
              </DialogHeader>

              <div className="overflow-y-auto max-h-64 mt-4 space-y-1">
                {fonts.map((font) => (
                  <Button
                    key={font.family}
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                    style={{ fontFamily: font.family }}
                    onClick={() => handleFontClick(font)}>
                    {font.family}
                  </Button>
                ))}
              </div>

              <div className="mt-4">
                <Button
                  className="bg-red-500 text-white hover:bg-red-600"
                  onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
