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
        updateTimeout: null
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
            // Remove old event listener if possible (by cloning) or just add new one that overrides
            // Since we can't easily remove anonymous listeners, we'll assume the old one was a simple link or we replace the button.
            // Actually, in builder.html the old listener was redirecting. We need to prevent that.
            // The best way is to replace the element to strip listeners, or just update the ID in builder.html to avoid conflict if I haven't changed it yet.
            // But I will modify builder.html to remove the old listener logic.
            presentBtn.addEventListener('click', togglePresentationMode);
        }

        // Exit Button (will be added dynamically or exists in the panel)
        const exitBtn = document.getElementById('exit-presentation-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', togglePresentationMode);
        }
    }

    function togglePresentationMode() {
        state.isActive = !state.isActive;
        const body = document.body;
        const mainContainer = document.querySelector('.builder-container');

        if (state.isActive) {
            enterPresentationMode(body, mainContainer);
        } else {
            exitPresentationMode(body, mainContainer);
        }
    }

    function enterPresentationMode(body, mainContainer) {
        body.classList.add('presentation-mode-active');

        // Show code panel
        const codePanel = document.getElementById('presentation-code-panel');
        if (codePanel) codePanel.hidden = false;

        // Initialize Split.js if available
        if (window.Split && !state.splitInstance) {
            state.splitInstance = window.Split(['#canvas-wrapper', '#presentation-code-panel'], {
                sizes: [60, 40], // 60% Canvas, 40% Code
                minSize: [400, 300],
                gutterSize: 8,
                cursor: 'col-resize',
                direction: 'horizontal',
                onDragEnd: () => {
                    window.dispatchEvent(new Event('resize')); // Trigger canvas resize
                }
            });
        }

        // Generate initial code
        updateCode();

        // Setup observer for real-time updates
        setupCanvasObserver();

        window.showToast('Entered Presentation Mode', 'info');
    }

    function exitPresentationMode(body, mainContainer) {
        body.classList.remove('presentation-mode-active');

        // Hide code panel
        const codePanel = document.getElementById('presentation-code-panel');
        if (codePanel) codePanel.hidden = true;

        // Destroy Split instance to reset layout
        if (state.splitInstance) {
            state.splitInstance.destroy();
            state.splitInstance = null;
        }

        // Trigger resize to fix canvas
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }

    function setupCanvasObserver() {
        const canvasNodes = document.getElementById('canvas-nodes');
        if (!canvasNodes) return;

        const config = { childList: true, subtree: true, attributes: true, attributeFilter: ['data-node-id', 'style'] };

        const callback = function (mutationsList, observer) {
            if (!state.isActive) return;

            // Debounce update
            if (state.updateTimeout) clearTimeout(state.updateTimeout);
            state.updateTimeout = setTimeout(updateCode, 500);
        };

        const observer = new MutationObserver(callback);
        observer.observe(canvasNodes, config);
    }

    function updateCode() {
        if (!window.getCanvasState) {
            // Fallback if getCanvasState is not exposed yet (we need to add it to canvas.js or access state differently)
            // For now, we'll try to use the same logic as the old presentation.js or wait for canvas.js update.
            // Let's assume we will add a global helper or expose state.
            console.warn('getCanvasState not found. Code generation might be empty.');
            return;
        }

        const canvasState = window.getCanvasState(); // We need to implement this in canvas.js
        const code = generatePythonCode(canvasState.nodes, canvasState.edges);

        const codeBlock = document.getElementById('presentation-code-block');
        if (codeBlock) {
            codeBlock.textContent = code;
            if (window.Prism) {
                window.Prism.highlightElement(codeBlock);
            }
        }
    }

    // --- Code Generation Logic (Moved from presentation.js) ---
    function generatePythonCode(nodes, edges) {
        if (!nodes || nodes.length === 0) return '# Start adding components to generate code...';

        let code = 'import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom sklearn.preprocessing import *\nfrom sklearn.model_selection import *\nfrom sklearn.linear_model import *\nfrom sklearn.ensemble import *\nfrom sklearn.metrics import *\n\n';

        const sortedNodes = topologicalSort(nodes, edges);

        sortedNodes.forEach(node => {
            const component = window.getComponentById ? window.getComponentById(node.data.componentId) : null;
            if (!component) return;

            let template = component.pythonTemplate || `# ${node.data.label}`;

            // Fill parameters
            if (node.data.parameters) {
                Object.entries(node.data.parameters).forEach(([key, value]) => {
                    let pyValue = value;
                    if (typeof value === 'boolean') {
                        pyValue = value ? 'True' : 'False';
                    } else if (typeof value === 'string') {
                        // Basic check to see if it's a variable or string
                        // For simplicity, we assume most string params need quotes unless they look like numbers
                        if (isNaN(value) && value !== 'None' && !value.startsWith("'") && !value.startsWith('"')) {
                            // pyValue = `'${value}'`; // Actually, templates usually expect raw values or handle quotes.
                            // Let's trust the template or the user input for now.
                        }
                    }
                    template = template.replace(new RegExp(`{${key}}`, 'g'), pyValue);
                });
            }

            code += `# --- ${node.data.label} ---\n`;
            code += template + '\n\n';
        });

        return code;
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
