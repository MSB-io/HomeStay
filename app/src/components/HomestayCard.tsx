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
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
        <img
          src={h.images[0]}
          alt={`${h.name} in ${h.village}`}
          loading="lazy"
          className="size-full object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <VerifiedBadge />
          {available !== undefined && (
            <span
              className={
                available
                  ? 'rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-medium text-ink backdrop-blur'
                  : 'rounded-full bg-ink/80 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur'
              }
            >
              {available ? 'Available' : 'Sold out for dates'}
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-tight">{h.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {h.village}, {h.district}
            </span>
          </p>
        </div>
        <Rating value={h.rating} className="shrink-0" />
      </div>
      <p className="mt-1 line-clamp-1 text-sm text-neutral-500">{h.summary}</p>
      <p className="mt-2 text-sm">
        <span className="font-semibold">{inr(from)}</span> <span className="text-neutral-500">/ night</span>
      </p>
    </Link>
  )
}
