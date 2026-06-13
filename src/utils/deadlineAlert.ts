import type { ProductProgressResponse, ProductResponse } from '@/services/api/types'

export const DEADLINE_ALERT_THRESHOLD_DAYS = 10

export interface DeadlineAlertItem {
  productId: string
  title: string
  daysLeft: number
  deadline: string
}

export function resolveDaysLeft(progress: ProductProgressResponse): number | null {
  if (progress.days_left != null) {
    return progress.days_left
  }
  if (!progress.deadline) {
    return null
  }
  const end = new Date(progress.deadline)
  if (Number.isNaN(end.getTime())) {
    return null
  }
  const diffMs = end.getTime() - Date.now()
  return Math.ceil(diffMs / 86_400_000)
}

export function formatDaysLeftRu(days: number): string {
  const abs = Math.abs(days)
  const mod10 = abs % 10
  const mod100 = abs % 100

  if (mod100 >= 11 && mod100 <= 14) {
    return `${days} дней`
  }
  if (mod10 === 1) {
    return `${days} день`
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return `${days} дня`
  }
  return `${days} дней`
}

export function buildDeadlineAlertRemainderText(daysLeft: number): string {
  if (daysLeft === 0) {
    return 'остался последний день'
  }
  if (daysLeft === 1) {
    return 'остался 1 день'
  }
  return `осталось ${formatDaysLeftRu(daysLeft)}`
}

export function isCourseNeedingDeadlineAlert(progress: ProductProgressResponse | undefined): boolean {
  if (!progress?.deadline) {
    return false
  }
  const days = resolveDaysLeft(progress)
  return days !== null && days >= 0 && days <= DEADLINE_ALERT_THRESHOLD_DAYS
}

export function getCoursesNeedingDeadlineAlert(
  courses: ProductResponse[],
  progressMap: Record<string, ProductProgressResponse>,
): DeadlineAlertItem[] {
  const alerts: DeadlineAlertItem[] = []

  for (const course of courses) {
    const progress = progressMap[course.id]
    if (!isCourseNeedingDeadlineAlert(progress)) {
      continue
    }
    const daysLeft = resolveDaysLeft(progress!)
    if (daysLeft === null || !progress?.deadline) {
      continue
    }
    alerts.push({
      productId: course.id,
      title: course.title,
      daysLeft,
      deadline: progress.deadline,
    })
  }

  return alerts.sort((a, b) => a.daysLeft - b.daysLeft)
}
