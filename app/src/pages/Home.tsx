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
      {/* Hero Section: Minimalist, Airy with Generous Whitespace */}
      <section className="relative px-6 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl animate-fade-up">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-neutral-500 uppercase">
              <BadgeCheck className="size-3.5 text-ink" /> 260 Verified Hill Homestays · Uttarakhand Tourism
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-6xl lg:text-7xl leading-[1.08]">
              Stay with the hills.
              <br />
              Book with certainty.
            </h1>
            <p className="mt-6 max-w-xl text-base text-neutral-500 sm:text-lg leading-relaxed">
              Verified photos, authentic village hosts, and an atomic 15-minute calendar hold that eliminates double-booking during peak mountain season.
            </p>
          </div>

          {/* Minimalist Clean Search Bar (Standard rounded-md) */}
          <form
            id="search-form"
            onSubmit={submit}
            className="mt-12 grid animate-fade-up gap-2 rounded-md border border-neutral-200 bg-white p-2 shadow-xs sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto]"
          >
            <label className="block rounded px-3 py-2 hover:bg-neutral-50 transition-colors">
              <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider">District</span>
              <select id="search-district" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-transparent text-sm font-medium text-ink outline-none mt-0.5">
                <option value="">All hill districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="block rounded px-3 py-2 hover:bg-neutral-50 transition-colors">
              <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Check-in</span>
              <input id="search-checkin" type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent text-sm font-medium text-ink outline-none mt-0.5" />
            </label>
            <label className="block rounded px-3 py-2 hover:bg-neutral-50 transition-colors">
              <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Check-out</span>
              <input id="search-checkout" type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent text-sm font-medium text-ink outline-none mt-0.5" />
            </label>
            <label className="block rounded px-3 py-2 hover:bg-neutral-50 transition-colors">
              <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Guests</span>
              <input
                id="search-guests"
                type="number"
                inputMode="numeric"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-ink outline-none mt-0.5"
              />
            </label>
            <button id="search-submit" type="submit" className="flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-6 text-sm font-medium text-white transition hover:bg-neutral-800 cursor-pointer sm:col-span-2 lg:col-span-1 lg:h-auto">
              <Search className="size-4" /> Search
            </button>
          </form>
          {error && (
            <p role="alert" className="mt-3 inline-flex rounded border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-medium text-ink">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* Trust Strip: Clean Minimal Dividers */}
      <section className="border-y border-neutral-200/80 bg-neutral-50/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-neutral-200/80 px-6 sm:px-8 lg:grid-cols-4 lg:divide-x lg:px-12">
          {[
            { icon: Timer, t: '15-minute hold', d: 'Dates lock while you pay' },
            { icon: BadgeCheck, t: 'Field-verified', d: 'Photos & licence verified' },
            { icon: Signal, t: 'Works on 2G', d: 'Payload under 450 KB' },
            { icon: WifiOff, t: 'SMS + WhatsApp', d: 'Vouchers work offline' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex items-center gap-3 py-6 lg:px-6">
              <span className="grid size-9 shrink-0 place-items-center rounded border border-neutral-200 bg-white">
                <Icon className="size-4 text-ink" />
              </span>
              <div>
                <p className="text-xs font-semibold text-ink">{t}</p>
                <p className="text-[11px] text-neutral-400">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="mx-auto max-w-7xl scroll-mt-20 px-6 pt-16 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>{district || 'All Hill Hamlets'}</Eyebrow>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {results.length} homestays{!error && ` · ${results.filter((r) => r.available).length} available for selected dates`}
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            Capacity {LIMITS.minGuests}–{LIMITS.maxGuests} guests · duration {LIMITS.minNights}–{LIMITS.maxNights} nights
          </p>
        </div>

        {/* Minimalist Filter Tabs */}
        <div className="-mx-6 mt-6 flex gap-2 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {AMENITIES.map((a) => (
            <button
              key={a}
              id={`filter-${a.toLowerCase().replace(/\W+/g, '-')}`}
              onClick={() => toggle(a)}
              className={cn(
                'shrink-0 rounded-md px-3 py-1.5 text-xs transition cursor-pointer',
                amenities.includes(a)
                  ? 'bg-ink text-white font-medium'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-900',
              )}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map(({ h, available }, i) => (
            <HomestayCard key={h.id} h={h} query={query} available={available} index={i} />
          ))}
        </div>
        {results.length === 0 && (
          <div className="mt-10 rounded-md border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500">
            No homestays match those specific filters. Try clearing a filter.
          </div>
        )}
      </section>

      {/* How it Works: Clean Crisp Architecture (Standard rounded-md) */}
      <section className="mx-auto mt-32 max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="rounded-md border border-neutral-200 bg-neutral-900 text-white p-8 sm:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <Eyebrow className="text-white/40">Architectural Decoupling</Eyebrow>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Zero double-booking guarantee
              </h2>
              <p className="mt-4 text-xs leading-relaxed text-neutral-400">
                The availability calendar and payment gateway operate via an ephemeral 15-minute hold token. If hill network latency slows payment, room inventory remains strictly protected without race conditions.
              </p>
              <button
                onClick={() => navigate(`/homestay/hs-101${query}`)}
                className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-white px-5 text-xs font-semibold text-ink transition hover:bg-neutral-100 cursor-pointer"
              >
                Sample booking flow <ArrowRight className="size-3.5" />
              </button>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2">
              {[
                { n: '01', t: 'Select Dates', d: 'Calendar shows genuine vacancy including physical walk-in blocks.' },
                { n: '02', t: '15:00 Token Lock', d: 'Dates lock atomically for your checkout. Unlocks if timer lapses.' },
                { n: '03', t: 'Escrow Payment', d: 'Funds securely held until successful guest check-in at the property.' },
                { n: '04', t: 'SMS / WhatsApp', d: 'Dual offline vouchers dispatched immediately to guest and host.' },
              ].map((s) => (
                <li key={s.n} className="rounded-md border border-white/10 bg-white/5 p-4">
                  <span className="text-[11px] font-mono text-white/40">{s.n}</span>
                  <p className="mt-2 text-sm font-semibold text-white">{s.t}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Operator Callout: Minimalist Whitespace */}
      <section className="mx-auto mt-12 grid max-w-7xl gap-6 px-6 sm:px-8 lg:grid-cols-2 lg:px-12">
        <div className="overflow-hidden rounded-md border border-neutral-200">
          <img src="/images/veranda.jpg" alt="Mountain Homestay Veranda" loading="lazy" className="h-64 w-full object-cover grayscale" />
        </div>
        <div className="flex flex-col justify-center rounded-md border border-neutral-200 p-8 sm:p-10 bg-white">
          <CalendarCheck className="size-5 text-ink" />
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink sm:text-2xl">Offline-first village operator app</h2>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Engineered for entry-level smartphones in hill hamlets. Caches 30 days of forward bookings, functions with zero network signal, and enables one-tap walk-in date blocking.
          </p>
          <button
            onClick={() => navigate('/owner')}
            className="mt-6 inline-flex h-9 w-fit items-center gap-2 rounded-md bg-ink px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 cursor-pointer"
          >
            Launch owner screen <ArrowRight className="size-3.5" />
          </button>
        </div>
      </section>
    </>
  )
}
