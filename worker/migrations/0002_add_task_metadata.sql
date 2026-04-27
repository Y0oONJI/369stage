ALTER TABLE tasks ADD COLUMN due_date TEXT NOT NULL DEFAULT '';
ALTER TABLE tasks ADD COLUMN category_id TEXT NOT NULL DEFAULT 'common';
ALTER TABLE tasks ADD COLUMN direction_notes_json TEXT NOT NULL DEFAULT '{"30":[],"60":[],"90":[]}';
