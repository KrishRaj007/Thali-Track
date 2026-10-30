import os

from flask import Flask, jsonify, redirect, request, send_from_directory, url_for
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv
from extensions import mongo, login_manager

load_dotenv()

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/canteen')
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SECURE'] = os.getenv('FLASK_ENV') == 'production'
    app.config['SESSION_COOKIE_SAMESITE'] = (
        'None' if app.config['SESSION_COOKIE_SECURE'] else 'Lax'
    )

    if not app.config['SECRET_KEY']:
        if os.getenv('FLASK_ENV') == 'production':
            raise RuntimeError('SECRET_KEY must be configured in production')
        app.config['SECRET_KEY'] = 'dev-only-canteen-secret-key'

    frontend_origins = (
        os.getenv('FRONTEND_URLS')
        or os.getenv('FRONTEND_URL')
        or 'https://canteen-alpha-alpha.vercel.app,http://localhost:5500,http://127.0.0.1:5500'
    )
    allowed_origins = [
        origin.strip()
        for origin in frontend_origins.split(',')
        if origin.strip()
    ]
    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization']
    )

    mongo.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    @login_manager.request_loader
    def load_user_from_request(req):
        auth_header = req.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        from auth_tokens import load_user_from_token
        return load_user_from_token(app, auth_header.removeprefix('Bearer ').strip())

    @login_manager.unauthorized_handler
    def unauthorized():
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Authentication required'}), 401
        return redirect(url_for('auth.login'))

    from routes.auth import auth_bp
    from routes.menu import menu_bp
    from routes.orders import orders_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(admin_bp)

    @app.route('/menu-items/<path:filename>')
    def menu_item_image(filename):
        return send_from_directory(os.path.join(app.root_path, 'Menu Items'), filename)

    should_seed = (
        os.getenv('SEED_DEMO_DATA', '').lower() in {'1', 'true', 'yes'}
        or os.getenv('FLASK_ENV') != 'production'
    )
    if should_seed:
        with app.app_context():
            seed_data()

    return app


def seed_data():
    from werkzeug.security import generate_password_hash

    menu_exists = mongo.db.menu_items.count_documents({}) > 0

    seed_users = [
        {
            'name':     os.getenv('SEED_ADMIN_NAME', 'Demo Admin'),
            'email':    os.getenv('SEED_ADMIN_EMAIL', 'krish.r2106@gmail.com'),
            'password': os.getenv('SEED_ADMIN_PASSWORD', 'Admin@123'),
            'role':     'admin'
        },
        {
            'name':     os.getenv('SEED_STUDENT_NAME', 'Demo Student'),
            'email':    os.getenv('SEED_STUDENT_EMAIL', 'student@gmail.com'),
            'password': os.getenv('SEED_STUDENT_PASSWORD', 'Student@123'),
            'role':     'student'
        }
    ]
    for user in seed_users:
        email = user['email'].strip().lower()
        if not email or not user['password']:
            continue
        mongo.db.users.update_one(
            {'email': email},
            {
                '$set': {
                    'name':     user['name'],
                    'email':    email,
                    'password': generate_password_hash(user['password']),
                    'role':     user['role']
                },
                '$setOnInsert': {'created_at': datetime.utcnow()}
            },
            upsert=True
        )

    if menu_exists:
        return

    items = [
        ('Aloo Paratha',    'Breakfast', 40,  'Crispy stuffed paratha with butter'),
        ('Poha',            'Breakfast', 30,  'Light flattened rice with spices'),
        ('Idli Sambar',     'Breakfast', 35,  'Soft idlis with hot sambar & chutney'),
        ('Dal Rice',        'Lunch',     60,  'Comfort dal with steamed rice'),
        ('Rajma Chawal',    'Lunch',     70,  'Kidney beans curry with rice'),
        ('Veg Thali',       'Lunch',     90,  'Full thali: rice, dal, sabzi, roti, salad'),
        ('Samosa (2 pcs)',  'Snacks',    20,  'Crispy fried pastry with potato filling'),
        ('Bread Pakora',    'Snacks',    25,  'Golden fried bread with spiced filling'),
        ('Maggi Noodles',   'Snacks',    30,  'Classic masala noodles'),
        ('Masala Chai',     'Beverages', 15,  'Spiced milk tea'),
        ('Cold Coffee',     'Beverages', 45,  'Chilled blended coffee with ice cream'),
        ('Lassi',           'Beverages', 35,  'Sweet or salted yogurt drink'),
        ('Gulab Jamun',     'Desserts',  30,  '2 pieces in warm sugar syrup'),
        ('Ice Cream',       'Desserts',  40,  'Vanilla / Chocolate / Strawberry'),
    ]

    mongo.db.menu_items.insert_many([
        {
            'name':        name,
            'category':    cat,
            'price':       price,
            'description': desc,
            'available':   True,
            'created_at':  datetime.utcnow()
        }
        for name, cat, price, desc in items
    ])


app = create_app()


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
