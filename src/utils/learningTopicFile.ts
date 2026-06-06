import type { LearningTopicFile, LearningTopicFileType } from '@/types/learning-course'
import type { FileResponse } from '@/services/api/types'

const EXTENSION_TO_TYPE: Record<string, LearningTopicFileType> = {
  pdf: 'pdf',
  docx: 'docx',
  png: 'png',
  jpg: 'jpeg',
  jpeg: 'jpeg',
}

export function resolveLearningTopicFileType(
  fileType?: string | null,
  fileName?: string,
): LearningTopicFileType {
  const normalizedType = fileType?.trim().toLowerCase().replace(/^\./, '')
  if (normalizedType && normalizedType in EXTENSION_TO_TYPE) {
    return EXTENSION_TO_TYPE[normalizedType]!
  }

  const name = fileName?.trim().toLowerCase() ?? ''
  const dotIndex = name.lastIndexOf('.')
  if (dotIndex >= 0) {
    const ext = name.slice(dotIndex + 1)
    if (ext in EXTENSION_TO_TYPE) {
      return EXTENSION_TO_TYPE[ext]!
    }
  }

  return 'other'
}

export function formatLearningFileSize(bytes?: number | null): string | null {
  if (bytes == null || bytes <= 0) return null
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export function mapFileResponseToLearningTopicFile(file: FileResponse): LearningTopicFile {
  return {
    id: file.id,
    fileName: file.file_name,
    fileUrl: file.file_url,
    fileType: resolveLearningTopicFileType(file.file_type, file.file_name),
    fileSize: file.file_size,
  }
}

export function isLearningTopicImageFile(fileType: LearningTopicFileType): boolean {
  return fileType === 'png' || fileType === 'jpeg'
}
