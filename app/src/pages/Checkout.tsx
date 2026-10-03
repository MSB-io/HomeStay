import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Check, CreditCard, FlaskConical, Hourglass, Loader2, Lock, ShieldCheck, Smartphone, TimerOff, UserRound } from 'lucide-react'
import { LIMITS, findRoom } from '../data/mock'
import { useStore } from '../store/store'
import type { PayMethod } from '../store/store'
import { cn, fmtDate, inr, nightsBetween, uid } from '../lib/utils'
import { Button, Card, Eyebrow, Field, inputCls } from '../components/ui'

const STEPS = [
  'Creating payment order with gateway',
  'Waiting for bank authorisation',
  'Verifying HMAC-SHA256 webhook signature',
  'Converting hold into a permanent booking',
  'Sending SMS + WhatsApp vouchers',
]

const METHODS: Array<{ id: PayMethod; icon: typeof Smartphone; label: string }> = [
  { id: 'UPI', icon: Smartphone, label: 'UPI' },
  { id: 'Card', icon: CreditCard, label: 'Card' },
  { id: 'Net Banking', icon: Building2, label: 'Net banking' },
]

function useNow(ms = 250) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

export default function Checkout() {
  const { holdId } = useParams()
  const navigate = useNavigate()
  const { getHold, releaseHold, expireHoldNow, confirmBooking, acquireHold } = useStore()
  const hold = getHold(holdId)
  const now = useNow()

  // Keep the last-known hold so we can still describe it after it expires.
  const last = useRef(hold)
  if (hold) last.current = hold
  const info = last.current

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState<PayMethod>('UPI')
  const [upi, setUpi] = useState('')
  const [step, setStep] = useState(-1)
  const [formError, setFormError] = useState<string | null>(null)
  const [demoMsg, setDemoMsg] = useState<string | null>(null)
  const orderId = useRef('ORD-' + uid().toUpperCase().slice(0, 6))

  const processing = step >= 0
  const found = info ? findRoom(info.roomId) : undefined

  if (!info || !found) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <TimerOff className="mx-auto size-8" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">This checkout session doesn’t exist</h1>
        <p className="mt-2 text-neutral-500">Start again from a homestay page to place a fresh 15-minute hold.</p>
        <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-white">Explore homestays</Link>
      </div>
    )
  }

  const { homestay: h, room } = found
  const nights = nightsBetween(info.checkIn, info.checkOut)
  const total = room.pricePerNight * nights
  const remaining = Math.max(0, info.expiresAt - now)
  const expired = !hold && !processing
  const mm = String(Math.floor(remaining / 60000)).padStart(2, '0')
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')
  const frac = remaining / (LIMITS.holdMinutes * 60_000)
  const R = 52
  const C = 2 * Math.PI * R

  const pay = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setFormError('Enter the lead guest’s full name.')
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10))) return setFormError('Enter a valid 10-digit Indian mobile number for the SMS voucher.')
    if (method === 'UPI' && !/^[\w.-]+@[\w]+$/.test(upi)) return setFormError('Enter a valid UPI ID, e.g. name@okaxis.')
    setFormError(null)
    setStep(0)
    STEPS.forEach((_, i) => setTimeout(() => setStep(i), i * 650))
    setTimeout(() => {
      const b = confirmBooking(info.id, { guestName: name.trim(), phone, method })
      if (b) navigate(`/booking/${b.id}?new=1`, { replace: true })
      else setStep(-1)
    }, STEPS.length * 650 + 200)
  }

  const simulateSecond = () => {
    const res = acquireHold({ homestayId: info.homestayId, roomId: info.roomId, checkIn: info.checkIn, checkOut: info.checkOut, guests: info.guests })
    if (res.ok) {
      releaseHold(res.hold.id)
      setDemoMsg('Second traveller got a hold. (Your hold has expired, so the dates were free.)')
    } else {
      setDemoMsg(`Second traveller rejected instantly: dates are "${res.reason}". Only one checkout can hold a room at a time.`)
    }
  }

  const cancel = () => {
    releaseHold(info.id)
    navigate(`/homestay/${h.id}?in=${info.checkIn}&out=${info.checkOut}&guests=${info.guests}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      <button onClick={cancel} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-ink">
        <ArrowLeft className="size-4" /> Cancel and release dates
      </button>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Confirm and pay</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="order-2 lg:order-1">
          {expired ? (
            <Card className="animate-fade-up p-8 text-center">
              <Hourglass className="mx-auto size-8" />
              <h2 className="mt-4 text-xl font-semibold tracking-tight">Your 15-minute hold expired</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
                The dates have been released back to the calendar so other travellers can book them. No money was taken.
              </p>
              <Link
                to={`/homestay/${h.id}?in=${info.checkIn}&out=${info.checkOut}&guests=${info.guests}`}
                className="mt-6 inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-white"
              >
                Try again
              </Link>
            </Card>
          ) : (
            <form id="checkout-form" onSubmit={pay} className="space-y-6">
              <Card className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <UserRound className="size-4.5" />
                  <h2 className="font-semibold">Lead guest</h2>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="Full name">
                    <input id="guest-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="As on ID proof" autoComplete="name" />
                  </Field>
                  <Field label="Mobile (for SMS + WhatsApp voucher)">
                    <input id="guest-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="98765 43210" inputMode="tel" autoComplete="tel" />
                  </Field>
                </div>
              </Card>

              <Card className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Lock className="size-4.5" />
                  <h2 className="font-semibold">Payment</h2>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2" role="tablist">
                  {METHODS.map(({ id, icon: Icon, label }) => (
                    <button
                      type="button"
                      key={id}
                      id={`pay-method-${id.toLowerCase().replace(' ', '-')}`}
                      role="tab"
                      aria-selected={method === id}
                      onClick={() => setMethod(id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl py-3 text-sm transition',
                        method === id ? 'bg-ink text-white' : 'ring-1 ring-neutral-200 hover:ring-neutral-400',
                      )}
                    >
                      <Icon className="size-4.5" />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  {method === 'UPI' && (
                    <Field label="UPI ID" hint="You’ll approve the payment in your UPI app.">
                      <input id="upi-id" value={upi} onChange={(e) => setUpi(e.target.value)} className={inputCls} placeholder="name@okaxis" />
                    </Field>
                  )}
                  {method === 'Card' && (
                    <div className="grid gap-3 sm:grid-cols-[1fr_110px_90px]">
                      <Field label="Card number"><input className={inputCls} placeholder="4111 1111 1111 1111" inputMode="numeric" /></Field>
                      <Field label="Expiry"><input className={inputCls} placeholder="MM/YY" /></Field>
                      <Field label="CVV"><input className={inputCls} placeholder="•••" type="password" /></Field>
                    </div>
                  )}
                  {method === 'Net Banking' && (
                    <Field label="Bank">
                      <select className={inputCls}>
                        <option>State Bank of India</option>
                        <option>Uttarakhand Gramin Bank</option>
                        <option>Punjab National Bank</option>
                        <option>HDFC Bank</option>
                      </select>
                    </Field>
                  )}
                </div>
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-600">
                  <ShieldCheck className="mt-px size-4 shrink-0" />
                  Handled by a PCI-DSS payment gateway over TLS 1.3. HomeStay never stores card numbers, CVV or UPI PIN. Your money is held
                  in escrow and released to the host after check-in.
                </p>
              </Card>

              {formError && <p role="alert" className="rounded-xl bg-neutral-100 p-3 text-sm ring-1 ring-ink/10">{formError}</p>}

              {processing ? (
                <Card className="p-5 sm:p-6" >
                  <ol className="space-y-3" aria-live="polite">
                    {STEPS.map((s, i) => (
                      <li key={s} className={cn('flex items-center gap-3 text-sm transition', i > step && 'text-neutral-400')}>
                        <span className={cn('grid size-6 place-items-center rounded-full', i < step ? 'bg-ink text-white' : 'ring-1 ring-neutral-300')}>
                          {i < step ? <Check className="size-3.5" /> : i === step ? <Loader2 className="size-3.5 animate-spin" /> : null}
                        </span>
                        {s}
                        {i === 0 && <span className="ml-auto text-xs text-neutral-400 tabular-nums">{orderId.current}</span>}
                      </li>
                    ))}
                  </ol>
                </Card>
              ) : (
                <Button id="pay-button" type="submit" size="lg" className="w-full">
                  Pay {inr(total)}
                </Button>
              )}
            </form>
          )}

          {/* Presentation helpers */}
          {!expired && !processing && (
            <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold"><FlaskConical className="size-4" /> Demo controls</p>
              <p className="mt-1 text-xs text-neutral-500">Show the double-booking guard and the hold timeout without waiting 15 minutes.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button id="demo-second-traveller" type="button" size="sm" variant="secondary" onClick={simulateSecond}>
                  Simulate a 2nd traveller booking these dates
                </Button>
                <Button id="demo-expire-hold" type="button" size="sm" variant="secondary" onClick={() => expireHoldNow(info.id)}>
                  Expire my hold now
                </Button>
              </div>
              {demoMsg && <p className="mt-3 animate-fade-in rounded-xl bg-neutral-50 p-3 text-sm">{demoMsg}</p>}
            </div>
          )}
        </div>

        {/* Summary + timer */}
        <aside className="order-1 lg:order-2">
          <div className="space-y-4 lg:sticky lg:top-24">
            <Card className={cn('flex items-center gap-5 p-5', !expired && remaining < 60_000 && 'ring-2 ring-ink')}>
              <div className="relative size-[120px] shrink-0">
                <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                  <circle cx="60" cy="60" r={R} fill="none" stroke="#e5e5e5" strokeWidth="6" />
                  <circle
                    cx="60"
                    cy="60"
                    r={R}
                    fill="none"
                    stroke="#0a0a0a"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - (expired ? 0 : frac))}
                    className="transition-[stroke-dashoffset] duration-300"
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <span id="hold-timer" className="text-2xl font-semibold tracking-tight tabular-nums">{expired ? '00:00' : `${mm}:${ss}`}</span>
                </div>
              </div>
              <div>
                <Eyebrow>{expired ? 'Hold released' : 'Dates locked for you'}</Eyebrow>
                <p className="mt-1.5 text-sm text-neutral-600">
                  {expired ? 'The room is back on the open calendar.' : 'Nobody else can book these nights until the timer runs out.'}
                </p>
                <p className="mt-2 text-[11px] text-neutral-400 tabular-nums">Token {info.id}</p>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <img src={h.images[0]} alt={h.name} className="h-36 w-full object-cover grayscale" />
              <div className="p-5">
                <p className="font-semibold">{h.name}</p>
                <p className="text-sm text-neutral-500">{room.name} · {h.village}, {h.district}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-xs text-neutral-500">Check-in</dt><dd className="font-medium">{fmtDate(info.checkIn, { weekday: 'short', day: 'numeric', month: 'short' })}</dd></div>
                  <div><dt className="text-xs text-neutral-500">Check-out</dt><dd className="font-medium">{fmtDate(info.checkOut, { weekday: 'short', day: 'numeric', month: 'short' })}</dd></div>
                  <div><dt className="text-xs text-neutral-500">Guests</dt><dd className="font-medium">{info.guests}</dd></div>
                  <div><dt className="text-xs text-neutral-500">Nights</dt><dd className="font-medium">{nights}</dd></div>
                </dl>
                <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 font-semibold">
                  <span>Total</span>
                  <span>{inr(total)}</span>
                </div>
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}
