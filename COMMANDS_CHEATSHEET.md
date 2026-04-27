# 369stage Command Cheat Sheet

Use this file as a quick reference for common Git + deploy commands.  
자주 쓰는 명령어를 빠르게 찾아보는 용도입니다.

## 1) Create a new branch

한국어: 새 작업 시작할 때 브랜치를 새로 만듭니다.

```bash
git switch -c feature/your-branch-name
```

Example:

```bash
git switch -c feature/checklist-accordion
```

---

## 2) Move to an existing branch

한국어: 이미 있는 브랜치로 이동할 때 사용합니다.

```bash
git switch branch-name
```

Example:

```bash
git switch feature/auth-session
```

---

## 3) Add, commit, push (basic flow)

한국어: 변경사항 저장(커밋) 후 원격 저장소로 올리는 기본 흐름입니다.

```bash
git add .
git commit -m "your commit message"
git push
```

If first push on a new branch:  
한국어: 새 브랜치를 처음 올릴 때는 아래처럼 `-u`를 붙입니다.

```bash
git push -u origin branch-name
```

---

## 4) Run local dev server (NOT deploy)

한국어: 로컬에서 개발 서버 실행(배포 아님).

```bash
npm run dev
```

This starts local development only (usually `http://localhost:5173`).  
한국어: 내 컴퓨터에서만 열리는 테스트 서버입니다.

---

## 5) Build locally (check production build)

한국어: 배포 전에 빌드 에러가 없는지 확인합니다.

```bash
npm run build
```

---

## 6) Frontend deploy only (quick)

한국어: 프론트(웹 화면)만 배포하고 싶을 때. 루트 폴더에서 실행.

```bash
npm run deploy
```

한국어: API URL을 직접 넣어서 프론트 배포하고 싶으면 아래 사용.

```bash
VITE_API_URL="https://your-api-worker-url.workers.dev" npm run deploy
```

---

## 7) API worker setup (one-time or when env changes)

한국어: API 워커 배포 전에 필요한 설정(시크릿 + DB 마이그레이션).

### 7-1) Set secrets for API worker

```bash
npx wrangler secret put ACCESS_CODE --config worker/wrangler.toml
npx wrangler secret put SESSION_SIGNING_SECRET --config worker/wrangler.toml
```

### 7-2) Apply D1 migration (remote)

```bash
npx wrangler d1 migrations apply 369stage-db --remote --config worker/wrangler.toml
```

---

## 8) Full deploy (API + Frontend) — recommended order

한국어: 헷갈리면 이 순서 그대로 하면 됩니다.

### 8-1) Deploy API worker (`369stage-api`)

```bash
npx wrangler deploy --config worker/wrangler.toml
```

Important: keep `--config worker/wrangler.toml` so you deploy API worker, not frontend worker.  
한국어: `--config`를 빼면 프론트 워커로 잘못 배포될 수 있습니다.

### 8-2) Deploy frontend with API URL (`369stage`)

```bash
VITE_API_URL="https://369stage-api.369stage.workers.dev" npm run deploy
```

---

## 9) Most common auth flow (copy-paste)

한국어: auth 관련 배포가 꼬였을 때 이 블록을 순서대로 실행.

```bash
npx wrangler secret put ACCESS_CODE --config worker/wrangler.toml
npx wrangler secret put SESSION_SIGNING_SECRET --config worker/wrangler.toml
npx wrangler d1 migrations apply 369stage-db --remote --config worker/wrangler.toml
npx wrangler deploy --config worker/wrangler.toml
VITE_API_URL="https://369stage-api.369stage.workers.dev" npm run deploy
```

