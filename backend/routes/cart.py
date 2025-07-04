from flask import Blueprint, request, jsonify, session
import boto3
import os
from dotenv import load_dotenv
from uuid import uuid4

# Load environment variables
load_dotenv()

dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION_NAME'))
cart_table = dynamodb.Table(os.getenv('CART_TABLE_NAME'))

cart_bp = Blueprint('cart', __name__)

# ✅ View cart items for logged-in user
@cart_bp.route('/', methods=['GET'])
def view_cart():
    if 'email' not in session:
        return jsonify({'error': 'Login required'}), 401

    try:
        response = cart_table.query(
            IndexName='user_email-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('user_email').eq(session['email'])
        )
        return jsonify({'cart': response.get('Items', [])}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Add item to cart
@cart_bp.route('/add', methods=['POST'])
def add_to_cart():
    if 'email' not in session:
        return jsonify({'error': 'Login required'}), 401

    data = request.get_json()
    product_id = data.get('product_id')
    name = data.get('name')
    price = data.get('price')
    quantity = data.get('quantity', 1)

    if not all([product_id, name, price]):
        return jsonify({'error': 'Missing fields'}), 400

    try:
        cart_table.put_item(Item={
            'cart_id': str(uuid4()),
            'user_email': session['email'],
            'product_id': product_id,
            'name': name,
            'price': price,
            'quantity': quantity
        })
        return jsonify({'message': 'Item added to cart'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Remove item from cart
@cart_bp.route('/remove/<string:cart_id>', methods=['DELETE'])
def remove_from_cart(cart_id):
    if 'email' not in session:
        return jsonify({'error': 'Login required'}), 401

    try:
        cart_table.delete_item(Key={'cart_id': cart_id})
        return jsonify({'message': 'Item removed'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
