"""
Business: Управление друзьями - добавление, удаление, список
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict
"""

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'add':
                user_id = body.get('user_id')
                friend_code = body.get('friend_code', '').strip()
                
                if not user_id or not friend_code:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Укажите friend_code'}),
                        'isBase64Encoded': False
                    }
                
                parts = friend_code.split('#')
                if len(parts) != 2:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный формат кода (Username#0000)'}),
                        'isBase64Encoded': False
                    }
                
                username, discriminator = parts
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute(
                    "SELECT id FROM users WHERE username = %s AND discriminator = %s",
                    (username, discriminator)
                )
                friend = cursor.fetchone()
                
                if not friend:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь не найден'}),
                        'isBase64Encoded': False
                    }
                
                if friend['id'] == int(user_id):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Нельзя добавить себя в друзья'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    """INSERT INTO friendships (user_id, friend_id, status) 
                       VALUES (%s, %s, 'accepted'), (%s, %s, 'accepted') 
                       ON CONFLICT (user_id, friend_id) DO NOTHING""",
                    (user_id, friend['id'], friend['id'], user_id)
                )
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'friend_id': friend['id']}),
                    'isBase64Encoded': False
                }
            
            elif action == 'remove':
                user_id = body.get('user_id')
                friend_id = body.get('friend_id')
                
                cursor = conn.cursor()
                cursor.execute(
                    "DELETE FROM friendships WHERE (user_id = %s AND friend_id = %s) OR (user_id = %s AND friend_id = %s)",
                    (user_id, friend_id, friend_id, user_id)
                )
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            user_id = event.get('queryStringParameters', {}).get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Укажите user_id'}),
                    'isBase64Encoded': False
                }
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                """SELECT u.id, u.username, u.discriminator, u.avatar, u.status, u.activity,
                          (SELECT COUNT(*) FROM direct_messages 
                           WHERE sender_id = u.id AND recipient_id = %s AND read = FALSE) as unread_count
                   FROM users u
                   JOIN friendships f ON f.friend_id = u.id
                   WHERE f.user_id = %s AND f.status = 'accepted'
                   ORDER BY u.status DESC, u.username ASC""",
                (user_id, user_id)
            )
            friends = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'friends': [dict(f) for f in friends]
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()
