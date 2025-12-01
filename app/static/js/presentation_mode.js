/**
 * Presentation Mode Manager
 * Handles the toggle between Builder and Presentation views,
 * and manages the split-pane layout and code synchronization.
 */
(function () {
    'use strict';

    const state = {
        isActive: false,
        splitInstance: null,
        updateTimeout: null,
        editor: null,
        nodeCodeMap: new Map(), // nodeId -> {startLine, endLine}
        highlightedMarker: null,
        isUpdatingFromCode: false,
        currentFramework: 'sklearn'
    };

    // Initialize Presentation Mode
    window.presentationModeInit = function () {
        console.log('Presentation Mode Module Initialized');
        setupEventListeners();
    };

    function setupEventListeners() {
        // Present Button
        const presentBtn = document.getElementById('present-btn');
        if (presentBtn) {
            presentBtn.addEventListener('click', togglePresentationMode);
        }

        // Exit Button
        const exitBtn = document.getElementById('exit-presentation-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', togglePresentationMode);
        }

        // Copy Button
        const copyBtn = document.getElementById('copy-presentation-code-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', copyCode);
        }

        // Framework Selector (Custom Dropdown)
        setupFrameworkDropdown();

        // Canvas Node Click Delegation
        const canvasNodes = document.getElementById('canvas-nodes');
        if (canvasNodes) {
            canvasNodes.addEventListener('click', handleNodeClick);
        }
    }

    // Custom Framework Dropdown Handler
    function setupFrameworkDropdown() {
        const dropdown = document.getElementById('framework-dropdown');
        const toggle = document.getElementById('framework-selector');
        const menu = document.getElementById('framework-dropdown-menu');
        const selectedText = toggle?.querySelector('.framework-selected-text');

        if (!dropdown || !toggle || !menu) return;

        // Toggle dropdown on button click
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        // Handle item selection
        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.framework-dropdown-item');
            if (!item) return;

            const value = item.dataset.value;
            const text = item.textContent;

            // Update selected state
            menu.querySelectorAll('.framework-dropdown-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Update display text
            if (selectedText) {
                selectedText.textContent = text;
            }

            // Update state and regenerate code
            state.currentFramework = value;
            updateCode();

            // Close dropdown
            dropdown.classList.remove('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
            }
        });
    }

    function togglePresentationMode() {
        state.isActive = !state.isActive;
        const body = document.body;

        if (state.isActive) {
            enterPresentationMode(body);
        } else {
            exitPresentationMode(body);
        }
    }

    function enterPresentationMode(body) {
        body.classList.add('presentation-mode-active');

        // Show code panel
        const codePanel = document.getElementById('presentation-code-panel');
        if (codePanel) codePanel.hidden = false;

        // Initialize Split.js
        if (window.Split && !state.splitInstance) {
            state.splitInstance = window.Split(['#canvas-wrapper', '#presentation-code-panel'], {
                sizes: [60, 40],
                minSize: [400, 300],
                gutterSize: 8,
                cursor: 'col-resize',
                direction: 'horizontal',
                onDragEnd: () => {
                    window.dispatchEvent(new Event('resize'));
                    if (state.editor) state.editor.refresh();
                }
            });
        }

        // Initialize CodeMirror
        if (!state.editor) {
            const container = document.getElementById('presentation-code-container');
            if (container && window.CodeMirror) {
                container.innerHTML = ''; // Clear previous content
                state.editor = CodeMirror(container, {
                    mode: 'python',
                    theme: 'dracula',
                    lineNumbers: true,
                    readOnly: false, // Allow editing for bi-directional sync
                    lineWrapping: true
                });

                // Add click listener to editor for code-to-node mapping
                state.editor.on('cursorActivity', handleEditorCursorMove);

                // Add change listener for bi-directional sync
                state.editor.on('change', handleCodeChange);
            }
        }

        // Generate initial code
        updateCode();

        // Setup observer for real-time updates
        setupCanvasObserver();

        window.showToast('Entered Presentation Mode', 'info');
    }

    function exitPresentationMode(body) {
        body.classList.remove('presentation-mode-active');

        // Hide code panel
        const codePanel = document.getElementById('presentation-code-panel');
        if (codePanel) codePanel.hidden = true;

        // Destroy Split instance
        if (state.splitInstance) {
            state.splitInstance.destroy();
            state.splitInstance = null;
        }

        // Trigger resize
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }

    function setupCanvasObserver() {
        const canvasNodes = document.getElementById('canvas-nodes');
        if (!canvasNodes) return;

        const config = { childList: true, subtree: true, attributes: true, attributeFilter: ['data-node-id', 'style'] };

        const callback = function (mutationsList, observer) {
            if (!state.isActive || state.isUpdatingFromCode) return;
            if (state.updateTimeout) clearTimeout(state.updateTimeout);
            state.updateTimeout = setTimeout(updateCode, 500);
        };

        const observer = new MutationObserver(callback);
        observer.observe(canvasNodes, config);
    }

    function updateCode() {
        if (!window.getCanvasState) return;

        const canvasState = window.getCanvasState();
        const result = generateCodeWithMapping(canvasState.nodes, canvasState.edges);

        if (state.editor) {
            const cursor = state.editor.getCursor(); // Preserve cursor position
            state.editor.setValue(result.code);
            state.editor.setCursor(cursor);
            state.nodeCodeMap = result.mapping;
        }
    }

    function generateCodeWithMapping(nodes, edges) {
        if (!nodes || nodes.length === 0) {
            return { code: '# Start adding components to generate code...', mapping: new Map() };
        }

        let code = '';
        if (state.currentFramework === 'sklearn') {
            code = 'import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom sklearn.preprocessing import *\nfrom sklearn.model_selection import *\nfrom sklearn.linear_model import *\nfrom sklearn.ensemble import *\nfrom sklearn.metrics import *\n\n';
        } else if (state.currentFramework === 'pytorch') {
            code = 'import torch\nimport torch.nn as nn\nimport torch.optim as optim\nfrom torch.utils.data import DataLoader, TensorDataset\n\n';
        } else if (state.currentFramework === 'tensorflow') {
            code = 'import tensorflow as tf\nfrom tensorflow.keras import layers, models\n\n';
        }

        const mapping = new Map();
        let currentLine = code.split('\n').length - 1; // 0-indexed line count

        const sortedNodes = topologicalSort(nodes, edges);

        sortedNodes.forEach(node => {
            const component = window.getComponentById ? window.getComponentById(node.data.componentId) : null;
            if (!component) return;

            let template = '';

            // Framework-specific templates (Mock implementation for now)
            if (state.currentFramework === 'sklearn') {
                template = component.pythonTemplate || `# ${node.data.label}`;
            } else if (state.currentFramework === 'pytorch') {
                template = `# PyTorch implementation for ${node.data.label}\n# TODO: Implement PyTorch template`;
            } else if (state.currentFramework === 'tensorflow') {
                template = `# TensorFlow implementation for ${node.data.label}\n# TODO: Implement TensorFlow template`;
            }

            // Fill parameters (only for sklearn for now as others are placeholders)
            if (state.currentFramework === 'sklearn' && node.data.parameters) {
                Object.entries(node.data.parameters).forEach(([key, value]) => {
                    let pyValue = value;
                    if (typeof value === 'boolean') {
                        pyValue = value ? 'True' : 'False';
                    } else if (typeof value === 'string') {
                        if (isNaN(value) && value !== 'None' && !value.startsWith("'") && !value.startsWith('"')) {
                            // Keep as is
                        }
                    }
                    template = template.replace(new RegExp(`{${key}}`, 'g'), pyValue);
                });
            }

            const header = `# --- ${node.data.label} ---`;
            const block = `${header}\n${template}\n\n`;

            const startLine = currentLine;
            code += block;
            const lineCount = block.split('\n').length - 1;
            const endLine = startLine + lineCount;

            mapping.set(node.id, { startLine, endLine, template: component.pythonTemplate, params: node.data.parameters });
            currentLine = endLine;
        });

        return { code, mapping };
    }

    function handleNodeClick(e) {
        if (!state.isActive || !state.editor) return;

        const nodeEl = e.target.closest('.node');
        if (!nodeEl) return;

        const nodeId = nodeEl.dataset.nodeId;
        const mapping = state.nodeCodeMap.get(nodeId);

        if (mapping) {
            // Clear previous highlight
            if (state.highlightedMarker) state.highlightedMarker.clear();

            // Highlight code block
            state.highlightedMarker = state.editor.markText(
                { line: mapping.startLine, ch: 0 },
                { line: mapping.endLine, ch: 0 },
                { className: 'code-highlight' }
            );

            // Scroll to code
            state.editor.scrollIntoView({ line: mapping.startLine, ch: 0 }, 200);
        }
    }

    function handleEditorCursorMove(cm) {
        const cursor = cm.getCursor();
        const line = cursor.line;

        // Find node for this line
        let foundNodeId = null;
        for (const [nodeId, range] of state.nodeCodeMap.entries()) {
            if (line >= range.startLine && line < range.endLine) {
                foundNodeId = nodeId;
                break;
            }
        }

        if (foundNodeId) {
            // Highlight node on canvas
            // We need a way to highlight node without selecting it (or just select it)
            // Let's dispatch a custom event or call canvas method if available
            // For now, let's just log it or try to find the element and add a class
            highlightNodeOnCanvas(foundNodeId);
        }
    }

    function handleCodeChange(cm, change) {
        if (change.origin === 'setValue') return; // Ignore programmatic changes

        const cursor = cm.getCursor();
        const line = cursor.line;
        const lineContent = cm.getLine(line);

        // Identify which node was modified
        let modifiedNodeId = null;
        let modifiedRange = null;

        for (const [nodeId, range] of state.nodeCodeMap.entries()) {
            if (line >= range.startLine && line < range.endLine) {
                modifiedNodeId = nodeId;
                modifiedRange = range;
                break;
            }
        }

        if (modifiedNodeId && modifiedRange && modifiedRange.params) {
            // Attempt to parse the change
            // This is a naive implementation: it tries to find parameter values in the line
            // A robust solution requires a proper parser or regex based on the template

            // Example: n_estimators=100
            // We iterate through params and see if we can find them in the line
            Object.keys(modifiedRange.params).forEach(param => {
                const regex = new RegExp(`${param}\\s*=\\s*([^,\\)]+)`);
                const match = lineContent.match(regex);
                if (match) {
                    let newValue = match[1].trim();
                    // Clean up quotes if string
                    if (newValue.startsWith("'") || newValue.startsWith('"')) {
                        newValue = newValue.slice(1, -1);
                    }
                    // Convert to number if possible
                    if (!isNaN(newValue)) {
                        newValue = Number(newValue);
                    } else if (newValue === 'True') {
                        newValue = true;
                    } else if (newValue === 'False') {
                        newValue = false;
                    }

                    // Update if changed
                    if (modifiedRange.params[param] !== newValue) {
                        console.log(`Updating ${param} to ${newValue} for node ${modifiedNodeId}`);
                        state.isUpdatingFromCode = true;

                        // Update node data
                        const node = window.canvasManager ? window.canvasManager.getNode(modifiedNodeId) : null;
                        if (node) {
                            node.data.parameters[param] = newValue;
                            // Trigger any necessary canvas updates (e.g., re-render properties panel if open)
                        }

                        // Reset flag after a short delay
                        setTimeout(() => { state.isUpdatingFromCode = false; }, 100);
                    }
                }
            });
        }
    }

    function highlightNodeOnCanvas(nodeId) {
        // Remove previous highlights
        document.querySelectorAll('.node.highlighted-from-code').forEach(el => {
            el.classList.remove('highlighted-from-code');
        });

        const nodeEl = document.querySelector(`.node[data-node-id="${nodeId}"]`);
        if (nodeEl) {
            nodeEl.classList.add('highlighted-from-code');
            nodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function copyCode() {
        if (state.editor) {
            const code = state.editor.getValue();
            navigator.clipboard.writeText(code).then(() => {
                window.showToast('Code copied to clipboard', 'success');
            });
        }
    }

    function topologicalSort(nodes, edges) {
        const graph = {};
        const inDegree = {};

        nodes.forEach(node => {
            graph[node.id] = [];
            inDegree[node.id] = 0;
        });

        edges.forEach(edge => {
            if (graph[edge.source]) {
                graph[edge.source].push(edge.target);
                inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
            }
        });

        const queue = nodes.filter(node => inDegree[node.id] === 0);
        const result = [];

        while (queue.length > 0) {
            const node = queue.shift();
            result.push(node);

            if (graph[node.id]) {
                graph[node.id].forEach(neighborId => {
                    inDegree[neighborId]--;
                    if (inDegree[neighborId] === 0) {
                        const neighbor = nodes.find(n => n.id === neighborId);
                        if (neighbor) queue.push(neighbor);
                    }
                });
            }
        }

        if (result.length < nodes.length) {
            const remaining = nodes.filter(n => !result.includes(n));
            result.push(...remaining);
        }

        return result;
    }

})();
