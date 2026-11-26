"""Aplicação WSGI do EletroLabz. Execute com Python 3.11+ para uso local."""
import hashlib
import hmac
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import time
from http import HTTPStatus
from http.cookies import SimpleCookie
from pathlib import Path
from urllib.parse import urlsplit
from wsgiref.simple_server import make_server

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"
DB = Path(os.environ.get("ELETROLABZ_DB", ROOT / "contas.sqlite3"))
TTL = 8 * 3600


def cpf_valido(cpf):
    if not re.fullmatch(r"[0-9]{11}", cpf) or len(set(cpf)) == 1:
        return False
    for end in (9, 10):
        total = sum(int(d) * (end + 1 - i) for i, d in enumerate(cpf[:end]))
        if (total * 10 % 11) % 10 != int(cpf[end]):
            return False
    return True


def senha_hash(password, salt):
    return hashlib.scrypt(password.encode(), salt=salt, n=32768, r=8, p=1, maxmem=64*1024**2)


class PostgresQueries:
    def __init__(self, connection):
        self.connection = connection

    def execute(self, sql, params=()):
        return self.connection.execute(sql.replace("?", "%s"), params)


def api(env, db, action):
    cookie = SimpleCookie()
    cookie.load(env.get("HTTP_COOKIE", ""))
    token = cookie["el_session"].value if "el_session" in cookie else ""
    digest = lambda value: hashlib.sha256(value.encode()).hexdigest()
    now = int(time.time())
    db.execute("DELETE FROM sessions WHERE expires <= ?", (now,))
    method = env["REQUEST_METHOD"]
    if action == "session" and method == "GET":
        row = db.execute("SELECT name, cpf FROM accounts JOIN sessions USING(cpf) WHERE token=?", (digest(token),)).fetchone()
        return (200, dict(name=row[0], cpf=row[1]), []) if row else (401, {}, [])
    if action not in ("login", "register", "logout") or method != "POST":
        return 404, {}, []
    origin = urlsplit(env.get("HTTP_ORIGIN","")).netloc
    if origin != env.get("HTTP_HOST") or env.get("CONTENT_TYPE","").split(";")[0] != "application/json":
        return 403, {"error":"Origem inválida."}, []
    size = int(env.get("CONTENT_LENGTH") or 0)
    if not 0 < size <= 2048:
        return 400, {"error":"Dados inválidos."}, []
    data = json.loads(env["wsgi.input"].read(size))
    if not isinstance(data, dict):
        raise ValueError()
    flags = "; HttpOnly; SameSite=Strict; Path=/" + ("; Secure" if env["wsgi.url_scheme"]=="https" or os.environ.get("VERCEL")=="1" or os.environ.get("ELETROLABZ_HTTPS")=="1" else "")
    if action == "logout":
        db.execute("DELETE FROM sessions WHERE token=?", (digest(token),))
        return 200, {}, [("Set-Cookie","el_session=; Max-Age=0"+flags)]
    cpf = re.sub(r"[.\-\s]", "", str(data.get("cpf","")))
    password = data.get("password","")
    if not cpf_valido(cpf) or not isinstance(password,str) or not 8 <= len(password) <= 128:
        return 400, {"error":"Confira o CPF e a senha (8 a 128 caracteres)."}, []
    ip = env.get("HTTP_X_VERCEL_FORWARDED_FOR", "").split(",")[0].strip() if os.environ.get("VERCEL")=="1" else ""
    ip = ip or env.get("REMOTE_ADDR", "")
    db.execute("DELETE FROM attempts WHERE ts < ?", (now-600,))
    if db.execute("SELECT count(*) FROM attempts WHERE ip=?", (ip,)).fetchone()[0] >= 15:
        return 429, {"error":"Muitas tentativas. Aguarde dez minutos."}, []
    db.execute("INSERT INTO attempts VALUES (?,?)",(ip,now))
    if action == "register":
        name = " ".join(str(data.get("name","")).split())
        if not 3 <= len(name) <= 100 or len(name.split()) < 2:
            return 400, {"error":"Informe nome e sobrenome."}, []
        salt = secrets.token_bytes(16)
        added = db.execute("INSERT INTO accounts(cpf,name,salt,password) VALUES (?,?,?,?) ON CONFLICT(cpf) DO NOTHING",(cpf,name,salt,senha_hash(password,salt)))
        if added.rowcount == 0:
            return 409, {"error":"Cadastro indisponível para estes dados. Tente entrar."}, []
    else:
        row = db.execute("SELECT name,salt,password FROM accounts WHERE cpf=?", (cpf,)).fetchone()
        candidate = senha_hash(password,row[1] if row else bytes(16))
        if not row or not hmac.compare_digest(candidate,row[2]):
            return 401, {"error":"CPF ou senha incorretos."}, []
        name = row[0]
    fresh = secrets.token_urlsafe(32)
    db.execute("DELETE FROM sessions WHERE token=?", (digest(token),))
    db.execute("INSERT INTO sessions VALUES (?,?,?)",(digest(fresh),cpf,now+TTL))
    return 200, dict(name=name,cpf=cpf), [("Set-Cookie","el_session="+fresh+"; Max-Age="+str(TTL)+flags)]


def application(env, respond):
    path = env["PATH_INFO"]
    headers = [("X-Content-Type-Options","nosniff")]
    if path.startswith("/api/"):
        db = None
        try:
            url = os.environ.get("DATABASE_URL")
            if url:
                import psycopg
                db = psycopg.connect(url, connect_timeout=6)
                queries = PostgresQueries(db)
            elif os.environ.get("VERCEL") == "1":
                raise RuntimeError("DATABASE_URL ausente")
            else:
                db = sqlite3.connect(DB)
                db.executescript("CREATE TABLE IF NOT EXISTS accounts(cpf TEXT PRIMARY KEY,name TEXT NOT NULL,salt BLOB,password BLOB); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,cpf TEXT,expires INTEGER); CREATE TABLE IF NOT EXISTS attempts(ip TEXT,ts INTEGER);")
                queries = db
            with db:
                status,obj,extra = api(env,queries,path[5:])
        except (ValueError, UnicodeError):
            status,obj,extra = 400,{"error":"Dados inválidos."},[]
        except Exception as exc:
            print("Serviço de contas:", type(exc).__name__, flush=True)
            status,obj,extra = 503,{"error":"O serviço de contas está temporariamente indisponível. Tente novamente em instantes."},[]
        finally:
            if db is not None:
                db.close()
        body = json.dumps(obj).encode()
        headers += extra+[("Content-Type","application/json"),("Cache-Control","no-store")]
    else:
        file = (PUBLIC / (path.strip("/") or "index.html")).resolve()
        if file.is_relative_to(PUBLIC) and file.is_file() and env["REQUEST_METHOD"] in ("GET","HEAD"):
            status,body = 200,file.read_bytes()
            headers.append(("Content-Type",mimetypes.guess_type(file)[0] or "application/octet-stream"))
        else:
            status,body = 404,b""
    respond(f"{status} {HTTPStatus(status).phrase}",headers+[("Content-Length",str(len(body)))])
    return [b"" if env["REQUEST_METHOD"]=="HEAD" else body]


if __name__ == "__main__":
    print("EletroLabz em http://localhost:8000", flush=True)
    make_server("127.0.0.1",8000,application).serve_forever()
