from flask import Blueprint, request, jsonify
import boto3
import os
from dotenv import load_dotenv
from uuid import uuid4
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Set up DynamoDB
AWS_REGION = os.getenv('AWS_REGION_NAME', 'us-east-1')
NAMASTE_TABLE_NAME = os.getenv('NAMASTE_TABLE_NAME', 'namaste')

dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
namaste_table = dynamodb.Table(NAMASTE_TABLE_NAME)

namaste_bp = Blueprint('namaste', __name__)

# ✅ Route: Submit contact/message
@namaste_bp.route('/submit', methods=['POST'])
def submit_message():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    if not all([name, email, message]):
        return jsonify({'error': 'All fields are required'}), 400

    try:
        namaste_table.put_item(Item={
            'message_id': str(uuid4()),
            'name': name,
            'email': email,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        return jsonify({'message': 'Thank you for contacting us!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
