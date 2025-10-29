// API Service - Handles all backend communication
(function() {
    const API_BASE = '/api';

    // Helper function for API calls
    async function apiCall(endpoint, options = {}) {
        const defaultOptions = {
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
    };

    // Export API to global scope
    window.api = {
        models: modelsAPI,
        templates: templatesAPI,
        components: componentsAPI,
        code: codeAPI,
    };

    // Toast notifications
    window.showToast = function(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle'}"></i>
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
})();
