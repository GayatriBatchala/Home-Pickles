from flask import Blueprint, request, jsonify, session
import boto3
import os
from dotenv import load_dotenv
from uuid import uuid4
from datetime import datetime

# Load environment variables
load_dotenv()

dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION_NAME'))
reviews_table = dynamodb.Table(os.getenv('REVIEWS_TABLE_NAME'))

reviews_bp = Blueprint('reviews', __name__)

# ✅ Add a review
@reviews_bp.route('/add', methods=['POST'])
def add_review():
    if 'email' not in session:
        return jsonify({'error': 'Login required'}), 401

    data = request.get_json()
    product_id = data.get('product_id')
    rating = data.get('rating')
    comment = data.get('comment')

    if not all([product_id, rating, comment]):
        return jsonify({'error': 'Missing fields'}), 400

    try:
        reviews_table.put_item(Item={
            'review_id': str(uuid4()),
            'product_id': product_id,
            'user_email': session['email'],
            'rating': rating,
            'comment': comment,
            'timestamp': datetime.now().isoformat()
        })
        return jsonify({'message': 'Review added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Get reviews for a product
@reviews_bp.route('/<string:product_id>', methods=['GET'])
def get_reviews(product_id):
    try:
        response = reviews_table.query(
            IndexName='product_id-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('product_id').eq(product_id)
        )
        reviews = response.get('Items', [])
        return jsonify({'reviews': reviews}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
