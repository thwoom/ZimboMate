/**
 * Command Palette Demo App
 * Showcases the command palette system
 */

import './index.css'
import React from 'react'
import { CommandPalette } from './components/CommandPalette'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { useCommandPalette } from './lib/hooks/useCommandPalette'
import { 
  CommandLineIcon,
  KeyboardIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function App() {
  const { isOpen, setIsOpen } = useCommandPalette()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="glass-header sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Dungeon World</h1>
                  <p className="text-sm text-gray-400">Command Palette Demo</p>
                </div>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-6">
              <CommandLineIcon className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4">
              Command Palette System
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              A powerful, keyboard-first interface for accessing all application features. 
              Search, navigate, and execute commands with lightning speed.
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsOpen(true)}
                className="glass px-6 py-3 rounded-lg text-white font-medium hover:glass-hover transition-all duration-200 flex items-center gap-2"
              >
                <CommandLineIcon className="w-5 h-5" />
                Open Command Palette
              </button>
              <div className="flex items-center gap-2 text-gray-400">
                <KeyboardIcon className="w-4 h-4" />
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘K</kbd>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="glass p-6 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <CommandLineIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Fuzzy Search
              </h3>
              <p className="text-gray-400">
                Find commands quickly with intelligent fuzzy matching. Type partial words and get relevant results.
              </p>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <KeyboardIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Keyboard Shortcuts
              </h3>
              <p className="text-gray-400">
                Every command has keyboard shortcuts. Navigate and execute without touching the mouse.
              </p>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <SparklesIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Smart Categories
              </h3>
              <p className="text-gray-400">
                Commands are organized by category: Character, Combat, Navigation, System, and Equipment.
              </p>
            </div>
          </div>

          {/* Available Commands */}
          <div className="glass p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-white mb-6">Available Commands</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  Navigation
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Go to Dashboard</span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘H</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Open Settings</span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘,</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Show Help</span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘?</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  System
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Toggle Theme</span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘T</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Reload Application</span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘R</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Command Palette</span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘K</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-300 text-sm">
                <strong>Pro Tip:</strong> Press <kbd className="px-1 py-0.5 bg-blue-700 rounded text-xs">⌘K</kbd> to open the command palette, 
                then start typing to search. Use arrow keys to navigate and Enter to execute commands.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={isOpen} onOpenChange={setIsOpen} />
    </div>
  )
}