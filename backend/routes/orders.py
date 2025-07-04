from flask import Blueprint, request, jsonify, session
import boto3
import os
from datetime import datetime
from dotenv import load_dotenv
from uuid import uuid4

# Load env vars
load_dotenv()

dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION_NAME'))
cart_table = dynamodb.Table(os.getenv('CART_TABLE_NAME'))
orders_table = dynamodb.Table(os.getenv('ORDERS_TABLE_NAME'))

orders_bp = Blueprint('orders', __name__)

# ✅ Place Order (from current cart)
@orders_bp.route('/place', methods=['POST'])
def place_order():
    if 'email' not in session:
        return jsonify({'error': 'Login required'}), 401

    user_email = session['email']

    try:
        # 1. Get cart items for user
        response = cart_table.query(
            IndexName='user_email-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('user_email').eq(user_email)
        )
        cart_items = response.get('Items', [])

        if not cart_items:
            return jsonify({'error': 'Cart is empty'}), 400

        # 2. Create new order
        order_id = str(uuid4())
        timestamp = datetime.now().isoformat()

        orders_table.put_item(Item={
            'order_id': order_id,
            'user_email': user_email,
            'items': cart_items,
            'timestamp': timestamp,
            'status': 'placed'
        })

        # 3. Clear the cart
        for item in cart_items:
            cart_table.delete_item(Key={'cart_id': item['cart_id']})

        return jsonify({'message': 'Order placed successfully', 'order_id': order_id}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
