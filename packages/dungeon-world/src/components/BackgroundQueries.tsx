import React from 'react'
import { useQuery } from '@tanstack/react-query'

// Minimal background query to validate provider/devtools without UI changes
export default function BackgroundQueries() {
  useQuery({
    queryKey: ['noop-healthcheck'],
    queryFn: async () => true,
    staleTime: 60_000,
  })
  return null
}


