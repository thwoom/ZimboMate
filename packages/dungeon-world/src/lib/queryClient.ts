import { QueryClient } from '@tanstack/react-query'

// Conservative defaults to avoid surprising refetches while we migrate
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Avoid background surprises during migration/testing
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
      // Keep suspense off until we explicitly opt in per-query
      suspense: false,
    },
    mutations: {
      retry: false,
    },
  },
})



