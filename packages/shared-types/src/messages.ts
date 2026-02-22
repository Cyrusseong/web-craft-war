import type { UnitTypeId } from './units'

/**
 * 클라이언트 → 서버 메시지 타입
 */

/** 유닛 이동 명령 */
export interface MoveUnitsMessage {
  type: 'move_units'
  unitIds: string[]
  targetX: number
  targetY: number
}

/** 유닛 생산 명령 */
export interface ProduceUnitMessage {
  type: 'produce_unit'
  unitType: UnitTypeId
}

/** 공격 명령 */
export interface AttackMessage {
  type: 'attack'
  unitIds: string[]
  targetId: string
}

/** 점령 명령 */
export interface CaptureNodeMessage {
  type: 'capture_node'
  unitIds: string[]
  nodeId: string
}

/** 모든 클라이언트→서버 메시지 */
export type ClientMessage =
  | MoveUnitsMessage
  | ProduceUnitMessage
  | AttackMessage
  | CaptureNodeMessage

/**
 * 서버 → 클라이언트 메시지 타입
 */

/** 게임 페이즈 */
export type GamePhase = 'waiting' | 'playing' | 'finished'

/** 게임 결과 */
export interface GameResultMessage {
  type: 'game_result'
  winnerId: string
  loserId: string
  duration: number
  stats: {
    unitsProduced: number
    unitsLost: number
    resourcesGathered: number
    nodesCaptures: number
  }
}

/** 서버 이벤트: 유닛 사망 */
export interface UnitDeathEvent {
  type: 'unit_death'
  unitId: string
  killerUnitId?: string
  position: { x: number; y: number }
}

/** 서버 이벤트: 노드 점령 완료 */
export interface NodeCapturedEvent {
  type: 'node_captured'
  nodeId: string
  newOwner: string
}

/** 모든 서버→클라이언트 이벤트 */
export type ServerEvent =
  | GameResultMessage
  | UnitDeathEvent
  | NodeCapturedEvent
