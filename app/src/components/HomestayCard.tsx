import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import type { Homestay } from '../data/mock'
import { inr } from '../lib/utils'
import { Rating, VerifiedBadge } from './ui'

export default function HomestayCard({
  h,
  query,
  available,
  index = 0,
}: {
  h: Homestay
  query: string
  available?: boolean
  index?: number
}) {
  const from = Math.min(...h.rooms.map((r) => r.pricePerNight))
  return (
    <Link
      id={`homestay-card-${h.id}`}
      to={`/homestay/${h.id}${query}`}
      className="group block animate-fade-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-100 border border-neutral-200/80">
        <img
          src={h.images[0]}
          alt={`${h.name} in ${h.village}`}
          loading="lazy"
          className="size-full object-cover grayscale transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <VerifiedBadge />
          {available !== undefined && (
            <span
              className={
                available
                  ? 'rounded px-2 py-0.5 text-[11px] font-medium text-ink bg-white/90 backdrop-blur-xs border border-neutral-200'
                  : 'rounded px-2 py-0.5 text-[11px] font-medium text-white bg-ink/90 backdrop-blur-xs'
              }
            >
              {available ? 'Available' : 'Sold out'}
            </span>
          )}
        </div>
      </div>
      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-ink group-hover:text-neutral-600 transition-colors">
            {h.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">
              {h.village}, {h.district}
            </span>
          </p>
        </div>
        <Rating value={h.rating} className="shrink-0 text-xs" />
      </div>
      <p className="mt-1 line-clamp-1 text-xs text-neutral-400">{h.summary}</p>
      <p className="mt-2 text-xs">
        <span className="font-semibold text-sm text-ink">{inr(from)}</span> <span className="text-neutral-400">/ night</span>
      </p>
    </Link>
  )
}
