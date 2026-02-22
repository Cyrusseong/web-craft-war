import {
  BASE_PRODUCTION_RATES,
  CAPTURE_BONUS_MULTIPLIER,
  RESOURCE_CAP,
  UNIT_DEFINITIONS,
  type Resources,
  type ResourceType,
  type UnitTypeId,
} from '@web-craft-war/shared-types'

/**
 * 틱당 리소스 생산량 계산
 * 총 수입 = 기지_기본_수입 × (1 + 점령_페이지_수 × 0.5) × 업그레이드_배율
 */
export function calculateProduction(
  capturedPageCount: number,
  upgradeMultiplier: number = 1.0,
): Resources {
  const multiplier = (1 + capturedPageCount * CAPTURE_BONUS_MULTIPLIER) * upgradeMultiplier
  return {
    html: BASE_PRODUCTION_RATES.html * multiplier,
    css: BASE_PRODUCTION_RATES.css * multiplier,
    js: BASE_PRODUCTION_RATES.js * multiplier,
  }
}

/**
 * 리소스 생산 틱 적용 (dt: 초 단위)
 * 상한을 넘지 않도록 클램핑
 */
export function applyProductionTick(
  current: Resources,
  capturedPageCount: number,
  dt: number,
  upgradeMultiplier: number = 1.0,
): Resources {
  const rates = calculateProduction(capturedPageCount, upgradeMultiplier)
  return {
    html: Math.min(RESOURCE_CAP, current.html + rates.html * dt),
    css: Math.min(RESOURCE_CAP, current.css + rates.css * dt),
    js: Math.min(RESOURCE_CAP, current.js + rates.js * dt),
  }
}

/**
 * 유닛 유지 비용 차감 (dt: 초 단위)
 * 리소스가 0 이하로 내려가면 0으로 고정
 */
export function applyUpkeepTick(
  current: Resources,
  unitCounts: Partial<Record<UnitTypeId, number>>,
  dt: number,
): Resources {
  let totalUpkeep = 0
  for (const [typeId, count] of Object.entries(unitCounts)) {
    const def = UNIT_DEFINITIONS[typeId as UnitTypeId]
    totalUpkeep += def.upkeep * (count ?? 0)
  }

  // 유지 비용을 3대 리소스에서 균등 차감
  const perResource = (totalUpkeep * dt) / 3
  return {
    html: Math.max(0, current.html - perResource),
    css: Math.max(0, current.css - perResource),
    js: Math.max(0, current.js - perResource),
  }
}

/**
 * 유닛 생산 가능 여부 확인
 */
export function canAffordUnit(resources: Resources, unitType: UnitTypeId): boolean {
  const cost = UNIT_DEFINITIONS[unitType].cost
  if (cost.html && resources.html < cost.html) return false
  if (cost.css && resources.css < cost.css) return false
  if (cost.js && resources.js < cost.js) return false
  return true
}

/**
 * 유닛 생산: 리소스 차감 후 새 리소스 반환
 */
export function spendResources(resources: Resources, unitType: UnitTypeId): Resources {
  const cost = UNIT_DEFINITIONS[unitType].cost
  return {
    html: resources.html - (cost.html ?? 0),
    css: resources.css - (cost.css ?? 0),
    js: resources.js - (cost.js ?? 0),
  }
}
