/** 3대 리소스 타입 — 웹을 구성하는 3요소 */
export type ResourceType = 'html' | 'css' | 'js'

/** 리소스 보유량 */
export interface Resources {
  html: number
  css: number
  js: number
}

/** 리소스 비용 정의 */
export type ResourceCost = Partial<Resources>

/** 리소스 상한 */
export const RESOURCE_CAP = 500

/** 기지 기본 리소스 생산율 (per second) */
export const BASE_PRODUCTION_RATES: Resources = {
  html: 2,
  css: 1.5,
  js: 1,
}

/** 점령 페이지당 리소스 보너스 배율 */
export const CAPTURE_BONUS_MULTIPLIER = 0.5
