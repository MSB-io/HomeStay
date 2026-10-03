import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, Mountain, X } from 'lucide-react'
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
    <Link to="/" className="group flex items-center gap-2" aria-label="HomeStay home">
      <span className="grid size-8 place-items-center rounded-lg bg-ink text-white transition-transform group-hover:-rotate-6">
        <Mountain className="size-4.5" strokeWidth={2.25} />
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-semibold tracking-tight">HomeStay</span>
        <span className="block text-[10px] font-medium tracking-[0.16em] text-neutral-500 uppercase">Uttarakhand</span>
      </span>
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
    <div className="flex min-h-dvh flex-col">
      <header className="no-print sticky top-0 z-40 border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3.5 py-1.5 text-sm transition-colors',
                    isActive ? 'bg-ink text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-ink',
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span
              className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-neutral-600 ring-1 ring-neutral-200 sm:inline-flex"
              title="Owner device connectivity (simulated)"
            >
              <span className={cn('size-1.5 rounded-full', online ? 'bg-ink' : 'animate-pulse-dot bg-neutral-400')} />
              {online ? 'Online' : 'Offline'}
            </span>
            <button
              id="mobile-menu-toggle"
              className="grid size-10 place-items-center rounded-full hover:bg-neutral-100 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="animate-fade-in border-t border-neutral-200 bg-white px-4 py-3 md:hidden" aria-label="Mobile">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn('block rounded-xl px-3 py-3 text-[15px]', isActive ? 'bg-ink text-white' : 'text-neutral-700 hover:bg-neutral-100')
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
    <footer className="no-print mt-24 border-t border-neutral-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-500">
            The official booking platform for 260 verified homestays across the hill districts of Uttarakhand. An initiative of the District
            Tourism Association and the Uttarakhand Tourism Department.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Platform</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            <li><Link className="hover:text-ink" to="/">Explore homestays</Link></li>
            <li><Link className="hover:text-ink" to="/trips">My trips</Link></li>
            <li><Link className="hover:text-ink" to="/owner">Owner app</Link></li>
            <li><Link className="hover:text-ink" to="/association">Association dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Prototype</p>
          <p className="mt-3 text-sm text-neutral-500">Frontend-only demo with mock data. State lives in your browser.</p>
          <button id="reset-demo" onClick={resetDemo} className="mt-3 text-sm font-medium underline underline-offset-4 hover:no-underline">
            Reset demo data
          </button>
        </div>
      </div>
      <div className="border-t border-neutral-200">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-neutral-500 sm:px-6 lg:px-8">
          Case Study 103 · SEPM · ITM Skills University, School of Future Tech
        </p>
      </div>
    </footer>
  )
}
