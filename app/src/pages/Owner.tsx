import { useMemo, useState } from 'react'
import {
  Ban,
  ChevronDown,
  DoorOpen,
  Loader2,
  Plus,
  Smartphone,
  Trash2,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { HOMESTAYS } from '../data/mock'
import { useStore } from '../store/store'
import type { Conflict } from '../store/store'
import { addDays, cn, fmtDate, inr, nightsBetween, todayISO } from '../lib/utils'
import RoomCalendar, { Legend } from '../components/RoomCalendar'
import type { DayInfo } from '../components/RoomCalendar'
import { Button, Card, Eyebrow, Field, Modal, Pill, Stat, inputCls } from '../components/ui'

export default function Owner() {
  const { bookings, blocks, online, syncing, lastSync, setOnline, checkInGuest, addBlock, removeBlock } = useStore()

  // Select which homestay to manage (default to Kamla Devi's Pine Ridge Homestay)
  const [homestayId, setHomestayId] = useState(HOMESTAYS[0].id)
  const homestay = useMemo(() => HOMESTAYS.find((h) => h.id === homestayId) ?? HOMESTAYS[0], [homestayId])

  // Selected room for calendar view
  const [selectedRoomId, setSelectedRoomId] = useState(homestay.rooms[0].id)
  // Ensure selectedRoomId stays valid when switching homestay
  const activeRoomId = homestay.rooms.some((r) => r.id === selectedRoomId) ? selectedRoomId : homestay.rooms[0].id
  const activeRoom = homestay.rooms.find((r) => r.id === activeRoomId) ?? homestay.rooms[0]

  const today = todayISO()

  // Walk-in modal state
  const [walkInOpen, setWalkInOpen] = useState(false)
  const [blockRoomId, setBlockRoomId] = useState(activeRoom.id)
  const [blockCheckIn, setBlockCheckIn] = useState(today)
  const [blockCheckOut, setBlockCheckOut] = useState(addDays(today, 1))
  const [blockReason, setBlockReason] = useState('Walk-in guest from road')
  const [blockError, setBlockError] = useState<string | null>(null)

  // Details modal for clicked calendar day
  const [dayModal, setDayModal] = useState<DayInfo | null>(null)

  // Filter homestay bookings
  const hsBookings = useMemo(
    () => bookings.filter((b) => b.homestayId === homestay.id && b.status !== 'CANCELLED_BY_GUEST'),
    [bookings, homestay.id],
  )
  const hsBlocks = useMemo(
    () => blocks.filter((b) => b.homestayId === homestay.id),
    [blocks, homestay.id],
  )

  // Today's arrivals, active guests, and departures
  const arrivalsToday = hsBookings.filter((b) => b.checkIn === today && b.status === 'CONFIRMED')
  const inHouseToday = hsBookings.filter((b) => b.status === 'CHECKED_IN')
  const departuresToday = hsBookings.filter((b) => b.checkOut === today)

  // Revenue calculation
  const totalRevenue = hsBookings.reduce((sum, b) => sum + b.amount, 0)
  const confirmedCount = hsBookings.length

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (blockCheckOut <= blockCheckIn) {
      setBlockError('Check-out must be after check-in.')
      return
    }
    const res = addBlock({
      homestayId: homestay.id,
      roomId: blockRoomId,
      checkIn: blockCheckIn,
      checkOut: blockCheckOut,
      reason: blockReason,
    })
    if (!res.ok) {
      const msg: Record<Conflict, string> = {
        booked: 'Room already booked on these dates.',
        held: 'Dates currently locked by an online tourist (15-min hold).',
        blocked: 'Dates already blocked.',
      }
      setBlockError(msg[res.reason])
      return
    }
    setWalkInOpen(false)
    setBlockError(null)
  }

  const handleCalendarPick = (d: DayInfo) => {
    setDayModal(d)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      {/* Top Banner: Low-Bandwidth / Offline-First Simulation Control */}
      <div className="mb-6 flex flex-col gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('grid size-9 place-items-center rounded-md text-white transition-colors', online ? 'bg-ink' : 'bg-neutral-600')}>
            {online ? <Wifi className="size-5" /> : <WifiOff className="size-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {online ? 'Online (Synchronized)' : 'Offline Mode (Local IndexedDB Active)'}
              </span>
              <Pill solid={online}>{online ? '2G / EDGE' : 'No Signal'}</Pill>
              {syncing && (
                <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                  <Loader2 className="size-3 animate-spin" /> Syncing...
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              {online
                ? `Last background sync completed at ${new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.`
                : 'Changes are cached locally in browser storage. Will auto-sync when network returns (NFR-06).'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOnline(!online)}
            className="w-full sm:w-auto"
            id="toggle-network-mode"
          >
            {online ? (
              <>
                <WifiOff className="size-3.5" /> Simulate Hill Dropout
              </>
            ) : (
              <>
                <Wifi className="size-3.5" /> Reconnect Signal
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Header & Property Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Homestay Operator PWA · Uttarakhand</Eyebrow>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{homestay.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-neutral-500">
            <span>{homestay.owner.name}</span>
            <span>·</span>
            <span>{homestay.village}, {homestay.district}</span>
            <span>·</span>
            <span>Licence: {homestay.license}</span>
          </p>
        </div>

        {/* Property Switcher for Testing Different Hill Clusters */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-500">Managing:</label>
          <div className="relative">
            <select
              value={homestayId}
              onChange={(e) => {
                setHomestayId(e.target.value)
                const next = HOMESTAYS.find((h) => h.id === e.target.value)
                if (next) setSelectedRoomId(next.rooms[0].id)
              }}
              className="h-9 rounded-md border border-neutral-300 bg-white pr-8 pl-3 text-xs font-medium text-ink outline-none hover:border-neutral-400 focus:border-ink"
              id="owner-homestay-selector"
            >
              {HOMESTAYS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.village}, {h.district})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-3 right-2.5 size-4 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* Quick Action Button for Direct Phone / Walk-in Block (FR-06) */}
      <div className="mt-6">
        <Button
          size="lg"
          className="w-full sm:w-auto"
          id="walkin-block-button"
          onClick={() => {
            setBlockRoomId(activeRoom.id)
            setBlockCheckIn(today)
            setBlockCheckOut(addDays(today, 1))
            setBlockError(null)
            setWalkInOpen(true)
          }}
        >
          <Plus className="size-4" /> Block Room for Walk-In / Phone Guest (Instant 1-Tap)
        </Button>
      </div>

      {/* Operations Quick Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Stat
          label="Today's Arrivals"
          value={arrivalsToday.length}
          sub={arrivalsToday.length === 0 ? 'No check-ins due' : `${arrivalsToday.length} guest(s) arriving`}
        />
        <Stat
          label="Currently In-House"
          value={inHouseToday.length}
          sub={
            departuresToday.length > 0
              ? `${departuresToday.length} check-out today`
              : `${inHouseToday.reduce((a, b) => a + b.guests, 0)} guests staying`
          }
        />
        <Stat
          label="Confirmed Stays"
          value={confirmedCount}
          sub="30-day forward window"
        />
        <Stat
          label="Gross Booking Value"
          value={inr(totalRevenue)}
          sub="Pended in Escrow"
        />
      </div>

      {/* Main Grid: Arrivals Queue & 30-Day Calendar */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[400px_1fr]">
        {/* Left Column: Today's Action Queue */}
        <div className="space-y-6">
          {/* Arrivals Today (Check-In Action) */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <DoorOpen className="size-4.5" /> Today's Check-Ins
              </h2>
              <span className="text-xs text-neutral-500">{fmtDate(today, { month: 'short', day: 'numeric' })}</span>
            </div>

            {arrivalsToday.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-400">No new check-ins scheduled for today.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {arrivalsToday.map((b) => (
                  <div key={b.id} className="rounded-md border border-neutral-200 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{b.guestName}</p>
                        <p className="text-xs text-neutral-500">
                          {b.phone} · {b.guests} guest(s)
                        </p>
                      </div>
                      <Pill solid>{b.ref}</Pill>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-100 text-xs text-neutral-600">
                      <span>Until {fmtDate(b.checkOut)} ({nightsBetween(b.checkIn, b.checkOut)}n)</span>
                      <Button
                        size="sm"
                        id={`checkin-btn-${b.ref}`}
                        onClick={() => checkInGuest(b.id)}
                      >
                        <UserCheck className="size-3.5" /> Check-In Guest
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Currently Checked-In Guests */}
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Users className="size-4.5" /> In-House Guests
            </h2>

            {inHouseToday.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-400">No guests currently checked in.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {inHouseToday.map((b) => (
                  <div key={b.id} className="rounded-md bg-neutral-50 p-3 border border-neutral-200/60">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{b.guestName}</p>
                      <Pill>Checked In</Pill>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      Departing {fmtDate(b.checkOut)} · {inr(b.amount)} paid
                    </p>
                    {b.pendingSync && (
                      <p className="mt-1 text-[11px] text-neutral-500 italic">
                        * Check-in recorded offline. Will sync when connected.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Manual Walk-In Blocks */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Ban className="size-4.5" /> Walk-In / Phone Blocks
              </h2>
              <span className="text-xs text-neutral-500">{hsBlocks.length} active</span>
            </div>

            {hsBlocks.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-400">No manual date blocks active.</p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {hsBlocks.map((blk) => {
                  const rm = homestay.rooms.find((r) => r.id === blk.roomId)
                  return (
                    <div key={blk.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-3">
                      <div>
                        <p className="text-sm font-medium">{rm?.name ?? 'Room'}</p>
                        <p className="text-xs text-neutral-500">
                          {fmtDate(blk.checkIn)} → {fmtDate(blk.checkOut)} ({nightsBetween(blk.checkIn, blk.checkOut)}n)
                        </p>
                        <p className="text-[11px] text-neutral-400">{blk.reason}</p>
                      </div>
                      <button
                        onClick={() => removeBlock(blk.id)}
                        className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-ink cursor-pointer"
                        title="Remove Block"
                        id={`remove-block-${blk.id}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: 30-Day Room Availability Calendars */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Eyebrow>30-Day Inventory Grid (FR-05)</Eyebrow>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">Room Calendar &amp; Live Locks</h2>
              </div>

              {/* Room Tabs */}
              <div className="flex flex-wrap gap-1 rounded-md border border-neutral-200 p-1">
                {homestay.rooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoomId(r.id)}
                    className={cn(
                      'rounded px-2.5 py-1 text-xs font-medium transition cursor-pointer',
                      r.id === activeRoomId ? 'bg-ink text-white' : 'text-neutral-600 hover:text-ink',
                    )}
                    id={`owner-room-tab-${r.id}`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-3 text-xs text-neutral-500">
              Tap any day on the calendar to view booking specifics or guest details.
            </p>

            <Legend
              className="mt-4"
              labels={{
                free: 'Vacant (Open online)',
                booked: 'Confirmed Booking',
                blocked: 'Walk-In / Phone Block',
                held: '15-Min Tourist Hold',
              }}
            />

            <div className="mt-6">
              <RoomCalendar
                roomId={activeRoom.id}
                days={30}
                size="lg"
                onPick={handleCalendarPick}
              />
            </div>
          </Card>

          {/* Simple Owner Education Tip for Hill Villages */}
          <div className="rounded-md border border-dashed border-neutral-300 p-5 bg-white">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone className="size-4" /> Hill Host Operating Guide
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-neutral-600">
              <li>• <strong>Walk-in guest at your door?</strong> Tap "Block Room" immediately so an online tourist doesn't book it.</li>
              <li>• <strong>No internet?</strong> The app keeps working offline. All changes sync once mobile connectivity resumes.</li>
              <li>• <strong>SMS Voucher:</strong> Guests are instructed to show their 6-character reference code (e.g. HS-K9P2X) upon arrival.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal: Manual Walk-In / Phone Block (FR-06) */}
      <Modal open={walkInOpen} onClose={() => setWalkInOpen(false)} title="Block Room for Walk-In / Phone Guest">
        <form onSubmit={handleWalkInSubmit} className="space-y-4">
          <Field label="Select Room">
            <select
              value={blockRoomId}
              onChange={(e) => setBlockRoomId(e.target.value)}
              className={inputCls}
              id="block-room-select"
            >
              {homestay.rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (Fits up to {r.maxGuests} guests)
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-In Date">
              <input
                type="date"
                min={today}
                value={blockCheckIn}
                onChange={(e) => setBlockCheckIn(e.target.value)}
                className={inputCls}
                id="block-checkin-input"
              />
            </Field>
            <Field label="Check-Out Date">
              <input
                type="date"
                min={blockCheckIn}
                value={blockCheckOut}
                onChange={(e) => setBlockCheckOut(e.target.value)}
                className={inputCls}
                id="block-checkout-input"
              />
            </Field>
          </div>

          <Field label="Reason / Guest Name" hint="Helps you remember who took the room">
            <input
              type="text"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="e.g. Ramesh Kumar (Phone inquiry)"
              className={inputCls}
              id="block-reason-input"
            />
          </Field>

          {blockError && (
            <p className="rounded-md bg-neutral-100 p-3 text-xs font-medium text-ink ring-1 ring-ink/20">
              {blockError}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setWalkInOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" id="confirm-walkin-block">
              Block Dates
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Day Details upon Calendar Click */}
      <Modal open={!!dayModal} onClose={() => setDayModal(null)} title={`Date Details: ${dayModal ? fmtDate(dayModal.date, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : ''}`}>
        {dayModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Inventory State</span>
              <Pill solid={dayModal.state === 'booked'}>
                {dayModal.state === 'free' && 'Vacant / Available'}
                {dayModal.state === 'booked' && 'Confirmed Reservation'}
                {dayModal.state === 'blocked' && 'Manual Walk-In Block'}
                {dayModal.state === 'held' && 'Temporary 15-Min Hold'}
              </Pill>
            </div>

            {dayModal.booking && (
              <div className="rounded-md border border-neutral-200 p-4 space-y-2 text-sm">
                <p className="font-semibold">{dayModal.booking.guestName}</p>
                <p className="text-xs text-neutral-500">Booking Ref: {dayModal.booking.ref}</p>
                <p className="text-xs text-neutral-500">Contact: {dayModal.booking.phone}</p>
                <p className="text-xs text-neutral-500">Guests: {dayModal.booking.guests} · Source: {dayModal.booking.source}</p>
                <p className="text-xs text-neutral-500">Total Settlement: {inr(dayModal.booking.amount)} ({dayModal.booking.method})</p>
              </div>
            )}

            {dayModal.block && (
              <div className="rounded-md border border-neutral-200 p-4 space-y-2 text-sm">
                <p className="font-semibold">Walk-In / Telephone Hold</p>
                <p className="text-xs text-neutral-500">Reason: {dayModal.block.reason}</p>
                <p className="text-xs text-neutral-500">Range: {fmtDate(dayModal.block.checkIn)} to {fmtDate(dayModal.block.checkOut)}</p>
              </div>
            )}

            {dayModal.hold && (
              <div className="rounded-md border border-neutral-200 p-4 space-y-2 text-sm">
                <p className="font-semibold">Active Checkout Lock (Redis TTL)</p>
                <p className="text-xs text-neutral-500">Hold Token: {dayModal.hold.id}</p>
                <p className="text-xs text-neutral-500">Dates are reserved for 15 minutes while payment is entered online.</p>
              </div>
            )}

            {dayModal.state === 'free' && (
              <p className="text-sm text-neutral-500">
                This room is completely open for direct bookings and online reservations on this date.
              </p>
            )}

            <Button className="w-full" onClick={() => setDayModal(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
