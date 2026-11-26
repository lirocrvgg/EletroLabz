"""Vercel Function para /api/login."""
from servidor import application


def app(environ, start_response):
    environ["PATH_INFO"] = "/api/login"
    return application(environ, start_response)
