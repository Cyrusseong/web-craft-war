/** 맵 노드(웹 페이지) 등급 */
export type PageGrade = 'html' | 'css' | 'js' | 'fullstack'

/** 노드 소유 상태 */
export type NodeOwner = 'neutral' | 'player1' | 'player2'

/** 맵 노드 정의 */
export interface MapNodeDef {
  id: string
  grade: PageGrade
  /** 그리드 좌표 */
  x: number
  y: number
  owner: NodeOwner
  /** 점령 진행도 (0~100) */
  captureProgress: number
  /** 점령 중인 플레이어 */
  capturedBy: NodeOwner
}

/** 페이지 등급별 속성 */
export const PAGE_GRADE_STATS: Record<PageGrade, {
  resourceBonus: number
  defense: number
  captureTime: number
  label: string
}> = {
  html: {
    resourceBonus: 0.3,
    defense: 10,
    captureTime: 10,
    label: '정적 페이지 (.html)',
  },
  css: {
    resourceBonus: 0.2,
    defense: 20,
    captureTime: 15,
    label: '스타일 페이지 (.css)',
  },
  js: {
    resourceBonus: 0.4,
    defense: 30,
    captureTime: 20,
    label: '동적 페이지 (.js)',
  },
  fullstack: {
    resourceBonus: 0.6,
    defense: 50,
    captureTime: 30,
    label: '풀스택 페이지 (BOSS)',
  },
}

/** 맵 설정 */
export interface MapConfig {
  /** 그리드 너비 */
  width: number
  /** 그리드 높이 */
  height: number
  nodes: MapNodeDef[]
}

/** 라운드 제한 시간 (초) */
export const ROUND_DURATION = 900 // 15분
