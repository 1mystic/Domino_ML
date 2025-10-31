# Export Templates

This directory contains Jinja2 templates for exporting ML pipelines as runnable artifacts.

## Templates

### Python Script Template
`python_script.py.jinja` - Standalone Python script

### Jupyter Notebook Template  
`jupyter_notebook.ipynb.jinja` - Interactive Jupyter notebook

### Docker Template
`Dockerfile.jinja` - Containerized application

### Requirements Template
`requirements.txt.jinja` - Python dependencies

## Usage

These templates are used by the code generator to create different export formats from visual ML pipelines.

Templates have access to:
- `pipeline_name` - Name of the pipeline
- `description` - Pipeline description  
- `generated_code` - Generated Python code
- `components` - List of pipeline components
- `requirements` - Python package requirements
- `created_at` - Export timestamp
- `version` - Pipeline version (if available)
