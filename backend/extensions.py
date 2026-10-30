from urllib.parse import urlparse

import mongomock
from pymongo import MongoClient

from flask_login import LoginManager


class MongoConnection:
	def __init__(self):
		self.client = None
		self.db = None
		self.using_fallback = False

	def init_app(self, app):
		mongo_uri = app.config.get('MONGO_URI')
		if not mongo_uri:
			raise RuntimeError('MONGO_URI is not configured')

		db_name = self._resolve_db_name(mongo_uri, app)

		try:
			client = MongoClient(
				mongo_uri,
				serverSelectionTimeoutMS=3000,
				connectTimeoutMS=3000,
				socketTimeoutMS=3000,
			)
			client.admin.command('ping')
			self.client = client
			self.db = client.get_default_database(default=db_name)
			self.using_fallback = False
		except Exception as exc:
			app.logger.warning('MongoDB unavailable, using in-memory fallback: %s', exc)
			self.client = mongomock.MongoClient()
			self.db = self.client[db_name]
			self.using_fallback = True

	def _resolve_db_name(self, mongo_uri, app):
		parsed = urlparse(mongo_uri)
		if parsed.path and parsed.path != '/':
			return parsed.path.lstrip('/')
		return app.config.get('MONGO_DBNAME', 'canteen')


mongo = MongoConnection()
login_manager = LoginManager()
