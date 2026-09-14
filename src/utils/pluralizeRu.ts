/** Склонение «месяц / месяца / месяцев» по числу. */
export function formatMonthsWord(n: number): string {
  const abs = Math.abs(Math.trunc(n)) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return 'месяцев'
  if (last === 1) return 'месяц'
  if (last >= 2 && last <= 4) return 'месяца'
  return 'месяцев'
}

/** Склонение «день / дня / дней» по числу. */
export function formatDaysWord(n: number): string {
  const abs = Math.abs(Math.trunc(n)) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return 'дней'
  if (last === 1) return 'день'
  if (last >= 2 && last <= 4) return 'дня'
  return 'дней'
}

export function formatRenewalPeriodLabel(periodMonths: number): string {
  return `Продление на ${periodMonths} ${formatMonthsWord(periodMonths)}`
}
