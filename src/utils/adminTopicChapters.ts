import type { LessonChapter } from '@/services/api/types'

export type ParseChaptersResult =
  | { ok: true; chapters: LessonChapter[] }
  | { ok: false; error: string }

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Форматирует `time_seconds` в `MM:SS` или `H:MM:SS` при часах ≥ 1. */
export function formatTimeSeconds(timeSeconds: number): string {
  const total = Math.max(0, Math.floor(timeSeconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) {
    return `${h}:${pad2(m)}:${pad2(s)}`
  }
  return `${pad2(m)}:${pad2(s)}`
}

export function formatChaptersToText(chapters: LessonChapter[]): string {
  return chapters
    .map((ch) => `${formatTimeSeconds(ch.time_seconds)} ${ch.title}`.trimEnd())
    .join('\n')
}

/**
 * Парсит строки вида `MM:SS Title` или `H:MM:SS Title`.
 * Пустой текст → `chapters: []` (очистка по контракту API).
 */
export function parseChaptersText(text: string): ParseChaptersResult {
  const lines = text.split(/\r?\n/)
  const chapters: LessonChapter[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const match = line.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?\s+(.+)$/)
    if (!match) {
      return {
        ok: false,
        error: `Строка ${i + 1}: ожидается формат «MM:SS Название» или «H:MM:SS Название»`,
      }
    }

    const title = match[4].trim()
    if (!title) {
      return { ok: false, error: `Строка ${i + 1}: укажите название таймкода` }
    }

    let timeSeconds: number
    if (match[3] !== undefined) {
      const h = Number(match[1])
      const m = Number(match[2])
      const s = Number(match[3])
      if (m > 59 || s > 59) {
        return {
          ok: false,
          error: `Строка ${i + 1}: минуты и секунды должны быть в диапазоне 0–59`,
        }
      }
      timeSeconds = h * 3600 + m * 60 + s
    } else {
      const m = Number(match[1])
      const s = Number(match[2])
      if (s > 59) {
        return { ok: false, error: `Строка ${i + 1}: секунды должны быть в диапазоне 0–59` }
      }
      timeSeconds = m * 60 + s
    }

    chapters.push({ time_seconds: timeSeconds, title })
  }

  return { ok: true, chapters }
}
