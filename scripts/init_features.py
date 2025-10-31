#!/usr/bin/env python3
"""
Feature Scaffolding Script
Generates boilerplate files for new features
"""

import os
import sys
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent
APP_DIR = BASE_DIR / 'app'

def create_file_with_content(path, content):
    """Create file and parent directories if needed"""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    
    if path.exists():
        response = input(f"{path} already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print(f"Skipped {path}")
            return
    
    path.write_text(content)
    print(f"✓ Created {path}")

def scaffold_phase1_undoredo():
    """Create files for Phase 1: Undo/Redo system"""
    print("\n📦 Scaffolding Phase 1: Undo/Redo System\n")
    
    # 1. History Manager JS
    history_js = '''// History Manager - Undo/Redo system for canvas operations
(function() {
    class HistoryManager {
        constructor(maxSize = 50) {
            this.undoStack = [];
            this.redoStack = [];
            this.maxSize = maxSize;
            this.enabled = true;
        }

        /**
         * Record a state snapshot
         * @param {Object} state - Current canvas state {nodes, edges}
         * @param {String} action - Action type (e.g., 'ADD_NODE', 'DELETE_EDGE')
         * @param {Object} metadata - Additional context
         */
        recordState(state, action, metadata = {}) {
            if (!this.enabled) return;

            const snapshot = {
                state: JSON.parse(JSON.stringify(state)), // Deep clone
                action,
                metadata,
                timestamp: Date.now()
            };

            this.undoStack.push(snapshot);
            this.redoStack = []; // Clear redo stack on new action

            // Limit stack size
            if (this.undoStack.length > this.maxSize) {
                this.undoStack.shift();
            }

            this.updateUI();
            this.persist();
        }

        /**
         * Undo last action
         * @returns {Object|null} Previous state or null
         */
        undo() {
            if (this.undoStack.length === 0) return null;

            const current = this.undoStack.pop();
            this.redoStack.push(current);

            const previous = this.undoStack[this.undoStack.length - 1];
            
            this.updateUI();
            this.persist();

            return previous ? previous.state : null;
        }

        /**
         * Redo last undone action
         * @returns {Object|null} Next state or null
         */
        redo() {
            if (this.redoStack.length === 0) return null;

            const next = this.redoStack.pop();
            this.undoStack.push(next);

            this.updateUI();
            this.persist();

            return next.state;
        }

        /**
         * Clear all history
         */
        clear() {
            this.undoStack = [];
            this.redoStack = [];
            this.updateUI();
            this.persist();
        }

        /**
         * Check if undo is available
         */
        canUndo() {
            return this.undoStack.length > 1; // Need at least 2 states
        }

        /**
         * Check if redo is available
         */
        canRedo() {
            return this.redoStack.length > 0;
        }

        /**
         * Update UI buttons state
         */
        updateUI() {
            const undoBtn = document.getElementById('undo-btn');
            const redoBtn = document.getElementById('redo-btn');

            if (undoBtn) {
                undoBtn.disabled = !this.canUndo();
                undoBtn.title = this.canUndo() 
                    ? `Undo (${this.undoStack[this.undoStack.length - 1]?.action})`
                    : 'Nothing to undo';
            }

            if (redoBtn) {
                redoBtn.disabled = !this.canRedo();
                redoBtn.title = this.canRedo() 
                    ? `Redo (${this.redoStack[this.redoStack.length - 1]?.action})`
                    : 'Nothing to redo';
            }
        }

        /**
         * Persist to localStorage
         */
        persist() {
            try {
                const data = {
                    undoStack: this.undoStack.slice(-10), // Only last 10
                    redoStack: this.redoStack.slice(-10)
                };
                localStorage.setItem('canvas_history', JSON.stringify(data));
            } catch (e) {
                console.warn('Failed to persist history:', e);
            }
        }

        /**
         * Restore from localStorage
         */
        restore() {
            try {
                const data = localStorage.getItem('canvas_history');
                if (data) {
                    const parsed = JSON.parse(data);
                    this.undoStack = parsed.undoStack || [];
                    this.redoStack = parsed.redoStack || [];
                    this.updateUI();
                    return true;
                }
            } catch (e) {
                console.warn('Failed to restore history:', e);
            }
            return false;
        }

        /**
         * Get action history for debugging
         */
        getHistory() {
            return {
                undo: this.undoStack.map(s => ({
                    action: s.action,
                    timestamp: new Date(s.timestamp).toISOString()
                })),
                redo: this.redoStack.map(s => ({
                    action: s.action,
                    timestamp: new Date(s.timestamp).toISOString()
                }))
            };
        }

        /**
         * Temporarily disable recording (for batch operations)
         */
        pause() {
            this.enabled = false;
        }

        /**
         * Resume recording
         */
        resume() {
            this.enabled = true;
        }
    }

    // Export singleton instance
    window.historyManager = new HistoryManager();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Z or Cmd+Z
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (window.canvasUndo) window.canvasUndo();
        }
        
        // Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y
        if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
            (e.ctrlKey && e.key === 'y')) {
            e.preventDefault();
            if (window.canvasRedo) window.canvasRedo();
        }
    });
})();
'''
    
    create_file_with_content(
        APP_DIR / 'static' / 'js' / 'history.js',
        history_js
    )
    
    # 2. Update builder.html template
    print("\n⚠️  Manual step required:")
    print("   Add to app/templates/builder.html in toolbar:")
    print("""
    <div class="toolbar-divider"></div>
    
    <button id="undo-btn" class="btn btn-ghost btn-sm" title="Undo" disabled>
        <i data-lucide="undo"></i>
        <span class="hide-mobile">Undo</span>
    </button>
    
    <button id="redo-btn" class="btn btn-ghost btn-sm" title="Redo" disabled>
        <i data-lucide="redo"></i>
        <span class="hide-mobile">Redo</span>
    </button>
    """)
    
    print("\n   Add before </body>:")
    print("""
    <script src="{{ url_for('static', filename='js/history.js') }}"></script>
    """)
    
    # 3. Canvas integration patch
    canvas_patch = '''
// Add to canvas.js after state declaration:

// Initialize history on first state
function initializeHistory() {
    if (!state.historyInitialized) {
        window.historyManager.recordState(
            { nodes: state.nodes, edges: state.edges },
            'INIT',
            { timestamp: Date.now() }
        );
        state.historyInitialized = true;
    }
}

// Record state after mutations
function recordHistory(action, metadata = {}) {
    window.historyManager.recordState(
        { nodes: state.nodes, edges: state.edges },
        action,
        metadata
    );
}

// Undo function
window.canvasUndo = function() {
    const previousState = window.historyManager.undo();
    if (previousState) {
        state.nodes = previousState.nodes;
        state.edges = previousState.edges;
        render();
        selectNode(null);
        window.showToast('Undo successful', 'success');
    }
};

// Redo function
window.canvasRedo = function() {
    const nextState = window.historyManager.redo();
    if (nextState) {
        state.nodes = nextState.nodes;
        state.edges = nextState.edges;
        render();
        selectNode(null);
        window.showToast('Redo successful', 'success');
    }
};

// Add recordHistory calls after each mutation:
// - After addNode(): recordHistory('ADD_NODE', {nodeId: node.id})
// - After deleteNode(): recordHistory('DELETE_NODE', {nodeId})
// - After edge creation: recordHistory('ADD_EDGE', {edgeId})
// - After edge deletion: recordHistory('DELETE_EDGE', {edgeId})
// - After parameter update: recordHistory('UPDATE_PARAMS', {nodeId, params})
// - After loadTemplate: recordHistory('LOAD_TEMPLATE', {templateId})

// Wire up buttons
document.getElementById('undo-btn')?.addEventListener('click', window.canvasUndo);
document.getElementById('redo-btn')?.addEventListener('click', window.canvasRedo);
'''
    
    create_file_with_content(
        BASE_DIR / 'docs' / 'phase1_canvas_patch.txt',
        canvas_patch
    )
    
    print("\n✅ Phase 1 scaffolding complete!")
    print("   Next steps:")
    print("   1. Add toolbar buttons to builder.html")
    print("   2. Include history.js script")
    print("   3. Apply canvas.js patches (see docs/phase1_canvas_patch.txt)")
    print("   4. Test undo/redo functionality")

def scaffold_phase2_versioning():
    """Create files for Phase 2: Versioning"""
    print("\n📦 Scaffolding Phase 2: Pipeline Versioning\n")
    
    # Migration SQL
    migration_sql = '''-- Migration: Add pipeline versioning tables
-- Run with: flask db upgrade (if using Flask-Migrate)
-- Or manually execute in SQLite

CREATE TABLE IF NOT EXISTS pipeline_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    name VARCHAR(200),
    description TEXT,
    nodes TEXT NOT NULL,
    edges TEXT NOT NULL,
    generated_code TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    is_active BOOLEAN DEFAULT 0,
    FOREIGN KEY (pipeline_id) REFERENCES saved_models(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE(pipeline_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_pipeline_versions_pipeline ON pipeline_versions(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_versions_active ON pipeline_versions(is_active);

-- Optional: Metrics table
CREATE TABLE IF NOT EXISTS model_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (version_id) REFERENCES pipeline_versions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_model_metrics_version ON model_metrics(version_id);
'''
    
    create_file_with_content(
        BASE_DIR / 'migrations' / 'add_versioning.sql',
        migration_sql
    )
    
    # Model additions
    model_additions = '''
# Add to app/models.py

class PipelineVersion(db.Model):
    """Pipeline version tracking"""
    __tablename__ = 'pipeline_versions'
    
    id = db.Column(db.Integer, primary_key=True)
    pipeline_id = db.Column(db.Integer, db.ForeignKey('saved_models.id'), nullable=False)
    version_number = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(200))
    description = db.Column(db.Text)
    nodes = db.Column(db.Text, nullable=False)
    edges = db.Column(db.Text, nullable=False)
    generated_code = db.Column(db.Text)
    metadata = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    is_active = db.Column(db.Boolean, default=False)
    
    # Relationships
    pipeline = db.relationship('SavedModel', backref=db.backref('versions', lazy='dynamic'))
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
            'is_active': self.is_active,
            'created_by': self.created_by
        }
'''
    
    create_file_with_content(
        BASE_DIR / 'docs' / 'phase2_model_additions.txt',
        model_additions
    )
    
    print("\n✅ Phase 2 scaffolding complete!")
    print("   Next steps:")
    print("   1. Run migration: sqlite3 app.db < migrations/add_versioning.sql")
    print("   2. Add PipelineVersion model to app/models.py")
    print("   3. Create API endpoints in app/routes/api.py")
    print("   4. Build version UI in builder.html")

def main():
    """Main scaffolding menu"""
    print("=" * 60)
    print("  DominoML Feature Scaffolding")
    print("=" * 60)
    print("\nSelect phase to scaffold:")
    print("  1. Phase 1: Undo/Redo System")
    print("  2. Phase 2: Pipeline Versioning")
    print("  0. Exit")
    
    choice = input("\nEnter choice: ").strip()
    
    if choice == '1':
        scaffold_phase1_undoredo()
    elif choice == '2':
        scaffold_phase2_versioning()
    elif choice == '0':
        print("Exiting...")
        sys.exit(0)
    else:
        print("Invalid choice")
        sys.exit(1)

if __name__ == '__main__':
    main()
