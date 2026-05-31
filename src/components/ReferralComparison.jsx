import React, { useState } from 'react'
import { useAssumptions } from '../AssumptionsContext.jsx'
import { grossBilling, staffingCost, sharedHours, decision, qualityScore, fmt, pct } from '../formulas.js'

const DEFAULTS = [
  { name:'Client A', hrs1to1:20, rate:26.25, wn:2, sn:0, complexity:2, prop:true  },
  { name:'Client B', hrs1to1:15, rate:26.25, wn:0, sn:1, complexity:1, prop:false },
  { name:'Client C', hrs1to1:20, rate:26.25, wn:1, sn:0, complexity:3, prop:true  },
  { name:'Client D', hrs1to1:25, rate:26.25, wn:3, sn:0, complexity:4, prop:true  },
  { name:'Client E', hrs1to1:20, rate:26.25, wn:0, sn:1, complexity:1, prop:false },
]

export default function ReferralComparison() {
  const { assumptions: a } = useAssumptions()
  const [clients, setClients] = useState(DEFAULTS)
  const upd = (i,f,v) => setClients(cs => cs.map((c,idx) => idx===i ? {...c,[f]:v} : c))

  const results = clients.map(c => {
    const shared  = sharedHours(c.hrs1to1, a)
    const revenue = grossBilling({ hrs1to1:c.hrs1to1, hrsShared:shared, wakingNights:c.wn, sleepingNights:c.sn, billingRate:c.rate, a })
    const costs   = staffingCost({ hrs1to1:c.hrs1to1, hrsShared:shared, wakingNights:c.wn, sleepingNights:c.sn, a })
    const profit  = revenue - costs
    const margin  = revenue > 0 ? profit/revenue : 0
    const dec     = decision(margin, a)
    const score   = qualityScore({ margin, complexity:c.complexity, propertyRequired:c.prop })
    return { revenue, costs, profit, margin, dec, score, shared }
  })

  const ranked = [...results.map((r,i)=>({...r,i}))].sort((a,b)=>b.margin-a.margin)
  const DC = { TAKE:'var(--take)', REVIEW:'var(--review)', REJECT:'var(--reject)' }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div className="card fade-up fade-up-1">
        <div className="card-header teal"><h2>⚖️ Priority Ranking</h2><p>Sorted by net margin — best first</p></div>
        <div className="card-body" style={{overflowX:'auto'}}>
          <table className="data-table">
            <thead><tr><th>#</th><th>Client</th><th>Revenue/wk</th><th>Costs/wk</th><th>Profit/wk</th><th>Margin</th><th>Score</th><th>Decision</th></tr></thead>
            <tbody>
              {ranked.map((r,rank) => {
                const c = clients[r.i]
                return (
                  <tr key={r.i}>
                    <td style={{fontWeight:700,color:'var(--teal)'}}>#{rank+1}</td>
                    <td style={{fontFamily:'var(--font)',fontWeight:600}}>{c.name}</td>
                    <td>{fmt(r.revenue)}</td>
                    <td>{fmt(r.costs)}</td>
                    <td style={{color:r.profit<0?'var(--reject)':'var(--take)',fontWeight:600}}>{fmt(r.profit)}</td>
                    <td style={{color:DC[r.dec],fontWeight:700}}>{pct(r.margin)}</td>
                    <td style={{fontWeight:600}}>{r.score.toFixed(1)}/10</td>
                    <td><span className={`badge ${r.dec.toLowerCase()}`} style={{fontSize:11,padding:'3px 8px'}}>
                      {r.dec==='TAKE'?'✅':r.dec==='REVIEW'?'⚠️':'❌'} {r.dec}
                    </span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
        {clients.map((c,i) => {
          const r = results[i]
          return (
            <div key={i} className="card fade-up" style={{animationDelay:`${i*0.05}s`,opacity:0}}>
              <div className="card-header" style={{background:DC[r.dec],padding:'12px 16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <h2 style={{fontSize:14}}>{c.name||`Client ${i+1}`}</h2>
                  <span className={`badge ${r.dec.toLowerCase()}`} style={{fontSize:11,padding:'3px 8px'}}>
                    {r.dec==='TAKE'?'✅':r.dec==='REVIEW'?'⚠️':'❌'} {r.dec}
                  </span>
                </div>
                <p style={{marginTop:4,fontSize:12}}>{fmt(r.revenue)}/wk · {pct(r.margin)} · score {r.score.toFixed(1)}/10</p>
              </div>
              <div className="card-body" style={{padding:16}}>
                <div className="grid-2">
                  {[
                    ['Name','name','text',c.name],
                    ['Rate (£/hr)','rate','number',c.rate,0.25],
                    ['1:1 hrs/wk','hrs1to1','number',c.hrs1to1,1],
                    ['Complexity','complexity','select',c.complexity],
                    ['Waking nights','wn','number',c.wn,1],
                    ['Sleeping nights','sn','number',c.sn,1],
                  ].map(([l,f,t,v,step]) => (
                    <div className="field-group" key={f}>
                      <label className="field-label">{l}</label>
                      {t==='select'
                        ? <select className="input" value={v} onChange={e=>upd(i,f,+e.target.value)} style={{padding:'7px 10px',fontSize:13}}>
                            <option value={1}>1 Low</option><option value={2}>2 Med</option>
                            <option value={3}>3 High</option><option value={4}>4 V.High</option>
                          </select>
                        : <input className="input" type={t} step={step} min={t==='number'?0:undefined}
                            value={v} onChange={e=>upd(i,f,t==='number'?+e.target.value:e.target.value)}
                            style={{padding:'7px 10px',fontSize:13}} />
                      }
                      {f==='hrs1to1'&&<p className="field-hint">Shared: {r.shared.toFixed(0)} hrs</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
