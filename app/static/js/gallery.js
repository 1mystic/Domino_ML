// Gallery Page Logic
document.addEventListener('DOMContentLoaded', () => {
    let allItems = [];
    let currentTab = 'all';
    let activeCategory = 'all';
    let searchTerm = '';
    let userModels = [];

    // DOM Elements
    const grid = document.getElementById('gallery-grid');
    const searchInput = document.getElementById('gallery-search');
    const filterContainer = document.getElementById('category-filters');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const modal = document.getElementById('preview-modal');
    const previewContent = document.getElementById('preview-content');
    const confirmAddBtn = document.getElementById('confirm-add-btn');

    // Modal Inputs
    const radioInputs = document.querySelectorAll('input[name="add-action"]');
    const newModelContainer = document.getElementById('action-new-container');
    const existingModelContainer = document.getElementById('action-existing-container');
    const newModelNameInput = document.getElementById('new-model-name');
    const existingModelSelect = document.getElementById('existing-model-select');

    // Icon Mapping
    const iconMap = {
        'Data Sources': 'database',
        'Preprocessing': 'filter',
        'Classification': 'git-branch',
        'Regression': 'trending-up',
        'Evaluation': 'bar-chart-2',
        'Clustering': 'disc',
        'Dimensionality Reduction': 'minimize-2',
        'Neural Networks': 'brain-circuit',
        // Fallbacks based on names
        'csv': 'file-spreadsheet',
        'text': 'file-text',
        'image': 'image',
        'scale': 'scaling',
        'split': 'scissors',
        'tree': 'git-graph',
        'forest': 'trees',
        'boost': 'zap',
        'bayes': 'bell',
        'matrix': 'grid',
    };

    function getIcon(item) {
        const lowerName = item.name.toLowerCase();

        // Priority 1: Specific Name Match
        if (lowerName.includes('csv')) return iconMap['csv'];
        if (lowerName.includes('text')) return iconMap['text'];
        if (lowerName.includes('image')) return iconMap['image'];
        if (lowerName.includes('tree')) return iconMap['tree'];
        if (lowerName.includes('forest')) return iconMap['forest'];
        if (lowerName.includes('boost')) return iconMap['boost'];
        if (lowerName.includes('neural') || lowerName.includes('mlp')) return iconMap['Neural Networks'];
        if (lowerName.includes('confusion')) return iconMap['matrix'];

        // Priority 2: Category Match
        if (iconMap[item.category]) return iconMap[item.category];

        // Fallback
        return 'box';
    }

    // Initialize
    initGallery();

    async function initGallery() {
        try {
            const promises = [
                fetch('/api/components'),
                fetch('/api/templates')
            ];

            if (window.isAuthenticated) {
                promises.push(fetch('/api/models'));
            }

            const results = await Promise.all(promises);
            const compData = await results[0].json();
            const tempData = await results[1].json();

            if (window.isAuthenticated) {
                userModels = await results[2].json();
                populateModelSelect();
            }

            const components = (compData.components || []).map(c => ({
                ...c,
                itemType: 'component',
                displayType: 'Component'
            }));

            const templates = (tempData.templates || []).map(t => ({
                ...t,
                itemType: 'template',
                displayType: 'Template'
            }));

            allItems = [...components, ...templates];

            const categories = new Set(allItems.map(i => i.category));
            renderFilters(['All', ...Array.from(categories).sort()]);
            renderGrid();

        } catch (error) {
            console.error('Failed to load gallery:', error);
            grid.innerHTML = `<div class="alert alert-error">Failed to load gallery data. <br><small>${error.message}</small></div>`;
        }
    }

    function populateModelSelect() {
        existingModelSelect.innerHTML = '<option value="" disabled selected>Select a model...</option>';
        if (userModels && userModels.length) {
            userModels.forEach(m => {
                const option = document.createElement('option');
                option.value = m.id;
                option.textContent = m.name;
                existingModelSelect.appendChild(option);
            });
        }
    }

    function renderFilters(categories) {
        filterContainer.innerHTML = categories.map(cat => `
            <button class="filter-chip ${cat === 'All' ? 'active' : ''}" 
                    data-category="${cat}">
                ${cat}
            </button>
        `).join('');

        filterContainer.querySelectorAll('.filter-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                filterContainer.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.dataset.category;
                renderGrid();
            });
        });
    }

    function renderGrid() {
        grid.innerHTML = '';

        const filtered = allItems.filter(item => {
            if (currentTab === 'components' && item.itemType !== 'component') return false;
            if (currentTab === 'templates' && item.itemType !== 'template') return false;
            if (activeCategory !== 'All' && activeCategory !== 'all' && item.category !== activeCategory) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return item.name.toLowerCase().includes(term) ||
                    (item.description && item.description.toLowerCase().includes(term));
            }
            return true;
        });

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="empty-state-small" style="grid-column: 1/-1;">No items found.</div>';
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-card';
            card.dataset.category = item.category;

            const iconName = getIcon(item);

            let tagsHtml = '';
            if (item.parameters && item.parameters.length > 0) tagsHtml += `<span class="card-tag">${item.parameters.length} Params</span>`;
            if (item.pipeline && item.pipeline.nodes) tagsHtml += `<span class="card-tag">${item.pipeline.nodes.length} Nodes</span>`;

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-icon">
                        <i data-lucide="${iconName}"></i>
                    </div>
                    <div>
                        <div class="card-title">${item.name}</div>
                        <div class="card-type">${item.displayType} • ${item.category}</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-description">${item.description || 'No description available'}</div>
                    <div class="card-tags">${tagsHtml}</div>
                </div>
            `;
            card.addEventListener('click', () => openPreview(item));
            grid.appendChild(card);
        });

        if (window.lucide) lucide.createIcons();
    }

    // Modal Logic
    let currentPreviewItem = null;

    function openPreview(item) {
        currentPreviewItem = item;
        modal.hidden = false;

        // Default to "New Model"
        radioInputs[0].checked = true;
        toggleActionInputs('new');
        newModelNameInput.value = item.itemType === 'template' ? item.name : `Pipeline with ${item.name}`;

        let detailsHtml = '';
        if (item.itemType === 'component') {
            const params = (item.parameters || []).map(p => `<code>${p.name}</code>`).join(', ') || 'None';
            detailsHtml = `<p><strong>Inputs:</strong> ${item.inputs?.join(', ') || '-'}</p>
                           <p><strong>Outputs:</strong> ${item.outputs?.join(', ') || '-'}</p>
                           <p class="mt-2 text-sm text-muted">Parameters: ${params}</p>`;
        } else {
            detailsHtml = `<p class="text-sm">Template contains <strong>${item.pipeline?.nodes?.length || 0} nodes</strong>.</p>`;
        }

        previewContent.innerHTML = `
            <h2>${item.name}</h2>
            <p class="subtitle">${item.category}</p>
            <p class="mb-4">${item.description}</p>
            <div style="background:hsl(var(--card)); padding:1rem; border-radius:var(--radius);">
                ${detailsHtml}
            </div>
        `;
    }

    window.closePreviewModal = function () {
        modal.hidden = true;
        currentPreviewItem = null;
    };

    function toggleActionInputs(val) {
        if (val === 'new') {
            newModelContainer.hidden = false;
            existingModelContainer.hidden = true;
            confirmAddBtn.querySelector('span').textContent = 'Create & Add';
        } else {
            newModelContainer.hidden = true;
            existingModelContainer.hidden = false;
            confirmAddBtn.querySelector('span').textContent = 'Add to Model';
        }
    }

    radioInputs.forEach(input => {
        input.addEventListener('change', (e) => toggleActionInputs(e.target.value));
    });

    async function safeFetch(url, options = {}) {
        const res = await fetch(url, options);
        if (res.redirected && res.url.includes('/auth/login')) {
            window.location.href = '/auth/login?next=' + encodeURIComponent(window.location.pathname);
            throw new Error('Redirecting to login...');
        }

        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Request failed');
            }
            return res.json(); // It's JSON and OK
        } else {
            // Not JSON. Could be text or HTML error page.
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Request failed (${res.status}): ${text.slice(0, 100)}...`);
            }
            // If OK but not JSON (e.g. PUT might return empty body 204)
            return null;
        }
    }

    confirmAddBtn.addEventListener('click', async () => {
        if (!window.isAuthenticated) {
            window.location.href = '/auth/login?next=/gallery';
            return;
        }

        if (!currentPreviewItem) return;

        const action = document.querySelector('input[name="add-action"]:checked').value;
        const btnSpan = confirmAddBtn.querySelector('span');
        const originalText = btnSpan.textContent;
        btnSpan.textContent = 'Processing...';

        try {
            if (action === 'new') {
                const name = newModelNameInput.value.trim() || 'New Pipeline';
                let nodes = [], edges = [];

                if (currentPreviewItem.itemType === 'template') {
                    nodes = currentPreviewItem.pipeline.nodes;
                    edges = currentPreviewItem.pipeline.edges;
                } else {
                    nodes = [{
                        id: 'node-1',
                        data: {
                            label: currentPreviewItem.name,
                            componentId: currentPreviewItem.id,
                            parameters: {}
                        },
                        position: { x: 100, y: 100 },
                        type: currentPreviewItem.type
                    }];
                }

                const data = await safeFetch('/api/models', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, nodes, edges })
                });

                window.location.href = `/builder?modelId=${data.id}`;

            } else {
                const modelId = existingModelSelect.value;
                if (!modelId) return alert('Please select a model');

                // Get current model
                const modelData = await safeFetch(`/api/models/${modelId}`);

                let nodes = modelData.nodes || [];
                let edges = modelData.edges || [];

                if (currentPreviewItem.itemType === 'template') {
                    if (!confirm('Adding a template will overwrite the existing pipeline. Continue?')) {
                        btnSpan.textContent = originalText;
                        return;
                    }
                    nodes = currentPreviewItem.pipeline.nodes;
                    edges = currentPreviewItem.pipeline.edges;
                } else {
                    let idNum = nodes.length + 1;
                    while (nodes.find(n => n.id === `node-${idNum}`)) idNum++;

                    nodes.push({
                        id: `node-${idNum}`,
                        data: {
                            label: currentPreviewItem.name,
                            componentId: currentPreviewItem.id,
                            parameters: {}
                        },
                        position: { x: 100 + (nodes.length * 20), y: 100 + (nodes.length * 20) },
                        type: currentPreviewItem.type
                    });
                }

                await safeFetch(`/api/models/${modelId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nodes, edges })
                });

                window.location.href = `/builder?modelId=${modelId}`;
            }

        } catch (e) {
            console.error(e);
            alert('Error: ' + e.message);
            btnSpan.textContent = originalText;
        }
    });


    // Event Listeners
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            renderGrid();
        });
    });

    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim();
        renderGrid();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePreviewModal();
    });
});
