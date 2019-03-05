-- Up
ALTER TABLE poll ADD COLUMN user TEXT;

-- Down
PRAGMA foreign_keys = OFF;

CREATE TABLE new_poll (
  channel_id TEXT,
  ts TEXT,
  content TEXT,

  multivote BOOLEAN,
  anonymous BOOLEAN,

  PRIMARY KEY(channel_id, ts)
);
INSERT INTO new_poll SELECT channel_id, ts, content, multivote, anonymous FROM poll;
DROP TABLE poll;
ALTER TABLE new_poll RENAME TO poll;

PRAGMA foreign_key_check;
PRAGMA foreign_keys = ON;
