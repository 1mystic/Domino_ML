# DominoML Feature Implementation Plan
**Target Completion:** 8-12 weeks  
**Status:** ✅ Phase 1-2 Complete | 🚧 Phase 3-7 In Progress  
**Last Updated:** October 31, 2025

## Completion Status

| Phase | Feature | Status | Completion Date |
|-------|---------|--------|----------------|
| 1 | Undo/Redo System | ✅ Complete | Oct 31, 2025 |
| 2 | Pipeline Versioning | ✅ Complete | Oct 31, 2025 |
| 3 | Export Artifacts | ✅ Complete | Nov 9, 2025 |
| 4 | Sandbox Runner | ⏳ Pending | - |
| 5 | Experiment Tracking | ⏳ Pending | - |
| 6 | Hyperparameter Tuning | ⏳ Pending | - |
| 7 | Explainability | ⏳ Pending | - |
| 8 | Real-time Collaboration | ⏳ Pending | - |

## Table of Contents
1. [Phase 1: Undo/Redo System](#phase-1-undoredo-system)
2. [Phase 2: Pipeline Versioning](#phase-2-pipeline-versioning)
3. [Phase 3: Export Artifacts](#phase-3-export-artifacts)
4. [Phase 4: Sandbox Runner](#phase-4-sandbox-runner)
5. [Phase 5: Experiment Tracking](#phase-5-experiment-tracking)
6. [Phase 6: Hyperparameter Tuning](#phase-6-hyperparameter-tuning)
7. [Phase 7: Explainability](#phase-7-explainability)
8. [Phase 8: Real-time Collaboration](#phase-8-real-time-collaboration)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Checklist](#deployment-checklist)

---

## Phase 1: Undo/Redo System ✅
**Duration:** 2-3 days  
**Priority:** High  
**Dependencies:** None  
**Status:** ✅ **COMPLETED** - Oct 31, 2025

### Technical Design
- **Approach:** Command pattern with immutable snapshots
- **Storage:** In-memory circular buffer (max 50 actions) + optional localStorage persistence
- **Actions to track:** 
  - `ADD_NODE`, `DELETE_NODE`, `MOVE_NODE`, `UPDATE_NODE_PARAMS`
  - `ADD_EDGE`, `DELETE_EDGE`
  - `LOAD_TEMPLATE`, `IMPORT_MODEL`

### Implementation Steps

#### 1.1 Create History Manager (JS)
**File:** `app/static/js/history.js`
```javascript
// Singleton history manager
class HistoryManager {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.maxSize = 50;
    this.currentState = null;
  }

  // Record state snapshot
  recordState(state, action) { }
  
  // Undo last action
  undo() { }
  
  // Redo last undone action
  redo() { }
  
  // Clear all history
  clear() { }
  
  // Persist to localStorage
  persist() { }
  
  // Restore from localStorage
  restore() { }
}
```

#### 1.2 Integrate into Canvas
**File:** `app/static/js/canvas.js`
- Import history manager
- Record state after every mutation
- Add keyboard shortcuts (Ctrl+Z, Ctrl+Y, Cmd+Z, Cmd+Shift+Z)
- Add UI buttons in toolbar

#### 1.3 UI Components
**File:** `app/templates/builder.html`
- Add undo/redo buttons to toolbar
- Show disabled state when stacks are empty
- Optional: Show history panel with action list

#### 1.4 Testing
- [x] Undo/redo node addition
- [x] Undo/redo node deletion
- [x] Undo/redo edge creation/deletion
- [x] Undo/redo parameter changes
- [x] Keyboard shortcuts work
- [x] State persists across page refresh

**Acceptance Criteria:**
✅ User can undo/redo any canvas operation  
✅ Keyboard shortcuts functional  
✅ History persists in session  
✅ UI shows enabled/disabled state correctly

### Implementation Summary
**Files Created:**
- `app/static/js/history.js` - Complete history manager with 50-action stacks
- Updated `app/templates/builder.html` - Added undo/redo toolbar buttons
- Updated `app/static/js/canvas.js` - Integrated history recording at all mutation points

**Features Implemented:**
- ✅ HistoryManager class with undo/redo stacks
- ✅ Batch operation support
- ✅ localStorage persistence (last 10 actions)
- ✅ Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- ✅ Dynamic toolbar button states
- ✅ Action formatting and tooltips

---

## Phase 2: Pipeline Versioning & Model Registry ✅
**Duration:** 4-5 days  
**Priority:** High  
**Dependencies:** None  
**Status:** ✅ **COMPLETED** - Oct 31, 2025

### Database Schema

#### 2.1 Create Migration
**File:** `migrations/add_versioning.py`

```sql
-- New table: pipeline_versions
CREATE TABLE pipeline_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    name VARCHAR(200),
    description TEXT,
    nodes TEXT NOT NULL,
    edges TEXT NOT NULL,
    generated_code TEXT,
    metadata TEXT, -- JSON: {author, commit_message, metrics, dataset_info}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    is_active BOOLEAN DEFAULT 0,
    FOREIGN KEY (pipeline_id) REFERENCES saved_models(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE(pipeline_id, version_number)
);

-- Index for performance
CREATE INDEX idx_pipeline_versions_pipeline ON pipeline_versions(pipeline_id);
CREATE INDEX idx_pipeline_versions_active ON pipeline_versions(is_active);

-- New table: model_metrics (optional, for experiment tracking)
CREATE TABLE model_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL,
    metric_name VARCHAR(100),
    metric_value FLOAT,
    FOREIGN KEY (version_id) REFERENCES pipeline_versions(id) ON DELETE CASCADE
);
```

#### 2.2 Create Models
**File:** `app/models.py`

```python
class PipelineVersion(db.Model):
    __tablename__ = 'pipeline_versions'
    
    id = db.Column(db.Integer, primary_key=True)
    pipeline_id = db.Column(db.Integer, db.ForeignKey('saved_models.id'), nullable=False)
    version_number = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(200))
    description = db.Column(db.Text)
    nodes = db.Column(db.Text, nullable=False)
    edges = db.Column(db.Text, nullable=False)
    generated_code = db.Column(db.Text)
    metadata = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    is_active = db.Column(db.Boolean, default=False)
    
    # Relationships
    pipeline = db.relationship('SavedModel', backref='versions')
    creator = db.relationship('User')
    
    def to_dict(self):
        return {
            'id': self.id,
            'version_number': self.version_number,
            'name': self.name,
            'description': self.description,
            'nodes': json.loads(self.nodes),
            'edges': json.loads(self.edges),
            'metadata': json.loads(self.metadata) if self.metadata else {},
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }
```

#### 2.3 API Endpoints
**File:** `app/routes/api.py`

```python
@bp.route('/models/<int:model_id>/versions', methods=['GET'])
@login_required
def get_versions(model_id):
    """Get all versions for a pipeline"""
    pass

@bp.route('/models/<int:model_id>/versions', methods=['POST'])
@login_required
def create_version(model_id):
    """Create a new version"""
    pass

@bp.route('/models/<int:model_id>/versions/<int:version_id>', methods=['GET'])
@login_required
def get_version(model_id, version_id):
    """Get specific version"""
    pass

@bp.route('/models/<int:model_id>/versions/<int:version_id>/activate', methods=['POST'])
@login_required
def activate_version(model_id, version_id):
    """Set version as active"""
    pass

@bp.route('/models/<int:model_id>/versions/diff', methods=['POST'])
@login_required
def diff_versions(model_id):
    """Compare two versions (JSON diff)"""
    pass
```

#### 2.4 Frontend UI
**File:** `app/templates/builder.html`

Add version panel:
```html
<!-- Version History Panel (collapsible sidebar) -->
<div id="version-panel" class="version-panel" hidden>
    <div class="version-header">
        <h3>Version History</h3>
        <button id="create-version-btn" class="btn btn-primary btn-sm">
            <i data-lucide="git-commit"></i> Save Version
        </button>
    </div>
    <div id="version-list" class="version-list"></div>
</div>

<!-- Create Version Dialog -->
<div id="create-version-dialog" class="dialog-overlay" hidden>
    <div class="dialog">
        <div class="dialog-header">
            <h3>Create New Version</h3>
            <button class="dialog-close" data-close-dialog="create-version-dialog">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="dialog-content">
            <div class="form-group">
                <label for="version-name">Version Name</label>
                <input type="text" id="version-name" class="form-input" 
                       placeholder="e.g., v1.0 - Initial model">
            </div>
            <div class="form-group">
                <label for="version-description">Description</label>
                <textarea id="version-description" class="form-textarea" rows="3"
                          placeholder="What changed in this version?"></textarea>
            </div>
        </div>
        <div class="dialog-footer">
            <button class="btn btn-ghost" data-close-dialog="create-version-dialog">Cancel</button>
            <button id="confirm-version-btn" class="btn btn-primary">Create Version</button>
        </div>
    </div>
</div>
```

#### 2.5 JavaScript Integration
**File:** `app/static/js/canvas.js`

Add version management functions:
```javascript
// Load version history
async function loadVersionHistory() { }

// Create new version
async function createVersion(name, description) { }

// Restore version
async function restoreVersion(versionId) { }

// Compare versions
async function compareVersions(v1, v2) { }
```

**Acceptance Criteria:**
✅ User can save pipeline as a version with name/description  
✅ Version list shows all saved versions  
✅ User can restore any version  
✅ Active version is marked clearly  
✅ Version diff shows changes (nodes added/removed/modified)

### Implementation Summary
**Database:**
- Created 4 new tables: `pipeline_versions`, `model_metrics`, `version_tags`, `version_comments`
- Applied migration: `migrations/applied/2025-10-31_add_versioning.sql`
- Fixed SQLAlchemy reserved keyword conflict (metadata → meta_data)

**Backend (app/models.py):**
- ✅ PipelineVersion model with parent-child lineage
- ✅ ModelMetric model for experiment tracking
- ✅ VersionTag model for release management
- ✅ VersionComment model for collaboration
- ✅ to_dict() serialization methods

**API Endpoints (app/routes/api.py):**
- ✅ POST `/api/models/<id>/versions` - Create version
- ✅ GET `/api/models/<id>/versions` - List versions
- ✅ GET `/api/versions/<id>` - Get version
- ✅ POST `/api/versions/<id>/activate` - Activate version
- ✅ DELETE `/api/versions/<id>` - Delete version
- ✅ POST `/api/versions/compare` - Compare versions
- ✅ POST `/api/versions/<id>/metrics` - Add metrics
- ✅ GET `/api/versions/<id>/metrics` - Get metrics

**Frontend:**
- ✅ `app/static/js/versions.js` - Complete version management UI
- ✅ `app/static/js/api.js` - Added versionsAPI with credentials support
- ✅ Updated `app/templates/builder.html` - Version dialog and timeline
- ✅ Version creation with name/description/tags
- ✅ Version loading and activation
- ✅ Version deletion with safety checks

**Features Implemented:**
- ✅ Full CRUD operations for versions
- ✅ Parent-child version lineage tracking
- ✅ Active version management (only one active per pipeline)
- ✅ Code snapshot generation and storage
- ✅ Metric tracking infrastructure
- ✅ Tag and comment systems (ready for Phase 5)

---

## Phase 3: Export Runnable Artifacts
**Duration:** 2-3 days  
**Priority:** High  
**Dependencies:** Code generator improvements  
**Status:** ⏳ **NEXT IN QUEUE**

### Templates to Create

#### 3.1 Python Script Template
**File:** `app/templates/export/python_script.py.jinja`

```python
#!/usr/bin/env python3
"""
{{ pipeline_name }}
Generated by DominoML
Created: {{ created_at }}
"""

# Requirements:
{{ requirements }}

{{ generated_code }}

if __name__ == "__main__":
    run_ml_pipeline()
```

#### 3.2 Jupyter Notebook Template
**File:** `app/templates/export/notebook.ipynb.jinja`

Create cells programmatically with metadata.

#### 3.3 Dockerfile Template
**File:** `app/templates/export/Dockerfile.jinja`

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy pipeline code
COPY pipeline.py .
COPY data/ ./data/

# Run pipeline
CMD ["python", "pipeline.py"]
```

#### 3.4 Docker Compose Template
**File:** `app/templates/export/docker-compose.yml.jinja`

```yaml
version: '3.8'
services:
  ml-pipeline:
    build: .
    volumes:
      - ./data:/app/data
      - ./output:/app/output
    environment:
      - PIPELINE_NAME={{ pipeline_name }}
```

#### 3.5 Export Generator Utility
**File:** `app/utils/export_generator.py`

```python
import os
import zipfile
from jinja2 import Template
from datetime import datetime

class ExportGenerator:
    def __init__(self, pipeline, user):
        self.pipeline = pipeline
        self.user = user
        
    def generate_requirements(self):
        """Generate requirements.txt from components"""
        pass
        
    def generate_python_script(self):
        """Generate standalone Python script"""
        pass
        
    def generate_notebook(self):
        """Generate Jupyter notebook"""
        pass
        
    def generate_dockerfile(self):
        """Generate Dockerfile"""
        pass
        
    def create_export_archive(self, export_type='all'):
        """Create ZIP archive with all artifacts"""
        pass
```

#### 3.6 API Endpoint
**File:** `app/routes/api.py`

```python
@bp.route('/export/<export_type>', methods=['POST'])
@login_required
def export_pipeline(export_type):
    """
    Export pipeline as various artifacts
    export_type: 'script', 'notebook', 'docker', 'all'
    """
    data = request.get_json()
    generator = ExportGenerator(data, current_user)
    
    if export_type == 'all':
        # Create ZIP with all artifacts
        zip_path = generator.create_export_archive()
        return send_file(zip_path, as_attachment=True)
    # ... handle other types
```

#### 3.7 Frontend Integration
**File:** `app/static/js/canvas.js`

```javascript
async function exportAsDocker() {
    const pipeline = { nodes: state.nodes, edges: state.edges };
    const response = await fetch('/api/export/docker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pipeline)
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.currentModelName || 'pipeline'}-docker.zip`;
    a.click();
}
```

**Acceptance Criteria:**
✅ Export Python script runs standalone  
✅ Export Jupyter notebook runs in Colab/local  
✅ Export Docker builds and runs successfully  
✅ requirements.txt includes all dependencies  
✅ README.md included with run instructions

---

## Phase 4: Sandbox Runner (Local Execution)
**Duration:** 5-7 days  
**Priority:** Critical  
**Dependencies:** Redis, Docker, RQ

### Architecture
```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Flask     │─────▶│   Redis      │◀─────│   RQ Worker     │
│   (API)     │      │  (Queue)     │      │  (Docker Exec)  │
└─────────────┘      └──────────────┘      └─────────────────┘
       │                                             │
       │                                             │
       ▼                                             ▼
  ┌─────────────────────────────────────────────────────┐
  │          Local File System (Artifacts)              │
  └─────────────────────────────────────────────────────┘
```

### Implementation Steps

#### 4.1 Install Dependencies
**File:** `requirements.txt`

Add:
```
redis==5.0.1
rq==1.15.1
docker==7.0.0
```

#### 4.2 Create Runner Worker
**File:** `app/workers/pipeline_runner.py`

```python
import docker
import json
import os
from datetime import datetime
from app import db
from app.models import PipelineRun

class PipelineRunner:
    def __init__(self, run_id, pipeline_data, dataset_path=None):
        self.run_id = run_id
        self.pipeline_data = pipeline_data
        self.dataset_path = dataset_path
        self.docker_client = docker.from_env()
        
    def prepare_workspace(self):
        """Create temp workspace with pipeline code and data"""
        pass
        
    def build_docker_image(self):
        """Build Docker image for pipeline"""
        pass
        
    def execute_pipeline(self):
        """Run pipeline in Docker container"""
        pass
        
    def capture_logs(self):
        """Capture stdout/stderr from container"""
        pass
        
    def extract_metrics(self):
        """Parse metrics from output"""
        pass
        
    def save_artifacts(self):
        """Save model files, plots, etc."""
        pass
        
    def cleanup(self):
        """Remove temp files and containers"""
        pass
        
    def run(self):
        """Main execution flow"""
        try:
            self.prepare_workspace()
            self.build_docker_image()
            self.execute_pipeline()
            logs = self.capture_logs()
            metrics = self.extract_metrics()
            self.save_artifacts()
            return {'status': 'success', 'logs': logs, 'metrics': metrics}
        except Exception as e:
            return {'status': 'failed', 'error': str(e)}
        finally:
            self.cleanup()
```

#### 4.3 Create RQ Tasks
**File:** `app/tasks/pipeline_tasks.py`

```python
from rq import get_current_job
from app.workers.pipeline_runner import PipelineRunner

def run_pipeline_task(run_id, pipeline_data, dataset_path=None):
    """Background task for pipeline execution"""
    job = get_current_job()
    
    runner = PipelineRunner(run_id, pipeline_data, dataset_path)
    result = runner.run()
    
    # Update database
    from app import db
    from app.models import PipelineRun
    run = PipelineRun.query.get(run_id)
    run.status = result['status']
    run.logs = result.get('logs', '')
    run.metrics = json.dumps(result.get('metrics', {}))
    run.completed_at = datetime.utcnow()
    db.session.commit()
    
    return result
```

#### 4.4 Database Model for Runs
**File:** `app/models.py`

```python
class PipelineRun(db.Model):
    __tablename__ = 'pipeline_runs'
    
    id = db.Column(db.Integer, primary_key=True)
    pipeline_id = db.Column(db.Integer, db.ForeignKey('saved_models.id'))
    version_id = db.Column(db.Integer, db.ForeignKey('pipeline_versions.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    status = db.Column(db.String(20))  # pending, running, success, failed
    dataset_name = db.Column(db.String(200))
    
    logs = db.Column(db.Text)
    metrics = db.Column(db.Text)  # JSON
    artifacts_path = db.Column(db.String(500))
    
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Relationships
    pipeline = db.relationship('SavedModel')
    version = db.relationship('PipelineVersion')
    user = db.relationship('User')
```

#### 4.5 API Endpoints
**File:** `app/routes/api.py`

```python
from redis import Redis
from rq import Queue

redis_conn = Redis()
queue = Queue(connection=redis_conn)

@bp.route('/runs', methods=['POST'])
@login_required
def create_run():
    """Queue a new pipeline run"""
    data = request.get_json()
    
    # Create run record
    run = PipelineRun(
        pipeline_id=data.get('pipeline_id'),
        user_id=current_user.id,
        status='pending'
    )
    db.session.add(run)
    db.session.commit()
    
    # Queue task
    job = queue.enqueue(
        'app.tasks.pipeline_tasks.run_pipeline_task',
        run.id,
        data.get('pipeline'),
        data.get('dataset_path'),
        timeout='10m'
    )
    
    return jsonify({'run_id': run.id, 'job_id': job.id}), 201

@bp.route('/runs/<int:run_id>', methods=['GET'])
@login_required
def get_run(run_id):
    """Get run status and results"""
    pass

@bp.route('/runs', methods=['GET'])
@login_required
def list_runs():
    """List all runs for current user"""
    pass
```

#### 4.6 Frontend UI
**File:** `app/templates/builder.html`

Add run panel and status display:
```html
<!-- Run Pipeline Dialog -->
<div id="run-dialog" class="dialog-overlay" hidden>
    <div class="dialog">
        <div class="dialog-header">
            <h3>Run Pipeline</h3>
            <button class="dialog-close" data-close-dialog="run-dialog">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="dialog-content">
            <div class="form-group">
                <label>Select Dataset</label>
                <select id="run-dataset-select" class="form-input">
                    <option value="iris">Iris (demo)</option>
                    <option value="titanic">Titanic (demo)</option>
                    <option value="custom">Upload Custom...</option>
                </select>
            </div>
            <div id="run-progress" class="run-progress" hidden>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p class="progress-text">Running pipeline...</p>
            </div>
        </div>
        <div class="dialog-footer">
            <button class="btn btn-ghost" data-close-dialog="run-dialog">Cancel</button>
            <button id="confirm-run-btn" class="btn btn-primary">
                <i data-lucide="play"></i> Run
            </button>
        </div>
    </div>
</div>

<!-- Run Results Dialog -->
<div id="run-results-dialog" class="dialog-overlay" hidden>
    <div class="dialog dialog-wide">
        <div class="dialog-header">
            <h3>Run Results</h3>
            <button class="dialog-close" data-close-dialog="run-results-dialog">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="dialog-content">
            <div id="run-metrics"></div>
            <div id="run-logs-container">
                <h4>Logs</h4>
                <pre id="run-logs" class="code-block"></pre>
            </div>
        </div>
        <div class="dialog-footer">
            <button class="btn btn-ghost" data-close-dialog="run-results-dialog">Close</button>
        </div>
    </div>
</div>
```

#### 4.7 Setup Instructions
**File:** `docs/SANDBOX_SETUP.md`

```markdown
# Sandbox Runner Setup

## Prerequisites
- Docker Desktop installed and running
- Redis installed (or use Docker)

## Quick Start

### 1. Start Redis (Docker)
```bash
docker run -d -p 6379:6379 redis:latest
```

### 2. Start RQ Worker
```bash
python -m rq worker --with-scheduler
```

### 3. Run Flask App
```bash
python run.py
```

## Testing
Run demo pipeline from UI and check worker logs.
```

**Acceptance Criteria:**
✅ Pipeline executes in isolated Docker container  
✅ Logs captured and displayed in UI  
✅ Metrics extracted and shown  
✅ Run status updates in real-time  
✅ Failed runs show error messages  
✅ Multiple runs can queue and execute

---

## Testing Strategy

### Unit Tests
**File:** `tests/test_validator.py`
**File:** `tests/test_code_generator.py`
**File:** `tests/test_export_generator.py`

### Integration Tests
**File:** `tests/test_api.py`
**File:** `tests/test_pipeline_runner.py`

### End-to-End Tests
**File:** `tests/e2e/test_full_workflow.py`

Run with:
```bash
pytest tests/ -v --cov=app
```

---

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Redis running
- [ ] Docker available
- [ ] RQ worker running

### Post-deployment
- [ ] Health check endpoint responding
- [ ] Can create/save pipeline
- [ ] Can run pipeline successfully
- [ ] Logs accessible
- [ ] Metrics displayed correctly

---

## Timeline & Milestones

### Week 1-2: Foundation
- [x] Undo/Redo system
- [x] Pipeline versioning (DB + API)
- [ ] Unit tests for core features

### Week 3-4: Export & Execution
- [ ] Export artifacts (script, notebook, Docker)
- [ ] Sandbox runner setup
- [ ] Demo datasets integration

### Week 5-6: MLOps Features
- [ ] Experiment tracking
- [ ] Hyperparameter tuning
- [ ] SHAP explainability

### Week 7-8: Polish & Testing
- [ ] CI/CD setup
- [ ] End-to-end tests
- [ ] Documentation
- [ ] Demo video

---

## Next Steps

1. **Start with Phase 1 (Undo/Redo)** - lowest risk, high value
2. **Then Phase 2 (Versioning)** - database work, critical for other features
3. **Then Phase 4 (Sandbox)** - most complex, needs early testing
4. **Then Phase 3 (Export)** - builds on sandbox work
5. **Finally Phases 5-7** - MLOps features

Run `python scripts/init_features.py` to scaffold files for Phase 1.
