# 웹 크래프트 워 (Web Craft War) — 개발계획서

> **버전:** 1.0
> **최종 수정:** 2026-02-22
> **배포 플랫폼:** Vercel (프론트엔드) + Fly.io (게임 서버)

---

## 목차

1. [기술 스택](#1-기술-스택)
2. [프로젝트 구조 (Turborepo 모노레포)](#2-프로젝트-구조)
3. [인프라 아키텍처](#3-인프라-아키텍처)
4. [프론트엔드 설계](#4-프론트엔드-설계)
5. [게임 서버 설계](#5-게임-서버-설계)
6. [데이터베이스 & 캐시](#6-데이터베이스--캐시)
7. [인증 시스템](#7-인증-시스템)
8. [CI/CD 파이프라인](#8-cicd-파이프라인)
9. [환경변수 관리](#9-환경변수-관리)
10. [성능 최적화](#10-성능-최적화)
11. [개발 일정 (12주)](#11-개발-일정)
12. [비용 산정](#12-비용-산정)

---

## 1. 기술 스택

| 계층 | 기술 | 버전 | 선택 이유 |
|------|------|------|----------|
| **모노레포** | Turborepo | 2.4+ | Vercel 네이티브, 선택적 빌드, 캐시 |
| **프론트엔드** | Next.js + React + TypeScript | 15 / 19 / 5.7 | Vercel 최적화, RSC, App Router |
| **게임 렌더링** | PixiJS | v8 | 2D RTS 최적, 경량(~476KB), WebGL/WebGPU |
| **게임 서버** | Colyseus | 0.17+ | 델타 상태 동기화, 내장 매칭, 틱 루프 |
| **데이터베이스** | Supabase (PostgreSQL) | - | 유저 데이터, 랭킹, 시즌 기록 |
| **캐시/리더보드** | Vercel KV (Redis) | - | Sorted Set 리더보드, 세션 캐시 |
| **인증** | Supabase Auth + @supabase/ssr | - | PKCE 플로우, 소셜 + 익명 로그인 |
| **배포 (프론트)** | Vercel | Pro | 글로벌 CDN, Edge Functions |
| **배포 (서버)** | Fly.io | - | 멀티리전, 네이티브 WebSocket, 상시 구동 |
| **CI/CD** | GitHub Actions + Vercel Git Integration | - | 경로별 자동 배포 |

---

## 2. 프로젝트 구조

### Turborepo 모노레포 디렉토리

```
web-craft-war/
├── apps/
│   ├── web/                        # Next.js 프론트엔드 (→ Vercel)
│   │   ├── app/
│   │   │   ├── (auth)/             # 로그인/회원가입 페이지
│   │   │   ├── (lobby)/            # 로비, 매칭 대기
│   │   │   ├── game/               # 게임 플레이 페이지
│   │   │   ├── profile/            # 프로필, 전적
│   │   │   ├── leaderboard/        # 랭킹 보드
│   │   │   └── api/                # API Routes & Edge Functions
│   │   │       ├── leaderboard/    # 리더보드 API (Edge)
│   │   │       └── matchmaking/    # 매칭 큐 API (Edge)
│   │   ├── components/
│   │   │   ├── game/               # PixiJS 게임 캔버스 래퍼
│   │   │   ├── hud/                # 인게임 HUD 컴포넌트
│   │   │   ├── lobby/              # 로비 UI
│   │   │   └── ui/                 # 공통 UI (버튼, 모달)
│   │   ├── hooks/                  # 커스텀 훅
│   │   ├── lib/
│   │   │   ├── supabase/           # Supabase 클라이언트 (브라우저/서버)
│   │   │   ├── colyseus/           # Colyseus 클라이언트 연결
│   │   │   └── game/               # 게임 렌더링 로직
│   │   ├── public/
│   │   │   └── assets/             # 게임 에셋 (스프라이트, 사운드)
│   │   │       ├── units/
│   │   │       ├── terrain/
│   │   │       ├── fx/
│   │   │       └── audio/
│   │   ├── middleware.ts           # Supabase Auth 토큰 갱신
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── game-server/                # Colyseus 게임 서버 (→ Fly.io)
│       ├── src/
│       │   ├── rooms/
│       │   │   ├── GameRoom.ts     # 메인 게임 룸
│       │   │   ├── LobbyRoom.ts    # 로비/매칭 룸
│       │   │   └── handlers/       # 룸 이벤트 핸들러
│       │   ├── schemas/
│       │   │   ├── GameState.ts    # 게임 상태 스키마
│       │   │   ├── Player.ts       # 플레이어 스키마
│       │   │   ├── Unit.ts         # 유닛 스키마
│       │   │   └── MapNode.ts      # 맵 노드 스키마
│       │   ├── systems/
│       │   │   ├── CombatSystem.ts # 전투 로직
│       │   │   ├── EconomySystem.ts# 리소스 경제
│       │   │   └── CaptureSystem.ts# 점령 시스템
│       │   ├── auth/
│       │   │   └── supabase.ts     # Supabase JWT 검증
│       │   └── main.ts             # 서버 엔트리포인트
│       ├── Dockerfile
│       ├── fly.toml
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared-types/               # 클라이언트-서버 공유 타입
│   │   └── src/
│   │       ├── units.ts            # 유닛 타입, 스탯, 상성 정의
│   │       ├── resources.ts        # 리소스 타입
│   │       ├── map.ts              # 맵/노드 타입
│   │       ├── messages.ts         # 클라이언트-서버 메시지 타입
│   │       └── index.ts
│   │
│   ├── game-logic/                 # 순수 게임 로직 (I/O 없음, 결정론적)
│   │   └── src/
│   │       ├── combat.ts           # 데미지 계산, 상성 배율
│   │       ├── economy.ts          # 리소스 생산/소비 공식
│   │       ├── pathfinding.ts      # A* 패스파인딩
│   │       ├── balance.ts          # 유닛 스탯, 비용 상수
│   │       └── index.ts
│   │
│   └── tsconfig/                   # 공유 TypeScript 설정
│       ├── base.json
│       ├── nextjs.json
│       └── node.json
│
├── turbo.json
├── package.json                    # 루트 (workspaces 정의)
├── .env.example
├── .gitignore
└── .github/
    └── workflows/
        ├── ci-frontend.yml
        └── deploy-game-server.yml
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 핵심 설계 원칙

1. **shared-types**: 유닛, 리소스, 메시지 타입을 한 곳에서 정의 → 클라이언트/서버 타입 불일치 방지
2. **game-logic**: 순수 함수로 구현 → 서버에서 권위적 계산, 클라이언트에서 예측 계산에 동일 코드 사용
3. **의존성 방향**: packages → 외부 라이브러리만 의존. apps → packages 의존. packages 간 순환 의존 금지

---

## 3. 인프라 아키텍처

```
                          ┌─────────────┐
                          │   GitHub     │
                          │  Repository  │
                          └──────┬──────┘
                     push to main │
              ┌──────────────────┼──────────────────┐
              │                  │                   │
              ▼                  ▼                   ▼
   ┌──────────────────┐  ┌────────────┐  ┌──────────────────┐
   │  Vercel           │  │  Vercel    │  │  GitHub Actions   │
   │  Git Integration  │  │  (auto)    │  │  (game-server)    │
   │  → 프론트엔드 배포  │  │           │  │  → Fly.io 배포     │
   └────────┬─────────┘  └────────────┘  └────────┬─────────┘
            │                                      │
            ▼                                      ▼
┌───────────────────────┐          ┌───────────────────────────┐
│   Vercel Edge Network  │          │   Fly.io (IAD 리전)        │
│                        │          │                           │
│  Next.js 15 (App Router)│◄═══════►│  Colyseus 게임 서버        │
│  ├── RSC (로비, 프로필)  │ WebSocket│  ├── GameRoom (1v1)       │
│  ├── CSR (게임 캔버스)   │          │  ├── State Sync (20 TPS)  │
│  └── Edge Functions    │          │  └── 매칭 로직             │
│      (리더보드, 매칭 큐) │          └─────────┬─────────────────┘
└───────────┬────────────┘                     │
            │                                  │
     ┌──────┼──────┐                           │
     ▼             ▼                           │
┌──────────┐  ┌──────────┐                     │
│ Vercel KV │  │ Supabase │◄════════════════════┘
│ (Redis)   │  │(Postgres)│  JWT 검증 + 결과 저장
│           │  │          │
│ - 리더보드 │  │ - 유저   │
│ - 세션캐시 │  │ - 전적   │
│ - 매칭큐   │  │ - 시즌   │
└──────────┘  └──────────┘
```

### Vercel의 역할 (프론트엔드 전용)

| 기능 | 구현 방식 |
|------|----------|
| 게임 페이지 | CSR (PixiJS는 브라우저 API 필요) |
| 로비/프로필/랭킹 | RSC (Server Components, JS 0바이트) |
| 리더보드 API | Edge Function (Vercel KV 읽기) |
| 매칭 큐 진입 | Edge Function (Redis 큐 쓰기) |
| 정적 에셋 | CDN (public/ 디렉토리) |

### Fly.io의 역할 (게임 서버 전용)

| 기능 | 구현 방식 |
|------|----------|
| 실시간 게임 로직 | Colyseus Room + Tick Loop (20 TPS) |
| 상태 동기화 | 델타 패치 (WebSocket) |
| 매칭 실행 | 큐에서 소비 → Room 생성 |
| JWT 검증 | onAuth에서 Supabase 토큰 확인 |
| 결과 저장 | 게임 종료 시 Supabase에 기록 |

---

## 4. 프론트엔드 설계

### 4.1 페이지 구조

| 경로 | 렌더링 | 설명 |
|------|--------|------|
| `/` | RSC | 랜딩 페이지 (게임 소개, CTA) |
| `/login` | RSC | 로그인/회원가입 |
| `/lobby` | RSC + CSR | 매칭 대기, 유저 목록, 채팅 |
| `/game` | CSR (dynamic import) | 게임 플레이 (PixiJS 캔버스) |
| `/profile/[id]` | RSC | 전적, 통계 |
| `/leaderboard` | RSC | 랭킹 보드 |
| `/settings` | RSC | 계정 설정, 키바인드 |

### 4.2 게임 캔버스 로딩

```typescript
// app/game/page.tsx — Server Component (JS 0바이트)
import dynamic from 'next/dynamic'

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,  // PixiJS는 브라우저 API 필요
  loading: () => <GameLoadingSkeleton />,
})

export default function GamePage() {
  return (
    <main className="h-screen w-screen">
      <GameCanvas />
    </main>
  )
}
```

### 4.3 PixiJS 에셋 로딩 전략

```typescript
// lib/game/assets.ts
import { Assets } from 'pixi.js'

const manifest = {
  bundles: [
    {
      name: 'lobby',
      assets: [
        { alias: 'bg', src: '/assets/lobby/bg.webp' },
      ],
    },
    {
      name: 'terrain',
      assets: [
        { alias: 'tileset', src: '/assets/terrain/tileset.webp' },
        { alias: 'tileset-data', src: '/assets/terrain/tileset.json' },
      ],
    },
    {
      name: 'units',
      assets: [
        { alias: 'html-soldier', src: '/assets/units/html-soldier.json' },
        { alias: 'css-guardian', src: '/assets/units/css-guardian.json' },
        { alias: 'js-striker', src: '/assets/units/js-striker.json' },
      ],
    },
    {
      name: 'effects',
      assets: [
        { alias: 'particles', src: '/assets/fx/particles.json' },
        { alias: 'explosions', src: '/assets/fx/explosions.json' },
      ],
    },
  ],
}

export async function initAssets() {
  await Assets.init({ manifest })
  // 로비에서 즉시 로드
  await Assets.loadBundle('lobby')
  // 게임 에셋은 백그라운드 로드 (로비 대기 중)
  Assets.backgroundLoadBundle(['terrain', 'units', 'effects'])
}
```

### 4.4 Colyseus 클라이언트 연결

```typescript
// lib/colyseus/client.ts
import { Client } from 'colyseus.js'

const GAME_SERVER_URL = process.env.NEXT_PUBLIC_GAME_SERVER_URL!

let client: Client | null = null

export function getColyseusClient() {
  if (!client) {
    client = new Client(GAME_SERVER_URL)
  }
  return client
}

export async function joinGame(accessToken: string) {
  const client = getColyseusClient()
  const room = await client.joinOrCreate('game_room', { accessToken })
  return room
}
```

---

## 5. 게임 서버 설계

### 5.1 Colyseus Room 구조

```typescript
// apps/game-server/src/rooms/GameRoom.ts
import { Room, Client } from 'colyseus'
import { GameState } from '../schemas/GameState'
import { CombatSystem } from '../systems/CombatSystem'
import { EconomySystem } from '../systems/EconomySystem'
import { CaptureSystem } from '../systems/CaptureSystem'

export class GameRoom extends Room<GameState> {
  private combatSystem!: CombatSystem
  private economySystem!: EconomySystem
  private captureSystem!: CaptureSystem

  maxClients = 2  // 1v1

  onCreate(options: any) {
    this.setState(new GameState())
    this.setSimulationInterval((dt) => this.update(dt), 50) // 20 TPS

    this.combatSystem = new CombatSystem(this.state)
    this.economySystem = new EconomySystem(this.state)
    this.captureSystem = new CaptureSystem(this.state)

    // 클라이언트 메시지 핸들러
    this.onMessage('move_units', (client, data) => { /* ... */ })
    this.onMessage('produce_unit', (client, data) => { /* ... */ })
    this.onMessage('attack', (client, data) => { /* ... */ })
  }

  async onAuth(client: Client, options: { accessToken: string }) {
    // Supabase JWT 검증
    const user = await verifySupabaseToken(options.accessToken)
    if (!user) throw new Error('Unauthorized')
    return user
  }

  onJoin(client: Client, options: any, auth: any) {
    this.state.addPlayer(client.sessionId, auth.id)
  }

  update(dt: number) {
    this.economySystem.tick(dt)   // 리소스 생산/소비
    this.combatSystem.tick(dt)    // 전투 판정
    this.captureSystem.tick(dt)   // 점령 진행
    this.checkWinCondition()
  }
}
```

### 5.2 상태 스키마

```typescript
// apps/game-server/src/schemas/GameState.ts
import { Schema, MapSchema, type } from '@colyseus/schema'
import { Player } from './Player'
import { MapNode } from './MapNode'

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>()
  @type({ map: MapNode }) mapNodes = new MapSchema<MapNode>()
  @type('number') roundTime = 900  // 15분 = 900초
  @type('string') phase = 'waiting' // waiting | playing | finished
}
```

### 5.3 Fly.io 배포 설정

```toml
# apps/game-server/fly.toml
app = "web-craft-war-server"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 2567
  force_https = true
  auto_stop_machines = false   # 게임 서버 항상 구동
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 2
  memory_mb = 2048
```

```dockerfile
# apps/game-server/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 2567
CMD ["node", "dist/main.js"]
```

---

## 6. 데이터베이스 & 캐시

### 6.1 Supabase (PostgreSQL) — 영구 데이터

#### 테이블 구조

```sql
-- 유저 프로필 (Supabase Auth와 연동)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  elo_rating INTEGER DEFAULT 1000,
  rank_tier TEXT DEFAULT 'Bronze',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 매치 기록
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES profiles(id),
  player2_id UUID REFERENCES profiles(id),
  winner_id UUID REFERENCES profiles(id),
  player1_elo_change INTEGER,
  player2_elo_change INTEGER,
  duration_seconds INTEGER,
  season_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 시즌
CREATE TABLE seasons (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT FALSE
);

-- 시즌 랭킹
CREATE TABLE season_rankings (
  id SERIAL PRIMARY KEY,
  season_id INTEGER REFERENCES seasons(id),
  player_id UUID REFERENCES profiles(id),
  elo_rating INTEGER,
  rank_position INTEGER,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  UNIQUE(season_id, player_id)
);

-- 유닛 스킨/칭호 보유
CREATE TABLE player_inventory (
  id SERIAL PRIMARY KEY,
  player_id UUID REFERENCES profiles(id),
  item_type TEXT NOT NULL,  -- 'skin', 'title', 'emote'
  item_id TEXT NOT NULL,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, item_type, item_id)
);
```

### 6.2 Vercel KV (Redis) — 실시간 데이터

| 용도 | Redis 자료구조 | 키 패턴 |
|------|--------------|---------|
| **글로벌 리더보드** | Sorted Set | `leaderboard:global` |
| **시즌 리더보드** | Sorted Set | `leaderboard:season:{id}` |
| **매칭 큐** | Sorted Set (Elo 기반) | `matchmaking:queue` |
| **세션 캐시** | String (JSON) | `session:{sessionId}` |
| **온라인 유저** | Set | `online:users` |
| **일일 보상 상태** | String | `daily:{userId}:{date}` |

#### 리더보드 Edge Function

```typescript
// app/api/leaderboard/route.ts
export const runtime = 'edge'

import { kv } from '@vercel/kv'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)

  const leaders = await kv.zrevrange('leaderboard:global', 0, limit - 1, {
    withScores: true,
  })

  return Response.json({ leaders })
}
```

---

## 7. 인증 시스템

### 7.1 Supabase Auth 플로우

```
[브라우저] ─── 로그인 ───→ [Supabase Auth]
    │                         │
    │◄── JWT (쿠키) ──────────┘
    │
    │── JWT ──→ [Vercel Edge] ── 검증 → API 응답
    │
    │── JWT ──→ [Colyseus 서버] ── onAuth 검증 → Room 참가
```

### 7.2 지원 로그인 방식

| 방식 | 우선순위 | 비고 |
|------|---------|------|
| **익명 로그인** | MVP 필수 | 닉네임만 입력, 즉시 플레이 |
| **Google OAuth** | MVP 필수 | 원클릭 소셜 로그인 |
| **GitHub OAuth** | Phase 3 | 개발자 타겟에 적합 |
| **Discord OAuth** | Phase 3 | 게이머 커뮤니티 |

### 7.3 미들웨어 (토큰 갱신)

```typescript
// apps/web/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 만료된 토큰 자동 갱신
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/lobby/:path*', '/game/:path*', '/profile/:path*'],
}
```

---

## 8. CI/CD 파이프라인

### 8.1 프론트엔드 — Vercel Git Integration (자동)

Vercel의 GitHub 연동으로 자동 배포. 별도 워크플로우 불필요.

- `main` 브랜치 push → Production 배포
- PR 생성 → Preview 배포 (고유 URL)

테스트 CI만 별도 워크플로우로 실행:

```yaml
# .github/workflows/ci-frontend.yml
name: Frontend CI
on:
  pull_request:
    paths:
      - 'apps/web/**'
      - 'packages/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx turbo run lint test --filter=web...
```

### 8.2 게임 서버 — GitHub Actions → Fly.io

```yaml
# .github/workflows/deploy-game-server.yml
name: Deploy Game Server
on:
  push:
    branches: [main]
    paths:
      - 'apps/game-server/**'
      - 'packages/shared-types/**'
      - 'packages/game-logic/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx turbo run lint test --filter=game-server...

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only --config apps/game-server/fly.toml
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### 8.3 배포 흐름 요약

```
PR 생성 → CI 테스트 (lint + test)
  │
  ├── apps/web 변경 → Vercel Preview 자동 배포
  └── apps/game-server 변경 → 테스트만 (배포 안 함)

main 머지 →
  ├── apps/web 변경 → Vercel Production 자동 배포
  └── apps/game-server 변경 → GitHub Actions → Fly.io 배포
```

---

## 9. 환경변수 관리

### 9.1 환경변수 매트릭스

| 변수 | Vercel | Fly.io | GitHub Actions |
|------|--------|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | 자동 (Marketplace) | 수동 설정 | - |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 자동 | - | - |
| `SUPABASE_SERVICE_ROLE_KEY` | 자동 (서버 전용) | 수동 설정 | Secrets |
| `NEXT_PUBLIC_GAME_SERVER_URL` | 수동 설정 | - | - |
| `KV_REST_API_URL` | 자동 | - | - |
| `KV_REST_API_TOKEN` | 자동 | - | - |
| `PORT` | - | 2567 | - |
| `VERCEL_TOKEN` | - | - | Secrets |
| `FLY_API_TOKEN` | - | - | Secrets |

### 9.2 로컬 개발용

```bash
# .env.local (gitignored)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...local
SUPABASE_SERVICE_ROLE_KEY=eyJ...local-service
NEXT_PUBLIC_GAME_SERVER_URL=ws://localhost:2567
KV_REST_API_URL=http://localhost:6379
KV_REST_API_TOKEN=local-token
```

### 9.3 .env.example (커밋용)

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GAME_SERVER_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

---

## 10. 성능 최적화

### 10.1 PixiJS 번들 최적화

```typescript
// next.config.ts
const nextConfig = {
  webpack: (config: any) => {
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks?.cacheGroups,
        pixijs: {
          test: /[\\/]node_modules[\\/]pixi\.js[\\/]/,
          name: 'pixijs',
          chunks: 'all',
          priority: 30,
        },
      },
    }
    return config
  },
}
```

### 10.2 렌더링 최적화

| 기법 | 적용 |
|------|------|
| **오브젝트 풀링** | 유닛, 탄환, 파티클 재사용 (GC 방지) |
| **뷰포트 컬링** | 카메라 밖 스프라이트 렌더링 스킵 |
| **ParticleContainer** | 대량 유닛 렌더링 최적화 |
| **RenderTexture** | 정적 지형 단일 텍스처로 프리렌더 |
| **requestAnimationFrame** | setInterval 대신 RAF 기반 루프 |
| **에셋 포맷** | .webp (PNG 대비 30~50% 절감) |
| **스프라이트시트** | 개별 이미지 대신 아틀라스 → HTTP 요청 감소 |

### 10.3 네트워크 최적화

| 기법 | 적용 |
|------|------|
| **델타 패치** | Colyseus 내장 — 변경분만 전송 |
| **클라이언트 보간** | 서버 틱(50ms) 사이 스프라이트 위치 보간 |
| **입력 버퍼링** | 클라이언트 입력을 모아서 틱 단위 전송 |
| **상태 압축** | 불필요 필드 전송 제외 (@filter 데코레이터) |

### 10.4 번들 분석

```bash
# 번들 크기 분석
ANALYZE=true npm run build --filter=web
```

```typescript
// next.config.ts (분석 모드)
import withBundleAnalyzer from '@next/bundle-analyzer'

export default process.env.ANALYZE === 'true'
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig
```

---

## 11. 개발 일정

### Phase 1: 프로젝트 셋업 & 핵심 메카닉 (1~4주)

| 주차 | 프론트엔드 (Vercel) | 게임 서버 (Fly.io) | 공유 패키지 |
|------|-------------------|-------------------|-----------|
| **1주** | Turborepo 초기화, Next.js 셋업, PixiJS 캔버스 통합 | Colyseus 서버 초기화, 기본 Room | shared-types, game-logic 패키지 구조 |
| **2주** | 맵 렌더링, 유닛 스프라이트, 리소스 HUD | 리소스 시스템 (3종 생산/저장), 유닛 3종 스키마 | 유닛 스탯, 리소스 상수 정의 |
| **3주** | 유닛 선택/이동 UI, 전투 이펙트 **(핵심 Juice 4종)** | 유닛 이동/전투 로직, 상성 계산, AI 봇 | 데미지 공식, A* 패스파인딩 |
| **4주** | 점령 게이지 UI, 승리/패배 화면 | 점령 시스템, 승리 조건, 싱글 플레이어 완성 | 맵 노드 타입 |

### Phase 2: 멀티플레이어 & 배포 (5~7주)

| 주차 | 프론트엔드 | 게임 서버 | 인프라 |
|------|----------|----------|--------|
| **5주** | Colyseus 클라이언트 연동, 상태 동기화 렌더링 | 1v1 실시간 대전, 상태 동기화 | - |
| **6주** | 로비 UI, 매칭 대기, 인게임 채팅 | 매칭 로직 (Elo), 로비 Room | Supabase 셋업, 스키마 |
| **7주** | Vercel 배포, 도메인 설정 | Fly.io 배포, TLS 설정 | CI/CD 파이프라인, 통합 테스트 |

### Phase 3: 리텐션 & 폴리시 (8~10주)

| 주차 | 프론트엔드 | 게임 서버 | 기타 |
|------|----------|----------|------|
| **8주** | 계정 시스템 (Supabase Auth), 프로필, 랭킹 보드 | Elo 레이팅 업데이트, 결과 저장 | Vercel KV 리더보드 |
| **9주** | Tier 2 유닛 UI, 고급 Juice (히트스톱, 트레일) | Tier 2 유닛 로직, 밸런스 조정 | - |
| **10주** | 튜토리얼 FTUE, 모바일 반응형 + 터치 인터랙션 | 일일 보상 로직, 시즌 시스템 | 시즌 패스 UI |

### Phase 4: 런칭 (11~12주)

| 주차 | 작업 |
|------|------|
| **11주** | 클로즈드 베타, PLAY 휴리스틱 평가, 밸런스 패치, 버그 픽스 |
| **12주** | 오픈 베타 런칭, 바이럴 기능 (리플레이 공유), 시즌 1 시작 |

### 마일스톤

| 마일스톤 | 시점 | 기준 |
|---------|------|------|
| **M1: 플레이 가능** | 4주차 | 싱글 플레이어로 전체 코어 루프 1회 완주 가능 |
| **M2: 온라인 대전** | 7주차 | 2명이 브라우저에서 실시간 1v1 가능 |
| **M3: 프로덕션 준비** | 10주차 | 계정, 랭킹, 시즌, 모바일 대응 완료 |
| **M4: 런칭** | 12주차 | 오픈 베타 시작 |

---

## 12. 비용 산정

### 12.1 개발 단계 (0~12주)

| 서비스 | 플랜 | 월 비용 |
|--------|------|---------|
| **Vercel** | Hobby (무료) → Pro ($20) | $0~$20 |
| **Fly.io** | shared-cpu-2x, 2GB | ~$12 |
| **Supabase** | Free → Pro ($25) | $0~$25 |
| **Vercel KV** | Pro 포함 | $0 |
| **GitHub Actions** | Free tier | $0 |
| **도메인** | .dev 도메인 | ~$12/년 |
| **합계** | | **~$12~$57/월** |

### 12.2 런칭 후 (100~1000 CCU 기준)

| 서비스 | 플랜 | 월 비용 |
|--------|------|---------|
| **Vercel** | Pro | $20 |
| **Fly.io** | shared-cpu-2x × 2 리전 | ~$24 |
| **Supabase** | Pro | $25 |
| **Vercel KV** | Pro 포함 + 추가 요청 | ~$5 |
| **합계** | | **~$74/월** |

### 12.3 스케일업 시 (1000+ CCU)

| 서비스 | 플랜 | 월 비용 |
|--------|------|---------|
| **Vercel** | Pro | $20 |
| **Fly.io** | performance-2x × 3 리전 | ~$186 |
| **Supabase** | Pro + 추가 컴퓨팅 | ~$50 |
| **Vercel KV** | 추가 요청 | ~$15 |
| **합계** | | **~$271/월** |

---

## 부록: 로컬 개발 환경 셋업

```bash
# 1. 레포 클론 & 의존성 설치
git clone https://github.com/Cyrusseong/web-craft-war.git
cd web-craft-war
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 편집: Supabase 로컬 URL, 게임 서버 localhost 등

# 3. Supabase 로컬 실행 (Docker 필요)
npx supabase start

# 4. 개발 서버 동시 실행 (Turborepo)
npm run dev
# → Next.js: http://localhost:3000
# → Colyseus: ws://localhost:2567
```
