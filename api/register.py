"""Vercel Function para /api/register."""
from servidor import application


def app(environ, start_response):
    environ["PATH_INFO"] = "/api/register"
    return application(environ, start_response)
