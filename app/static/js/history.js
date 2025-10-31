// History Manager - Undo/Redo system for canvas operations
(function() {
    'use strict';

    class HistoryManager {
        constructor(maxSize = 50) {
            this.undoStack = [];
            this.redoStack = [];
            this.maxSize = maxSize;
            this.enabled = true;
            this.batchMode = false;
            this.batchActions = [];
        }

        /**
         * Record a state snapshot
         * @param {Object} state - Current canvas state {nodes, edges}
         * @param {String} action - Action type (e.g., 'ADD_NODE', 'DELETE_EDGE')
         * @param {Object} metadata - Additional context
         */
        recordState(state, action, metadata = {}) {
            if (!this.enabled) return;

            // If in batch mode, collect actions
            if (this.batchMode) {
                this.batchActions.push({ state, action, metadata });
                return;
            }

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
         * Start batch operation (multiple actions as one)
         */
        startBatch() {
            this.batchMode = true;
            this.batchActions = [];
        }

        /**
         * End batch operation and record as single action
         * @param {Object} finalState - Final state after batch
         * @param {String} batchName - Name for the batch action
         */
        endBatch(finalState, batchName = 'BATCH_OPERATION') {
            this.batchMode = false;
            
            if (this.batchActions.length > 0) {
                const metadata = {
                    actions: this.batchActions.map(a => a.action),
                    count: this.batchActions.length
                };
                this.recordState(finalState, batchName, metadata);
            }
            
            this.batchActions = [];
        }

        /**
         * Undo last action
         * @returns {Object|null} Previous state or null
         */
        undo() {
            if (this.undoStack.length <= 1) return null; // Need at least 2 states (initial + action)

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
         * Get description of last action
         */
        getLastAction() {
            if (this.undoStack.length === 0) return null;
            const last = this.undoStack[this.undoStack.length - 1];
            return this.formatAction(last.action);
        }

        /**
         * Get description of next redo action
         */
        getNextAction() {
            if (this.redoStack.length === 0) return null;
            const next = this.redoStack[this.redoStack.length - 1];
            return this.formatAction(next.action);
        }

        /**
         * Format action name for display
         */
        formatAction(action) {
            const formats = {
                'ADD_NODE': 'Add Component',
                'DELETE_NODE': 'Delete Component',
                'MOVE_NODE': 'Move Component',
                'ADD_EDGE': 'Connect Components',
                'DELETE_EDGE': 'Disconnect Components',
                'UPDATE_PARAMS': 'Edit Parameters',
                'LOAD_TEMPLATE': 'Load Template',
                'IMPORT_MODEL': 'Import Model',
                'BATCH_OPERATION': 'Multiple Changes',
                'INIT': 'Initial State'
            };
            return formats[action] || action;
        }

        /**
         * Update UI buttons state
         */
        updateUI() {
            const undoBtn = document.getElementById('undo-btn');
            const redoBtn = document.getElementById('redo-btn');

            if (undoBtn) {
                undoBtn.disabled = !this.canUndo();
                const lastAction = this.getLastAction();
                undoBtn.title = this.canUndo() 
                    ? `Undo: ${lastAction}`
                    : 'Nothing to undo';
            }

            if (redoBtn) {
                redoBtn.disabled = !this.canRedo();
                const nextAction = this.getNextAction();
                redoBtn.title = this.canRedo() 
                    ? `Redo: ${nextAction}`
                    : 'Nothing to redo';
            }
        }

        /**
         * Persist to localStorage (last 10 actions only)
         */
        persist() {
            try {
                const data = {
                    undoStack: this.undoStack.slice(-10),
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
                    timestamp: new Date(s.timestamp).toISOString(),
                    metadata: s.metadata
                })),
                redo: this.redoStack.map(s => ({
                    action: s.action,
                    timestamp: new Date(s.timestamp).toISOString(),
                    metadata: s.metadata
                }))
            };
        }

        /**
         * Get statistics about history
         */
        getStats() {
            return {
                undoAvailable: this.undoStack.length - 1,
                redoAvailable: this.redoStack.length,
                totalActions: this.undoStack.length + this.redoStack.length - 1,
                canUndo: this.canUndo(),
                canRedo: this.canRedo()
            };
        }

        /**
         * Temporarily disable recording (for loading/restoration)
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
        // Ignore if typing in input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Ctrl+Z or Cmd+Z (Undo)
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (window.canvasUndo) {
                window.canvasUndo();
            }
        }
        
        // Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y (Redo)
        if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
            (e.ctrlKey && e.key === 'y')) {
            e.preventDefault();
            if (window.canvasRedo) {
                window.canvasRedo();
            }
        }
    });

    // Debug helper
    window.debugHistory = function() {
        const history = window.historyManager.getHistory();
        const stats = window.historyManager.getStats();
        console.log('=== History Debug ===');
        console.log('Stats:', stats);
        console.log('Undo Stack:', history.undo);
        console.log('Redo Stack:', history.redo);
    };
})();
