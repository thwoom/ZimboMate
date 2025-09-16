/**
 * PageNavigation Component for ZimboMate V2
 * Interactive page navigation with animated controls
 */

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, BookOpen, X } from 'lucide-react'
import { Button } from '../../ui'

interface PageNavigationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onClose?: () => void
  className?: string
}

export function PageNavigation({
  currentPage,
  totalPages,
  onPageChange,
  onClose,
  className = ''
}: PageNavigationProps) {
  const canGoBack = currentPage > 0
  const canGoForward = currentPage < totalPages - 1

  const handlePreviousPage = () => {
    if (canGoBack) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (canGoForward) {
      onPageChange(currentPage + 1)
    }
  }

  const getPageName = (page: number) => {
    const pages = ['Spells', 'Spell Slots', 'Prepared', 'Cantrips']
    return pages[page] || `Page ${page + 1}`
  }

  return (
    <motion.div
      className={`flex items-center justify-between p-4 bg-parchment-100/80 backdrop-blur-sm border-b border-gold-300/30 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left side - Previous page */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreviousPage}
          disabled={!canGoBack}
          className="gap-2"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        
        {canGoBack && (
          <motion.span
            className="text-ui-small text-parchment-600"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {getPageName(currentPage - 1)}
          </motion.span>
        )}
      </div>

      {/* Center - Current page and book icon */}
      <div className="flex items-center gap-3">
        <BookOpen size={20} className="text-gold-500" />
        <div className="text-center">
          <div className="text-display-sm font-display text-parchment-900">
            {getPageName(currentPage)}
          </div>
          <div className="text-ui-small text-parchment-600">
            Page {currentPage + 1} of {totalPages}
          </div>
        </div>
        
        {/* Page dots indicator */}
        <div className="flex gap-1 ml-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <motion.button
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === currentPage 
                  ? 'bg-gold-500 w-6' 
                  : 'bg-parchment-300 hover:bg-parchment-400'
              }`}
              onClick={() => onPageChange(i)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      {/* Right side - Next page and close */}
      <div className="flex items-center gap-3">
        {canGoForward && (
          <motion.span
            className="text-ui-small text-parchment-600"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {getPageName(currentPage + 1)}
          </motion.span>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextPage}
          disabled={!canGoForward}
          className="gap-2"
        >
          Next
          <ChevronRight size={16} />
        </Button>

        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-2 text-parchment-600 hover:text-parchment-900"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </motion.div>
  )
}