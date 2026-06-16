-- Google 로그인 도입: 태스크를 user_id(Firebase uid) 기준으로 분리
ALTER TABLE tasks ADD COLUMN user_id TEXT;

CREATE INDEX idx_tasks_user ON tasks (user_id);
