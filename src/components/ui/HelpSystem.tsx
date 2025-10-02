import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Tabs from '@radix-ui/react-tabs'
import { motion } from 'framer-motion'
import { BookOpen, Check, CircleHelp, Copy, ExternalLink, Keyboard, Rocket, Search, TriangleAlert } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { keyboardShortcutsContent } from '../help/KeyboardShortcutsContent'

// Import documentation content
import { quickStartContent } from '../help/QuickStartContent'
import { troubleshootingContent } from '../help/TroubleshootingContent'
import { userGuideContent } from '../help/UserGuideContent'
import { Badge, Button, Card, CardContent, Input } from './index'

interface HelpSystemProps {
  defaultTab?: string
  compact?: boolean
}

interface HelpSection {
  id: string
  title: string
  icon: React.ComponentType<any>
  content: any[]
  searchable: boolean
}

export const HelpSystem: React.FC<HelpSystemProps> = ({
  defaultTab = 'quick-start',
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const helpSections: HelpSection[] = [
    {
      id: 'quick-start',
      title: 'Quick Start',
      icon: Rocket,
      content: quickStartContent,
      searchable: true,
    },
    {
      id: 'user-guide',
      title: 'User Guide',
      icon: BookOpen,
      content: userGuideContent,
      searchable: true,
    },
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts',
      icon: Keyboard,
      content: keyboardShortcutsContent,
      searchable: true,
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: TriangleAlert,
      content: troubleshootingContent,
      searchable: true,
    },
  ]

  const filteredContent = useMemo(() => {
    if (!searchQuery.trim())
      return null

    const results: any[] = []
    helpSections.forEach((section) => {
      if (!section.searchable)
        return

      section.content.forEach((item) => {
        const searchText = `${item.title} ${item.content}`.toLowerCase()
        if (searchText.includes(searchQuery.toLowerCase())) {
          results.push({
            ...item,
            sectionId: section.id,
            sectionTitle: section.title,
            sectionIcon: section.icon,
          })
        }
      })
    })

    return results
  }, [searchQuery, helpSections])

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 2000)
    }
    catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const renderContent = (content: any[]) => {
    return content.map((item, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        {item.type === 'heading' && (
          <h3 className="text-display-sm mb-4 mt-8 first:mt-0 text-primary">
            {item.content}
          </h3>
        )}

        {item.type === 'subheading' && (
          <h4 className="text-body-lg font-semibold mb-3 mt-6 text-foreground">
            {item.content}
          </h4>
        )}

        {item.type === 'paragraph' && (
          <p className="text-body-regular mb-4 leading-relaxed text-muted-foreground">
            {item.content}
          </p>
        )}

        {item.type === 'list' && (
          <ul className="list-disc list-inside mb-4 space-y-2">
            {item.items.map((listItem: string, i: number) => (
              <li key={i} className="text-body-regular text-muted-foreground">
                {listItem}
              </li>
            ))}
          </ul>
        )}

        {item.type === 'table' && (
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  {item.headers.map((header: string, i: number) => (
                    <th key={i} className="text-left p-3 font-semibold text-foreground">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {item.rows.map((row: string[], i: number) => (
                  <tr key={i} className="border-b border-border">
                    {row.map((cell, j) => (
                      <td key={j} className="p-3 text-body-regular text-muted-foreground">
                        {cell.includes('**')
                          ? (
                              <code
                                className="px-2 py-1 rounded text-sm font-mono cursor-pointer hover:bg-opacity-80 transition-colors"
                                style={{
                                  backgroundColor: 'var(--popover)',
                                  color: 'var(--primary)',
                                }}
                                onClick={() => handleCopyText(cell.replace(/\*\*/g, ''))}
                              >
                                {cell.replace(/\*\*/g, '')}
                                {copiedText === cell.replace(/\*\*/g, '')
                                  ? (
                                      <Check size={12} className="inline ml-1" />
                                    )
                                  : (
                                      <Copy size={12} className="inline ml-1 opacity-50" />
                                    )}
                              </code>
                            )
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {item.type === 'code' && (
          <pre
            className="p-4 rounded-lg mb-4 overflow-x-auto cursor-pointer hover:bg-opacity-80 transition-colors"
            style={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
            }}
            onClick={() => handleCopyText(item.content)}
          >
            <code className="text-sm font-mono text-primary">
              {item.content}
            </code>
            <div className="float-right mt-1">
              {copiedText === item.content
                ? (
                    <Check className="text-accent" size={16} />
                  )
                : (
                    <Copy size={16} className="opacity-50 text-muted-foreground" />
                  )}
            </div>
          </pre>
        )}

        {item.type === 'callout' && (
          <div
            className="p-4 rounded-lg mb-4 border-l-4"
            style={{
              backgroundColor: item.variant === 'warning' ? 'var(--chart-4)' : 'var(--primary)',
              borderLeftColor: item.variant === 'warning' ? 'var(--chart-4)' : 'var(--primary)',
            }}
          >
            <p className="text-body-regular font-medium text-foreground">
              {item.content}
            </p>
          </div>
        )}
      </motion.div>
    ))
  }

  const renderSearchResults = () => {
    if (!filteredContent || filteredContent.length === 0) {
      return (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
          <p className="text-body-regular text-muted-foreground">
            {searchQuery ? 'No results found' : 'Enter a search term to find help topics'}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {filteredContent.map((item, index) => {
          const SectionIcon = item.sectionIcon
          return (
            <Card key={index} variant="default" className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <SectionIcon size={20} className="mt-1 flex-shrink-0 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <Badge variant="secondary" size="sm">
                        {item.sectionTitle}
                      </Badge>
                    </div>
                    <p className="text-body-sm line-clamp-3 text-muted-foreground">
                      {typeof item.content === 'string' ? item.content : 'Complex content - click to view'}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setActiveTab(item.sectionId)}
                    >
                      View in
                      {' '}
                      {item.sectionTitle}
                      <ExternalLink size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  if (compact) {
    return (
      <Card variant="magical">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CircleHelp className="text-primary" size={24} />
            <h3 className="text-display-sm">Help & Documentation</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {helpSections.map((section) => {
              const Icon = section.icon
              return (
                <Button
                  key={section.id}
                  variant="outline"
                  size="md"
                  className="justify-start gap-2"
                  onClick={() => setActiveTab(section.id)}
                >
                  <Icon size={16} />
                  {section.title}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="magical">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CircleHelp className="text-primary" size={28} />
            <div>
              <h2 className="text-display-md">Help & Documentation</h2>
              <p className="text-body-regular text-muted-foreground">
                Complete guide to ZimboMate V2 features and functionality
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results or Tabbed Content */}
        {searchQuery.trim()
          ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-body-lg font-semibold">Search Results</h3>
                  <Badge variant="secondary">
                    {filteredContent?.length || 0}
                    {' '}
                    results
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="ml-auto"
                  >
                    Clear Search
                  </Button>
                </div>
                <ScrollArea.Root className="h-[600px]">
                  <ScrollArea.Viewport className="w-full h-full">
                    {renderSearchResults()}
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar orientation="vertical">
                    <ScrollArea.Thumb />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </div>
            )
          : (
              <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="grid w-full grid-cols-4 mb-6">
                  {helpSections.map((section) => {
                    const Icon = section.icon
                    return (
                      <Tabs.Trigger
                        key={section.id}
                        value={section.id}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
                        style={{
                          backgroundColor: activeTab === section.id ? 'var(--primary)' : 'transparent',
                          color: activeTab === section.id ? 'white' : 'var(--muted-foreground)',
                        }}
                      >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{section.title}</span>
                      </Tabs.Trigger>
                    )
                  })}
                </Tabs.List>

                {helpSections.map(section => (
                  <Tabs.Content key={section.id} value={section.id}>
                    <ScrollArea.Root className="h-[600px]">
                      <ScrollArea.Viewport className="w-full h-full pr-4">
                        <div className="space-y-4">
                          {renderContent(section.content)}
                        </div>
                      </ScrollArea.Viewport>
                      <ScrollArea.Scrollbar orientation="vertical">
                        <ScrollArea.Thumb />
                      </ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                  </Tabs.Content>
                ))}
              </Tabs.Root>
            )}
      </CardContent>
    </Card>
  )
}

export default HelpSystem
