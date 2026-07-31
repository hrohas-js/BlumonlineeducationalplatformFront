/** Разрешённые расширения видео для темы (админка). */
export const ADMIN_TOPIC_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'] as const

const ALLOWED_MIME_PREFIX = 'video/'

const DANGEROUS_NAME_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /\.(html?|js|php|svg|exe|bat|cmd|sh)(\s|$|\.)/i,
]

const DANGEROUS_CONTENT_PATTERNS = [
  /<script\b/i,
  /<\/script>/i,
  /javascript:/i,
  /<\?php/i,
  /<!doctype\s+html/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /<iframe\b/i,
]

const CONTENT_SCAN_BYTES = 65536

function readFileHead(file: File, maxBytes: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const slice = file.slice(0, Math.min(file.size, maxBytes))
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsArrayBuffer(slice)
  })
}

function hasAllowedExtension(fileName: string): boolean {
  const lower = fileName.trim().toLowerCase()
  return ADMIN_TOPIC_VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

function hasDangerousFileName(fileName: string): boolean {
  if (/[<>]/.test(fileName)) return true
  return DANGEROUS_NAME_PATTERNS.some((pattern) => pattern.test(fileName))
}

function hasVideoMagicBytes(head: Uint8Array, lowerName: string): boolean {
  if (head.length < 4) return false

  // WebM / Matroska
  if (head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) {
    return true
  }

  // MP4 / MOV: «ftyp» обычно с 4-го байта
  if (head.length >= 8) {
    const box = String.fromCharCode(head[4], head[5], head[6], head[7])
    if (box === 'ftyp') return true
  }

  const scanLen = Math.min(head.length, 64)
  let ascii = ''
  for (let i = 0; i < scanLen; i += 1) {
    const c = head[i]
    ascii += c >= 32 && c <= 126 ? String.fromCharCode(c) : ' '
  }
  if (ascii.includes('ftyp')) return true

  return lowerName.endsWith('.webm') && head[0] === 0x1a
}

function hasDangerousContent(head: Uint8Array): boolean {
  const sample = new TextDecoder('utf-8', { fatal: false }).decode(head)
  return DANGEROUS_CONTENT_PATTERNS.some((pattern) => pattern.test(sample))
}

export type AdminTopicVideoValidationResult =
  | { ok: true }
  | { ok: false; error: string }

/** MIME для presigned upload: file.type или fallback по расширению. */
export function resolveVideoContentType(file: File): string {
  if (file.type && file.type.startsWith(ALLOWED_MIME_PREFIX)) {
    return file.type
  }
  const lower = file.name.trim().toLowerCase()
  if (lower.endsWith('.webm')) return 'video/webm'
  if (lower.endsWith('.mov')) return 'video/quicktime'
  return 'video/mp4'
}

/** Проверка формата видео и отсутствия скриптов в имени/начале файла. */
export async function validateAdminTopicVideoFile(file: File): Promise<AdminTopicVideoValidationResult> {
  if (!hasAllowedExtension(file.name)) {
    return { ok: false, error: 'Допустимые форматы: MP4, WebM, MOV.' }
  }

  if (hasDangerousFileName(file.name)) {
    return {
      ok: false,
      error: 'Имя файла содержит недопустимые символы или фрагменты кода.',
    }
  }

  if (file.type && !file.type.startsWith(ALLOWED_MIME_PREFIX)) {
    return { ok: false, error: 'Файл не является видео.' }
  }

  let head: Uint8Array
  try {
    head = await readFileHead(file, CONTENT_SCAN_BYTES)
  } catch {
    return { ok: false, error: 'Не удалось прочитать файл. Попробуйте снова.' }
  }

  const lowerName = file.name.trim().toLowerCase()
  if (!hasVideoMagicBytes(head, lowerName)) {
    return { ok: false, error: 'Содержимое файла не соответствует формату видео.' }
  }

  if (hasDangerousContent(head)) {
    return {
      ok: false,
      error: 'В файле обнаружены подозрительные фрагменты (скрипты). Выберите другой видеофайл.',
    }
  }

  return { ok: true }
}
