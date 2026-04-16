# Upcoming · 작업 백로그

이 파일은 **369stage**에서 할 일·진행 상황을 정리합니다.  
**매일** 여기에 태스크를 추가·체크·날짜를 남기면, 다른 PC에서도 같은 레포만 열면 맥락을 이어갈 수 있습니다.

---

## 사용 방법 (짧게)

- **오늘 할 일**: 아래 `## 백로그`에 `- [ ]` 항목 추가
- **끝난 일**: `- [ ]` → `- [x]` 로 바꾸고, 필요하면 완료 날짜 적기
- **막힌 일**: 항목 아래에 `메모:` 로 블로커·링크·스크린샷 경로 적기

---

## 배경: 왜 다른 PC에서 내용이 안 보였나

- 프론트만 Workers에 올라가 있고, **`GET/PUT /tasks`에 JSON을 주는 API가 같은 배포에 없으면**  
  브라우저가 `…/tasks`를 요청해도 **SPA용 `index.html`**이 내려올 수 있음 (Network Preview가 HTML인 경우).
- 원격이 꺼진 빌드면 **`localStorage`만** 쓰므로 PC마다 데이터가 갈림.
- **공유하려면**: Worker에서 **`/tasks`를 실제로 처리**하고, 빌드 시 **`VITE_API_URL`이 그 API 베이스**를 가리키게 할 것.

---

## Phase 0 — 확인

- [ ] 프로덕션 빌드에 `VITE_API_URL` / `VITE_API_SECRET`이 번들에 포함되는지 확인 (`dist` 내 JS 검색 또는 배포 파이프라인 확인)
- [ ] `GET {API}/tasks` 응답이 **JSON**인지 **HTML**인지 확인 (curl 또는 DevTools Network → Response)
- [ ] Cloudflare에서 KV·Worker·라우트 구성 확인 (기존 API Worker가 따로 있는지)

---

## Phase 1 — API 스펙 정리

- [ ] `GET /tasks` → `{ "tasks": Task[] }`, `PUT /tasks` → 동일 본문, `Authorization: Bearer` 검증
- [ ] 저장소: KV 단일 키에 전체 JSON 등, 구현 난이도에 맞게 결정
- [ ] 브라우저 호출용 CORS·preflight 정리

---

## Phase 2 — Worker 구현

- [ ] Worker 진입점에서 `pathname === '/tasks'`만 API로 처리 (나머지는 기존 assets/SPA와 충돌 없게)
- [ ] `GET`: KV 읽기, 없으면 `{ "tasks": [] }`
- [ ] `PUT`: 시크릿 검증 후 KV 저장
- [ ] `wrangler` 설정에 KV 바인딩 반영
- [ ] 로컬 `wrangler dev` + curl로 GET/PUT 수동 검증

---

## Phase 3 — 프론트·배포

- [ ] 프로덕션 빌드 시 `VITE_API_URL`을 **실제 API 베이스 URL**로 고정 (CI 시크릿 / `.env.production`)
- [ ] `npm run deploy`로 빌드+배포 후 두 PC에서 동작 확인
- [ ] QA: 한쪽에서 저장 → 다른 쪽 Network에서 `GET …/tasks` 200 + JSON body 확인

---

## Phase 4 — 선택

- [ ] 폴링 주기·에러 문구 조정
- [ ] 클라이언트에 시크릿 노출 완화(장기, 별도 설계)

---

## 백로그 (매일 여기부터 적기)

<!-- 아래 형식으로 추가하세요 -->

- [ ] 예시: Phase 0.2 curl로 `/tasks` 응답 확인
- [ ] 

---

## 일일 메모 (선택)

| 날짜 | 한 일 / 메모 |
|------|----------------|
|      |                |
