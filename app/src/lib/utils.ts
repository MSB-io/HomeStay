import { LIMITS } from '../data/mock'

const pad = (n: number) => String(n).padStart(2, '0')

/** Local-date ISO string (YYYY-MM-DD). Avoids UTC drift (see DEF-04 in the test log). */
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const parseISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayISO = () => toISO(new Date())

export const addDays = (s: string, n: number) => {
  const d = parseISO(s)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const nightsBetween = (a: string, b: string) =>
  Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86_400_000)

export const overlaps = (aIn: string, aOut: string, bIn: string, bOut: string) => aIn < bOut && bIn < aOut

export const fmtDate = (s: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  parseISO(s).toLocaleDateString('en-IN', opts)

export const fmtDay = (s: string) => parseISO(s).toLocaleDateString('en-IN', { weekday: 'short' })

export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export const inrCompact = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(n >= 1000000 ? 1 : 2)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`
  return inr(n)
}

export const cn = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')

// ---------- Validation (Boundary Value Analysis rules from the test plan) ----------

export function validateGuests(raw: number, roomMax?: number): string | null {
  if (!Number.isFinite(raw) || !Number.isInteger(raw)) return 'Numeric integer required.'
  if (raw < LIMITS.minGuests) return 'Minimum 1 guest required.'
  if (raw > LIMITS.maxGuests) return 'Max capacity is 10. Book an additional room.'
  if (roomMax && raw > roomMax) return `This room fits up to ${roomMax} guests. Pick a larger room.`
  return null
}

export function validateStay(checkIn: string, checkOut: string): string | null {
  if (!checkIn || !checkOut) return 'Select check-in and check-out dates.'
  if (checkIn < todayISO()) return 'Check-in date cannot be in the past.'
  const n = nightsBetween(checkIn, checkOut)
  if (n < 0) return 'Check-out date cannot precede check-in date.'
  if (n < LIMITS.minNights) return 'Minimum stay is 1 night (no day-use bookings).'
  if (n > LIMITS.maxNights) return 'Stays over 30 days require direct association lease.'
  return null
}

// ---------- Tiered cancellation rules (FR-08 / decision table R5–R9) ----------

export interface RefundQuote {
  tier: 'T1' | 'T2' | 'T3' | 'T4'
  label: string
  pct: number
  fee: number
  refund: number
  toHost: number
}

export function refundQuote(checkIn: string, amount: number, now = new Date()): RefundQuote {
  // Check-in time is 12:00 local on the check-in date.
  const checkInAt = parseISO(checkIn).getTime() + 12 * 3_600_000
  const hours = (checkInAt - now.getTime()) / 3_600_000
  let tier: RefundQuote['tier']
  let pct: number
  let label: string
  if (hours > 168) {
    tier = 'T1'
    pct = 100
    label = 'More than 7 days before check-in'
  } else if (hours >= 48) {
    tier = 'T2'
    pct = 50
    label = '2 to 7 days before check-in'
  } else if (hours > 0) {
    tier = 'T3'
    pct = 0
    label = 'Less than 48 hours before check-in'
  } else {
    tier = 'T4'
    pct = 0
    label = 'After check-in time'
  }
  // Integer-paisa style arithmetic (see DEF-06): round once at the end.
  const gross = Math.round((amount * pct) / 100)
  const fee = pct === 100 ? Math.round((amount * LIMITS.gatewayFeePct) / 100) : 0
  const refund = gross - fee
  return { tier, label, pct, fee, refund, toHost: amount - gross }
}

export const makeRef = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `HS-${s}`
}

export const uid = () => Math.random().toString(36).slice(2, 10)

/** Deterministic pseudo-random generator for stable mock values. */
export function seeded(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 10000) / 10000
  }
}
