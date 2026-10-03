# HomeStay — Web Application Prototype

Interactive frontend prototype for **Case Study 103: HomeStay Booking Platform for a Hill District (Uttarakhand)**.

Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite**, adhering strictly to the SEPM specifications (SRS, UML, CPM Project Plan, BVA/ECP Test Suite, EVM Monitoring & Control).

---

## Design System & Tokens

* **Color Palette:** Pure monochrome ink (`#0a0a0a`) and paper (`#ffffff`) — light mode only.
* **Typography:** `Geist Variable` exclusively.
* **Border Radius:** Standardized `rounded-md` (6px) across cards, inputs, buttons, and modals.
* **Header:** Transparent sticky navigation with backdrop blur and centered navigation links.
* **Aesthetics:** High-whitespace minimalism with micro-animations.

---

## Route & Feature Map

| Path | View | Core SEPM Specifications Demonstrated |
| :--- | :--- | :--- |
| `/` | **Home / Search** | FR-01 guest search bounded by BVA limits (1–10 guests, 1–30 nights), district filters, live inventory cards. |
| `/homestay/:id` | **Listing Detail** | Multi-room selection, 30-day interactive occupancy grid, authentic reviews, 15-minute temporary hold initiation (FR-02). |
| `/checkout/:holdId` | **Checkout & Payments** | FR-02 15:00 countdown timer, mock payment methods, webhook simulation, interactive race-condition collision demo. |
| `/booking/:id` | **Confirmed Voucher** | FR-04 QR booking voucher, escrow payout split (5% association levy), bilingual SMS/WhatsApp host notification preview. |
| `/trips` | **Trips & Cancellations** | FR-08 tiered cancellation refund engine (>7d 100%, 2–7d 50%, <48h 0%), post-stay verified review submission. |
| `/owner` | **Owner Dashboard** | FR-05 offline-first PWA sync simulation, arrivals queue, guest check-in, one-tap manual walk-in block modal. |
| `/association` | **Association Portal** | FR-09 statutory progress (247/260 homestays), Week-8 EVM dashboard (PV/AC/EV/SV/CV/CPI/SPI), CPM Critical Path batches, disputes, live CSV export. |

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build and typecheck
npm run build
```
