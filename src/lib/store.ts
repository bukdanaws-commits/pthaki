import { create } from 'zustand'

interface EventState {
  eventId: string
  setEventId: (id: string) => void
}

export const useEventStore = create<EventState>((set) => ({
  eventId: 'main-event',
  setEventId: (id) => set({ eventId: id }),
}))

// Display queue store for the welcome display
interface DisplayQueueState {
  currentParticipant: {
    name: string
    company: string | null
    photoUrl: string | null
  } | null
  queue: Array<{
    id: string
    name: string
    company: string | null
    photoUrl: string | null
  }>
  setCurrentParticipant: (participant: DisplayQueueState['currentParticipant']) => void
  addToQueue: (participant: { id: string; name: string; company: string | null; photoUrl: string | null }) => void
  clearQueue: () => void
}

export const useDisplayQueueStore = create<DisplayQueueState>((set) => ({
  currentParticipant: null,
  queue: [],
  setCurrentParticipant: (participant) => set({ currentParticipant: participant }),
  addToQueue: (participant) => set((state) => ({ queue: [...state.queue, participant] })),
  clearQueue: () => set({ queue: [] }),
}))
