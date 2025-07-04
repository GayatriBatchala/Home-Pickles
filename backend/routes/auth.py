import os
import uuid
import boto3
from flask import Blueprint, request, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# AWS Setup
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION_NAME'))
users_table = dynamodb.Table(os.getenv('USERS_TABLE_NAME'))

# Blueprint Setup
auth_bp = Blueprint('auth', __name__)

# REGISTER USER
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')  # default role

    if not all([name, email, password]):
        return jsonify({'error': 'All fields required'}), 400

    try:
        # Check if already exists
        existing = users_table.get_item(Key={'email': email})
        if 'Item' in existing:
            return jsonify({'error': 'User already exists'}), 409

        # Create new user
        users_table.put_item(Item={
            'email': email,
            'name': name,
            'password': generate_password_hash(password),
            'role': role,
            'user_id': str(uuid.uuid4())
        })

        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# LOGIN
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    try:
        res = users_table.get_item(Key={'email': email})
        user = res.get('Item')

        if not user or not check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid credentials'}), 401

        session['email'] = user['email']
        session['role'] = user.get('role', 'user')
        return jsonify({'message': 'Login successful'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# LOGOUT
@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'}), 200

# SESSION CHECK
@auth_bp.route('/session', methods=['GET'])
def check_session():
    if 'email' in session:
        return jsonify({
            'logged_in': True,
            'email': session['email'],
            'role': session.get('role', 'user')
        })
    return jsonify({'logged_in': False}), 200
