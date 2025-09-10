import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dataPersistence } from '../services/DataPersistence'
import type { SaveSlot } from '../services/DataPersistence'

export function useSaveSlotsQuery(enabled = true) {
  return useQuery<SaveSlot[]>({
    queryKey: ['save-slots'],
    queryFn: async () => dataPersistence.getSaveSlots(),
    enabled,
    staleTime: 60_000,
  })
}

export function useDeleteSaveSlotMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['delete-save-slot'],
    mutationFn: async (slotId: string) => dataPersistence.deleteSaveSlot(slotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['save-slots'] })
    },
  })
}


