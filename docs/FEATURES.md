# 369stage — 기능 정의서

> 현재 구현(코드) 기준 상세 스펙입니다. 제품 방향성/로드맵은 [`PRD.md`](PRD.md)를 참고하세요.
> 관련 파일 경로를 함께 표기했으니, 동작을 바꿀 때 어디를 봐야 하는지 바로 찾을 수 있습니다.

## 1. 태스크(Task) 데이터 모델

`src/types/task.ts`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | `string` | |
| `title` | `string` | 제목 |
| `description` | `string` | 본문(여러 줄) |
| `startDate` / `dueDate` | `string (YYYY-MM-DD)` | 없으면 빈 문자열. 캘린더 뷰 표시에 사용 |
| `categoryId` | `QaCategoryId` | 생성 시 선택, **이후 변경 불가** |
| `directionNotes` | `Record<Stage, DirectionNoteItem[]>` | 단계(30/60/90)별 노트 목록 |
| `status` | `'active' \| 'done'` | `done`이 되면 전체 읽기 전용 |
| `currentStage` | `30 \| 60 \| 90` | 현재 위치한 단계 |
| `checklist` | `ChecklistItem[]` | 90% 최종 체크리스트 (30·60%에는 없음) |

카테고리(`QaCategoryId`) 10종: `common`(공통) 자동 포함 + `ui`(UX·UI) / `print`(인쇄물) / `video`(영상) / `photo`(이미지 편집) / `mockup`(공유용 시안) / `ppt`(발표 자료) / `web`(웹) / `sns`(SNS) / `dpp`(케어라벨/스티커). 원본 체크리스트 텍스트는 `docs/qa_practical.md`(JSON), 런타임 가공은 `src/data/qaStructured.ts`.

## 2. 30 / 60 / 90 단계 흐름

`src/lib/gates.ts`, `src/components/TaskDetail.tsx`, `src/components/StageStepper.tsx`

- 단계 라벨: 30 = "방향성 검증", 60 = "구조 검증", 90 = "디테일 검수"
- 30·60%: 디렉션 노트만 작성 (체크리스트 UI 없음). "다음 단계로" 버튼으로만 진행, 되돌리기 없음
- 90%: 해당 태스크 카테고리의 QA 체크리스트가 노출됨. 처음 90%에 도달할 때 `ensureCategoryChecklistAt90`으로 체크리스트를 채워 넣음(빈 상태로 도달했을 때만)
- **완료 게이트**: `isStageComplete()` — 체크리스트 항목이 1개 이상 있고 전부 `checked === true`일 때만 "작업 완료(100%)" 버튼 활성화
- 완료(`status: 'done'`) 후에는 체크리스트·메타 정보 모두 읽기 전용
- 스테퍼로 이전 단계 노트를 조회만 할 수 있음(수정은 `viewStage === currentStage`일 때만 가능)

## 3. 체크리스트 UI 모드

`checklistUiMode()` (`src/data/qaStructured.ts`), `TaskDetail.tsx`

- **structured**: 카테고리 템플릿에서 생성된 항목 — 섹션(sectionTitle)별로 그룹핑되어 표시, 텍스트 수정 불가(체크만 가능), `label` + `displayCode` 표시
- **legacy**: 사용자가 직접 텍스트를 입력해 추가한 항목 — 자유 텍스트 입력/삭제 가능, 섹션 구분 없음

## 4. 디렉션 노트

`src/components/DirectionNoteList.tsx`, `store/taskStore.ts`

- 단계(30/60/90)별로 여러 개의 노트 항목(`DirectionNoteItem`: id, text, createdAt, updatedAt)을 추가/수정/삭제
- 최종 체크리스트와는 별개 데이터 — 완료 여부에 영향 없음, 순수 기록용

## 5. 뷰 전환 (리스트 / 캘린더)

`src/App.tsx`, `src/components/CalendarView.tsx`, `CalendarGrid.tsx`, `CalendarHeader.tsx`, `UnscheduledPanel.tsx`, `CalendarErrorBoundary.tsx`

- **리스트 뷰**: `TaskSidebar`(작업 목록) + `TaskDetail`(선택된 작업 상세)
- **캘린더 뷰**: 월간 그리드에 `status: 'active'` 작업을 `startDate`/`dueDate` 기준으로 표시. 이전/다음 달, 오늘로 이동 가능
- 시작일·목표일이 모두 없는 작업은 `UnscheduledPanel`(미배정 패널)에 별도 노출
- 캘린더에서 특정 날짜를 클릭하면 해당 날짜를 시작일로 하는 새 작업 생성 모달이 열림 (`onNewTask(defaultStartDate)`)
- 캘린더에서 작업 클릭 시 `TaskDetailModal`로 상세를 모달로 확인
- 캘린더 렌더 오류는 `CalendarErrorBoundary`로 격리

## 6. 인증 / 로그인

`src/App.tsx`, `src/lib/firebase.ts`, `src/lib/api.ts`, `worker/src/index.ts`

- 원격 API가 설정되지 않은 빌드(`VITE_API_URL` 없음): 로그인 없이 바로 사용, 전부 `localStorage`
- 원격 API가 설정된 빌드: 앱 진입 시 세션 토큰(`localStorage`의 `369stage-session-token`)이 없으면 로그인 화면 노출
- **로그인 방식**: Google 계정 (Firebase Auth `signInWithGoogle()` → ID 토큰 획득) → Worker `POST /auth/google`에 ID 토큰 전달 → Worker가 Firebase JWKS로 토큰 검증 후 자체 서명 세션 토큰(HMAC-SHA256, 7일 만료) 발급
- 세션 토큰은 이후 모든 API 요청에 `Authorization: Bearer` 헤더로 첨부
- 401 응답을 받으면 세션 토큰을 지우고 재로그인 요구 (`AuthError`)
- **레거시 경로**: `POST /auth/session`(접근 코드 방식)도 Worker에 남아 있음 — 코드상 `uid: null` 세션으로 취급, DB에서 `user_id IS NULL`인(계정 이전 전) 작업에만 접근 가능. Google 로그인 최초 1회 시 `user_id IS NULL`인 기존 작업을 로그인한 계정으로 자동 이전(`UPDATE tasks SET user_id = ? WHERE user_id IS NULL`)

## 7. 원격 동기화

`src/store/remoteSync.ts`, `src/lib/api.ts`

- **초기 로드(hydrate)**: 로그인/앱 시작 시 서버에서 작업 목록을 가져와 로컬 상태를 덮어씀. 단, 서버가 비어 있고 로컬(persist)에는 작업이 있으면 로컬을 서버로 1회 업로드(로컬 유지, 빈 상태로 덮어쓰지 않기 위한 안전장치)
- **저장(save)**: 스토어 상태가 바뀔 때마다 650ms 디바운스 후 `PUT /tasks`로 전체 작업 목록을 저장. 실패 시 에러 메시지를 콜백으로 전달(화면 하단 배너)
- **폴링**: 기본 30초 간격으로 `GET /tasks` 재조회 + 탭이 다시 보일 때(`visibilitychange`) 즉시 1회 재조회 — 다른 기기에서 저장한 내용을 반영하기 위함
- 로그인 실패/세션 만료 시 로그인 화면으로 복귀, 원격 조회 실패(네트워크 등)는 배너로만 알리고 로컬 편집은 계속 가능

## 8. Worker API 스펙

`worker/src/index.ts`, DB: Cloudflare D1 (`worker/migrations/`)

| 엔드포인트 | 메서드 | 인증 | 설명 |
|---|---|---|---|
| `/auth/session` | POST | `{ accessCode }` | 레거시 접근 코드 로그인, 세션 토큰 발급 |
| `/auth/google` | POST | `{ idToken }` | Firebase ID 토큰 검증 후 세션 토큰 발급, 기존 소유자 없는 작업 이전 |
| `/tasks` | GET | Bearer 세션 토큰 | 로그인한 계정(`user_id`) 소유 작업 전체 조회 |
| `/tasks` | PUT | Bearer 세션 토큰 | `{ tasks: Task[] }` — 해당 계정 소유 작업 전체를 삭제 후 재삽입(upsert 아님, full replace) |

- CORS: `CORS_ORIGINS` 환경변수로 허용 origin 제한 가능(미설정 시 전체 허용)
- 세션 토큰: 커스텀 HMAC-SHA256 서명 JWT 유사 포맷 (`header.payload.signature`, base64url), 서버 시크릿 `SESSION_SIGNING_SECRET`
- `PUT /tasks`는 요청받은 배열 전체로 해당 사용자의 기존 행을 전부 교체함 — 부분 업데이트 API 없음

## 9. 로컬 저장(Persist)

`src/lib/debouncedPersistStorage.ts`, `src/store/taskStore.ts`, `src/store/migrateTask.ts`

- Zustand `persist` 미들웨어로 `localStorage`에 저장, 디바운스 저장소 어댑터 사용
- 구버전 데이터 구조를 최신 `Task` 타입으로 변환하는 `migrateTasks()` 존재 (서버에서 받은 원시 데이터에도 동일 적용)

## 10. 테마

`src/theme/ThemeProvider.tsx`, `useTheme.ts`, `ThemeToggle.tsx` — 라이트/다크 모드 토글 지원.
