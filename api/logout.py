"""Vercel Function para /api/logout."""
from servidor import application


def app(environ, start_response):
    environ["PATH_INFO"] = "/api/logout"
    return application(environ, start_response)
