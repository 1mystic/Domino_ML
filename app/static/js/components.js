// Components Library Management
(function() {
    let allComponents = [];
    let componentsByCategory = {};

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
                    ${filteredComponents.map(component => `
                        <div 
                            class="component-item" 
                            draggable="true"
                            data-component-id="${component.id}"
                        >
                            <div class="component-icon">${component.icon}</div>
                            <div class="component-info">
                                <div class="component-name">${component.name}</div>
                                <div class="component-description">${component.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            container.appendChild(categorySection);
        });

        // Setup drag handlers
        setupDragHandlers();
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
        const sidebar = document.getElementById('component-sidebar');
        
        if (!toggleBtn || !sidebar) return;

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-collapsed');
            const icon = toggleBtn.querySelector('[data-lucide]');
            const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
            icon.setAttribute('data-lucide', isCollapsed ? 'panel-left-open' : 'panel-left-close');
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
