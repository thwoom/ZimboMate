export function panelLink(panelId: string): string {
  const safe = panelId.replace(/[^a-z0-9-]/gi, '').toLowerCase()
  return `/${safe || 'character-stats'}`
}


