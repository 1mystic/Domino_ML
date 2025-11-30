// Canvas Management - Drag & Drop ML Pipeline Builder
(function () {
    // Canvas state
    const state = {
        nodes: [],
        edges: [],
        selectedNode: null,
        draggedNode: null,
        connecting: null,
        transform: { x: 0, y: 0, scale: 1 },
        isPanning: false,
        panStart: { x: 0, y: 0 },
        currentModelId: null,
        currentModelName: null,
        historyInitialized: false,
    };

    let canvas, canvasNodes, canvasSvg, emptyState;
    let nodeIdCounter = 0;

    // History helper function
    function recordHistory(action, metadata = {}) {
        if (window.historyManager) {
            window.historyManager.recordState(
                { nodes: state.nodes, edges: state.edges },
                action,
                metadata
            );
        }
    }

    // Initialize history on first state
    function initializeHistory() {
        if (!state.historyInitialized && window.historyManager) {
            window.historyManager.recordState(
                { nodes: state.nodes, edges: state.edges },
                'INIT',
                { timestamp: Date.now() }
            );
            state.historyInitialized = true;
        }
    }

    // Initialize canvas
    window.canvasInit = function () {
        canvas = document.getElementById('canvas');
        canvasNodes = document.getElementById('canvas-nodes');
        canvasSvg = document.getElementById('canvas-svg');
        emptyState = document.getElementById('empty-state');

        if (!canvas || !canvasNodes || !canvasSvg) {
            console.error('Canvas elements not found');
            return;
        }

        setupCanvasHandlers();
        setupToolbarHandlers();
        setupDialogHandlers();
        initializeHistory();
        render();
    };

    // Expose state for other modules (e.g., Presentation Mode)
    window.getCanvasState = function () {
        return {
            nodes: state.nodes,
            edges: state.edges
        };
    };

    // Setup canvas event handlers
    function setupCanvasHandlers() {
        // Drop handler for adding components
        canvas.addEventListener('dragover', handleDragOver);
        canvas.addEventListener('drop', handleDrop);

        // Pan handlers
        canvas.addEventListener('mousedown', handlePanStart);
        canvas.addEventListener('mousemove', handlePanMove);
        canvas.addEventListener('mouseup', handlePanEnd);
        canvas.addEventListener('mouseleave', handlePanEnd);

        // Zoom handler
        canvas.addEventListener('wheel', handleZoom, { passive: false });

        // Click on canvas to deselect
        canvas.addEventListener('click', (e) => {
            if (e.target === canvas || e.target === canvasNodes || e.target === canvasSvg) {
                selectNode(null);
            }

            if (window.lucide) {
                window.lucide.createIcons();
            }
        });
    }

    // Setup toolbar button handlers
    function setupToolbarHandlers() {
        // New model
        const newBtn = document.getElementById('new-model-btn');
        if (newBtn) newBtn.addEventListener('click', newModel);

        // Save model
        const saveBtn = document.getElementById('save-model-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => openDialog('save-dialog'));

        // Load model
        const loadBtn = document.getElementById('load-model-btn');
        if (loadBtn) loadBtn.addEventListener('click', loadModel);

        // Templates
        const templatesBtn = document.getElementById('templates-btn');
        const emptyTemplatesBtn = document.getElementById('empty-templates-btn');
        if (templatesBtn) templatesBtn.addEventListener('click', loadTemplates);
        if (emptyTemplatesBtn) emptyTemplatesBtn.addEventListener('click', loadTemplates);

        // Validate
        const validateBtn = document.getElementById('validate-btn');
        if (validateBtn) validateBtn.addEventListener('click', validatePipeline);

        // Export code
        const exportBtn = document.getElementById('export-code-btn');
        if (exportBtn) exportBtn.addEventListener('click', exportCode);



        // Undo/Redo
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        if (undoBtn) undoBtn.addEventListener('click', () => window.canvasUndo());
        if (redoBtn) redoBtn.addEventListener('click', () => window.canvasRedo());

        // Zoom controls
        const zoomIn = document.getElementById('zoom-in-btn');
        const zoomOut = document.getElementById('zoom-out-btn');
        const zoomFit = document.getElementById('zoom-fit-btn');

        if (zoomIn) zoomIn.addEventListener('click', () => zoom(0.1));
        if (zoomOut) zoomOut.addEventListener('click', () => zoom(-0.1));
        if (zoomFit) zoomFit.addEventListener('click', fitView);
    }

    // Setup dialog handlers
    function setupDialogHandlers() {
        // Save model confirmation
        const confirmSaveBtn = document.getElementById('confirm-save-btn');
        if (confirmSaveBtn) {
            confirmSaveBtn.addEventListener('click', saveModel);
        }

        // Copy code button
        const copyCodeBtn = document.getElementById('copy-code-btn');
        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', copyCode);
        }

        // Import model confirmation
        const confirmImportBtn = document.getElementById('confirm-import-btn');
        if (confirmImportBtn) {
            confirmImportBtn.addEventListener('click', importModel);
        }
    }

    // Handle drag over canvas
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    // Handle drop on canvas
    function handleDrop(e) {
        e.preventDefault();

        try {
            const componentData = JSON.parse(e.dataTransfer.getData('application/json'));

            // Calculate position relative to canvas
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - state.transform.x) / state.transform.scale;
            const y = (e.clientY - rect.top - state.transform.y) / state.transform.scale;

            // Create node
            addNode(componentData, x, y);
        } catch (error) {
            console.error('Drop error:', error);
        }
    }

    // Add node to canvas
    function addNode(component, x, y) {
        const iconName = window.getComponentIconName
            ? window.getComponentIconName(component.id)
            : null;

        const node = {
            id: `node-${++nodeIdCounter}`,
            type: component.type,
            position: { x, y },
            data: {
                componentId: component.id,
                label: component.name,
                icon: component.icon,
                iconName: iconName,
                parameters: {},
            },
        };

        // Initialize parameters with defaults
        if (component.parameters) {
            component.parameters.forEach(param => {
                node.data.parameters[param.name] = param.defaultValue ?? param.default ?? '';
            });
        }

        state.nodes.push(node);
        recordHistory('ADD_NODE', { nodeId: node.id, componentId: component.id });
        render();
        selectNode(node);
    }

    // Pan handlers
    function handlePanStart(e) {
        if (e.button !== 0) return; // Left button only
        if (e.target.classList.contains('node')) return; // Don't pan when clicking nodes

        state.isPanning = true;
        state.panStart = { x: e.clientX - state.transform.x, y: e.clientY - state.transform.y };
        canvas.style.cursor = 'grabbing';
    }

    function handlePanMove(e) {
        if (!state.isPanning) return;

        state.transform.x = e.clientX - state.panStart.x;
        state.transform.y = e.clientY - state.panStart.y;
        updateTransform();
    }

    function handlePanEnd() {
        state.isPanning = false;
        canvas.style.cursor = 'default';
    }

    // Zoom handler
    function handleZoom(e) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const newScale = Math.max(0.1, Math.min(2, state.transform.scale + delta));

        // Zoom towards mouse position
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const oldScale = state.transform.scale;
        state.transform.scale = newScale;

        state.transform.x = mouseX - (mouseX - state.transform.x) * (newScale / oldScale);
        state.transform.y = mouseY - (mouseY - state.transform.y) * (newScale / oldScale);

        updateTransform();
        updateZoomDisplay();
    }

    // Zoom programmatically
    function zoom(delta) {
        state.transform.scale = Math.max(0.1, Math.min(2, state.transform.scale + delta));
        updateTransform();
        updateZoomDisplay();
    }

    // Fit view to nodes
    function fitView() {
        if (state.nodes.length === 0) return;

        const padding = 50;
        const bounds = getNodesBounds();

        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = (canvasRect.width - padding * 2) / bounds.width;
        const scaleY = (canvasRect.height - padding * 2) / bounds.height;

        state.transform.scale = Math.min(1, Math.min(scaleX, scaleY));
        state.transform.x = padding - bounds.left * state.transform.scale + (canvasRect.width - bounds.width * state.transform.scale) / 2;
        state.transform.y = padding - bounds.top * state.transform.scale + (canvasRect.height - bounds.height * state.transform.scale) / 2;

        updateTransform();
        updateZoomDisplay();
    }

    // Get bounds of all nodes
    function getNodesBounds() {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        state.nodes.forEach(node => {
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + 200);
            maxY = Math.max(maxY, node.position.y + 80);
        });

        return {
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }

    // Update transform
    function updateTransform() {
        const transform = `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale})`;
        canvasNodes.style.transform = transform;
        canvasSvg.style.transform = transform;
    }

    // Update zoom display
    function updateZoomDisplay() {
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(state.transform.scale * 100)}%`;
        }
    }

    // Select node
    function selectNode(node) {
        state.selectedNode = node;

        // Update visual selection
        document.querySelectorAll('.node').forEach(el => {
            el.classList.remove('selected');
        });

        if (node) {
            const nodeEl = document.querySelector(`[data-node-id="${node.id}"]`);
            if (nodeEl) nodeEl.classList.add('selected');
            window.showProperties(node);
        } else {
            window.hideProperties();
        }
    }

    // Delete node
    window.deleteNode = function (nodeId) {
        const deletedNode = state.nodes.find(n => n.id === nodeId);
        state.nodes = state.nodes.filter(n => n.id !== nodeId);
        state.edges = state.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
        recordHistory('DELETE_NODE', { nodeId, label: deletedNode?.data?.label });
        render();
    };

    // Update node
    window.updateNode = function (node) {
        recordHistory('UPDATE_PARAMS', { nodeId: node.id, label: node.data.label });
        render();
    };

    // Render canvas
    function render() {
        // Show/hide empty state
        if (emptyState) {
            emptyState.hidden = state.nodes.length > 0;
        }

        // Render nodes
        renderNodes();

        // Render edges
        renderEdges();
    }

    // Render nodes
    function renderNodes() {
        canvasNodes.innerHTML = '';

        state.nodes.forEach(node => {
            const nodeEl = document.createElement('div');
            nodeEl.className = 'node';
            if (state.selectedNode?.id === node.id) {
                nodeEl.classList.add('selected');
            }
            nodeEl.dataset.nodeId = node.id;
            nodeEl.style.left = `${node.position.x}px`;
            nodeEl.style.top = `${node.position.y}px`;

            // Get component details for display
            const component = window.getComponentById?.(node.data.componentId);
            const paramCount = component?.parameters?.length || 0;
            const paramText = paramCount > 0 ? `${paramCount} parameter${paramCount !== 1 ? 's' : ''}` : 'No parameters';

            if (!node.data.iconName && window.getComponentIconName && node.data.componentId) {
                node.data.iconName = window.getComponentIconName(node.data.componentId);
            }

            const iconName = node.data.iconName || 'box';
            const iconMarkup = `<i data-lucide="${iconName}"></i>`;

            nodeEl.innerHTML = `
                <div class="node-header">
                    <span class="node-icon">${iconMarkup}</span>
                    <span class="node-label">${node.data.label}</span>
                </div>
                <div class="node-body">
                    <div class="node-meta">${paramText}</div>
                </div>
                <div class="node-handles">
                    <div class="node-handle node-handle-input" data-type="input" data-node-id="${node.id}"></div>
                    <div class="node-handle node-handle-output" data-type="output" data-node-id="${node.id}"></div>
                </div>
            `;

            // Make draggable
            nodeEl.addEventListener('mousedown', (e) => handleNodeDragStart(e, node));

            // Click to select
            nodeEl.addEventListener('click', (e) => {
                e.stopPropagation();
                selectNode(node);
            });

            // Handle connections
            const outputHandle = nodeEl.querySelector('.node-handle-output');
            const inputHandle = nodeEl.querySelector('.node-handle-input');

            if (outputHandle) {
                outputHandle.addEventListener('mousedown', (e) => handleConnectionStart(e, node, 'output'));
            }

            if (inputHandle) {
                inputHandle.addEventListener('mousedown', (e) => handleConnectionStart(e, node, 'input'));
            }

            canvasNodes.appendChild(nodeEl);
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Handle node drag
    function handleNodeDragStart(e, node) {
        if (e.target.classList.contains('node-handle')) return; // Don't drag when clicking handles

        e.stopPropagation();
        selectNode(node);

        const nodeEl = e.currentTarget;
        const startX = e.clientX;
        const startY = e.clientY;
        const startPos = { ...node.position };

        const handleMouseMove = (e) => {
            const dx = (e.clientX - startX) / state.transform.scale;
            const dy = (e.clientY - startY) / state.transform.scale;

            node.position.x = startPos.x + dx;
            node.position.y = startPos.y + dy;

            nodeEl.style.left = `${node.position.x}px`;
            nodeEl.style.top = `${node.position.y}px`;

            renderEdges();
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    // Handle connection start
    function handleConnectionStart(e, node, handleType) {
        e.stopPropagation();
        e.preventDefault();

        // Start connecting from output handle
        if (handleType === 'output') {
            state.connecting = {
                sourceNode: node,
                sourceHandle: handleType,
            };

            // Create temporary edge for visual feedback
            const tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            tempLine.setAttribute('class', 'edge edge-temp');
            tempLine.setAttribute('stroke-dasharray', '5,5');
            tempLine.id = 'temp-connection-line';
            canvasSvg.appendChild(tempLine);

            const handleMouseMove = (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / state.transform.scale - state.transform.x / state.transform.scale;
                const y = (e.clientY - rect.top) / state.transform.scale - state.transform.y / state.transform.scale;

                // Update temporary line
                const x1 = node.position.x + 200;
                const y1 = node.position.y + 40;
                const cx1 = x1 + 50;
                const cx2 = x - 50;
                const path = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y}, ${x} ${y}`;
                tempLine.setAttribute('d', path);
            };

            const handleMouseUp = (e) => {
                // Remove temporary line
                const tempEl = document.getElementById('temp-connection-line');
                if (tempEl) tempEl.remove();

                // Check if dropped on an input handle
                const target = document.elementFromPoint(e.clientX, e.clientY);
                if (target?.classList.contains('node-handle-input')) {
                    const targetNodeId = target.dataset.nodeId;
                    const targetNode = state.nodes.find(n => n.id === targetNodeId);

                    if (targetNode && targetNode.id !== node.id) {
                        // Create edge
                        const edgeId = `edge-${state.edges.length + 1}`;
                        const edge = {
                            id: edgeId,
                            source: node.id,
                            target: targetNode.id,
                        };

                        // Check if edge already exists
                        const exists = state.edges.some(e =>
                            e.source === edge.source && e.target === edge.target
                        );

                        if (!exists) {
                            state.edges.push(edge);
                            recordHistory('ADD_EDGE', { edgeId, source: edge.source, target: edge.target });
                            renderEdges();
                            window.showToast('Nodes connected', 'success');
                        } else {
                            window.showToast('Connection already exists', 'error');
                        }
                    }
                }

                state.connecting = null;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    }

    // Render edges
    function renderEdges() {
        canvasSvg.innerHTML = '';

        state.edges.forEach(edge => {
            const sourceNode = state.nodes.find(n => n.id === edge.source);
            const targetNode = state.nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) return;

            // Create edge group
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'edge-group');
            group.setAttribute('data-edge-id', edge.id);

            // Create invisible wider path for easier clicking
            const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x1 = sourceNode.position.x + 200;
            const y1 = sourceNode.position.y + 40;
            const x2 = targetNode.position.x;
            const y2 = targetNode.position.y + 40;

            const path = `M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`;

            hitArea.setAttribute('d', path);
            hitArea.setAttribute('class', 'edge-hitarea');
            hitArea.setAttribute('stroke', 'transparent');
            hitArea.setAttribute('stroke-width', '20');
            hitArea.setAttribute('fill', 'none');
            hitArea.style.cursor = 'pointer';

            // Create visible edge path
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            line.setAttribute('d', path);
            line.setAttribute('class', 'edge');
            line.setAttribute('stroke', '#3b82f6');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('fill', 'none');
            line.style.pointerEvents = 'none';

            // Create delete button circle (hidden by default)
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const deleteButton = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            deleteButton.setAttribute('class', 'edge-delete-btn');
            deleteButton.style.display = 'none';
            deleteButton.style.cursor = 'pointer';

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', midX);
            circle.setAttribute('cy', midY);
            circle.setAttribute('r', '12');
            circle.setAttribute('fill', '#ef4444');
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '2');

            const xLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            xLine1.setAttribute('x1', midX - 4);
            xLine1.setAttribute('y1', midY - 4);
            xLine1.setAttribute('x2', midX + 4);
            xLine1.setAttribute('y2', midY + 4);
            xLine1.setAttribute('stroke', 'white');
            xLine1.setAttribute('stroke-width', '2');
            xLine1.setAttribute('stroke-linecap', 'round');

            const xLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            xLine2.setAttribute('x1', midX + 4);
            xLine2.setAttribute('y1', midY - 4);
            xLine2.setAttribute('x2', midX - 4);
            xLine2.setAttribute('y2', midY + 4);
            xLine2.setAttribute('stroke', 'white');
            xLine2.setAttribute('stroke-width', '2');
            xLine2.setAttribute('stroke-linecap', 'round');

            deleteButton.appendChild(circle);
            deleteButton.appendChild(xLine1);
            deleteButton.appendChild(xLine2);

            // Add hover effects
            let isHovering = false;

            const showDeleteButton = () => {
                isHovering = true;
                line.setAttribute('stroke', '#ef4444');
                line.setAttribute('stroke-width', '3');
                deleteButton.style.display = 'block';
            };

            const hideDeleteButton = () => {
                isHovering = false;
                setTimeout(() => {
                    if (!isHovering) {
                        const defaultStroke = line.dataset.defaultStroke || getComputedStyle(line).stroke;
                        line.setAttribute('stroke', defaultStroke);
                        line.setAttribute('stroke-width', '2');
                        deleteButton.style.display = 'none';
                    }
                }, 100);
            };

            hitArea.addEventListener('mouseenter', showDeleteButton);
            hitArea.addEventListener('mouseleave', hideDeleteButton);
            deleteButton.addEventListener('mouseenter', showDeleteButton);
            deleteButton.addEventListener('mouseleave', hideDeleteButton);

            // Delete on click
            const handleDelete = (e) => {
                e.stopPropagation();
                deleteEdge(edge.id);
            };

            hitArea.addEventListener('click', handleDelete);
            deleteButton.addEventListener('click', handleDelete);

            // Assemble the group
            group.appendChild(hitArea);
            group.appendChild(line);
            line.dataset.defaultStroke = getComputedStyle(line).stroke;
            group.appendChild(deleteButton);

            canvasSvg.appendChild(group);
        });
    }

    // Delete edge
    function deleteEdge(edgeId) {
        const edge = state.edges.find(e => e.id === edgeId);
        if (!edge) return;

        const sourceNode = state.nodes.find(n => n.id === edge.source);
        const targetNode = state.nodes.find(n => n.id === edge.target);

        state.edges = state.edges.filter(e => e.id !== edgeId);
        recordHistory('DELETE_EDGE', { edgeId, source: edge.source, target: edge.target });
        renderEdges();

        const sourceLabel = sourceNode?.data?.label || 'Unknown';
        const targetLabel = targetNode?.data?.label || 'Unknown';
        window.showToast(`Disconnected: ${sourceLabel} → ${targetLabel}`, 'success');
    }

    // Undo last action
    window.canvasUndo = function () {
        if (!window.historyManager) {
            window.showToast('History not available', 'error');
            return;
        }

        const previousState = window.historyManager.undo();
        if (previousState) {
            // Pause history while restoring
            window.historyManager.pause();

            state.nodes = previousState.nodes || [];
            state.edges = previousState.edges || [];

            // Update node counter
            nodeIdCounter = Math.max(0, ...state.nodes.map(n =>
                parseInt(n.id.replace(/\D/g, '')) || 0
            ));

            render();
            selectNode(null);

            window.historyManager.resume();

            const action = window.historyManager.getLastAction();
            window.showToast(`Undo: ${action}`, 'success');
        } else {
            window.showToast('Nothing to undo', 'info');
        }
    };

    // Redo last undone action
    window.canvasRedo = function () {
        if (!window.historyManager) {
            window.showToast('History not available', 'error');
            return;
        }

        const nextState = window.historyManager.redo();
        if (nextState) {
            // Pause history while restoring
            window.historyManager.pause();

            state.nodes = nextState.nodes || [];
            state.edges = nextState.edges || [];

            // Update node counter
            nodeIdCounter = Math.max(0, ...state.nodes.map(n =>
                parseInt(n.id.replace(/\D/g, '')) || 0
            ));

            render();
            selectNode(null);

            window.historyManager.resume();

            const action = window.historyManager.getNextAction();
            window.showToast(`Redo: ${action}`, 'success');
        } else {
            window.showToast('Nothing to redo', 'info');
        }
    };

    // New model
    function newModel() {
        if (state.nodes.length > 0) {
            if (!confirm('This will clear the current pipeline. Continue?')) return;
        }

        state.nodes = [];
        state.edges = [];
        state.currentModelId = null;
        state.currentModelName = null;
        nodeIdCounter = 0;

        selectNode(null);
        render();

        window.showToast('New pipeline created', 'success');
    }

    // Save model
    async function saveModel() {
        const nameInput = document.getElementById('model-name');
        const name = nameInput?.value?.trim();

        if (!name) {
            window.showToast('Please enter a model name', 'error');
            return;
        }

        if (state.nodes.length === 0) {
            window.showToast('Cannot save empty pipeline', 'error');
            return;
        }

        try {
            const pipeline = {
                name,
                nodes: state.nodes,
                edges: state.edges,
            };

            if (state.currentModelId) {
                await window.api.models.update(state.currentModelId, pipeline);
                window.showToast('Model updated successfully', 'success');
            } else {
                const result = await window.api.models.create(pipeline);
                state.currentModelId = result.id;
                window.showToast('Model saved successfully', 'success');
            }

            state.currentModelName = name;
            closeDialog('save-dialog');
        } catch (error) {
            console.error('Save error:', error);
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                window.showToast('Please sign in to save models', 'error');
            } else {
                window.showToast('Failed to save model: ' + error.message, 'error');
            }
        }
    }

    // Load model
    async function loadModel() {
        try {
            const models = await window.api.models.getAll();
            const container = document.getElementById('saved-models-list');

            if (!models || models.length === 0) {
                container.innerHTML = '<div class="empty-state-small">No saved models</div>';
            } else {
                container.innerHTML = models.map(model => `
                    <div class="model-list-item" data-model-id="${model.id}">
                        <div class="model-info">
                            <div class="model-name">${model.name}</div>
                            <div class="model-meta">${model.nodes.length} nodes</div>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="window.loadModelById(${model.id})">
                            Open
                        </button>
                    </div>
                `).join('');
            }

            openDialog('load-dialog');

            // Wire up the "Import from JSON" button in the load dialog
            const openImportBtn = document.getElementById('open-import-dialog-btn');
            if (openImportBtn) {
                // Remove existing listeners to avoid duplicates (simple way is to clone)
                const newBtn = openImportBtn.cloneNode(true);
                openImportBtn.parentNode.replaceChild(newBtn, openImportBtn);

                newBtn.addEventListener('click', function () {
                    closeDialog('load-dialog');
                    openDialog('import-dialog');
                });
            }
        } catch (error) {
            console.error('Load error:', error);
            window.showToast('Failed to load models', 'error');
        }
    }

    // Load model by ID
    window.loadModelById = async function (id) {
        try {
            const model = await window.api.models.get(id);

            state.nodes = model.nodes || [];
            state.edges = model.edges || [];
            state.currentModelId = model.id;
            state.currentModelName = model.name;

            // Update node counter
            nodeIdCounter = Math.max(0, ...state.nodes.map(n =>
                parseInt(n.id.replace('node-', '')) || 0
            ));

            render();
            fitView();
            closeDialog('load-dialog');

            window.showToast(`Loaded "${model.name}"`, 'success');
        } catch (error) {
            console.error('Load error:', error);
            window.showToast('Failed to load model', 'error');
        }
    };

    // Load templates
    async function loadTemplates() {
        try {
            const data = await window.api.templates.getAll();
            const templates = data.templates || [];
            const container = document.getElementById('templates-grid');

            if (templates.length === 0) {
                container.innerHTML = '<div class="empty-state-small">No templates available</div>';
            } else {
                container.innerHTML = templates.map(template => {
                    const iconName = window.getTemplateIconName
                        ? window.getTemplateIconName(template.id)
                        : 'layout-template';
                    return `
                    <div class="template-card" onclick="window.loadTemplate('${template.id}')">
                        <div class="template-icon">
                            <i data-lucide="${iconName}"></i>
                        </div>
                        <h4 class="template-name">${template.name}</h4>
                        <p class="template-description">${template.description}</p>
                        <div class="template-meta">${template.pipeline?.nodes?.length || 0} components</div>
                    </div>
                `;
                }).join('');

                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }

            openDialog('templates-dialog');
        } catch (error) {
            console.error('Templates error:', error);
            window.showToast('Failed to load templates', 'error');
        }
    }

    // Load template
    window.loadTemplate = async function (templateId) {
        try {
            const data = await window.api.templates.getAll();
            const template = data.templates.find(t => t.id === templateId);

            if (!template) {
                window.showToast('Template not found', 'error');
                return;
            }

            // Use the pipeline structure from the template
            const pipeline = template.pipeline || {};
            const templateNodes = pipeline.nodes || [];

            // Transform template nodes to match canvas node format
            state.nodes = templateNodes.map(node => {
                // Template nodes have data.type, we need to find matching component
                const componentType = node.type || node.data?.type;
                const componentName = node.name || node.data?.label;

                // Try to find component by name or type
                const allComponents = window.getAllComponents?.() || [];
                let component = allComponents.find(c => c.name === componentName);

                if (!component) {
                    // Fallback: create a basic component structure
                    component = {
                        id: node.id,
                        name: componentName || 'Unknown Component',
                        type: componentType || 'data',
                        icon: node.data?.icon || '📦',
                        parameters: []
                    };
                }

                const iconName = window.getComponentIconName
                    ? window.getComponentIconName(component.id)
                    : 'box';

                return {
                    id: node.id,
                    type: node.type,
                    position: node.position,
                    data: {
                        componentId: component.id,
                        label: node.data?.label || component.name,
                        icon: node.data?.icon || component.icon || '📦',
                        iconName: iconName,
                        parameters: node.data?.parameters || {},
                    }
                };
            });

            state.edges = pipeline.edges || [];
            state.currentModelId = null;
            state.currentModelName = pipeline.name || template.name || null;

            // Update node counter
            nodeIdCounter = Math.max(0, ...state.nodes.map(n =>
                parseInt(n.id.replace(/\D/g, '')) || 0
            ));

            // Record as batch operation
            recordHistory('LOAD_TEMPLATE', { templateId, templateName: template.name, nodeCount: state.nodes.length });

            render();
            fitView();
            closeDialog('templates-dialog');

            window.showToast(`Loaded template "${template.name}"`, 'success');
        } catch (error) {
            console.error('Template load error:', error);
            window.showToast('Failed to load template', 'error');
        }
    };

    // Validate pipeline
    async function validatePipeline() {
        const errors = [];
        const warnings = [];

        if (state.nodes.length === 0) {
            errors.push('Pipeline is empty. Add some components first.');
        }

        // Check for disconnected nodes
        const disconnectedNodes = [];
        state.nodes.forEach(node => {
            const hasInput = state.edges.some(e => e.target === node.id);
            const hasOutput = state.edges.some(e => e.source === node.id);

            if (!hasInput && !hasOutput && state.nodes.length > 1) {
                disconnectedNodes.push(node.data.label);
                warnings.push(`Node "${node.data.label}" is not connected.`);
            }
        });

        // Check component types
        const componentTypes = {};
        const categories = {};
        state.nodes.forEach(node => {
            const type = node.type || 'unknown';
            componentTypes[type] = (componentTypes[type] || 0) + 1;

            const component = window.getComponentById?.(node.data.componentId);
            if (component) {
                const category = component.category || 'Other';
                categories[category] = (categories[category] || 0) + 1;
            }
        });

        // Server-side validation
        try {
            const serverResult = await window.api.code.validate({
                nodes: state.nodes,
                edges: state.edges
            });

            if (serverResult.errors) errors.push(...serverResult.errors);
            if (serverResult.warnings) warnings.push(...serverResult.warnings);
        } catch (error) {
            console.error('Validation error:', error);
            warnings.push('Could not perform server-side validation');
        }

        // Calculate complexity score (simple heuristic)
        const complexityScore = Math.min(20, state.nodes.length + state.edges.length);

        // Build statistics HTML
        const statsContainer = document.getElementById('model-statistics');
        let statsHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${state.nodes.length}</div>
                    <div class="stat-label">Total Components</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${state.edges.length}</div>
                    <div class="stat-label">Connections</div>
                </div>
            </div>
            
            <div class="stats-section">
                <h5 class="stats-subtitle">Component Types</h5>
                <div class="badge-list">
                    ${Object.entries(componentTypes).map(([type, count]) =>
            `<span class="badge badge-secondary">${type}: ${count}</span>`
        ).join('')}
                </div>
            </div>
            
            <div class="stats-section">
                <h5 class="stats-subtitle">Categories</h5>
                <div class="badge-list">
                    ${Object.entries(categories).map(([cat, count]) =>
            `<span class="badge badge-primary">${cat}</span>`
        ).join(' ')}
                </div>
            </div>
            
            <div class="stats-section">
                <h5 class="stats-subtitle">Complexity Score</h5>
                <div class="complexity-bar">
                    <div class="complexity-fill" style="width: ${complexityScore * 5}%"></div>
                </div>
                <div class="complexity-value">${complexityScore}</div>
            </div>
        `;

        statsContainer.innerHTML = statsHTML;

        // Build validation results HTML
        const resultContainer = document.getElementById('validation-results');
        let resultHTML = '';

        if (errors.length === 0 && warnings.length === 0) {
            resultHTML = `
                <div class="validation-success">
                    <p class="text-muted">No issues found</p>
                    <div class="validation-check">
                        <i data-lucide="check-circle"></i>
                        <span>Your model looks good! No validation issues found.</span>
                    </div>
                </div>
            `;
        } else {
            if (errors.length > 0) {
                resultHTML += `
                    <div class="alert alert-error">
                        <i data-lucide="alert-circle"></i>
                        <div>
                            <strong>Errors:</strong>
                            <ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>
                        </div>
                    </div>
                `;
            }

            if (warnings.length > 0) {
                resultHTML += `
                    <div class="alert alert-warning">
                        <i data-lucide="alert-triangle"></i>
                        <div>
                            <strong>Warnings:</strong>
                            <ul>${warnings.map(w => `<li>${w}</li>`).join('')}</ul>
                        </div>
                    </div>
                `;
            }
        }

        resultContainer.innerHTML = resultHTML;
        lucide.createIcons();
        openDialog('validation-dialog');
    }

    // Export code
    async function exportCode() {
        if (state.nodes.length === 0) {
            window.showToast('Pipeline is empty', 'error');
            return;
        }

        try {
            const pipeline = {
                nodes: state.nodes,
                edges: state.edges,
            };

            const result = await window.api.code.generate(pipeline);
            const codeDisplay = document.getElementById('export-code-display');

            if (codeDisplay) {
                codeDisplay.textContent = result.code;
            }

            openDialog('export-dialog');
        } catch (error) {
            console.error('Export error:', error);
            window.showToast('Failed to generate code', 'error');
        }
    }

    // Copy code to clipboard
    function copyCode() {
        const codeDisplay = document.getElementById('export-code-display');
        if (!codeDisplay) return;

        navigator.clipboard.writeText(codeDisplay.textContent)
            .then(() => {
                window.showToast('Code copied to clipboard', 'success');
            })
            .catch(() => {
                window.showToast('Failed to copy code', 'error');
            });
    }



    // Import model from JSON
    function importModel() {
        const input = document.getElementById('import-json-input');
        if (!input || !input.value.trim()) {
            window.showToast('Please paste JSON data', 'error');
            return;
        }

        try {
            const modelData = JSON.parse(input.value);

            if (!modelData.nodes || !Array.isArray(modelData.nodes)) {
                throw new Error('Invalid model format: missing nodes array');
            }

            state.nodes = modelData.nodes;
            state.edges = modelData.edges || [];
            state.currentModelId = null;
            state.currentModelName = modelData.name || null;

            // Update node counter
            nodeIdCounter = Math.max(0, ...state.nodes.map(n =>
                parseInt(n.id.replace(/\D/g, '')) || 0
            ));

            render();
            fitView();
            closeDialog('import-dialog');
            input.value = '';

            window.showToast('Model imported successfully', 'success');
        } catch (error) {
            console.error('Import error:', error);
            window.showToast('Invalid JSON format: ' + error.message, 'error');
        }
    }

    // Dialog helpers
    function openDialog(id) {
        const dialog = document.getElementById(id);
        if (dialog) dialog.hidden = false;
    }

    function closeDialog(id) {
        const dialog = document.getElementById(id);
        if (dialog) dialog.hidden = true;
    }

    // Public API for version management
    window.getCurrentModelId = function () {
        return state.currentModelId;
    };

    window.getCanvasState = function () {
        return {
            nodes: state.nodes,
            edges: state.edges
        };
    };

    window.loadCanvasState = function (newState) {
        // Pause history while loading
        if (window.historyManager) {
            window.historyManager.pause();
        }

        state.nodes = newState.nodes || [];
        state.edges = newState.edges || [];

        // Update node counter
        nodeIdCounter = Math.max(0, ...state.nodes.map(n =>
            parseInt(n.id.replace(/\D/g, '')) || 0
        ));

        render();
        selectNode(null);

        // Resume history and record
        if (window.historyManager) {
            window.historyManager.resume();
            window.historyManager.recordState(
                { nodes: state.nodes, edges: state.edges },
                'LOAD_VERSION',
                { timestamp: Date.now() }
            );
        }
    };
    // Expose state for presentation mode
    window.getCanvasState = function () {
        return {
            nodes: state.nodes,
            edges: state.edges
        };
    };

})();

