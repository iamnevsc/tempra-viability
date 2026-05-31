import React, { useState } from 'react'
import { useAssumptions } from '../AssumptionsContext.jsx'
import { grossBilling, staffingCost, sharedHours, decision, fmt, pct } from '../formulas.js'

export default function QuickScreen() {
  const { assumptions: a } = useAssumptions()
  const [hrs1to1, setH]   = useState(20)
  const [rate, setR]       = useState(26.25)
  const [wakingN, setW]    = useState(0)
  const [sleepN, setS]     = useState(0)
  const [avail, setA]      = useState(120)

  const shared   = sharedHours(hrs1to1, a)
  const revenue  = grossBilling({ hrs1to1, hrsShared:shared, wakingNights:wakingN, sleepingNights:sleepN, billingRate:rate, a })
  const costs    = staffingCost({ hrs1to1, hrsShared:shared, wakingNights:wakingN, sleepingNights:sleepN, a })
  const profit   = revenue - costs
  const margin   = revenue > 0 ? profit/revenue : 0
  const dec      = decision(margin, a)
  const totalHrs = hrs1to1 + shared
  const headroom = avail - totalHrs

  const decBg  = { TAKE:'var(--take)', REVIEW:'var(--review)', REJECT:'var(--reject)' }
  const msgs   = {
    TAKE:   `✅ TAKE — ${pct(margin)} margin. Meets the ${a.targetMargin}% target. Proceed to full assessment.`,
    REVIEW: `⚠️ REVIEW — ${pct(margin)} margin. Above ${a.minMargin}% minimum but below ${a.targetMargin}% target. Check Client Calculator.`,
    REJECT: `❌ REJECT — ${pct(margin)} margin. Below the ${a.minMargin}% minimum threshold.`,
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
      <div className="card fade-up fade-up-1">
        <div className="card-header teal"><h2>⚡ Quick Screen</h2><p>Instant viability decision</p></div>
        <div className="card-body">
          <p className="section-title">Hours & Billing</p>
          <div className="field-group">
            <label className="field-label">1:1 care hours per week</label>
            <input className="input" type="number" min="0" max="105" value={hrs1to1} onChange={e=>setH(+e.target.value)} />
            <p className="field-hint">Shared hours auto: {shared.toFixed(0)} hrs at £{a.rateShared}/hr</p>
          </div>
          <div className="grid-2">
            <div className="field-group">
              <label className="field-label">1:1 billing rate (£/hr)</label>
              <input className="input" type="number" step="0.25" value={rate} onChange={e=>setR(+e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">Shared rate (£/hr)</label>
              <input className="input" value={a.rateShared} readOnly />
            </div>
          </div>
          <div className="grid-2">
            <div className="field-group">
              <label className="field-label">Waking nights / wk</label>
              <input className="input" type="number" min="0" max="7" value={wakingN} onChange={e=>setW(+e.target.value)} />
              <p className="field-hint">£{a.rateWakingNight}/night</p>
            </div>
            <div className="field-group">
              <label className="field-label">Sleeping nights / wk</label>
              <input className="input" type="number" min="0" max="7" value={sleepN} onChange={e=>setS(+e.target.value)} />
              <p className="field-hint">£{a.rateSleepingNight}/night</p>
            </div>
          </div>
          <p className="section-title">Capacity Check</p>
          <div className="field-group">
            <label className="field-label">Available staff hours / wk</label>
            <input className="input" type="number" value={avail} onChange={e=>setA(+e.target.value)} />
          </div>
          <div className="result-row">
            <span className="label">Hours this client needs</span>
            <span className="value">{totalHrs.toFixed(0)} hrs</span>
          </div>
          <div className="result-row">
            <span className="label">Headroom remaining</span>
            <span className="value" style={{color:headroom<0?'var(--reject)':headroom<20?'var(--review)':'var(--take)'}}>{headroom.toFixed(0)} hrs</span>
          </div>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <div className="card fade-up fade-up-2">
          <div className="card-header" style={{background:decBg[dec]}}>
            <h2 style={{fontSize:16}}>{msgs[dec]}</h2>
          </div>
          <div className="card-body">
            <div className="kpi-strip" style={{gridTemplateColumns:'1fr 1fr 1fr',marginBottom:0}}>
              {[
                {l:'Weekly Revenue',    v:fmt(revenue),         s:'gross billing'},
                {l:'Weekly Profit',     v:fmt(profit),          s:'after all costs', c:profit<0?'var(--reject)':'var(--take)'},
                {l:'Net Margin',        v:pct(margin),          s:`target ${a.targetMargin}%`, c:margin<a.minMargin/100?'var(--reject)':margin<a.targetMargin/100?'var(--review)':'var(--take)'},
              ].map(({l,v,s,c})=>(
                <div className="kpi-card" key={l}>
                  <div className="kpi-label">{l}</div>
                  <div className="kpi-value" style={c?{color:c}:{}}>{v}</div>
                  <div className="kpi-sub">{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card fade-up fade-up-3">
          <div className="card-body">
            <p className="section-title">Cost Breakdown</p>
            {[
              [`1:1 billing (${hrs1to1} hrs × £${rate})`, hrs1to1*rate],
              [`Shared billing (${shared.toFixed(0)} hrs × £${a.rateShared})`, shared*a.rateShared],
              wakingN > 0 && [`Waking nights (${wakingN} × £${a.rateWakingNight})`, wakingN*a.rateWakingNight],
              sleepN  > 0 && [`Sleeping nights (${sleepN} × £${a.rateSleepingNight})`, sleepN*a.rateSleepingNight],
              ['Weekly revenue', revenue],
              ['Staffing + overhead cost', costs],
              ['Weekly net profit', profit],
              ['Annual net profit', profit*52],
            ].filter(Boolean).map(([l,v],i)=>(
              <div className="result-row" key={i} style={i===4?{borderTop:'2px solid var(--mid)',paddingTop:10}:{}}>
                <span className="label">{l}</span>
                <span className="value" style={l.includes('profit')?{color:v<0?'var(--reject)':'var(--take)'}:{}}>{fmt(v)}</span>
              </div>
            ))}
          </div>
        </div>

        {dec === 'REJECT' && (
          <div className="card fade-up fade-up-4" style={{border:'2px solid var(--reject)'}}>
            <div className="card-body">
              <p className="section-title" style={{color:'var(--reject)',borderColor:'var(--reject)'}}>Why REJECT? What could change it</p>
              <ul style={{fontSize:13,lineHeight:1.9,paddingLeft:18,color:'var(--navy)'}}>
                <li><b>Higher billing rate</b> — private clients at £36+/hr transform viability</li>
                <li><b>Fewer 1:1 hours</b> with same rate improves margin</li>
                <li><b>Fewer waking nights</b> — the most expensive element</li>
                <li>Run the <b>Client Calculator</b> for a full cost breakdown</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
