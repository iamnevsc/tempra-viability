import React, { createContext, useContext, useState } from 'react';
const defaultAssumptions = {
  rate1to1: 26.25, rateShared: 10.00, rateWakingNight: 85.00, rateSleepingNight: 57.00, maxWeeklyHours: 105,
  carerPay: 12.71, employerNI: 15, holidayPay: 12.07, pension: 3, ppe: 0.35, training: 0.20, utilisation: 82,
  wakingNightCarerPay: 14.62, sleepingNightCarerPay: 13.98,
  managementOverheadPct: 12, rmWeeklyCost: 865, fixedWeeklyCosts: 1085, activeClients: 4,
  minMargin: 8, targetMargin: 15,
  properties: [
    { id: 1, name: '4 Mayfield', bedrooms: 3, maxCapacity: 3, currentClients: 2, monthlyCost: 2755.45 },
    { id: 2, name: '88 Conygre', bedrooms: 3, maxCapacity: 3, currentClients: 2, monthlyCost: 3341.25 },
  ],
};
const Ctx = createContext(null);
export function AssumptionsProvider({ children }) {
  const [assumptions, setAssumptions] = useState(defaultAssumptions);
  const update = (key, value) => setAssumptions(a => ({ ...a, [key]: value }));
  const updateProperty = (id, key, value) =>
    setAssumptions(a => ({ ...a, properties: a.properties.map(p => p.id === id ? { ...p, [key]: value } : p) }));
  return <Ctx.Provider value={{ assumptions, update, updateProperty }}>{children}</Ctx.Provider>;
}
export function useAssumptions() { return useContext(Ctx); }
