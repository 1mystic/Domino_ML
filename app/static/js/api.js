// API Service - Handles all backend communication
(function () {
    const API_BASE = '/api';

    // Helper function for API calls
    async function apiCall(endpoint, options = {}) {
        const defaultOptions = {
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers,
                },
            });

            // Check if response is HTML (redirect to login)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                if (response.status === 401 || response.url.includes('/login')) {
                    throw new Error('Authentication required. Please sign in.');
                }
                throw new Error('Server returned HTML instead of JSON');
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    error: `Request failed with status ${response.status}`
                }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            return response.json();
        } catch (error) {
            // Re-throw with better error message
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        }
    }

    // Models API
    const modelsAPI = {
        getAll: () => apiCall('/models'),

        get: (id) => apiCall(`/models/${id}`),

        create: (data) => apiCall('/models', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

        update: (id, data) => apiCall(`/models/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

        delete: (id) => apiCall(`/models/${id}`, {
            method: 'DELETE',
        }),
    };

    // Templates API
    const templatesAPI = {
        getAll: () => apiCall('/templates'),
    };

    // Components API
    const componentsAPI = {
        getAll: () => apiCall('/components'),
    };

    // Code Generation API
    const codeAPI = {
        generate: (pipeline) => apiCall('/generate-code', {
            method: 'POST',
            body: JSON.stringify(pipeline),
        }),
        validate: (pipeline) => apiCall('/validate', {
            method: 'POST',
            body: JSON.stringify(pipeline),
        }),
    };

    // Versions API
    const versionsAPI = {
        create: (modelId, data) => apiCall(`/models/${modelId}/versions`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

        list: (modelId) => apiCall(`/models/${modelId}/versions`),

        get: (versionId) => apiCall(`/versions/${versionId}`),

        activate: (versionId) => apiCall(`/versions/${versionId}/activate`, {
            method: 'POST',
        }),

        delete: (versionId) => apiCall(`/versions/${versionId}`, {
            method: 'DELETE',
        }),

        compare: (version1Id, version2Id) => apiCall('/versions/compare', {
            method: 'POST',
            body: JSON.stringify({ version1_id: version1Id, version2_id: version2Id }),
        }),

        addMetrics: (versionId, metrics) => apiCall(`/versions/${versionId}/metrics`, {
            method: 'POST',
            body: JSON.stringify({ metrics }),
        }),

        getMetrics: (versionId) => apiCall(`/versions/${versionId}/metrics`),
    };

    // Export API to global scope
    window.api = {
        models: modelsAPI,
        templates: templatesAPI,
        components: componentsAPI,
        code: codeAPI,
        versions: versionsAPI,
    };

    // Toast notifications
    window.showToast = function (message, type = 'info') {
        const iconMap = {
            success: 'check-circle',
            error: 'alert-circle',
            info: 'info',
            warning: 'alert-triangle'
        };
        const iconName = iconMap[type] || iconMap.info;
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <span>${message}</span>
        `;

        // Add to body
        document.body.appendChild(toast);

        // Initialize icon
        if (window.lucide) {
            lucide.createIcons();
        }

        // Show toast
        setTimeout(() => toast.classList.add('toast-show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    if (Array.isArray(window.__flashMessages) && window.__flashMessages.length) {
        window.__flashMessages.forEach((flash) => {
            const type = flash.type === 'error' ? 'error'
                : flash.type === 'success' ? 'success'
                    : flash.type === 'warning' ? 'warning'
                        : 'info';
            window.showToast(flash.message, type);
        });
        window.__flashMessages = [];
    }

    // Export API (Phase 3)
    const exportAPI = {
        exportPython: (modelId) => apiCall(`/models/${modelId}/export/python`, { method: 'POST' }),
        exportNotebook: (modelId) => apiCall(`/models/${modelId}/export/notebook`, { method: 'POST' }),
        exportDocker: (modelId, pythonVersion = '3.10') => apiCall(`/models/${modelId}/export/docker`, {
            method: 'POST',
            body: JSON.stringify({ python_version: pythonVersion })
        }),
        exportRequirements: (modelId) => apiCall(`/models/${modelId}/export/requirements`, { method: 'POST' })
    };

    // Export all APIs
    window.api.export = exportAPI;
    window.api.showToast = window.showToast;
})();
