import React from 'react'
import { useAssumptions } from '../AssumptionsContext.jsx'
import { fmt } from '../formulas.js'

export default function MyProperties() {
  const { assumptions: a, updateProperty } = useAssumptions()

  const calc = p => {
    const wk = p.monthlyCost / 4.33
    return {
      wk,
      costPerRoom:     p.bedrooms      > 0 ? wk / p.bedrooms      : 0,
      costPerClient:   p.currentClients> 0 ? wk / p.currentClients: 0,
      costAtFull:      p.maxCapacity   > 0 ? wk / p.maxCapacity   : 0,
      occupancy:       p.maxCapacity   > 0 ? p.currentClients / p.maxCapacity : 0,
      voidRooms:       p.maxCapacity - p.currentClients,
      costPerRoomMonth:p.bedrooms      > 0 ? p.monthlyCost / p.bedrooms : 0,
    }
  }

  const totalMonthly = a.properties.reduce((s,p)=>s+p.monthlyCost,0)
  const totalClients = a.properties.reduce((s,p)=>s+p.currentClients,0)

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div className="kpi-strip fade-up fade-up-1">
        {[
          {l:'Total monthly cost', v:fmt(totalMonthly), s:`${a.properties.length} properties`},
          {l:'Total weekly cost',  v:fmt(totalMonthly/4.33), s:'÷ 4.33'},
          {l:'Current clients',    v:totalClients, s:`of ${a.properties.reduce((s,p)=>s+p.maxCapacity,0)} max capacity`},
        ].map(({l,v,s})=>(
          <div className="kpi-card" key={l}>
            <div className="kpi-label">{l}</div>
            <div className="kpi-value">{v}</div>
            <div className="kpi-sub">{s}</div>
          </div>
        ))}
      </div>

      {a.properties.map(p => {
        const c = calc(p)
        const occ = Math.round(c.occupancy * 100)
        return (
          <div key={p.id} className="card fade-up fade-up-2">
            <div className="card-header teal">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h2>🏠 {p.name}</h2>
                <span style={{fontSize:13,background:'rgba(255,255,255,.15)',padding:'4px 12px',borderRadius:20,fontWeight:600}}>
                  {occ}% occupied
                </span>
              </div>
              <p>{p.currentClients}/{p.maxCapacity} clients · {p.bedrooms} bedrooms</p>
            </div>
            <div className="card-body">
              <div className="grid-2">
                <div>
                  <p className="section-title">Property Details</p>
                  <div className="field-group">
                    <label className="field-label">Monthly cost — all-in (£)</label>
                    <input className="input" type="number" step="0.01" value={p.monthlyCost}
                      onChange={e=>updateProperty(p.id,'monthlyCost',+e.target.value)} />
                    <p className="field-hint">Includes rent and all bills</p>
                  </div>
                  <div className="grid-3">
                    {[['Bedrooms','bedrooms'],['Max capacity','maxCapacity'],['Current clients','currentClients']].map(([l,f])=>(
                      <div className="field-group" key={f}>
                        <label className="field-label">{l}</label>
                        <input className="input" type="number" min="0" value={p[f]}
                          onChange={e=>updateProperty(p.id,f,+e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                      <span style={{color:'var(--grey)'}}>Occupancy</span>
                      <span style={{fontWeight:600}}>{occ}%</span>
                    </div>
                    <div style={{background:'var(--pale)',borderRadius:4,height:8,overflow:'hidden'}}>
                      <div style={{width:`${occ}%`,height:'100%',background:occ<67?'var(--review)':'var(--take)',borderRadius:4,transition:'width 0.3s'}} />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="section-title">Cost Analysis</p>
                  {[
                    ['Total monthly cost',            fmt(p.monthlyCost)],
                    ['Total weekly cost (÷ 4.33)',    fmt(c.wk)],
                    ['Cost per room / month',         fmt(c.costPerRoomMonth)],
                    ['Cost per room / week',          fmt(c.costPerRoom)],
                  ].map(([l,v])=>(
                    <div className="result-row" key={l}><span className="label">{l}</span><span className="value">{v}</span></div>
                  ))}
                  <div className="result-row highlight">
                    <span className="label" style={{fontWeight:700}}>Cost per client / week (current)</span>
                    <span className="value" style={{fontSize:16}}>{fmt(c.costPerClient)}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Cost per client / week (full capacity)</span>
                    <span className="value">{fmt(c.costAtFull)}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Hrs/wk to cover property (at £{a.rate1to1}/hr)</span>
                    <span className="value">{(c.costPerClient/a.rate1to1).toFixed(1)} hrs</span>
                  </div>
                  {c.voidRooms > 0 && (
                    <div className="warn-box" style={{marginTop:12}}>
                      ⚠️ <strong>{c.voidRooms} void room{c.voidRooms>1?'s':''}</strong> — unrecovered cost {fmt(c.voidRooms*c.costPerRoom)}/wk.
                      At full capacity, per-client cost falls to {fmt(c.costAtFull)}/wk.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
