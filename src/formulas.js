export function loadedRate(a) {
  return a.carerPay * (1 + a.employerNI/100 + a.holidayPay/100 + a.pension/100) + a.ppe + a.training;
}
export function sharedHours(hrs1to1, a) { return Math.max(0, a.maxWeeklyHours - hrs1to1); }
export function grossBilling({ hrs1to1, hrsShared, wakingNights, sleepingNights, billingRate, a }) {
  const shared = hrsShared !== undefined ? hrsShared : sharedHours(hrs1to1, a);
  return hrs1to1 * billingRate + shared * a.rateShared + wakingNights * a.rateWakingNight + sleepingNights * a.rateSleepingNight;
}
export function staffingCost({ hrs1to1, hrsShared, wakingNights, sleepingNights, a }) {
  const shared = hrsShared !== undefined ? hrsShared : sharedHours(hrs1to1, a);
  const lr = loadedRate(a);
  const onC = 1 + a.employerNI/100 + a.holidayPay/100 + a.pension/100;
  const oh = a.activeClients > 0 ? (a.rmWeeklyCost + a.fixedWeeklyCosts) / a.activeClients : 0;
  return (hrs1to1 + shared) * lr / (a.utilisation/100)
    + wakingNights   * a.wakingNightCarerPay   * onC * 8
    + sleepingNights * a.sleepingNightCarerPay * onC * 8
    + oh;
}
export function decision(margin, a) {
  if (margin >= a.targetMargin/100) return 'TAKE';
  if (margin >= a.minMargin/100)    return 'REVIEW';
  return 'REJECT';
}
export function qualityScore({ margin, complexity, propertyRequired }) {
  return Math.max(0, Math.min(10, margin * 33 + Math.max(0, 4 - complexity) * 1.5 + (propertyRequired ? 0 : 1)));
}
export function fmt(n) { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n); }
export function pct(n) { return (n * 100).toFixed(1) + '%'; }
