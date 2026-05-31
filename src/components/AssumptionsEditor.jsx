import React from 'react'
import { useAssumptions } from '../AssumptionsContext.jsx'

function F({ label, field, hint, step='0.01', min, type='number' }) {
  const { assumptions: a, update } = useAssumptions()
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <input className="input" type={type} step={step} min={min} value={a[field]}
        onChange={e=>update(field, type==='number' ? +e.target.value : e.target.value)} />
      {hint&&<p className="field-hint">{hint}</p>}
    </div>
  )
}

export default function AssumptionsEditor() {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div className="card fade-up fade-up-1">
        <div className="card-header"><h2>⚙️ Assumptions — Control Panel</h2>
          <p>Change any value here and every tab updates instantly</p></div>
        <div className="card-body">

          <div className="assumptions-group">
            <p className="assumptions-group-title">Bristol Council Lot 2 — Confirmed Rates</p>
            <div className="grid-3">
              <F label="1:1 hourly rate (£/hr)"         field="rate1to1"          hint="Confirmed Bristol rate" />
              <F label="Shared hours rate (£/hr)"        field="rateShared"        hint="Per client per hour" />
              <F label="Waking night rate (£/night)"     field="rateWakingNight"   hint="Per client per night" />
              <F label="Sleeping night rate (£/night)"   field="rateSleepingNight" hint="Per client per night" />
              <F label="Max weekly hours (1:1 + shared)" field="maxWeeklyHours"    hint="Bristol cap = 105" step="1" />
            </div>
          </div>

          <div className="assumptions-group">
            <p className="assumptions-group-title">Staffing Costs</p>
            <div className="grid-3">
              <F label="Carer basic pay (£/hr)"       field="carerPay"      hint="Confirmed Tempra — April 2026" />
              <F label="Employer NI (%)"              field="employerNI"    hint="15% from April 2025" step="0.1" />
              <F label="Holiday pay uplift (%)"       field="holidayPay"    hint="5.6 wks / 46.4 wks worked" step="0.01" />
              <F label="Pension contribution (%)"     field="pension"       hint="AE minimum 3%" step="0.5" />
              <F label="PPE & consumables (£/hr)"     field="ppe"           hint="Gloves, aprons, masks" />
              <F label="Training (£/hr)"              field="training"      hint="Mandatory refreshers amortised" />
              <F label="Shift utilisation (%)"        field="utilisation"   hint="Billable ÷ scheduled. Sector: 78–85%" step="1" />
            </div>
          </div>

          <div className="assumptions-group">
            <p className="assumptions-group-title">Night Carer Pay — Estimates ⚠️</p>
            <div className="warn-box">These are estimated rates. Update with confirmed payroll figures before formal pricing or tender submissions.</div>
            <div className="grid-2">
              <F label="Waking night carer pay (£/hr)"   field="wakingNightCarerPay"   hint="Estimate: +15% on base pay" />
              <F label="Sleeping night carer pay (£/hr)" field="sleepingNightCarerPay" hint="Estimate: +10% on base pay" />
            </div>
          </div>

          <div className="assumptions-group">
            <p className="assumptions-group-title">Overheads</p>
            <div className="grid-3">
              <F label="Management overhead (% of revenue)" field="managementOverheadPct" hint="Coordinators & admin" step="1" />
              <F label="RM weekly cost (£)"                 field="rmWeeklyCost"          hint="£45k salary ÷ 52 weeks" />
              <F label="Fixed weekly costs (£)"             field="fixedWeeklyCosts"       hint="Confirmed: rental, software, insurance, CQC" />
              <F label="Active client count"                field="activeClients"          hint="Used to split fixed overhead per package" step="1" min="1" />
            </div>
          </div>

          <div className="assumptions-group">
            <p className="assumptions-group-title">Target Margins</p>
            <div className="grid-2">
              <F label="Minimum acceptable margin (%)" field="minMargin"    hint="Below this = REJECT" step="1" />
              <F label="Target margin (%)"             field="targetMargin" hint="At or above this = TAKE" step="1" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
