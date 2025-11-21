"""
Business: Отправка, получение и управление личными сообщениями
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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
            
            if action == 'send':
                sender_id = body.get('sender_id')
                recipient_id = body.get('recipient_id')
                content = body.get('content', '').strip()
                
                if not sender_id or not recipient_id or not content:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Заполните все поля'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute(
                    """INSERT INTO direct_messages (sender_id, recipient_id, content) 
                       VALUES (%s, %s, %s) 
                       RETURNING id, sender_id, recipient_id, content, created_at, read""",
                    (sender_id, recipient_id, content)
                )
                message = cursor.fetchone()
                
                cursor.execute(
                    "SELECT id, username, discriminator, avatar FROM users WHERE id = %s",
                    (sender_id,)
                )
                sender = cursor.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': {
                            **dict(message),
                            'sender': dict(sender),
                            'created_at': message['created_at'].isoformat() if message['created_at'] else None
                        }
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'add_reaction':
                message_id = body.get('message_id')
                user_id = body.get('user_id')
                emoji = body.get('emoji')
                
                cursor = conn.cursor()
                cursor.execute(
                    """INSERT INTO message_reactions (message_id, message_type, user_id, emoji) 
                       VALUES (%s, 'direct', %s, %s) 
                       ON CONFLICT (message_id, message_type, user_id, emoji) DO NOTHING""",
                    (message_id, user_id, emoji)
                )
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'remove_reaction':
                message_id = body.get('message_id')
                user_id = body.get('user_id')
                emoji = body.get('emoji')
                
                cursor = conn.cursor()
                cursor.execute(
                    """DELETE FROM message_reactions 
                       WHERE message_id = %s AND message_type = 'direct' AND user_id = %s AND emoji = %s""",
                    (message_id, user_id, emoji)
                )
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id')
            friend_id = params.get('friend_id')
            
            if not user_id or not friend_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Укажите user_id и friend_id'}),
                    'isBase64Encoded': False
                }
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                """SELECT dm.*, 
                          u.username, u.discriminator, u.avatar,
                          (SELECT json_agg(json_build_object('emoji', emoji, 'count', count, 'users', users))
                           FROM (
                               SELECT emoji, COUNT(*) as count, array_agg(user_id::text) as users
                               FROM message_reactions 
                               WHERE message_id = dm.id AND message_type = 'direct'
                               GROUP BY emoji
                           ) reactions) as reactions
                   FROM direct_messages dm
                   JOIN users u ON u.id = dm.sender_id
                   WHERE (dm.sender_id = %s AND dm.recipient_id = %s) 
                      OR (dm.sender_id = %s AND dm.recipient_id = %s)
                   ORDER BY dm.created_at ASC""",
                (user_id, friend_id, friend_id, user_id)
            )
            messages = cursor.fetchall()
            
            cursor.execute(
                "UPDATE direct_messages SET read = TRUE WHERE sender_id = %s AND recipient_id = %s AND read = FALSE",
                (friend_id, user_id)
            )
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'messages': [
                        {
                            **dict(msg),
                            'created_at': msg['created_at'].isoformat() if msg['created_at'] else None,
                            'reactions': msg['reactions'] or []
                        }
                        for msg in messages
                    ]
                }, default=str),
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
