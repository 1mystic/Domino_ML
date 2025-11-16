# Phase 3: Export Runnable Artifacts - Implementation Guide

**Status:** 📋 Ready to implement  
**Priority:** High  
**Estimated Duration:** 2-3 days

## Overview

Extend the code generator to export ML pipelines as production-ready artifacts including standalone Python scripts, Jupyter notebooks, Docker containers, and requirements files.

## Directory Structure Created

```
app/
├── templates/
│   └── export/
│       ├── README.md ✅
│       ├── python_script.py.jinja (to create)
│       ├── jupyter_notebook.ipynb.jinja (to create)
│       ├── Dockerfile.jinja (to create)
│       └── requirements.txt.jinja (to create)
└── utils/
    └── exporters/
        ├── __init__.py ✅
        ├── README.md ✅
        ├── python_exporter.py (to create)
        ├── notebook_exporter.py (to create)
        ├── docker_exporter.py (to create)
        └── requirements_builder.py (to create)
```

## Implementation Tasks

### Task 1: Python Script Exporter
**File:** `app/utils/exporters/python_exporter.py`

Create exporter class that:
- Uses existing code generator as base
- Wraps code in proper structure (imports, main function, CLI args)
- Adds error handling and logging
- Makes script executable with shebang

### Task 2: Jupyter Notebook Exporter  
**File:** `app/utils/exporters/notebook_exporter.py`

Create exporter that:
- Generates valid .ipynb JSON structure
- Splits pipeline into logical cells
- Adds markdown documentation cells
- Includes visualization cells for outputs

### Task 3: Docker Exporter
**File:** `app/utils/exporters/docker_exporter.py`

Create exporter that:
- Generates Dockerfile with proper base image
- Installs all dependencies
- Copies generated code
- Sets up entry point
- Optionally includes docker-compose.yml

### Task 4: Requirements Builder
**File:** `app/utils/exporters/requirements_builder.py`

Create utility that:
- Analyzes pipeline components
- Maps components to Python packages
- Generates requirements.txt with pinned versions
- Handles optional dependencies

### Task 5: API Endpoints
**File:** `app/routes/api.py`

Add endpoints:
```python
@bp.route('/models/<int:model_id>/export/<format>', methods=['POST'])
def export_model(model_id, format):
    # format: 'python', 'notebook', 'docker', 'requirements'
    pass
```

### Task 6: Frontend Integration
**File:** `app/static/js/canvas.js`

Add export buttons and dialogs:
- Export menu in toolbar
- Format selection dialog
- Download handling
- Export configuration options

## Dependencies Needed

Add to `requirements.txt`:
```
nbformat>=5.9.0  # For Jupyter notebook generation
```

## Testing Checklist

- [ ] Python script exports and runs independently
- [ ] Jupyter notebook opens in JupyterLab/Notebook
- [ ] Docker image builds successfully
- [ ] Requirements.txt installs all needed packages
- [ ] All export formats work for different pipeline types
- [ ] Large pipelines export without errors
- [ ] Export preserves all component configurations

## Success Criteria

✅ User can export pipeline as Python script  
✅ User can export pipeline as Jupyter notebook  
✅ User can export pipeline as Docker container  
✅ Requirements.txt generated correctly  
✅ All formats are production-ready and executable  
✅ Export preserves full pipeline functionality

## Next Steps

1. Review existing code generator (`app/utils/code_generator.py`)
2. Implement requirements builder first (needed by all exporters)
3. Implement Python exporter (simplest format)
4. Implement notebook exporter
5. Implement Docker exporter (most complex)
6. Add API endpoints
7. Create frontend UI
8. Test all formats
9. Update documentation
