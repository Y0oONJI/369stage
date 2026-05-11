# 369stage

30 / 60 / 90 단계로 작업을 나누고, 90% 단계의 체크리스트를 모두 통과한 뒤에만 완료로 넘어가는 셀프 컨펌용 태스크 앱입니다.

## 개요

작업을 생성할 때 카테고리(UX/UI, 인쇄물, 영상, 이미지 편집, PPT, 웹, SNS, DPP 등)를 선택하면 해당 실무 QA 체크리스트가 자동으로 생성됩니다. 30·60% 단계에서는 디렉션 노트를 기록하며 방향을 다듬고, 90% 단계에서 체크리스트를 전부 통과해야 작업 완료로 전환됩니다.

## 기술 스택

- React 19, TypeScript, Vite 8, Tailwind CSS v4, Zustand
- Cloudflare Workers (SPA 호스팅) + D1 (원격 저장, 선택)
- 원격 미설정 시 브라우저 `localStorage`에 저장

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
