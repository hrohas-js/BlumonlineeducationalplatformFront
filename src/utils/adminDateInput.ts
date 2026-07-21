const DD_MM_YYYY = /^(\d{2})\.(\d{2})\.(\d{4})$/
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** Сегодня (локальный календарь) в формате `YYYY-MM-DD` для `min` у `input type="date"`. */
export function formatLocalDateForInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** `ДД.ММ.ГГГГ` → `YYYY-MM-DD` для `input type="date"`; иначе пустая строка. */
export function deadlineRuLabelToIso(label: string | null | undefined): string {
  if (!label) return ''
  const m = label.trim().match(DD_MM_YYYY)
  if (!m) return ''
  const dd = parseInt(m[1], 10)
  const mm = parseInt(m[2], 10)
  const yyyy = parseInt(m[3], 10)
  const d = new Date(yyyy, mm - 1, dd)
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return ''
  return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
}

/** `YYYY-MM-DD` → `ДД.ММ.ГГГГ`; при невалидном формате — пустая строка. */
export function isoDateToRuLabel(iso: string): string {
  const t = iso.trim()
  const m = t.match(ISO_DATE)
  if (!m) return ''
  const yyyy = parseInt(m[1], 10)
  const mm = parseInt(m[2], 10)
  const dd = parseInt(m[3], 10)
  const d = new Date(yyyy, mm - 1, dd)
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return ''
  return `${String(dd).padStart(2, '0')}.${String(mm).padStart(2, '0')}.${yyyy}`
}

export function isRuDeadlineFormat(str: string): boolean {
  return DD_MM_YYYY.test(str.trim())
}

/** Парсинг строки `ДД.ММ.ГГГГ` в `Date` (полночь локального времени) или `null`. */
export function parseRuDeadlineToDate(str: string): Date | null {
  const t = str.trim()
  if (!DD_MM_YYYY.test(t)) return null
  const [dd, mm, yyyy] = t.split('.').map((x) => parseInt(x, 10))
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null
  const d = new Date(yyyy, mm - 1, dd)
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null
  return d
}

/** Парсинг `YYYY-MM-DD` в `Date` (полдень UTC-независимое сравнение как в форме папки). */
export function parseIsoDateToTime(iso: string): number {
  const t = iso.trim()
  if (!ISO_DATE.test(t)) return Number.NaN
  return Date.parse(`${t}T12:00:00`)
}

/** `ДД.ММ.ГГГГ` → `YYYY-MM-DDT00:00:00Z`; пустая/невалидная строка → `null`. */
export function ruDeadlineToAccessDuration(label: string): string | null {
  const trimmed = label.trim()
  if (!trimmed) return null
  const iso = deadlineRuLabelToIso(trimmed)
  if (!iso) return null
  return `${iso}T00:00:00Z`
}

/** Datetime / date-only → `ДД.ММ.ГГГГ`; иначе пустая строка. */
export function accessDurationToRuLabel(value: string | null | undefined): string {
  if (!value) return ''
  const t = value.trim()
  if (!t) return ''
  const datePart = t.slice(0, 10)
  if (ISO_DATE.test(datePart)) {
    return isoDateToRuLabel(datePart)
  }
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return isoDateToRuLabel(`${yyyy}-${mm}-${dd}`)
}
