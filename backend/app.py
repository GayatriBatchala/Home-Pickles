
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv('SECRET_KEY', 'homemadepickles_secret_key')

# Register routes
from routes.auth import auth_bp
from routes.products import products_bp
from routes.cart import cart_bp
from routes.orders import orders_bp
from routes.reviews import reviews_bp
from routes.namaste import namaste_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(cart_bp, url_prefix='/api/cart')
app.register_blueprint(orders_bp, url_prefix='/api/orders')
app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
app.register_blueprint(namaste_bp, url_prefix='/api/namaste')

@app.route('/')
def home():
    return {"message": "HomeMadePickles Flask backend running!"}

@app.errorhandler(404)
def not_found(e):
    return {"error": "404 Not Found"}, 404

@app.errorhandler(500)
def internal_error(e):
    return {"error": "500 Internal Server Error"}, 500

if __name__ == '__main__':
    app.run(debug=True)
