"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { api } from "@/lib/api-client"

interface MeetupEvent {
  id: string
  title: string
  date: string
  dateTime: string
  location: string
  attendees: number
  description?: string
  eventUrl: string
  isPast: boolean
}

interface MeetupData {
  memberCount: number | null
  events: MeetupEvent[]
  loading: boolean
}

const MeetupContext = createContext<MeetupData>({
  memberCount: null,
  events: [],
  loading: true,
})

export function MeetupProvider({ children }: { children: ReactNode }) {
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [events, setEvents]           = useState<MeetupEvent[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    api.meetup.data()
      .then((d) => {
        setMemberCount(d.memberCount)
        setEvents(d.events as MeetupEvent[])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <MeetupContext.Provider value={{ memberCount, events, loading }}>
      {children}
    </MeetupContext.Provider>
  )
}

export function useMeetup() {
  return useContext(MeetupContext)
}
