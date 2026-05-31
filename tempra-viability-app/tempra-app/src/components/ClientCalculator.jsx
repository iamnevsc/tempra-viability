import React, { useState } from 'react'
import { useAssumptions } from '../AssumptionsContext.jsx'
import { loadedRate, sharedHours, decision, fmt, pct } from '../formulas.js'

export default function ClientCalculator() {
  const { assumptions: a } = useAssumptions()
  const [client, setClient] = useState({ name:'', funder:'Council', type:'Supported Living', complexity:2, propertyRequired:false })
  const [h1, setH1]  = useState(20)
  const [sh, setSh]  = useState(null)
  const [wn, setWn]  = useState(0)
  const [sn, setSn]  = useState(0)
  const [rent, setRent] = useState(0)
  const u = (f,v) => setClient(c=>({...c,[f]:v}))

  const autoSh = sharedHours(h1, a)
  const shared = sh !== null ? sh : autoSh
  const lr = loadedRate(a)
  const onC = 1 + a.employerNI/100 + a.holidayPay/100 + a.pension/100
  const baseDayStaff    = (h1 + shared) * lr / (a.utilisation/100)
  const wakingNightCost = wn * a.wakingNightCarerPay * onC * 8
  const sleepNightCost  = sn * a.sleepingNightCarerPay * onC * 8
  const totalStaff = baseDayStaff + wakingNightCost + sleepNightCost
  const revenue    = h1*a.rate1to1 + shared*a.rateShared + wn*a.rateWakingNight + sn*a.rateSleepingNight
  const mgmtOH     = revenue * (a.managementOverheadPct/100)
  const fixedShare = a.activeClients > 0 ? (a.rmWeeklyCost + a.fixedWeeklyCosts)/a.activeClients : 0
  const totalOH    = mgmtOH + fixedShare
  const totalProp  = rent
  const totalCosts = totalStaff + totalOH + totalProp
  const profit     = revenue - totalCosts
  const margin     = revenue > 0 ? profit/revenue : 0
  const dec        = decision(margin, a)
  const decBg = {TAKE:'var(--take)',REVIEW:'var(--review)',REJECT:'var(--reject)'}

  const scenarios = [
    { label:'Base (expected)',                   rev:revenue,          cost:totalCosts },
    { label:'Best case (+5% billing, -3% costs)',rev:revenue*1.05,     cost:totalCosts*0.97 },
    { label:'Worst case (-8% billing, +5% costs)',rev:revenue*0.92,    cost:totalCosts*1.05 },
  ]

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div className="card fade-up fade-up-1">
        <div className="card-header"><h2>A — Client Details</h2></div>
        <div className="card-body">
          <div className="grid-3">
            <div className="field-group"><label className="field-label">Client reference</label>
              <input className="input" placeholder="e.g. Client A" value={client.name} onChange={e=>u('name',e.target.value)} /></div>
            <div className="field-group"><label className="field-label">Funder</label>
              <select className="input" value={client.funder} onChange={e=>u('funder',e.target.value)}>
                <option>Council</option><option>NHS/CHC</option><option>Private</option></select></div>
            <div className="field-group"><label className="field-label">Care type</label>
              <select className="input" value={client.type} onChange={e=>u('type',e.target.value)}>
                <option>Supported Living</option><option>Domiciliary</option><option>Live-In</option></select></div>
            <div className="field-group"><label className="field-label">Complexity (1–4)</label>
              <select className="input" value={client.complexity} onChange={e=>u('complexity',+e.target.value)}>
                <option value={1}>1 — Low</option><option value={2}>2 — Medium</option>
                <option value={3}>3 — High</option><option value={4}>4 — Very High</option></select></div>
            <div className="field-group"><label className="field-label">Property required?</label>
              <select className="input" value={client.propertyRequired?'Yes':'No'} onChange={e=>u('propertyRequired',e.target.value==='Yes')}>
                <option>No</option><option>Yes</option></select></div>
          </div>
        </div>
      </div>

      <div className="card fade-up fade-up-2">
        <div className="card-header teal"><h2>B — Hours & Billing</h2></div>
        <div className="card-body">
          <div className="grid-4">
            <div className="field-group"><label className="field-label">1:1 hours / wk</label>
              <input className="input" type="number" min="0" max="105" value={h1} onChange={e=>{setH1(+e.target.value);setSh(null)}} />
              <p className="field-hint">£{a.rate1to1}/hr</p></div>
            <div className="field-group"><label className="field-label">Shared hours / wk</label>
              <input className="input" type="number" min="0" value={sh!==null?sh:autoSh} onChange={e=>setSh(+e.target.value)} />
              <p className="field-hint">Auto: {autoSh} hrs at £{a.rateShared}/hr</p></div>
            <div className="field-group"><label className="field-label">Waking nights / wk</label>
              <input className="input" type="number" min="0" max="7" value={wn} onChange={e=>setWn(+e.target.value)} />
              <p className="field-hint">£{a.rateWakingNight}/night</p></div>
            <div className="field-group"><label className="field-label">Sleeping nights / wk</label>
              <input className="input" type="number" min="0" max="7" value={sn} onChange={e=>setSn(+e.target.value)} />
              <p className="field-hint">£{a.rateSleepingNight}/night</p></div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card fade-up fade-up-3">
          <div className="card-header" style={{background:decBg[dec]}}>
            <h2>F — P&L Summary</h2>
            <p>{dec==='TAKE'?'✅ TAKE':dec==='REVIEW'?'⚠️ REVIEW':'❌ REJECT'} — {pct(margin)} net margin</p>
          </div>
          <div className="card-body">
            {[
              [`1:1 billing (${h1} hrs × £${a.rate1to1})`, h1*a.rate1to1],
              [`Shared billing (${shared.toFixed(0)} hrs × £${a.rateShared})`, shared*a.rateShared],
              wn>0&&[`Waking nights (${wn} × £${a.rateWakingNight})`, wn*a.rateWakingNight],
              sn>0&&[`Sleeping nights (${sn} × £${a.rateSleepingNight})`, sn*a.rateSleepingNight],
            ].filter(Boolean).map(([l,v])=><div className="result-row" key={l}><span className="label">{l}</span><span className="value">{fmt(v)}</span></div>)}
            <div className="result-row total"><span className="label">Weekly revenue</span><span className="value">{fmt(revenue)}</span></div>
            <div style={{borderTop:'2px dashed var(--mid)',margin:'10px 0'}} />
            <div className="result-row"><span className="label">Day/eve staffing</span><span className="value">{fmt(baseDayStaff)}</span></div>
            {wn>0&&<div className="result-row"><span className="label">Waking night staff</span><span className="value">{fmt(wakingNightCost)}</span></div>}
            {sn>0&&<div className="result-row"><span className="label">Sleeping night staff</span><span className="value">{fmt(sleepNightCost)}</span></div>}
            <div className="result-row"><span className="label">Management overhead (12%)</span><span className="value">{fmt(mgmtOH)}</span></div>
            <div className="result-row"><span className="label">Fixed overhead share</span><span className="value">{fmt(fixedShare)}</span></div>
            {client.propertyRequired&&<div className="field-group" style={{margin:'12px 0 4px'}}>
              <label className="field-label">Weekly rent (£/wk)</label>
              <input className="input" type="number" value={rent} onChange={e=>setRent(+e.target.value)} /></div>}
            {totalProp>0&&<div className="result-row"><span className="label">Property cost</span><span className="value">{fmt(totalProp)}</span></div>}
            <div style={{borderTop:'2px solid var(--navy)',margin:'10px 0'}} />
            <div className="result-row total"><span className="label">Total costs</span><span className="value">{fmt(totalCosts)}</span></div>
            <div className="result-row total">
              <span className="label">Weekly net profit</span>
              <span className="value" style={{color:profit<0?'var(--reject)':'var(--take)',fontSize:18}}>{fmt(profit)}</span>
            </div>
            <div className="result-row"><span className="label">Annual net profit</span><span className="value">{fmt(profit*52)}</span></div>
            <div className="result-row"><span className="label">Net margin</span>
              <span className="value" style={{color:margin<a.minMargin/100?'var(--reject)':margin<a.targetMargin/100?'var(--review)':'var(--take)'}}>{pct(margin)}</span>
            </div>
          </div>
        </div>

        <div className="card fade-up fade-up-4">
          <div className="card-header"><h2>G — Scenarios & Sensitivity</h2></div>
          <div className="card-body">
            {scenarios.map(({label,rev,cost})=>{
              const p=rev-cost; const m=rev>0?p/rev:0; const d=decision(m,a)
              return <div key={label} style={{marginBottom:16,paddingBottom:16,borderBottom:'1px solid var(--pale)'}}>
                <p style={{fontSize:11,fontWeight:700,color:'var(--grey)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.4px'}}>{label}</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                  <div><p style={{fontSize:11,color:'var(--grey)'}}>Revenue</p><p style={{fontSize:13,fontWeight:600,fontFamily:'var(--mono)'}}>{fmt(rev)}</p></div>
                  <div><p style={{fontSize:11,color:'var(--grey)'}}>Profit</p><p style={{fontSize:13,fontWeight:600,fontFamily:'var(--mono)',color:p<0?'var(--reject)':'var(--take)'}}>{fmt(p)}</p></div>
                  <div><p style={{fontSize:11,color:'var(--grey)'}}>Margin</p><span className={`badge ${d.toLowerCase()}`} style={{fontSize:11,padding:'3px 8px'}}>{pct(m)}</span></div>
                </div>
              </div>
            })}
            <p className="section-title">Sensitivity Tests</p>
            {[
              { label:'Rate drops £2/hr', delta: -(h1+shared)*2 },
              { label:'Carer wage +£1/hr', delta: -((h1+shared)*onC/(a.utilisation/100)) },
            ].map(({label,delta})=>(
              <div className="result-row" key={label}>
                <span className="label">{label}</span>
                <span className="value" style={{color:'var(--reject)'}}>{fmt(profit+delta)} ({pct(revenue>0?(profit+delta)/revenue:0)})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
