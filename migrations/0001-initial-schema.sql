-- Up
CREATE TABLE poll (
  channel_id TEXT,
  ts TEXT,
  content TEXT,

  multivote BOOLEAN,

  PRIMARY KEY(channel_id, ts)
);

CREATE TABLE option (
  channel_id TEXT,
  ts TEXT,
  -- 0-indexed
  option_id INTEGER,
  content TEXT,
  PRIMARY KEY(channel_id, ts, option_id)
  FOREIGN KEY(channel_id, ts) REFERENCES poll(channel_id, ts)
);

CREATE TABLE vote (
  channel_id TEXT,
  ts TEXT,
  option_id INTEGER,
  user TEXT,
  PRIMARY KEY(channel_id, ts, option_id, user)
  FOREIGN KEY(channel_id, ts) REFERENCES poll(channel_id, ts)
);

CREATE INDEX vote_by_user ON vote (channel_id, ts, user, option_id);


-- Down
DROP INDEX vote_by_user;
DROP TABLE vote;
DROP TABLE option;
DROP TABLE poll;
