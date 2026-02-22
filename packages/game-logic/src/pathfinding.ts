/**
 * A* 패스파인딩 — 그리드 기반
 * 서버(권위적)와 클라이언트(예측) 모두에서 동일 코드 사용
 */

export interface GridNode {
  x: number
  y: number
  walkable: boolean
}

export interface PathResult {
  path: Array<{ x: number; y: number }>
  cost: number
}

interface AStarNode {
  x: number
  y: number
  g: number
  h: number
  f: number
  parent: AStarNode | null
}

function heuristic(ax: number, ay: number, bx: number, by: number): number {
  // 맨해튼 거리
  return Math.abs(ax - bx) + Math.abs(ay - by)
}

const DIRECTIONS = [
  { dx: 0, dy: -1 }, // 상
  { dx: 1, dy: 0 },  // 우
  { dx: 0, dy: 1 },  // 하
  { dx: -1, dy: 0 }, // 좌
  { dx: 1, dy: -1 }, // 우상
  { dx: 1, dy: 1 },  // 우하
  { dx: -1, dy: 1 }, // 좌하
  { dx: -1, dy: -1 },// 좌상
]

/**
 * A* 패스파인딩 실행
 * @param grid 2D 그리드 (true = 이동 가능)
 * @param startX 시작 X
 * @param startY 시작 Y
 * @param endX 목표 X
 * @param endY 목표 Y
 * @returns 경로와 비용, 또는 경로 없음 시 null
 */
export function findPath(
  grid: boolean[][],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): PathResult | null {
  const height = grid.length
  if (height === 0) return null
  const width = grid[0].length

  if (
    startX < 0 || startX >= width ||
    startY < 0 || startY >= height ||
    endX < 0 || endX >= width ||
    endY < 0 || endY >= height
  ) {
    return null
  }

  if (!grid[startY][startX] || !grid[endY][endX]) {
    return null
  }

  const openSet: AStarNode[] = []
  const closedSet = new Set<string>()

  const key = (x: number, y: number) => `${x},${y}`

  const startNode: AStarNode = {
    x: startX,
    y: startY,
    g: 0,
    h: heuristic(startX, startY, endX, endY),
    f: heuristic(startX, startY, endX, endY),
    parent: null,
  }

  openSet.push(startNode)

  while (openSet.length > 0) {
    // 가장 작은 f 값 노드 추출
    let lowestIdx = 0
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIdx].f) {
        lowestIdx = i
      }
    }
    const current = openSet.splice(lowestIdx, 1)[0]

    if (current.x === endX && current.y === endY) {
      // 경로 재구성
      const path: Array<{ x: number; y: number }> = []
      let node: AStarNode | null = current
      while (node) {
        path.unshift({ x: node.x, y: node.y })
        node = node.parent
      }
      return { path, cost: current.g }
    }

    closedSet.add(key(current.x, current.y))

    for (const dir of DIRECTIONS) {
      const nx = current.x + dir.dx
      const ny = current.y + dir.dy

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
      if (!grid[ny][nx]) continue
      if (closedSet.has(key(nx, ny))) continue

      // 대각선 이동 시 양쪽 셀이 열려있어야 함
      if (dir.dx !== 0 && dir.dy !== 0) {
        if (!grid[current.y + dir.dy][current.x] || !grid[current.y][current.x + dir.dx]) {
          continue
        }
      }

      const moveCost = (dir.dx !== 0 && dir.dy !== 0) ? 1.414 : 1
      const g = current.g + moveCost
      const h = heuristic(nx, ny, endX, endY)
      const f = g + h

      const existingIdx = openSet.findIndex(n => n.x === nx && n.y === ny)
      if (existingIdx !== -1) {
        if (g < openSet[existingIdx].g) {
          openSet[existingIdx].g = g
          openSet[existingIdx].f = f
          openSet[existingIdx].parent = current
        }
        continue
      }

      openSet.push({ x: nx, y: ny, g, h, f, parent: current })
    }
  }

  return null // 경로 없음
}
