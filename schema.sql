DO $eletrolabz$
BEGIN
CREATE TABLE IF NOT EXISTS accounts (
    cpf TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    salt BYTEA NOT NULL,
    password BYTEA NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    cpf TEXT NOT NULL REFERENCES accounts(cpf),
    expires BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS attempts (ip TEXT NOT NULL, ts BIGINT NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
CREATE INDEX IF NOT EXISTS attempts_window ON attempts(ip, ts);
END;
$eletrolabz$;
