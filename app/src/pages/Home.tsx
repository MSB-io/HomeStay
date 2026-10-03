import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, BadgeCheck, CalendarCheck, Search, Signal, Timer, WifiOff } from 'lucide-react'
import { AMENITIES, DISTRICTS, HOMESTAYS, LIMITS } from '../data/mock'
import type { Amenity } from '../data/mock'
import { useStore } from '../store/store'
import { addDays, cn, todayISO, validateGuests, validateStay } from '../lib/utils'
import HomestayCard from '../components/HomestayCard'
import { Eyebrow } from '../components/ui'

export default function Home() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAvailable, bookings, holds, blocks } = useStore()

  const today = todayISO()
  const [district, setDistrict] = useState(params.get('district') ?? '')
  const [checkIn, setCheckIn] = useState(params.get('in') ?? addDays(today, 7))
  const [checkOut, setCheckOut] = useState(params.get('out') ?? addDays(today, 9))
  const [guests, setGuests] = useState(params.get('guests') ?? '2')
  const [amenities, setAmenities] = useState<Amenity[]>([])

  const guestNum = Number(guests)
  const error = validateStay(checkIn, checkOut) ?? validateGuests(guestNum)
  const query = `?in=${checkIn}&out=${checkOut}&guests=${guests}`

  const results = useMemo(() => {
    return HOMESTAYS.filter((h) => !district || h.district === district)
      .filter((h) => amenities.every((a) => h.amenities.includes(a)))
      .map((h) => {
        const fits = h.rooms.filter((r) => r.maxGuests >= guestNum)
        const available = !error && fits.some((r) => isAvailable(r.id, checkIn, checkOut).ok)
        return { h, available: error ? undefined : available }
      })
      .sort((a, b) => Number(b.available ?? 0) - Number(a.available ?? 0))
    // bookings/holds/blocks are listed so results refresh when availability changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district, amenities, guestNum, checkIn, checkOut, error, isAvailable, bookings, holds, blocks])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = { in: checkIn, out: checkOut, guests }
    if (district) next.district = district
    setParams(next, { replace: true })
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggle = (a: Amenity) => setAmenities((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]))

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img src="/images/village.jpg" alt="" className="size-full object-cover grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-white" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="max-w-3xl animate-fade-up text-white">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/25 backdrop-blur">
              <BadgeCheck className="size-3.5" /> 260 verified homestays · Official Tourism Department platform
            </p>
            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
              Stay with the hills.
              <br />
              Book with certainty.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
              Real photos, real reviews from verified guests, and a room that is locked for you the moment you click book. No more
              double-bookings over WhatsApp.
            </p>
          </div>

          {/* Search */}
          <form
            id="search-form"
            onSubmit={submit}
            className="mt-10 grid animate-fade-up gap-3 rounded-3xl bg-white p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-neutral-200 [animation-delay:120ms] sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_0.8fr_auto] lg:p-2.5"
          >
            <label className="block rounded-2xl px-3 py-2 hover:bg-neutral-50">
              <span className="block text-[11px] font-semibold text-neutral-500">District</span>
              <select id="search-district" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-transparent text-sm font-medium outline-none">
                <option value="">All hill districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="block rounded-2xl px-3 py-2 hover:bg-neutral-50">
              <span className="block text-[11px] font-semibold text-neutral-500">Check-in</span>
              <input id="search-checkin" type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent text-sm font-medium outline-none" />
            </label>
            <label className="block rounded-2xl px-3 py-2 hover:bg-neutral-50">
              <span className="block text-[11px] font-semibold text-neutral-500">Check-out</span>
              <input id="search-checkout" type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent text-sm font-medium outline-none" />
            </label>
            <label className="block rounded-2xl px-3 py-2 hover:bg-neutral-50">
              <span className="block text-[11px] font-semibold text-neutral-500">Guests</span>
              <input
                id="search-guests"
                type="number"
                inputMode="numeric"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none"
              />
            </label>
            <button id="search-submit" type="submit" className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-ink px-6 text-sm font-medium text-white transition hover:bg-neutral-800 sm:col-span-2 lg:col-span-1 lg:h-auto">
              <Search className="size-4" /> Search
            </button>
          </form>
          {error && (
            <p role="alert" className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-ink ring-1 ring-ink">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-neutral-200 px-4 sm:px-6 lg:grid-cols-4 lg:divide-x lg:px-8">
          {[
            { icon: Timer, t: '15-minute hold', d: 'Dates lock while you pay' },
            { icon: BadgeCheck, t: 'Field-verified', d: 'Photos & licence checked in person' },
            { icon: Signal, t: 'Works on 2G', d: 'App under 450 KB' },
            { icon: WifiOff, t: 'SMS + WhatsApp', d: 'Voucher even without data' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex items-center gap-3 py-5 lg:px-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100">
                <Icon className="size-4.5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-xs text-neutral-500">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Results */}
      <section id="results" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>{district || 'All districts'}</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {results.length} homestays{!error && ` · ${results.filter((r) => r.available).length} available for your dates`}
            </h2>
          </div>
          <p className="text-sm text-neutral-500">
            Guests {LIMITS.minGuests}–{LIMITS.maxGuests} per room · stays {LIMITS.minNights}–{LIMITS.maxNights} nights
          </p>
        </div>

        <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {AMENITIES.map((a) => (
            <button
              key={a}
              id={`filter-${a.toLowerCase().replace(/\W+/g, '-')}`}
              onClick={() => toggle(a)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-sm transition',
                amenities.includes(a) ? 'bg-ink text-white' : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-neutral-400',
              )}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map(({ h, available }, i) => (
            <HomestayCard key={h.id} h={h} query={query} available={available} index={i} />
          ))}
        </div>
        {results.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
            No homestays match those filters. Try removing an amenity.
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-ink text-white">
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.4fr] lg:p-16">
            <div>
              <Eyebrow className="text-white/50">How booking works</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">No more “sorry, the room just got taken.”</h2>
              <p className="mt-4 text-white/60">
                The calendar and the payment are kept separate. A short-lived hold token connects them, so a slow bank or a dropped signal
                never leaves the room in a broken state.
              </p>
              <button onClick={() => navigate(`/homestay/hs-101${query}`)} className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-ink transition hover:bg-neutral-200">
                Try a booking <ArrowRight className="size-4" />
              </button>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2">
              {[
                { n: '01', t: 'Pick dates', d: 'Live calendar shows what is truly free, including walk-ins the owner blocked from the village.' },
                { n: '02', t: 'Room locks for 15:00', d: 'Nobody else can book those nights while you pay. Miss the window and the dates free up automatically.' },
                { n: '03', t: 'Pay securely', d: 'UPI, card or net banking. Card details never touch our servers.' },
                { n: '04', t: 'Voucher on SMS + WhatsApp', d: 'Both you and the host get it instantly, even on a weak mountain signal.' },
              ].map((s) => (
                <li key={s.n} className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.09]">
                  <span className="text-xs font-medium text-white/40 tabular-nums">{s.n}</span>
                  <p className="mt-3 font-semibold">{s.t}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/60">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="mx-auto mt-6 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-neutral-200">
          <img src="/images/veranda.jpg" alt="Homestay veranda overlooking a misty valley" loading="lazy" className="h-64 w-full object-cover grayscale sm:h-80" />
        </div>
        <div className="flex flex-col justify-center rounded-3xl p-8 ring-1 ring-neutral-200 sm:p-12">
          <CalendarCheck className="size-6" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Run your homestay from a ₹6,000 phone.</h2>
          <p className="mt-3 text-neutral-500">
            The owner app keeps 30 days of bookings on the phone, works with no signal, and lets you block a room for a walk-in guest with one
            tap.
          </p>
          <button onClick={() => navigate('/owner')} className="mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white transition hover:bg-neutral-800">
            Open owner app <ArrowRight className="size-4" />
          </button>
        </div>
      </section>
    </>
  )
}

