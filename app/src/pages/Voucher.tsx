import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { CircleCheck, MapPin, MessageCircle, MessageSquareText, Phone, Printer } from 'lucide-react'
import { LIMITS, findRoom } from '../data/mock'
import { useStore } from '../store/store'
import { cn, fmtDate, inr, nightsBetween, seeded } from '../lib/utils'
import { Card, Eyebrow, Pill, btn } from '../components/ui'

function PseudoQR({ value }: { value: string }) {
  const rnd = seeded(value)
  const N = 21
  const finder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7
    const ring = (ox: number, oy: number) => {
      const dx = x - ox
      const dy = y - oy
      return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
    }
    if (inBox(0, 0)) return ring(0, 0)
    if (inBox(N - 7, 0)) return ring(N - 7, 0)
    if (inBox(0, N - 7)) return ring(0, N - 7)
    return null
  }
  const cells: boolean[] = []
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) cells.push(finder(x, y) ?? rnd() > 0.52)
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className="size-full" shapeRendering="crispEdges" aria-label={`QR code for ${value}`}>
      {cells.map((on, i) => on && <rect key={i} x={i % N} y={Math.floor(i / N)} width="1" height="1" fill="#0a0a0a" />)}
    </svg>
  )
}

export default function Voucher() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { bookings } = useStore()
  const b = bookings.find((x) => x.id === id)
  const found = b ? findRoom(b.roomId) : undefined
  if (!b || !found) return <Navigate to="/trips" replace />

  const { homestay: h, room } = found
  const nights = nightsBetween(b.checkIn, b.checkOut)
  const levy = Math.round((b.amount * LIMITS.levyPct) / 100)
  const isNew = params.get('new') === '1'
  const cancelled = b.status === 'CANCELLED_BY_GUEST'
  const firstName = b.guestName.split(' ')[0]

  const sms = `HomeStay: Booking ${b.ref} CONFIRMED. ${h.name}, ${h.village}. ${fmtDate(b.checkIn)}-${fmtDate(b.checkOut)}, ${b.guests} guest(s). Host ${h.owner.name} ${h.owner.phone}. Show this SMS at check-in.`

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
      {isNew && (
        <div className="mb-8 flex animate-fade-up items-start gap-3 rounded-md bg-ink p-5 text-white">
          <CircleCheck className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">You’re booked, {firstName}.</p>
            <p className="text-sm text-white/70">
              Payment verified and the dates are permanently blocked. Vouchers sent by SMS and WhatsApp to you and to {h.owner.name.split(' ')[0]} ji.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Voucher */}
        <Card className="animate-fade-up overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-dashed border-neutral-300 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
            <div>
              <Eyebrow>Booking voucher</Eyebrow>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{b.ref}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill solid={!cancelled}>{cancelled ? 'Cancelled' : b.status.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</Pill>
                <Pill>{b.method}</Pill>
                {b.txId && <Pill>{b.txId}</Pill>}
              </div>
            </div>
            <div className="size-28 shrink-0 rounded-md bg-white p-2 border border-neutral-200">
              <PseudoQR value={b.ref} />
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <p className="text-xs text-neutral-500">Homestay</p>
              <p className="mt-1 font-semibold">{h.name}</p>
              <p className="text-sm text-neutral-500">{room.name} · {room.type}</p>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-neutral-600"><MapPin className="mt-0.5 size-3.5 shrink-0" />{h.village}, {h.district} · {h.roadAccess}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Host</p>
              <p className="mt-1 font-semibold">{h.owner.name}</p>
              <p className="flex items-center gap-1.5 text-sm text-neutral-600"><Phone className="size-3.5" />{h.owner.phone}</p>
              <p className="text-sm text-neutral-500">Speaks {h.owner.language}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              {[
                ['Check-in', fmtDate(b.checkIn, { weekday: 'short', day: 'numeric', month: 'short' }), 'from 12:00'],
                ['Check-out', fmtDate(b.checkOut, { weekday: 'short', day: 'numeric', month: 'short' }), 'by 11:00'],
                ['Guests', String(b.guests), `${nights} night${nights > 1 ? 's' : ''}`],
              ].map(([k, v, s]) => (
                <div key={k} className="rounded-md bg-neutral-50 p-3 border border-neutral-200/60">
                  <p className="text-[11px] text-neutral-500">{k}</p>
                  <p className="mt-0.5 font-semibold">{v}</p>
                  <p className="text-[11px] text-neutral-500">{s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200 p-6 sm:p-8">
            <p className="text-sm font-semibold">Payment &amp; escrow split</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-500">Paid by guest</dt><dd className="font-semibold">{inr(b.amount)}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Host payout (released after check-in)</dt><dd>{inr(b.amount - levy)}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Association levy ({LIMITS.levyPct}%)</dt><dd>{inr(levy)}</dd></div>
              {b.refund && (
                <div className="flex justify-between border-t border-neutral-200 pt-2"><dt className="text-neutral-500">Refunded ({b.refund.pct}% tier)</dt><dd className="font-semibold">{inr(b.refund.refund)}</dd></div>
              )}
            </dl>
          </div>

          <div className="no-print flex flex-wrap gap-2 border-t border-neutral-200 p-6 sm:p-8">
            <button id="print-voucher" onClick={() => window.print()} className={btn('primary')}><Printer className="size-4" /> Print / save PDF</button>
            <Link to="/trips" className={btn('secondary')}>My trips</Link>
            <Link to="/" className={btn('ghost')}>Explore more</Link>
          </div>
        </Card>

        {/* Message previews */}
        <div className="no-print space-y-4">
          <Eyebrow>Delivered to {b.phone}</Eyebrow>
          <Card className="p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-neutral-500"><MessageSquareText className="size-3.5" /> SMS · works on 2G</p>
            <div className="mt-3 rounded-md bg-neutral-50 border border-neutral-200 p-3 text-xs leading-relaxed">{sms}</div>
            <p className="mt-2 text-[11px] text-neutral-400">{sms.length} characters · 2 SMS segments</p>
          </Card>
          <Card className="p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-neutral-500"><MessageCircle className="size-3.5" /> WhatsApp</p>
            <div className="mt-3 space-y-2">
              <div className="overflow-hidden rounded-md bg-neutral-50 border border-neutral-200">
                <img src={h.images[0]} alt="" className="h-24 w-full object-cover grayscale" />
                <div className="p-3 text-xs leading-relaxed">
                  <p className="font-semibold">{h.name}</p>
                  <p className="text-neutral-500">{fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}</p>
                  <p className="mt-1 text-neutral-500">📍 Location pin and offline directions attached.</p>
                </div>
              </div>
            </div>
          </Card>
          <Card className={cn('p-4')}>
            <p className="text-xs font-medium text-neutral-500">Host alert · {h.owner.name}</p>
            <div className="mt-3 rounded-md bg-ink p-3 text-xs leading-relaxed text-white">
              नई बुकिंग {b.ref}: {firstName}, {b.guests} मेहमान, {fmtDate(b.checkIn)} से {nights} रात। कैलेंडर अपडेट हो गया है।
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
