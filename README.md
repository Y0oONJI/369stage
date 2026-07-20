# 369stage

30 / 60 / 90 단계로 작업을 나누고, 90% 단계의 체크리스트를 모두 통과한 뒤에만 완료로 넘어가는 셀프 컨펌용 태스크 앱입니다.

제품 방향성과 상세 기능 정의는 [`docs/PRD.md`](docs/PRD.md), [`docs/FEATURES.md`](docs/FEATURES.md)를 참고하세요.

## 개요

작업을 생성할 때 카테고리(UX/UI, 인쇄물, 영상, 이미지 편집, PPT, 웹, SNS, DPP 등)를 선택하면 해당 실무 QA 체크리스트가 자동으로 생성됩니다. 30·60% 단계에서는 디렉션 노트를 기록하며 방향을 다듬고, 90% 단계에서 체크리스트를 전부 통과해야 작업 완료로 전환됩니다.

- **뷰**: 리스트(사이드바 + 상세) / 캘린더(월간, 시작일·목표일 기준) 두 가지 뷰 전환
- **로그인**: Google 계정으로 로그인(Firebase Auth) 후 서버에 계정별로 작업이 저장·분리됩니다.
- **동기화**: 원격 API가 설정된 경우 여러 기기에서 같은 작업 목록을 봅니다 (저장 시 디바운스 반영, 주기적/탭 복귀 시 재조회).

## 기술 스택

- React 19, TypeScript, Vite 8, Tailwind CSS v4, Zustand(persist)
- Firebase Auth(Google 로그인) + Cloudflare Workers API(세션 토큰 발급/검증, `jose`로 Firebase ID 토큰 검증)
- Cloudflare Workers (SPA 호스팅) + D1 (원격 저장, 선택)
- 원격 미설정 시 브라우저 `localStorage`에만 저장 (로그인 불필요)

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포

```bash
npm run deploy
```

Cloudflare 계정 인증(`wrangler login`)이 먼저 필요합니다.
원격 동기화를 사용하려면 프로젝트 루트에 `.env.local`을 만들고 `VITE_API_URL`을 설정하세요 (`.env.example` 참고).

API 워커(인증·D1)를 함께 배포하는 전체 순서와 명령어는 [`docs/COMMANDS_CHEATSHEET.md`](docs/COMMANDS_CHEATSHEET.md)를 참고하세요.

## 문서

- [`docs/PRD.md`](docs/PRD.md) — 제품 방향성, 타겟, 로드맵
- [`docs/FEATURES.md`](docs/FEATURES.md) — 기능 정의서 (현재 구현 기준 상세 스펙)
- [`docs/qa_practical.md`](docs/qa_practical.md) — 카테고리별 QA 체크리스트 원본 데이터
- [`docs/upcoming.md`](docs/upcoming.md) — 진행 중 작업 백로그
- [`docs/COMMANDS_CHEATSHEET.md`](docs/COMMANDS_CHEATSHEET.md) — Git/배포 명령어 모음
