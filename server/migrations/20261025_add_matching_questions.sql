CREATE TABLE IF NOT EXISTS matching_item (
  question_id INTEGER NOT NULL REFERENCES question(id) ON DELETE CASCADE,
  pair_index SMALLINT NOT NULL CHECK (pair_index BETWEEN 0 AND 4),
  left_text VARCHAR(120) NOT NULL,
  right_text VARCHAR(120) NOT NULL,
  PRIMARY KEY (question_id, pair_index)
);

ALTER TABLE answers
  ADD COLUMN IF NOT EXISTS matching_positions JSONB;
