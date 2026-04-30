/** Единый список секций кабинета: маршрут `/:section` и тип `ProfileSection`. */
export const PROFILE_SECTIONS = ['profile', 'learning', 'glossary', 'renewal', 'review', 'logout'] as const

export type ProfileSection = (typeof PROFILE_SECTIONS)[number]

/** Фрагмент path для Vue Router: `/:section(${HOME_SECTION_PATH_RE})` */
export const HOME_SECTION_PATH_RE = PROFILE_SECTIONS.join('|')
