import { useMemo } from 'react'
import { useStore } from '../store/store'
import type { Block, Booking, Hold } from '../store/store'
import { addDays, cn, fmtDay, parseISO, todayISO } from '../lib/utils'

export type DayState = 'free' | 'booked' | 'blocked' | 'held'

export interface DayInfo {
  date: string
  state: DayState
  booking?: Booking
  block?: Block
  hold?: Hold
}

export function useRoomDays(roomId: string, start: string, days: number): DayInfo[] {
  const { bookings, blocks, holds } = useStore()
  return useMemo(() => {
    const now = Date.now()
    const out: DayInfo[] = []
    for (let i = 0; i < days; i++) {
      const date = addDays(start, i)
      const inside = (a: { checkIn: string; checkOut: string }) => a.checkIn <= date && date < a.checkOut
      const booking = bookings.find((b) => b.roomId === roomId && b.status !== 'CANCELLED_BY_GUEST' && inside(b))
      const block = blocks.find((b) => b.roomId === roomId && inside(b))
      const hold = holds.find((h) => h.roomId === roomId && h.expiresAt > now && inside(h))
      out.push({ date, booking, block, hold, state: booking ? 'booked' : block ? 'blocked' : hold ? 'held' : 'free' })
    }
    return out
  }, [bookings, blocks, holds, roomId, start, days])
}

export function Legend({ className, labels }: { className?: string; labels?: Partial<Record<DayState, string>> }) {
  const l = { free: 'Available', booked: 'Booked', blocked: 'Walk-in block', held: 'On 15-min hold', ...labels }
  return (
    <div className={cn('flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-600', className)}>
      <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-[4px] bg-white ring-1 ring-neutral-300" />{l.free}</span>
      <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-[4px] bg-ink" />{l.booked}</span>
      <span className="inline-flex items-center gap-1.5"><span className="hatch size-3 rounded-[4px] ring-1 ring-ink" />{l.blocked}</span>
      <span className="inline-flex items-center gap-1.5"><span className="dotted-ring size-3 rounded-[4px] bg-neutral-100" />{l.held}</span>
    </div>
  )
}

export default function RoomCalendar({
  roomId,
  start = todayISO(),
  days = 30,
  range,
  onPick,
  size = 'md',
}: {
  roomId: string
  start?: string
  days?: number
  range?: { checkIn: string; checkOut: string }
  onPick?: (d: DayInfo) => void
  size?: 'md' | 'lg'
}) {
  const info = useRoomDays(roomId, start, days)
  const today = todayISO()
  return (
    <div className={cn('grid gap-1.5', size === 'lg' ? 'grid-cols-5 sm:grid-cols-7 lg:grid-cols-10' : 'grid-cols-7 sm:grid-cols-10')}>
      {info.map((d) => {
        const inRange = range && d.date >= range.checkIn && d.date < range.checkOut
        const dt = parseISO(d.date)
        return (
          <button
            type="button"
            key={d.date}
            disabled={!onPick}
            onClick={() => onPick?.(d)}
            title={`${d.date} · ${d.state}`}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-lg text-center transition',
              size === 'lg' ? 'h-16' : 'h-12',
              onPick && 'cursor-pointer hover:-translate-y-0.5',
              d.state === 'free' && 'bg-white ring-1 ring-neutral-200 hover:ring-neutral-400',
              d.state === 'booked' && 'bg-ink text-white',
              d.state === 'blocked' && 'hatch bg-white ring-1 ring-ink',
              d.state === 'held' && 'dotted-ring bg-neutral-100',
              inRange && d.state === 'free' && 'bg-neutral-100 ring-2 ring-ink',
            )}
          >
            <span className={cn('text-[9px] font-medium uppercase', d.state === 'booked' ? 'text-white/60' : 'text-neutral-500', d.state === 'blocked' && 'rounded bg-white px-0.5')}>
              {fmtDay(d.date)}
            </span>
            <span className={cn('text-sm font-semibold tabular-nums', d.state === 'blocked' && 'rounded bg-white px-1')}>{dt.getDate()}</span>
            {d.date === today && (
              <span className={cn('absolute bottom-1 size-1 rounded-full', d.state === 'booked' ? 'bg-white' : 'bg-ink')} aria-label="Today" />
            )}
          </button>
        )
      })}
    </div>
  )
}
