import json
import os

def get_components():
    """Load ML components from JSON file"""
    file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'ml_components.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        components = json.load(f)
        return {'components': components}

def get_templates():
    """Load ML templates from JSON file"""
    file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'ml_templates.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        templates = json.load(f)
        return {'templates': templates}
