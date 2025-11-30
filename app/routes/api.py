from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models import SavedModel, PipelineVersion, ModelMetric, VersionTag, VersionComment
import json
from datetime import datetime

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

@bp.route('/models/<int:model_id>', methods=['GET'])
@login_required
def get_model(model_id):
    model = SavedModel.query.get_or_404(model_id)
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify({
        'id': model.id,
        'name': model.name,
        'description': model.description,
        'nodes': json.loads(model.nodes),
        'edges': json.loads(model.edges),
        'created_at': model.created_at.isoformat(),
        'updated_at': model.updated_at.isoformat(),
        'tags': model.tags.split(',') if model.tags else []
    })

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

@bp.route('/validate', methods=['POST'])
def validate_pipeline():
    data = request.get_json()
    nodes = data.get('nodes', [])
    edges = data.get('edges', [])
    
    from app.utils.validation import validate_pipeline_structure, validate_hyperparameters
    from app.utils.data_loader import get_components
    
    # Structure validation
    errors, warnings = validate_pipeline_structure(nodes, edges)
    
    # Hyperparameter validation
    components = get_components()
    component_map = {c['id']: c for c in components}
    
    for node in nodes:
        comp_id = node.get('data', {}).get('componentId')
        if comp_id in component_map:
            node_errors = validate_hyperparameters(node, component_map[comp_id])
            errors.extend(node_errors)
            
    return jsonify({'errors': errors, 'warnings': warnings})


# ===== VERSION MANAGEMENT ENDPOINTS =====

@bp.route('/models/<int:model_id>/versions', methods=['POST'])
@login_required
def create_version(model_id):
    """Create a new version of a pipeline"""
    model = SavedModel.query.get_or_404(model_id)
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Get next version number
    last_version = PipelineVersion.query.filter_by(pipeline_id=model_id).order_by(PipelineVersion.version_number.desc()).first()
    next_version_number = (last_version.version_number + 1) if last_version else 1
    
    # Optionally generate code snapshot
    generated_code = None
    if data.get('generate_code', False):
        from app.utils.code_generator import generate_python_code
        generated_code = generate_python_code(
            data.get('nodes', []),
            data.get('edges', []),
            model.name
        )
    
    # Create version
    version = PipelineVersion(
        pipeline_id=model_id,
        version_number=next_version_number,
        version_tag=data.get('version_tag'),
        name=data.get('name', f'Version {next_version_number}'),
        description=data.get('description', ''),
        nodes=json.dumps(data.get('nodes', [])),
        edges=json.dumps(data.get('edges', [])),
        generated_code=generated_code,
        meta_data=json.dumps(data.get('metadata', {})),
        created_by=current_user.id,
        is_active=data.get('is_active', False),
        parent_version_id=data.get('parent_version_id')
    )
    
    # If this is set as active, deactivate others
    if version.is_active:
        PipelineVersion.query.filter_by(pipeline_id=model_id, is_active=True).update({'is_active': False})
    
    db.session.add(version)
    db.session.commit()
    
    return jsonify({
        'message': 'Version created successfully',
        'version': version.to_dict()
    }), 201


@bp.route('/models/<int:model_id>/versions', methods=['GET'])
@login_required
def list_versions(model_id):
    """List all versions of a pipeline"""
    model = SavedModel.query.get_or_404(model_id)
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    versions = PipelineVersion.query.filter_by(pipeline_id=model_id).order_by(PipelineVersion.version_number.desc()).all()
    return jsonify([v.to_dict() for v in versions])


@bp.route('/versions/<int:version_id>', methods=['GET'])
@login_required
def get_version(version_id):
    """Get a specific version"""
    version = PipelineVersion.query.get_or_404(version_id)
    model = SavedModel.query.get(version.pipeline_id)
    
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(version.to_dict())


@bp.route('/versions/<int:version_id>/activate', methods=['POST'])
@login_required
def activate_version(version_id):
    """Set a version as active"""
    version = PipelineVersion.query.get_or_404(version_id)
    model = SavedModel.query.get(version.pipeline_id)
    
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Deactivate all other versions
    PipelineVersion.query.filter_by(pipeline_id=version.pipeline_id, is_active=True).update({'is_active': False})
    
    # Activate this version
    version.is_active = True
    db.session.commit()
    
    return jsonify({'message': 'Version activated', 'version': version.to_dict()})


@bp.route('/versions/<int:version_id>', methods=['DELETE'])
@login_required
def delete_version(version_id):
    """Delete a version"""
    version = PipelineVersion.query.get_or_404(version_id)
    model = SavedModel.query.get(version.pipeline_id)
    
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Don't allow deleting active version
    if version.is_active:
        return jsonify({'error': 'Cannot delete active version'}), 400
    
    db.session.delete(version)
    db.session.commit()
    
    return jsonify({'message': 'Version deleted successfully'})


@bp.route('/versions/compare', methods=['POST'])
@login_required
def compare_versions():
    """Compare two versions"""
    data = request.get_json()
    version1_id = data.get('version1_id')
    version2_id = data.get('version2_id')
    
    version1 = PipelineVersion.query.get_or_404(version1_id)
    version2 = PipelineVersion.query.get_or_404(version2_id)
    
    # Check authorization
    model = SavedModel.query.get(version1.pipeline_id)
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Parse nodes and edges
    nodes1 = json.loads(version1.nodes) if version1.nodes else []
    nodes2 = json.loads(version2.nodes) if version2.nodes else []
    edges1 = json.loads(version1.edges) if version1.edges else []
    edges2 = json.loads(version2.edges) if version2.edges else []
    
    # Simple diff
    diff = {
        'version1': version1.to_dict(),
        'version2': version2.to_dict(),
        'changes': {
            'nodes_added': len(nodes2) - len(nodes1),
            'edges_added': len(edges2) - len(edges1),
            'total_nodes_v1': len(nodes1),
            'total_nodes_v2': len(nodes2),
            'total_edges_v1': len(edges1),
            'total_edges_v2': len(edges2)
        }
    }
    
    return jsonify(diff)


# ===== METRICS ENDPOINTS =====

@bp.route('/versions/<int:version_id>/metrics', methods=['POST'])
@login_required
def add_metrics(version_id):
    """Add metrics to a version"""
    version = PipelineVersion.query.get_or_404(version_id)
    model = SavedModel.query.get(version.pipeline_id)
    
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    metrics = data.get('metrics', [])
    
    created_metrics = []
    for metric_data in metrics:
        metric = ModelMetric(
            version_id=version_id,
            metric_name=metric_data.get('name'),
            metric_value=metric_data.get('value'),
            metric_type=metric_data.get('type', 'training'),
            epoch=metric_data.get('epoch'),
            meta_data=json.dumps(metric_data.get('metadata', {}))
        )
        db.session.add(metric)
        created_metrics.append(metric)
    
    db.session.commit()
    
    return jsonify({
        'message': f'{len(created_metrics)} metrics added',
        'metrics': [m.to_dict() for m in created_metrics]
    }), 201


@bp.route('/versions/<int:version_id>/metrics', methods=['GET'])
@login_required
def get_metrics(version_id):
    """Get all metrics for a version"""
    version = PipelineVersion.query.get_or_404(version_id)
    model = SavedModel.query.get(version.pipeline_id)
    
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    metrics = ModelMetric.query.filter_by(version_id=version_id).order_by(ModelMetric.created_at).all()
    return jsonify([m.to_dict() for m in metrics])


# ===== EXPORT ENDPOINTS (Phase 3) =====

@bp.route('/models/<int:model_id>/export/python', methods=['POST'])
@login_required
def export_python(model_id):
    """Export pipeline as Python script"""
    from app.utils.exporters.python_exporter import PythonExporter
    
    model = SavedModel.query.get_or_404(model_id)
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    nodes = json.loads(model.nodes)
    edges = json.loads(model.edges)
    
    result = PythonExporter.export_pipeline(
        nodes=nodes,
        edges=edges,
        pipeline_name=model.name,
        description=model.description,
        include_cli=True
    )
    
    return jsonify(result)


@bp.route('/models/<int:model_id>/export/notebook', methods=['POST'])
@login_required
def export_notebook(model_id):
    """Export pipeline as Jupyter notebook"""
    from app.utils.exporters.notebook_exporter import NotebookExporter
    
    model = SavedModel.query.get_or_404(model_id)
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    nodes = json.loads(model.nodes)
    edges = json.loads(model.edges)
    
    result = NotebookExporter.export_notebook(
        nodes=nodes,
        edges=edges,
        pipeline_name=model.name,
        description=model.description
    )
    
    return jsonify(result)


@bp.route('/models/<int:model_id>/export/docker', methods=['POST'])
@login_required
def export_docker(model_id):
    """Export pipeline as Docker container"""
    from app.utils.exporters.docker_exporter import DockerExporter
    
    model = SavedModel.query.get_or_404(model_id)
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json() or {}
    nodes = json.loads(model.nodes)
    edges = json.loads(model.edges)
    
    result = DockerExporter.export_docker(
        nodes=nodes,
        edges=edges,
        pipeline_name=model.name,
        description=model.description,
        python_version=data.get('python_version', '3.10')
    )
    
    return jsonify(result)


@bp.route('/models/<int:model_id>/export/requirements', methods=['POST'])
@login_required
def export_requirements(model_id):
    """Export pipeline requirements.txt"""
    from app.utils.exporters.requirements_builder import RequirementsBuilder
    
    model = SavedModel.query.get_or_404(model_id)
    if model.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    nodes = json.loads(model.nodes)
    
    requirements = RequirementsBuilder.from_nodes(nodes, pinned=True)
    
    return jsonify({
        'requirements': requirements,
        'filename': 'requirements.txt'
    })

