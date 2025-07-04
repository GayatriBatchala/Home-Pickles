from flask import Blueprint, jsonify, request
import boto3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# AWS DynamoDB setup
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION_NAME'))
products_table = dynamodb.Table(os.getenv('PRODUCTS_TABLE_NAME'))

products_bp = Blueprint('products', __name__)

# ✅ Get all products
@products_bp.route('/', methods=['GET'])
def get_products():
    try:
        response = products_table.scan()
        items = response.get('Items', [])
        return jsonify({'products': items}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Get a product by ID
@products_bp.route('/<string:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        response = products_table.get_item(Key={'product_id': product_id})
        item = response.get('Item')
        if not item:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify(item), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Add a product (optional use)
@products_bp.route('/add', methods=['POST'])
def add_product():
    data = request.get_json()
    try:
        product_id = data.get('product_id')
        name = data.get('name')
        description = data.get('description')
        price = data.get('price')
        category = data.get('category')

        if not all([product_id, name, description, price]):
            return jsonify({'error': 'Missing required fields'}), 400

        products_table.put_item(Item={
            'product_id': product_id,
            'name': name,
            'description': description,
            'price': price,
            'category': category
        })

        return jsonify({'message': 'Product added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
