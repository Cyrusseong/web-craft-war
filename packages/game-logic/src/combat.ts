import {
  COUNTER_MATRIX,
  COUNTER_MULTIPLIERS,
  FLANK_BONUS,
  UNIT_DEFINITIONS,
  type CounterClass,
  type UnitTypeId,
} from '@web-craft-war/shared-types'

export interface CombatUnit {
  id: string
  typeId: UnitTypeId
  hp: number
  maxHp: number
  atk: number
  /** 첫 공격 여부 (JS 어쌔신 은신용) */
  firstStrike: boolean
}

export interface DamageResult {
  rawDamage: number
  counterMultiplier: number
  flankBonus: number
  finalDamage: number
}

/**
 * 데미지 계산: (공격력) × 상성배율 × (1 + 측면보너스)
 * 기획서 공식: 실제_데미지 = (공격력 + 보너스_데미지) × 상성_배율 - 방어력
 */
export function calculateDamage(
  attackerType: UnitTypeId,
  defenderType: UnitTypeId,
  attackerAtk: number,
  isFlanking: boolean = false,
  isFirstStrike: boolean = false,
): DamageResult {
  const attackerDef = UNIT_DEFINITIONS[attackerType]
  const defenderDef = UNIT_DEFINITIONS[defenderType]

  const attackerClass: CounterClass = attackerDef.counterClass
  const defenderClass: CounterClass = defenderDef.counterClass

  const counterKey = COUNTER_MATRIX[attackerClass][defenderClass]
  const counterMultiplier = COUNTER_MULTIPLIERS[counterKey]

  const flankBonus = isFlanking ? FLANK_BONUS : 0
  const firstStrikeMultiplier = isFirstStrike ? 2.0 : 1.0

  const rawDamage = attackerAtk * firstStrikeMultiplier
  const finalDamage = Math.max(1, Math.floor(rawDamage * counterMultiplier * (1 + flankBonus)))

  return {
    rawDamage,
    counterMultiplier,
    flankBonus,
    finalDamage,
  }
}

/**
 * 전투 1틱 처리: 공격자가 방어자에게 데미지 적용
 * 반환: 방어자의 남은 HP
 */
export function applyCombatTick(
  attacker: CombatUnit,
  defender: CombatUnit,
  isFlanking: boolean = false,
): number {
  const result = calculateDamage(
    attacker.typeId,
    defender.typeId,
    attacker.atk,
    isFlanking,
    attacker.firstStrike,
  )

  defender.hp = Math.max(0, defender.hp - result.finalDamage)

  // 첫 공격 소모
  if (attacker.firstStrike) {
    attacker.firstStrike = false
  }

  return defender.hp
}

/**
 * CombatUnit 생성 헬퍼
 */
export function createCombatUnit(id: string, typeId: UnitTypeId): CombatUnit {
  const def = UNIT_DEFINITIONS[typeId]
  return {
    id,
    typeId,
    hp: def.hp,
    maxHp: def.hp,
    atk: def.atk,
    firstStrike: typeId === 'js_assassin',
  }
}
