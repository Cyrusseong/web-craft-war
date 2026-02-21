# 게임 디자인 핵심 이론 종합 레퍼런스

> 학술 논문 + 고급 연구 기반 이론 정리. 순수 레퍼런스.
> 프로젝트별 적용 아이디어는 → `game-design-ideas.md` 참고.

---

## 1. 플로우 이론 (Flow Theory)

### 핵심 개념
**Csikszentmihalyi (1975, 1990)** — 몰입(Flow)은 도전과 능력이 균형을 이룰 때 발생하는 최적 경험 상태.

- **도전 > 능력** → 불안/좌절 (Frustration)
- **도전 < 능력** → 지루함 (Boredom)  
- **도전 ≈ 능력** → 몰입 (Flow)

### 플로우의 9가지 요소
1. 명확한 목표 (Clear goals)
2. 즉각적 피드백 (Immediate feedback)
3. 도전-능력 균형 (Challenge-skill balance)
4. 행동과 인식의 통합 (Action-awareness merging)
5. 주의 집중 (Concentration)
6. 통제감 (Sense of control)
7. 자의식 상실 (Loss of self-consciousness)
8. 시간 왜곡 (Time distortion)
9. 자기목적적 경험 (Autotelic experience)

### 게임 적용
- **Jenova Chen, "Flow in Games" (MFA Thesis, USC, 2007)** — 플레이어마다 스킬이 다르므로, 게임은 난이도를 선택하거나 적응시켜야 함. flOw 게임으로 실증.
- **Sharek & Wiebe (2011)** — Flow Theory로 Boredom/Flow/Frustration 3조건 실험 설계. SAGE Journals.
- **Pichlmair & Johansen, "Designing Game Feel: A Survey" (arXiv, 2020)** — 플로우 + 게임 필 연결.

### 📚 핵심 출처
| 출처 | 링크 |
|------|------|
| Csikszentmihalyi, "Flow" (1990) | 도서 (Harper Perennial) |
| Chen, "Flow in Games" (2007) | https://www.jenovachen.com/flowingames/Flow_in_games_final.pdf |
| Sharek & Wiebe (2011) | https://journals.sagepub.com/doi/10.1177/1071181311551316 |
| "Designing for Flow in Video Games" (2024) | http://www.diva-portal.org/smash/get/diva2:1985453/FULLTEXT01.pdf |

---

## 2. 자기결정이론 (Self-Determination Theory, SDT)

### 핵심 개념
**Deci & Ryan (1985, 2000)** — 인간의 내재적 동기는 3가지 기본 심리 욕구 충족에서 발생:

| 욕구 | 설명 | 게임 적용 |
|------|------|-----------|
| **자율성 (Autonomy)** | 스스로 선택하는 느낌 | 의미 있는 선택지, 비선형 진행, 커스터마이징 |
| **유능감 (Competence)** | 능숙해지는 느낌 | 적절한 난이도 곡선, 성장 피드백, 스킬 마스터리 |
| **관계성 (Relatedness)** | 타인과 연결된 느낌 | 협동/경쟁, 길드, 소셜 기능, 리더보드 |

### 게임 적용
- **Ryan, Rigby & Przybylski, "The Motivational Pull of Video Games" (2006)** — 게임이 동기를 부여하는 핵심은 플레이 중 자율성·유능감·관계성 경험. Motivation & Emotion 저널.
- PENS (Player Experience of Need Satisfaction) 모델 → SDT 기반 게임 플레이어 경험 측정 도구

### 📚 핵심 출처
| 출처 | 링크 |
|------|------|
| Ryan & Deci, "SDT and Intrinsic Motivation" (2000) | https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf |
| Ryan, Rigby & Przybylski (2006) | https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf |

---

## 3. MDA 프레임워크 (Mechanics-Dynamics-Aesthetics)

### 핵심 개념
**Hunicke, LeBlanc & Zubek (2004)** — 게임을 3개 레이어로 분해:

```
디자이너 → [Mechanics] → [Dynamics] → [Aesthetics] ← 플레이어
```

- **Mechanics (메카닉)**: 규칙, 시스템, 알고리즘 (디자이너가 설계)
- **Dynamics (다이나믹)**: 메카닉이 플레이어 행동과 만나 생기는 런타임 행동
- **Aesthetics (미학)**: 플레이어가 느끼는 감정적 반응

### 8가지 미학 (8 Kinds of Fun)
1. **Sensation** — 감각적 쾌감
2. **Fantasy** — 판타지/몰입
3. **Narrative** — 이야기
4. **Challenge** — 도전/장애물
5. **Fellowship** — 사회적 교류
6. **Discovery** — 발견
7. **Expression** — 자기표현
8. **Submission** — 시간 때우기/여가

### 게임 적용
Block 2048 → Challenge + Submission 중심
Town Tycoon → Expression + Fellowship + Discovery 중심

### 📚 핵심 출처
| 출처 | 링크 |
|------|------|
| Hunicke et al., "MDA" (2004) | https://users.cs.northwestern.edu/~hunicke/MDA.pdf |

---

## 4. 동적 난이도 조절 (Dynamic Difficulty Adjustment, DDA)

### 핵심 개념
플레이어 퍼포먼스를 실시간 추적 → 난이도 자동 조정 → 플로우 유지

### 주요 접근법
| 방식 | 설명 | 예시 |
|------|------|------|
| **Performance-based** | 정확도, 점수, 클리어 시간 기반 | RE4의 적 체력/공격력 조절 |
| **Physiological** | 심박수, 피부전도 등 생체 신호 | 연구 단계 |
| **ML/RL-based** | 강화학습으로 최적 난이도 탐색 | 최신 연구 |

### 핵심 발견
- DDA는 enjoyment, flow, motivation, engagement, immersion 모두에 유의미한 효과 (Zohaib, 2018; Mortazavi et al., 2024)
- 하지만 플레이어가 DDA를 **인지하면** 부정적 반응 → 투명성 vs 은밀성 딜레마
- F2P에서 DDA + 개인화 → 리텐션과 수익화 동시 개선 (ScienceDirect, 2025)

### 📚 핵심 출처
| 출처 | 링크 |
|------|------|
| Mortazavi et al., "DDA: Systematic Review" (2024) | https://link.springer.com/article/10.1007/s11042-024-18768-x |
| "Rethinking DDA" (2024) | https://www.sciencedirect.com/science/article/abs/pii/S1875952124000314 |
| "Exploring DDA Methods" (MDPI, 2024) | https://www.mdpi.com/2813-2084/3/2/12 |
| Zohaib, "DDA in Computer Games: A Review" (2018) | https://www.semanticscholar.org/paper/1d36a291318adabb5ff10f4d5f576a828f2a2490 |
| "Personalized Game Design for Retention" (2025) | https://www.sciencedirect.com/science/article/abs/pii/S0167811625000060 |

---

## 5. 보상 심리학 (Reward Schedules & Operant Conditioning)

### 핵심 개념
**B.F. Skinner** — 강화 스케줄이 행동 지속성을 결정

| 스케줄 | 설명 | 게임 예시 | 중독성 |
|--------|------|-----------|--------|
| **고정 비율 (FR)** | N번 행동마다 보상 | 10킬 → 업적 | 중간 |
| **변동 비율 (VR)** | 랜덤 횟수마다 보상 | 가챠, 루트박스 | **최고** |
| **고정 간격 (FI)** | N시간마다 보상 | 일일 보상 | 낮음 |
| **변동 간격 (VI)** | 랜덤 시간마다 보상 | 랜덤 이벤트 | 높음 |

### 게임 적용
- **변동 비율(VR) 스케줄이 가장 강력** — 소거 저항(extinction resistance)이 가장 높음
- "한 판 더" 심리 = VR 스케줄 (다음 판에 좋은 블록/주사위가 나올 수 있다)
- **에스컬레이팅 보상 스케줄** — 초반 보상 풍성 → 점점 희귀 (레벨업 곡선)
- 윤리적 고려: 가챠/루트박스는 규제 대상화 추세 (벨기에, 네덜란드 금지)

### 📚 핵심 출처
| 출처 | 링크 |
|------|------|
| Skinner, "Schedules of Reinforcement" (1957) | 도서 (클래식) |
| ihobo, "Escalating Reward Schedules" | https://blog.ihobo.com/2011/01/the-grind-mystery-escalating-reward-schedules.html |
| UC Santa Barbara, "Reward Content in Games" | https://escholarship.org/content/qt6s20r83f/ |

---

## 6. 게임 필 & 주스 (Game Feel & Juice)

### 핵심 개념
**Steve Swink, "Game Feel" (2008)** — "시뮬레이션 공간에서 가상 객체의 실시간 제어, 폴리시로 강조된 인터랙션"

### 3가지 기둥
1. **실시간 제어 (Real-time Control)** — 입력 → 반응의 즉각성과 정밀성
2. **시뮬레이션 공간 (Simulated Space)** — 물리 법칙, 충돌, 중력
3. **폴리시 (Polish/Juice)** — 파티클, 화면 흔들림, 사운드, 슬로모션 등 피드백 효과

### Juice 요소 체크리스트
- [ ] 화면 흔들림 (Screen shake)
- [ ] 파티클 이펙트 (Particles)
- [ ] 스케일 애니메이션 (Squash & stretch)
- [ ] 히트스톱/프리즈 프레임
- [ ] 사운드 이펙트 (다양한 피치)
- [ ] 색상 플래시 (Color flash)
- [ ] 트레일 이펙트 (Motion trail)
- [ ] 숫자 팝업 (Damage numbers, score)
- [ ] 진동/햅틱 피드백

### 핵심 발견
- Juice는 **같은 메카닉을 완전히 다른 경험으로** 만듦
- "Juice it or Lose it" (GDC 2012) — 같은 Breakout 게임에 juice만 추가해도 재미가 극적으로 향상
- 퍼즐 게임에서도 juice 중요: 블록 합쳐질 때 이펙트, 콤보 시 연쇄 피드백

### 📚 핵심 출처
| 출처 | 링크 |
|------|------|
| Swink, "Game Feel" (2008) | 도서 (Morgan Kaufmann) |
| Pichlmair & Johansen, "Designing Game Feel: A Survey" (2020) | https://arxiv.org/pdf/2011.09201 |
| "What Features Influence Impact Feel?" (2022) | https://arxiv.org/pdf/2208.06155v3 |
| "Beyond Satisfaction: Game Feel Design" (FDG 2025) | https://dl.acm.org/doi/10.1145/3723498.3723808 |

---

## 7. 플레이어 유형 (Player Taxonomy)

### Bartle의 4유형 (1996)
| 유형 | 동기 | 게임 요소 |
|------|------|-----------|
| **Achiever (성취자)** | 목표 달성, 포인트, 레벨업 | 업적, 랭킹, 진행 시스템 |
| **Explorer (탐험가)** | 발견, 숨겨진 요소 | 비밀 스테이지, 이스터에그, 맵 탐색 |
| **Socializer (사교가)** | 타인과 교류 | 채팅, 협동, 선물, 방문 |
| **Killer (경쟁자)** | 타인에게 영향 | PvP, 랭킹, 약탈 |

### 확장 모델
- **Quantic Foundry (Nick Yee)** — 12가지 동기 차원으로 세분화 (Action, Social, Mastery, Achievement, Immersion, Creativity)
- 플레이어는 단일 유형이 아닌 **비율의 조합** (80% Explorer + 60% Socializer...)

### 📚 핵심 출처
| 출처 | 링크 |
|------|------|
| Bartle, "Hearts, Clubs, Diamonds, Spades" (1996) | https://mud.co.uk/richard/hcds.htm |
| Quantic Foundry | https://quanticfoundry.com/ |

---

## 8. 리텐션 & 재방문 설계 (Retention Design)

### 리텐션 프레임워크
```
D1 (첫날) → D7 (일주일) → D30 (한달) → D90+ (장기)
```

| 단계 | 목표 | 핵심 전략 |
|------|------|-----------|
| **D1 (30-50%)** | 첫인상, 튜토리얼 | FTUE 최적화, 즉각적 보상, 낮은 진입장벽 |
| **D7 (15-25%)** | 습관 형성 | 일일 보상, 소셜 후크, 목표 제시 |
| **D30 (8-15%)** | 깊은 몰입 | 메타게임, 길드/커뮤니티, 시즌 콘텐츠 |
| **D90+ (5%+)** | 장기 충성 | 엔드게임, UGC, 이벤트 순환, 정체성 부여 |

### 재방문(Replayability) 5대 요소
1. **절차적 생성 (Procedural Generation)** — 매번 다른 경험 (로그라이크)
2. **마스터리 곡선 (Mastery Curve)** — 클리어 ≠ 마스터, 더 높은 목표
3. **소셜 경쟁** — 리더보드, 친구 점수 비교
4. **수집 요소** — 완성하고 싶은 욕구 (도감, 업적)
5. **콘텐츠 업데이트** — 시즌, 이벤트, 새 레벨

### 핵심 발견
- 캐주얼 플레이어는 **시청각 요소**가 첫인상 좌우, 하드코어는 **콘텐츠 깊이**가 핵심 (Strååt & Verhagen, 2018)
- 절차적 재방문성은 "의미 있는 분산(meaningful variance)"이 있을 때만 효과 (PulseGeek, 2025)
- F2P 리텐션 핵심: 난이도 개인화 → 이탈 감소 + 수익화 증가 동시 달성 (ScienceDirect, 2025)

### 📚 핵심 출처
| 출처 | 링크 |
|------|------|
| Strååt & Verhagen, "Player Retention: Longitudinal Study" (2018) | https://dl.acm.org/doi/10.1145/3275116.3275140 |
| "Aspects of Replayability" (2012) | https://www.scirp.org/html/2-9301417_19725.htm |
| "Replayability in Educational Games" (2024) | https://onlinelibrary.wiley.com/doi/10.1155/2024/5876780 |
| "Design Influence on Player Retention" (HAL, 2020) | https://hal.science/hal-02436692/document |
| Google Play, "Understanding Games that Retain" (2022) | https://medium.com/googleplaydev/understanding-games-that-retain-1847b16c86a7 |

---

## 9. 게임 UI/UX 휴리스틱 (Game Usability)

### Nielsen의 10가지 휴리스틱 → 게임 적용
**Nielsen (1994)** 기반, **Desurvire et al. (2004)** + **Pinelle et al. (2008)** 게임 특화 확장:

| 원칙 | 게임 적용 |
|------|-----------|
| **시스템 상태 가시성** | HP, 스코어, 타이머 항상 표시 |
| **현실과 시스템 일치** | 아이콘/컬러가 직관적 의미 전달 |
| **사용자 제어와 자유** | 실행 취소, 일시정지, 재시작 가능 |
| **일관성과 표준** | 같은 색 = 같은 의미, 일관된 조작 |
| **오류 예방** | 실수 매수 확인, 위험한 행동 경고 |
| **인식 > 회상** | 중요 정보 화면에 표시 (암기 불요) |
| **유연성과 효율** | 숙련자 단축키, 초보자 가이드 공존 |
| **미학적 미니멀리즘** | 불필요한 UI 제거, 핵심만 표시 |
| **오류 복구 지원** | 명확한 에러 메시지, 리트라이 쉬움 |
| **도움말과 문서** | 인게임 튜토리얼, 컨텍스트 도움말 |

### PLAY 휴리스틱 (게임 전용)
**Desurvire & El-Nasr (2013)** — Game Playability 전용 휴리스틱:
- 게임 플레이, 쿨다운, 난이도 램프, 게임 스토리, 메카닉, 유용성 카테고리별 세분화
- 개발 초기에 전문가 평가로 빠르게 문제 발견 가능 (할인 평가법)

### 모바일 게임 UX 특수 고려
- **원핸드 조작**: 엄지 영역(thumb zone) 내 핵심 버튼
- **세션 길이**: 2-5분 단위 플레이 가능하게
- **온보딩**: 3탭 이내에 코어 루프 경험
- **시각 계층**: 가장 중요한 정보가 가장 눈에 띄게
- **터치 타겟**: 최소 44×44pt (Apple HIG)

### 📚 핵심 출처
| 출처 | 링크 |
|------|------|
| Nielsen, "10 Usability Heuristics" (1994, updated 2024) | https://www.nngroup.com/articles/ten-usability-heuristics/ |
| NN/g, "10 Heuristics Applied to Video Games" (2021) | https://www.nngroup.com/articles/usability-heuristics-applied-video-games/ |
| Pinelle et al., "Heuristic Evaluation for Games" (CHI 2008) | https://course.ccs.neu.edu/is4300f16/ssl/pinelle-chi08.pdf |
| Desurvire, "PLAY Heuristics" (2009) | ResearchGate |
| "UI Design in Game Development" (2023) | http://www.diva-portal.org/smash/get/diva2:1710174/FULLTEXT01.pdf |

---

## 10. 추가 이론 & 놓치기 쉬운 것들

### Cognitive Load Theory (인지 부하 이론)
- **Sweller (1988)** — 작업 기억 용량 제한. 한 번에 처리할 정보가 많으면 학습/재미 모두 저하
- 게임 적용: 새 메카닉은 **하나씩** 도입, UI는 점진적 공개 (progressive disclosure)

### Endowed Progress Effect (부여된 진행 효과)
- **Nunes & Dreze (2006)** — 빈 스탬프 카드보다 2개 찍힌 카드가 완성률 높음
- 게임 적용: 첫 레벨은 이미 "진행된 느낌" 주기 (스타터 보상, 첫 별 자동 획득)

### Loss Aversion (손실 회피)
- **Kahneman & Tversky (1979)** — 잃는 고통이 얻는 기쁨의 2배
- 게임 적용: 스트릭 시스템 (매일 접속 안 하면 보상 리셋), 에너지 시스템

### Zeigarnik Effect (자이가르닉 효과)
- 완료하지 못한 과제가 더 오래 기억됨
- 게임 적용: "다음 레벨까지 3개 남음" 표시, 미완성 컬렉션

### IKEA Effect
- **Norton et al. (2012)** — 직접 만든 것에 더 높은 가치 부여
- 게임 적용: 커스터마이징, 건설, 캐릭터 생성 → Town Tycoon의 건설 메카닉이 정확히 이것

### Paradox of Choice (선택의 역설)
- **Schwartz (2004)** — 선택지가 너무 많으면 오히려 만족도 하락
- 게임 적용: 한 번에 3개 블록/카드 제시 (Block 2048), 메뉴 단순화

---

## 📖 필수 도서 리스트

| 도서 | 저자 | 핵심 |
|------|------|------|
| **A Theory of Fun for Game Design** | Raph Koster (2004) | 재미 = 패턴 학습. 마스터하면 지루해짐 |
| **Game Feel** | Steve Swink (2008) | 조작감, 폴리시, juice의 모든 것 |
| **Flow** | Csikszentmihalyi (1990) | 몰입 이론의 원전 |
| **The Art of Game Design** | Jesse Schell (2008) | 100+ 렌즈로 게임 분석 |
| **Rules of Play** | Salen & Zimmerman (2003) | 게임 디자인 이론의 바이블 |
| **Hooked** | Nir Eyal (2014) | 습관 형성 모델 (Trigger→Action→Reward→Investment) |
| **Don't Make Me Think** | Steve Krug (2000) | UX/UI 직관성의 고전 |

---

*마지막 업데이트: 2026-02-11*
*출처: 학술 논문, GDC 강연, 도서 기반 종합*
