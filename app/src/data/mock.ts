// Mock data for the HomeStay frontend prototype.
// Figures mirror the case study: 260 homestays, 3 onboarding batches (90/90/80),
// MoSCoW-scoped features, tiered cancellation rules and BVA limits.

export const LIMITS = {
  minGuests: 1,
  maxGuests: 10,
  minNights: 1,
  maxNights: 30,
  holdMinutes: 15,
  levyPct: 5, // association platform levy (split payout, FR-03)
  gatewayFeePct: 2, // deducted from full refunds (FR-08)
  hostPenaltyPct: 20,
} as const

export const DISTRICTS = [
  'Nainital',
  'Almora',
  'Pithoragarh',
  'Chamoli',
  'Bageshwar',
  'Rudraprayag',
] as const
export type District = (typeof DISTRICTS)[number]

export const AMENITIES = [
  'Hot water',
  'Home-cooked meals',
  'Mountain view',
  'Wi-Fi',
  'Parking',
  'Room heater',
  'Bonfire',
  'Trek guide',
] as const
export type Amenity = (typeof AMENITIES)[number]

export interface Room {
  id: string
  name: string
  type: string
  baseCapacity: number
  maxGuests: number
  pricePerNight: number
}

export interface Review {
  name: string
  city: string
  rating: number
  month: string
  cleanliness: number
  hospitality: number
  text: string
}

export interface Homestay {
  id: string
  name: string
  village: string
  district: District
  owner: { name: string; phone: string; language: string; since: number }
  license: string
  rating: number
  reviewCount: number
  altitude: number
  roadAccess: string
  images: string[]
  summary: string
  description: string
  amenities: Amenity[]
  rooms: Room[]
  reviews: Review[]
  /** Pre-existing bookings as [startOffsetDays, nights] relative to today, per room index. */
  seed: Array<[roomIndex: number, startOffset: number, nights: number, source: 'online' | 'walk-in' | 'phone']>
}

const IMG = {
  exterior: '/images/exterior.jpg',
  interior: '/images/interior.jpg',
  veranda: '/images/veranda.jpg',
  village: '/images/village.jpg',
}

const rot = (i: number) => {
  const all = [IMG.exterior, IMG.interior, IMG.veranda, IMG.village]
  return [...all.slice(i % 4), ...all.slice(0, i % 4)]
}

export const HOMESTAYS: Homestay[] = [
  {
    id: 'hs-101',
    name: 'Pine Ridge Homestay',
    village: 'Mukteshwar',
    district: 'Nainital',
    owner: { name: 'Kamla Devi Bisht', phone: '+91 94120 11823', language: 'Kumaoni, Hindi', since: 2016 },
    license: 'UK-NTL-HS-2021-0142',
    rating: 4.9,
    reviewCount: 128,
    altitude: 2171,
    roadAccess: '150 m stone path from motorable road',
    images: rot(0),
    summary: 'Stone-and-slate Kumaoni house facing the Nanda Devi range.',
    description:
      'A 70-year-old stone house restored by the Bisht family. Wake up to an unbroken view of the Nanda Devi and Trishul peaks, eat dal and mandua roti from the family kitchen, and walk to the Chauli ki Jali cliffs in 20 minutes.',
    amenities: ['Hot water', 'Home-cooked meals', 'Mountain view', 'Room heater', 'Bonfire', 'Parking'],
    rooms: [
      { id: 'hs-101-r1', name: 'Himalaya Room', type: 'Double, attached bath', baseCapacity: 2, maxGuests: 3, pricePerNight: 2400 },
      { id: 'hs-101-r2', name: 'Family Loft', type: 'Family, 2 beds', baseCapacity: 4, maxGuests: 6, pricePerNight: 3800 },
    ],
    reviews: [
      { name: 'Ananya R.', city: 'Delhi', rating: 5, month: 'Jun 2026', cleanliness: 5, hospitality: 5, text: 'Exactly like the photos. Kamla ji packed us aloo parathas for the trek. The 15-minute hold meant we did not lose the room while UPI was slow.' },
      { name: 'Mark T.', city: 'London', rating: 5, month: 'May 2026', cleanliness: 5, hospitality: 5, text: 'Unreal sunrise. Voucher came on WhatsApp and SMS, which helped because we had no data on the last stretch of road.' },
    ],
    seed: [
      [0, 2, 2, 'online'],
      [0, 9, 3, 'phone'],
      [1, 0, 2, 'online'],
      [1, 5, 1, 'walk-in'],
      [1, 14, 4, 'online'],
    ],
  },
  {
    id: 'hs-102',
    name: 'Deodar Nest',
    village: 'Kasar Devi',
    district: 'Almora',
    owner: { name: 'Harish Chandra Joshi', phone: '+91 97590 22451', language: 'Kumaoni, Hindi, English', since: 2018 },
    license: 'UK-ALM-HS-2020-0088',
    rating: 4.8,
    reviewCount: 96,
    altitude: 1890,
    roadAccess: 'Motorable up to the gate',
    images: rot(1),
    summary: 'Quiet writer’s retreat under a deodar forest on Crank’s Ridge.',
    description:
      'A slow, quiet home on the famous Crank’s Ridge. Reading nook, fast-enough Wi-Fi for remote work, and evening walks to the Kasar Devi temple.',
    amenities: ['Wi-Fi', 'Hot water', 'Home-cooked meals', 'Mountain view', 'Parking'],
    rooms: [
      { id: 'hs-102-r1', name: 'Writer’s Room', type: 'Double, desk & bay window', baseCapacity: 2, maxGuests: 2, pricePerNight: 2900 },
      { id: 'hs-102-r2', name: 'Garden Room', type: 'Twin, garden access', baseCapacity: 2, maxGuests: 3, pricePerNight: 2600 },
    ],
    reviews: [
      { name: 'Rohit K.', city: 'Bengaluru', rating: 5, month: 'Apr 2026', cleanliness: 5, hospitality: 5, text: 'Worked remotely for two weeks. Harish ji’s chai at 5 pm is a ritual now.' },
    ],
    seed: [
      [0, 1, 3, 'online'],
      [1, 6, 2, 'online'],
      [0, 18, 5, 'online'],
    ],
  },
  {
    id: 'hs-103',
    name: 'Panchachuli View Cottage',
    village: 'Munsiyari',
    district: 'Pithoragarh',
    owner: { name: 'Bhagat Singh Pangtey', phone: '+91 94111 70032', language: 'Kumaoni, Hindi', since: 2015 },
    license: 'UK-PTH-HS-2019-0031',
    rating: 4.9,
    reviewCount: 74,
    altitude: 2298,
    roadAccess: '400 m uphill walk, porter available',
    images: rot(2),
    summary: 'Front-row seat to the five Panchachuli peaks.',
    description:
      'At the edge of Munsiyari with the five Panchachuli peaks filling every window. Bhagat ji has guided treks to Khaliya Top and Milam for 20 years.',
    amenities: ['Hot water', 'Home-cooked meals', 'Mountain view', 'Room heater', 'Trek guide', 'Bonfire'],
    rooms: [
      { id: 'hs-103-r1', name: 'Peak Room', type: 'Double, panoramic window', baseCapacity: 2, maxGuests: 3, pricePerNight: 2200 },
      { id: 'hs-103-r2', name: 'Trekkers’ Dorm', type: 'Shared, 6 bunks', baseCapacity: 6, maxGuests: 10, pricePerNight: 4800 },
    ],
    reviews: [
      { name: 'Sneha P.', city: 'Pune', rating: 5, month: 'May 2026', cleanliness: 4, hospitality: 5, text: 'Khaliya Top with Bhagat ji was the highlight of our year.' },
    ],
    seed: [
      [0, 3, 2, 'online'],
      [1, 4, 3, 'phone'],
    ],
  },
  {
    id: 'hs-104',
    name: 'Kafal Tree Home',
    village: 'Ranikhet',
    district: 'Almora',
    owner: { name: 'Geeta Rawat', phone: '+91 98370 45219', language: 'Garhwali, Hindi', since: 2019 },
    license: 'UK-ALM-HS-2022-0217',
    rating: 4.7,
    reviewCount: 61,
    altitude: 1869,
    roadAccess: 'Motorable up to the gate',
    images: rot(3),
    summary: 'Family home in an orchard of kafal and apricot trees.',
    description:
      'Pine forests, golf-course walks and a family that treats you like a cousin. Great for families with kids and elderly parents: no steep paths.',
    amenities: ['Hot water', 'Home-cooked meals', 'Parking', 'Wi-Fi', 'Room heater'],
    rooms: [
      { id: 'hs-104-r1', name: 'Orchard Room', type: 'Double', baseCapacity: 2, maxGuests: 3, pricePerNight: 2000 },
      { id: 'hs-104-r2', name: 'Courtyard Suite', type: 'Family suite', baseCapacity: 4, maxGuests: 5, pricePerNight: 3400 },
    ],
    reviews: [
      { name: 'Farah S.', city: 'Lucknow', rating: 5, month: 'Jun 2026', cleanliness: 5, hospitality: 5, text: 'Perfect for my parents. Flat access and Geeta ji’s rajma chawal.' },
    ],
    seed: [[1, 7, 2, 'online']],
  },
  {
    id: 'hs-105',
    name: 'Nanda Devi Homestay',
    village: 'Joshimath',
    district: 'Chamoli',
    owner: { name: 'Prem Singh Negi', phone: '+91 94589 30117', language: 'Garhwali, Hindi', since: 2014 },
    license: 'UK-CHM-HS-2018-0009',
    rating: 4.6,
    reviewCount: 143,
    altitude: 1875,
    roadAccess: 'Motorable, 2 km from Auli ropeway',
    images: rot(1),
    summary: 'Base camp for Auli, Kuari Pass and the Valley of Flowers.',
    description:
      'A practical, warm base for trekkers heading to Auli, Kuari Pass or the Valley of Flowers. Drying room for gear and early breakfasts on request.',
    amenities: ['Hot water', 'Home-cooked meals', 'Trek guide', 'Parking', 'Room heater'],
    rooms: [
      { id: 'hs-105-r1', name: 'Kuari Room', type: 'Double', baseCapacity: 2, maxGuests: 2, pricePerNight: 1800 },
      { id: 'hs-105-r2', name: 'Group Hall', type: 'Group, 4 beds', baseCapacity: 4, maxGuests: 8, pricePerNight: 4200 },
    ],
    reviews: [
      { name: 'Vikram J.', city: 'Mumbai', rating: 4, month: 'Jul 2026', cleanliness: 4, hospitality: 5, text: 'Ideal pre-trek stop. Prem ji helped us rent gear the night before.' },
    ],
    seed: [
      [0, 0, 3, 'online'],
      [1, 2, 4, 'online'],
    ],
  },
  {
    id: 'hs-106',
    name: 'Buransh Valley Stay',
    village: 'Kausani',
    district: 'Bageshwar',
    owner: { name: 'Sunita Kandpal', phone: '+91 97195 62208', language: 'Kumaoni, Hindi', since: 2020 },
    license: 'UK-BGS-HS-2023-0056',
    rating: 4.8,
    reviewCount: 52,
    altitude: 1890,
    roadAccess: '80 m walk from motorable road',
    images: rot(2),
    summary: 'Tea gardens and a 300 km sweep of Himalayan peaks.',
    description:
      'Gandhi called Kausani the Switzerland of India. Sunita ji’s veranda proves it. Tea-garden walks, Anasakti Ashram, and rhododendron season in spring.',
    amenities: ['Mountain view', 'Hot water', 'Home-cooked meals', 'Bonfire', 'Wi-Fi'],
    rooms: [
      { id: 'hs-106-r1', name: 'Buransh Room', type: 'Double, veranda', baseCapacity: 2, maxGuests: 3, pricePerNight: 2300 },
    ],
    reviews: [
      { name: 'Ishaan M.', city: 'Jaipur', rating: 5, month: 'Apr 2026', cleanliness: 5, hospitality: 5, text: 'Sunrise over 300 km of peaks from the bed. Worth every rupee.' },
    ],
    seed: [[0, 4, 2, 'online']],
  },
  {
    id: 'hs-107',
    name: 'Ramgarh Orchard House',
    village: 'Ramgarh',
    district: 'Nainital',
    owner: { name: 'Devendra Mehra', phone: '+91 94103 88760', language: 'Kumaoni, Hindi, English', since: 2017 },
    license: 'UK-NTL-HS-2020-0119',
    rating: 4.7,
    reviewCount: 88,
    altitude: 1789,
    roadAccess: 'Motorable up to the gate',
    images: rot(3),
    summary: 'Apple and plum orchards in the fruit bowl of Kumaon.',
    description:
      'Pick your own plums in June and apples in August. A big family house with a lawn, perfect for groups of friends.',
    amenities: ['Parking', 'Wi-Fi', 'Hot water', 'Home-cooked meals', 'Bonfire', 'Mountain view'],
    rooms: [
      { id: 'hs-107-r1', name: 'Plum Room', type: 'Double', baseCapacity: 2, maxGuests: 3, pricePerNight: 2500 },
      { id: 'hs-107-r2', name: 'Orchard Cottage', type: 'Cottage, 3 beds', baseCapacity: 6, maxGuests: 10, pricePerNight: 5600 },
    ],
    reviews: [
      { name: 'Neha G.', city: 'Gurugram', rating: 5, month: 'Aug 2026', cleanliness: 5, hospitality: 4, text: 'Ten of us in the cottage. Bonfire every night.' },
    ],
    seed: [
      [1, 1, 2, 'online'],
      [0, 10, 3, 'online'],
    ],
  },
  {
    id: 'hs-108',
    name: 'Chopta Meadows Home',
    village: 'Sari Village',
    district: 'Rudraprayag',
    owner: { name: 'Mohan Singh Rana', phone: '+91 94124 51390', language: 'Garhwali, Hindi', since: 2016 },
    license: 'UK-RDP-HS-2019-0044',
    rating: 4.8,
    reviewCount: 109,
    altitude: 2000,
    roadAccess: 'Motorable, trailhead to Deoria Tal',
    images: rot(0),
    summary: 'Trailhead home for Deoria Tal and Tungnath.',
    description:
      'Start the Deoria Tal trek from the back door. Mohan ji’s family has hosted trekkers for three generations; early breakfast from 5 am.',
    amenities: ['Trek guide', 'Hot water', 'Home-cooked meals', 'Mountain view', 'Room heater'],
    rooms: [
      { id: 'hs-108-r1', name: 'Tungnath Room', type: 'Double', baseCapacity: 2, maxGuests: 3, pricePerNight: 1900 },
      { id: 'hs-108-r2', name: 'Deoria Dorm', type: 'Shared, 8 bunks', baseCapacity: 8, maxGuests: 10, pricePerNight: 4600 },
    ],
    reviews: [
      { name: 'Arjun D.', city: 'Chandigarh', rating: 5, month: 'May 2026', cleanliness: 4, hospitality: 5, text: 'Chandrashila summit at sunrise, then back to hot rotis. Perfect.' },
    ],
    seed: [
      [0, 2, 1, 'online'],
      [1, 3, 2, 'online'],
    ],
  },
]

export const getHomestay = (id: string | undefined) => HOMESTAYS.find((h) => h.id === id)

export const findRoom = (roomId: string) => {
  for (const h of HOMESTAYS) {
    const r = h.rooms.find((x) => x.id === roomId)
    if (r) return { homestay: h, room: r }
  }
  return undefined
}

// ---------- Association / Tourism Department dashboard data ----------

export const ONBOARDING_BATCHES = [
  { name: 'Batch 1', target: 90, done: 90, clusters: 'Nainital, Mukteshwar, Ramgarh' },
  { name: 'Batch 2', target: 90, done: 90, clusters: 'Almora, Ranikhet, Kausani' },
  { name: 'Batch 3', target: 80, done: 67, clusters: 'Munsiyari, Joshimath, Chopta' },
]

export const DISTRICT_STATS: Array<{ district: District; homestays: number; occupancy: number; revenue: number; footfall: number }> = [
  { district: 'Nainital', homestays: 64, occupancy: 82, revenue: 1864000, footfall: 1412 },
  { district: 'Almora', homestays: 58, occupancy: 74, revenue: 1392000, footfall: 1108 },
  { district: 'Pithoragarh', homestays: 37, occupancy: 61, revenue: 702000, footfall: 563 },
  { district: 'Chamoli', homestays: 41, occupancy: 69, revenue: 916000, footfall: 788 },
  { district: 'Bageshwar', homestays: 24, occupancy: 66, revenue: 488000, footfall: 402 },
  { district: 'Rudraprayag', homestays: 23, occupancy: 71, revenue: 534000, footfall: 455 },
]

export const DISPUTES = [
  { id: 'DSP-031', homestay: 'Kafal Tree Home', type: 'Refund query', raised: '2 days ago', status: 'Open' },
  { id: 'DSP-029', homestay: 'Nanda Devi Homestay', type: 'Amenity mismatch (heater)', raised: '4 days ago', status: 'Investigating' },
  { id: 'DSP-027', homestay: 'Ramgarh Orchard House', type: 'Late check-in', raised: '6 days ago', status: 'Open' },
  { id: 'DSP-024', homestay: 'Panchachuli View Cottage', type: 'Porter charges', raised: '9 days ago', status: 'Resolved' },
]

export const GUEST_NAMES = [
  'Aarav Sharma',
  'Priya Nair',
  'Kabir Malhotra',
  'Emily Carter',
  'Siddharth Rao',
  'Meera Iyer',
  'Rahul Verma',
  'Zoya Khan',
  'Daniel Weber',
  'Tanvi Desai',
  'Aditya Singh',
  'Ritika Bose',
]
