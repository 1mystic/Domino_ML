// Property Panel Management
(function() {
    let currentNode = null;

    // Show property panel for a node
    window.showProperties = function(node) {
        currentNode = node;
        const panel = document.getElementById('property-panel');
        const form = document.getElementById('property-form');
        const deleteBtn = document.getElementById('delete-node-btn');
        
        if (!panel || !form) return;

        // Show panel
        panel.hidden = false;

        // Get component definition
        const component = window.getComponentById(node.data.componentId);
        if (!component) {
            form.innerHTML = '<div class="alert alert-error">Component not found</div>';
            return;
        }

        // Build form
        let formHTML = `
            <div class="property-section">
                <h4 class="property-section-title">Node Information</h4>
                <div class="property-item">
                    <label class="property-label">Type</label>
                    <div class="property-value">${component.name}</div>
                </div>
                <div class="property-item">
                    <label class="property-label">ID</label>
                    <div class="property-value">${node.id}</div>
                </div>
            </div>
        `;

        // Add parameters if component has them
        if (component.parameters && component.parameters.length > 0) {
            formHTML += `
                <div class="property-section">
                    <h4 class="property-section-title">Parameters</h4>
            `;

            component.parameters.forEach(param => {
                const currentValue = node.data.parameters?.[param.name] ?? param.defaultValue ?? param.default ?? '';
                formHTML += renderParameter(param, currentValue);
            });

            formHTML += '</div>';
        }

        // Add inputs/outputs info
        if (component.inputs || component.outputs) {
            formHTML += `
                <div class="property-section">
                    <h4 class="property-section-title">Connections</h4>
            `;

            if (component.inputs && component.inputs.length > 0) {
                formHTML += `
                    <div class="property-item">
                        <label class="property-label">Inputs</label>
                        <div class="property-value">${component.inputs.join(', ')}</div>
                    </div>
                `;
            }

            if (component.outputs && component.outputs.length > 0) {
                formHTML += `
                    <div class="property-item">
                        <label class="property-label">Outputs</label>
                        <div class="property-value">${component.outputs.join(', ')}</div>
                    </div>
                `;
            }

            formHTML += '</div>';
        }

        form.innerHTML = formHTML;

        // Show delete button
        if (deleteBtn) {
            deleteBtn.hidden = false;
        }

        // Setup form change handlers
        setupFormHandlers();

        // Reinitialize icons
        lucide.createIcons();
    };

    // Render a parameter input
    function renderParameter(param, currentValue) {
        let inputHTML = '';

        switch (param.type) {
            case 'number':
            case 'float':
            case 'integer':
                inputHTML = `
                    <input 
                        type="number" 
                        class="form-input form-input-sm" 
                        name="${param.name}"
                        value="${currentValue}"
                        ${param.min !== undefined ? `min="${param.min}"` : ''}
                        ${param.max !== undefined ? `max="${param.max}"` : ''}
                        ${param.step !== undefined ? `step="${param.step}"` : 'step="any"'}
                    >
                `;
                break;

            case 'select':
                inputHTML = `
                    <select class="form-input form-input-sm" name="${param.name}">
                        ${param.options.map(opt => `
                            <option value="${opt}" ${opt === currentValue ? 'selected' : ''}>
                                ${opt}
                            </option>
                        `).join('')}
                    </select>
                `;
                break;

            case 'boolean':
                inputHTML = `
                    <label class="checkbox-label">
                        <input 
                            type="checkbox" 
                            class="checkbox" 
                            name="${param.name}"
                            ${currentValue ? 'checked' : ''}
                        >
                        <span>${param.label}</span>
                    </label>
                `;
                break;

            case 'string':
            case 'text':
            default:
                inputHTML = `
                    <input 
                        type="text" 
                        class="form-input form-input-sm" 
                        name="${param.name}"
                        value="${currentValue}"
                        placeholder="${param.defaultValue ?? param.default ?? ''}"
                    >
                `;
                break;
        }

        return `
            <div class="property-item">
                ${param.type !== 'boolean' ? `<label class="property-label">${param.label}</label>` : ''}
                ${inputHTML}
            </div>
        `;
    }

    // Setup form change handlers
    function setupFormHandlers() {
        const form = document.getElementById('property-form');
        if (!form || !currentNode) return;

        // Listen for changes on all inputs
        form.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', handleParameterChange);
        });
    }

    // Handle parameter value change
    function handleParameterChange(e) {
        if (!currentNode) return;

        const name = e.target.name;
        let value;

        if (e.target.type === 'checkbox') {
            value = e.target.checked;
        } else if (e.target.type === 'number') {
            value = parseFloat(e.target.value);
        } else {
            value = e.target.value;
        }

        // Update node data
        if (!currentNode.data.parameters) {
            currentNode.data.parameters = {};
        }
        currentNode.data.parameters[name] = value;

        // Trigger canvas update
        if (window.updateNode) {
            window.updateNode(currentNode);
        }
    }

    // Hide property panel
    window.hideProperties = function() {
        currentNode = null;
        const panel = document.getElementById('property-panel');
        const deleteBtn = document.getElementById('delete-node-btn');
        
        if (panel) panel.hidden = true;
        if (deleteBtn) deleteBtn.hidden = true;
    };

    // Get current node
    window.getCurrentNode = function() {
        return currentNode;
    };

    // Setup close button
    document.addEventListener('DOMContentLoaded', () => {
        const closeBtn = document.getElementById('close-properties-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', window.hideProperties);
        }

        const deleteBtn = document.getElementById('delete-node-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (currentNode && window.deleteNode) {
                    window.deleteNode(currentNode.id);
                    window.hideProperties();
                }
            });
        }
    });
})();
