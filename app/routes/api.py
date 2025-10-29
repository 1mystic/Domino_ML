from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models import SavedModel
import json

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.route('/models', methods=['GET'])
@login_required
def get_models():
    models = SavedModel.query.filter_by(user_id=current_user.id).order_by(SavedModel.updated_at.desc()).all()
    return jsonify([{
        'id': model.id,
        'name': model.name,
        'description': model.description,
        'nodes': json.loads(model.nodes),
        'edges': json.loads(model.edges),
        'created_at': model.created_at.isoformat(),
        'updated_at': model.updated_at.isoformat(),
        'tags': model.tags.split(',') if model.tags else []
    } for model in models])

@bp.route('/models', methods=['POST'])
@login_required
def save_model():
    data = request.get_json()
    model = SavedModel(
        name=data.get('name', 'Untitled Pipeline'),
        description=data.get('description', ''),
        user_id=current_user.id,
        nodes=json.dumps(data.get('nodes', [])),
        edges=json.dumps(data.get('edges', []))
    )
    db.session.add(model)
    db.session.commit()
    return jsonify({'id': model.id, 'message': 'Model saved successfully'}), 201

@bp.route('/models/<int:model_id>', methods=['PUT'])
@login_required
def update_model(model_id):
    model = SavedModel.query.get_or_404(model_id)
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    model.name = data.get('name', model.name)
    model.description = data.get('description', model.description)
    model.nodes = json.dumps(data.get('nodes', []))
    model.edges = json.dumps(data.get('edges', []))
    db.session.commit()
    return jsonify({'message': 'Model updated successfully'})

@bp.route('/models/<int:model_id>', methods=['DELETE'])
@login_required
def delete_model(model_id):
    model = SavedModel.query.get_or_404(model_id)
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(model)
    db.session.commit()
    return jsonify({'message': 'Model deleted successfully'})

@bp.route('/templates', methods=['GET'])
def get_templates():
    # Load templates from data file
    from app.utils.data_loader import get_templates
    return jsonify(get_templates())

@bp.route('/components', methods=['GET'])
def get_components():
    # Load components from data file
    from app.utils.data_loader import get_components
    return jsonify(get_components())

@bp.route('/generate-code', methods=['POST'])
def generate_code():
    data = request.get_json()
    from app.utils.code_generator import generate_python_code
    code = generate_python_code(
        data.get('nodes', []),
        data.get('edges', []),
        data.get('name', 'ML Pipeline')
    )
    return jsonify({'code': code})
