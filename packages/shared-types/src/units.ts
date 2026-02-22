import type { ResourceCost } from './resources'

/** 유닛 역할군 */
export type UnitRole = 'tank' | 'support' | 'dps'

/** 유닛 등급 */
export type UnitTier = 1 | 2 | 3

/** 유닛 타입 ID */
export type UnitTypeId =
  // Tier 1
  | 'html_soldier'
  | 'css_guardian'
  | 'js_striker'
  // Tier 2
  | 'html_knight'
  | 'css_mage'
  | 'js_assassin'
  // Tier 3
  | 'html_titan'
  | 'css_archmage'
  | 'js_overlord'
  // Special
  | 'api_connector'
  | 'debug_drone'
  | 'firewall'

/** 상성 카테고리 */
export type CounterClass = 'html' | 'css' | 'js' | 'special'

/** 유닛 스탯 정의 */
export interface UnitStats {
  id: UnitTypeId
  name: string
  tier: UnitTier
  role: UnitRole
  counterClass: CounterClass
  hp: number
  atk: number
  speed: number
  cost: ResourceCost
  /** 초당 유지 비용 (리소스 소비) */
  upkeep: number
  /** 특수 능력 설명 */
  ability?: string
}

/** 상성 배율 */
export const COUNTER_MULTIPLIERS = {
  advantage: 1.5,
  neutral: 1.0,
  disadvantage: 0.7,
} as const

/**
 * 상성 매트릭스: attacker → defender → 배율 키
 * HTML > JS, JS > CSS, CSS > HTML
 */
export const COUNTER_MATRIX: Record<CounterClass, Record<CounterClass, keyof typeof COUNTER_MULTIPLIERS>> = {
  html: { html: 'neutral', css: 'disadvantage', js: 'advantage', special: 'neutral' },
  css: { html: 'advantage', css: 'neutral', js: 'disadvantage', special: 'neutral' },
  js: { html: 'disadvantage', css: 'advantage', js: 'neutral', special: 'neutral' },
  special: { html: 'neutral', css: 'neutral', js: 'neutral', special: 'neutral' },
}

/** 측면/후방 공격 보너스 */
export const FLANK_BONUS = 0.2

/** 전체 유닛 정의 테이블 */
export const UNIT_DEFINITIONS: Record<UnitTypeId, UnitStats> = {
  // === Tier 1 ===
  html_soldier: {
    id: 'html_soldier',
    name: 'HTML 솔저 <div>',
    tier: 1,
    role: 'tank',
    counterClass: 'html',
    hp: 120,
    atk: 8,
    speed: 1.0,
    cost: { html: 30 },
    upkeep: 0.3,
  },
  css_guardian: {
    id: 'css_guardian',
    name: 'CSS 가디언 {shield}',
    tier: 1,
    role: 'support',
    counterClass: 'css',
    hp: 80,
    atk: 5,
    speed: 0.8,
    cost: { css: 40 },
    upkeep: 0.4,
  },
  js_striker: {
    id: 'js_striker',
    name: 'JS 스트라이커 func()',
    tier: 1,
    role: 'dps',
    counterClass: 'js',
    hp: 60,
    atk: 15,
    speed: 1.5,
    cost: { js: 50 },
    upkeep: 0.5,
  },

  // === Tier 2 ===
  html_knight: {
    id: 'html_knight',
    name: 'HTML 나이트 <section>',
    tier: 2,
    role: 'tank',
    counterClass: 'html',
    hp: 200,
    atk: 12,
    speed: 0.9,
    cost: { html: 60, css: 20 },
    upkeep: 0.6,
  },
  css_mage: {
    id: 'css_mage',
    name: 'CSS 메이지 {animate}',
    tier: 2,
    role: 'support',
    counterClass: 'css',
    hp: 130,
    atk: 8,
    speed: 0.7,
    cost: { css: 80, html: 20 },
    upkeep: 0.8,
    ability: '범위 버프: 인접 아군 방어력 +20%',
  },
  js_assassin: {
    id: 'js_assassin',
    name: 'JS 어쌔신 async()',
    tier: 2,
    role: 'dps',
    counterClass: 'js',
    hp: 90,
    atk: 22,
    speed: 1.8,
    cost: { js: 90, html: 20 },
    upkeep: 0.9,
    ability: '은신: 첫 공격 시 2x 데미지',
  },

  // === Tier 3 ===
  html_titan: {
    id: 'html_titan',
    name: 'HTML 타이탄 <main>',
    tier: 3,
    role: 'tank',
    counterClass: 'html',
    hp: 350,
    atk: 18,
    speed: 0.7,
    cost: { html: 100, css: 40, js: 20 },
    upkeep: 1.2,
  },
  css_archmage: {
    id: 'css_archmage',
    name: 'CSS 아크메이지 {transform}',
    tier: 3,
    role: 'support',
    counterClass: 'css',
    hp: 180,
    atk: 12,
    speed: 0.6,
    cost: { css: 120, html: 40, js: 20 },
    upkeep: 1.4,
    ability: '광역 버프: 모든 아군 방어력 +30%',
  },
  js_overlord: {
    id: 'js_overlord',
    name: 'JS 오버로드 Promise.all()',
    tier: 3,
    role: 'dps',
    counterClass: 'js',
    hp: 120,
    atk: 35,
    speed: 1.2,
    cost: { js: 140, html: 40, css: 20 },
    upkeep: 1.6,
    ability: '광역 공격: 3기까지 동시 타격',
  },

  // === Special ===
  api_connector: {
    id: 'api_connector',
    name: 'API 커넥터',
    tier: 2,
    role: 'support',
    counterClass: 'special',
    hp: 100,
    atk: 3,
    speed: 1.0,
    cost: { html: 40, css: 40, js: 40 },
    upkeep: 1.0,
    ability: '시너지 버프: 인접 유닛 ATK +20%',
  },
  debug_drone: {
    id: 'debug_drone',
    name: 'Debug 드론',
    tier: 2,
    role: 'dps',
    counterClass: 'special',
    hp: 40,
    atk: 0,
    speed: 2.0,
    cost: { js: 80 },
    upkeep: 0.8,
    ability: '즉사: 적 유닛 1기 제거 (쿨타임 60초)',
  },
  firewall: {
    id: 'firewall',
    name: 'Firewall',
    tier: 2,
    role: 'tank',
    counterClass: 'special',
    hp: 300,
    atk: 0,
    speed: 0,
    cost: { css: 100, html: 50 },
    upkeep: 1.2,
    ability: '고정 구조물: 범위 내 적 이동속도 -50%',
  },
}
