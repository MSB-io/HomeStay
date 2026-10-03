import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useStore } from '../store/store'
import { cn } from '../lib/utils'

const NAV = [
  { to: '/', label: 'Explore', end: true },
  { to: '/trips', label: 'My trips' },
  { to: '/owner', label: 'Owner app' },
  { to: '/association', label: 'Association' },
]

export function Logo() {
  return (
    <Link to="/" className="inline-flex items-baseline gap-2 tracking-tight transition-opacity hover:opacity-75" aria-label="HomeStay home">
      <span className="text-lg font-semibold tracking-tight text-ink">HomeStay</span>
      <span className="text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">Uttarakhand</span>
    </Link>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { online } = useStore()

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Transparent Sticky Header */}
      <header className="no-print sticky top-0 z-40 w-full border-b border-neutral-200/60 bg-white/70 backdrop-blur-md">
        <div className="relative flex h-16 w-full items-center justify-between px-6 sm:px-8 lg:px-12">
          {/* Left: Pure Typography Logo (No square) */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Center: Nav links strictly centered to entire page width */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2" aria-label="Primary">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    'text-sm transition-colors py-1',
                    isActive ? 'font-semibold text-ink border-b-2 border-ink' : 'text-neutral-500 hover:text-ink',
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Connectivity indicator & mobile menu toggle */}
          <div className="flex items-center gap-3">
            <span
              className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-500 border border-neutral-200 sm:inline-flex"
              title="Simulated Owner Connectivity"
            >
              <span className={cn('size-1.5 rounded-full', online ? 'bg-ink' : 'animate-pulse-dot bg-neutral-400')} />
              {online ? 'Online' : 'Offline'}
            </span>
            <button
              id="mobile-menu-toggle"
              className="grid size-9 place-items-center rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-100 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {open && (
          <nav className="animate-fade-in border-t border-neutral-200 bg-white/95 px-6 py-4 backdrop-blur-md md:hidden" aria-label="Mobile">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn('block rounded-md px-3 py-2.5 text-sm', isActive ? 'font-semibold text-ink bg-neutral-100' : 'text-neutral-600 hover:bg-neutral-50')
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

function Footer() {
  const { resetDemo } = useStore()
  return (
    <footer className="no-print mt-32 border-t border-neutral-200/80">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-8 md:grid-cols-4 lg:px-12">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-neutral-400">
            Official booking platform for 260 verified homestays across Uttarakhand hill districts. Sponsored by Uttarakhand District Tourism Department and District Tourism Association.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Platform</p>
          <ul className="mt-3 space-y-2 text-xs text-neutral-500">
            <li><Link className="hover:text-ink" to="/">Explore homestays</Link></li>
            <li><Link className="hover:text-ink" to="/trips">My trips</Link></li>
            <li><Link className="hover:text-ink" to="/owner">Owner app</Link></li>
            <li><Link className="hover:text-ink" to="/association">Association dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Data &amp; Controls</p>
          <p className="mt-3 text-xs text-neutral-400">Frontend-only prototype with mock data.</p>
          <button id="reset-demo" onClick={resetDemo} className="mt-3 text-xs font-medium underline underline-offset-4 hover:no-underline text-neutral-600 hover:text-ink cursor-pointer">
            Reset demo storage
          </button>
        </div>
      </div>
      <div className="border-t border-neutral-100">
        <p className="mx-auto max-w-7xl px-6 py-5 text-[11px] text-neutral-400 sm:px-8 lg:px-12">
          Case Study 103 · SEPM · ITM Skills University, School of Future Tech
        </p>
      </div>
    </footer>
  )
}
