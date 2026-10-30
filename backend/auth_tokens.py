from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from extensions import mongo
from models import User
from mongo_helpers import id_filter


TOKEN_SALT = 'canteen-auth-token'
TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7


def _serializer(app):
    return URLSafeTimedSerializer(app.config['SECRET_KEY'], salt=TOKEN_SALT)


def generate_auth_token(app, user_id):
    return _serializer(app).dumps({'user_id': str(user_id)})


def load_user_from_token(app, token):
    try:
        data = _serializer(app).loads(token, max_age=TOKEN_MAX_AGE_SECONDS)
    except (BadSignature, SignatureExpired):
        return None

    user_doc = mongo.db.users.find_one(id_filter(data.get('user_id')))
    return User(user_doc) if user_doc else None
