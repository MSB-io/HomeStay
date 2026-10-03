import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Languages, Lock, MapPin, Mountain, Phone, Route as RouteIcon, ShieldCheck, Users } from 'lucide-react'
import { LIMITS, getHomestay } from '../data/mock'
import { useStore } from '../store/store'
import type { Conflict } from '../store/store'
import { addDays, cn, fmtDate, inr, nightsBetween, todayISO, validateGuests, validateStay } from '../lib/utils'
import RoomCalendar, { Legend } from '../components/RoomCalendar'
import type { DayInfo } from '../components/RoomCalendar'
import { Button, Card, Eyebrow, Field, Rating, VerifiedBadge, inputCls } from '../components/ui'

const CONFLICT_MSG: Record<Conflict, string> = {
  booked: 'These dates are already booked. Pick different dates or another room.',
  blocked: 'The host has blocked these dates for a walk-in or phone guest.',
  held: 'Another traveller is paying for these dates right now. They free up automatically if payment isn’t completed within 15 minutes.',
}

export default function Listing() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { isAvailable, acquireHold, bookings, holds, blocks } = useStore()
  const h = getHomestay(id)

  const today = todayISO()
  const [checkIn, setCheckIn] = useState(params.get('in') ?? addDays(today, 7))
  const [checkOut, setCheckOut] = useState(params.get('out') ?? addDays(today, 9))
  const [guests, setGuests] = useState(params.get('guests') ?? '2')
  const initialRoom = h?.rooms.find((r) => r.maxGuests >= Number(params.get('guests') ?? 2)) ?? h?.rooms[0]
  const [roomId, setRoomId] = useState(initialRoom?.id ?? '')
  const [conflict, setConflict] = useState<Conflict | null>(null)
  const [picking, setPicking] = useState<'in' | 'out'>('in')

  const room = h?.rooms.find((r) => r.id === roomId)
  const guestNum = Number(guests)
  const nights = nightsBetween(checkIn, checkOut)
  const error = validateStay(checkIn, checkOut) ?? validateGuests(guestNum, room?.maxGuests)

  const avail = useMemo(
    () => (error || !room ? null : isAvailable(room.id, checkIn, checkOut)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [error, room, checkIn, checkOut, isAvailable, bookings, holds, blocks],
  )

  if (!h || !room) return <Navigate to="/" replace />

  const subtotal = room.pricePerNight * Math.max(nights, 0)
  const levy = Math.round((subtotal * LIMITS.levyPct) / 100)

  const reserve = () => {
    setConflict(null)
    const res = acquireHold({ homestayId: h.id, roomId: room.id, checkIn, checkOut, guests: guestNum })
    if (!res.ok) return setConflict(res.reason)
    navigate(`/checkout/${res.hold.id}`)
  }

  const pick = (d: DayInfo) => {
    if (d.state !== 'free' && picking === 'in') return
    if (picking === 'in' || d.date <= checkIn) {
      setCheckIn(d.date)
      setCheckOut(addDays(d.date, 1))
      setPicking('out')
    } else {
      setCheckOut(addDays(d.date, 1))
      setPicking('in')
    }
    setConflict(null)
  }

  const shownConflict = conflict ?? (avail && !avail.ok ? avail.reason : null)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <Link to={`/?in=${checkIn}&out=${checkOut}&guests=${guests}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-ink">
        <ArrowLeft className="size-4" /> All homestays
      </Link>

      <header className="mt-4 flex animate-fade-up flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <VerifiedBadge />
            <span className="text-xs text-neutral-500">Licence {h.license}</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{h.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
            <Rating value={h.rating} count={h.reviewCount} />
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{h.village}, {h.district}</span>
            <span className="inline-flex items-center gap-1"><Mountain className="size-3.5" />{h.altitude.toLocaleString('en-IN')} m</span>
          </p>
        </div>
      </header>

      {/* Gallery */}
      <div className="mt-6 grid animate-fade-up grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl [animation-delay:80ms] sm:h-[440px]">
        <img src={h.images[0]} alt={h.name} className="col-span-4 aspect-[4/3] size-full object-cover grayscale sm:col-span-2 sm:row-span-2 sm:aspect-auto" />
        {h.images.slice(1, 4).map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className={cn('hidden size-full object-cover grayscale sm:block', i === 2 && 'sm:col-span-2')}
          />
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        {/* Booking card */}
        <aside className="order-1 lg:order-2">
          <Card className="p-5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.25)] sm:p-6 lg:sticky lg:top-24">
            <p className="text-2xl font-semibold tracking-tight">
              {inr(room.pricePerNight)} <span className="text-sm font-normal text-neutral-500">/ night</span>
            </p>

            <div className="mt-5 space-y-3">
              <Field label="Room">
                <select id="booking-room" value={roomId} onChange={(e) => { setRoomId(e.target.value); setConflict(null) }} className={inputCls}>
                  {h.rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} · up to {r.maxGuests} · {inr(r.pricePerNight)}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Check-in">
                  <input id="booking-checkin" type="date" min={today} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); setConflict(null) }} className={inputCls} />
                </Field>
                <Field label="Check-out">
                  <input id="booking-checkout" type="date" min={checkIn} value={checkOut} onChange={(e) => { setCheckOut(e.target.value); setConflict(null) }} className={inputCls} />
                </Field>
              </div>
              <Field label="Guests" hint={`Allowed ${LIMITS.minGuests}–${LIMITS.maxGuests} per room · this room fits ${room.maxGuests}`}>
                <input id="booking-guests" type="number" inputMode="numeric" value={guests} onChange={(e) => setGuests(e.target.value)} className={inputCls} />
              </Field>
            </div>

            {(error || shownConflict) && (
              <p role="alert" className="mt-4 rounded-xl bg-neutral-100 p-3 text-sm leading-snug text-ink ring-1 ring-ink/10">
                {error ?? CONFLICT_MSG[shownConflict!]}
              </p>
            )}

            {!error && (
              <dl className="mt-5 space-y-2 border-t border-neutral-200 pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-neutral-500">{inr(room.pricePerNight)} × {nights} night{nights > 1 && 's'}</dt><dd>{inr(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Includes association levy ({LIMITS.levyPct}%)</dt><dd className="text-neutral-500">{inr(levy)}</dd></div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold"><dt>Total</dt><dd>{inr(subtotal)}</dd></div>
              </dl>
            )}

            <Button id="reserve-button" size="lg" className="mt-5 w-full" disabled={!!error || !!shownConflict} onClick={reserve}>
              <Lock className="size-4" /> Reserve · hold for 15 min
            </Button>
            <p className="mt-3 text-center text-xs text-neutral-500">You won’t be charged yet. Dates are locked only for you while you pay.</p>
          </Card>
        </aside>

        {/* Details */}
        <div className="order-2 min-w-0 lg:order-1">
          <section className="flex items-center gap-4 border-b border-neutral-200 pb-8">
            <div className="grid size-14 shrink-0 place-items-center rounded-full bg-ink text-lg font-semibold text-white">
              {h.owner.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <p className="font-semibold">Hosted by {h.owner.name}</p>
              <p className="text-sm text-neutral-500">Hosting since {h.owner.since} · Verified by District Tourism Association</p>
            </div>
          </section>

          <section className="grid gap-4 border-b border-neutral-200 py-8 sm:grid-cols-3">
            {[
              { icon: RouteIcon, t: 'Road access', d: h.roadAccess },
              { icon: Languages, t: 'Host speaks', d: h.owner.language },
              { icon: Phone, t: 'Host contact', d: 'Shared on your voucher' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-3">
                <Icon className="mt-0.5 size-4.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{t}</p>
                  <p className="text-sm text-neutral-500">{d}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="border-b border-neutral-200 py-8">
            <h2 className="text-xl font-semibold tracking-tight">About this home</h2>
            <p className="mt-3 leading-relaxed text-neutral-600">{h.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {h.amenities.map((a) => (
                <span key={a} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ring-1 ring-neutral-200">
                  <BadgeCheck className="size-3.5" /> {a}
                </span>
              ))}
            </div>
          </section>

          <section className="border-b border-neutral-200 py-8">
            <h2 className="text-xl font-semibold tracking-tight">Rooms</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {h.rooms.map((r) => (
                <button
                  key={r.id}
                  id={`room-${r.id}`}
                  onClick={() => { setRoomId(r.id); setConflict(null) }}
                  className={cn(
                    'rounded-2xl p-4 text-left transition',
                    r.id === roomId ? 'bg-ink text-white' : 'ring-1 ring-neutral-200 hover:ring-neutral-400',
                  )}
                >
                  <p className="font-semibold">{r.name}</p>
                  <p className={cn('text-sm', r.id === roomId ? 'text-white/60' : 'text-neutral-500')}>{r.type}</p>
                  <p className="mt-3 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> Up to {r.maxGuests}</span>
                    <span className="font-semibold">{inr(r.pricePerNight)}</span>
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="border-b border-neutral-200 py-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Live availability · {room.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Tap a free day to set check-in, then tap again for your last night. {fmtDate(checkIn)} → {fmtDate(checkOut)}
                </p>
              </div>
            </div>
            <Legend className="mt-4" />
            <div className="mt-4">
              <RoomCalendar roomId={room.id} range={{ checkIn, checkOut }} onPick={pick} />
            </div>
          </section>

          <section className="border-b border-neutral-200 py-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Verified guest reviews</h2>
              <Rating value={h.rating} count={h.reviewCount} />
            </div>
            <p className="mt-1 text-sm text-neutral-500">Only guests with a completed stay can review, within 48 hours of check-out.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {h.reviews.map((r) => (
                <Card key={r.name} className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-neutral-500">{r.city} · {r.month}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600">
                      <ShieldCheck className="size-3.5" /> Verified stay
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">“{r.text}”</p>
                  <p className="mt-3 text-xs text-neutral-500">Cleanliness {r.cleanliness}/5 · Hospitality {r.hospitality}/5</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="py-8">
            <Eyebrow>Cancellation policy</Eyebrow>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Fair to travellers, fair to village hosts</h2>
            <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-neutral-200">
              {[
                ['More than 7 days before check-in', `100% refund (minus ${LIMITS.gatewayFeePct}% gateway fee)`],
                ['2 to 7 days before check-in', '50% refund · 50% to host'],
                ['Less than 48 hours before check-in', 'No refund · 100% to host'],
                ['Host cancels', `100% refund + ${LIMITS.hostPenaltyPct}% penalty on host`],
              ].map(([w, r], i) => (
                <div key={w} className={cn('flex flex-col gap-1 p-4 text-sm sm:flex-row sm:justify-between', i > 0 && 'border-t border-neutral-200')}>
                  <span className="text-neutral-600">{w}</span>
                  <span className="font-medium">{r}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
