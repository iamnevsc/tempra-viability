import React, { useState } from 'react'
import './styles.css'
import { AssumptionsProvider } from './AssumptionsContext.jsx'
import QuickScreen        from './components/QuickScreen.jsx'
import ClientCalculator   from './components/ClientCalculator.jsx'
import EOICalculator      from './components/EOICalculator.jsx'
import ReferralComparison from './components/ReferralComparison.jsx'
import MyProperties       from './components/MyProperties.jsx'
import AssumptionsEditor  from './components/AssumptionsEditor.jsx'

const TABS = [
  { id:'quick',       label:'⚡ Quick Screen',       C:QuickScreen },
  { id:'client',      label:'📊 Client Calculator',  C:ClientCalculator },
  { id:'eoi',         label:'📝 EOI Calculator',     C:EOICalculator },
  { id:'compare',     label:'⚖️ Compare Referrals',  C:ReferralComparison },
  { id:'properties',  label:'🏠 My Properties',      C:MyProperties },
  { id:'assumptions', label:'⚙️ Assumptions',        C:AssumptionsEditor },
]

export default function App() {
  const [tab, setTab] = useState('quick')
  const Tab = TABS.find(t=>t.id===tab)?.C || QuickScreen
  return (
    <AssumptionsProvider>
      <div className="app-shell">
        <header className="top-bar">
          <div className="top-bar-brand">
            <div className="top-bar-logo">TH</div>
            <div>
              <div className="top-bar-title">Tempra Healthcare Services</div>
              <div className="top-bar-sub">Care Viability Model</div>
            </div>
          </div>
          <div style={{fontSize:12,color:'var(--mid)'}}>Bristol Council — Lot 2</div>
        </header>
        <nav className="nav-tabs">
          {TABS.map(t=>(
            <button key={t.id} className={`nav-tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
        <main className="main-content"><Tab /></main>
      </div>
    </AssumptionsProvider>
  )
}
