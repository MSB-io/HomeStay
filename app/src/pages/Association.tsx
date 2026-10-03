import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Download,
  Filter,
  Landmark,
  Printer,
} from 'lucide-react'
import { DISPUTES, DISTRICTS, DISTRICT_STATS, ONBOARDING_BATCHES } from '../data/mock'
import { inr, inrCompact } from '../lib/utils'
import { Bar, Button, Card, Eyebrow, Pill, Stat } from '../components/ui'

export default function Association() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All')
  const [showEVMMatrix, setShowEVMMatrix] = useState<boolean>(true)

  // Overall totals across districts
  const totalHomestays = DISTRICT_STATS.reduce((a, b) => a + b.homestays, 0) // 247 out of 260
  const avgOccupancy = Math.round(
    DISTRICT_STATS.reduce((a, b) => a + b.occupancy * b.homestays, 0) / totalHomestays,
  )
  const totalRevenue = DISTRICT_STATS.reduce((a, b) => a + b.revenue, 0)
  const totalFootfall = DISTRICT_STATS.reduce((a, b) => a + b.footfall, 0)

  // Filtered district statistics
  const filteredDistricts = useMemo(() => {
    if (selectedDistrict === 'All') return DISTRICT_STATS
    return DISTRICT_STATS.filter((d) => d.district === selectedDistrict)
  }, [selectedDistrict])

  // EVM metrics from project charter
  const evm = {
    bac: 1200000, // ₹12.00 Lakh
    pv: 600000, // ₹6.00 Lakh (50% planned)
    ac: 520000, // ₹5.20 Lakh
    ev: 504000, // ₹5.04 Lakh (42% actual)
    cv: -16000, // -₹16,000
    sv: -96000, // -₹96,000 (16% slippage)
    cpi: 0.969,
    spi: 0.84,
    eac: 1238000,
    vac: -38000,
  }

  // Export CSV Audit Data (FR-10)
  const handleExportCSV = () => {
    const headers = ['District', 'Registered Homestays', 'Average Occupancy %', 'Gross Revenue (INR)', 'Seasonal Footfall']
    const rows = DISTRICT_STATS.map((d) => [
      d.district,
      d.homestays,
      `${d.occupancy}%`,
      d.revenue,
      d.footfall,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Uttarakhand_Homestay_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="size-4.5" />
            <Eyebrow>District Tourism Governance &amp; Compliance Dashboard (FR-09, FR-10)</Eyebrow>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Uttarakhand Hill Homestays
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            District Tourism Association · Department of Tourism Oversight · 260 Statutory Target
          </p>
        </div>

        {/* Audit export actions (FR-10) */}
        <div className="no-print flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => window.print()} id="print-audit-report">
            <Printer className="size-3.5" /> Print Audit Summary
          </Button>
          <Button size="sm" onClick={handleExportCSV} id="export-csv-button">
            <Download className="size-3.5" /> Export Compliance CSV
          </Button>
        </div>
      </div>

      {/* Core Operational KPI Cards */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Stat
          label="Registered Homestays"
          value={
            <span>
              {totalHomestays} <span className="text-sm font-normal text-neutral-400">/ 260</span>
            </span>
          }
          sub="95% of district statutory target"
        />
        <Stat
          label="District Avg Occupancy"
          value={`${avgOccupancy}%`}
          sub="Pre-season forecast peak: 91%"
        />
        <Stat
          label="Gross Booking Volume"
          value={inrCompact(totalRevenue)}
          sub="Across all 6 hill districts"
        />
        <Stat
          label="Verified Tourist Footfall"
          value={totalFootfall.toLocaleString('en-IN')}
          sub="Unique domestic & foreign guests"
        />
      </div>

      {/* Week-8 Earned Value Management (EVM) Executive Status Section */}
      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Pill solid>Week 8 of 16 Checkpoint</Pill>
              <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                Project Control &amp; Monitoring
              </span>
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Earned Value Analysis (EVM)</h2>
          </div>
          <button
            onClick={() => setShowEVMMatrix(!showEVMMatrix)}
            className="text-xs font-medium text-neutral-600 underline hover:text-ink sm:self-end"
          >
            {showEVMMatrix ? 'Hide EVM Details' : 'Show Full EVM Formula Matrix'}
          </button>
        </div>

        {showEVMMatrix && (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {/* EVM Metric Summary Card */}
            <Card className="p-5 lg:col-span-2">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-neutral-50 p-3">
                  <p className="text-[11px] text-neutral-500 font-medium">Planned Value (PV)</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">{inrCompact(evm.pv)}</p>
                  <p className="text-[10px] text-neutral-400">50% work planned</p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-3">
                  <p className="text-[11px] text-neutral-500 font-medium">Actual Cost (AC)</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">{inrCompact(evm.ac)}</p>
                  <p className="text-[10px] text-neutral-400">₹80k less cash spent</p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-3">
                  <p className="text-[11px] text-neutral-500 font-medium">Earned Value (EV)</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">{inrCompact(evm.ev)}</p>
                  <p className="text-[10px] text-neutral-400">42% work completed</p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-3">
                  <p className="text-[11px] text-neutral-500 font-medium">Budget at Comp. (BAC)</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">{inrCompact(evm.bac)}</p>
                  <p className="text-[10px] text-neutral-400">Statutory grant ceiling</p>
                </div>
              </div>

              {/* Variances & Indices */}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-neutral-500">Cost Variance (CV)</p>
                  <p className="text-sm font-semibold tabular-nums text-ink">
                    -₹16,000 <span className="text-[11px] font-normal text-neutral-500">(Over budget)</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Schedule Variance (SV)</p>
                  <p className="text-sm font-semibold tabular-nums text-ink">
                    -₹96,000 <span className="text-[11px] font-normal text-neutral-500">(16% delay)</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Cost Index (CPI)</p>
                  <p className="text-sm font-semibold tabular-nums">0.969</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Schedule Index (SPI)</p>
                  <p className="text-sm font-semibold tabular-nums">0.840 (84% speed)</p>
                </div>
              </div>

              {/* Plain Language Interpretation for Committee */}
              <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-xs leading-relaxed text-neutral-700">
                <strong>Plain-Language Explanation for Tourism Department:</strong> Spending ₹5.20L against ₹6.00L is an{' '}
                <em>optical illusion</em>. We did not save ₹80,000; we spent less purely because our field staff and dev team achieved only 42% work
                instead of 50%. Relative to the work actually completed (valued at ₹5.04L), we are running ₹16k over cost and 1.3 weeks behind schedule.
              </div>
            </Card>

            {/* Corrective Action Card */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Approved Corrective Action</p>
                <h3 className="mt-2 text-base font-semibold">Pre-Summer Recovery Plan</h3>
                <ul className="mt-3 space-y-2 text-xs text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
                    <span>
                      <strong>Field Fast-Tracking:</strong> Reallocated ₹30,000 contingency for motorcycle fuel stipends and 1 extra Almora field assistant.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
                    <span>
                      <strong>Scope Pruning:</strong> Temporarily froze "Could Have" audit graphics to keep 100% focus on Critical Path locks.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
                    <span>
                      <strong>Signing Authority:</strong> Formally approved by District Tourism Officer (DTO) for Milestone 3 fund release.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Sign-off: DTO Almora &amp; Nainital</span>
                <Pill>In Effect</Pill>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* Field Onboarding Pipeline Progress across 3 Batches */}
      <section className="mt-12">
        <Eyebrow>Field Operations &amp; CPM Critical Path</Eyebrow>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Onboarding Batch Progress (260 Homestays)</h2>
        <p className="mt-1 text-xs text-neutral-500">
          3 field staff working 5 productive hours/day. The physical field onboarding route governs the true Critical Path (Activities F → I → K).
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {ONBOARDING_BATCHES.map((b) => {
            const pct = Math.round((b.done / b.target) * 100)
            return (
              <Card key={b.name} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{b.name}</p>
                  <Pill solid={pct === 100}>{pct === 100 ? 'Completed' : 'Active Batch'}</Pill>
                </div>
                <p className="mt-1 text-xs text-neutral-500">Clusters: {b.clusters}</p>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tabular-nums">
                    {b.done} <span className="text-sm font-normal text-neutral-400">/ {b.target} units</span>
                  </span>
                  <span className="text-xs font-semibold tabular-nums">{pct}%</span>
                </div>
                <Bar value={b.done} max={b.target} className="mt-2" />
              </Card>
            )
          })}
        </div>
      </section>

      {/* District-by-District Breakdown Table */}
      <section className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Eyebrow>Regional Analytics</Eyebrow>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Performance by Hill District</h2>
          </div>

          {/* District filter */}
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-neutral-500" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-9 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium text-ink outline-none"
              id="district-filter"
            >
              <option value="All">All 6 Districts</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500">
              <tr>
                <th className="px-5 py-3.5">District</th>
                <th className="px-5 py-3.5">Onboarded Homestays</th>
                <th className="px-5 py-3.5">Avg Occupancy</th>
                <th className="px-5 py-3.5">Gross Revenue</th>
                <th className="px-5 py-3.5">Verified Footfall</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredDistricts.map((d) => (
                <tr key={d.district} className="hover:bg-neutral-50 transition">
                  <td className="px-5 py-3.5 font-medium">{d.district}</td>
                  <td className="px-5 py-3.5 tabular-nums">{d.homestays} units</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums font-medium">{d.occupancy}%</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100">
                        <div className="h-full bg-ink rounded-full" style={{ width: `${d.occupancy}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums">{inr(d.revenue)}</td>
                  <td className="px-5 py-3.5 tabular-nums">{d.footfall.toLocaleString('en-IN')} travellers</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-neutral-100 text-neutral-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Grievance & Dispute Log (FR-09) */}
      <section className="mt-12">
        <Eyebrow>Quality Assurance &amp; Mediation</Eyebrow>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Active Disputes &amp; Resolution Queue</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Enforces standard pricing ceilings, overbooking mediation, and verified guest refund grievances.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DISPUTES.map((disp) => (
            <Card key={disp.id} className="p-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs tabular-nums">{disp.id}</span>
                  <span className="text-xs text-neutral-400">· {disp.raised}</span>
                </div>
                <p className="mt-1 font-medium text-sm">{disp.homestay}</p>
                <p className="text-xs text-neutral-500">{disp.type}</p>
              </div>
              <Pill solid={disp.status === 'Resolved'}>
                {disp.status}
              </Pill>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
