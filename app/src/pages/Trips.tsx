import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarX2, Star } from 'lucide-react'
import { findRoom } from '../data/mock'
import { useStore } from '../store/store'
import type { Booking } from '../store/store'
import { cn, fmtDate, inr, parseISO, refundQuote, todayISO } from '../lib/utils'
import { Button, Card, Eyebrow, Modal, Pill, btn } from '../components/ui'

const REVIEW_WINDOW_MS = 48 * 3_600_000

function reviewOpen(b: Booking) {
  const end = parseISO(b.checkOut).getTime() + 11 * 3_600_000
  return b.status === 'COMPLETED' && Date.now() - end <= REVIEW_WINDOW_MS
}

function StatusPill({ b }: { b: Booking }) {
  const map: Record<Booking['status'], string> = {
    CONFIRMED: 'Confirmed',
    CHECKED_IN: 'Checked in',
    COMPLETED: 'Completed',
    REVIEWED: 'Reviewed',
    CANCELLED_BY_GUEST: 'Cancelled',
  }
  return <Pill solid={b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'}>{map[b.status]}</Pill>
}

export default function Trips() {
  const { bookings, cancelBooking, submitReview } = useStore()
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [scores, setScores] = useState({ cleanliness: 5, hospitality: 5 })
  const [comment, setComment] = useState('')

  const mine = bookings.filter((b) => b.mine).sort((a, b) => b.checkIn.localeCompare(a.checkIn))
  const today = todayISO()
  const groups = [
    { title: 'Upcoming', items: mine.filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || (b.checkOut > today && b.status !== 'CANCELLED_BY_GUEST')) },
    { title: 'Past stays', items: mine.filter((b) => b.status === 'COMPLETED' || b.status === 'REVIEWED') },
    { title: 'Cancelled', items: mine.filter((b) => b.status === 'CANCELLED_BY_GUEST') },
  ]

  const toCancel = mine.find((b) => b.id === cancelId)
  const quote = toCancel ? refundQuote(toCancel.checkIn, toCancel.amount) : null

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
      <Eyebrow>Tourist</Eyebrow>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">My trips</h1>
      <p className="mt-2 text-neutral-500">Vouchers, cancellations with automatic refunds, and verified reviews.</p>

      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.title} className="mt-10">
              <h2 className="text-sm font-semibold text-neutral-500">{g.title}</h2>
              <div className="mt-3 space-y-3">
                {g.items.map((b, i) => {
                  const f = findRoom(b.roomId)
                  if (!f) return null
                  return (
                    <Card key={b.id} className="flex animate-fade-up flex-col overflow-hidden sm:flex-row" >
                      <img src={f.homestay.images[0]} alt="" className={cn('h-40 w-full object-cover grayscale sm:h-auto sm:w-48', b.status === 'CANCELLED_BY_GUEST' && 'opacity-40')} style={{ animationDelay: `${i * 50}ms` }} />
                      <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusPill b={b} />
                            <span className="text-xs text-neutral-500 tabular-nums">{b.ref}</span>
                          </div>
                          <p className="mt-2 font-semibold">{f.homestay.name}</p>
                          <p className="text-sm text-neutral-500">
                            {f.room.name} · {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)} · {b.guests} guest{b.guests > 1 && 's'}
                          </p>
                          <p className="mt-1 text-sm">
                            {inr(b.amount)}
                            {b.refund && <span className="text-neutral-500"> · refunded {inr(b.refund.refund)} ({b.refund.pct}%)</span>}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Link to={`/booking/${b.id}`} className={btn('secondary', 'sm')}>Voucher</Link>
                          {b.status === 'CONFIRMED' && (
                            <Button id={`cancel-${b.ref}`} size="sm" variant="ghost" onClick={() => setCancelId(b.id)}>
                              Cancel
                            </Button>
                          )}
                          {reviewOpen(b) && (
                            <Button id={`review-${b.ref}`} size="sm" onClick={() => setReviewId(b.id)}>
                              <Star className="size-3.5" /> Write review
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </section>
          ),
      )}

      {mine.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
          <CalendarX2 className="mx-auto size-6" />
          <p className="mt-3 font-semibold">No trips yet</p>
          <Link to="/" className={cn(btn('primary'), 'mt-4')}>Find a homestay</Link>
        </div>
      )}

      <Modal open={!!toCancel} onClose={() => setCancelId(null)} title="Cancel this booking?">
        {toCancel && quote && (
          <>
            <p className="text-sm text-neutral-600">
              Check-in is {fmtDate(toCancel.checkIn, { weekday: 'long', day: 'numeric', month: 'long' })}. Under the hill-district policy this falls
              in the <span className="font-semibold text-ink">“{quote.label.toLowerCase()}”</span> tier.
            </p>
            <dl className="mt-5 space-y-2 rounded-2xl bg-neutral-50 p-4 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-500">Amount paid</dt><dd>{inr(toCancel.amount)}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Refund tier</dt><dd>{quote.pct}%</dd></div>
              {quote.fee > 0 && <div className="flex justify-between"><dt className="text-neutral-500">Gateway fee</dt><dd>−{inr(quote.fee)}</dd></div>}
              <div className="flex justify-between"><dt className="text-neutral-500">Kept by host</dt><dd>{inr(quote.toHost)}</dd></div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold"><dt>You get back</dt><dd>{inr(quote.refund)}</dd></div>
            </dl>
            <div className="mt-6 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setCancelId(null)}>Keep booking</Button>
              <Button
                id="confirm-cancel"
                className="flex-1"
                onClick={() => {
                  cancelBooking(toCancel.id)
                  setCancelId(null)
                }}
              >
                Cancel &amp; refund
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!reviewId} onClose={() => setReviewId(null)} title="Review your stay">
        <p className="text-sm text-neutral-500">Your review is marked as a verified stay. The link expires 48 hours after check-out.</p>
        {(['cleanliness', 'hospitality'] as const).map((k) => (
          <div key={k} className="mt-5">
            <p className="text-sm font-medium capitalize">{k}</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setScores((s) => ({ ...s, [k]: n }))} aria-label={`${n} stars`} className="p-1">
                  <Star className={cn('size-6 transition', n <= scores[k] ? 'fill-ink text-ink' : 'text-neutral-300')} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        ))}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="What made this stay special?"
          className="mt-5 w-full rounded-xl p-3 text-sm ring-1 ring-neutral-200 outline-none focus:ring-2 focus:ring-ink"
        />
        <Button
          id="submit-review"
          className="mt-4 w-full"
          onClick={() => {
            if (reviewId) submitReview(reviewId)
            setReviewId(null)
            setComment('')
          }}
        >
          Submit verified review
        </Button>
      </Modal>
    </div>
  )
}
