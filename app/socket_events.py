from flask import request
from flask_socketio import emit, join_room, leave_room
from app import socketio, db
from flask_login import current_user

# Namespace for Builder Collaboration
NAMESPACE = '/builder'

@socketio.on('connect', namespace=NAMESPACE)
def handle_connect():
    if current_user.is_authenticated:
        pass # User connected
    else:
        return False # Reject anonymous

@socketio.on('join_pipeline', namespace=NAMESPACE)
def on_join(data):
    """User joins a pipeline room for collaboration"""
    pipeline_id = data.get('pipeline_id')
    room = f"pipeline_{pipeline_id}"
    join_room(room)
    
    emit('user_joined', {
        'username': current_user.username,
        'user_id': current_user.id
    }, room=room, include_self=False)

@socketio.on('leave_pipeline', namespace=NAMESPACE)
def on_leave(data):
    pipeline_id = data.get('pipeline_id')
    room = f"pipeline_{pipeline_id}"
    leave_room(room)
    
    emit('user_left', {
        'username': current_user.username,
        'user_id': current_user.id
    }, room=room)

@socketio.on('canvas_update', namespace=NAMESPACE)
def on_canvas_update(data):
    """
    Broadcast canvas changes to all other users in the room.
    data includes: {pipeline_id, action, changelog/state}
    """
    pipeline_id = data.get('pipeline_id')
    room = f"pipeline_{pipeline_id}"
    
    # Broadcast to everyone else
    emit('canvas_updated', data, room=room, include_self=False)

@socketio.on('cursor_move', namespace=NAMESPACE)
def on_cursor(data):
    """Broadcast cursor position"""
    pipeline_id = data.get('pipeline_id')
    room = f"pipeline_{pipeline_id}"
    
    emit('remote_cursor', {
        'user_id': current_user.id,
        'username': current_user.username,
        'x': data.get('x'),
        'y': data.get('y')
    }, room=room, include_self=False)
