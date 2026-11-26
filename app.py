"""Entrada Flask reconhecida pela Vercel."""
from flask import Flask
from servidor import application

app = Flask(__name__, static_folder=None)
app.wsgi_app = application
