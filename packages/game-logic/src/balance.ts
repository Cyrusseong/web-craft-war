/**
 * 밸런스 상수 — 게임 밸런싱을 위한 중앙 설정
 * 서버와 클라이언트에서 공유
 */

/** 게임 틱 설정 */
export const TICK_RATE = 20          // TPS (ticks per second)
export const TICK_INTERVAL = 1000 / TICK_RATE  // ms per tick (50ms)

/** 라운드 설정 */
export const ROUND_DURATION_SEC = 900  // 15분
export const MAX_PLAYERS = 2           // 1v1

/** 리소스 인플레이션 */
export const INFLATION_COEFFICIENT = 0.001  // 라운드 경과 시간당 유닛 비용 증가율

/** 점령 설정 */
export const CAPTURE_SPEED_BASE = 10     // 유닛 1기당 초당 점령 진행도
export const CAPTURE_SPEED_DIMINISH = 0.7 // 추가 유닛당 효율 감소율

/** 전투 설정 */
export const ATTACK_RANGE_MELEE = 1.5   // 근접 공격 범위 (그리드 단위)
export const ATTACK_RANGE_RANGED = 4.0  // 원거리 공격 범위
export const ATTACK_COOLDOWN_BASE = 1.0 // 기본 공격 쿨다운 (초)

/** 유닛 생산 시간 (초) */
export const PRODUCTION_TIME: Record<number, number> = {
  1: 3,   // Tier 1: 3초
  2: 6,   // Tier 2: 6초
  3: 10,  // Tier 3: 10초
}

/** 유닛 수 제한 */
export const MAX_UNITS_PER_PLAYER = 30

/** DDA 설정 */
export const DDA_LOSING_REPAIR_DISCOUNT = 0.2  // 열세 시 수리 비용 -20%
export const DDA_STALEMATE_RESOURCE_BOOST = 0.1 // 무승부 시 중립 자원 +10%
