import React, { useState } from 'react'
import { useAssumptions } from '../AssumptionsContext.jsx'
import { sharedHours, fmt } from '../formulas.js'

function CopyBlock({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  return (
    <div className="copy-block">
      <button className={`copy-btn ${copied?'copied':''}`} onClick={copy}>{copied?'✓ Copied':'Copy'}</button>
      <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word',margin:0,paddingRight:60}}>{text}</pre>
    </div>
  )
}

export default function EOICalculator() {
  const { assumptions: a } = useAssumptions()
  const [sub, setSub]   = useState({ date:'', suRef:'', clientName:'', contact:'', lot:'Lot 2' })
  const [prop, setProp] = useState({ address:'', bedrooms:2, staffed247:'Yes', assessDate:'' })
  const [n, setN]       = useState(2)
  const [wn, setWn]     = useState(7)
  const [sn, setSn]     = useState(0)
  const [hrs, setHrs]   = useState([20,20,0,0])
  const u = (s,f,v) => s(x=>({...x,[f]:v}))
  const updateHrs = (i,v) => { const h=[...hrs]; h[i]=v; setHrs(h) }
  const clients = Array.from({length:n},(_,i)=>i)

  const costs = clients.map(i => {
    const h1=hrs[i]||0; const sh=sharedHours(h1,a)
    const c1=h1*a.rate1to1; const cs=sh*a.rateShared
    const cw=wn*a.rateWakingNight; const csn=sn*a.rateSleepingNight
    return { h1, sh, c1, cs, cw, csn, total:c1+cs+cw+csn }
  })
  const combined = costs.reduce((s,c)=>s+c.total,0)

  const eoiText = `EOI PROPOSED COSTS — ${sub.suRef||'[SU Reference]'}
Provider: Tempra Healthcare Services
Date: ${sub.date||'[Date]'} | Contact: ${sub.contact||'[Contact]'} | ${sub.lot}

1:1 care hours: ${fmt(a.rate1to1)}/hr × ${costs[0]?.h1||0} hrs/wk = ${fmt(costs[0]?.c1||0)}/wk
Shared hours:   ${fmt(a.rateShared)}/hr × ${costs[0]?.sh||0} hrs/wk = ${fmt(costs[0]?.cs||0)}/wk
Waking nights:  ${wn} × ${fmt(a.rateWakingNight)}/client = ${fmt(costs[0]?.cw||0)}/wk${sn>0?`\nSleeping nights: ${sn} × ${fmt(a.rateSleepingNight)}/client = ${fmt(costs[0]?.csn||0)}/wk`:''}

Per client weekly cost: ${fmt(costs[0]?.total||0)}
Combined total (${n} client${n>1?'s':''}): ${fmt(combined)} / week

Note: Total costs are dependent on full assessment following initial placement.`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div className="grid-2">
        <div className="card fade-up fade-up-1">
          <div className="card-header gold"><h2>A — Submission Details</h2></div>
          <div className="card-body">
            {[['Date','date','date'],['SU Reference','suRef','text'],['Client name (internal)','clientName','text'],['Contact name','contact','text']].map(([l,f,t])=>(
              <div className="field-group" key={f}><label className="field-label">{l}</label>
                <input className="input" type={t} value={sub[f]} onChange={e=>u(setSub,f,e.target.value)} /></div>
            ))}
          </div>
        </div>
        <div className="card fade-up fade-up-2">
          <div className="card-header gold"><h2>B — Property</h2></div>
          <div className="card-body">
            <div className="field-group"><label className="field-label">Property address</label>
              <input className="input" value={prop.address} onChange={e=>u(setProp,'address',e.target.value)} /></div>
            <div className="grid-2">
              <div className="field-group"><label className="field-label">Bedrooms</label>
                <input className="input" type="number" value={prop.bedrooms} onChange={e=>u(setProp,'bedrooms',+e.target.value)} /></div>
              <div className="field-group"><label className="field-label">Staffed 24/7?</label>
                <select className="input" value={prop.staffed247} onChange={e=>u(setProp,'staffed247',e.target.value)}>
                  <option>Yes</option><option>No</option></select></div>
            </div>
            <div className="field-group"><label className="field-label">Assessment date</label>
              <input className="input" type="date" value={prop.assessDate} onChange={e=>u(setProp,'assessDate',e.target.value)} /></div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card fade-up fade-up-3">
          <div className="card-header gold"><h2>C & D — Clients & Hours</h2></div>
          <div className="card-body">
            <div className="field-group"><label className="field-label">Number of clients (1–4)</label>
              <input className="input" type="number" min="1" max="4" value={n} onChange={e=>setN(Math.min(4,Math.max(1,+e.target.value)))} /></div>
            {clients.map(i=>(
              <div key={i} className="grid-2" style={{marginTop:12}}>
                <div className="field-group"><label className="field-label">Client {i+1} — 1:1 hrs/wk</label>
                  <input className="input" type="number" min="0" max="105" value={hrs[i]||0} onChange={e=>updateHrs(i,+e.target.value)} /></div>
                <div className="field-group"><label className="field-label">Shared hrs (auto)</label>
                  <input className="input" value={sharedHours(hrs[i]||0,a).toFixed(0)} readOnly />
                  <p className="field-hint">at £{a.rateShared}/hr</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card fade-up fade-up-4">
          <div className="card-header gold"><h2>E — Night Support</h2></div>
          <div className="card-body">
            <div className="field-group"><label className="field-label">Waking nights / wk</label>
              <input className="input" type="number" min="0" max="7" value={wn} onChange={e=>setWn(+e.target.value)} />
              <p className="field-hint">{fmt(a.rateWakingNight)}/client/night — split equally</p></div>
            <div className="field-group"><label className="field-label">Sleeping nights / wk</label>
              <input className="input" type="number" min="0" max="7" value={sn} onChange={e=>setSn(+e.target.value)} />
              <p className="field-hint">{fmt(a.rateSleepingNight)}/client/night</p></div>
            {wn+sn>7&&<div className="warn-box">⚠️ Nights ({wn+sn}) exceed 7/wk</div>}
          </div>
        </div>
      </div>

      <div className="card fade-up fade-up-1">
        <div className="card-header"><h2>F — Cost Summary</h2></div>
        <div className="card-body" style={{overflowX:'auto'}}>
          <table className="data-table">
            <thead><tr><th>Cost</th>{clients.map(i=><th key={i}>Client {i+1}</th>)}<th>Combined</th></tr></thead>
            <tbody>
              {[['1:1 cost','c1'],['Shared cost','cs'],['Waking nights','cw'],['Sleeping nights','csn']].map(([l,k])=>(
                <tr key={k}><td style={{fontFamily:'var(--font)',fontWeight:500}}>{l}</td>
                  {clients.map(i=><td key={i}>{fmt(costs[i]?.[k]||0)}</td>)}
                  <td style={{fontWeight:700}}>{fmt(costs.reduce((s,c)=>s+(c[k]||0),0))}</td></tr>
              ))}
              <tr style={{background:'var(--navy)',color:'white'}}>
                <td style={{fontFamily:'var(--font)',fontWeight:700,color:'white'}}>TOTAL / WK</td>
                {clients.map(i=><td key={i} style={{fontWeight:700,color:'white'}}>{fmt(costs[i]?.total||0)}</td>)}
                <td style={{fontWeight:700,color:'white',fontSize:15}}>{fmt(combined)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card fade-up fade-up-2">
        <div className="card-header gold"><h2>G — EOI Cost Block</h2><p>Copy and paste into your submission</p></div>
        <div className="card-body">
          <CopyBlock text={eoiText} />
        </div>
      </div>
    </div>
  )
}
