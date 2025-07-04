import boto3
import os
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv('AWS_REGION_NAME')

dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
sns = boto3.client('sns', region_name=AWS_REGION)

users_table = dynamodb.Table(os.getenv('USERS_TABLE_NAME'))
products_table = dynamodb.Table(os.getenv('PRODUCTS_TABLE_NAME'))
cart_table = dynamodb.Table(os.getenv('CART_TABLE_NAME'))
orders_table = dynamodb.Table(os.getenv('ORDERS_TABLE_NAME'))
reviews_table = dynamodb.Table(os.getenv('REVIEWS_TABLE_NAME'))
namaste_table = dynamodb.Table(os.getenv('NAMASTE_TABLE_NAME'))

sns_topic_arn = os.getenv('SNS_TOPIC_ARN')
ENABLE_SNS = os.getenv('ENABLE_SNS', 'false').lower() == 'true'
