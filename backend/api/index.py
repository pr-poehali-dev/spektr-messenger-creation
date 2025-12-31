import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Получение подключения к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    '''API для мессенджера Spektr - регистрация, авторизация, чаты, сообщения'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('queryStringParameters', {}).get('action', '')
    body = json.loads(event.get('body', '{}')) if event.get('body') else {}
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Register
        if path == 'register':
            email = body['email']
            username = body['username']
            display_name = body['displayName']
            password = body['password']
            
            cur.execute(
                "INSERT INTO users (email, username, display_name, password) VALUES (%s, %s, %s, %s) RETURNING id, email, username, display_name, avatar, bio, is_verified, is_admin",
                (email, username, display_name, password)
            )
            user = dict(cur.fetchone())
            conn.commit()
            
            # Create saved messages chat for user
            cur.execute(
                "INSERT INTO chats (type, name) VALUES ('saved', 'Избранное') RETURNING id"
            )
            chat_id = cur.fetchone()['id']
            cur.execute(
                "INSERT INTO chat_participants (chat_id, user_id, is_pinned) VALUES (%s, %s, TRUE)",
                (chat_id, user['id'])
            )
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'user': user}),
                'isBase64Encoded': False
            }
        
        # Login
        elif path == 'login':
            username = body['username']
            password = body['password']
            
            cur.execute(
                "SELECT id, email, username, display_name, avatar, bio, is_verified, is_admin FROM users WHERE username = %s AND password = %s",
                (username, password)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Invalid credentials'}),
                    'isBase64Encoded': False
                }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'user': dict(user)}),
                'isBase64Encoded': False
            }
        
        # Get chats for user
        elif path == 'get_chats':
            user_id = int(body['userId'])
            
            cur.execute('''
                SELECT c.*, cp.is_pinned, cp.is_archived, cp.is_blocked,
                       (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                       (SELECT COUNT(*) FROM messages WHERE chat_id = c.id) as unread_count
                FROM chats c
                LEFT JOIN chat_participants cp ON c.id = cp.chat_id AND cp.user_id = %s
                WHERE cp.user_id = %s OR c.is_official = TRUE
                ORDER BY cp.is_pinned DESC, c.created_at DESC
            ''', (user_id, user_id))
            
            chats = [dict(row) for row in cur.fetchall()]
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'chats': chats}),
                'isBase64Encoded': False
            }
        
        # Get messages for chat
        elif path == 'get_messages':
            chat_id = int(body['chatId'])
            
            cur.execute('''
                SELECT m.*, 
                       (SELECT json_agg(json_build_object('userId', r.user_id, 'emoji', r.emoji))
                        FROM reactions r WHERE r.message_id = m.id) as reactions
                FROM messages m
                WHERE m.chat_id = %s
                ORDER BY m.created_at ASC
            ''', (chat_id,))
            
            messages = [dict(row) for row in cur.fetchall()]
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'messages': messages}),
                'isBase64Encoded': False
            }
        
        # Send message
        elif path == 'send_message':
            chat_id = int(body['chatId'])
            sender_id = int(body['senderId'])
            content = body['content']
            msg_type = body.get('type', 'text')
            media_url = body.get('mediaUrl')
            
            cur.execute(
                "INSERT INTO messages (chat_id, sender_id, content, type, media_url) VALUES (%s, %s, %s, %s, %s) RETURNING id, chat_id, sender_id, content, type, media_url, is_edited, created_at, updated_at",
                (chat_id, sender_id, content, msg_type, media_url)
            )
            message = dict(cur.fetchone())
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': message}),
                'isBase64Encoded': False
            }
        
        # Update user profile
        elif path == 'update_profile':
            user_id = int(body['userId'])
            updates = []
            params = []
            
            if 'email' in body:
                updates.append('email = %s')
                params.append(body['email'])
            if 'displayName' in body:
                updates.append('display_name = %s')
                params.append(body['displayName'])
            if 'password' in body:
                updates.append('password = %s')
                params.append(body['password'])
            if 'avatar' in body:
                updates.append('avatar = %s')
                params.append(body['avatar'])
            if 'bio' in body:
                updates.append('bio = %s')
                params.append(body['bio'])
            
            params.append(user_id)
            
            cur.execute(
                f"UPDATE users SET {', '.join(updates)} WHERE id = %s RETURNING id, email, username, display_name, avatar, bio, is_verified, is_admin",
                tuple(params)
            )
            user = dict(cur.fetchone())
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': user}),
                'isBase64Encoded': False
            }
        
        # Search users
        elif path == 'search_users':
            query = body['query']
            user_id = int(body['userId'])
            
            cur.execute(
                "SELECT id, username, display_name, avatar, is_verified FROM users WHERE (username ILIKE %s OR display_name ILIKE %s) AND id != %s LIMIT 20",
                (f'%{query}%', f'%{query}%', user_id)
            )
            users = [dict(row) for row in cur.fetchall()]
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'users': users}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Action not found'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
