// Components Library Management
(function() {
    let allComponents = [];
    let componentsByCategory = {};
    const COMPONENT_ICON_MAP = {
        'csv-loader': 'database',
        'sample-data': 'database',
        'standard-scaler': 'sliders',
        'train-test-split': 'split-square-horizontal',
        'min-max-scaler': 'sliders',
        'pca': 'layers',
        'random-forest-classifier': 'trees',
        'svm-classifier': 'activity',
        'logistic-regression': 'trending-up',
        'knn-classifier': 'users',
        'linear-regression': 'chart-line',
        'random-forest-regressor': 'tree-deciduous',
        'classification-metrics': 'bar-chart-3',
        'regression-metrics': 'line-chart',
        'kmeans-clustering': 'target',
        'one-hot-encoder': 'binary',
        'tfidf-vectorizer': 'file-text',
        'gradient-boosting-classifier': 'zap',
        'mlp-classifier': 'brain-circuit',
        'confusion-matrix': 'grid-3x3'
    };

    const TEMPLATE_ICON_MAP = {
        'iris-classification': 'flower-2',
        'regression-pipeline': 'chart-line',
        'clustering-pipeline': 'spline',
    };

    function getComponentIconName(componentId) {
        return COMPONENT_ICON_MAP[componentId] || 'box';
    }

    function getTemplateIconName(templateId) {
        return TEMPLATE_ICON_MAP[templateId] || 'layout-template';
    }

    window.getComponentIconName = getComponentIconName;
    window.getTemplateIconName = getTemplateIconName;

    // Initialize components library
    window.componentsInit = async function() {
        try {
            // Fetch components from API
            const data = await window.api.components.getAll();
            allComponents = data.components || [];
            
            // Group by category
            componentsByCategory = allComponents.reduce((acc, component) => {
                if (!acc[component.category]) {
                    acc[component.category] = [];
                }
                acc[component.category].push(component);
                return acc;
            }, {});

            // Render components
            renderComponents();
            
            // Setup search
            setupSearch();
            
            // Setup sidebar toggle
            setupSidebarToggle();

        } catch (error) {
            console.error('Failed to load components:', error);
            showError('Failed to load components');
        }
    };

    // Render component library
    function renderComponents(filter = '') {
        const container = document.getElementById('component-categories');
        container.innerHTML = '';

        const categories = Object.keys(componentsByCategory);
        
        if (categories.length === 0) {
            container.innerHTML = '<div class="empty-state-small">No components available</div>';
            return;
        }

        categories.forEach(category => {
            const components = componentsByCategory[category];
            const filteredComponents = filter 
                ? components.filter(c => 
                    c.name.toLowerCase().includes(filter.toLowerCase()) ||
                    c.description.toLowerCase().includes(filter.toLowerCase())
                  )
                : components;

            if (filteredComponents.length === 0) return;

            const categorySection = document.createElement('div');
            categorySection.className = 'component-category';
            
            categorySection.innerHTML = `
                <div class="category-header">
                    <span class="category-name">${category}</span>
                    <span class="category-count">${filteredComponents.length}</span>
                </div>
                <div class="category-components">
                    ${filteredComponents.map(component => {
                        const iconName = getComponentIconName(component.id);
                        return `
                        <div 
                            class="component-item" 
                            draggable="true"
                            data-component-id="${component.id}"
                        >
                            <div class="component-icon">
                                <i data-lucide="${iconName}"></i>
                            </div>
                            <div class="component-info">
                                <div class="component-name">${component.name}</div>
                                <div class="component-description">${component.description}</div>
                            </div>
                        </div>
                    `;
                    }).join('')}
                </div>
            `;

            container.appendChild(categorySection);
        });

        // Setup drag handlers
        setupDragHandlers();

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Setup drag handlers for components
    function setupDragHandlers() {
        document.querySelectorAll('.component-item').forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        });
    }

    function handleDragStart(e) {
        const componentId = e.target.closest('.component-item').dataset.componentId;
        const component = allComponents.find(c => c.id === componentId);
        
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify(component));
        
        e.target.classList.add('dragging');
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    // Setup search functionality
    function setupSearch() {
        const searchInput = document.getElementById('component-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            renderComponents(e.target.value);
        });
    }

    // Setup sidebar toggle
    function setupSidebarToggle() {
        const toggleBtn = document.getElementById('toggle-sidebar-btn');
        const expandBtn = document.getElementById('expand-sidebar-btn');
        const sidebar = document.getElementById('component-sidebar');
        
        if (!toggleBtn || !sidebar || !expandBtn) return;

        // Collapse sidebar
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.add('sidebar-collapsed');
            expandBtn.hidden = false;
            lucide.createIcons();
        });

        // Expand sidebar
        expandBtn.addEventListener('click', () => {
            sidebar.classList.remove('sidebar-collapsed');
            expandBtn.hidden = true;
            lucide.createIcons();
        });
    }

    // Show error message
    function showError(message) {
        const container = document.getElementById('component-categories');
        container.innerHTML = `
            <div class="alert alert-error">
                <i data-lucide="alert-circle"></i>
                <span>${message}</span>
            </div>
        `;
        lucide.createIcons();
    }

    // Get component by ID
    window.getComponentById = function(id) {
        return allComponents.find(c => c.id === id);
    };

    // Get all components
    window.getAllComponents = function() {
        return allComponents;
    };
})();
