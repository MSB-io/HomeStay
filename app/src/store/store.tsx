import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { GUEST_NAMES, HOMESTAYS, LIMITS, findRoom } from '../data/mock'
import { addDays, makeRef, nightsBetween, overlaps, refundQuote, todayISO, uid } from '../lib/utils'
import type { RefundQuote } from '../lib/utils'

export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'REVIEWED' | 'CANCELLED_BY_GUEST'
export type PayMethod = 'UPI' | 'Card' | 'Net Banking' | 'Cash'

export interface Booking {
  id: string
  ref: string
  homestayId: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  guestName: string
  phone: string
  amount: number
  method: PayMethod
  source: 'online' | 'phone' | 'walk-in'
  status: BookingStatus
  mine: boolean
  createdAt: number
  txId?: string
  refund?: RefundQuote
  pendingSync?: boolean
}

export interface Hold {
  id: string
  homestayId: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  expiresAt: number
}

export interface Block {
  id: string
  homestayId: string
  roomId: string
  checkIn: string
  checkOut: string
  reason: string
  synced: boolean
  createdAt: number
}

interface State {
  bookings: Booking[]
  holds: Hold[]
  blocks: Block[]
  online: boolean
  lastSync: number
}

export type Conflict = 'booked' | 'held' | 'blocked'
type Availability = { ok: true } | { ok: false; reason: Conflict }

interface Store extends State {
  syncing: boolean
  isAvailable: (roomId: string, checkIn: string, checkOut: string, ignoreHoldId?: string) => Availability
  acquireHold: (h: Omit<Hold, 'id' | 'expiresAt'>) => { ok: true; hold: Hold } | { ok: false; reason: Conflict }
  getHold: (id: string | undefined) => Hold | undefined
  releaseHold: (id: string) => void
  expireHoldNow: (id: string) => void
  confirmBooking: (holdId: string, details: { guestName: string; phone: string; method: PayMethod }) => Booking | null
  cancelBooking: (id: string) => RefundQuote | null
  checkInGuest: (id: string) => void
  submitReview: (id: string) => void
  addBlock: (b: Omit<Block, 'id' | 'synced' | 'createdAt'>) => { ok: true } | { ok: false; reason: Conflict }
  removeBlock: (id: string) => void
  setOnline: (online: boolean) => void
  resetDemo: () => void
}

const KEY = 'homestay-demo-state-v1'

const priceFor = (roomId: string, checkIn: string, checkOut: string) => {
  const found = findRoom(roomId)
  return found ? found.room.pricePerNight * nightsBetween(checkIn, checkOut) : 0
}

function seedState(): State {
  const today = todayISO()
  const bookings: Booking[] = []
  const blocks: Block[] = []
  let n = 0
  for (const h of HOMESTAYS) {
    for (const [ri, start, nights, source] of h.seed) {
      const room = h.rooms[ri]
      const checkIn = addDays(today, start)
      const checkOut = addDays(checkIn, nights)
      if (source === 'walk-in') {
        blocks.push({ id: uid(), homestayId: h.id, roomId: room.id, checkIn, checkOut, reason: 'Walk-in guest', synced: true, createdAt: Date.now() })
        continue
      }
      const guestName = GUEST_NAMES[n++ % GUEST_NAMES.length]
      bookings.push({
        id: uid(),
        ref: makeRef(),
        homestayId: h.id,
        roomId: room.id,
        checkIn,
        checkOut,
        guests: Math.min(room.maxGuests, room.baseCapacity),
        guestName,
        phone: `+91 98${(10000000 + n * 7919).toString().slice(0, 8)}`,
        amount: room.pricePerNight * nights,
        method: source === 'phone' ? 'Cash' : 'UPI',
        source,
        status: start === 0 ? 'CHECKED_IN' : 'CONFIRMED',
        mine: false,
        createdAt: Date.now() - (n + 1) * 3_600_000 * 7,
      })
    }
  }

  // Two bookings that belong to the demo tourist ("you").
  const past = HOMESTAYS[3].rooms[0]
  bookings.push({
    id: uid(),
    ref: makeRef(),
    homestayId: HOMESTAYS[3].id,
    roomId: past.id,
    checkIn: addDays(today, -3),
    checkOut: addDays(today, -1),
    guests: 2,
    guestName: 'Manthan B.',
    phone: '+91 98765 43210',
    amount: past.pricePerNight * 2,
    method: 'UPI',
    source: 'online',
    status: 'COMPLETED',
    mine: true,
    createdAt: Date.now() - 20 * 86_400_000,
    txId: 'TX-' + uid().toUpperCase(),
  })
  const upcoming = HOMESTAYS[1].rooms[1]
  bookings.push({
    id: uid(),
    ref: makeRef(),
    homestayId: HOMESTAYS[1].id,
    roomId: upcoming.id,
    checkIn: addDays(today, 20),
    checkOut: addDays(today, 23),
    guests: 2,
    guestName: 'Manthan B.',
    phone: '+91 98765 43210',
    amount: upcoming.pricePerNight * 3,
    method: 'Card',
    source: 'online',
    status: 'CONFIRMED',
    mine: true,
    createdAt: Date.now() - 2 * 86_400_000,
    txId: 'TX-' + uid().toUpperCase(),
  })

  return { bookings, holds: [], blocks, online: true, lastSync: Date.now() }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    /* ignore corrupt storage */
  }
  return seedState()
}

const StoreCtx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)
  const [syncing, setSyncing] = useState(false)
  // A ref mirror makes every mutation read the latest state synchronously.
  // This is what lets two "simultaneous" checkouts resolve deterministically (NFR-05).
  const ref = useRef(state)

  const commit = useCallback((fn: (s: State) => State) => {
    const next = fn(ref.current)
    ref.current = next
    setState(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }, [])

  // Cross-tab sync: open two tabs and try to book the same dates.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        const next = JSON.parse(e.newValue) as State
        ref.current = next
        setState(next)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Evict expired holds (Redis TTL equivalent).
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now()
      if (ref.current.holds.some((h) => h.expiresAt <= now)) {
        commit((s) => ({ ...s, holds: s.holds.filter((h) => h.expiresAt > now) }))
      }
    }, 1000)
    return () => clearInterval(t)
  }, [commit])

  const isAvailable = useCallback<Store['isAvailable']>((roomId, checkIn, checkOut, ignoreHoldId) => {
    const s = ref.current
    const now = Date.now()
    if (s.bookings.some((b) => b.roomId === roomId && b.status !== 'CANCELLED_BY_GUEST' && overlaps(checkIn, checkOut, b.checkIn, b.checkOut)))
      return { ok: false, reason: 'booked' }
    if (s.blocks.some((b) => b.roomId === roomId && overlaps(checkIn, checkOut, b.checkIn, b.checkOut)))
      return { ok: false, reason: 'blocked' }
    if (s.holds.some((h) => h.id !== ignoreHoldId && h.roomId === roomId && h.expiresAt > now && overlaps(checkIn, checkOut, h.checkIn, h.checkOut)))
      return { ok: false, reason: 'held' }
    return { ok: true }
  }, [])

  const acquireHold = useCallback<Store['acquireHold']>(
    (h) => {
      const avail = isAvailable(h.roomId, h.checkIn, h.checkOut)
      if (!avail.ok) return avail
      const hold: Hold = { ...h, id: 'HT-' + uid().toUpperCase(), expiresAt: Date.now() + LIMITS.holdMinutes * 60_000 }
      commit((s) => ({ ...s, holds: [...s.holds, hold] }))
      return { ok: true, hold }
    },
    [commit, isAvailable],
  )

  const getHold = useCallback((id: string | undefined) => state.holds.find((h) => h.id === id), [state.holds])

  const releaseHold = useCallback((id: string) => commit((s) => ({ ...s, holds: s.holds.filter((h) => h.id !== id) })), [commit])

  const expireHoldNow = useCallback(
    (id: string) => commit((s) => ({ ...s, holds: s.holds.map((h) => (h.id === id ? { ...h, expiresAt: Date.now() - 1 } : h)) })),
    [commit],
  )

  const confirmBooking = useCallback<Store['confirmBooking']>(
    (holdId, d) => {
      const hold = ref.current.holds.find((h) => h.id === holdId)
      // 60-second webhook grace window (DEF-03).
      if (!hold || hold.expiresAt + 60_000 < Date.now()) return null
      const booking: Booking = {
        id: uid(),
        ref: makeRef(),
        homestayId: hold.homestayId,
        roomId: hold.roomId,
        checkIn: hold.checkIn,
        checkOut: hold.checkOut,
        guests: hold.guests,
        guestName: d.guestName,
        phone: d.phone,
        amount: priceFor(hold.roomId, hold.checkIn, hold.checkOut),
        method: d.method,
        source: 'online',
        status: 'CONFIRMED',
        mine: true,
        createdAt: Date.now(),
        txId: 'TX-' + uid().toUpperCase(),
      }
      commit((s) => ({ ...s, holds: s.holds.filter((h) => h.id !== holdId), bookings: [...s.bookings, booking] }))
      return booking
    },
    [commit],
  )

  const cancelBooking = useCallback<Store['cancelBooking']>(
    (id) => {
      const b = ref.current.bookings.find((x) => x.id === id)
      if (!b) return null
      const q = refundQuote(b.checkIn, b.amount)
      commit((s) => ({ ...s, bookings: s.bookings.map((x) => (x.id === id ? { ...x, status: 'CANCELLED_BY_GUEST', refund: q } : x)) }))
      return q
    },
    [commit],
  )

  const checkInGuest = useCallback(
    (id: string) =>
      commit((s) => ({
        ...s,
        bookings: s.bookings.map((x) => (x.id === id ? { ...x, status: 'CHECKED_IN', pendingSync: !s.online } : x)),
      })),
    [commit],
  )

  const submitReview = useCallback(
    (id: string) => commit((s) => ({ ...s, bookings: s.bookings.map((x) => (x.id === id ? { ...x, status: 'REVIEWED' } : x)) })),
    [commit],
  )

  const addBlock = useCallback<Store['addBlock']>(
    (b) => {
      const avail = isAvailable(b.roomId, b.checkIn, b.checkOut)
      if (!avail.ok) return avail
      commit((s) => ({ ...s, blocks: [...s.blocks, { ...b, id: uid(), synced: s.online, createdAt: Date.now() }] }))
      return { ok: true }
    },
    [commit, isAvailable],
  )

  const removeBlock = useCallback((id: string) => commit((s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== id) })), [commit])

  const setOnline = useCallback(
    (online: boolean) => {
      commit((s) => ({ ...s, online }))
      if (online) {
        // Background sync of queued offline changes (NFR-06: <= 4 s).
        setSyncing(true)
        setTimeout(() => {
          commit((s) => ({
            ...s,
            lastSync: Date.now(),
            blocks: s.blocks.map((b) => ({ ...b, synced: true })),
            bookings: s.bookings.map((b) => ({ ...b, pendingSync: false })),
          }))
          setSyncing(false)
        }, 1400)
      }
    },
    [commit],
  )

  const resetDemo = useCallback(() => commit(() => seedState()), [commit])

  const value = useMemo<Store>(
    () => ({
      ...state,
      syncing,
      isAvailable,
      acquireHold,
      getHold,
      releaseHold,
      expireHoldNow,
      confirmBooking,
      cancelBooking,
      checkInGuest,
      submitReview,
      addBlock,
      removeBlock,
      setOnline,
      resetDemo,
    }),
    [state, syncing, isAvailable, acquireHold, getHold, releaseHold, expireHoldNow, confirmBooking, cancelBooking, checkInGuest, submitReview, addBlock, removeBlock, setOnline, resetDemo],
  )

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
