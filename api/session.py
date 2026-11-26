"""Vercel Function para /api/session."""
from servidor import application


def app(environ, start_response):
    environ["PATH_INFO"] = "/api/session"
    return application(environ, start_response)
